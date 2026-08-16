import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { isEmptyTrayState, notifyDomainSpec, parseTrayState } from '../src/domain.ts'
import { openNotifyStore } from '../src/notify/store.ts'
import { createEmptyTrayState } from '../src/notify/tray-state.ts'

test('领域名符合官方 unit 规则', () => {
  assert.match(notifyDomainSpec.name, /^[a-z][a-z0-9_]*$/)
  assert.equal(notifyDomainSpec.version, 1)
})

test('非法领域快照会回落成空状态', () => {
  assert.deepEqual(parseTrayState(null), createEmptyTrayState())
  assert.deepEqual(parseTrayState({ pending: -1, completed: [] }), createEmptyTrayState())
})

test('空状态判定', () => {
  assert.equal(isEmptyTrayState(createEmptyTrayState()), true)
  assert.equal(isEmptyTrayState({ pending: 1, completed: [] }), false)
})

test('没有领域服务时回退到本地文件', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'dsh-notify-'))
  try {
    const store = await openNotifyStore({ stateDir: dir })
    await store.write({ pending: 2, completed: [{ sessionId: 'session-1', title: '标题' }] })
    const saved = JSON.parse(readFileSync(path.join(dir, 'tray-state.json'), 'utf8')) as { pending: number }
    assert.equal(saved.pending, 2)
    assert.equal(store.read().completed[0]?.sessionId, 'session-1')
    await store.close()
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('领域为空时会迁入旧的 tray-state.json', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'dsh-notify-'))
  try {
    writeFileSync(path.join(dir, 'tray-state.json'), '{"pending":3,"completed":[{"sessionId":"session-old","title":"旧"}]}\n', 'utf8')
    let stored: unknown = { pending: 0, completed: [] }
    const store = await openNotifyStore({
      stateDir: dir,
      storageDomain: {
        async open() {
          return {
            global: {
              get: () => stored,
              async set(value) { stored = value },
            },
            async close() { /* 测试 */ },
          }
        },
      },
    })
    assert.equal(store.read().pending, 3)
    assert.equal(store.read().completed[0]?.sessionId, 'session-old')
    assert.equal((stored as { pending: number }).pending, 3)
    await store.close()
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
