import { useCallback, useEffect, useRef, useState } from 'react'
import type { Alarm, AlarmSound, TimerDirection, TimerMode } from './types'
import { useTimer } from './hooks/useTimer'
import { useAlarms } from './hooks/useAlarms'
import { TimerDial } from './components/TimerDial/TimerDial'
import { Controls } from './components/Controls/Controls'
import { AlarmListSidebar } from './components/AlarmListSidebar/AlarmListSidebar'
import { AlarmPieQueue } from './components/AlarmPieQueue/AlarmPieQueue'
import styles from './App.module.css'

function getInitialValue(): number {
  const params = new URLSearchParams(window.location.search)
  const seconds = parseInt(params.get('init') ?? '', 10)
  if (!isNaN(seconds)) return Math.max(0, Math.min(seconds / 3600, 1))
  return 600 / 3600
}

export default function App() {
  const { state, start, stop, set, toggleDirection, setAlarmSound } = useTimer(getInitialValue())
  const { alarms, addAlarm, toggleActive, deleteAlarm, updateLabel } = useAlarms()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'alarms' | 'set'>('alarms')
  const [previewMinutes, setPreviewMinutes] = useState<number | null>(null)
  const [hoursRemaining, setHoursRemaining] = useState(0)
  const [dialMode, setDialMode] = useState<'timer' | 'alarm'>('timer')

  const alarmsRef = useRef(alarms)
  alarmsRef.current = alarms

  // Live alarm countdown — updates every second
  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const active = alarmsRef.current.filter((a) => a.active && a.targetTime > now)
      if (active.length === 0) {
        setPreviewMinutes(null)
        setHoursRemaining(0)
        return
      }
      const nearest = active.reduce((min, a) => (a.targetTime < min.targetTime ? a : min))
      const diffMs = nearest.targetTime - now
      setPreviewMinutes((diffMs % 3600000) / 60000)
      setHoursRemaining(Math.floor(diffMs / 3600000))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [alarms])

  // Auto-switch dial mode when alarm presence changes
  useEffect(() => {
    const hasActive = alarms.some((a) => a.active && a.targetTime > Date.now())
    setDialMode(hasActive ? 'alarm' : 'timer')
  }, [alarms])

  const hasActiveAlarm = previewMinutes !== null
  const timerMode: TimerMode = dialMode === 'alarm' && hasActiveAlarm ? 'alarm-preview' : 'timer'

  const handleDragStart = useCallback(() => stop(), [stop])
  const handleDragEnd = useCallback(() => start(), [start])

  const handleSetAlarmSound = useCallback(
    (sound: AlarmSound) => setAlarmSound(sound),
    [setAlarmSound]
  )

  const handleAddAlarm = useCallback(
    (alarm: Omit<Alarm, 'id' | 'createdAt'>) => {
      addAlarm(alarm)
      setSidebarTab('alarms')
    },
    [addAlarm]
  )

  const handleOpenAlarmList = useCallback(() => {
    setSidebarTab('alarms')
    setSidebarOpen(true)
  }, [])

  const handleOpenAlarmSet = useCallback(() => {
    setSidebarTab('set')
    setSidebarOpen(true)
  }, [])

  return (
    <div className={styles.layout}>
      <AlarmListSidebar
        alarms={alarms}
        open={sidebarOpen}
        activeTab={sidebarTab}
        onClose={() => setSidebarOpen(false)}
        onTabChange={setSidebarTab}
        onToggleActive={toggleActive}
        onDelete={deleteAlarm}
        onLabelChange={updateLabel}
        onAddAlarm={handleAddAlarm}
        defaultSound={state.alarmSound}
      />

      <AlarmPieQueue alarms={alarms} />

      <div className={styles.center}>
        {/* Top-center mode selector */}
        <div className={styles.modeRow}>
          <button
            className={`${styles.modeBtn} ${dialMode === 'alarm' ? styles.modeBtnAlarm : ''}`}
            onClick={() => setDialMode('alarm')}
            disabled={!hasActiveAlarm}
            title={hasActiveAlarm ? 'Show alarm countdown' : 'No active alarms'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Alarm
          </button>
          <button
            className={`${styles.modeBtn} ${dialMode === 'timer' ? styles.modeBtnTimer : ''}`}
            onClick={() => setDialMode('timer')}
            title="Countdown timer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Timer
          </button>
        </div>

        <TimerDial
          state={state}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onSet={set}
          mode={timerMode}
          previewMinutes={previewMinutes ?? undefined}
          hoursRemaining={timerMode === 'alarm-preview' ? hoursRemaining : undefined}
        />

        <div className={styles.footer}>
          <Controls
            direction={state.direction as TimerDirection}
            alarmSound={state.alarmSound}
            onToggleDirection={toggleDirection}
            onSetAlarmSound={handleSetAlarmSound}
            onOpenAlarmList={handleOpenAlarmList}
            onOpenAlarmSet={handleOpenAlarmSet}
          />
        </div>
      </div>
    </div>
  )
}
