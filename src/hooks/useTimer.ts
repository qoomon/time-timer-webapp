import { useCallback, useEffect, useRef, useState } from 'react'
import type { AlarmSound, TimerDirection, TimerState } from '../types'
import { playAlarm } from '../utils/audio'
import { storage } from '../utils/storage'

const DURATION_S = 60 * 60

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function useTimer(initialValue: number) {
  const [state, setState] = useState<TimerState>({
    value: clamp(initialValue, 0, 1),
    running: false,
    direction: storage.get<TimerDirection>('direction', 'countdown'),
    alarmSound: storage.get<AlarmSound>('alarmSound', 'digital'),
  })

  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const cancelRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    lastTimeRef.current = null
  }, [])

  const tick = useCallback(
    (timestamp: number) => {
      const s = stateRef.current
      if (!s.running) return

      const delta = lastTimeRef.current !== null ? (timestamp - lastTimeRef.current) / 1000 : 0
      lastTimeRef.current = timestamp

      const step = delta / DURATION_S
      const next = s.direction === 'countdown' ? s.value - step : s.value + step

      if (s.direction === 'countdown' && next <= 0) {
        cancelRaf()
        setState((prev) => ({ ...prev, value: 0, running: false }))
        playAlarm(s.alarmSound)
        return
      }
      if (s.direction === 'countup' && next >= 1) {
        cancelRaf()
        setState((prev) => ({ ...prev, value: 1, running: false }))
        playAlarm(s.alarmSound)
        return
      }

      setState((prev) => ({ ...prev, value: clamp(next, 0, 1) }))
      rafRef.current = requestAnimationFrame(tick)
    },
    [cancelRaf]
  )

  const start = useCallback(() => {
    const s = stateRef.current
    const atEnd =
      (s.direction === 'countdown' && s.value <= 0) || (s.direction === 'countup' && s.value >= 1)
    if (atEnd) return
    cancelRaf()
    setState((prev) => ({ ...prev, running: true }))
    lastTimeRef.current = null
    rafRef.current = requestAnimationFrame(tick)
  }, [cancelRaf, tick])

  const stop = useCallback(() => {
    cancelRaf()
    setState((prev) => ({ ...prev, running: false }))
  }, [cancelRaf])

  const set = useCallback((value: number) => {
    setState((prev) => ({ ...prev, value: clamp(value, 0, 1) }))
  }, [])

  const setDirection = useCallback((direction: TimerDirection) => {
    storage.set('direction', direction)
    setState((prev) => ({ ...prev, direction }))
  }, [])

  const setAlarmSound = useCallback((alarmSound: AlarmSound) => {
    storage.set('alarmSound', alarmSound)
    setState((prev) => ({ ...prev, alarmSound }))
  }, [])

  useEffect(() => {
    return () => cancelRaf()
  }, [cancelRaf])

  return { state, start, stop, set, setDirection, setAlarmSound }
}
