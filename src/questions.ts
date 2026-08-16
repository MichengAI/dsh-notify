import { readSessionTitle } from './session.ts'
import type { NotifyEngine } from './notify/engine.ts'

interface AskRequest {
  questions?: Array<{
    header?: unknown
    question?: unknown
    prompt?: unknown
    multiSelect?: unknown
    options?: Array<{ label?: unknown; text?: unknown }>
    intent?: { kind?: unknown }
  }>
  agent?: { session?: unknown }
}

interface UserQuestionsService {
  ask: ((request: AskRequest) => Promise<unknown>) & { __dshNotifyWrapped?: boolean }
}

function firstQuestionText(question: NonNullable<AskRequest['questions']>[number]): string {
  for (const value of [question.header, question.question, question.prompt]) {
    if (typeof value === 'string' && value.trim() !== '') return value.trim()
  }
  return ''
}

function optionSummary(question: NonNullable<AskRequest['questions']>[number]): string {
  if (question.multiSelect === true || !Array.isArray(question.options)) return ''
  return question.options
    .map(option => {
      if (typeof option.label === 'string' && option.label.trim() !== '') return option.label.trim()
      if (typeof option.text === 'string' && option.text.trim() !== '') return option.text.trim()
      return ''
    })
    .filter(Boolean)
    .join(' / ')
}

export function wrapUserQuestions(
  ctx: { get(name: string): unknown; logger: { warn(message: string): void } },
  engine: NotifyEngine,
): (() => void) | null {
  const service = ctx.get('userQuestions') as UserQuestionsService | undefined
  if (service === undefined || typeof service.ask !== 'function' || service.ask.__dshNotifyWrapped === true) {
    return null
  }
  const original = service.ask
  const wrapped = async function wrappedAsk(this: unknown, request: AskRequest): Promise<unknown> {
    const questions = Array.isArray(request?.questions) ? request.questions : []
    const first = questions[0]
    if (first !== undefined) {
      try {
        const sessionTitle = readSessionTitle(request.agent?.session as { title?: unknown; events?: unknown })
        const isPlan = first.intent?.kind === 'plan-review'
        const title = `${isPlan ? 'DSH 计划等待审批' : 'DSH 需要你的决定'}${sessionTitle ? ` · ${sessionTitle}` : ''}`
        engine.updatePending(1)
        engine.showToast({
          title,
          message: firstQuestionText(first),
          detail: optionSummary(first),
        })
      } catch (error) {
        ctx.logger.warn(`提问提醒失败：${String((error as Error).message ?? error)}`)
      }
    }
    try {
      return await original.call(this, request)
    } finally {
      if (first !== undefined) engine.updatePending(-1)
    }
  }
  wrapped.__dshNotifyWrapped = true
  service.ask = wrapped
  return () => {
    service.ask = original
  }
}
