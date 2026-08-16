import assert from 'node:assert/strict'
import test from 'node:test'
import { intensityOf, patchFromIntensity } from '../src/client/intensity.ts'

test('角标强度对应仅角标模式', () => {
  assert.equal(intensityOf({ completeMode: 'badge-only', soundEnabled: true }), 'badge')
  assert.deepEqual(patchFromIntensity('badge'), { completeMode: 'badge-only', soundEnabled: false })
})

test('弹窗与完整提醒映射到 toast', () => {
  assert.equal(intensityOf({ completeMode: 'toast', soundEnabled: false }), 'banner')
  assert.equal(intensityOf({ completeMode: 'toast', soundEnabled: true }), 'full')
  assert.deepEqual(patchFromIntensity('banner'), { completeMode: 'toast', soundEnabled: false })
  assert.deepEqual(patchFromIntensity('full'), { completeMode: 'toast', soundEnabled: true })
})
