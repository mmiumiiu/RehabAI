// Shared design-system primitives. Class names map to the tokens in tailwind.config.js
// which mirror the CSS variables in rehabai_web_mockup_full.html.
import { Link } from 'react-router-dom'

export function Logo({ light = false, size = 36 }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="rounded-[10px] flex items-center justify-center overflow-hidden border"
        style={{
          width: size,
          height: size,
          background: '#fff',
          borderColor: light ? 'rgba(255,255,255,0.4)' : '#E9E6F7',
          boxShadow: '0 6px 14px rgba(47,166,90,.22)',
        }}
      >
        <img src="/logo.png" alt="RehabAI" style={{ width: size * 0.82, height: size * 0.82, objectFit: 'contain' }} />
      </div>
      <span
        className="font-heading font-semibold text-[17px]"
        style={{ color: light ? '#fff' : '#2B2650' }}
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
  // 3D "pushable" buttons — the Colorful signature (border + solid bottom shadow)
  const styles = {
    primary: 'text-white bg-teal-600 border-[2.5px] border-teal-800 shadow-[0_4px_0_#1E7A40] active:translate-y-[3px] active:shadow-none',
    coral: 'text-white bg-coral-600 border-[2.5px] border-coral-700 shadow-[0_4px_0_#B33630] active:translate-y-[3px] active:shadow-none',
    outline: 'bg-white border-2 border-line text-ink-secondary hover:bg-bg',
    outlineCoral: 'bg-white border-2 border-coral-600 text-coral-700 hover:bg-coral-100',
    danger: 'bg-white border-2 border-danger text-danger hover:bg-[#FCE1E7]',
    ghost: 'text-ink-secondary hover:bg-line/50',
  }
  const cls = `inline-flex items-center justify-center gap-2 rounded-btn font-heading font-bold text-[14px] px-5 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>
  const Tag = as || 'button'
  return <Tag className={cls} {...props}>{children}</Tag>
}

const groupBadge = {
  stretch: 'bg-teal-100 text-teal-900',
  balance: 'bg-coral-100 text-coral-700',
  strength: 'bg-[#F1EFF9] text-ink-secondary',
  big: 'bg-teal-100 text-teal-900',
  loud: 'bg-coral-100 text-coral-700',
  done: 'bg-ok-bg text-ok-fg',
  todo: 'bg-[#F1EFF9] text-ink-muted',
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
        background: tone === 'light' ? 'rgba(255,255,255,0.16)' : '#E1FAEA',
        color: tone === 'light' ? '#fff' : '#0A4023',
      }}
    >
      {text}
    </div>
  )
}
