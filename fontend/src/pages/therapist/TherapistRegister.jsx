import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.jsx'
import { Field, Input, Select, Button } from '../../components/ui.jsx'
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
  return null
}

// Mockup notice cards: tinted fill + 2px border in the same hue.
const checkStyles = {
  ok: { background: '#E3F1DC', borderColor: '#BFDDB0', color: '#24661A' },
  warn: { background: '#FFF1C7', borderColor: '#E6CF86', color: '#6B4A00' },
  neutral: { background: '#E0F1FA', borderColor: '#B4DCEC', color: '#0B3550' },
}

export default function TherapistRegister() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [region, setRegion] = useState(REGIONS[0])
  const hospitals = REGION_HOSPITALS[region] || []
  const [form, setForm] = useState({
    hospital: hospitals[0] || '', position: 'นักกายภาพบำบัด', name: 'กภ.สมหญิง ดีงาม', email: 'therapist@demo.com', password: 'demo1234',
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
          <div className="w-20 h-20 rounded-[24px] bg-warn-bg text-warn-fg flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={40} />
          </div>
          <h1 className="font-heading text-b-h1 font-bold m-0">รอการตรวจสอบ</h1>
        </div>
        <div
          className="rounded-[18px] border-2 p-5 text-b-base font-semibold leading-[1.6]"
          style={checkStyles.warn}
        >
          การเช็คโดเมนอีเมลเป็นเพียงสัญญาณเบื้องต้นเท่านั้น ทีมงานจะติดต่อแผนกกายภาพบำบัดของ
          {' '}<strong>{form.hospital}</strong> เพื่อยืนยันตัวตนอีกครั้งก่อนเปิดใช้งานบัญชีเสมอ
          ระบบจะแจ้งผลภายใน 1-2 วันทำการ ระหว่างนี้ยังไม่สามารถดูข้อมูลผู้ป่วยได้
        </div>
        <Button as="button" onClick={() => navigate('/therapist/patients')} className="w-full">
          เข้าสู่ระบบ (โหมดสาธิต)
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout therapist>
      <div>
        <h1 className="font-heading text-b-h1 font-bold m-0 mb-2.5">สมัครสมาชิกนักกายภาพบำบัด</h1>
        <p className="text-b-base text-ink-secondary m-0">
          เลือกโรงพยาบาลที่คุณสังกัด — บัญชีทุกบัญชีต้องได้รับการยืนยันจากโรงพยาบาลก่อนใช้งาน
        </p>
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-1">
        <Field label="เลือกภาค">
          <Select icon={MapPin} value={region} onChange={changeRegion}>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="สังกัดโรงพยาบาล" error={errors.hospital}>
          <Select icon={Hospital} value={form.hospital} onChange={set('hospital')}>
            {hospitals.map((h) => <option key={h} value={h}>{h}</option>)}
          </Select>
          <p className="text-b-sm text-ink-secondary mt-2 m-0">
            ไม่พบโรงพยาบาลของคุณในรายการ?{' '}
            <button type="button" className="font-bold text-teal-700 hover:underline">เพิ่มโรงพยาบาลใหม่</button>
            {' '}(ทีมงานตรวจสอบก่อนเผยแพร่)
          </p>
        </Field>

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
          <div
            className="flex items-start gap-4 rounded-[18px] border-2 px-5 py-4 -mt-2 mb-5 text-b-base font-semibold leading-[1.6]"
            style={checkStyles[check.tone]}
          >
            {check.tone === 'ok' && <span className="flex-shrink-0 mt-1"><Check size={22} /></span>}
            <span>{check.text}</span>
          </div>
        )}

        <Field label="รหัสผ่าน" error={errors.password}>
          <Input icon={Lock} type="password" placeholder="อย่างน้อย 8 ตัวอักษร" value={form.password} onChange={set('password')} />
        </Field>
        <Button as="button" type="submit" className="w-full">ส่งคำขอสมัคร</Button>
      </form>

      <p className="text-b-base text-center text-ink-secondary m-0">
        มีบัญชีอยู่แล้ว?{' '}
        <Link to="/therapist/login" className="font-bold text-teal-700 hover:underline">เข้าสู่ระบบ</Link>
      </p>

      <Link to="/register" className="text-b-label font-bold text-center text-teal-700 hover:underline">
        สำหรับผู้ป่วย สมัครที่นี่
      </Link>
    </AuthLayout>
  )
}
