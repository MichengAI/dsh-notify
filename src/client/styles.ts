const STYLE_ID = 'dsh-notify-settings'

const CSS_TEXT = `
.dsh-nt{box-sizing:border-box;max-width:760px;width:100%;margin:0 auto;padding:0 0 32px;color:var(--dsw-alias-label-primary);display:flex;flex-direction:column;gap:0}
.dsh-nt-intro{margin:0 0 8px;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}
.dsh-nt-error{margin:8px 0 0;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}
.dsh-nt-list{display:flex;flex-direction:column}
.dsh-nt-row{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:14px 0;border-top:1px solid var(--dsw-alias-border-l2)}
.dsh-nt-list .dsh-nt-row:first-child{border-top:0;padding-top:10px}
.dsh-nt-copy{min-width:0;flex:1;display:flex;flex-direction:column;gap:4px}
.dsh-nt-label{font-size:13px;font-weight:500;line-height:1.5}
.dsh-nt-hint{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.5}
.dsh-nt-control{flex:none;display:flex;align-items:center;justify-content:flex-end;gap:10px;min-height:32px}
.dsh-nt-switch{position:relative;width:42px;height:26px;flex:none;border:0;border-radius:999px;background:rgba(120,120,128,.36);box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);cursor:pointer}
.dsh-nt-switch:after{content:'';position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.28);transition:transform .16s ease}
.dsh-nt-switch.is-on{background:#34c759}
.dsh-nt-switch.is-on:after{transform:translateX(16px)}
.dsh-nt-picker{display:inline-flex;align-items:center;justify-content:space-between;gap:10px;min-width:148px;height:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer}
.dsh-nt-picker:hover:not(:disabled){border-color:var(--dsw-alias-label-dimmed)}
.dsh-nt-caret{width:8px;height:8px;border-right:1.5px solid var(--dsw-alias-label-tertiary);border-bottom:1.5px solid var(--dsw-alias-label-tertiary);transform:rotate(45deg) translateY(-2px)}
.dsh-nt-times{display:flex;align-items:center;gap:8px}
.dsh-nt-times input{box-sizing:border-box;width:108px;height:32px;padding:0 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
.dsh-nt-times input:focus{border-color:var(--dsw-alias-brand-primary);outline:none}
`

export function installNotifyStyles(): () => void {
  if (typeof document === 'undefined') return () => undefined
  const existed = document.getElementById(STYLE_ID)
  if (existed) {
    existed.textContent = CSS_TEXT
    return () => undefined
  }
  const tag = document.createElement('style')
  tag.id = STYLE_ID
  tag.textContent = CSS_TEXT
  document.head.appendChild(tag)
  return () => tag.remove()
}

