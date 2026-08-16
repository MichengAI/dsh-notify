import assert from 'node:assert/strict'
import test from 'node:test'
import { isGoalAutoContinuing, isRootAgent, readAssistantSnippet, readSessionTitle } from '../src/session.ts'
import { addCompletedItem, createEmptyTrayState, shiftPending } from '../src/notify/tray-state.ts'

test('优先读取 session/title 事件', () => {
  const title = readSessionTitle({
    title: '旧标题',
    events: [
      { type: 'session/title', data: { title: '中间标题' } },
      { type: 'session/title', data: { title: '最新标题' } },
    ],
  })
  assert.equal(title, '最新标题')
})

test('没有事件时回退会话标题', () => {
  assert.equal(readSessionTitle({ title: '仅标题' }), '仅标题')
})

test('提取最后一条助手文本并截断', () => {
  const snippet = readAssistantSnippet({
    events: [
      { type: 'assistant/message', data: { content: [{ type: 'text', text: 'aaaa bbbb cccc' }] } },
    ],
  }, 8)
  assert.equal(snippet, 'aaaa bbb…')
})

test('根代理判定在缺少服务时放行', () => {
  assert.equal(isRootAgent({ get: () => undefined }, {}), true)
})

test('武装态 goal 视为自动续跑', () => {
  const ctx = {
    get: () => ({
      get: () => ({ phase: 'active', activation: 'armed', roundsStarted: 0, maxGoalRounds: 3 }),
    }),
  }
  assert.equal(isGoalAutoContinuing(ctx, {}), true)
})

test('托盘状态按会话去重并限制数量', () => {
  let state = createEmptyTrayState()
  state = addCompletedItem(state, 's1', '一')
  state = addCompletedItem(state, 's1', '更新后的标题')
  state = shiftPending(state, 2)
  state = shiftPending(state, -5)
  assert.equal(state.completed.length, 1)
  assert.equal(state.completed[0]?.title, '更新后的标题')
  assert.equal(state.pending, 0)
})
