import { NavLink, Outlet } from 'react-router-dom'
import { Users, Chat } from './icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const NAV = [
  { to: '/therapist/patients', label: 'รายชื่อผู้ป่วย', icon: Users, match: '/therapist/patients', color: '#3D87E8', tint: '#E7F0FE' },
  { to: '/therapist/messages', label: 'ข้อความ', icon: Chat, color: '#E8554D', tint: '#FDE8E4' },
]

function isOn(match, isActive) {
  return isActive || (match && location.pathname.startsWith(match))
}

export default function TherapistLayout() {
  const { user } = useAuth()
  const name = user?.name || 'นักกายภาพบำบัด'

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[236px] flex-shrink-0 flex-col p-4 bg-surface border-r border-line">
        <div className="mb-6 px-1.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-white border border-line flex items-center justify-center overflow-hidden" style={{ boxShadow: '0 6px 14px rgba(47,166,90,.22)' }}>
            <img src="/logo.png" alt="RehabAI" className="w-[30px] h-[30px] object-contain" />
          </div>
          <div>
            <b className="font-heading text-[17px] text-ink-primary leading-none">RehabAI</b>
            <div className="text-[10px] font-bold px-2 py-0.5 rounded-pill inline-block mt-1" style={{ background: '#FBE7F1', color: '#B03A76' }}>นักกายภาพบำบัด</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1.5">
          {NAV.map(({ to, label, icon: Icon, match, color, tint }) => (
            <NavLink
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 rounded-2xl text-[15px] font-bold min-h-[52px] transition-all"
              style={({ isActive }) => (isOn(match, isActive)
                ? { background: color, color: '#fff', boxShadow: `0 8px 18px ${color}55` }
                : { background: 'transparent', color: '#2B2650' })}
            >
              {({ isActive }) => {
                const on = isOn(match, isActive)
                return (
                  <>
                    <span className="w-[34px] h-[34px] rounded-[11px] flex items-center justify-center flex-shrink-0" style={on ? { background: 'rgba(255,255,255,.25)', color: '#fff' } : { background: tint, color }}>
                      <Icon size={18} />
                    </span>
                    {label}
                  </>
                )
              }}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2.5 px-1 py-3.5 border-t border-line">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: '#F7C132', color: '#5C4400' }}>{name.slice(0, 2)}</div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold text-ink-primary truncate">{name}</div>
            <div className="text-[11.5px] text-ink-muted">นักกายภาพบำบัด</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 bg-bg overflow-auto pb-16 md:pb-0">
        <Outlet />
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-line bg-surface">
        {NAV.map(({ to, label, icon: Icon, match, color }) => (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors"
            style={({ isActive }) => ({ color: isOn(match, isActive) ? color : '#9B95BD' })}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
