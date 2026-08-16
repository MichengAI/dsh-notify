import { API_PREFIX, type NotifyConfig } from '../config.ts'

export interface ConfigPayload {
  ok: boolean
  config?: NotifyConfig
  error?: string
}

async function parsePayload(res: Response): Promise<ConfigPayload> {
  let data: ConfigPayload
  try {
    data = await res.json() as ConfigPayload
  } catch {
    throw new Error(`请求失败（${res.status}）`)
  }
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
