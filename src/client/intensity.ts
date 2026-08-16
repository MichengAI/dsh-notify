import type { CompleteMode, NotifyConfig, SoundId } from '../config.ts'

export type NotifyIntensity = 'badge' | 'banner' | 'full'

export function intensityOf(config: Pick<NotifyConfig, 'completeMode' | 'soundEnabled'>): NotifyIntensity {
  if (config.completeMode === 'badge-only') return 'badge'
  return config.soundEnabled ? 'full' : 'banner'
}

export function patchFromIntensity(value: NotifyIntensity): Pick<NotifyConfig, 'completeMode' | 'soundEnabled'> {
  if (value === 'badge') return { completeMode: 'badge-only', soundEnabled: false }
  if (value === 'banner') return { completeMode: 'toast' as CompleteMode, soundEnabled: false }
  return { completeMode: 'toast' as CompleteMode, soundEnabled: true }
}

export function isSoundId(value: string, ids: readonly SoundId[]): value is SoundId {
  return ids.includes(value as SoundId)
}
