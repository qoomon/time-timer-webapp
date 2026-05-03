import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AlarmListSidebar } from './AlarmListSidebar'
import type { Alarm } from '../../types'

const noop = vi.fn()

const alarm: Alarm = {
  id: '1',
  label: 'Stand-up',
  targetTime: Date.now() + 3600000,
  sound: 'digital',
  active: true,
  createdAt: Date.now(),
}

describe('AlarmListSidebar', () => {
  it('renders empty state when no alarms', () => {
    render(
      <AlarmListSidebar
        alarms={[]}
        open={true}
        onClose={noop}
        onToggleActive={noop}
        onDelete={noop}
        onLabelChange={noop}
      />
    )
    expect(screen.getByText('No alarms set')).toBeInTheDocument()
  })

  it('renders alarm rows', () => {
    render(
      <AlarmListSidebar
        alarms={[alarm]}
        open={true}
        onClose={noop}
        onToggleActive={noop}
        onDelete={noop}
        onLabelChange={noop}
      />
    )
    expect(screen.getByText('Stand-up')).toBeInTheDocument()
  })

  it('does not apply open class when closed', () => {
    const { container } = render(
      <AlarmListSidebar
        alarms={[]}
        open={false}
        onClose={noop}
        onToggleActive={noop}
        onDelete={noop}
        onLabelChange={noop}
      />
    )
    expect(container.querySelector('aside')?.className).not.toContain('open')
  })
})
