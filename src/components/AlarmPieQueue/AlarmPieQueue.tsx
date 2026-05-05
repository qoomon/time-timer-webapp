import { useEffect, useState } from 'react'
import type { Alarm } from '../../types'
import { describePie } from '../../utils/geometry'
import styles from './AlarmPieQueue.module.css'

function BigPie({ fraction, label }: { fraction: number; label?: string }) {
  const CX = 50
  const CY = 50
  const R = 50
  const angle = Math.min(fraction, 1) * 360
  const path = describePie(CX, CY, R, 0, angle)

  return (
    <svg className={styles.pie} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx={CX} cy={CY} r={R} fill="var(--color-track)" />
      {fraction > 0 && <path d={path} fill="var(--color-arc)" />}
      {label !== undefined && (
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="central"
          className={styles.hourLabel}
        >
          {label}
        </text>
      )}
    </svg>
  )
}

interface AlarmPieQueueProps {
  alarms: Alarm[]
}

export function AlarmPieQueue({ alarms }: AlarmPieQueueProps) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const nearest =
    alarms
      .filter((a) => a.active && a.targetTime > now)
      .sort((a, b) => a.targetTime - b.targetTime)[0] ?? null

  const open = nearest !== null

  const diffMs = nearest ? Math.max(0, nearest.targetTime - now) : 0
  const fullHours = Math.min(Math.floor(diffMs / 3600000), 23)
  const partialFraction = (diffMs % 3600000) / 3600000

  return (
    <aside
      className={`${styles.sidebar} ${open ? styles.open : ''}`}
      aria-label="Alarm time remaining"
      aria-hidden={!open}
    >
      <div className={styles.pieList}>
        {/* top pie = minutes remaining in the current hour */}
        <BigPie fraction={partialFraction} />
        {Array.from({ length: fullHours }, (_, i) => (
          <BigPie key={i} fraction={1} label={String(fullHours - i)} />
        ))}
      </div>
    </aside>
  )
}
