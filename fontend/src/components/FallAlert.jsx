import { useEffect, useState } from 'react'
import { Phone } from './icons.jsx'

// Fall-detected overlay: counts down and auto-triggers the emergency flow unless
// the patient cancels ("ฉันไม่เป็นไร"). Shown over a live BIG session.
export default function FallAlert({ onSafe, onCall, seconds = 15 }) {
  const [left, setLeft] = useState(seconds)

  useEffect(() => {
    if (left <= 0) { onCall(); return }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-[420px] p-7 text-center shadow-2xl">
        <div className="text-[46px] leading-none mb-2">⚠️</div>
        <h2 className="font-heading text-[23px] font-semibold text-danger mb-1">ตรวจพบการล้ม</h2>
        <p className="text-[14px] text-ink-secondary mb-1">คุณต้องการความช่วยเหลือหรือไม่?</p>
        <p className="text-[13px] text-ink-muted mb-5">
          จะโทรแจ้งเหตุฉุกเฉินอัตโนมัติใน <span className="font-heading text-[16px] font-semibold text-danger">{left}</span> วินาที
        </p>

        <button
          onClick={onCall}
          className="w-full py-3 rounded-pill text-white font-semibold text-[15px] flex items-center justify-center gap-2 mb-2"
          style={{ background: '#D9483E' }}
        >
          <Phone size={18} /> โทรฉุกเฉินเดี๋ยวนี้
        </button>
        <button
          onClick={onSafe}
          className="w-full py-2.5 rounded-pill border border-line text-ink-secondary font-semibold text-[14px] hover:bg-bg transition-colors"
        >
          ฉันไม่เป็นไร
        </button>
      </div>
    </div>
  )
}
