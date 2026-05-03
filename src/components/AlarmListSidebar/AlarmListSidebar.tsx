import { useCallback, useRef, useState } from 'react'
import type { Alarm } from '../../types'
import { formatRemaining, isTomorrow } from '../../hooks/useAlarms'
import styles from './AlarmListSidebar.module.css'

interface AlarmListSidebarProps {
  alarms: Alarm[]
  open: boolean
  onClose: () => void
  onToggleActive: (id: string) => void
  onDelete: (id: string) => void
  onLabelChange: (id: string, label: string) => void
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

interface AlarmRowProps {
  alarm: Alarm
  onToggleActive: (id: string) => void
  onDelete: (id: string) => void
  onLabelChange: (id: string, label: string) => void
}

function AlarmRow({ alarm, onToggleActive, onDelete, onLabelChange }: AlarmRowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(alarm.label)
  const [shaking, setShaking] = useState(false)
  const deleteClickedRef = useRef(false)

  const handleLabelBlur = useCallback(() => {
    setEditing(false)
    if (draft !== alarm.label) onLabelChange(alarm.id, draft)
  }, [alarm.id, alarm.label, draft, onLabelChange])

  const handleDelete = useCallback(() => {
    deleteClickedRef.current = true
    setShaking(true)
    setTimeout(() => {
      setShaking(false)
      onDelete(alarm.id)
    }, 400)
  }, [alarm.id, onDelete])

  const remaining = isTomorrow(alarm.targetTime) ? 'tomorrow' : formatRemaining(alarm.targetTime)

  return (
    <div className={`${styles.row} ${shaking ? styles.shake : ''}`}>
      <span
        className={styles.dot}
        style={{
          color: alarm.active ? 'var(--color-alarm-active)' : 'var(--color-alarm-inactive)',
        }}
      >
        {alarm.active ? '●' : '○'}
      </span>

      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.time}>{formatTime(alarm.targetTime)}</span>
          <span className={styles.remaining}>{remaining}</span>
        </div>
        {editing ? (
          <input
            className={styles.labelInput}
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleLabelBlur}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          />
        ) : (
          <span
            className={`${styles.label} ${!alarm.label ? styles.labelEmpty : ''}`}
            onClick={() => {
              setDraft(alarm.label)
              setEditing(true)
            }}
          >
            {alarm.label || 'No label'}
          </span>
        )}
      </div>

      <div className={styles.rowActions}>
        <button
          className={styles.actionBtn}
          onClick={() => onToggleActive(alarm.id)}
          aria-label={alarm.active ? 'Mute alarm' : 'Unmute alarm'}
          title={alarm.active ? 'Mute' : 'Unmute'}
        >
          {alarm.active ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          )}
        </button>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={handleDelete}
          aria-label="Delete alarm"
          title="Delete"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function AlarmListSidebar({
  alarms,
  open,
  onClose,
  onToggleActive,
  onDelete,
  onLabelChange,
}: AlarmListSidebarProps) {
  const sorted = [...alarms].sort((a, b) => a.targetTime - b.targetTime)

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-label="Alarms list">
      <div className={styles.header}>
        <span className={styles.title}>Alarms</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close alarms">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className={styles.list}>
        {sorted.length === 0 ? (
          <p className={styles.empty}>No alarms set</p>
        ) : (
          sorted.map((alarm) => (
            <AlarmRow
              key={alarm.id}
              alarm={alarm}
              onToggleActive={onToggleActive}
              onDelete={onDelete}
              onLabelChange={onLabelChange}
            />
          ))
        )}
      </div>
    </aside>
  )
}
