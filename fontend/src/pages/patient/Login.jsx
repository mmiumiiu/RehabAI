import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.jsx'
import { Field, Input, Button } from '../../components/ui.jsx'
import { Mail, Lock } from '../../components/icons.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', remember: true })
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
      await signIn({ email: form.email, password: form.password, role: 'patient' })
      navigate('/home')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <div className="text-right mb-4">
        <Link to="/therapist/login" className="text-[12.5px] text-teal-700 font-semibold hover:underline">
          เป็นนักกายภาพบำบัด?
        </Link>
      </div>
      <h2 className="font-heading text-[22px] font-semibold text-teal-900 mb-1.5">ยินดีต้อนรับกลับ</h2>
      <p className="text-[13.5px] text-ink-secondary mb-6">เข้าสู่ระบบเพื่อฝึกกายภาพบำบัดต่อ</p>

      <form onSubmit={submit} noValidate>
        <Field label="อีเมล" error={errors.email}>
          <Input icon={Mail} type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} />
        </Field>
        <Field label="รหัสผ่าน" error={errors.password}>
          <Input icon={Lock} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
        </Field>
        <div className="flex justify-between items-center text-[12.5px] text-ink-secondary mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
              className="accent-teal-700"
            />
            จดจำฉันไว้
          </label>
          <a href="#" className="text-teal-700 font-semibold hover:underline">ลืมรหัสผ่าน?</a>
        </div>
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
        </button>
      </form>

      <div className="flex items-center gap-2.5 my-5 text-ink-muted text-[12px]">
        <div className="flex-1 h-px bg-line" />หรือ<div className="flex-1 h-px bg-line" />
      </div>
      <p className="text-center text-[13px] text-ink-secondary">
        ยังไม่มีบัญชี?{' '}
        <Link to="/register" className="text-teal-700 font-semibold hover:underline">สมัครสมาชิก</Link>
      </p>
    </AuthLayout>
  )
}
