import { useCallback, useEffect, useState, type ReactElement } from 'react'
import { TIME_PATTERN, createDefaultConfig, type NotifyConfig, type SoundId } from '../config.ts'
import { fetchNotifyConfig, patchNotifyConfig, previewNotifySound, type SoundOption } from './api.ts'
import { intensityOf, isSoundId, patchFromIntensity, type NotifyIntensity } from './intensity.ts'
import { installNotifyStyles } from './styles.ts'

const FALLBACK_SOUNDS: SoundOption[] = [
  { id: 'soft', label: '柔和', desc: '低音双击' },
  { id: 'brisk', label: '轻快', desc: '三连上行' },
  { id: 'calm', label: '舒缓', desc: '低八度长音' },
  { id: 'crisp', label: '清脆', desc: '高音短促' },
]

const INTENSITY: Array<{ id: NotifyIntensity; label: string }> = [
  { id: 'badge', label: '仅角标' },
  { id: 'banner', label: '弹窗' },
  { id: 'full', label: '弹窗和声音' },
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

export function NotifySection(): ReactElement {
  const [config, setConfig] = useState<NotifyConfig>(createDefaultConfig())
  const [sounds, setSounds] = useState<SoundOption[]>(FALLBACK_SOUNDS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [previewing, setPreviewing] = useState(false)

  useEffect(() => installNotifyStyles(), [])

  useEffect(() => {
    void fetchNotifyConfig()
      .then(payload => {
        if (payload.config) setConfig(payload.config)
        if (payload.sounds && payload.sounds.length > 0) setSounds(payload.sounds)
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

  const preview = useCallback(async () => {
    setError('')
    setPreviewing(true)
    try {
      await previewNotifySound(config.sound)
    } catch (err) {
      setError(String((err as Error).message ?? err))
    } finally {
      setPreviewing(false)
    }
  }, [config.sound])

  const intensity = intensityOf(config)
  const soundUsable = config.enabled && intensity === 'full'

  return (
    <div className="dsh-nt">
      <p className="dsh-nt-intro">把完成和提问收成一组本机提醒。改完立刻生效。</p>
      {error ? <div className="dsh-nt-error">{error}</div> : null}
      {loading ? <p className="dsh-nt-hint">加载中…</p> : (
        <>
          <Field label="本机提醒" hint="关掉后不再弹窗、不响铃，托盘也不再累计。">
            <button
              type="button"
              className={config.enabled ? 'dsh-nt-switch is-on' : 'dsh-nt-switch'}
              role="switch"
              aria-checked={config.enabled}
              onClick={() => void update({ enabled: !config.enabled })}
            />
          </Field>

          <Field
            label="提醒强度"
            hint="需要决策时始终会抬升角标。任务完成按这里的强度处理。"
            dim={!config.enabled}
          >
            <div className="dsh-nt-seg" role="radiogroup" aria-label="提醒强度">
              {INTENSITY.map(item => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={intensity === item.id}
                  className={intensity === item.id ? 'is-on' : ''}
                  disabled={!config.enabled}
                  onClick={() => void update(patchFromIntensity(item.id))}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Field>

          <Field
            label="提示音色"
            hint="只在「弹窗和声音」时播放。"
            dim={!soundUsable}
          >
            <>
              <select
                className="dsh-nt-select"
                value={config.sound}
                disabled={!soundUsable}
                onChange={event => {
                  if (isSoundId(event.target.value, sounds.map(item => item.id))) {
                    void update({ sound: event.target.value })
                  }
                }}
              >
                {sounds.map(sound => (
                  <option key={sound.id} value={sound.id}>{sound.label}</option>
                ))}
              </select>
              <button
                type="button"
                className="dsh-nt-ghost"
                disabled={!soundUsable || previewing}
                onClick={() => void preview()}
              >
                {previewing ? '播放中' : '试听'}
              </button>
            </>
          </Field>

          <Field
            label="安静时段"
            hint="这段时间只记角标，不弹窗、不响铃。"
            dim={!config.enabled}
          >
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
                disabled={!config.enabled}
                onClick={() => void update({
                  quietHours: { ...config.quietHours, enabled: !config.quietHours.enabled },
                })}
              />
            </>
          </Field>

          <Field
            label="跟随系统勿扰"
            hint="专注助手打开时自动静音。"
            dim={!config.enabled}
          >
            <button
              type="button"
              className={config.respectSystemDnd ? 'dsh-nt-switch is-on' : 'dsh-nt-switch'}
              role="switch"
              aria-checked={config.respectSystemDnd}
              disabled={!config.enabled}
              onClick={() => void update({ respectSystemDnd: !config.respectSystemDnd })}
            />
          </Field>

          <Field
            label="合并连续完成"
            hint="几秒内的多次完成收成一条。"
            dim={!config.enabled || intensity === 'badge'}
          >
            <button
              type="button"
              className={config.completeMerge ? 'dsh-nt-switch is-on' : 'dsh-nt-switch'}
              role="switch"
              aria-checked={config.completeMerge}
              disabled={!config.enabled || intensity === 'badge'}
              onClick={() => void update({ completeMerge: !config.completeMerge })}
            />
          </Field>
        </>
      )}
    </div>
  )
}
