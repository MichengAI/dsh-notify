import { API_PREFIX, type NotifyConfig, type SoundId } from '../config.ts'

export interface SoundOption {
  id: SoundId
  label: string
  desc: string
}

export interface ConfigPayload {
  ok: boolean
  config?: NotifyConfig
  sounds?: SoundOption[]
  error?: string
}

async function parsePayload(res: Response): Promise<ConfigPayload> {
  const data = await res.json() as ConfigPayload
  if (!data.ok) throw new Error(data.error ?? `请求失败（${res.status}）`)
  return data
}

export async function fetchNotifyConfig(): Promise<ConfigPayload> {
  return parsePayload(await fetch(`${API_PREFIX}/config`))
}

export async function patchNotifyConfig(patch: Partial<NotifyConfig>): Promise<ConfigPayload> {
  return parsePayload(await fetch(`${API_PREFIX}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patch }),
  }))
}

export async function previewNotifySound(sound: SoundId): Promise<void> {
  await fetch(`${API_PREFIX}/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sound }),
  })
}
