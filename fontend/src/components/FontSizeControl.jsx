import { FONT_SCALES } from '../lib/services.js'
import { useFontScale } from '../lib/useFontScale.js'
import { useAuth } from '../context/AuthContext.jsx'

// Three-way text-size switch. Each option's "ก" is drawn at the size it gives,
// so the choice is visible without reading the label.
// `compact` = header version (icon-sized letters only).
const LETTER = { normal: 13, large: 16, xlarge: 20 }

export default function FontSizeControl({ compact = false }) {
  const { user } = useAuth()
  const { value, set } = useFontScale(user?.email)

  return (
    <div
      role="radiogroup"
      aria-label="ขนาดตัวอักษร"
      className={`inline-flex items-center rounded-[14px] bg-bg border border-line p-1 ${compact ? 'gap-0.5' : 'gap-1.5 w-full sm:w-auto'}`}
    >
      {FONT_SCALES.map((s) => {
        const on = s.value === value
        return (
          <button
            key={s.value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={`ตัวอักษร${s.label}`}
            title={`ตัวอักษร${s.label}`}
            onClick={() => set(s.value)}
            className={`flex items-center justify-center gap-2 rounded-[11px] font-heading font-bold transition-colors ${
              compact ? 'w-10 h-9' : 'flex-1 sm:flex-none px-4 min-h-[48px]'
            } ${on ? 'bg-indigo-600 text-white shadow-card' : 'text-ink-secondary hover:bg-surface'}`}
          >
            <span style={{ fontSize: LETTER[s.value], lineHeight: 1 }}>ก</span>
            {!compact && <span className="text-[14px]">{s.label}</span>}
          </button>
        )
      })}
    </div>
  )
}
