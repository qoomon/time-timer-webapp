import { useCallback, useEffect, useRef, useState } from 'react'
import type { Alarm, AlarmSound } from '../types'
import { playAlarm } from '../utils/audio'
import { storage } from '../utils/storage'

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>(() => storage.get<Alarm[]>('alarms', []))

  const alarmsRef = useRef(alarms)
  alarmsRef.current = alarms

  const persist = useCallback((next: Alarm[]) => {
    storage.set('alarms', next)
    setAlarms(next)
  }, [])

  const addAlarm = useCallback(
    (alarm: Omit<Alarm, 'id' | 'createdAt'>) => {
      const next: Alarm = {
        ...alarm,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      }
      persist([...alarmsRef.current, next])
    },
    [persist]
  )

  const toggleActive = useCallback(
    (id: string) => {
      persist(alarmsRef.current.map((a) => (a.id === id ? { ...a, active: !a.active } : a)))
    },
    [persist]
  )

  const deleteAlarm = useCallback(
    (id: string) => {
      persist(alarmsRef.current.filter((a) => a.id !== id))
    },
    [persist]
  )

  const updateLabel = useCallback(
    (id: string, label: string) => {
      persist(alarmsRef.current.map((a) => (a.id === id ? { ...a, label } : a)))
    },
    [persist]
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const fired: string[] = []

      alarmsRef.current.forEach((a) => {
        if (a.active && a.targetTime <= now) {
          playAlarm(a.sound)
          fired.push(a.id)
        }
      })

      if (fired.length > 0) {
        persist(alarmsRef.current.map((a) => (fired.includes(a.id) ? { ...a, active: false } : a)))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [persist])

  return { alarms, addAlarm, toggleActive, deleteAlarm, updateLabel }
}

export type UseAlarmsReturn = ReturnType<typeof useAlarms>

export function resolveTargetTime(hour: number, minute: number): number {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0)
  if (target.getTime() <= Date.now()) {
    target.setDate(target.getDate() + 1)
  }
  return target.getTime()
}

export function isTomorrow(targetTime: number): boolean {
  const now = new Date()
  const target = new Date(targetTime)
  return target.getDate() !== now.getDate()
}

export function formatRemaining(targetTime: number): string {
  const diffMs = targetTime - Date.now()
  if (diffMs <= 0) return 'now'
  const totalMin = Math.floor(diffMs / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `in ${m}m`
  if (m === 0) return `in ${h}h`
  return `in ${h}h ${m}m`
}

export function hoursRingValue(targetTime: number): number {
  const diffMs = Math.max(0, targetTime - Date.now())
  const diffH = diffMs / 3600000
  return Math.min(diffH / 12, 1)
}

export function alarmSoundDefault(): AlarmSound {
  return storage.get<AlarmSound>('alarmSound', 'digital')
}
