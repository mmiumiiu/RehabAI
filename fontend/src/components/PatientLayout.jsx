import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Logo, Avatar } from './ui.jsx'
import { Home, Activity, Chart, User, Bell, Chat } from './icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const NAV = [
  { to: '/home', label: 'หน้าแรก', icon: Home },
  { to: '/training/big', label: 'ฝึกกายภาพ', icon: Activity, match: '/training' },
  { to: '/dashboard', label: 'สรุปผล', icon: Chart },
  { to: '/chat', label: 'แชท', icon: Chat },
  { to: '/profile', label: 'โปรไฟล์', icon: User, match: '/profile' },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'สวัสดีตอนเช้า'
  if (h < 17) return 'สวัสดีตอนบ่าย'
  return 'สวัสดีตอนเย็น'
}

export default function PatientLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const name = user?.name || 'ผู้ใช้งาน'
  const initials = name.slice(0, 2)

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col p-4 text-white" style={{ background: '#1F4A40' }}>
        <div className="mb-8 px-2 pt-2">
          <Logo light size={34} />
        </div>
        <nav className="flex-1">
          {NAV.map(({ to, label, icon: Icon, match }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => {
                const active = isActive || (match && location.pathname.startsWith(match))
                return `flex items-center gap-2.5 px-3 py-2.5 rounded-btn text-[13.5px] mb-1 transition-colors ${
                  active ? 'bg-white/[0.12] text-white font-medium' : 'text-white/70 hover:bg-white/[0.06]'
                }`
              }}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2.5 px-2 py-3 border-t border-white/10">
          <Avatar text={initials} tone="light" />
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium truncate">{name}</div>
            <div className="text-[10.5px] opacity-60">ผู้ป่วย · {user?.parkinsonStage === 'stage2' ? 'ระยะ 2' : 'ระยะ 1'}</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 bg-bg flex flex-col">
        <header className="flex justify-between items-center px-4 md:px-8 py-4 border-b border-line bg-surface">
          <div>
            <p className="text-[12px] text-ink-secondary m-0">{greeting()}</p>
            <p className="font-heading text-[16px] md:text-[17px] font-semibold text-teal-900 m-0 truncate max-w-[180px] md:max-w-none">{name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-900" title="การแจ้งเตือน">
              <Bell size={18} />
            </button>
            <button onClick={() => navigate('/profile')} title="โปรไฟล์">
              <Avatar text={initials} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <div className="max-w-[960px] mx-auto w-full px-4 md:px-8 py-5 md:py-7">
            <Outlet />
          </div>
        </main>
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
