import { useCallback, useEffect, useState } from 'react'
import type { Alarm, AlarmSound } from '../../types'
import { hoursRingValue, isTomorrow, resolveTargetTime } from '../../hooks/useAlarms'
import { describePie, polarToCartesian } from '../../utils/geometry'
import styles from './AlarmSetSidebar.module.css'

interface AlarmSetSidebarProps {
  open: boolean
  onClose: () => void
  onAddAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt'>) => void
  defaultSound: AlarmSound
  onPreviewMinutes: (minutes: number | null) => void
}

const RING_CX = 60
const RING_CY = 60
const RING_R = 48

function HoursRing({ targetTime }: { targetTime: number }) {
  const ringValue = hoursRingValue(targetTime)
  const angle = ringValue * 360
  const piePath = describePie(RING_CX, RING_CY, RING_R, 0, angle)
  const knob = polarToCartesian(RING_CX, RING_CY, RING_R, angle)

  const diffMs = Math.max(0, targetTime - Date.now())
  const totalMin = Math.floor(diffMs / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  const label = h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`

  return (
    <svg className={styles.ring} viewBox="0 0 120 120" aria-label="Hours remaining">
      <circle cx={RING_CX} cy={RING_CY} r={RING_R} fill="var(--color-track)" />
      {ringValue > 0 && <path d={piePath} fill="var(--color-arc)" />}
      <circle cx={RING_CX} cy={RING_CY} r="22" fill="var(--color-hole)" />
      <text
        x={RING_CX}
        y={RING_CY + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        className={styles.ringLabel}
      >
        {label}
      </text>
      {ringValue > 0 && ringValue < 1 && (
        <circle cx={knob.x} cy={knob.y} r="4" fill="var(--color-knob)" />
      )}
    </svg>
  )
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function AlarmSetSidebar({
  open,
  onClose,
  onAddAlarm,
  defaultSound,
  onPreviewMinutes,
}: AlarmSetSidebarProps) {
  const now = new Date()
  const [hour, setHour] = useState(now.getHours())
  const [minute, setMinute] = useState(now.getMinutes())
  const [label, setLabel] = useState('')
  const [sound, setSound] = useState<AlarmSound>(defaultSound)

  const targetTime = resolveTargetTime(hour, minute)
  const tomorrow = isTomorrow(targetTime)

  const diffMs = Math.max(0, targetTime - Date.now())
  const previewMinutes = Math.floor((diffMs % 3600000) / 60000)

  useEffect(() => {
    if (open) {
      onPreviewMinutes(previewMinutes)
    } else {
      onPreviewMinutes(null)
    }
  }, [open, previewMinutes, onPreviewMinutes])

  const handleAdd = useCallback(() => {
    onAddAlarm({ label, targetTime, sound, active: true })
    setLabel('')
    onClose()
  }, [label, targetTime, sound, onAddAlarm, onClose])

  const handleHour = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHour(Math.max(0, Math.min(23, Number(e.target.value))))
  }, [])

  const handleMinute = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMinute(Math.max(0, Math.min(59, Number(e.target.value))))
  }, [])

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-label="Set alarm">
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close set alarm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <span className={styles.title}>Set Alarm</span>
      </div>

      <div className={styles.body}>
        <div className={styles.ringWrap}>
          <HoursRing targetTime={targetTime} />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Time</label>
          <div className={styles.timeInputs}>
            <input
              className={styles.spinner}
              type="number"
              min={0}
              max={23}
              value={pad(hour)}
              onChange={handleHour}
              aria-label="Hour"
            />
            <span className={styles.timeSep}>:</span>
            <input
              className={styles.spinner}
              type="number"
              min={0}
              max={59}
              value={pad(minute)}
              onChange={handleMinute}
              aria-label="Minute"
            />
            {tomorrow && <span className={styles.tomorrowBadge}>tomorrow</span>}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="alarm-label">
            Label
          </label>
          <input
            id="alarm-label"
            className={styles.labelInput}
            type="text"
            placeholder="e.g. Stand-up"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={40}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Sound</label>
          <div className={styles.soundOptions}>
            {(['digital', 'soft'] as AlarmSound[]).map((s) => (
              <label key={s} className={styles.soundOption}>
                <input
                  type="radio"
                  name="alarm-sound"
                  value={s}
                  checked={sound === s}
                  onChange={() => setSound(s)}
                />
                <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <button className={styles.setBtn} onClick={handleAdd}>
          Set Alarm
        </button>
      </div>
    </aside>
  )
}
