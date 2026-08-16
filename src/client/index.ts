import { NotifySection } from './NotifySection.tsx'
import { installFocusBridge } from './focus.ts'

interface ClientContext {
  slots: {
    inject(name: string, factory: () => unknown): void
    register(meta: { name: string; id: string; order: number; label: string }, view: unknown): unknown
  }
}

export const name = 'dsh-notify-client'
export const inject = ['slots']

export function apply(ctx: ClientContext): void {
  installFocusBridge()
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'notify',
    order: 29,
    label: '通知',
  }, NotifySection))
}
