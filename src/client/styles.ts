import type { CSSProperties } from 'react'

export const styles = {
  root: { boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12, padding: 20, overflow: 'auto', height: '100%' } satisfies CSSProperties,
  hint: { margin: 0, color: 'var(--dsw-alias-label-secondary)', fontSize: 12, lineHeight: '18px' } satisfies CSSProperties,
  error: { color: 'var(--dsw-alias-state-error-primary)', fontSize: 12, lineHeight: '18px' } satisfies CSSProperties,
  group: { display: 'flex', flexDirection: 'column', gap: 8 } satisfies CSSProperties,
  groupTitle: { color: 'var(--dsw-alias-label-secondary)', fontSize: 11, fontWeight: 600, letterSpacing: '.02em' } satisfies CSSProperties,
  divider: { height: 1, border: 'none', margin: '4px 0', background: 'var(--dsw-alias-interactive-bg-hover)' } satisfies CSSProperties,
  card: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', borderRadius: 12, background: 'var(--dsw-alias-interactive-bg-hover)' } satisfies CSSProperties,
  cardText: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 } satisfies CSSProperties,
  label: { color: 'var(--dsw-alias-label-primary)', fontSize: 14, lineHeight: '22px' } satisfies CSSProperties,
  desc: { color: 'var(--dsw-alias-label-secondary)', fontSize: 12, lineHeight: '18px' } satisfies CSSProperties,
  row: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 12, border: '1px solid transparent', cursor: 'pointer' } satisfies CSSProperties,
  rowOn: { borderColor: 'var(--dsw-alias-brand-primary)', background: 'var(--dsw-alias-interactive-bg-hover)' } satisfies CSSProperties,
  radio: { width: 14, height: 14, borderRadius: '50%', boxSizing: 'border-box', border: '1.5px solid var(--dsw-alias-label-tertiary)', flex: 'none' } satisfies CSSProperties,
  radioOn: { borderColor: 'var(--dsw-alias-brand-primary)', background: 'var(--dsw-alias-brand-primary)' } satisfies CSSProperties,
  timeRow: { display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8 } satisfies CSSProperties,
  timeInput: { width: 76, height: 28, borderRadius: 8, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-3)', color: 'var(--dsw-alias-label-primary)', textAlign: 'center', fontFamily: 'inherit' } satisfies CSSProperties,
  switch: { width: 40, height: 22, borderRadius: 11, border: 0, background: 'var(--dsw-alias-brand-primary)', position: 'relative', cursor: 'pointer' } satisfies CSSProperties,
  switchOff: { background: 'var(--dsw-alias-label-tertiary)' } satisfies CSSProperties,
  knob: { position: 'absolute', top: 2, left: 20, width: 18, height: 18, borderRadius: '50%', background: '#fff' } satisfies CSSProperties,
  knobOff: { left: 2 } satisfies CSSProperties,
}
