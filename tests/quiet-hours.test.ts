import assert from 'node:assert/strict'
import test from 'node:test'
import { isInQuietHours } from '../src/notify/quiet-hours.ts'

test('未开启时永不命中', () => {
  const now = new Date('2026-08-16T23:00:00')
  assert.equal(isInQuietHours({ enabled: false, start: '22:00', end: '08:00' }, now), false)
})

test('同一天窗口', () => {
  const now = new Date('2026-08-16T13:00:00')
  assert.equal(isInQuietHours({ enabled: true, start: '12:00', end: '14:00' }, now), true)
  assert.equal(isInQuietHours({ enabled: true, start: '12:00', end: '14:00' }, new Date('2026-08-16T15:00:00')), false)
})

test('跨午夜窗口', () => {
  assert.equal(isInQuietHours({ enabled: true, start: '22:00', end: '08:00' }, new Date('2026-08-16T23:30:00')), true)
  assert.equal(isInQuietHours({ enabled: true, start: '22:00', end: '08:00' }, new Date('2026-08-16T07:30:00')), true)
  assert.equal(isInQuietHours({ enabled: true, start: '22:00', end: '08:00' }, new Date('2026-08-16T10:00:00')), false)
})

test('起止相同视为未设置', () => {
  assert.equal(isInQuietHours({ enabled: true, start: '08:00', end: '08:00' }, new Date('2026-08-16T08:00:00')), false)
})
