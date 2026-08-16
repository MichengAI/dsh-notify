import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import {
  createDefaultConfig,
  DEFAULT_WEB_PORT,
  normalizeConfig,
  SETTINGS_NAMESPACE,
  STATE_DIR_NAME,
  type NotifyConfig,
} from './config.ts'
import { createNotifyEngine } from './notify/engine.ts'
import { shouldNotifyAsk, shouldNotifyComplete } from './policy.ts'
import { wrapUserQuestions } from './questions.ts'
import { registerNotifyRoutes, type SettingsScopeLike } from './routes.ts'
import {
  agentKey,
  isSubAgent,
  readAssistantSnippet,
  readSessionTitle,
  seedAgentStatuses,
  type AgentLike,
  type SessionLike,
} from './session.ts'

export const name = '@michengai/dsh-notify'
export const inject = ['userQuestions']
export const Config = Schema.object({})

const COMPLETE_SETTLE_MS = 400
const COMPLETE_DEDUPE_MS = 4000

function resolveDshHome(): string {
  return process.env.DSH_HOME && process.env.DSH_HOME.trim() !== ''
    ? process.env.DSH_HOME
    : path.join(homedir(), '.dsh')
}

async function tryImport<T>(specifier: string): Promise<T | undefined> {
  try {
    return await import(specifier) as T
  } catch {
    return undefined
  }
}

function pickObject(args: unknown[], keys: string[]): Record<string, unknown> {
  for (const arg of args) {
    if (arg === null || typeof arg !== 'object' || Array.isArray(arg)) continue
    const record = arg as Record<string, unknown>
    if (keys.some(key => key in record)) return record
  }
  return {}
}

export function apply(ctx: Context): void {
  const stateDir = path.join(resolveDshHome(), STATE_DIR_NAME)
  mkdirSync(stateDir, { recursive: true })

  let settingsScope: SettingsScopeLike | null = null
  let memoryConfig = createDefaultConfig()
  const getConfig = (): NotifyConfig => {
    if (settingsScope !== null) return normalizeConfig(settingsScope.get())
    return memoryConfig
  }

  const engine = createNotifyEngine({
    stateDir,
    portProvider: () => {
      try {
        const webServer = ctx.get('webServer') as { port?: number } | undefined
        return webServer?.port ?? DEFAULT_WEB_PORT
      } catch {
        return DEFAULT_WEB_PORT
      }
    },
    configProvider: getConfig,
    logger: ctx.logger,
  })

  ctx.inject(['settings'], sctx => {
    void setupSettings(sctx).then(scope => {
      settingsScope = scope
      if (scope !== null) memoryConfig = normalizeConfig(scope.get())
    }).catch(error => {
      ctx.logger.warn(`通知设置注册失败：${String((error as Error).message ?? error)}`)
    })
  })

  const lastStatus = seedAgentStatuses(ctx)
  const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>()
  const lastNotifiedAt = new Map<string, number>()

  const cancelPending = (id: string): void => {
    const timer = pendingTimers.get(id)
    if (timer === undefined) return
    clearTimeout(timer)
    pendingTimers.delete(id)
  }

  const resolveLiveAgent = (input: AgentLike | undefined): AgentLike | undefined => {
    const id = agentKey(input)
    if (id === '') return input
    try {
      const agents = ctx.get('agents') as { get?: (id: string) => AgentLike | undefined } | undefined
      return agents?.get?.(id) ?? input
    } catch {
      return input
    }
  }

  const emitComplete = (rawAgent: AgentLike | undefined, reason: string): void => {
    const agent = resolveLiveAgent(rawAgent)
    const id = agentKey(agent) || agentKey(rawAgent)
    if (id === '') {
      engine.log(`complete skip empty-id reason=${reason}`)
      return
    }
    cancelPending(id)
    pendingTimers.set(id, setTimeout(() => {
      pendingTimers.delete(id)
      try {
        const live = resolveLiveAgent(agent ?? rawAgent)
        if (live?.status === 'running') {
          engine.log(`complete skip still-running id=${id} reason=${reason}`)
          return
        }
        if (isSubAgent(ctx, live ?? agent)) {
          engine.log(`complete skip subagent id=${id} reason=${reason}`)
          return
        }
        if (!shouldNotifyComplete(getConfig(), engine.isFocused())) {
          engine.log(`complete skip policy id=${id} focused=${engine.isFocused()} reason=${reason}`)
          return
        }
        const now = Date.now()
        if (now - (lastNotifiedAt.get(id) ?? 0) < COMPLETE_DEDUPE_MS) {
          engine.log(`complete skip dedupe id=${id} reason=${reason}`)
          return
        }
        lastNotifiedAt.set(id, now)
        const session = (live ?? agent)?.session
        const title = readSessionTitle(session)
        const snippet = readAssistantSnippet(session, 100)
        engine.markCompleted(id, title ?? '')
        engine.notifyComplete(
          title ?? '',
          title !== undefined ? `会话：${title}` : '回合结束，可以回来查看结果了',
          snippet,
        )
        engine.log(`complete notify id=${id} reason=${reason} title=${title ?? ''}`)
      } catch (error) {
        const message = String((error as Error).message ?? error)
        engine.log(`complete error id=${id} reason=${reason} ${message}`)
        ctx.logger.warn(`完成提醒失败：${message}`)
      }
    }, COMPLETE_SETTLE_MS))
  }

  ctx.on('agent/status', (...args: unknown[]) => {
    try {
      const payload = pickObject(args, ['status', 'agent']) as { agent?: AgentLike; status?: string }
      const status = payload.status
      if (status !== 'idle' && status !== 'running') return
      const agent = payload.agent
      const key = agentKey(agent) || 'unknown'
      const previous = lastStatus.get(key) ?? 'idle'
      lastStatus.set(key, status)
      engine.log(`agent/status id=${key} ${previous}->${status}`)
      if (status === 'running') {
        cancelPending(key)
        return
      }
      emitComplete(agent, `status:${previous}->idle`)
    } catch (error) {
      ctx.logger.warn(`完成提醒失败：${String((error as Error).message ?? error)}`)
    }
  }, { global: true })

  ctx.on('agent/turn-stopping', (...args: unknown[]) => {
    try {
      const payload = pickObject(args, ['agent', 'turn']) as { agent?: AgentLike; turn?: unknown }
      engine.log(`agent/turn-stopping id=${agentKey(payload.agent)} turn=${String(payload.turn ?? '')}`)
      emitComplete(payload.agent, 'turn-stopping')
    } catch (error) {
      ctx.logger.warn(`完成提醒失败：${String((error as Error).message ?? error)}`)
    }
  }, { global: true })

  ctx.on('session/event', (...args: unknown[]) => {
    try {
      const session = args.find(item => {
        if (item === null || typeof item !== 'object' || Array.isArray(item)) return false
        const record = item as Record<string, unknown>
        return 'id' in record && ('events' in record || 'title' in record)
      }) as SessionLike | undefined
      const event = args.find(item => {
        if (item === null || typeof item !== 'object' || Array.isArray(item)) return false
        return 'type' in (item as Record<string, unknown>)
      }) as { type?: unknown; data?: { reason?: { kind?: unknown }; turn?: unknown } } | undefined
      if (event?.type !== 'turn/end') return
      const kind = typeof event.data?.reason?.kind === 'string' ? event.data.reason.kind : 'unknown'
      const sessionId = agentKey({ id: session?.id })
      engine.log(`session/event turn/end id=${sessionId} kind=${kind}`)
      if (kind === 'aborted') return
      const target: AgentLike = sessionId === '' ? {} : { id: sessionId }
      if (session !== undefined) target.session = session
      emitComplete(target, `turn-end:${kind}`)
    } catch (error) {
      ctx.logger.warn(`完成提醒失败：${String((error as Error).message ?? error)}`)
    }
  }, { global: true })

  const restoreAsk = wrapUserQuestions(ctx, engine, getConfig)
  if (restoreAsk !== null) ctx.effect(() => restoreAsk, 'dsh-notify: 还原 userQuestions')

  ctx.on('approval/request', async (req: { toolName?: unknown; reason?: unknown }, next: () => Promise<unknown>) => {
    const allowed = shouldNotifyAsk(getConfig(), 'permission')
    if (allowed) {
      try {
        engine.updatePending(1)
        engine.showToast({
          title: 'DSH 需要权限',
          message: typeof req.toolName === 'string' ? req.toolName : '需要你批准后才能继续',
          detail: typeof req.reason === 'string' ? req.reason : '',
        })
      } catch (error) {
        ctx.logger.warn(`权限提醒失败：${String((error as Error).message ?? error)}`)
      }
    }
    try {
      return await next()
    } finally {
      if (allowed) engine.updatePending(-1)
    }
  })

  ctx.inject(['webServer'], wctx => {
    const webServer = wctx.get('webServer') as Parameters<typeof registerNotifyRoutes>[0]['webServer'] | undefined
    if (webServer === undefined) return
    const disposers = registerNotifyRoutes({
      webServer,
      getConfig,
      getSettingsScope: () => settingsScope,
      engine,
    })
    wctx.effect(() => () => {
      for (const dispose of disposers) dispose()
    }, 'dsh-notify: HTTP 路由')
  })

  ctx.logger.info('dsh-notify 已挂载')
}

async function setupSettings(ctx: Context): Promise<SettingsScopeLike | null> {
  const settingsMod = await tryImport<{ settingsNamespace?: (name: string) => symbol }>('@deepseek-ai/dsh-settings')
  const settings = ctx.get('settings') as {
    register?: (ns: symbol, schema: unknown) => unknown
    extend?: (name: string, schema: unknown) => unknown
    get?: (ns: unknown) => unknown
    replace?: (ns: unknown, next: NotifyConfig) => Promise<void>
  } | undefined
  if (settings === undefined) return null

  const schema = Schema.object({
    quietHours: Schema.object({
      enabled: Schema.boolean().default(false),
      start: Schema.string().default('22:00'),
      end: Schema.string().default('08:00'),
    }).default({ enabled: false, start: '22:00', end: '08:00' }),
    respectSystemDnd: Schema.boolean().default(true),
    completeMerge: Schema.boolean().default(true),
    channels: Schema.object({
      complete: Schema.union([Schema.const('always'), Schema.const('unfocused'), Schema.const('off')]).default('always'),
      permission: Schema.boolean().default(true),
      question: Schema.boolean().default(true),
    }).default({ complete: 'always', permission: true, question: true }),
  })

  if (typeof settings.register === 'function' && typeof settingsMod?.settingsNamespace === 'function') {
    const ns = settingsMod.settingsNamespace(SETTINGS_NAMESPACE)
    settings.register(ns, schema)
    return {
      get: () => settings.get?.(ns),
      replace: next => settings.replace?.(ns, next) ?? Promise.resolve(),
    }
  }

  if (typeof settings.extend === 'function') {
    const scope = settings.extend(SETTINGS_NAMESPACE, schema) as {
      get?: () => unknown
      replace?: (next: NotifyConfig) => Promise<void>
    }
    return {
      get: () => scope.get?.(),
      replace: next => scope.replace?.(next) ?? Promise.resolve(),
    }
  }

  return null
}
