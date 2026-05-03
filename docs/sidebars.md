# Sidebar Features — Design Spec

## Overview

Two sidebars extend the timer with wall-clock alarm scheduling:

| | Left sidebar | Right sidebar |
|---|---|---|
| **Name** | Alarms List | Alarm Set |
| **Trigger** | List icon button in Controls | Clock+ icon button in Controls |
| **Purpose** | Browse, toggle, delete saved alarms | Create a new alarm with visual preview |

---

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [≡]                 TimerDial (main pie)               [+⏰]│
│                                                              │
│  ┌──────────┐    ┌──────────────────────┐    ┌───────────┐  │
│  │ Alarms   │    │                      │    │ Set Alarm │  │
│  │ List     │    │   SVG pie dial       │    │ Panel     │  │
│  │ Sidebar  │    │   (shows minutes     │    │           │  │
│  │          │    │    in alarm-preview) │    │           │  │
│  └──────────┘    └──────────────────────┘    └───────────┘  │
│                            Controls footer                   │
└──────────────────────────────────────────────────────────────┘
```

- Both sidebars slide in/out independently via `transform: translateX` + CSS transition
- Default: both closed
- Desktop (≥ 768px): sidebars push the dial — layout is `flex-row`
- Mobile (< 768px): sidebars overlay the dial at full height

---

## Left Sidebar — Alarms List

**Files:**
- `src/components/AlarmListSidebar/AlarmListSidebar.tsx`
- `src/components/AlarmListSidebar/AlarmListSidebar.module.css`

### Wireframe

```
┌─────────────────────────────┐
│  Alarms              [×]    │
├─────────────────────────────┤
│  ● 09:00                    │
│    Stand-up    in 2h 14m    │
│                       [🔕][🗑]│
├─────────────────────────────┤
│  ○ 14:30                    │
│    Lunch      tomorrow      │
│                       [🔕][🗑]│
├─────────────────────────────┤
│  (empty: "No alarms set")   │
└─────────────────────────────┘
```

### Alarm Row

| Element | Detail |
|---|---|
| **Dot** | Red `●` = active, gray `○` = muted |
| **Time** | `HH:MM` 24h format |
| **Label** | Inline editable — click to edit, blur to save, placeholder `No label` |
| **Remaining** | Dim subtext: `in 2h 14m` / `in 45m` / `tomorrow` |
| **Mute toggle** | Pill toggle — silences without deleting |
| **Delete** | Icon button — brief CSS shake animation as confirmation (no modal) |

### States

- **Empty** — centered dim text `No alarms set`
- **Firing** — row background pulses `--color-arc` red while alarm is sounding

### Data type

```ts
interface Alarm {
  id: string          // crypto.randomUUID()
  label: string
  targetTime: number  // Unix timestamp ms
  sound: AlarmSound
  active: boolean
  createdAt: number
}
```

### Props

```ts
interface AlarmListSidebarProps {
  alarms: Alarm[]
  open: boolean
  onClose: () => void
  onToggleActive: (id: string) => void
  onDelete: (id: string) => void
  onLabelChange: (id: string, label: string) => void
}
```

---

## Right Sidebar — Alarm Set

**Files:**
- `src/components/AlarmSetSidebar/AlarmSetSidebar.tsx`
- `src/components/AlarmSetSidebar/AlarmSetSidebar.module.css`

### Wireframe

```
┌─────────────────────────────┐
│ [×]              Set Alarm  │
├─────────────────────────────┤
│                             │
│         ┌───────┐           │
│         │  2h   │  ← hours  │
│         │  37m  │    ring   │
│         └───────┘           │
│      (small SVG pie)        │
│                             │
│  Time   [ 14 ] : [ 30 ]     │
│                [tomorrow]   │
│                             │
│  Label  [________________]  │
│                             │
│  Sound  ◉ Digital  ○ Soft  │
│                             │
│  ┌─────────────────────┐    │
│  │      Set Alarm      │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### Hours Ring (small secondary dial)

- `120×120px` SVG, reuses `describePie` from `src/utils/geometry.ts`
- **12-hour clock face** — full circle = 12 hours
- Red wedge = fraction of 12h until the alarm
  - Example: alarm in 2h 37m → `(2 + 37/60) / 12 ≈ 22%` of circle filled
- Center text: `Xh Ym` remaining (e.g. `2h 37m`)
- Updates live as hour/minute spinners change

### Main Dial — Alarm Preview Mode

When this sidebar is **open**, the main `TimerDial` switches to `alarm-preview` mode:

- **Shows:** the **minute portion** of remaining time as a pie wedge (0–60 min scale)
- **Center text:** `MM:SS` of the minute slice (counts down the current minute)
- **Drag disabled** — read-only display
- When sidebar **closes** → dial returns to normal `timer` mode

This creates a two-level view:
- **Hours ring** (sidebar, small) → coarse "how many hours left"
- **Main pie** (center, large) → fine "what minute within that hour"

### Time Input

- Hour spinner: `0–23`
- Minute spinner: `0–59`
- If the target time has already passed today → automatically targets tomorrow, shows `tomorrow` badge
- Confirmation button: `Set Alarm` — disabled if no valid future time

### Props

```ts
interface AlarmSetSidebarProps {
  open: boolean
  onClose: () => void
  onAddAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt'>) => void
  defaultSound: AlarmSound
}
```

---

## New Hook — `useAlarms`

**File:** `src/hooks/useAlarms.ts`

Responsibilities:
- Load `Alarm[]` from `storage.get('alarms', [])` on mount
- Persist to `storage.set('alarms', alarms)` on every mutation
- Poll every 1s (`setInterval`) — if an active alarm's `targetTime <= Date.now()`, fire `playAlarm()` and mark it inactive
- Expose CRUD API

```ts
return {
  alarms,
  addAlarm,     // (alarm: Omit<Alarm, 'id' | 'createdAt'>) => void
  toggleActive, // (id: string) => void
  deleteAlarm,  // (id: string) => void
  updateLabel,  // (id: string, label: string) => void
}
```

---

## Files to Create

```
src/
  components/
    AlarmListSidebar/
      AlarmListSidebar.tsx
      AlarmListSidebar.module.css
      AlarmListSidebar.test.tsx
    AlarmSetSidebar/
      AlarmSetSidebar.tsx
      AlarmSetSidebar.module.css
      AlarmSetSidebar.test.tsx
  hooks/
    useAlarms.ts
    useAlarms.test.ts
```

## Files to Modify

```
src/types/index.ts
  + Alarm interface
  + TimerMode = 'timer' | 'alarm-preview'

src/App.tsx
  + useAlarms hook
  + alarmListOpen / alarmSetOpen state
  + flex-row layout with sidebar slots

src/App.module.css
  + .layout, .center, .sidebar, .sidebarClosed

src/components/Controls/Controls.tsx
  + list icon button (onOpenAlarmList)
  + clock+ icon button (onOpenAlarmSet)

src/components/TimerDial/TimerDial.tsx
  + mode: TimerMode prop
  + previewMinutes?: number prop
  + drag disabled in alarm-preview mode

src/index.css
  + --sidebar-width, --sidebar-bg, --sidebar-border
  + --color-alarm-active, --color-alarm-inactive
  + --transition-sidebar
```

---

## CSS Tokens

```css
--sidebar-width: 280px;
--sidebar-bg: #1e2129;
--sidebar-border: #2a2f3a;
--color-alarm-active: #c11535;
--color-alarm-inactive: #444;
--transition-sidebar: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Acceptance Checklist

- [ ] Left sidebar opens/closes with slide animation
- [ ] Right sidebar opens/closes with slide animation
- [ ] Adding an alarm via right sidebar → appears in left list immediately
- [ ] Alarm fires at target time: sound plays, row pulses red
- [ ] Mute toggle silences alarm without deleting
- [ ] Delete shows shake, then removes row
- [ ] Label is editable inline, persists on blur
- [ ] Hours ring updates live while changing time input
- [ ] Main dial shows minute preview while right sidebar is open
- [ ] `tomorrow` badge shown when target time has passed for today
- [ ] Alarms survive page reload (localStorage)
- [ ] Mobile: sidebars overlay the dial (no layout push)
- [ ] `npm run lint` — zero errors
- [ ] `npm test` — all tests pass
