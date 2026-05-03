import { useCallback } from 'react'
import type { TimerMode, TimerState } from '../../types'
import { angleToValue, describePie, polarToCartesian, valueToAngle } from '../../utils/geometry'
import { usePointerDrag } from '../../hooks/usePointerDrag'
import styles from './TimerDial.module.css'

interface TimerDialProps {
  state: TimerState
  onDragStart: () => void
  onDragEnd: () => void
  onSet: (value: number) => void
  mode?: TimerMode
  previewMinutes?: number
  hoursRemaining?: number
}

const CX = 50
const CY = 50
const DISK_R = 45
const CENTER_R = 9
const KNOB_R = 3.8

function formatTime(value: number): string {
  const totalSeconds = Math.round(value * 3600)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function TimerDial({
  state,
  onDragStart,
  onDragEnd,
  onSet,
  mode = 'timer',
  previewMinutes,
  hoursRemaining,
}: TimerDialProps) {
  const isPreview = mode === 'alarm-preview'

  const displayValue = isPreview && previewMinutes !== undefined ? previewMinutes / 60 : state.value

  const angle = valueToAngle(displayValue)

  const handleDrag = useCallback(
    (rawAngle: number) => {
      onSet(angleToValue(rawAngle))
    },
    [onSet]
  )

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noopDrag = useCallback(() => {}, [])

  const { containerRef, pointerHandlers } = usePointerDrag({
    onDragStart: isPreview ? noopDrag : onDragStart,
    onDrag: isPreview ? noopDrag : handleDrag,
    onDragEnd: isPreview ? noopDrag : onDragEnd,
  })

  const piePath = describePie(CX, CY, DISK_R, 0, angle)
  const knob = polarToCartesian(CX, CY, DISK_R, angle)

  return (
    <svg
      ref={containerRef}
      className={styles.dial}
      viewBox="0 0 100 100"
      aria-label="Timer dial"
      {...pointerHandlers}
    >
      {/* outer disk background */}
      <circle
        cx={CX}
        cy={CY}
        r={DISK_R}
        fill="var(--color-track)"
        stroke="var(--color-disk-border)"
        strokeWidth="0.8"
      />

      {/* red pie wedge — remaining time */}
      {state.value > 0 && <path d={piePath} fill="var(--color-arc)" />}

      {/* 12 o'clock divider line */}
      <line
        x1={CX}
        y1={CY - CENTER_R}
        x2={CX}
        y2={CY - DISK_R}
        stroke="var(--color-bg)"
        strokeWidth="1.6"
      />

      {/* center hole */}
      <circle
        cx={CX}
        cy={CY}
        r={CENTER_R}
        fill="var(--color-hole)"
        stroke="var(--color-hole-border)"
        strokeWidth="0.6"
      />

      {/* center label — two lines in alarm mode when hours remain */}
      {isPreview && hoursRemaining !== undefined && hoursRemaining > 0 ? (
        <>
          <text
            x={CX}
            y={CY - 3}
            textAnchor="middle"
            dominantBaseline="middle"
            className={styles.timeText}
          >
            {formatTime(displayValue)}
          </text>
          <text
            x={CX}
            y={CY + 5}
            textAnchor="middle"
            dominantBaseline="middle"
            className={styles.hoursText}
          >
            +{hoursRemaining}h
          </text>
        </>
      ) : (
        <text
          x={CX}
          y={CY + 1.5}
          textAnchor="middle"
          dominantBaseline="middle"
          className={styles.timeText}
        >
          {formatTime(displayValue)}
        </text>
      )}

      {/* drag knob — sits on outer edge, hidden in preview mode */}
      {!isPreview && <circle cx={knob.x} cy={knob.y} r={KNOB_R} className={styles.knob} />}
    </svg>
  )
}
