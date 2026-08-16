const STYLE_ID = 'dsh-notify-settings'

const CSS_TEXT = `
.dsh-nt{box-sizing:border-box;width:min(100%,760px);margin:0 auto;padding:4px 2px 48px;color:var(--dsw-alias-label-primary)}
.dsh-nt-intro{margin:0 0 8px;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.6}
.dsh-nt-error{margin:8px 0 0;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}
.dsh-nt-row{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:16px 0;border-top:1px solid var(--dsw-alias-border-l2)}
.dsh-nt-row:first-of-type{border-top:0}
.dsh-nt-copy{min-width:0;flex:1;display:flex;flex-direction:column;gap:4px}
.dsh-nt-label{font-size:13px;font-weight:500;line-height:20px}
.dsh-nt-hint{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.dsh-nt-control{flex:none;display:flex;align-items:center;justify-content:flex-end;gap:8px;min-height:32px}
.dsh-nt-switch{position:relative;width:40px;height:22px;border:0;border-radius:999px;background:rgba(255,255,255,.16);cursor:pointer}
.dsh-nt-switch:after{content:'';position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .16s ease}
.dsh-nt-switch.is-on{background:var(--dsw-alias-brand-primary)}
.dsh-nt-switch.is-on:after{transform:translateX(18px)}
.dsh-nt-switch:disabled{opacity:.4;cursor:default}
.dsh-nt-seg{display:inline-flex;padding:3px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-3)}
.dsh-nt-seg button{appearance:none;min-width:76px;height:30px;padding:0 12px;border:0;border-radius:9px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;cursor:pointer}
.dsh-nt-seg button:hover:not(:disabled){color:var(--dsw-alias-label-primary)}
.dsh-nt-seg button.is-on{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-weight:600;box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2)}
.dsh-nt-seg button:disabled{opacity:.45;cursor:default}
.dsh-nt-picker{display:inline-flex;align-items:center;justify-content:space-between;gap:10px;min-width:148px;height:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer}
.dsh-nt-picker:hover:not(:disabled){border-color:var(--dsw-alias-label-dimmed)}
.dsh-nt-picker:disabled{opacity:.45;cursor:default}
.dsh-nt-caret{width:8px;height:8px;border-right:1.5px solid var(--dsw-alias-label-tertiary);border-bottom:1.5px solid var(--dsw-alias-label-tertiary);transform:rotate(45deg) translateY(-2px)}
.dsh-nt-times{display:flex;align-items:center;gap:8px}
.dsh-nt-times input{box-sizing:border-box;width:108px;height:32px;padding:0 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
.dsh-nt-times input:focus{border-color:var(--dsw-alias-brand-primary);outline:none}
.dsh-nt-dim .dsh-nt-label,.dsh-nt-dim .dsh-nt-hint{opacity:.55}
`

export function installNotifyStyles(): () => void {
  if (typeof document === 'undefined') return () => undefined
  if (document.getElementById(STYLE_ID)) return () => undefined
  const tag = document.createElement('style')
  tag.id = STYLE_ID
  tag.textContent = CSS_TEXT
  document.head.appendChild(tag)
  return () => tag.remove()
}
