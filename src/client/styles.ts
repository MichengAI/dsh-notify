const STYLE_ID = 'dsh-notify-settings'

const CSS_TEXT = `
.dsh-nt{box-sizing:border-box;width:min(100%,760px);margin:0 auto;padding:8px 4px 48px;color:var(--dsw-alias-label-primary);display:flex;flex-direction:column;gap:4px}
.dsh-nt h1{margin:0 0 8px;font-size:18px;font-weight:600;line-height:26px}
.dsh-nt-intro{margin:0 0 16px;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.6}
.dsh-nt-error{margin:0 0 12px;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}
.dsh-nt-field{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0;border-top:1px solid var(--dsw-alias-border-l2)}
.dsh-nt-field:first-of-type{border-top:0;padding-top:4px}
.dsh-nt-copy{min-width:0;flex:1;display:flex;flex-direction:column;gap:4px}
.dsh-nt-label{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:1.5}
.dsh-nt-hint{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.5}
.dsh-nt-group{margin-top:8px}
.dsh-nt-group-title{margin:18px 0 8px;color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px}
.dsh-nt-switch{position:relative;width:40px;height:22px;border:0;border-radius:999px;background:var(--dsw-alias-label-tertiary);flex:none;cursor:pointer}
.dsh-nt-switch:after{content:'';position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .16s ease}
.dsh-nt-switch.is-on{background:var(--dsw-alias-brand-primary)}
.dsh-nt-switch.is-on:after{transform:translateX(18px)}
.dsh-nt-list{display:flex;flex-direction:column;gap:8px;margin:4px 0 8px}
.dsh-nt-sound{display:grid;grid-template-columns:16px minmax(0,1fr) auto;align-items:center;gap:12px;min-height:56px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:transparent;color:inherit;text-align:left;cursor:pointer}
.dsh-nt-sound:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-nt-sound.is-on{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover)}
.dsh-nt-radio{width:14px;height:14px;border:1.5px solid var(--dsw-alias-label-tertiary);border-radius:50%;box-sizing:border-box}
.dsh-nt-sound.is-on .dsh-nt-radio{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);box-shadow:inset 0 0 0 3px var(--dsw-alias-bg-layer-1)}
.dsh-nt-sound-text{min-width:0;display:flex;flex-direction:column;gap:2px}
.dsh-nt-preview{appearance:none;height:28px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;cursor:pointer}
.dsh-nt-preview:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dsh-nt-preview:disabled{opacity:.5;cursor:default}
.dsh-nt-mode{display:flex;flex-direction:column;gap:8px;margin:4px 0 8px}
.dsh-nt-choice{display:grid;grid-template-columns:16px minmax(0,1fr);align-items:center;gap:12px;min-height:44px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:transparent;color:inherit;text-align:left;cursor:pointer}
.dsh-nt-choice.is-on{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover)}
.dsh-nt-times{display:flex;align-items:center;gap:8px;padding:0 0 12px}
.dsh-nt-times input{box-sizing:border-box;width:84px;height:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;text-align:center}
.dsh-nt-times input:focus{border-color:var(--dsw-alias-brand-primary);outline:none}
`

export function installNotifyStyles(): () => void {
  if (typeof document === 'undefined') return () => undefined
  const existed = document.getElementById(STYLE_ID)
  if (existed) return () => undefined
  const tag = document.createElement('style')
  tag.id = STYLE_ID
  tag.textContent = CSS_TEXT
  document.head.appendChild(tag)
  return () => tag.remove()
}
