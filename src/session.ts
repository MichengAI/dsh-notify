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

export function isRootAgent(ctx: { get(name: string): unknown }, agent: { id?: unknown } | undefined): boolean {
  try {
    const agents = ctx.get('agents') as { roots?: () => Array<{ id?: unknown }> } | undefined
    const roots = agents?.roots?.()
    if (!Array.isArray(roots) || roots.length === 0) return true
    return roots.some(root => root === agent || (agent?.id !== undefined && root?.id === agent.id))
  } catch {
    return true
  }
}

export function seedAgentStatuses(ctx: { get(name: string): unknown }): Map<string, string> {
  const seeded = new Map<string, string>()
  try {
    const agents = ctx.get('agents') as { list?: () => Array<{ id?: unknown; status?: unknown }> } | undefined
    for (const agent of agents?.list?.() ?? []) {
      if (agent?.id === undefined) continue
      seeded.set(String(agent.id), agent.status === 'running' ? 'running' : 'idle')
    }
  } catch {
    /* 启动快照失败时按事件自行建立 */
  }
  return seeded
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

