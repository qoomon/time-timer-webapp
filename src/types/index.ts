export type TimerDirection = 'countdown' | 'countup'
export type AlarmSound = 'digital' | 'soft'
export type TimerMode = 'timer' | 'alarm-preview'

export interface TimerState {
  value: number
  running: boolean
  direction: TimerDirection
  alarmSound: AlarmSound
}

export interface Alarm {
  id: string
  label: string
  targetTime: number
  sound: AlarmSound
  active: boolean
  createdAt: number
}
