import { z } from 'zod'
import { createEmptyTrayState, type CompletedItem, type TrayState } from './notify/tray-state.ts'

export const completedItemSchema = z.object({
  sessionId: z.string(),
  title: z.string(),
})

export const trayStateSchema = z.object({
  pending: z.number().int().nonnegative(),
  completed: z.array(completedItemSchema),
})

export const notifyDomainSpec = {
  name: 'dsh_notify',
  version: 1,
  global: {
    schema: trayStateSchema,
    initial: createEmptyTrayState(),
  },
  tables: {
    completed: { valueSchema: completedItemSchema },
  },
} as const

export function isEmptyTrayState(state: TrayState): boolean {
  return state.pending === 0 && state.completed.length === 0
}

export function parseTrayState(raw: unknown): TrayState {
  const parsed = trayStateSchema.safeParse(raw)
  if (!parsed.success) return createEmptyTrayState()
  const completed: CompletedItem[] = parsed.data.completed
    .map(item => ({
      sessionId: item.sessionId,
      title: item.title.slice(0, 60),
    }))
    .filter(item => item.sessionId !== '')
    .slice(-10)
  return {
    pending: parsed.data.pending,
    completed,
  }
}
