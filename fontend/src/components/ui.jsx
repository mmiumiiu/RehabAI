// Shared design-system primitives. Class names map to the tokens in tailwind.config.js
// which mirror the "BRIDGE" mockup in design/bridge-mockup.html.
import { Link } from 'react-router-dom'

export function Logo({ light = false, size = 44 }) {
  return (
    <div className="flex items-center gap-3.5">
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.3,
          background: light ? 'rgba(255,255,255,0.18)' : '#157AB5',
        }}
      >
        {/* BRIDGE wave mark */}
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 12c2-4 4-4 5 0s3 4 5 0 3-4 5 0 2 4 3 0"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span
        className="font-heading font-bold text-b-h3 tracking-tight"
        style={{ color: light ? '#fff' : '#0B2E45' }}
      >
        BRIDGE
      </span>
    </div>
  )
}

export function Field({ label, error, children, className = '' }) {
  return (
    <div className={`mb-5 ${className}`}>
      {label && <label className="field-label">{label}</label>}
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

export function Input({ icon: Icon, error, ...props }) {
  return (
    <div className={`input-wrap ${error ? 'border-danger' : ''}`}>
      {Icon && <Icon size={22} className="text-ink-secondary flex-shrink-0" />}
      <input {...props} />
    </div>
  )
}

export function Select({ icon: Icon, children, error, ...props }) {
  return (
    <div className={`input-wrap ${error ? 'border-danger' : ''}`}>
      {Icon && <Icon size={22} className="text-ink-secondary flex-shrink-0" />}
      <select {...props}>{children}</select>
    </div>
  )
}

export function Button({ variant = 'primary', as, to, className = '', children, ...props }) {
  // BRIDGE buttons: flat fill, 3px border of the same colour, generous height.
  const styles = {
    // Primary action = red (#D32F2F)
    primary: 'text-white bg-coral-600 border-[3px] border-coral-600 hover:bg-coral-800 hover:border-coral-800',
    // Blue accent — secondary navigation / confirm actions
    blue: 'text-white bg-teal-700 border-[3px] border-teal-700 hover:bg-teal-800 hover:border-teal-800',
    // Back-compat alias: pages that still ask for `coral` get the red button
    coral: 'text-white bg-coral-600 border-[3px] border-coral-600 hover:bg-coral-800 hover:border-coral-800',
    outline: 'bg-white border-[3px] border-line text-ink-primary hover:bg-teal-50',
    outlineBlue: 'bg-white border-[3px] border-teal-700 text-teal-700 hover:bg-teal-100',
    outlineCoral: 'bg-white border-[3px] border-coral-600 text-coral-700 hover:bg-coral-100',
    danger: 'bg-white border-[3px] border-danger text-danger hover:bg-coral-100',
    ghost: 'text-ink-secondary hover:bg-teal-100',
  }
  const cls = `inline-flex items-center justify-center gap-3 rounded-btn font-heading font-bold text-b-btn px-7 min-h-[58px] py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant] || styles.primary} ${className}`
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>
  const Tag = as || 'button'
  return <Tag className={cls} {...props}>{children}</Tag>
}

const groupBadge = {
  stretch: 'bg-teal-100 text-teal-800',
  balance: 'bg-indigo-100 text-indigo-700',
  strength: 'bg-teal-50 text-ink-secondary',
  big: 'bg-teal-100 text-teal-800',
  loud: 'bg-indigo-100 text-indigo-700',
  done: 'bg-ok-bg text-ok-fg',
  todo: 'bg-teal-50 text-ink-muted',
  active: 'bg-warn-bg text-warn-fg',
  alert: 'bg-coral-100 text-coral-700',
}

export function Badge({ tone = 'todo', className = '', children }) {
  return (
    <span className={`text-b-sm font-bold px-4 py-1 rounded-pill whitespace-nowrap ${groupBadge[tone] || groupBadge.todo} ${className}`}>
      {children}
    </span>
  )
}

export function ProgressBar({ value, max = 100, tone = 'big', className = '' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`bg-teal-100 rounded-full h-4 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all ${tone === 'loud' ? 'bg-indigo-600' : 'bg-teal-700'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// Mockup stat card: white, a 6px coloured top rule, optional icon tile, then a
// large figure over a small label.
export function StatCard({ icon: Icon, value, label, rule = '#157AB5', tint = '#E0F1FA', className = '' }) {
  return (
    <div
      className={`flex-1 min-w-[150px] bg-surface rounded-card border-[1.5px] border-line shadow-card p-5 flex flex-col gap-3 ${className}`}
      style={{ borderTop: `6px solid ${rule}` }}
    >
      {Icon && (
        <span className="w-[43px] h-[43px] rounded-[13px] flex items-center justify-center" style={{ background: tint, color: rule }}>
          <Icon size={22} />
        </span>
      )}
      <div>
        <div className="text-b-h2 font-bold leading-[1.2]">{value}</div>
        <div className="text-b-sm text-ink-secondary">{label}</div>
      </div>
    </div>
  )
}

// Mockup progress ring: thick track + rounded arc, figure/goal in the middle.
// Mockup sizes are 240px (home hero) and 170px (list summaries); pass them ÷1.4.
export function ProgressRing({
  value,
  goal,
  label,
  size = 121,
  stroke = 13,
  track = '#E6F1F7',
  color = '#157AB5',
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = goal ? Math.min(1, value / goal) : 0
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-bold leading-none" style={{ fontSize: size * 0.3 }}>
          {value}<span style={{ fontSize: size * 0.16 }}>/{goal}</span>
        </span>
        {label && <span className="text-b-sm mt-1.5">{label}</span>}
      </div>
    </div>
  )
}

// Mockup switch: 104×58 px (÷1.4 here) with the state spelled out inside.
export function Toggle({ on, onChange, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      disabled={disabled}
      aria-pressed={on}
      className="relative w-[74px] h-[41px] rounded-pill border-0 flex-shrink-0 cursor-pointer transition-colors disabled:opacity-50"
      style={{ background: on ? '#157AB5' : '#9A9384' }}
    >
      <span
        className="absolute top-[5px] w-[31px] h-[31px] rounded-full bg-white transition-all"
        style={{ left: on ? 38 : 5 }}
      />
      <span
        className="absolute top-[11px] text-[13px] font-bold text-white"
        style={on ? { left: 10 } : { right: 9 }}
      >
        {on ? 'เปิด' : 'ปิด'}
      </span>
    </button>
  )
}

// Mockup settings row: label + description on the left, switch on the right.
export function SettingRow({ title, desc, on, onChange, disabled = false, last = false }) {
  return (
    <div
      className={`flex items-center justify-between gap-5 py-4 ${last ? '' : 'border-b-2'}`}
      style={last ? undefined : { borderColor: '#E6F1F7' }}
    >
      <div className="flex flex-col gap-1.5 min-w-0">
        <span className="text-b-base font-bold">{title}</span>
        {desc && <span className="text-b-sm text-ink-secondary leading-[1.5]">{desc}</span>}
      </div>
      <Toggle on={on} onChange={onChange} disabled={disabled} />
    </div>
  )
}

export function Card({ className = '', children }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function SectionTitle({ children, className = '' }) {
  return (
    <p className={`text-b-label font-bold text-ink-secondary mb-4 ${className}`}>
      {children}
    </p>
  )
}

export function Avatar({ text, size = 44, tone = 'dark' }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: tone === 'light' ? 'rgba(255,255,255,0.18)' : '#E0F1FA',
        color: tone === 'light' ? '#fff' : '#0B3550',
      }}
    >
      {text}
    </div>
  )
}
