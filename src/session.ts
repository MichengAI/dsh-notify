export interface SessionLike {
  title?: unknown
  events?: unknown
}

export interface AgentLike {
  id?: unknown
  session?: SessionLike
}

export function readSessionTitle(session: SessionLike | undefined): string | undefined {
  try {
    const events = Array.isArray(session?.events) ? session.events : []
    for (let index = events.length - 1; index >= 0; index -= 1) {
      const event = events[index] as { type?: unknown; data?: { title?: unknown } }
      if (event?.type !== 'session/title') continue
      const title = event.data?.title
      if (typeof title === 'string' && title.trim() !== '') return title.trim()
    }
    return typeof session?.title === 'string' && session.title.trim() !== ''
      ? session.title.trim()
      : undefined
  } catch {
    return undefined
  }
}

export function readAssistantSnippet(session: SessionLike | undefined, maxChars: number): string {
  try {
    const events = Array.isArray(session?.events) ? session.events : []
    for (let index = events.length - 1; index >= 0; index -= 1) {
      const event = events[index] as { type?: unknown; data?: { content?: unknown } }
      if (event?.type !== 'assistant/message') continue
      const blocks = Array.isArray(event.data?.content) ? event.data.content : []
      for (const block of blocks) {
        const text = (block as { type?: unknown; text?: unknown }).text
        if ((block as { type?: unknown }).type !== 'text' || typeof text !== 'string') continue
        const compact = text.replace(/\s+/g, ' ').trim()
        if (compact === '') continue
        return compact.length > maxChars ? `${compact.slice(0, maxChars)}…` : compact
      }
    }
  } catch {
    /* 片段可选 */
  }
  return ''
}

export function isRootAgent(ctx: { get(name: string): unknown }, agent: unknown): boolean {
  try {
    const agents = ctx.get('agents') as { roots?: () => unknown[] } | undefined
    const roots = agents?.roots?.()
    return !Array.isArray(roots) || roots.includes(agent)
  } catch {
    return true
  }
}

export function isGoalAutoContinuing(ctx: { get(name: string): unknown }, agent: unknown): boolean {
  try {
    const goals = ctx.get('goals') as { get?: (agent: unknown) => {
      phase?: unknown
      activation?: unknown
      maxGoalRounds?: number
      roundsStarted?: number
    } } | undefined
    const goal = goals?.get?.(agent)
    if (goal === undefined) return false
    if (goal.phase !== 'active' || goal.activation !== 'armed') return false
    if (goal.maxGoalRounds === undefined) return true
    return (goal.roundsStarted ?? 0) < goal.maxGoalRounds
  } catch {
    return false
  }
}
