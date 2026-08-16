import { useCallback, useEffect, useState, type ReactElement } from 'react'
import { TIME_PATTERN, createDefaultConfig, type NotifyConfig, type SoundId } from '../config.ts'
import { fetchNotifyConfig, patchNotifyConfig, previewNotifySound, type SoundOption } from './api.ts'
import { installNotifyStyles } from './styles.ts'

const FALLBACK_SOUNDS: SoundOption[] = [
  { id: 'soft', label: '柔和（默认）', desc: '低音双击，短促但不刺耳' },
  { id: 'brisk', label: '轻快', desc: '三连上行，提醒更醒目' },
  { id: 'calm', label: '舒缓', desc: '低八度长音，适合长时间挂机' },
  { id: 'crisp', label: '清脆', desc: '高音短促，适合嘈杂环境' },
]

function SwitchRow(props: {
  label: string
  hint?: string
  checked: boolean
  onToggle: () => void
}): ReactElement {
  return (
    <div className="dsh-nt-field">
      <div className="dsh-nt-copy">
        <div className="dsh-nt-label">{props.label}</div>
        {props.hint ? <p className="dsh-nt-hint">{props.hint}</p> : null}
      </div>
      <button
        type="button"
        className={props.checked ? 'dsh-nt-switch is-on' : 'dsh-nt-switch'}
        role="switch"
        aria-checked={props.checked}
        onClick={props.onToggle}
      />
    </div>
  )
}

export function NotifySection(): ReactElement {
  const [config, setConfig] = useState<NotifyConfig>(createDefaultConfig())
  const [sounds, setSounds] = useState<SoundOption[]>(FALLBACK_SOUNDS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [previewing, setPreviewing] = useState<SoundId | null>(null)

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

  const preview = useCallback(async (sound: SoundId) => {
    setError('')
    setPreviewing(sound)
    try {
      await previewNotifySound(sound)
    } catch (err) {
      setError(String((err as Error).message ?? err))
    } finally {
      setPreviewing(null)
    }
  }, [])

  return (
    <div className="dsh-nt">
      <h1>通知</h1>
      <p className="dsh-nt-intro">任务完成或需要你决策时，弹出系统通知、播放提示音，并在托盘显示待处理数量。修改后立即生效。</p>
      {error ? <div className="dsh-nt-error">{error}</div> : null}
      {loading ? <p className="dsh-nt-hint">加载中…</p> : (
        <>
          <SwitchRow
            label="启用通知"
            hint="关闭后不再弹出 Toast，也不再播放提示音。"
            checked={config.enabled}
            onToggle={() => void update({ enabled: !config.enabled })}
          />
          <SwitchRow
            label="播放提示音"
            checked={config.soundEnabled}
            onToggle={() => void update({ soundEnabled: !config.soundEnabled })}
          />

          <div className="dsh-nt-group">
            <div className="dsh-nt-group-title">提示音</div>
            <div className="dsh-nt-list">
              {sounds.map(sound => {
                const selected = sound.id === config.sound
                return (
                  <button
                    key={sound.id}
                    type="button"
                    className={selected ? 'dsh-nt-sound is-on' : 'dsh-nt-sound'}
                    onClick={() => void update({ sound: sound.id })}
                  >
                    <span className="dsh-nt-radio" />
                    <span className="dsh-nt-sound-text">
                      <span className="dsh-nt-label">{sound.label}</span>
                      <span className="dsh-nt-hint">{sound.desc}</span>
                    </span>
                    <span
                      className="dsh-nt-preview"
                      role="button"
                      aria-label={`试听${sound.label}`}
                      onClick={event => {
                        event.preventDefault()
                        event.stopPropagation()
                        void preview(sound.id)
                      }}
                    >
                      {previewing === sound.id ? '播放中' : '试听'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="dsh-nt-group">
            <div className="dsh-nt-group-title">打扰控制</div>
            <SwitchRow
              label="免打扰时段"
              hint="时段内只累计托盘角标，不弹窗、不响铃。"
              checked={config.quietHours.enabled}
              onToggle={() => void update({
                quietHours: { ...config.quietHours, enabled: !config.quietHours.enabled },
              })}
            />
            {config.quietHours.enabled ? (
              <div className="dsh-nt-times">
                <span className="dsh-nt-hint">开始</span>
                <input
                  defaultValue={config.quietHours.start}
                  onBlur={event => {
                    if (TIME_PATTERN.test(event.target.value)) {
                      void update({ quietHours: { ...config.quietHours, start: event.target.value } })
                    }
                  }}
                />
                <span className="dsh-nt-hint">结束</span>
                <input
                  defaultValue={config.quietHours.end}
                  onBlur={event => {
                    if (TIME_PATTERN.test(event.target.value)) {
                      void update({ quietHours: { ...config.quietHours, end: event.target.value } })
                    }
                  }}
                />
              </div>
            ) : null}
            <SwitchRow
              label="跟随系统勿扰"
              hint="Windows 专注助手开启时自动静音。"
              checked={config.respectSystemDnd}
              onToggle={() => void update({ respectSystemDnd: !config.respectSystemDnd })}
            />
          </div>

          <div className="dsh-nt-group">
            <div className="dsh-nt-group-title">任务完成</div>
            <div className="dsh-nt-mode">
              <button
                type="button"
                className={config.completeMode === 'toast' ? 'dsh-nt-choice is-on' : 'dsh-nt-choice'}
                onClick={() => void update({ completeMode: 'toast' })}
              >
                <span className="dsh-nt-radio" />
                <span className="dsh-nt-label">弹窗 + 提示音</span>
              </button>
              <button
                type="button"
                className={config.completeMode === 'badge-only' ? 'dsh-nt-choice is-on' : 'dsh-nt-choice'}
                onClick={() => void update({ completeMode: 'badge-only' })}
              >
                <span className="dsh-nt-radio" />
                <span className="dsh-nt-label">仅角标</span>
              </button>
            </div>
            <SwitchRow
              label="合并同类通知"
              hint="5 秒内的多次完成合并成一条摘要。"
              checked={config.completeMerge}
              onToggle={() => void update({ completeMerge: !config.completeMerge })}
            />
          </div>
        </>
      )}
    </div>
  )
}

