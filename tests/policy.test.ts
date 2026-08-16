import assert from 'node:assert/strict'
import test from 'node:test'
import { createDefaultConfig, mergeConfig, normalizeConfig } from '../src/config.ts'
import { classifyAsk, shouldNotifyAsk, shouldNotifyComplete } from '../src/policy.ts'

test('默认完成通知是仅在未聚焦时', () => {
  const config = createDefaultConfig()
  assert.equal(config.channels.complete, 'unfocused')
  assert.equal(config.channels.permission, true)
  assert.equal(config.channels.question, true)
})

test('旧的仅角标配置会落到关闭完成通知', () => {
  const config = normalizeConfig({ completeMode: 'badge-only' })
  assert.equal(config.channels.complete, 'off')
})

test('channels patch 不会丢掉其它类型', () => {
  const next = mergeConfig(createDefaultConfig(), { channels: { complete: 'always' } })
  assert.equal(next.channels.complete, 'always')
  assert.equal(next.channels.permission, true)
  assert.equal(next.channels.question, true)
})

test('计划审批归到权限，其余归到提问', () => {
  assert.equal(classifyAsk('plan-review'), 'permission')
  assert.equal(classifyAsk('tool-approval'), 'permission')
  assert.equal(classifyAsk('choice'), 'question')
  assert.equal(classifyAsk(undefined), 'question')
})

test('完成通知尊重聚焦状态', () => {
  const config = createDefaultConfig()
  assert.equal(shouldNotifyComplete(config, true), false)
  assert.equal(shouldNotifyComplete(config, false), true)
  config.channels.complete = 'always'
  assert.equal(shouldNotifyComplete(config, true), true)
  config.channels.complete = 'off'
  assert.equal(shouldNotifyComplete(config, false), false)
})

test('提问和权限可独立关闭', () => {
  const config = createDefaultConfig()
  config.channels.permission = false
  assert.equal(shouldNotifyAsk(config, 'permission'), false)
  assert.equal(shouldNotifyAsk(config, 'question'), true)
})
