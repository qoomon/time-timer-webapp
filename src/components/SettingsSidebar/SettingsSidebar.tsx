import type { AppSettings } from '../../types'
import styles from './SettingsSidebar.module.css'

const PIE_COLORS = [
  { label: 'Red', value: '#c11535' },
  { label: 'Orange', value: '#e85d04' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Green', value: '#16a34a' },
  { label: 'Teal', value: '#0891b2' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Purple', value: '#7c3aed' },
  { label: 'Pink', value: '#ec4899' },
]

interface SettingsSidebarProps {
  open: boolean
  settings: AppSettings
  onClose: () => void
  onUpdate: (patch: Partial<AppSettings>) => void
}

export function SettingsSidebar({ open, settings, onClose, onUpdate }: SettingsSidebarProps) {
  return (
    <div className={`${styles.sidebar} ${open ? styles.open : ''}`}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.title}>Settings</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {/* Pie Color */}
          <section className={styles.section}>
            <h3 className={styles.sectionLabel}>Pie Color</h3>
            <div className={styles.swatches}>
              {PIE_COLORS.map((c) => (
                <button
                  key={c.value}
                  className={`${styles.swatch} ${settings.pieColor === c.value ? styles.swatchActive : ''}`}
                  style={{ '--swatch-color': c.value } as React.CSSProperties}
                  onClick={() => onUpdate({ pieColor: c.value })}
                  aria-label={c.label}
                  title={c.label}
                />
              ))}
              <label className={styles.colorPickerLabel} title="Custom color">
                <input
                  type="color"
                  className={styles.colorPicker}
                  value={settings.pieColor}
                  onChange={(e) => onUpdate({ pieColor: e.target.value })}
                />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                  <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                  <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                  <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                </svg>
              </label>
            </div>
          </section>

          {/* Text Size */}
          <section className={styles.section}>
            <h3 className={styles.sectionLabel}>Text Size</h3>
            <div className={styles.radioRow}>
              {(['sm', 'md', 'lg'] as AppSettings['fontSize'][]).map((size) => (
                <label key={size} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="fontSize"
                    value={size}
                    checked={settings.fontSize === size}
                    onChange={() => onUpdate({ fontSize: size })}
                    className={styles.radioInput}
                  />
                  <span
                    className={`${styles.radioBtn} ${settings.fontSize === size ? styles.radioBtnActive : ''}`}
                  >
                    {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Font */}
          <section className={styles.section}>
            <h3 className={styles.sectionLabel}>Font</h3>
            <div className={styles.fontList}>
              {(
                [
                  { value: 'mono', label: 'Mono', preview: '12:00' },
                  { value: 'sans', label: 'Sans', preview: '12:00' },
                  { value: 'serif', label: 'Serif', preview: '12:00' },
                ] as { value: AppSettings['fontFamily']; label: string; preview: string }[]
              ).map((f) => (
                <label key={f.value} className={styles.fontRow}>
                  <input
                    type="radio"
                    name="fontFamily"
                    value={f.value}
                    checked={settings.fontFamily === f.value}
                    onChange={() => onUpdate({ fontFamily: f.value })}
                    className={styles.radioInput}
                  />
                  <span
                    className={`${styles.fontDot} ${settings.fontFamily === f.value ? styles.fontDotActive : ''}`}
                  />
                  <span className={styles.fontLabel}>{f.label}</span>
                  <span className={styles.fontPreview} data-font={f.value}>
                    {f.preview}
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
