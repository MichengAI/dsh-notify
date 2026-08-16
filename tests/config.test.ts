import assert from 'node:assert/strict'
import test from 'node:test'
import { createDefaultConfig, mergeConfig, normalizeConfig } from '../src/config.ts'

test('默认配置形状稳定', () => {
  const config = createDefaultConfig()
  assert.equal(config.enabled, true)
  assert.equal(config.completeMode, 'toast')
  assert.equal(config.quietHours.start, '22:00')
})

test('非法字段回落到默认值', () => {
  const config = normalizeConfig({
    completeMode: 'popup',
    quietHours: { enabled: true, start: '25:00', end: '08:00' },
    extra: 1,
  })
  assert.equal(config.completeMode, 'toast')
  assert.equal(config.quietHours.start, '22:00')
  assert.equal(config.quietHours.enabled, true)
})

test('patch 合并后仍经过规范化', () => {
  const next = mergeConfig(createDefaultConfig(), { enabled: false })
  assert.equal(next.enabled, false)
})

test('非法 patch 直接抛错', () => {
  assert.throws(() => mergeConfig(createDefaultConfig(), null), /patch/)
})
