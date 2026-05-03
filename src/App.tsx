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
  const { state, start, stop, set, setDirection, setAlarmSound } = useTimer(getInitialValue())
  const { alarms, addAlarm, toggleActive, deleteAlarm, updateLabel } = useAlarms()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'alarms' | 'set'>('alarms')
  const [previewMinutes, setPreviewMinutes] = useState<number | null>(null)

  const alarmsRef = useRef(alarms)
  alarmsRef.current = alarms

  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const active = alarmsRef.current.filter((a) => a.active && a.targetTime > now)
      if (active.length === 0) {
        setPreviewMinutes(null)
        return
      }
      const nearest = active.reduce((min, a) => (a.targetTime < min.targetTime ? a : min))
      const msInHour = (nearest.targetTime - now) % 3600000
      setPreviewMinutes(msInHour / 60000)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [alarms])

  const timerMode: TimerMode = previewMinutes !== null ? 'alarm-preview' : 'timer'

  const handleDragStart = useCallback(() => stop(), [stop])
  const handleDragEnd = useCallback(() => start(), [start])

  const handleToggleDirection = useCallback(() => {
    setDirection(state.direction === 'countdown' ? 'countup' : 'countdown')
  }, [state.direction, setDirection])

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
        <TimerDial
          state={state}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onSet={set}
          mode={timerMode}
          previewMinutes={previewMinutes ?? undefined}
        />
        <div className={styles.footer}>
          <Controls
            direction={state.direction as TimerDirection}
            alarmSound={state.alarmSound}
            onToggleDirection={handleToggleDirection}
            onSetAlarmSound={handleSetAlarmSound}
            onOpenAlarmList={handleOpenAlarmList}
            onOpenAlarmSet={handleOpenAlarmSet}
          />
        </div>
      </div>
    </div>
  )
}
