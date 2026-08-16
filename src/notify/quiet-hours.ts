import type { QuietHoursConfig } from '../config.ts'

function toMinutes(hhmm: string): number {
  const [hoursText = '0', minutesText = '0'] = hhmm.split(':')
  return Number(hoursText) * 60 + Number(minutesText)
}

/** 判断当前时刻是否落在免打扰窗口内，支持跨午夜。 */
export function isInQuietHours(quietHours: QuietHoursConfig, now: Date = new Date()): boolean {
  if (!quietHours.enabled) return false
  const start = toMinutes(quietHours.start)
  const end = toMinutes(quietHours.end)
  if (!Number.isFinite(start) || !Number.isFinite(end) || start === end) return false
  const current = now.getHours() * 60 + now.getMinutes()
  return start < end
    ? current >= start && current < end
    : current >= start || current < end
}
