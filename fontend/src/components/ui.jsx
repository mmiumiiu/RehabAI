// Shared design-system primitives. Class names map to the tokens in tailwind.config.js
// which mirror the CSS variables in rehabai_web_mockup_full.html.
import { Link } from 'react-router-dom'

export function Logo({ light = false, size = 36 }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="rounded-[9px] flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: light ? 'rgba(255,255,255,0.14)' : '#DCEEE8',
        }}
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
          <path d="M4 15c4-8 12-8 16 0" stroke={light ? '#fff' : '#1F4A40'} strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="8" r="2.4" fill={light ? '#DCEEE8' : '#2F6F62'} />
        </svg>
      </div>
      <span
        className="font-heading font-semibold text-[17px]"
        style={{ color: light ? '#fff' : '#1F4A40' }}
      >
        RehabAI
      </span>
    </div>
  )
}

export function Field({ label, error, children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="field-label">{label}</label>}
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

export function Input({ icon: Icon, error, ...props }) {
  return (
    <div className={`input-wrap ${error ? 'border-danger' : ''}`}>
      {Icon && <Icon size={18} className="text-ink-muted flex-shrink-0" />}
      <input {...props} />
    </div>
  )
}

export function Select({ icon: Icon, children, error, ...props }) {
  return (
    <div className={`input-wrap ${error ? 'border-danger' : ''}`}>
      {Icon && <Icon size={18} className="text-ink-muted flex-shrink-0" />}
      <select {...props}>{children}</select>
    </div>
  )
}

export function Button({ variant = 'primary', as, to, className = '', children, ...props }) {
  const styles = {
    primary: 'bg-teal-700 text-white hover:bg-teal-800',
    coral: 'bg-coral-700 text-white hover:brightness-95',
    outline: 'border border-teal-700 text-teal-700 bg-transparent hover:bg-teal-100',
    outlineCoral: 'border border-coral-700 text-coral-700 bg-transparent hover:bg-coral-100',
    danger: 'border border-danger text-danger bg-transparent hover:bg-[#FBEAE8]',
    ghost: 'text-ink-secondary hover:bg-line/50',
  }
  const cls = `inline-flex items-center justify-center gap-2 rounded-btn font-heading font-medium text-[14px] px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>
  const Tag = as || 'button'
  return <Tag className={cls} {...props}>{children}</Tag>
}

const groupBadge = {
  stretch: 'bg-teal-100 text-teal-900',
  balance: 'bg-coral-100 text-coral-700',
  strength: 'bg-[#EFEBE2] text-ink-secondary',
  big: 'bg-teal-100 text-teal-900',
  loud: 'bg-coral-100 text-coral-700',
  done: 'bg-ok-bg text-ok-fg',
  todo: 'bg-[#F0EEE6] text-ink-muted',
  active: 'bg-warn-bg text-warn-fg',
}

export function Badge({ tone = 'todo', className = '', children }) {
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-md whitespace-nowrap ${groupBadge[tone] || groupBadge.todo} ${className}`}>
      {children}
    </span>
  )
}

export function ProgressBar({ value, max = 100, tone = 'big', className = '' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`bg-bg rounded-full h-2.5 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all ${tone === 'loud' ? 'bg-coral-700' : 'bg-teal-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`toggle-track ${on ? 'bg-teal-700' : 'bg-line'}`}
      aria-pressed={on}
    >
      <span
        className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all"
        style={{ left: on ? 23 : 3 }}
      />
    </button>
  )
}

export function Card({ className = '', children }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function SectionTitle({ children, className = '' }) {
  return (
    <p className={`text-[13px] font-semibold text-ink-secondary uppercase tracking-wide mb-3.5 ${className}`}>
      {children}
    </p>
  )
}

export function Avatar({ text, size = 32, tone = 'dark' }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: tone === 'light' ? 'rgba(255,255,255,0.16)' : '#DCEEE8',
        color: tone === 'light' ? '#fff' : '#1F4A40',
      }}
    >
      {text}
    </div>
  )
}
