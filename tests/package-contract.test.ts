import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

test('package.json 声明双面插件契约', () => {
  const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
    name: string
    dsh?: { bundle?: { patch?: string }; client?: { platform?: string } }
    exports?: Record<string, unknown>
  }
  assert.equal(pkg.name, '@michengai/dsh-notify')
  assert.equal(pkg.dsh?.bundle?.patch, './cordis.patch.yml')
  assert.equal(pkg.dsh?.client?.platform, 'web')
  assert.ok(pkg.exports?.['./client'])
  assert.ok(pkg.exports?.['./cordis.patch.yml'])
})

test('bundle 补丁插入本包', () => {
  const text = readFileSync(path.join(ROOT, 'cordis.patch.yml'), 'utf8')
  assert.match(text, /id: dsh-notify/)
  assert.match(text, /name: '@michengai\/dsh-notify'/)
})

test('提示音为自制 RIFF/WAVE', () => {
  for (const name of ['notify-soft.wav', 'notify-brisk.wav', 'notify-calm.wav', 'notify-crisp.wav']) {
    const bytes = readFileSync(path.join(ROOT, 'assets', name))
    assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF')
    assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WAVE')
  }
})

test('PowerShell 脚本带 UTF-8 BOM', () => {
  for (const rel of ['scripts/toast.ps1', 'scripts/tray.ps1', 'scripts/play.ps1', 'scripts/install.ps1', 'scripts/uninstall.ps1', 'install.ps1', 'uninstall.ps1']) {
    const bytes = readFileSync(path.join(ROOT, rel))
    assert.equal(bytes[0], 0xef)
    assert.equal(bytes[1], 0xbb)
    assert.equal(bytes[2], 0xbf)
  }
})

test('交接文档存在', () => {
  assert.equal(existsSync(path.join(ROOT, 'docs', '00-交接入口', '00-阅读导航.md')), true)
  assert.equal(existsSync(path.join(ROOT, 'docs', '01-当前工作', 'I001-插件初始化', '00-迭代总览.md')), true)
})

