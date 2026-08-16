import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { PACKAGE_ROOT, resolveScriptsDir } from '../src/paths.ts'

test('包根目录能解析到脚本', () => {
  assert.equal(path.basename(PACKAGE_ROOT), 'dsh-notify')
  assert.equal(existsSync(path.join(resolveScriptsDir(), 'toast.ps1')), true)
  assert.equal(existsSync(path.join(resolveScriptsDir(), 'tray.ps1')), true)
})
