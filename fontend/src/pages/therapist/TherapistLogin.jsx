import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.jsx'
import { Field, Input, Button } from '../../components/ui.jsx'
import { Mail, Lock } from '../../components/icons.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export default function TherapistLogin() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'therapist@demo.com', password: 'demo1234' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!emailOk(form.email)) errs.email = 'กรุณากรอกอีเมลให้ถูกต้อง'
    if (!form.password) errs.password = 'กรุณากรอกรหัสผ่าน'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      await signIn({ email: form.email, password: form.password, role: 'therapist' })
      navigate('/therapist/patients')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout therapist>
      {/* segmented control — role clarity is higher here (spec §4.1) */}
      <div className="flex gap-1 p-1.5 bg-teal-50 border-2 border-line rounded-btn text-b-sm font-bold">
        <Link to="/login" className="flex-1 text-center py-2.5 rounded-[14px] text-ink-secondary">ผู้ป่วย</Link>
        <span className="flex-1 text-center py-2.5 rounded-[14px] bg-teal-700 text-white">นักกายภาพบำบัด</span>
      </div>

      <div>
        <h1 className="font-heading text-b-h1 font-bold m-0 mb-2.5">เข้าสู่ระบบ</h1>
        <p className="text-b-base text-ink-secondary m-0">สำหรับนักกายภาพบำบัดที่ยืนยันตัวตนแล้ว</p>
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-1">
        <Field label="อีเมล" error={errors.email}>
          <Input icon={Mail} type="email" placeholder="you@clinic.com" value={form.email} onChange={set('email')} />
        </Field>
        <Field label="รหัสผ่าน" error={errors.password}>
          <Input icon={Lock} type="password" placeholder="กรอกรหัสผ่าน" value={form.password} onChange={set('password')} />
        </Field>
        <Button as="button" type="submit" disabled={busy} className="w-full">
          {busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
        </Button>
      </form>

      <p className="text-b-base text-center text-ink-secondary m-0">
        ยังไม่มีบัญชี?{' '}
        <Link to="/therapist/register" className="font-bold text-teal-700 hover:underline">สมัครสมาชิกนักกายภาพบำบัด</Link>
      </p>
    </AuthLayout>
  )
}
