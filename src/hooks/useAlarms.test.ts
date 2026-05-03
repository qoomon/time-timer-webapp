import { describe, expect, it } from 'vitest'
import { formatRemaining, hoursRingValue, isTomorrow, resolveTargetTime } from './useAlarms'

describe('resolveTargetTime', () => {
  it('returns a future timestamp for a time that has not yet passed today', () => {
    const future = new Date()
    future.setHours(future.getHours() + 2)
    const ts = resolveTargetTime(future.getHours(), future.getMinutes())
    expect(ts).toBeGreaterThan(Date.now())
  })

  it('rolls over to tomorrow when time has already passed', () => {
    const past = new Date()
    past.setHours(past.getHours() - 1)
    const ts = resolveTargetTime(past.getHours(), past.getMinutes())
    const target = new Date(ts)
    const now = new Date()
    expect(target.getDate()).not.toBe(now.getDate())
  })
})

describe('isTomorrow', () => {
  it('returns false for a time later today', () => {
    const future = new Date()
    future.setHours(future.getHours() + 1)
    const ts = resolveTargetTime(future.getHours(), future.getMinutes())
    expect(isTomorrow(ts)).toBe(false)
  })
})

describe('formatRemaining', () => {
  it('formats hours and minutes', () => {
    const ts = Date.now() + 2 * 3600000 + 30 * 60000
    expect(formatRemaining(ts)).toBe('in 2h 30m')
  })

  it('formats minutes only when less than one hour', () => {
    const ts = Date.now() + 45 * 60000
    expect(formatRemaining(ts)).toBe('in 45m')
  })

  it('returns "now" for past timestamps', () => {
    expect(formatRemaining(Date.now() - 1000)).toBe('now')
  })
})

describe('hoursRingValue', () => {
  it('returns 0 for past timestamps', () => {
    expect(hoursRingValue(Date.now() - 1000)).toBe(0)
  })

  it('returns ~0.5 for 6 hours from now', () => {
    const ts = Date.now() + 6 * 3600000
    expect(hoursRingValue(ts)).toBeCloseTo(0.5, 1)
  })

  it('caps at 1 for 12+ hours', () => {
    const ts = Date.now() + 24 * 3600000
    expect(hoursRingValue(ts)).toBe(1)
  })
})
