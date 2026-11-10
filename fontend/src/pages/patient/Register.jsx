import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.jsx'
import { Field, Input, Button } from '../../components/ui.jsx'
import { User, Phone, Mail, Lock, Check, ChevronRight } from '../../components/icons.jsx'
import { PARKINSON_STAGES } from '../../lib/mockData.js'
import { useAuth } from '../../context/AuthContext.jsx'

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const phoneOk = (v) => v.replace(/\D/g, '').length >= 9

// The mockup shows "ระยะที่ N" on one line and the explanation underneath;
// PARKINSON_STAGES stores both in one string joined by an em dash.
const splitStage = (label) => {
  const [title, ...rest] = label.split(' — ')
  return { title, desc: rest.join(' — ') }
}

// Mockup radio card: 3px border, blue tint when selected, check in a round dot.
function ChoiceCard({ selected, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center gap-4 text-left min-h-[60px] px-4 py-2.5 rounded-btn border-[3px] transition-colors ${
        selected ? 'border-teal-700 bg-teal-100' : 'border-line bg-surface hover:bg-teal-50'
      }`}
    >
      <span
        className={`w-7 h-7 rounded-full border-[3px] flex items-center justify-center flex-shrink-0 ${
          selected ? 'border-teal-700 bg-teal-700 text-white' : 'border-line bg-surface'
        }`}
      >
        {selected && <Check size={16} />}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-b-base font-bold">{title}</span>
        {desc && <span className="text-b-sm text-ink-secondary">{desc}</span>}
      </span>
    </button>
  )
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: 'สมชาย ใจดี', phone: '089-123-4567', email: 'patient@demo.com',
    password: 'demo1234', stage: 'stage1', fall: 'no',
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const pick = (k, v) => () => setForm((f) => ({ ...f, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'กรุณากรอกชื่อ-นามสกุล'
    if (!phoneOk(form.phone)) errs.phone = 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง'
    if (form.email && !emailOk(form.email)) errs.email = 'อีเมลไม่ถูกต้อง'
    if (form.password.length < 8) errs.password = 'รหัสผ่านอย่างน้อย 8 ตัวอักษร'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      await register({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        parkinsonStage: form.stage,
        fallHistory: form.fall === 'yes',
        role: 'patient',
      })
      navigate('/onboarding/consent')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <div>
        <h1 className="font-heading text-b-h1 font-bold m-0 mb-2.5">สมัครสมาชิก</h1>
        <p className="text-b-base text-ink-secondary m-0">ขั้นตอนที่ 1 จาก 3 · ข้อมูลของคุณ</p>
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-1">
        <Field label="ชื่อ-นามสกุล" error={errors.name}>
          <Input icon={User} placeholder="เช่น สมชาย ใจดี" value={form.name} onChange={set('name')} />
        </Field>

        <Field label="เบอร์โทรศัพท์" error={errors.phone}>
          <Input icon={Phone} placeholder="08X-XXX-XXXX" value={form.phone} onChange={set('phone')} />
          <p className="text-b-sm text-ink-secondary mt-2 m-0">
            ใช้ติดต่อเมื่อมีเหตุฉุกเฉิน · การแจ้งเตือนให้ฝึกส่งทาง LINE
          </p>
        </Field>

        <Field label="อีเมล (ไม่บังคับ)" error={errors.email}>
          <Input icon={Mail} type="email" placeholder="name@example.com" value={form.email} onChange={set('email')} />
        </Field>

        <Field label="ตั้งรหัสผ่าน" error={errors.password}>
          <Input icon={Lock} type="password" placeholder="อย่างน้อย 8 ตัวอักษร" value={form.password} onChange={set('password')} />
        </Field>

        <div className="flex flex-col gap-3 mb-5">
          <span className="text-b-label font-bold">ระยะอาการตามที่แพทย์แจ้ง</span>
          {PARKINSON_STAGES.map((s) => {
            const { title, desc } = splitStage(s.label)
            return (
              <ChoiceCard
                key={s.value}
                selected={form.stage === s.value}
                title={title}
                desc={desc}
                onClick={pick('stage', s.value)}
              />
            )
          })}
        </div>

        <div className="flex flex-col gap-3 mb-5">
          <span className="text-b-label font-bold">เคยมีประวัติการล้มหรือไม่</span>
          <ChoiceCard
            selected={form.fall === 'no'}
            title="ไม่เคยมีประวัติการล้ม"
            onClick={pick('fall', 'no')}
          />
          <ChoiceCard
            selected={form.fall === 'yes'}
            title="เคยมีประวัติการล้ม"
            desc="เพื่อความปลอดภัย ควรมีผู้ดูแลอยู่ด้วยขณะทำกายภาพ"
            onClick={pick('fall', 'yes')}
          />
        </div>

        <Button as="button" type="submit" disabled={busy} className="w-full">
          {busy ? 'กำลังสมัคร…' : (
            <>ถัดไป<ChevronRight size={22} /></>
          )}
        </Button>
      </form>

      <p className="text-b-base text-center m-0">
        มีบัญชีอยู่แล้ว?{' '}
        <Link to="/login" className="font-bold text-teal-700 hover:underline">เข้าสู่ระบบ</Link>
      </p>

      <Link to="/therapist/register" className="text-b-label font-bold text-center text-teal-700 hover:underline">
        สำหรับนักกายภาพบำบัด สมัครที่นี่
      </Link>
    </AuthLayout>
  )
}
