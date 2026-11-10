import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.jsx'
import { Field, Input, Button } from '../../components/ui.jsx'
import { Phone, Lock, ChevronRight } from '../../components/icons.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'patient@demo.com', password: 'demo1234', remember: true })
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
      <div>
        <h1 className="font-heading text-b-h1 font-bold m-0 mb-2.5">เข้าสู่ระบบ</h1>
        <p className="text-b-base text-ink-secondary m-0">ยินดีต้อนรับกลับมา ฝึกต่อจากครั้งที่แล้วได้เลย</p>
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-1">
        <Field label="อีเมลหรือเบอร์โทรศัพท์" error={errors.email}>
          <Input icon={Phone} type="email" placeholder="เช่น 089-123-4567" value={form.email} onChange={set('email')} />
        </Field>
        <Field label="รหัสผ่าน" error={errors.password}>
          <Input icon={Lock} type="password" placeholder="กรอกรหัสผ่าน" value={form.password} onChange={set('password')} />
        </Field>

        <label className="flex items-center gap-4 text-b-base font-semibold cursor-pointer mb-5">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
            className="w-[26px] h-[26px] accent-teal-700"
          />
          จำฉันไว้ในเครื่องนี้
        </label>

        <Button as="button" type="submit" disabled={busy} className="w-full">
          {busy ? 'กำลังเข้าสู่ระบบ…' : (
            <>เข้าสู่ระบบ<ChevronRight size={22} /></>
          )}
        </Button>
      </form>

      <a href="#" className="text-b-base font-bold text-center text-teal-700 hover:underline">ลืมรหัสผ่าน</a>

      <div className="h-[2px] bg-line" />

      <p className="text-b-base text-center m-0">ยังไม่มีบัญชี?</p>

      <Button variant="outline" to="/register" className="w-full">สมัครสมาชิกใหม่</Button>

      <Link to="/therapist/login" className="text-b-label font-bold text-center text-teal-700 hover:underline">
        สำหรับนักกายภาพบำบัด เข้าสู่ระบบที่นี่
      </Link>
    </AuthLayout>
  )
}
