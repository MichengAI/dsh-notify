import type { NotifyConfig } from './config.ts'

export type AskKind = 'permission' | 'question'

const PERMISSION_INTENTS = new Set(['plan-review', 'approval', 'permission', 'tool-approval'])

export function classifyAsk(intentKind: unknown): AskKind {
  return typeof intentKind === 'string' && PERMISSION_INTENTS.has(intentKind)
    ? 'permission'
    : 'question'
}

export function shouldNotifyComplete(config: NotifyConfig, focused: boolean): boolean {
  if (!config.enabled || config.channels.complete === 'off') return false
  if (config.channels.complete === 'unfocused') return !focused
  return true
}

export function shouldNotifyAsk(config: NotifyConfig, kind: AskKind): boolean {
  if (!config.enabled) return false
  return kind === 'permission' ? config.channels.permission : config.channels.question
}
