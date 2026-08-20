import { NavLink, Outlet } from 'react-router-dom'
import { Users, Chat } from './icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const NAV = [
  { to: '/therapist/patients', label: 'ผู้ป่วยของฉัน', icon: Users, match: '/therapist/patients', c: 'teal' },
  { to: '/therapist/messages', label: 'ข้อความ', icon: Chat, c: 'aqua' },
]

const NAV_C = {
  teal: { off: 'bg-teal-100 text-teal-700', on: 'bg-teal-600 text-white' },
  aqua: { off: 'bg-aqua-100 text-aqua-700', on: 'bg-aqua-600 text-white' },
}

export default function TherapistLayout() {
  const { user } = useAuth()
  const name = user?.name || 'นักกายภาพบำบัด'

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[222px] flex-shrink-0 flex-col p-4 bg-surface border-r border-line">
        <div className="mb-6 px-1 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[11px] text-white flex items-center justify-center font-heading font-semibold bg-[linear-gradient(135deg,#29B85E,#1BB39E)] shadow-[0_6px_14px_rgba(27,156,76,0.3)]">R</div>
          <div>
            <b className="font-heading text-[16px] text-ink-primary leading-none">RehabAI</b>
            <div className="text-[9px] font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-pill inline-block mt-1">นักกายภาพบำบัด</div>
          </div>
        </div>
        <nav className="flex-1">
          {NAV.map(({ to, label, icon: Icon, match, c }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => {
                const active = isActive || (match && location.pathname.startsWith(match))
                return `flex items-center gap-2.5 px-2.5 py-2.5 rounded-2xl text-[13.5px] font-semibold mb-2 transition-colors ${active ? NAV_C[c].on : NAV_C[c].off}`
              }}
            >
              <span className="w-7 h-7 rounded-[10px] bg-white/70 flex items-center justify-center flex-shrink-0">
                <Icon size={16} />
              </span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2.5 px-1 py-3 border-t border-line">
          <div className="w-8 h-8 rounded-full bg-sun-500 text-ink-primary flex items-center justify-center text-[11px] font-bold flex-shrink-0">{name.slice(0, 2)}</div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold truncate">{name}</div>
            <div className="text-[10px] text-ink-muted">นักกายภาพบำบัด</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 bg-bg overflow-auto pb-16 md:pb-0">
        <Outlet />
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-line bg-surface">
        {NAV.map(({ to, label, icon: Icon, match, c }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => {
              const active = isActive || (match && location.pathname.startsWith(match))
              return `flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${active ? NAV_C[c].off.split(' ')[1] : 'text-ink-muted'}`
            }}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
