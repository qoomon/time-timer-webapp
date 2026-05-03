import type { AlarmSound, TimerDirection } from '../../types'
import styles from './Controls.module.css'

interface ControlsProps {
  direction: TimerDirection
  alarmSound: AlarmSound
  onToggleDirection: () => void
  onSetAlarmSound: (sound: AlarmSound) => void
  onOpenAlarmList: () => void
  onOpenAlarmSet: () => void
  dialMode?: 'timer' | 'alarm'
  hasActiveAlarm?: boolean
  onToggleDialMode?: () => void
}

export function Controls({
  direction,
  alarmSound,
  onToggleDirection,
  onSetAlarmSound,
  onOpenAlarmList,
  onOpenAlarmSet,
  dialMode,
  hasActiveAlarm,
  onToggleDialMode,
}: ControlsProps) {
  return (
    <div className={styles.controls}>
      <button
        className={styles.iconButton}
        onClick={onOpenAlarmList}
        aria-label="Open alarms list"
        title="Alarms"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>

      <button
        className={`${styles.iconButton} ${direction === 'countup' ? styles.countupActive : ''}`}
        onClick={onToggleDirection}
        aria-label={
          direction === 'countdown'
            ? 'Counting down — switch to countup'
            : 'Counting up — switch to countdown'
        }
        title={direction === 'countdown' ? 'Countdown ↺' : 'Countup ↻'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {direction === 'countdown' ? (
            /* rotate-ccw: arc shrinking = counting down */
            <>
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4" />
            </>
          ) : (
            /* rotate-cw: arc growing = counting up */
            <>
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15A9 9 0 1 1 23 6" />
            </>
          )}
        </svg>
      </button>

      <div className={styles.dropdown}>
        <button className={styles.iconButton} aria-label="Alarm sound" title="Alarm sound">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <div className={styles.dropdownMenu}>
          {(['digital', 'soft'] as AlarmSound[]).map((s) => (
            <button
              key={s}
              className={`${styles.dropdownItem} ${alarmSound === s ? styles.active : ''}`}
              onClick={() => onSetAlarmSound(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {hasActiveAlarm && (
        <button
          className={`${styles.iconButton} ${dialMode === 'alarm' ? styles.alarmMode : ''}`}
          onClick={onToggleDialMode}
          aria-label={dialMode === 'alarm' ? 'Switch to timer mode' : 'Switch to alarm countdown'}
          title={dialMode === 'alarm' ? 'Timer mode' : 'Alarm countdown'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            {dialMode !== 'alarm' && <line x1="1" y1="1" x2="23" y2="23" />}
          </svg>
        </button>
      )}

      <button
        className={styles.iconButton}
        onClick={onOpenAlarmSet}
        aria-label="Set new alarm"
        title="Set alarm"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
          <line x1="12" y1="3" x2="12" y2="1" />
          <line x1="18.5" y1="5.5" x2="20" y2="4" />
          <line x1="5.5" y1="5.5" x2="4" y2="4" />
        </svg>
      </button>
    </div>
  )
}
