import { useCallback, useState } from 'react'
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
// Invisible hit area extends a few units beyond the visual hole
const CENTER_HIT_R = 13
const KNOB_R = 3.8

function formatTime(value: number): string {
  const totalSeconds = Math.round(value * 3600)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function PauseIcon() {
  return (
    <>
      <rect x="46" y="45" width="3" height="10" rx="1" />
      <rect x="51" y="45" width="3" height="10" rx="1" />
    </>
  )
}

function PlayIcon() {
  return <polygon points="47,44.5 47,55.5 57,50" />
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

  const [centerHovered, setCenterHovered] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'play' | 'pause' | null>(null)
  const [feedbackKey, setFeedbackKey] = useState(0)

  const displayValue = isPreview && previewMinutes !== undefined ? previewMinutes / 60 : state.value
  const angle = valueToAngle(displayValue)
  const isCCW = state.direction === 'countup'

  const handleDrag = useCallback(
    (rawAngle: number) => {
      onSet(angleToValue(isCCW ? (360 - rawAngle + 360) % 360 : rawAngle))
    },
    [onSet, isCCW]
  )

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noopDrag = useCallback(() => {}, [])

  const { containerRef, pointerHandlers } = usePointerDrag({
    onDragStart: isPreview ? noopDrag : onDragStart,
    onDrag: isPreview ? noopDrag : handleDrag,
    onDragEnd: isPreview ? noopDrag : onDragEnd,
  })

  const handleCenterPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation()
  }, [])

  const handleCenterClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isPreview) return
      if (state.running) {
        onDragStart()
        setFeedbackType('pause')
      } else {
        onDragEnd()
        setFeedbackType('play')
      }
      setFeedbackKey((k) => k + 1)
    },
    [isPreview, state.running, onDragStart, onDragEnd]
  )

  const piePath = describePie(CX, CY, DISK_R, 0, angle, isCCW)
  const knob = polarToCartesian(CX, CY, DISK_R, isCCW ? -angle : angle)

  const showHoverIcon = centerHovered && !isPreview
  const hoverIconClass = `${styles.hoverIcon} ${showHoverIcon ? styles.hoverIconVisible : ''}`

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
            y={CY - 2.5}
            textAnchor="middle"
            dominantBaseline="central"
            className={styles.timeText}
          >
            {formatTime(displayValue)}
          </text>
          <text
            x={CX}
            y={CY + 4.5}
            textAnchor="middle"
            dominantBaseline="central"
            className={styles.hoursText}
          >
            +{hoursRemaining}h
          </text>
        </>
      ) : (
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="central"
          className={styles.timeText}
        >
          {formatTime(displayValue)}
        </text>
      )}

      {/* hover icon — pause when running, play when paused */}
      {!isPreview && (
        <g className={hoverIconClass}>{state.running ? <PauseIcon /> : <PlayIcon />}</g>
      )}

      {/* feedback flash — re-keyed on every click to restart animation */}
      {feedbackType !== null && (
        <g
          key={feedbackKey}
          className={styles.feedbackIcon}
          onAnimationEnd={() => setFeedbackType(null)}
        >
          {feedbackType === 'play' ? <PlayIcon /> : <PauseIcon />}
        </g>
      )}

      {/* drag knob — sits on outer edge, hidden in preview mode */}
      {!isPreview && <circle cx={knob.x} cy={knob.y} r={KNOB_R} className={styles.knob} />}

      {/* transparent center hit area — blocks drag, handles play/pause click */}
      {!isPreview && (
        <circle
          cx={CX}
          cy={CY}
          r={CENTER_HIT_R}
          className={styles.centerHitArea}
          onPointerDown={handleCenterPointerDown}
          onClick={handleCenterClick}
          onPointerEnter={() => setCenterHovered(true)}
          onPointerLeave={() => setCenterHovered(false)}
        />
      )}
    </svg>
  )
}
