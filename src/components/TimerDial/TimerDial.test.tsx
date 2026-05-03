import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimerDial } from './TimerDial'
import type { TimerState } from '../../types'

const noop = vi.fn()

const baseState: TimerState = {
  value: 0.5,
  running: false,
  direction: 'countdown',
  alarmSound: 'digital',
}

describe('TimerDial', () => {
  it('renders the dial svg', () => {
    render(<TimerDial state={baseState} onDragStart={noop} onDragEnd={noop} onSet={noop} />)
    expect(screen.getByLabelText('Timer dial')).toBeInTheDocument()
  })

  it('displays formatted time for value 0.5 (30 min)', () => {
    render(<TimerDial state={baseState} onDragStart={noop} onDragEnd={noop} onSet={noop} />)
    expect(screen.getByText('30:00')).toBeInTheDocument()
  })

  it('displays 00:00 when value is 0', () => {
    render(
      <TimerDial
        state={{ ...baseState, value: 0 }}
        onDragStart={noop}
        onDragEnd={noop}
        onSet={noop}
      />
    )
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })
})
