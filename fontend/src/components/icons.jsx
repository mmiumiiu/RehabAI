// Lightweight inline SVG icon set (stroke-based, currentColor).
// Keeps the bundle dependency-free and matches the mockup's line style.

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const Icon = ({ children, size, ...rest }) => (
  <svg {...base} width={size ?? base.width} height={size ?? base.height} {...rest}>
    {children}
  </svg>
)

export const Mail = (p) => (
  <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Icon>
)
export const Lock = (p) => (
  <Icon {...p}><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Icon>
)
export const User = (p) => (
  <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" /></Icon>
)
export const Phone = (p) => (
  <Icon {...p}><path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></Icon>
)
export const Bell = (p) => (
  <Icon {...p}><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" /></Icon>
)
export const Home = (p) => (
  <Icon {...p}><path d="M4 11 12 4l8 7" /><path d="M6 10v9h12v-9" /></Icon>
)
export const Activity = (p) => (
  <Icon {...p}><path d="M3 12h4l2-6 4 14 2-8h6" /></Icon>
)
export const Chart = (p) => (
  <Icon {...p}><path d="M4 4v16h16" /><rect x="7" y="11" width="3" height="6" /><rect x="12" y="7" width="3" height="10" /><rect x="17" y="13" width="3" height="4" /></Icon>
)
export const Mic = (p) => (
  <Icon {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0" /><path d="M12 17v4" /></Icon>
)
export const Dumbbell = (p) => (
  <Icon {...p}><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" /></Icon>
)
export const Send = (p) => (
  <Icon {...p}><path d="m4 12 16-8-6 16-3-6-7-2Z" /></Icon>
)
export const Chat = (p) => (
  <Icon {...p}><path d="M4 5h16v11H9l-4 3v-3H4Z" /></Icon>
)
export const Settings = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></Icon>
)
export const ChevronRight = (p) => (
  <Icon {...p}><path d="m9 6 6 6-6 6" /></Icon>
)
export const ArrowLeft = (p) => (
  <Icon {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Icon>
)
export const Check = (p) => (
  <Icon {...p}><path d="M5 13l4 4L19 7" /></Icon>
)
export const Plus = (p) => (
  <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
)
export const Search = (p) => (
  <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></Icon>
)
export const AlertTriangle = (p) => (
  <Icon {...p}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 9v5M12 17h.01" /></Icon>
)
export const LogOut = (p) => (
  <Icon {...p}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 12h10M17 9l3 3-3 3" /></Icon>
)
export const Trash = (p) => (
  <Icon {...p}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></Icon>
)
export const Camera = (p) => (
  <Icon {...p}><path d="M4 8h3l1.5-2h7L17 8h3v11H4Z" /><circle cx="12" cy="13" r="3.5" /></Icon>
)
export const MapPin = (p) => (
  <Icon {...p}><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></Icon>
)
export const Clock = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>
)
export const Hospital = (p) => (
  <Icon {...p}><path d="M4 21V7l8-4 8 4v14M9 21v-6h6v6M9 11h.01M15 11h.01M9 15h.01M15 15h.01" /></Icon>
)
export const Users = (p) => (
  <Icon {...p}><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" /><path d="M16 5a3.5 3.5 0 0 1 0 7M21 20c0-2.4-1.6-4.3-4-4.8" /></Icon>
)
export const ShieldCheck = (p) => (
  <Icon {...p}><path d="M12 3 5 6v5c0 4.5 3 7.6 7 9 4-1.4 7-4.5 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></Icon>
)
export const Award = (p) => (
  <Icon {...p}><circle cx="12" cy="9" r="5" /><path d="m9 14-2 7 5-3 5 3-2-7" /></Icon>
)
export const Flame = (p) => (
  <Icon {...p}><path d="M12 3c1 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 .5 1 1 1.5 2 1.5C11 8 10 6 12 3Z" /></Icon>
)
export const Refresh = (p) => (
  <Icon {...p}><path d="M4 10a8 8 0 0 1 14-4l2 2M20 14a8 8 0 0 1-14 4l-2-2" /><path d="M20 4v4h-4M4 20v-4h4" /></Icon>
)
