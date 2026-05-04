import { useEffect, useState } from 'react'
import type { AppSettings } from '../types'
import { storage } from '../utils/storage'

const DEFAULTS: AppSettings = {
  pieColor: '#c11535',
  fontSize: 'md',
  fontFamily: 'mono',
}

const FONT_FAMILIES: Record<AppSettings['fontFamily'], string> = {
  mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
  sans: "system-ui, 'Segoe UI', Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
}

const FONT_SIZES: Record<AppSettings['fontSize'], string> = {
  sm: '5.5px',
  md: '7px',
  lg: '8.5px',
}

function applySettings(s: AppSettings) {
  const root = document.documentElement
  root.style.setProperty('--color-arc', s.pieColor)
  root.style.setProperty('--font-timer', FONT_FAMILIES[s.fontFamily])
  root.style.setProperty('--font-size-timer', FONT_SIZES[s.fontSize])
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = storage.get<Partial<AppSettings>>('settings', {})
    return { ...DEFAULTS, ...saved }
  })

  useEffect(() => {
    applySettings(settings)
  }, [settings])

  const updateSettings = (patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      storage.set('settings', next)
      return next
    })
  }

  return { settings, updateSettings }
}
