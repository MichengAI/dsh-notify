import { API_PREFIX } from '../config.ts'

export function installFocusBridge(): () => void {
  if (typeof window === 'undefined') return () => undefined
  const send = (focused: boolean): void => {
    void fetch(`${API_PREFIX}/focus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ focused }),
    }).catch(() => undefined)
  }
  const sync = (): void => {
    send(document.visibilityState === 'visible' && document.hasFocus())
  }
  window.addEventListener('focus', sync)
  window.addEventListener('blur', sync)
  document.addEventListener('visibilitychange', sync)
  sync()
  return () => {
    window.removeEventListener('focus', sync)
    window.removeEventListener('blur', sync)
    document.removeEventListener('visibilitychange', sync)
  }
}
