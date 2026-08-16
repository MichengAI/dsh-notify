import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** 源码在 src，打包后在 lib，上一级都是包根目录。 */
export const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function resolvePackageDir(...parts: string[]): string {
  return path.join(PACKAGE_ROOT, ...parts)
}

export function resolveAssetsDir(): string {
  return resolvePackageDir('assets')
}

export function resolveScriptsDir(): string {
  return resolvePackageDir('scripts')
}
