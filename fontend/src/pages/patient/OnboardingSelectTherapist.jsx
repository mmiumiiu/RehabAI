import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Users } from '../../components/icons.jsx'
import TherapistPicker from '../../components/TherapistPicker.jsx'
import { therapistLink } from '../../lib/services.js'

// Shown right after register, before the emergency-contact step (spec §3.3).
// Also reused as the "เปลี่ยนนักกายภาพบำบัด" flow from the profile (?change=1),
// in which case it returns to /profile instead of continuing onboarding.
export default function OnboardingSelectTherapist() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const isChange = params.get('change') === '1'
  const [picked, setPicked] = useState(null)
  const [busy, setBusy] = useState(false)

  async function proceed() {
    setBusy(true)
    // Auto-link immediately — status "approved", no pending state (spec §6.1).
    await therapistLink.set(picked)
    navigate(isChange ? '/profile' : '/onboarding/emergency-contact')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[480px] card p-8 shadow-card">
        <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-900 flex items-center justify-center mx-auto mb-4">
          <Users size={28} />
        </div>
        <h1 className="font-heading text-[22px] font-semibold text-teal-900 text-center mb-2">
          {isChange ? 'เปลี่ยนนักกายภาพบำบัด' : 'เลือกนักกายภาพบำบัดของคุณ'}
        </h1>
        <p className="text-[13px] text-ink-secondary text-center leading-relaxed mb-6">
          เนื่องจากคุณเคยไปพบนักกายภาพบำบัดที่โรงพยาบาลมาแล้วอย่างน้อย 1 ครั้ง เลือกตามขั้นตอนด้านล่างได้เลย —
          กดเลือกทั้งหมด ไม่ต้องพิมพ์ เพื่อป้องกันการกรอกผิดพลาด
        </p>

        <TherapistPicker onSelect={setPicked} />

        <button onClick={proceed} className="btn-primary mt-2" disabled={busy || !picked}>
          {busy ? 'กำลังเชื่อมต่อ…' : isChange ? 'บันทึกการเปลี่ยนแปลง' : 'ดำเนินการต่อ'}
        </button>

        <p className="text-center text-[12px] text-ink-muted mt-4 leading-relaxed">
          ไม่พบโรงพยาบาลหรือนักกายภาพบำบัดของคุณในรายการ?{' '}
          <button type="button" className="text-teal-700 font-semibold hover:underline">ติดต่อทีมงาน</button>
        </p>
      </div>
    </div>
  )
}
