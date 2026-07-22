import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Phone, MapPin } from '../../components/icons.jsx'
import { lineNotification } from '../../lib/services.js'
import { emergencyContactsSeed } from '../../lib/mockData.js'

// Emergency countdown screen (spec §3.15). Order matters:
// 1) immediately notify contact #1 (+location) — non-cancellable
// 2) countdown before auto-calling 1669 (7s normal, 4s during high-risk)
// 3) cancel / call-now controls
export default function EmergencyAlert() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const highRisk = params.get('reason') === 'fall'
  const total = highRisk ? 4 : 7
  const contact = emergencyContactsSeed[0]

  const [left, setLeft] = useState(total)
  const [called, setCalled] = useState(false)

  // step 1: fire SMS immediately on mount
  useEffect(() => {
    lineNotification.send({
      body: `[RehabAI] แจ้งเหตุฉุกเฉิน: ${contact.name} โปรดติดต่อผู้ป่วยด่วน พร้อมพิกัดตำแหน่งปัจจุบัน`,
    })
  }, [])

  // step 2: countdown → auto-call
  useEffect(() => {
    if (called) return
    if (left <= 0) {
      setCalled(true)
      return
    }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000)
    return () => clearTimeout(id)
  }, [left, called])

  const pct = (left / total) * 100
  const R = 54
  const C = 2 * Math.PI * R

  if (called) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-6" style={{ background: '#D9483E' }}>
        <Phone size={48} className="mb-4" />
        <h1 className="font-heading text-[26px] font-semibold mb-2">กำลังโทร 1669…</h1>
        <p className="text-[14px] opacity-90 mb-8">สถาบันการแพทย์ฉุกเฉินแห่งชาติ</p>
        <button onClick={() => navigate(-1)} className="bg-white text-danger font-heading font-semibold px-6 py-3 rounded-btn">
          ฉันไม่เป็นไรแล้ว — กลับสู่แอป
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cam text-white p-6">
      {/* step 1 confirmation */}
      <div className="flex items-center gap-2 bg-[#2F6F62] px-4 py-3 rounded-btn mb-8 max-w-[440px]">
        <Check size={20} className="flex-shrink-0" />
        <p className="text-[13.5px]">
          ส่งข้อความแจ้งเตือนไปยัง <strong>{contact.name}</strong> พร้อมตำแหน่งปัจจุบันแล้ว
          <MapPin size={13} className="inline ml-1 -mt-0.5" />
        </p>
      </div>

      <p className="text-[15px] opacity-80 mb-4">กำลังจะโทร 1669 อัตโนมัติใน</p>
      <div className="relative w-[140px] h-[140px] mb-8">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={R} fill="none" stroke="#D9483E" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C - (C * pct) / 100}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[44px] font-medium">{left}</div>
      </div>

      <div className="w-full max-w-[380px] space-y-3">
        <button
          onClick={() => navigate(-1)}
          className="w-full bg-white text-teal-900 font-heading font-semibold py-3.5 rounded-btn text-[15px]"
        >
          ยกเลิกการโทร 1669 — ฉันไม่เป็นไร
        </button>
        <button
          onClick={() => setCalled(true)}
          className="w-full border border-white/40 text-white font-heading font-medium py-3 rounded-btn text-[14px] flex items-center justify-center gap-2"
        >
          <Phone size={17} /> โทร 1669 ทันทีตอนนี้เลย
        </button>
      </div>
    </div>
  )
}
