export const COMPLETE_WHEN = ['always', 'unfocused', 'off'] as const
export type CompleteWhen = (typeof COMPLETE_WHEN)[number]

export const TIME_PATTERN = /^(?:[01]?\d|2[0-3]):[0-5]\d$/

export const COMPLETE_MERGE_MS = 5000
export const DEFAULT_MIN_INTERVAL_MS = 2500
export const DEFAULT_WEB_PORT = 3080
export const SETTINGS_NAMESPACE = 'dsh-notify'
export const API_PREFIX = '/api/dsh-notify'
export const STATE_DIR_NAME = 'dsh-notify'

export interface QuietHoursConfig {
  enabled: boolean
  start: string
  end: string
}

export interface NotifyChannels {
  complete: CompleteWhen
  permission: boolean
  question: boolean
}

export interface NotifyConfig {
  quietHours: QuietHoursConfig
  respectSystemDnd: boolean
  completeMerge: boolean
  channels: NotifyChannels
}

export function createDefaultChannels(): NotifyChannels {
  return {
    complete: 'always',
    permission: true,
    question: true,
  }
}

export function createDefaultConfig(): NotifyConfig {
  return {
    quietHours: { enabled: false, start: '22:00', end: '08:00' },
    respectSystemDnd: true,
    completeMerge: true,
    channels: createDefaultChannels(),
  }
}

function isCompleteWhen(value: unknown): value is CompleteWhen {
  return typeof value === 'string' && (COMPLETE_WHEN as readonly string[]).includes(value)
}

function normalizeTime(value: unknown, fallback: string): string {
  return typeof value === 'string' && TIME_PATTERN.test(value) ? value : fallback
}

function normalizeChannels(raw: unknown, fallback: NotifyChannels, legacyCompleteMode: unknown): NotifyChannels {
  const next = { ...fallback }
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    if (legacyCompleteMode === 'badge-only') next.complete = 'off'
    return next
  }
  const input = raw as Record<string, unknown>
  if (isCompleteWhen(input.complete)) next.complete = input.complete
  if (typeof input.permission === 'boolean') next.permission = input.permission
  if (typeof input.question === 'boolean') next.question = input.question
  return next
}

export function normalizeConfig(raw: unknown): NotifyConfig {
  const base = createDefaultConfig()
  if (raw === null || typeof raw !== 'object') return base
  const input = raw as Record<string, unknown>
  if (input.quietHours !== null && typeof input.quietHours === 'object') {
    const hours = input.quietHours as Record<string, unknown>
    if (typeof hours.enabled === 'boolean') base.quietHours.enabled = hours.enabled
    base.quietHours.start = normalizeTime(hours.start, base.quietHours.start)
    base.quietHours.end = normalizeTime(hours.end, base.quietHours.end)
  }
  if (typeof input.respectSystemDnd === 'boolean') base.respectSystemDnd = input.respectSystemDnd
  if (typeof input.completeMerge === 'boolean') base.completeMerge = input.completeMerge
  base.channels = normalizeChannels(input.channels, base.channels, input.completeMode)
  return base
}

export function mergeConfig(current: NotifyConfig, patch: unknown): NotifyConfig {
  if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) {
    throw new Error('patch 必须是对象')
  }
  const input = patch as Record<string, unknown>
  const next: Record<string, unknown> = { ...current, ...input }
  if (input.channels !== undefined && typeof input.channels === 'object' && input.channels !== null && !Array.isArray(input.channels)) {
    next.channels = {
      ...current.channels,
      ...(input.channels as Record<string, unknown>),
    }
  }
  if (input.quietHours !== undefined && typeof input.quietHours === 'object' && input.quietHours !== null && !Array.isArray(input.quietHours)) {
    next.quietHours = {
      ...current.quietHours,
      ...(input.quietHours as Record<string, unknown>),
    }
  }
  return normalizeConfig(next)
}

export function isNotifyDisabledByEnv(): boolean {
  return ['0', 'false', 'off'].includes(String(process.env.DSH_NOTIFY ?? '').toLowerCase())
}

export function readMinIntervalMs(): number {
  const parsed = Number(process.env.DSH_NOTIFY_MIN_INTERVAL_MS ?? DEFAULT_MIN_INTERVAL_MS)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_MIN_INTERVAL_MS
}

