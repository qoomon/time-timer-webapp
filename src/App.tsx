import { useCallback, useState } from 'react'
import type { Alarm, AlarmSound, TimerDirection, TimerMode } from './types'
import { useTimer } from './hooks/useTimer'
import { useAlarms } from './hooks/useAlarms'
import { TimerDial } from './components/TimerDial/TimerDial'
import { Controls } from './components/Controls/Controls'
import { AlarmListSidebar } from './components/AlarmListSidebar/AlarmListSidebar'
import { AlarmSetSidebar } from './components/AlarmSetSidebar/AlarmSetSidebar'
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

  const [alarmListOpen, setAlarmListOpen] = useState(false)
  const [alarmSetOpen, setAlarmSetOpen] = useState(false)
  const [previewMinutes, setPreviewMinutes] = useState<number | null>(null)

  const timerMode: TimerMode = alarmSetOpen ? 'alarm-preview' : 'timer'

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
      setAlarmListOpen(true)
    },
    [addAlarm]
  )

  const handlePreviewMinutes = useCallback((minutes: number | null) => {
    setPreviewMinutes(minutes)
  }, [])

  return (
    <div className={styles.layout}>
      <AlarmListSidebar
        alarms={alarms}
        open={alarmListOpen}
        onClose={() => setAlarmListOpen(false)}
        onToggleActive={toggleActive}
        onDelete={deleteAlarm}
        onLabelChange={updateLabel}
      />

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
            onOpenAlarmList={() => setAlarmListOpen((v) => !v)}
            onOpenAlarmSet={() => setAlarmSetOpen((v) => !v)}
          />
        </div>
      </div>

      <AlarmSetSidebar
        open={alarmSetOpen}
        onClose={() => setAlarmSetOpen(false)}
        onAddAlarm={handleAddAlarm}
        defaultSound={state.alarmSound}
        onPreviewMinutes={handlePreviewMinutes}
      />
    </div>
  )
}
