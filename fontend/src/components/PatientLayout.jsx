import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, Chart, MapPin, Users, Chat, User, Phone } from './icons.jsx'
import { Logo } from './ui.jsx'
import { useAuth } from '../context/AuthContext.jsx'

// Six items, per the BRIDGE mockup sidebar. Sizes are the mockup px ÷ 1.4
// (App.jsx applies a body zoom of 1.4 to the patient portal).
const NAV = [
  { to: '/home', label: 'หน้าแรก', icon: Home },
  { to: '/dashboard', label: 'สรุปผล', icon: Chart },
  { to: '/village', label: 'แผนที่หมู่บ้าน', icon: MapPin },
  { to: '/community', label: 'ชุมชน', icon: Users, match: '/community' },
  { to: '/chat', label: 'แชท', icon: Chat },
  { to: '/profile', label: 'โปรไฟล์', icon: User, match: '/profile' },
]

function isOn(match, isActive) {
  return isActive || (match && location.pathname.startsWith(match))
}

export default function PatientLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const name = user?.name || 'ผู้ใช้งาน'
  const initials = name.slice(0, 2)

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Desktop sidebar — mockup: sky gradient, 1.5px right rule */}
      <aside
        className="hidden md:flex w-[250px] flex-shrink-0 flex-col gap-1.5 px-[14px] py-6 border-r-[1.5px] border-line"
        style={{ background: 'linear-gradient(180deg, #DDEFF7 0%, #F5FAFD 100%)' }}
      >
        <div className="px-1.5 pb-5">
          <Logo size={43} />
        </div>

        <nav aria-label="เมนูหลัก" className="flex flex-col gap-1.5">
          {NAV.map(({ to, label, icon: Icon, match }) => (
            <NavLink
              key={to}
              to={to}
              className="flex items-center gap-4 px-4 rounded-[14px] min-h-[54px] text-b-base transition-colors"
              style={({ isActive }) => (isOn(match, isActive)
                ? { background: '#BFE3F2', color: '#0B3550', fontWeight: 700, boxShadow: 'inset 5px 0 0 #157AB5' }
                : { background: 'transparent', color: '#0B2E45', fontWeight: 600 })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={23} className={isOn(match, isActive) ? 'text-teal-800' : 'text-teal-700'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-5 flex flex-col gap-2.5">
          {/* Emergency — red, bottom of the sidebar */}
          <NavLink
            to="/emergency-alert"
            className="flex items-center gap-3.5 px-4 min-h-[54px] rounded-[14px] bg-coral-600 text-white text-b-base font-bold hover:bg-coral-800 transition-colors"
          >
            <Phone size={22} />
            ติดต่อฉุกเฉิน
          </NavLink>

          <div className="flex items-center gap-3.5 p-2.5 rounded-[14px] bg-surface shadow-soft">
            <div className="w-[43px] h-[43px] rounded-full flex items-center justify-center text-b-sm font-bold flex-shrink-0 bg-teal-100 text-teal-800">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-b-sm font-bold text-ink-primary truncate">{name}</div>
              <div className="text-b-xs text-ink-secondary">ผู้ป่วย</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 bg-bg flex flex-col">
        {/* Mobile-only top bar — the desktop sidebar already shows the logo and
            profile, and each page carries its own heading (as in the mockup). */}
        <header className="md:hidden flex justify-between items-center px-4 py-3 border-b-[1.5px] border-line bg-surface">
          <Logo size={32} />
          <button
            onClick={() => navigate('/profile')}
            title="โปรไฟล์"
            className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center text-b-sm font-bold bg-teal-100 text-teal-800"
          >
            {initials}
          </button>
        </header>

        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <div className="max-w-[1000px] mx-auto w-full px-4 md:px-9 py-6 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav — same six items, plus the red emergency tab */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t-[1.5px] border-line bg-surface">
        {NAV.map(({ to, label, icon: Icon, match }) => (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-bold text-center leading-tight transition-colors"
            style={({ isActive }) => ({ color: isOn(match, isActive) ? '#157AB5' : '#6C8699' })}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
        <NavLink to="/emergency-alert" className="flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-bold text-danger">
          <Phone size={20} />
          ฉุกเฉิน
        </NavLink>
      </nav>
    </div>
  )
}
