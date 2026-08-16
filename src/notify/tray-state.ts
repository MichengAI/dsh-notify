import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export interface CompletedItem {
  sessionId: string
  title: string
}

export interface TrayState {
  pending: number
  completed: CompletedItem[]
}

export function createEmptyTrayState(): TrayState {
  return { pending: 0, completed: [] }
}

export function trayStatePath(stateDir: string): string {
  return path.join(stateDir, 'tray-state.json')
}

export function readTrayState(stateDir: string): TrayState {
  const file = trayStatePath(stateDir)
  try {
    if (!existsSync(file)) return createEmptyTrayState()
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as Partial<TrayState>
    const completed = Array.isArray(parsed.completed)
      ? parsed.completed
        .filter((item): item is CompletedItem => item !== null && typeof item === 'object')
        .map(item => ({
          sessionId: String(item.sessionId ?? ''),
          title: String(item.title ?? '').slice(0, 60),
        }))
        .slice(-10)
      : []
    return {
      pending: Math.max(0, Number(parsed.pending ?? 0) || 0),
      completed,
    }
  } catch {
    return createEmptyTrayState()
  }
}

export function writeTrayState(stateDir: string, state: TrayState): void {
  mkdirSync(stateDir, { recursive: true })
  writeFileSync(trayStatePath(stateDir), `${JSON.stringify(state)}\n`, 'utf8')
}

export function addCompletedItem(state: TrayState, sessionId: string, title: string): TrayState {
  return {
    pending: state.pending,
    completed: [
      ...state.completed.filter(item => item.sessionId !== sessionId),
      { sessionId, title: title.slice(0, 60) },
    ].slice(-10),
  }
}

export function shiftPending(state: TrayState, delta: number): TrayState {
  return {
    pending: Math.max(0, state.pending + delta),
    completed: state.completed,
  }
}
