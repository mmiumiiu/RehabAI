import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Avatar } from './ui.jsx'
import { Home, Activity, Chart, User, Bell, Chat } from './icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const NAV = [
  { to: '/home', label: 'หน้าแรก', icon: Home, c: 'teal' },
  { to: '/training/big', label: 'ฝึกกายภาพ', icon: Activity, match: '/training', c: 'coral' },
  { to: '/dashboard', label: 'สรุปผล', icon: Chart, c: 'sky' },
  { to: '/chat', label: 'แชท', icon: Chat, c: 'aqua' },
  { to: '/profile', label: 'โปรไฟล์', icon: User, match: '/profile', c: 'pink' },
]

// tint (inactive) vs filled (active) per nav colour
const NAV_C = {
  teal: { off: 'bg-teal-100 text-teal-700', on: 'bg-teal-600 text-white' },
  coral: { off: 'bg-coral-100 text-coral-700', on: 'bg-coral-600 text-white' },
  sky: { off: 'bg-sky-100 text-sky-600', on: 'bg-sky-500 text-white' },
  aqua: { off: 'bg-aqua-100 text-aqua-700', on: 'bg-aqua-600 text-white' },
  pink: { off: 'bg-pink-100 text-pink-700', on: 'bg-pink-600 text-white' },
}

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
      <aside className="hidden md:flex w-[222px] flex-shrink-0 flex-col p-4 bg-surface border-r border-line">
        <div className="mb-6 px-1 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[11px] text-white flex items-center justify-center font-heading font-semibold bg-[linear-gradient(135deg,#29B85E,#1BB39E)] shadow-[0_6px_14px_rgba(27,156,76,0.3)]">R</div>
          <b className="font-heading text-[16px] text-ink-primary">RehabAI</b>
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
          <div className="w-8 h-8 rounded-full bg-sun-500 text-ink-primary flex items-center justify-center text-[11px] font-bold flex-shrink-0">{initials}</div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold truncate">{name}</div>
            <div className="text-[10px] text-ink-muted">ผู้ป่วย · {user?.parkinsonStage === 'stage2' ? 'ระยะ 2' : 'ระยะ 1'}</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 bg-bg flex flex-col">
        <header className="flex justify-between items-center px-4 md:px-8 py-4 border-b border-line bg-surface">
          <div>
            <p className="text-[12px] text-ink-secondary m-0">{greeting()}</p>
            <p className="font-heading text-[16px] md:text-[17px] font-semibold text-ink-primary m-0 truncate max-w-[180px] md:max-w-none">{name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-sun-100 flex items-center justify-center text-sun-500" title="การแจ้งเตือน">
              <Bell size={18} />
            </button>
            <button onClick={() => navigate('/profile')} title="โปรไฟล์" className="w-9 h-9 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-[12px] font-bold">
              {initials}
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
