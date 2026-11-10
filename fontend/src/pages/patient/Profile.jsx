import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Field, Input, Select, Button, Badge } from '../../components/ui.jsx'
import {
  Mail, Phone, User, Bell, ShieldCheck, Chat, ChevronRight, Refresh, LogOut, Trash, Lock, Camera,
} from '../../components/icons.jsx'
import { PARKINSON_STAGES } from '../../lib/mockData.js'
import { therapistLink } from '../../lib/services.js'
import { useAuth } from '../../context/AuthContext.jsx'

// "โปรไฟล์ของฉัน" — the "#profile" section of design/bridge-mockup.html.
// Mockup px ÷ 1.4 (the patient portal body zoom).

function Section({ title, children, className = '' }) {
  return (
    <section className={`bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-4 ${className}`}>
      {title && <h2 className="font-heading text-b-h2 font-bold m-0 leading-[1.3]">{title}</h2>}
      {children}
    </section>
  )
}

// Mockup link row: icon tile, label + description, chevron.
function LinkRow({ to, icon: Icon, label, desc, last }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-5 py-4 no-underline text-ink-primary ${last ? '' : 'border-b-2'}`}
      style={last ? undefined : { borderColor: '#E6F1F7' }}
    >
      <span className="w-[51px] h-[51px] rounded-[14px] bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
        <Icon size={24} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-b-btn font-bold">{label}</span>
        {desc && <span className="block text-b-sm text-ink-secondary">{desc}</span>}
      </span>
      <ChevronRight size={24} className="text-ink-secondary flex-shrink-0" />
    </Link>
  )
}

export default function Profile() {
  const { user, updateUser, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '081-234-5678',
    stage: user?.parkinsonStage || 'stage1',
  })
  const [therapist, setTherapist] = useState(() => therapistLink.get())
  const [saved, setSaved] = useState(false)

  async function logout() {
    await signOut()
    navigate('/login')
  }

  async function disconnect() {
    await therapistLink.clear()
    setTherapist(null)
  }

  function save() {
    updateUser({ name: profile.name, phone: profile.phone, parkinsonStage: profile.stage })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const stageLabel = PARKINSON_STAGES.find((s) => s.value === profile.stage)?.short

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">โปรไฟล์ของฉัน</h1>
      </header>

      {/* Identity card */}
      <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-wrap items-center gap-5">
        <span className="w-[86px] h-[86px] rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-b-h2 font-bold flex-shrink-0">
          {profile.name.slice(0, 2)}
        </span>
        <div className="flex-1 min-w-[200px]">
          <div className="text-b-h2 font-bold">{profile.name}</div>
          <div className="text-b-label text-ink-secondary">
            สมาชิกตั้งแต่ {user?.createdAt} · {stageLabel}
          </div>
        </div>
        <Button variant="outline" className="min-h-[51px]">
          <Camera size={22} /> แก้ไขรูป
        </Button>
      </section>

      {/* Personal details */}
      <Section title="ข้อมูลส่วนตัว">
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <Field label="ชื่อ-นามสกุล" className="mb-0">
            <Input icon={User} value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
          </Field>
          <Field label="เบอร์โทรศัพท์" className="mb-0">
            <Input icon={Phone} value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
          </Field>
          <Field label="อีเมล" className="mb-0">
            <Input icon={Mail} value={user?.email || ''} readOnly className="opacity-70" />
          </Field>
          <Field label="ระยะอาการ" className="mb-0">
            <Select value={profile.stage} onChange={(e) => setProfile((p) => ({ ...p, stage: e.target.value }))}>
              {PARKINSON_STAGES.map((s) => <option key={s.value} value={s.value}>{s.short}</option>)}
            </Select>
          </Field>
        </div>
        <Button as="button" onClick={save} className="self-start min-h-[57px]">
          {saved ? 'บันทึกแล้ว ✓' : 'บันทึกข้อมูล'}
        </Button>
      </Section>

      {/* Therapist */}
      <Section title="นักกายภาพของฉัน">
        {therapist ? (
          <>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="w-[51px] h-[51px] rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-b-base font-bold flex-shrink-0">
                {therapist.name.replace(/^กภ\.?|^ก\.พ\.?/, '').trim().slice(0, 2)}
              </span>
              <div className="flex-1 min-w-[180px]">
                <div className="text-b-btn font-bold">{therapist.name}</div>
                <div className="text-b-sm text-ink-secondary">{therapist.pos}</div>
                <div className="text-b-sm text-ink-secondary">{therapist.hospital}</div>
              </div>
              <Badge tone="done">เชื่อมต่อแล้ว</Badge>
            </div>
            <p className="text-b-sm text-ink-secondary leading-[1.6] m-0">
              เชื่อมต่ออัตโนมัติตอนเลือกในระบบ เนื่องจากเป็นนักกายภาพบำบัดที่ยืนยันตัวตนแล้วและคุณเคยพบตัวจริงมาก่อน จึงไม่ต้องรออนุมัติ
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button variant="outline" onClick={() => navigate('/onboarding/select-therapist?change=1')} className="min-h-[54px]">
                <Refresh size={20} /> เปลี่ยนนักกายภาพ
              </Button>
              <Button variant="danger" onClick={disconnect} className="min-h-[54px]">ยกเลิกการเชื่อมต่อ</Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-b-base text-ink-secondary leading-[1.6] m-0">
              คุณยังไม่ได้เชื่อมต่อกับนักกายภาพบำบัด เลือกจากรายชื่อที่ยืนยันตัวตนแล้วเพื่อให้เห็นความคืบหน้าและแชทได้
            </p>
            <Button as="button" onClick={() => navigate('/onboarding/select-therapist?change=1')} className="self-start min-h-[57px]">
              เลือกนักกายภาพ
            </Button>
          </>
        )}
      </Section>

      {/* Settings links */}
      <Section>
        <LinkRow
          to="/settings/notifications"
          icon={Bell}
          label="การแจ้งเตือนทาง LINE"
          desc="เชื่อมต่อ LINE และตั้งวัน เวลาที่ให้เตือน"
        />
        <LinkRow
          to="/settings/emergency"
          icon={ShieldCheck}
          label="ผู้ติดต่อฉุกเฉิน"
          desc="คนที่จะได้รับข้อความถ้าเกิดเหตุ"
        />
        <LinkRow
          to="/chat"
          icon={Chat}
          label="แชทกับนักกายภาพ"
          desc="ไม่ใช่ช่องทางฉุกเฉิน ตอบภายใน 1-2 วันทำการ"
          last
        />
      </Section>

      {/* Change password */}
      <Section title="เปลี่ยนรหัสผ่าน">
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <Field label="รหัสผ่านปัจจุบัน" className="mb-0">
            <Input icon={Lock} type="password" placeholder="กรอกรหัสผ่านปัจจุบัน" />
          </Field>
          <Field label="รหัสผ่านใหม่" className="mb-0">
            <Input icon={Lock} type="password" placeholder="อย่างน้อย 8 ตัวอักษร" />
          </Field>
          <Field label="ยืนยันรหัสผ่านใหม่" className="mb-0">
            <Input icon={Lock} type="password" placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง" />
          </Field>
        </div>
        <Button variant="outline" className="self-start min-h-[54px]">อัปเดตรหัสผ่าน</Button>
      </Section>

      {/* Danger zone */}
      <section
        className="rounded-card border-2 p-6 flex flex-col gap-4"
        style={{ background: '#FBE3E0', borderColor: '#EDB3AD' }}
      >
        <h2 className="font-heading text-b-h2 font-bold m-0 leading-[1.3]">ออกจากระบบหรือลบบัญชี</h2>
        <p className="text-b-label leading-[1.6] m-0">
          การลบบัญชีจะลบประวัติการฝึกและสวนทั้งหมด กู้คืนไม่ได้
        </p>
        <div className="flex flex-wrap gap-3.5">
          <Button variant="outline" onClick={logout} className="min-h-[57px]">
            <LogOut size={20} /> ออกจากระบบ
          </Button>
          <Button as="button" className="min-h-[57px]">
            <Trash size={20} /> ลบบัญชี
          </Button>
        </div>
      </section>
    </div>
  )
}
