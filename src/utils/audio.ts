import type { AlarmSound } from '../types'

export function playAlarm(sound: AlarmSound): void {
  const audio = new Audio(`/sounds/alarm_${sound}.mp3`)
  audio.play().catch(() => {
    // browser autoplay policy — ignore silently
  })
}
