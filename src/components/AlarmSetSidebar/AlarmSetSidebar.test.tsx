import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AlarmSetSidebar } from './AlarmSetSidebar'

const noop = vi.fn()

describe('AlarmSetSidebar', () => {
  it('renders the Set Alarm button', () => {
    render(
      <AlarmSetSidebar
        open={true}
        onClose={noop}
        onAddAlarm={noop}
        defaultSound="digital"
        onPreviewMinutes={noop}
      />
    )
    expect(screen.getByRole('button', { name: 'Set Alarm' })).toBeInTheDocument()
  })

  it('renders time spinners', () => {
    render(
      <AlarmSetSidebar
        open={true}
        onClose={noop}
        onAddAlarm={noop}
        defaultSound="digital"
        onPreviewMinutes={noop}
      />
    )
    expect(screen.getByLabelText('Hour')).toBeInTheDocument()
    expect(screen.getByLabelText('Minute')).toBeInTheDocument()
  })

  it('renders hours ring SVG', () => {
    render(
      <AlarmSetSidebar
        open={true}
        onClose={noop}
        onAddAlarm={noop}
        defaultSound="digital"
        onPreviewMinutes={noop}
      />
    )
    expect(screen.getByLabelText('Hours remaining')).toBeInTheDocument()
  })
})
