import { createEmptyTrayState, readTrayState, writeTrayState, type TrayState } from './tray-state.ts'
import { isEmptyTrayState, notifyDomainSpec, parseTrayState } from '../domain.ts'

export interface NotifyStore {
  read(): TrayState
  write(state: TrayState): Promise<void>
  close(): Promise<void>
}

interface DomainGlobalHandle {
  get(): unknown
  set(value: unknown): Promise<void>
}

interface DomainHandle {
  readonly global?: DomainGlobalHandle
  close(): Promise<void>
}

export interface StorageDomainLike {
  open(spec: unknown): Promise<DomainHandle>
}

export async function openNotifyStore(options: {
  stateDir: string
  storageDomain?: StorageDomainLike
  logger?: { info?(message: string): void; warn(message: string): void }
}): Promise<NotifyStore> {
  const fileState = readTrayState(options.stateDir)
  if (options.storageDomain === undefined) {
    return createFileStore(options.stateDir, fileState)
  }

  try {
    const domain = await options.storageDomain.open(notifyDomainSpec)
    const global = domain.global
    if (global === undefined) {
      options.logger?.warn('领域存储没有 global，回退到本地文件')
      await domain.close().catch(() => undefined)
      return createFileStore(options.stateDir, fileState)
    }

    let cache = parseTrayState(global.get())
    if (isEmptyTrayState(cache) && !isEmptyTrayState(fileState)) {
      cache = fileState
      await global.set(cache)
      options.logger?.info?.('已把旧的 tray-state.json 迁入 ctx.storageDomain')
    } else {
      writeTrayState(options.stateDir, cache)
    }
    return createDomainStore(options.stateDir, domain, global, cache, options.logger)
  } catch (error) {
    options.logger?.warn(`打开领域存储失败，回退到本地文件：${String((error as Error).message ?? error)}`)
    return createFileStore(options.stateDir, fileState)
  }
}

function createFileStore(stateDir: string, initial: TrayState): NotifyStore {
  let cache = initial
  writeTrayState(stateDir, cache)
  return {
    read: () => cache,
    async write(state) {
      cache = parseTrayState(state)
      writeTrayState(stateDir, cache)
    },
    async close() {
      /* 文件存储无需关闭 */
    },
  }
}

function createDomainStore(
  stateDir: string,
  domain: DomainHandle,
  global: DomainGlobalHandle,
  initial: TrayState,
  logger?: { warn(message: string): void },
): NotifyStore {
  let cache = initial
  let chain = Promise.resolve()
  return {
    read: () => cache,
    write(state) {
      cache = parseTrayState(state)
      writeTrayState(stateDir, cache)
      const job = chain.then(() => global.set(cache))
      chain = job.then(() => undefined, error => {
        logger?.warn(`领域存储写入失败：${String((error as Error).message ?? error)}`)
      })
      return job
    },
    async close() {
      await chain.catch(() => undefined)
      await domain.close()
    },
  }
}

export function emptyNotifyStore(): NotifyStore {
  return {
    read: () => createEmptyTrayState(),
    async write() {
      /* 测试占位 */
    },
    async close() {
      /* 测试占位 */
    },
  }
}
