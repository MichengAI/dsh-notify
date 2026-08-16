export const SOUND_IDS = ['soft', 'brisk', 'calm', 'crisp'] as const
export type SoundId = (typeof SOUND_IDS)[number]

export const COMPLETE_MODES = ['toast', 'badge-only'] as const
export type CompleteMode = (typeof COMPLETE_MODES)[number]

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

export interface NotifyConfig {
  enabled: boolean
  sound: SoundId
  soundEnabled: boolean
  quietHours: QuietHoursConfig
  respectSystemDnd: boolean
  completeMode: CompleteMode
  completeMerge: boolean
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
  }
}

function isSoundId(value: unknown): value is SoundId {
  return typeof value === 'string' && (SOUND_IDS as readonly string[]).includes(value)
}

function isCompleteMode(value: unknown): value is CompleteMode {
  return typeof value === 'string' && (COMPLETE_MODES as readonly string[]).includes(value)
}

function normalizeTime(value: unknown, fallback: string): string {
  return typeof value === 'string' && TIME_PATTERN.test(value) ? value : fallback
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
  return base
}

export function mergeConfig(current: NotifyConfig, patch: unknown): NotifyConfig {
  if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) {
    throw new Error('patch 必须是对象')
  }
  return normalizeConfig({ ...current, ...(patch as Record<string, unknown>) })
}

export function isNotifyDisabledByEnv(): boolean {
  return ['0', 'false', 'off'].includes(String(process.env.DSH_NOTIFY ?? '').toLowerCase())
}

export function readMinIntervalMs(): number {
  const parsed = Number(process.env.DSH_NOTIFY_MIN_INTERVAL_MS ?? DEFAULT_MIN_INTERVAL_MS)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_MIN_INTERVAL_MS
}

