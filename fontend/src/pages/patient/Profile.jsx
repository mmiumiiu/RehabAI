import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Field, Input, Select, Button, Avatar, Badge } from '../../components/ui.jsx'
import { Mail, Phone, User, Bell, ShieldCheck, Chat, ChevronRight, Refresh, LogOut, Trash } from '../../components/icons.jsx'
import { PARKINSON_STAGES } from '../../lib/mockData.js'
import { therapistLink } from '../../lib/services.js'
import { useAuth } from '../../context/AuthContext.jsx'

function Block({ title, children }) {
  return (
    <Card className="p-6 mb-5">
      <h3 className="font-heading text-[15px] font-semibold text-teal-900 mb-4">{title}</h3>
      {children}
    </Card>
  )
}

export default function Profile() {
  const { user, updateUser, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    name: user?.name || '', phone: '081-234-5678', stage: user?.parkinsonStage || 'stage1',
  })
  const [therapist, setTherapist] = useState(() => therapistLink.get())

  async function logout() {
    await signOut()
    navigate('/login')
  }

  async function disconnect() {
    await therapistLink.clear()
    setTherapist(null)
  }

  return (
    <div className="max-w-[720px]">
      {/* header */}
      <Card className="p-6 mb-5 flex items-center gap-4">
        <Avatar text={profile.name.slice(0, 2)} size={64} />
        <div>
          <h2 className="font-heading text-[20px] font-semibold text-teal-900">{profile.name}</h2>
          <p className="text-[12.5px] text-ink-secondary">สมัครเมื่อ {user?.createdAt} · {PARKINSON_STAGES.find((s) => s.value === profile.stage)?.short}</p>
        </div>
        <button className="ml-auto text-[12.5px] text-teal-700 font-semibold hover:underline">แก้ไขรูป</button>
      </Card>

      <Block title="ข้อมูลส่วนตัว">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Field label="ชื่อ-นามสกุล">
            <Input icon={User} value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
          </Field>
          <Field label="อีเมล">
            <Input icon={Mail} value={user?.email} readOnly className="opacity-70" />
          </Field>
          <Field label="เบอร์โทรของฉัน">
            <Input icon={Phone} value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
          </Field>
          <Field label="ระยะอาการ">
            <Select value={profile.stage} onChange={(e) => setProfile((p) => ({ ...p, stage: e.target.value }))}>
              {PARKINSON_STAGES.map((s) => <option key={s.value} value={s.value}>{s.short}</option>)}
            </Select>
          </Field>
        </div>
        <Button variant="primary" className="w-auto mt-1" onClick={() => updateUser({ name: profile.name, parkinsonStage: profile.stage })}>
          บันทึกข้อมูล
        </Button>
      </Block>

      <Block title="เปลี่ยนรหัสผ่าน">
        <div className="grid grid-cols-1 gap-0">
          <Field label="รหัสผ่านปัจจุบัน"><Input type="password" placeholder="••••••••" /></Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Field label="รหัสผ่านใหม่"><Input type="password" placeholder="••••••••" /></Field>
            <Field label="ยืนยันรหัสผ่านใหม่"><Input type="password" placeholder="••••••••" /></Field>
          </div>
        </div>
        <Button variant="outline" className="w-auto">อัปเดตรหัสผ่าน</Button>
      </Block>

      <Block title="นักกายภาพบำบัดของคุณ">
        {therapist ? (
          <>
            <div className="flex items-center gap-3 pb-4 border-b border-line">
              <Avatar text={therapist.name.replace(/^กภ\.?|^ก\.พ\.?/, '').trim().slice(0, 2)} size={44} />
              <div className="flex-1">
                <div className="text-[14px] font-medium text-teal-900">{therapist.name}</div>
                <div className="text-[12px] text-ink-muted">{therapist.pos}</div>
                <div className="text-[12px] text-ink-muted">{therapist.hospital}</div>
              </div>
              <Badge tone="done">เชื่อมต่อแล้ว</Badge>
            </div>
            <p className="text-[11.5px] text-ink-muted my-3 leading-relaxed">
              เชื่อมต่ออัตโนมัติตอนเลือกในระบบ เนื่องจากเป็นนักกายภาพบำบัดที่ยืนยันตัวตนแล้วและคุณเคยพบตัวจริงมาก่อน จึงไม่ต้องรออนุมัติ
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="w-auto" onClick={() => navigate('/onboarding/select-therapist?change=1')}>
                <Refresh size={16} /> เปลี่ยนนักกายภาพบำบัด
              </Button>
              <Button variant="danger" className="w-auto" onClick={disconnect}>ยกเลิกการเชื่อมต่อ</Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[13px] text-ink-secondary mb-4">
              คุณยังไม่ได้เชื่อมต่อกับนักกายภาพบำบัด เลือกจากรายชื่อที่ยืนยันตัวตนแล้วเพื่อให้เห็นความคืบหน้าและแชทได้
            </p>
            <Button variant="primary" className="w-auto" onClick={() => navigate('/onboarding/select-therapist?change=1')}>
              เลือกนักกายภาพบำบัด
            </Button>
          </>
        )}
      </Block>

      <Block title="การตั้งค่าอื่นๆ">
        {[
          { to: '/settings/notifications', icon: Bell, label: 'การแจ้งเตือนทาง SMS', desc: 'เตือนให้ฝึกตามวันและเวลาที่ตั้งไว้' },
          { to: '/settings/emergency', icon: ShieldCheck, label: 'ผู้ติดต่อฉุกเฉิน', desc: 'จัดการรายชื่อและการโทรฉุกเฉินอัตโนมัติ' },
          { to: '/chat', icon: Chat, label: 'แชทกับนักกายภาพบำบัด', desc: 'ไม่ใช่ช่องทางฉุกเฉิน ตอบภายใน 1-2 วันทำการ' },
        ].map((r) => (
          <Link key={r.to} to={r.to} className="flex items-center gap-3.5 py-3.5 border-b border-line last:border-0 hover:bg-bg -mx-2 px-2 rounded-lg transition-colors">
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-900 flex items-center justify-center flex-shrink-0">
              <r.icon size={18} />
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-medium">{r.label}</div>
              <div className="text-[12px] text-ink-muted">{r.desc}</div>
            </div>
            <ChevronRight size={18} className="text-ink-muted" />
          </Link>
        ))}
      </Block>

      <Card className="p-6 mb-10" style={{ borderColor: '#EBC6C1' }}>
        <h3 className="font-heading text-[15px] font-semibold text-danger mb-1">Danger zone</h3>
        <p className="text-[12.5px] text-ink-secondary mb-4">การลบบัญชีจะลบข้อมูลการฝึกทั้งหมดอย่างถาวร ไม่สามารถกู้คืนได้</p>
        <div className="flex gap-3">
          <Button variant="danger" className="w-auto"><Trash size={16} /> ลบบัญชี</Button>
          <Button variant="ghost" className="w-auto" onClick={logout}><LogOut size={16} /> ออกจากระบบ</Button>
        </div>
      </Card>
    </div>
  )
}
