import { appendFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import {
  COMPLETE_MERGE_MS,
  isNotifyDisabledByEnv,
  normalizeConfig,
  readMinIntervalMs,
  type NotifyConfig,
} from '../config.ts'
import { resolveScriptsDir } from '../paths.ts'
import { spawnHiddenPowerShell } from './powershell.ts'
import { isInQuietHours } from './quiet-hours.ts'
import {
  addCompletedItem,
  readTrayState,
  shiftPending,
  trayStatePath,
  writeTrayState,
} from './tray-state.ts'

export interface NotifyEngineOptions {
  stateDir: string
  portProvider: () => number
  configProvider: () => NotifyConfig
  logger?: { info(message: string): void; warn(message: string): void }
}

export interface ToastRequest {
  title?: string
  message?: string
  detail?: string
  ignoreQuiet?: boolean
}

interface CompleteBufferItem {
  itemTitle: string
  line2: string
  line3: string
}

export interface NotifyEngine {
  showToast(request?: ToastRequest): void
  notifyComplete(itemTitle: string, line2: string, line3: string): void
  updatePending(delta: number): void
  markCompleted(sessionId: string, title: string): void
  setFocused(focused: boolean): void
  isFocused(): boolean
}

export function createNotifyEngine(options: NotifyEngineOptions): NotifyEngine {
  const toastScript = path.join(resolveScriptsDir(), 'toast.ps1')
  const trayScript = path.join(resolveScriptsDir(), 'tray.ps1')
  const logFile = path.join(options.stateDir, 'debug.log')
  const minIntervalMs = readMinIntervalMs()
  let lastToastAt = 0
  let focused = true
  let trayStarted = false
  let completeBuffer: CompleteBufferItem[] = []
  let completeTimer: ReturnType<typeof setTimeout> | null = null

  const writeLog = (message: string): void => {
    try {
      mkdirSync(options.stateDir, { recursive: true })
      appendFileSync(logFile, `${new Date().toISOString()} ${message}\n`, 'utf8')
    } catch {
      /* 调试日志失败不影响主流程 */
    }
  }

  const warn = (message: string): void => {
    writeLog(message)
    options.logger?.warn(message)
  }

  const persist = (mutator: (state: ReturnType<typeof readTrayState>) => ReturnType<typeof readTrayState>): void => {
    writeTrayState(options.stateDir, mutator(readTrayState(options.stateDir)))
  }

  const ensureTray = (): void => {
    if (process.platform !== 'win32' || trayStarted) return
    trayStarted = true
    try {
      mkdirSync(options.stateDir, { recursive: true })
      const port = options.portProvider()
      const child = spawnHiddenPowerShell(trayScript, {
        stateFile: trayStatePath(options.stateDir),
        port,
        url: `http://127.0.0.1:${port}`,
        lockFile: path.join(options.stateDir, `tray-${port}.lock`),
      })
      child.once('error', error => {
        trayStarted = false
        warn(`托盘启动失败：${String((error as Error).message ?? error)}`)
      })
      writeLog(`tray spawn pid=${child.pid ?? '?'} port=${port}`)
    } catch (error) {
      trayStarted = false
      warn(`托盘启动异常：${String((error as Error).message ?? error)}`)
    }
  }

  const showToast = (request: ToastRequest = {}): void => {
    if (process.platform !== 'win32' || isNotifyDisabledByEnv()) return
    const config = normalizeConfig(options.configProvider())
    ensureTray()
    const now = Date.now()
    if (now - lastToastAt < minIntervalMs) return
    lastToastAt = now
    const quiet = !request.ignoreQuiet && isInQuietHours(config.quietHours)
    if (quiet) return
    if (!existsSync(toastScript)) {
      throw new Error(`找不到 Toast 脚本：${toastScript}`)
    }
    try {
      const child = spawnHiddenPowerShell(toastScript, {
        line1: String(request.title ?? 'DeepSeek Harness').slice(0, 200),
        line2: String(request.message ?? '').slice(0, 300),
        line3: request.detail ? String(request.detail).slice(0, 300) : '',
        mute: false,
        respectSystemDnd: config.respectSystemDnd,
        logFile,
      })
      child.once('error', error => writeLog(`toast spawn error: ${String((error as Error).message ?? error)}`))
      writeLog(`toast spawn ok pid=${child.pid ?? '?'}`)
    } catch (error) {
      warn(`Toast 发送失败：${String((error as Error).message ?? error)}`)
      throw error
    }
  }

  const flushComplete = (): void => {
    completeTimer = null
    const items = completeBuffer.splice(0)
    if (items.length === 0) return
    if (items.length === 1) {
      const only = items[0]
      if (only === undefined) return
      showToast({ title: 'DSH 任务完成', message: only.line2, detail: only.line3 })
      return
    }
    const titles = items.map(item => item.itemTitle).filter(title => title !== '')
    showToast({
      title: `DSH 任务完成（${items.length}）`,
      message: `${items.length} 个任务已完成`,
      detail: titles.length > 0 ? titles.join(' / ').slice(0, 160) : '回到界面查看结果',
    })
  }

  const notifyComplete = (itemTitle: string, line2: string, line3: string): void => {
    const config = normalizeConfig(options.configProvider())
    if (!config.completeMerge) {
      showToast({ title: 'DSH 任务完成', message: line2, detail: line3 })
      return
    }
    completeBuffer.push({ itemTitle, line2, line3 })
    if (completeBuffer.length > 20) completeBuffer = completeBuffer.slice(-20)
    if (completeTimer !== null) clearTimeout(completeTimer)
    completeTimer = setTimeout(flushComplete, COMPLETE_MERGE_MS)
  }

  return {
    showToast,
    notifyComplete,
    updatePending(delta) {
      persist(state => shiftPending(state, delta))
      ensureTray()
    },
    markCompleted(sessionId, title) {
      persist(state => addCompletedItem(state, sessionId, title))
      ensureTray()
    },
    setFocused(next) {
      focused = next
      writeLog(next ? 'focus=true' : 'focus=false')
    },
    isFocused() {
      return focused
    },
  }
}

