import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Toggle, Button } from '../../components/ui.jsx'
import { ArrowLeft, Phone } from '../../components/icons.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const DAYS = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
const TIMES = ['09:00', '12:00', '18:00']
const CONDITIONS = [
  { value: 'always', label: 'เตือนทุกวันที่เลือกไว้' },
  { value: 'missedOnly', label: 'เตือนเฉพาะวันที่ยังไม่ได้ฝึก' },
  { value: 'streakBroken', label: 'เตือนเมื่อขาดฝึกติดต่อกัน 2 วันขึ้นไป' },
]

export default function NotificationSettings() {
  const { user } = useAuth()
  const [enabled, setEnabled] = useState(true)
  const [days, setDays] = useState(['จ', 'พ', 'ศ'])
  const [time, setTime] = useState('09:00')
  const [condition, setCondition] = useState('missedOnly')
  const [saved, setSaved] = useState(false)

  const toggleDay = (d) => setDays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d]))

  return (
    <div className="max-w-[680px]">
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary hover:text-teal-700 mb-3">
        <ArrowLeft size={16} /> กลับไปโปรไฟล์
      </Link>
      <h1 className="font-heading text-[22px] font-semibold text-teal-900 mb-1">การแจ้งเตือนทาง SMS</h1>
      <p className="text-[13px] text-ink-secondary mb-6">RehabAI ใช้ SMS เท่านั้น ไม่มีการแจ้งเตือนทางอีเมล</p>

      <Card className="p-6 mb-5">
        <div className="flex justify-between items-center pb-4 border-b border-line">
          <div>
            <p className="text-[14px] font-medium mb-1">เปิดใช้งานการแจ้งเตือนทาง SMS</p>
            <p className="text-[12px] text-ink-secondary max-w-[420px] leading-relaxed">อ่านได้ทันทีโดยไม่ต้องเปิดอินเทอร์เน็ตหรือแอปอีเมล</p>
          </div>
          <Toggle on={enabled} onChange={setEnabled} />
        </div>
        <div className="pt-4 flex items-center gap-2 text-[13px]">
          <span className="text-ink-secondary">เบอร์ที่ใช้รับ:</span>
          <span className="inline-flex items-center gap-2 bg-bg border border-line rounded-btn px-3 py-2 text-[13px]">
            <Phone size={15} className="text-ink-muted" /> 081-234-5678
          </span>
        </div>
      </Card>

      <Card className={`p-6 mb-5 ${enabled ? '' : 'opacity-50 pointer-events-none'}`}>
        <p className="text-[14px] font-medium mb-3">เลือกวันในสัปดาห์</p>
        <div className="flex gap-2 mb-6">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => toggleDay(d)}
              className={`w-9 h-9 rounded-full text-[12.5px] transition-colors ${
                days.includes(d) ? 'bg-teal-700 text-white font-semibold' : 'border border-line text-ink-secondary'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-[13px] text-ink-secondary mb-2">เวลาที่ส่ง</p>
            <select value={time} onChange={(e) => setTime(e.target.value)} className="border border-line rounded-btn px-3 py-2 text-[13px] bg-white">
              {TIMES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[240px]">
            <p className="text-[13px] text-ink-secondary mb-2">เงื่อนไขการเตือน</p>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full border border-line rounded-btn px-3 py-2 text-[13px] bg-white">
              {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden mb-5">
        <div className="px-5 py-3 bg-[#F9F7F2] border-b border-line text-[12px] text-ink-muted">ตัวอย่างข้อความ SMS</div>
        <pre className="px-5 py-4 text-[12.5px] font-mono text-ink-primary whitespace-pre-wrap leading-relaxed m-0">
{`RehabAI · วันนี้ ${time} น.
⏰ อย่าลืมฝึกกายภาพบำบัดวันนี้นะคุณ${user?.name?.split(' ')[0] || 'สมชาย'} ตอนนี้ต่อเนื่อง 5 วันแล้ว!
เข้าแอปเพื่อฝึกต่อได้ที่ rehabai.app
พิมพ์ STOP เพื่อยกเลิกการรับ SMS`}
        </pre>
      </Card>

      <Button variant="primary" className="w-auto" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}>
        {saved ? 'บันทึกแล้ว ✓' : 'บันทึกการตั้งค่า'}
      </Button>
    </div>
  )
}
