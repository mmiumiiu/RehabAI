import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Avatar, Badge } from '../../components/ui.jsx'
import { Search, Check, Chat, Flame, Award } from '../../components/icons.jsx'
import { PATIENTS, PARKINSON_STAGES } from '../../lib/mockData.js'

const stageShort = (s) => PARKINSON_STAGES.find((x) => x.value === s)?.short || s

export default function Patients() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const list = PATIENTS.filter((p) => p.name.includes(query))

  return (
    <div>
      <header className="flex justify-between items-center px-4 md:px-8 py-4 md:py-5 border-b border-line bg-surface">
        <div>
          <h1 className="font-heading text-[20px] font-semibold text-teal-900">ผู้ป่วยของฉัน</h1>
          <p className="text-[12.5px] text-ink-secondary">ติดตามความคืบหน้าของผู้ป่วยที่เชื่อมต่อแล้ว</p>
        </div>
      </header>

      <div className="px-4 md:px-8 py-5 md:py-7 max-w-[900px] mx-auto">
        {/* patients auto-appear when they select this therapist (spec §4.3) */}
        <div className="flex items-start gap-2.5 rounded-btn p-4 mb-6 max-w-[520px] mx-auto" style={{ background: '#E6F0E1' }}>
          <span className="flex-shrink-0 mt-0.5" style={{ color: '#3B6D11' }}><Check size={16} /></span>
          <p className="text-[12.5px] leading-relaxed" style={{ color: '#3B6D11' }}>
            ผู้ป่วยที่เลือกคุณเป็นนักกายภาพบำบัดตอนสมัครใช้งานจะปรากฏในรายชื่อนี้โดยอัตโนมัติทันที ไม่ต้องเพิ่มเอง —
            การเชื่อมต่อเกิดจากฝั่งผู้ป่วยเลือกจากรายชื่อที่ยืนยันตัวตนแล้วเท่านั้น
          </p>
        </div>

        {/* search */}
        <div className="input-wrap mb-4 max-w-[320px]">
          <Search size={18} className="text-ink-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาชื่อผู้ป่วย" />
        </div>

        <div className="space-y-3">
          {list.map((p) => (
            <Card key={p.id} className="p-4 flex items-center gap-4">
              <Avatar text={p.initials} size={44} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14.5px] font-semibold font-heading">{p.name}</span>
                  <Badge tone="big">{stageShort(p.stage)}</Badge>
                </div>
                <div className="text-[12px] text-ink-muted">ฝึกล่าสุด {p.lastActive}</div>
              </div>
              <div className="hidden md:flex items-center gap-5 ml-auto text-[12.5px] text-ink-secondary">
                <span className="flex items-center gap-1.5"><Flame size={15} className="text-coral-700" /> {p.streak} วัน</span>
                <span className="flex items-center gap-1.5"><Award size={15} className="text-teal-700" /> {p.lastScore}</span>
                <span>{p.weekCount}/7 สัปดาห์นี้</span>
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="outline" className="w-auto py-2" onClick={() => navigate(`/therapist/patients/${p.id}`)}>ดูรายละเอียด</Button>
                <Button variant="ghost" className="w-auto py-2" onClick={() => navigate('/therapist/messages')}><Chat size={16} /></Button>
              </div>
            </Card>
          ))}
          {list.length === 0 && <p className="text-[13px] text-ink-muted py-8 text-center">ไม่พบผู้ป่วยที่ตรงกับคำค้นหา</p>}
        </div>
      </div>
    </div>
  )
}
