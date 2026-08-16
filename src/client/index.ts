import { NotifySection } from './NotifySection.tsx'

interface ClientContext {
  slots: {
    inject(name: string, factory: () => unknown): void
    register(meta: { name: string; id: string; order: number; label: string }, view: unknown): unknown
  }
}

export const name = 'dsh-notify-client'
export const inject = ['slots']

export function apply(ctx: ClientContext): void {
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'notify',
    order: 80,
    label: '通知',
  }, NotifySection))
}
