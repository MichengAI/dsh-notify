import { useCallback, useEffect, useState, type ReactElement } from 'react'
import { Menu } from '@deepseek-ai/dsh-client-ui-primitives'
import { createDefaultConfig, type CompleteWhen, type NotifyConfig } from '../config.ts'
import { fetchNotifyConfig, patchNotifyConfig } from './api.ts'
import { installNotifyStyles } from './styles.ts'

const COMPLETE_OPTIONS: Array<{ id: CompleteWhen; label: string }> = [
  { id: 'always', label: '始终提醒' },
  { id: 'unfocused', label: '仅在未聚焦时' },
  { id: 'off', label: '关闭' },
]

function Field(props: {
  label: string
  hint?: string
  dim?: boolean
  children: ReactElement
}): ReactElement {
  return (
    <div className={props.dim ? 'dsh-nt-row dsh-nt-dim' : 'dsh-nt-row'}>
      <div className="dsh-nt-copy">
        <div className="dsh-nt-label">{props.label}</div>
        {props.hint ? <p className="dsh-nt-hint">{props.hint}</p> : null}
      </div>
      <div className="dsh-nt-control">{props.children}</div>
    </div>
  )
}

function Picker(props: {
  value: string
  options: Array<{ id: string; label: string }>
  disabled?: boolean
  onChange: (id: string) => void
}): ReactElement {
  const [open, setOpen] = useState(false)
  const current = props.options.find(item => item.id === props.value)?.label ?? '请选择'
  return (
    <Menu
      open={open && props.disabled !== true}
      portal
      align="end"
      compact
      selectedId={props.value}
      items={props.options.map(item => ({ id: item.id, label: item.label }))}
      onSelect={(id: string) => {
        props.onChange(id)
        setOpen(false)
      }}
      onClose={() => setOpen(false)}
      anchor={(
        <button
          type="button"
          className="dsh-nt-picker"
          disabled={props.disabled === true}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen(value => !value)}
        >
          <span>{current}</span>
          <span className="dsh-nt-caret" aria-hidden="true" />
        </button>
      )}
    />
  )
}

export function NotifySection(): ReactElement {
  const [config, setConfig] = useState<NotifyConfig>(createDefaultConfig())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => installNotifyStyles(), [])

  useEffect(() => {
    void fetchNotifyConfig()
      .then(payload => {
        if (payload.config) setConfig(payload.config)
      })
      .catch(err => setError(String((err as Error).message ?? err)))
      .finally(() => setLoading(false))
  }, [])

  const update = useCallback(async (patch: Partial<NotifyConfig>) => {
    setError('')
    try {
      const payload = await patchNotifyConfig(patch)
      if (payload.config) setConfig(payload.config)
    } catch (err) {
      setError(String((err as Error).message ?? err))
    }
  }, [])

  return (
    <div className="dsh-nt">
      <header className="dsh-nt-head">
        <h2 className="dsh-nt-title">通知</h2>
        <p className="dsh-nt-intro">完成后、需要权限或提问时，按类型分别提醒你。</p>
      </header>
      {error ? <div className="dsh-nt-error">{error}</div> : null}
      {loading ? <p className="dsh-nt-hint">加载中…</p> : (
        <div className="dsh-nt-list">
            <Field label="轮次完成通知" hint="根 Agent 回合结束后何时提醒你。">
              <Picker
                value={config.channels.complete}
                options={COMPLETE_OPTIONS}
                onChange={id => void update({ channels: { ...config.channels, complete: id as CompleteWhen } })}
              />
            </Field>
            <Field label="启用权限通知" hint="需要批准工具或计划时提醒。">
              <button
                type="button"
                className={config.channels.permission ? 'dsh-nt-switch is-on' : 'dsh-nt-switch'}
                role="switch"
                aria-checked={config.channels.permission}
                onClick={() => void update({ channels: { ...config.channels, permission: !config.channels.permission } })}
              />
            </Field>
            <Field label="启用提问通知" hint="需要你选择或输入后才能继续时提醒。">
              <button
                type="button"
                className={config.channels.question ? 'dsh-nt-switch is-on' : 'dsh-nt-switch'}
                role="switch"
                aria-checked={config.channels.question}
                onClick={() => void update({ channels: { ...config.channels, question: !config.channels.question } })}
              />
            </Field>

          <Field label="安静时段" hint="这段时间只记角标，不弹窗、不响铃。">
            <>
              {config.quietHours.enabled ? (
                <div className="dsh-nt-times">
                  <input
                    type="time"
                    value={config.quietHours.start}
                    onChange={event => void update({
                      quietHours: { ...config.quietHours, start: event.target.value },
                    })}
                  />
                  <span className="dsh-nt-hint">至</span>
                  <input
                    type="time"
                    value={config.quietHours.end}
                    onChange={event => void update({
                      quietHours: { ...config.quietHours, end: event.target.value },
                    })}
                  />
                </div>
              ) : null}
              <button
                type="button"
                className={config.quietHours.enabled ? 'dsh-nt-switch is-on' : 'dsh-nt-switch'}
                role="switch"
                aria-checked={config.quietHours.enabled}
                onClick={() => void update({
                  quietHours: { ...config.quietHours, enabled: !config.quietHours.enabled },
                })}
              />
            </>
          </Field>

          <Field label="跟随系统勿扰" hint="专注助手打开时自动静音。">
            <button
              type="button"
              className={config.respectSystemDnd ? 'dsh-nt-switch is-on' : 'dsh-nt-switch'}
              role="switch"
              aria-checked={config.respectSystemDnd}
              onClick={() => void update({ respectSystemDnd: !config.respectSystemDnd })}
            />
          </Field>

          <Field label="合并连续完成" hint="几秒内的多次完成收成一条。">
            <button
              type="button"
              className={config.completeMerge ? 'dsh-nt-switch is-on' : 'dsh-nt-switch'}
              role="switch"
              aria-checked={config.completeMerge}
              onClick={() => void update({ completeMerge: !config.completeMerge })}
            />
          </Field>
        </div>
      )}
    </div>
  )
}


