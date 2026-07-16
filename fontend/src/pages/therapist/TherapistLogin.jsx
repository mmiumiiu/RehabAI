import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.jsx'
import { Field, Input } from '../../components/ui.jsx'
import { Mail, Lock } from '../../components/icons.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export default function TherapistLogin() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
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
      <div className="flex p-1 bg-bg rounded-btn mb-6 text-[13px] font-medium">
        <Link to="/login" className="flex-1 text-center py-2 rounded-md text-ink-secondary">ผู้ป่วย</Link>
        <span className="flex-1 text-center py-2 rounded-md bg-teal-700 text-white">นักกายภาพบำบัด</span>
      </div>
      <h2 className="font-heading text-[22px] font-semibold text-teal-900 mb-1.5">เข้าสู่ระบบ</h2>
      <p className="text-[13.5px] text-ink-secondary mb-6">สำหรับนักกายภาพบำบัดที่ยืนยันตัวตนแล้ว</p>

      <form onSubmit={submit} noValidate>
        <Field label="อีเมล" error={errors.email}>
          <Input icon={Mail} type="email" placeholder="you@clinic.com" value={form.email} onChange={set('email')} />
        </Field>
        <Field label="รหัสผ่าน" error={errors.password}>
          <Input icon={Lock} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
        </Field>
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
        </button>
      </form>

      <p className="text-center text-[13px] text-ink-secondary mt-5">
        ยังไม่มีบัญชี?{' '}
        <Link to="/therapist/register" className="text-teal-700 font-semibold hover:underline">สมัครสมาชิกนักกายภาพบำบัด</Link>
      </p>
    </AuthLayout>
  )
}
