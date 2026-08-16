import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SoundId } from '../config.ts'

const HERE = path.dirname(fileURLToPath(import.meta.url))

export interface SoundPreset {
  id: SoundId
  label: string
  desc: string
  file: string
}

export const SOUND_PRESETS: Record<SoundId, SoundPreset> = {
  soft: { id: 'soft', label: '柔和（默认）', desc: '低音双击，短促但不刺耳', file: 'notify-soft.wav' },
  brisk: { id: 'brisk', label: '轻快', desc: '三连上行，提醒更醒目', file: 'notify-brisk.wav' },
  calm: { id: 'calm', label: '舒缓', desc: '低八度长音，适合长时间挂机', file: 'notify-calm.wav' },
  crisp: { id: 'crisp', label: '清脆', desc: '高音短促，适合嘈杂环境', file: 'notify-crisp.wav' },
}

export function listSoundPresets(): Array<Pick<SoundPreset, 'id' | 'label' | 'desc'>> {
  return Object.values(SOUND_PRESETS).map(({ id, label, desc }) => ({ id, label, desc }))
}

export function resolveAssetsDir(fromHere = HERE): string {
  return path.resolve(fromHere, '..', '..', 'assets')
}

export function resolveSoundPath(sound: SoundId, assetsDir = resolveAssetsDir()): string {
  const override = process.env.DSH_NOTIFY_SOUND
  if (override && existsSync(override)) return override
  const preferred = path.join(assetsDir, SOUND_PRESETS[sound].file)
  if (existsSync(preferred)) return preferred
  const fallback = path.join(assetsDir, 'notify-soft.wav')
  return existsSync(fallback) ? fallback : preferred
}
