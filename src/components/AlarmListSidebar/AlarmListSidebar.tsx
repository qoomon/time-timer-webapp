import { useCallback, useRef, useState } from 'react'
import type { Alarm, AlarmSound } from '../../types'
import { formatRemaining, isTomorrow, resolveTargetTime } from '../../hooks/useAlarms'
import { describePie } from '../../utils/geometry'
import styles from './AlarmListSidebar.module.css'

function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function pad(n: number) {
  return String(n).padStart(2, '0')
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

function MiniPie({ fraction }: { fraction: number }) {
  const CX = 20
  const CY = 20
  const R = 18
  const angle = Math.min(fraction, 1) * 360
  const path = describePie(CX, CY, R, 0, angle)
  return (
    <svg className={styles.miniPie} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx={CX} cy={CY} r={R} fill="var(--color-track)" />
      {fraction > 0 && <path d={path} fill="var(--color-arc)" />}
    </svg>
  )
}

function NPies({ targetTime }: { targetTime: number }) {
  const diffMs = Math.max(0, targetTime - Date.now())
  const fullHours = Math.min(Math.floor(diffMs / 3600000), 23)
  const partialFraction = (diffMs % 3600000) / 3600000

  const totalMin = Math.floor(diffMs / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  const label = h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`

  return (
    <div className={styles.npiesContainer}>
      <div className={styles.npiesGrid}>
        {Array.from({ length: fullHours }, (_, i) => (
          <MiniPie key={i} fraction={1} />
        ))}
        <MiniPie key="partial" fraction={partialFraction} />
      </div>
      {diffMs > 0 && <span className={styles.npiesLabel}>{label} remaining</span>}
    </div>
  )
}

interface SetAlarmFormProps {
  defaultSound: AlarmSound
  onAddAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt'>) => void
}

function SetAlarmForm({ defaultSound, onAddAlarm }: SetAlarmFormProps) {
  const now = new Date()
  const [hour, setHour] = useState(now.getHours())
  const [minute, setMinute] = useState(now.getMinutes())
  const [label, setLabel] = useState('')
  const [sound, setSound] = useState<AlarmSound>(defaultSound)

  const targetTime = resolveTargetTime(hour, minute)
  const tomorrow = isTomorrow(targetTime)

  const handleAdd = useCallback(() => {
    onAddAlarm({ label, targetTime, sound, active: true })
    setLabel('')
  }, [label, targetTime, sound, onAddAlarm])

  const handleHour = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHour(Math.max(0, Math.min(23, Number(e.target.value))))
  }, [])

  const handleMinute = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMinute(Math.max(0, Math.min(59, Number(e.target.value))))
  }, [])

  return (
    <div className={styles.setForm}>
      <NPies targetTime={targetTime} />

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
          className={styles.formInput}
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

      <button className={styles.setBtn} onClick={handleAdd} aria-label="Set Alarm">
        Set Alarm
      </button>
    </div>
  )
}

interface AlarmListSidebarProps {
  alarms: Alarm[]
  open: boolean
  activeTab?: 'alarms' | 'set'
  onClose: () => void
  onTabChange?: (tab: 'alarms' | 'set') => void
  onToggleActive: (id: string) => void
  onDelete: (id: string) => void
  onLabelChange: (id: string, label: string) => void
  onAddAlarm?: (alarm: Omit<Alarm, 'id' | 'createdAt'>) => void
  defaultSound?: AlarmSound
}

export function AlarmListSidebar({
  alarms,
  open,
  activeTab = 'alarms',
  onClose,
  onTabChange,
  onToggleActive,
  onDelete,
  onLabelChange,
  onAddAlarm,
  defaultSound = 'digital',
}: AlarmListSidebarProps) {
  const sorted = [...alarms].sort((a, b) => a.targetTime - b.targetTime)

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-label="Alarms">
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'alarms' ? styles.tabActive : ''}`}
            onClick={() => onTabChange?.('alarms')}
          >
            Alarms
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'set' ? styles.tabActive : ''}`}
            onClick={() => onTabChange?.('set')}
          >
            Set Alarm
          </button>
        </div>
      </div>

      {activeTab === 'alarms' ? (
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
      ) : (
        onAddAlarm && <SetAlarmForm defaultSound={defaultSound} onAddAlarm={onAddAlarm} />
      )}
    </aside>
  )
}
