import { useNavigate } from 'react-router-dom'
import { Phone } from './icons.jsx'

// Shared SOS pill floating on cam/mic panels (spec §3.13). → /emergency-alert
export default function SOSButton({ reason = 'sos' }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/emergency-alert?reason=${reason}`)}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-[13px] font-heading font-semibold shadow-lg"
      style={{ background: '#D9483E' }}
    >
      <Phone size={16} />
      SOS ฉุกเฉิน
    </button>
  )
}
