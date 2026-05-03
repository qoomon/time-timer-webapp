import { describe, expect, it } from 'vitest'
import { angleToValue, describePie, polarToCartesian, valueToAngle } from './geometry'

describe('valueToAngle / angleToValue', () => {
  it('round-trips', () => {
    expect(angleToValue(valueToAngle(0.75))).toBeCloseTo(0.75)
    expect(valueToAngle(0)).toBe(0)
    expect(valueToAngle(1)).toBe(360)
  })
})

describe('polarToCartesian', () => {
  it('returns top center at 0 degrees', () => {
    const p = polarToCartesian(50, 50, 40, 0)
    expect(p.x).toBeCloseTo(50)
    expect(p.y).toBeCloseTo(10)
  })

  it('returns right center at 90 degrees', () => {
    const p = polarToCartesian(50, 50, 40, 90)
    expect(p.x).toBeCloseTo(90)
    expect(p.y).toBeCloseTo(50)
  })
})

describe('describePie', () => {
  it('returns a full-circle path for 360', () => {
    const d = describePie(50, 50, 40, 0, 360)
    expect(d).toContain('a')
  })

  it('returns a pie path that starts at center and closes', () => {
    const d = describePie(50, 50, 40, 0, 90)
    expect(d.startsWith('M 50 50')).toBe(true)
    expect(d).toContain('A')
    expect(d.endsWith('Z')).toBe(true)
  })
})
