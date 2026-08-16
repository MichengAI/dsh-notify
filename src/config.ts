export const SOUND_IDS = ['soft', 'brisk', 'calm', 'crisp'] as const
export type SoundId = (typeof SOUND_IDS)[number]

export const COMPLETE_MODES = ['toast', 'badge-only'] as const
export type CompleteMode = (typeof COMPLETE_MODES)[number]

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
  enabled: boolean
  sound: SoundId
  soundEnabled: boolean
  quietHours: QuietHoursConfig
  respectSystemDnd: boolean
  completeMode: CompleteMode
  completeMerge: boolean
  channels: NotifyChannels
}

export function createDefaultChannels(): NotifyChannels {
  return {
    complete: 'unfocused',
    permission: true,
    question: true,
  }
}

export function createDefaultConfig(): NotifyConfig {
  return {
    enabled: true,
    sound: 'soft',
    soundEnabled: true,
    quietHours: { enabled: false, start: '22:00', end: '08:00' },
    respectSystemDnd: true,
    completeMode: 'toast',
    completeMerge: true,
    channels: createDefaultChannels(),
  }
}

function isSoundId(value: unknown): value is SoundId {
  return typeof value === 'string' && (SOUND_IDS as readonly string[]).includes(value)
}

function isCompleteMode(value: unknown): value is CompleteMode {
  return typeof value === 'string' && (COMPLETE_MODES as readonly string[]).includes(value)
}

function isCompleteWhen(value: unknown): value is CompleteWhen {
  return typeof value === 'string' && (COMPLETE_WHEN as readonly string[]).includes(value)
}

function normalizeTime(value: unknown, fallback: string): string {
  return typeof value === 'string' && TIME_PATTERN.test(value) ? value : fallback
}

function normalizeChannels(raw: unknown, fallback: NotifyChannels, completeMode: CompleteMode): NotifyChannels {
  const next = { ...fallback }
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    if (completeMode === 'badge-only') next.complete = 'off'
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
  if (typeof input.enabled === 'boolean') base.enabled = input.enabled
  if (isSoundId(input.sound)) base.sound = input.sound
  if (typeof input.soundEnabled === 'boolean') base.soundEnabled = input.soundEnabled
  if (input.quietHours !== null && typeof input.quietHours === 'object') {
    const hours = input.quietHours as Record<string, unknown>
    if (typeof hours.enabled === 'boolean') base.quietHours.enabled = hours.enabled
    base.quietHours.start = normalizeTime(hours.start, base.quietHours.start)
    base.quietHours.end = normalizeTime(hours.end, base.quietHours.end)
  }
  if (typeof input.respectSystemDnd === 'boolean') base.respectSystemDnd = input.respectSystemDnd
  if (isCompleteMode(input.completeMode)) base.completeMode = input.completeMode
  if (typeof input.completeMerge === 'boolean') base.completeMerge = input.completeMerge
  base.channels = normalizeChannels(input.channels, base.channels, base.completeMode)
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
