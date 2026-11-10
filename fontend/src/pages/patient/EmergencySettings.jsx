import { useState } from 'react'
import { Button, SettingRow, Badge } from '../../components/ui.jsx'
import { Phone, Plus } from '../../components/icons.jsx'
import { emergencyContactsSeed, RELATIONSHIPS } from '../../lib/mockData.js'

// "ผู้ติดต่อฉุกเฉิน" — the "#emergencycontacts" section of the mockup.
// Mockup px ÷ 1.4 (the patient portal body zoom).

const relationLabel = (value) =>
  RELATIONSHIPS.find((r) => r.value === value)?.label || value

export default function EmergencySettings() {
  const [fallAlert, setFallAlert] = useState(true)
  const [shareLoc, setShareLoc] = useState(true)
  const [contacts] = useState(emergencyContactsSeed)

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-b-label font-semibold text-ink-secondary m-0 mb-1">ความปลอดภัย</p>
        <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">ผู้ติดต่อฉุกเฉิน</h1>
      </header>

      <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card px-6 py-2">
        <SettingRow
          title="แจ้งเตือนเมื่อกล้องเห็นว่าล้ม"
          desc="ระบบจะนับถอยหลัง แล้วส่งข้อความหาคนลำดับแรกพร้อมตำแหน่ง"
          on={fallAlert}
          onChange={setFallAlert}
        />
        <SettingRow
          title="ส่งตำแหน่งของฉันไปด้วย"
          desc="ช่วยให้ญาติหรือรถพยาบาลมาถึงเร็วขึ้น"
          on={shareLoc}
          onChange={setShareLoc}
          last
        />
      </section>

      <h2 className="font-heading text-b-h2 font-bold m-0 leading-[1.3]">ลำดับคนที่จะติดต่อ</h2>

      <div className="flex flex-col gap-4">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="bg-surface rounded-card border-[1.5px] border-line shadow-card px-6 py-5 flex flex-wrap items-center gap-5"
          >
            <span className="w-[37px] h-[37px] rounded-full bg-teal-50 text-ink-primary flex items-center justify-center text-b-base font-bold flex-shrink-0">
              {c.priority}
            </span>
            <span className="w-[51px] h-[51px] rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-b-base font-bold flex-shrink-0">
              {c.name.slice(0, 2)}
            </span>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-b-h3 font-bold">{c.name}</span>
                {c.source === 'registration' && <Badge tone="active">จากตอนสมัครสมาชิก</Badge>}
              </div>
              <div className="text-b-label text-ink-secondary">
                {relationLabel(c.relationship)} · {c.phone}
              </div>
            </div>
            <Button as="a" href={`tel:${c.phone.replace(/\D/g, '')}`} variant="blue" className="min-h-[54px]">
              <Phone size={20} /> โทรเลย
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" className="self-start min-h-[57px]">
        <Plus size={22} /> เพิ่มคนติดต่อ
      </Button>

      {/* 1669 hotline */}
      <section
        className="rounded-card border-2 px-6 py-6 flex flex-wrap items-center gap-5"
        style={{ background: '#FBE3E0', borderColor: '#EDB3AD' }}
      >
        <div className="flex-1 min-w-[220px]">
          <div className="text-b-h3 font-bold" style={{ color: '#B3261E' }}>สายด่วนการแพทย์ฉุกเฉิน</div>
          <div className="text-b-label">ให้บริการตลอด 24 ชั่วโมง</div>
        </div>
        <Button as="a" href="tel:1669" className="min-h-[57px]">
          <Phone size={22} /> โทร 1669
        </Button>
      </section>
    </div>
  )
}
