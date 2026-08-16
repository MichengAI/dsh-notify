import assert from 'node:assert/strict'
import test from 'node:test'
import { createDefaultConfig, mergeConfig, normalizeConfig } from '../src/config.ts'

test('默认配置形状稳定', () => {
  const config = createDefaultConfig()
  assert.equal(config.channels.complete, 'always')
  assert.equal(config.completeMerge, true)
  assert.equal('quietHours' in config, false)
})

test('非法字段和已下线安静时段都会被丢掉', () => {
  const config = normalizeConfig({
    quietHours: { enabled: true, start: '22:00', end: '08:00' },
    extra: 1,
  })
  assert.equal('quietHours' in config, false)
  assert.equal(config.channels.complete, 'always')
})

test('patch 合并后仍经过规范化', () => {
  const next = mergeConfig(createDefaultConfig(), { completeMerge: false })
  assert.equal(next.completeMerge, false)
  assert.equal(next.channels.complete, 'always')
})

test('非法 patch 直接抛错', () => {
  assert.throws(() => mergeConfig(createDefaultConfig(), null), /patch/)
})
