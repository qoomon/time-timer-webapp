import { useCallback } from 'react'
import type { AlarmSound, TimerDirection } from './types'
import { useTimer } from './hooks/useTimer'
import { TimerDial } from './components/TimerDial/TimerDial'
import { Controls } from './components/Controls/Controls'
import styles from './App.module.css'

function getInitialValue(): number {
  const params = new URLSearchParams(window.location.search)
  const seconds = parseInt(params.get('init') ?? '', 10)
  if (!isNaN(seconds)) return Math.max(0, Math.min(seconds / 3600, 1))
  return 600 / 3600
}

export default function App() {
  const { state, start, stop, set, setDirection, setAlarmSound } = useTimer(getInitialValue())

  const handleDragStart = useCallback(() => {
    stop()
  }, [stop])

  const handleDragEnd = useCallback(() => {
    start()
  }, [start])

  const handleToggleDirection = useCallback(() => {
    setDirection(state.direction === 'countdown' ? 'countup' : 'countdown')
  }, [state.direction, setDirection])

  const handleSetAlarmSound = useCallback(
    (sound: AlarmSound) => {
      setAlarmSound(sound)
    },
    [setAlarmSound]
  )

  return (
    <div className={styles.app}>
      <TimerDial
        state={state}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onSet={set}
      />
      <div className={styles.footer}>
        <Controls
          direction={state.direction as TimerDirection}
          alarmSound={state.alarmSound}
          onToggleDirection={handleToggleDirection}
          onSetAlarmSound={handleSetAlarmSound}
        />
      </div>
    </div>
  )
}
