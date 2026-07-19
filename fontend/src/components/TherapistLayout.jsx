import { NavLink, Outlet } from 'react-router-dom'
import { Logo, Avatar } from './ui.jsx'
import { Users, Chat } from './icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const NAV = [
  { to: '/therapist/patients', label: 'ผู้ป่วยของฉัน', icon: Users, match: '/therapist/patients' },
  { to: '/therapist/messages', label: 'ข้อความ', icon: Chat },
]

export default function TherapistLayout() {
  const { user } = useAuth()
  const name = user?.name || 'นักกายภาพบำบัด'

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col p-4 text-white" style={{ background: '#1F4A40' }}>
        <div className="mb-8 px-2 pt-2">
          <Logo light size={34} />
          <div className="text-[10.5px] text-white/50 mt-1 pl-1">Therapist Portal</div>
        </div>
        <nav className="flex-1">
          {NAV.map(({ to, label, icon: Icon, match }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-btn text-[13.5px] mb-1 transition-colors ${
                  isActive || (match && location.pathname.startsWith(match))
                    ? 'bg-white/[0.12] text-white font-medium'
                    : 'text-white/70 hover:bg-white/[0.06]'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2.5 px-2 py-3 border-t border-white/10">
          <Avatar text={name.slice(0, 2)} tone="light" />
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium truncate">{name}</div>
            <div className="text-[10.5px] opacity-60">นักกายภาพบำบัด</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 bg-bg overflow-auto pb-16 md:pb-0">
        <Outlet />
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/10" style={{ background: '#1F4A40' }}>
        {NAV.map(({ to, label, icon: Icon, match }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => {
              const active = isActive || (match && location.pathname.startsWith(match))
              return `flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
                active ? 'text-white' : 'text-white/50'
              }`
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
