import type { IncomingMessage, ServerResponse } from 'node:http'
import { API_PREFIX, mergeConfig, normalizeConfig, type NotifyConfig, type SoundId } from './config.ts'
import { listSoundPresets, SOUND_PRESETS } from './notify/sounds.ts'
import type { NotifyEngine } from './notify/engine.ts'

interface WebServerLike {
  register(route: {
    kind: 'exact'
    path: string
    handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>
  }): () => void
}

export interface SettingsScopeLike {
  get(): unknown
  replace(next: NotifyConfig): Promise<void>
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  return raw === '' ? {} : JSON.parse(raw)
}

function sendJson(res: ServerResponse, status: number, value: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(value))
}

export function registerNotifyRoutes(options: {
  webServer: WebServerLike
  getConfig: () => NotifyConfig
  getSettingsScope: () => SettingsScopeLike | null
  engine: NotifyEngine
}): Array<() => void> {
  const disposeConfig = options.webServer.register({
    kind: 'exact',
    path: `${API_PREFIX}/config`,
    handler: async (req, res) => {
      try {
        if (req.method === 'GET') {
          sendJson(res, 200, {
            ok: true,
            config: normalizeConfig(options.getConfig()),
            sounds: listSoundPresets(),
          })
          return
        }
        if (req.method === 'POST') {
          const parsed = await readJsonBody(req) as { patch?: unknown }
          const scope = options.getSettingsScope()
          if (scope === null) {
            sendJson(res, 503, { ok: false, error: '设置服务尚未就绪' })
            return
          }
          const next = mergeConfig(options.getConfig(), parsed.patch)
          await scope.replace(next)
          sendJson(res, 200, {
            ok: true,
            config: normalizeConfig(scope.get()),
            sounds: listSoundPresets(),
          })
          return
        }
        sendJson(res, 405, { ok: false, error: '仅支持 GET / POST' })
      } catch (error) {
        sendJson(res, 400, { ok: false, error: String((error as Error).message ?? error) })
      }
    },
  })

  const disposePreview = options.webServer.register({
    kind: 'exact',
    path: `${API_PREFIX}/preview`,
    handler: async (req, res) => {
      try {
        const parsed = await readJsonBody(req) as { sound?: unknown }
        const sound = typeof parsed.sound === 'string' ? parsed.sound : 'soft'
        if (!(sound in SOUND_PRESETS)) {
          sendJson(res, 400, { ok: false, error: `未知提示音：${sound}` })
          return
        }
        options.engine.previewSound(sound as SoundId)
        sendJson(res, 200, { ok: true })
      } catch (error) {
        sendJson(res, 400, { ok: false, error: String((error as Error).message ?? error) })
      }
    },
  })

  const disposeFocus = options.webServer.register({
    kind: 'exact',
    path: `${API_PREFIX}/focus`,
    handler: async (req, res) => {
      try {
        const parsed = await readJsonBody(req) as { focused?: unknown }
        options.engine.setFocused(parsed.focused === true)
        sendJson(res, 200, { ok: true, focused: options.engine.isFocused() })
      } catch (error) {
        sendJson(res, 400, { ok: false, error: String((error as Error).message ?? error) })
      }
    },
  })

  return [disposeConfig, disposePreview, disposeFocus]
}

