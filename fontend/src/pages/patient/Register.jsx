import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.jsx'
import { Select } from '../../components/ui.jsx'
import { Activity, Chat } from '../../components/icons.jsx'
import { PARKINSON_STAGES } from '../../lib/mockData.js'
import { useAuth } from '../../context/AuthContext.jsx'

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const inputCls =
  'w-full border-2 border-teal-100 rounded-[14px] px-4 min-h-[52px] text-[15px] bg-[#F4FAF5] outline-none focus:border-teal-600 transition-colors'
const labelCls = 'block text-[13.5px] font-bold mb-1.5 text-[#1F3A2A]'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first: 'สมชาย', last: 'ใจดี', email: 'patient@demo.com', password: 'demo1234', stage: 'stage1', fall: 'no',
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.first.trim()) errs.first = 'กรุณากรอกชื่อ'
    if (!emailOk(form.email)) errs.email = 'อีเมลไม่ถูกต้อง'
    if (form.password.length < 6) errs.password = 'รหัสผ่านอย่างน้อย 6 ตัวอักษร'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      await register({
        name: `${form.first} ${form.last}`.trim(),
        email: form.email,
        parkinsonStage: form.stage,
        fallHistory: form.fall === 'yes',
        role: 'patient',
      })
      navigate('/onboarding/select-therapist')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout hero={false} cardWidth={520}>
      <div className="relative">
        {/* floating confetti */}
        <span className="absolute top-1 right-6 w-3 h-3 rounded-full" style={{ background: '#F7C132' }} />
        <span className="absolute top-8 right-12 w-2 h-2 rounded-full" style={{ background: '#2FA65A' }} />
        <span className="absolute top-2 right-20 w-2.5 h-2.5 rounded-[3px] rotate-[20deg]" style={{ background: '#D9538F' }} />

        {/* header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-[15px] bg-teal-600 flex items-center justify-center overflow-hidden flex-shrink-0" style={{ boxShadow: '0 6px 14px rgba(47,166,90,.35)' }}>
            <img src="/logo.png" alt="RehabAI" className="w-9 h-9 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
          <div>
            <h2 className="font-heading text-[22px] font-semibold text-ink-primary leading-tight">สร้างบัญชีใหม่ 🌱</h2>
            <p className="text-[13.5px] text-ink-secondary">เริ่มต้นเส้นทางการฟื้นฟูของคุณ</p>
          </div>
        </div>

        {/* role selector */}
        <div className="text-[13.5px] font-bold text-[#1F3A2A] mb-2.5">คุณคือใคร?</div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-[16px] border-[2.5px] border-teal-600 bg-teal-100 py-3.5 text-center min-h-[88px] flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center mb-2"><Activity size={19} /></div>
            <div className="text-[14.5px] font-bold text-teal-700">ผู้ป่วย / ผู้ดูแล</div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/therapist/register')}
            className="rounded-[16px] border-2 border-teal-100 bg-white py-3.5 text-center min-h-[88px] flex flex-col items-center justify-center active:translate-y-[2px] transition-transform"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: '#FBE7F1', color: '#B03A76' }}><Chat size={19} /></div>
            <div className="text-[14.5px] font-bold text-ink-secondary">นักกายภาพบำบัด</div>
          </button>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="grid grid-cols-2 gap-3.5 mb-3.5">
            <div>
              <label className={labelCls}>ชื่อ</label>
              <input className={inputCls} placeholder="สมชาย" value={form.first} onChange={set('first')} />
              {errors.first && <p className="field-error mt-1">{errors.first}</p>}
            </div>
            <div>
              <label className={labelCls}>นามสกุล</label>
              <input className={inputCls} placeholder="ใจดี" value={form.last} onChange={set('last')} />
            </div>
          </div>

          <div className="mb-3.5">
            <label className={labelCls}>อีเมลหรือเบอร์โทรศัพท์</label>
            <input className={inputCls} type="email" placeholder="somchai@email.com" value={form.email} onChange={set('email')} />
            {errors.email && <p className="field-error mt-1">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className={labelCls}>รหัสผ่าน</label>
            <input className={inputCls} type="password" placeholder="อย่างน้อย 8 ตัวอักษร" value={form.password} onChange={set('password')} />
            {errors.password && <p className="field-error mt-1">{errors.password}</p>}
          </div>

          <div className="mb-3.5">
            <label className={labelCls}>ระยะอาการของโรคพาร์กินสัน (Hoehn &amp; Yahr)</label>
            <Select value={form.stage} onChange={set('stage')}>
              {PARKINSON_STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>

          <div className="mb-5">
            <label className={labelCls}>เคยมีประวัติการล้มหรือไม่</label>
            <Select value={form.fall} onChange={set('fall')}>
              <option value="no">ไม่เคยมีประวัติการล้ม</option>
              <option value="yes">เคยมีประวัติการล้ม</option>
            </Select>
            {form.fall === 'yes' && (
              <p className="text-[11.5px] text-coral-700 mt-1.5 leading-relaxed">
                เพื่อความปลอดภัย ควรมีผู้ดูแลอยู่ด้วยขณะทำกายภาพ
              </p>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'กำลังสมัคร…' : 'สมัครสมาชิก 🎉'}
          </button>
        </form>

        <p className="text-center text-[14px] text-ink-secondary mt-4.5 pt-1">
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/login" className="text-teal-700 font-semibold hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
