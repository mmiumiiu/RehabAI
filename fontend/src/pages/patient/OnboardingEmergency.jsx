import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Field, Input, Select } from '../../components/ui.jsx'
import { User, Phone, ShieldCheck } from '../../components/icons.jsx'
import { RELATIONSHIPS } from '../../lib/mockData.js'

// Progressive, skippable onboarding shown once after register (spec §3.3)
export default function OnboardingEmergency() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', relationship: 'child', phone: '' })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    // would write to users/{uid}/emergencyContacts
    await new Promise((r) => setTimeout(r, 400))
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[460px] card p-8 shadow-card">
        <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-900 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={28} />
        </div>
        <h1 className="font-heading text-[22px] font-semibold text-teal-900 text-center mb-2">
          ยินดีต้อนรับสู่ RehabAI
        </h1>
        <p className="text-[13.5px] text-ink-secondary text-center leading-relaxed mb-6">
          เพิ่มเบอร์ติดต่อฉุกเฉินไว้ เผื่อเกิดเหตุระหว่างฝึก ใช้เวลาไม่ถึง 1 นาที
          และเพิ่มทีหลังได้ที่หน้าโปรไฟล์
        </p>

        <form onSubmit={save}>
          <div className="grid grid-cols-2 gap-3.5">
            <Field label="ชื่อผู้ติดต่อฉุกเฉิน">
              <Input icon={User} placeholder="ชื่อ-นามสกุล" value={form.name} onChange={set('name')} />
            </Field>
            <Field label="ความสัมพันธ์">
              <Select value={form.relationship} onChange={set('relationship')}>
                {RELATIONSHIPS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="เบอร์โทรศัพท์">
            <Input icon={Phone} type="tel" placeholder="08X-XXX-XXXX" value={form.phone} onChange={set('phone')} />
          </Field>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'กำลังบันทึก…' : 'บันทึกและเข้าใช้งาน'}
          </button>
        </form>

        <button
          onClick={() => navigate('/home')}
          className="w-full text-center text-[12.5px] text-ink-muted mt-4 hover:text-ink-secondary"
        >
          ข้ามไปก่อน (เพิ่มทีหลังได้ที่หน้าโปรไฟล์)
        </button>
      </div>
    </div>
  )
}
