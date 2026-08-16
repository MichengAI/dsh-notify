import { useCallback, useEffect, useState, type ReactElement } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { TIME_PATTERN, createDefaultConfig, type NotifyConfig, type SoundId } from '../config.ts'
import { fetchNotifyConfig, patchNotifyConfig, previewNotifySound, type SoundOption } from './api.ts'
import { styles } from './styles.ts'

const FALLBACK_SOUNDS: SoundOption[] = [
  { id: 'soft', label: '柔和（默认）', desc: '低音双击，短促但不刺耳' },
  { id: 'brisk', label: '轻快', desc: '三连上行，提醒更醒目' },
  { id: 'calm', label: '舒缓', desc: '低八度长音，适合长时间挂机' },
  { id: 'crisp', label: '清脆', desc: '高音短促，适合嘈杂环境' },
]

function SwitchRow(props: { label: string; hint?: string; checked: boolean; onToggle: () => void }): ReactElement {
  return (
    <div style={styles.card}>
      <div style={styles.cardText}>
        <div style={styles.label}>{props.label}</div>
        {props.hint ? <div style={styles.desc}>{props.hint}</div> : null}
      </div>
      <button
        type="button"
        style={props.checked ? styles.switch : { ...styles.switch, ...styles.switchOff }}
        onClick={props.onToggle}
        aria-pressed={props.checked}
      >
        <i style={props.checked ? styles.knob : { ...styles.knob, ...styles.knobOff }} />
      </button>
    </div>
  )
}

export function NotifySection(): ReactElement {
  const [config, setConfig] = useState<NotifyConfig>(createDefaultConfig())
  const [sounds, setSounds] = useState<SoundOption[]>(FALLBACK_SOUNDS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <div style={styles.root}>
      <p style={styles.hint}>任务完成或需要你决策时，弹出系统通知、播放提示音，并在托盘显示待处理数量。保存后立即生效。</p>
      {error ? <div style={styles.error}>{error}</div> : null}
      {loading ? <p style={styles.hint}>加载中…</p> : (
        <>
          <div style={styles.group}>
            <div style={styles.groupTitle}>总开关</div>
            <SwitchRow label="启用通知" checked={config.enabled} onToggle={() => void update({ enabled: !config.enabled })} />
          </div>
          <hr style={styles.divider} />
          <div style={styles.group}>
            <div style={styles.groupTitle}>提示音</div>
            <SwitchRow label="播放提示音" checked={config.soundEnabled} onToggle={() => void update({ soundEnabled: !config.soundEnabled })} />
            {sounds.map(sound => {
              const selected = sound.id === config.sound
              return (
                <div
                  key={sound.id}
                  style={selected ? { ...styles.row, ...styles.rowOn } : styles.row}
                  onClick={() => void update({ sound: sound.id })}
                >
                  <span style={selected ? { ...styles.radio, ...styles.radioOn } : styles.radio} />
                  <div style={styles.cardText}>
                    <div style={styles.label}>{sound.label}</div>
                    <div style={styles.desc}>{sound.desc}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={event => {
                      event.stopPropagation()
                      void previewNotifySound(sound.id as SoundId)
                    }}
                  >
                    试听
                  </Button>
                </div>
              )
            })}
          </div>
          <hr style={styles.divider} />
          <div style={styles.group}>
            <div style={styles.groupTitle}>打扰控制</div>
            <SwitchRow
              label="免打扰时段"
              hint="时段内只累计托盘角标，不弹窗、不响铃。"
              checked={config.quietHours.enabled}
              onToggle={() => void update({
                quietHours: { ...config.quietHours, enabled: !config.quietHours.enabled },
              })}
            />
            {config.quietHours.enabled ? (
              <div style={styles.timeRow}>
                <span style={styles.desc}>开始</span>
                <input
                  style={styles.timeInput}
                  defaultValue={config.quietHours.start}
                  onBlur={event => {
                    if (TIME_PATTERN.test(event.target.value)) {
                      void update({ quietHours: { ...config.quietHours, start: event.target.value } })
                    }
                  }}
                />
                <span style={styles.desc}>结束</span>
                <input
                  style={styles.timeInput}
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
          <hr style={styles.divider} />
          <div style={styles.group}>
            <div style={styles.groupTitle}>任务完成</div>
            <div
              style={config.completeMode === 'toast' ? { ...styles.row, ...styles.rowOn } : styles.row}
              onClick={() => void update({ completeMode: 'toast' })}
            >
              <span style={config.completeMode === 'toast' ? { ...styles.radio, ...styles.radioOn } : styles.radio} />
              <div style={styles.label}>弹窗 + 提示音</div>
            </div>
            <div
              style={config.completeMode === 'badge-only' ? { ...styles.row, ...styles.rowOn } : styles.row}
              onClick={() => void update({ completeMode: 'badge-only' })}
            >
              <span style={config.completeMode === 'badge-only' ? { ...styles.radio, ...styles.radioOn } : styles.radio} />
              <div style={styles.label}>仅角标</div>
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
