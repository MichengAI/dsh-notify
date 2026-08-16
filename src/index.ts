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
import { wrapUserQuestions } from './questions.ts'
import { registerNotifyRoutes, type SettingsScopeLike } from './routes.ts'
import { isGoalAutoContinuing, isRootAgent, readAssistantSnippet, readSessionTitle } from './session.ts'

export const name = '@michengai/dsh-notify'
export const inject = ['userQuestions']
export const Config = Schema.object({})

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

  const lastStatus = new Map<unknown, string>()
  ctx.on('agent/status', ({ agent, status }: { agent: { id?: unknown; session?: unknown }; status: string }) => {
    try {
      const previous = lastStatus.get(agent) ?? 'idle'
      lastStatus.set(agent, status)
      if (status !== 'idle' || previous === 'idle') return
      if (!isRootAgent(ctx, agent)) return
      if (isGoalAutoContinuing(ctx, agent)) return
      const session = agent.session as { title?: unknown; events?: unknown } | undefined
      const title = readSessionTitle(session)
      const snippet = readAssistantSnippet(session, 100)
      engine.markCompleted(String(agent.id ?? ''), title ?? '')
      engine.notifyComplete(
        title ?? '',
        title !== undefined ? `会话：${title}` : '回合结束，可以回来查看结果了',
        snippet,
      )
    } catch (error) {
      ctx.logger.warn(`完成提醒失败：${String((error as Error).message ?? error)}`)
    }
  })

  const restoreAsk = wrapUserQuestions(ctx, engine)
  if (restoreAsk !== null) ctx.effect(() => restoreAsk, 'dsh-notify: 还原 userQuestions')

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
    enabled: Schema.boolean().default(true),
    sound: Schema.string().default('soft'),
    soundEnabled: Schema.boolean().default(true),
    quietHours: Schema.object({
      enabled: Schema.boolean().default(false),
      start: Schema.string().default('22:00'),
      end: Schema.string().default('08:00'),
    }).default({ enabled: false, start: '22:00', end: '08:00' }),
    respectSystemDnd: Schema.boolean().default(true),
    completeMode: Schema.union([Schema.const('toast'), Schema.const('badge-only')]).default('toast'),
    completeMerge: Schema.boolean().default(true),
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
