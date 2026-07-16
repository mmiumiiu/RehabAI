import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.jsx'
import { Field, Input, Select } from '../../components/ui.jsx'
import { Mail, Lock, User, ShieldCheck, MapPin, Hospital, Check } from '../../components/icons.jsx'
import { REGIONS, REGION_HOSPITALS, HOSPITAL_DOMAINS } from '../../lib/mockData.js'
import { useAuth } from '../../context/AuthContext.jsx'

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const domainOf = (email) => (email.includes('@') ? email.split('@')[1].toLowerCase().trim() : '')

// Real-time email/hospital domain check (spec §4.2). This is only a soft signal
// for the manual reviewer — it never auto-approves the account.
function domainCheck(hospital, email) {
  const bound = HOSPITAL_DOMAINS[hospital]
  const typed = domainOf(email)
  if (!bound) {
    return { tone: 'neutral', text: `โรงพยาบาลนี้ยังไม่มีข้อมูลโดเมนอีเมลในระบบ จะใช้การตรวจสอบแบบ manual review ทั้งหมด` }
  }
  if (!typed) return null
  if (typed === bound || typed.endsWith('.' + bound)) {
    return { tone: 'ok', text: `อีเมลตรงกับโดเมนของ ${hospital} — ผ่านการเช็คเบื้องต้นอัตโนมัติ` }
  }
  return {
    tone: 'warn',
    text: `อีเมลนี้ไม่ตรงกับโดเมนของ ${hospital} (@${bound}) ระบบจะส่งให้ทีมงานตรวจสอบเพิ่มเติมแบบ manual review`,
  }
}

const checkStyles = {
  ok: { background: '#E6F0E1', color: '#3B6D11' },
  warn: { background: '#FDF3D9', color: '#9A6B0A' },
  neutral: { background: '#F0EEE6', color: '#5B6B66' },
}

export default function TherapistRegister() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [region, setRegion] = useState(REGIONS[0])
  const hospitals = REGION_HOSPITALS[region] || []
  const [form, setForm] = useState({
    hospital: hospitals[0] || '', position: '', name: '', email: '', password: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function changeRegion(e) {
    const r = e.target.value
    setRegion(r)
    setForm((f) => ({ ...f, hospital: (REGION_HOSPITALS[r] || [])[0] || '' }))
  }

  const check = useMemo(() => domainCheck(form.hospital, form.email), [form.hospital, form.email])

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.hospital) errs.hospital = 'กรุณาเลือกโรงพยาบาล'
    if (!form.position.trim()) errs.position = 'กรุณากรอกตำแหน่ง'
    if (!form.name.trim()) errs.name = 'กรุณากรอกชื่อ'
    if (!emailOk(form.email)) errs.email = 'อีเมลไม่ถูกต้อง'
    if (form.password.length < 6) errs.password = 'รหัสผ่านอย่างน้อย 6 ตัวอักษร'
    setErrors(errs)
    if (Object.keys(errs).length) return
    await register({ name: form.name, email: form.email, role: 'therapist' })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <AuthLayout therapist>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-warn-bg text-warn-fg flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={28} />
          </div>
          <h2 className="font-heading text-[20px] font-semibold text-teal-900 mb-2">รอการตรวจสอบ</h2>
        </div>
        <div className="rounded-btn p-4 text-[13px] leading-relaxed" style={{ background: '#FDF3D9', color: '#9A6B0A' }}>
          การเช็คโดเมนอีเมลเป็นเพียงสัญญาณเบื้องต้นเท่านั้น ทีมงานจะติดต่อแผนกกายภาพบำบัดของ
          {' '}<strong>{form.hospital}</strong> เพื่อยืนยันตัวตนอีกครั้งก่อนเปิดใช้งานบัญชีเสมอ
          ระบบจะแจ้งผลภายใน 1-2 วันทำการ ระหว่างนี้ยังไม่สามารถดูข้อมูลผู้ป่วยได้
        </div>
        <button onClick={() => navigate('/therapist/patients')} className="btn-primary mt-5">
          เข้าสู่ระบบ (โหมดสาธิต)
        </button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout therapist>
      <div className="text-right mb-4">
        <Link to="/register" className="text-[12.5px] text-teal-700 font-semibold hover:underline">เป็นผู้ป่วย?</Link>
      </div>
      <h2 className="font-heading text-[22px] font-semibold text-teal-900 mb-1.5">สมัครสมาชิกนักกายภาพบำบัด</h2>
      <p className="text-[13.5px] text-ink-secondary mb-6">เลือกโรงพยาบาลที่คุณสังกัด — บัญชีทุกบัญชีต้องได้รับการยืนยันจากโรงพยาบาลก่อนใช้งาน</p>

      <form onSubmit={submit} noValidate>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="เลือกภาค">
            <Select icon={MapPin} value={region} onChange={changeRegion}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="สังกัดโรงพยาบาล" error={errors.hospital}>
            <Select icon={Hospital} value={form.hospital} onChange={set('hospital')}>
              {hospitals.map((h) => <option key={h} value={h}>{h}</option>)}
            </Select>
          </Field>
        </div>
        <p className="text-[11.5px] text-ink-muted -mt-2 mb-4">
          ไม่พบโรงพยาบาลของคุณในรายการ?{' '}
          <button type="button" className="text-teal-700 font-semibold hover:underline">เพิ่มโรงพยาบาลใหม่</button>
          {' '}(ทีมงานตรวจสอบก่อนเผยแพร่)
        </p>

        <Field label="ตำแหน่งในโรงพยาบาล" error={errors.position}>
          <Input icon={ShieldCheck} placeholder="เช่น นักกายภาพบำบัด, นักกายภาพบำบัดชำนาญการ" value={form.position} onChange={set('position')} />
        </Field>

        <Field label="ชื่อ-นามสกุล" error={errors.name}>
          <Input icon={User} value={form.name} onChange={set('name')} />
        </Field>

        <Field label="อีเมลที่ใช้งาน" error={errors.email}>
          <Input icon={Mail} type="email" value={form.email} onChange={set('email')} />
        </Field>
        {check && (
          <div className="flex items-start gap-2 rounded-btn px-3.5 py-2.5 -mt-2 mb-4 text-[12px] leading-relaxed" style={checkStyles[check.tone]}>
            {check.tone === 'ok' && <span className="flex-shrink-0 mt-0.5"><Check size={14} /></span>}
            <span>{check.text}</span>
          </div>
        )}

        <Field label="รหัสผ่าน" error={errors.password}>
          <Input icon={Lock} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
        </Field>
        <button type="submit" className="btn-primary">สมัครสมาชิก</button>
      </form>

      <p className="text-center text-[13px] text-ink-secondary mt-5">
        มีบัญชีอยู่แล้ว?{' '}
        <Link to="/therapist/login" className="text-teal-700 font-semibold hover:underline">เข้าสู่ระบบ</Link>
      </p>
    </AuthLayout>
  )
}
