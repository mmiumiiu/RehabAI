import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.jsx'
import { Field, Input, Select, Button } from '../../components/ui.jsx'
import { Mail, Lock, User } from '../../components/icons.jsx'
import { PARKINSON_STAGES } from '../../lib/mockData.js'
import { useAuth } from '../../context/AuthContext.jsx'

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', stage: 'stage1', accept: false,
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'กรุณากรอกชื่อ-นามสกุล'
    if (!emailOk(form.email)) errs.email = 'อีเมลไม่ถูกต้อง'
    if (form.password.length < 6) errs.password = 'รหัสผ่านอย่างน้อย 6 ตัวอักษร'
    if (form.password !== form.confirm) errs.confirm = 'รหัสผ่านไม่ตรงกัน'
    if (!form.accept) errs.accept = 'กรุณายอมรับข้อตกลงก่อนสมัคร'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      await register({ name: form.name, email: form.email, parkinsonStage: form.stage, role: 'patient' })
      navigate('/onboarding/select-therapist')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <div className="text-right mb-4">
        <Link to="/therapist/register" className="text-[12.5px] text-teal-700 font-semibold hover:underline">
          เป็นนักกายภาพบำบัด?
        </Link>
      </div>
      <h2 className="font-heading text-[22px] font-semibold text-teal-900 mb-1.5">สร้างบัญชีใหม่</h2>
      <p className="text-[13.5px] text-ink-secondary mb-6">ใช้เวลาเพียงไม่กี่นาที</p>

      <form onSubmit={submit} noValidate>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="ชื่อ-นามสกุล" error={errors.name}>
            <Input icon={User} placeholder="สมชาย ใจดี" value={form.name} onChange={set('name')} />
          </Field>
          <Field label="อีเมล" error={errors.email}>
            <Input icon={Mail} type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="รหัสผ่าน" error={errors.password}>
            <Input icon={Lock} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
          </Field>
          <Field label="ยืนยันรหัสผ่าน" error={errors.confirm}>
            <Input icon={Lock} type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} />
          </Field>
        </div>
        <Field label="ระยะอาการของโรคพาร์กินสัน (Hoehn & Yahr)">
          <Select value={form.stage} onChange={set('stage')}>
            {PARKINSON_STAGES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
          <p className="text-[11.5px] text-ink-muted mt-1.5 leading-relaxed">
            RehabAI ออกแบบมาสำหรับผู้ป่วยระยะ 1-2 ที่ยังช่วยเหลือตนเองได้ หากมีอาการรุนแรงกว่านี้
            แนะนำให้ปรึกษานักกายภาพบำบัดก่อนใช้งาน
          </p>
        </Field>
        <label className="flex items-start gap-2.5 text-[12.5px] text-ink-secondary my-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.accept}
            onChange={(e) => setForm((f) => ({ ...f, accept: e.target.checked }))}
            className="accent-teal-700 mt-0.5"
          />
          <span>ฉันยอมรับข้อตกลงการใช้งานและนโยบายความเป็นส่วนตัว</span>
        </label>
        {errors.accept && <p className="field-error -mt-2 mb-2">{errors.accept}</p>}
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'กำลังสมัคร…' : 'สมัครสมาชิก'}
        </button>
      </form>

      <p className="text-center text-[13px] text-ink-secondary mt-5">
        มีบัญชีอยู่แล้ว?{' '}
        <Link to="/login" className="text-teal-700 font-semibold hover:underline">เข้าสู่ระบบ</Link>
      </p>
    </AuthLayout>
  )
}
