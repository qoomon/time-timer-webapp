export type TimerDirection = 'countdown' | 'countup'
export type AlarmSound = 'digital' | 'soft'

export interface TimerState {
  value: number
  running: boolean
  direction: TimerDirection
  alarmSound: AlarmSound
}
