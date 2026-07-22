import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Toggle, Button } from '../../components/ui.jsx'
import { ArrowLeft } from '../../components/icons.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { lineNotification } from '../../lib/services.js'

const DAYS = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
const TIMES = ['08:00', '09:00', '12:00', '18:00', '20:00']
const CONDITIONS = [
  { value: 'always', label: 'เตือนทุกวันที่เลือกไว้' },
  { value: 'missedOnly', label: 'เตือนเฉพาะวันที่ยังไม่ได้ฝึก' },
  { value: 'streakBroken', label: 'เตือนเมื่อขาดฝึกติดต่อกัน 2 วันขึ้นไป' },
]

// Replace with your Line OA friend URL from Line OA Manager → Messaging API
const LINE_OA_URL = import.meta.env.VITE_LINE_OA_URL || 'https://line.me/R/ti/p/@rehabai'

export default function NotificationSettings() {
  const { user } = useAuth()
  const [linked, setLinked] = useState(() => !!lineNotification.getUserId())
  const [enabled, setEnabled] = useState(true)
  const [days, setDays] = useState(['จ', 'พ', 'ศ'])
  const [time, setTime] = useState('09:00')
  const [condition, setCondition] = useState('missedOnly')
  const [saved, setSaved] = useState(false)

  const toggleDay = (d) => setDays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d]))

  function handleUnlink() {
    lineNotification.clearUserId()
    setLinked(false)
  }

  return (
    <div className="max-w-[680px]">
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary hover:text-teal-700 mb-3">
        <ArrowLeft size={16} /> กลับไปโปรไฟล์
      </Link>
      <h1 className="font-heading text-[22px] font-semibold text-teal-900 mb-1">การแจ้งเตือนทาง Line</h1>
      <p className="text-[13px] text-ink-secondary mb-6">รับการแจ้งเตือนการฝึกผ่าน Line OA ของ RehabAI</p>

      {/* Line account link status */}
      <Card className="p-6 mb-5">
        <div className="flex justify-between items-center pb-4 border-b border-line">
          <div>
            <p className="text-[14px] font-medium mb-1">เปิดใช้งานการแจ้งเตือนทาง Line</p>
            <p className="text-[12px] text-ink-secondary max-w-[420px] leading-relaxed">
              ต้องเพิ่ม RehabAI เป็นเพื่อนใน Line ก่อนจึงจะรับการแจ้งเตือนได้
            </p>
          </div>
          <Toggle on={enabled && linked} onChange={setEnabled} />
        </div>

        <div className="pt-4">
          {linked ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-btn px-3 py-2 text-[13px]">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                เชื่อมต่อ Line แล้ว
              </span>
              <button onClick={handleUnlink} className="text-[12.5px] text-ink-muted hover:text-danger underline">
                ยกเลิกการเชื่อมต่อ
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-[12.5px] text-ink-secondary">
                กด <strong>เพิ่มเพื่อน</strong> แล้วส่งข้อความใดก็ได้ใน Line เพื่อเชื่อมต่อบัญชีของคุณ
              </p>
              <a
                href={LINE_OA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 w-fit bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold text-[13.5px] px-5 py-2.5 rounded-btn transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                เพิ่มเพื่อนใน Line
              </a>
              {/* Demo only: simulate linking */}
              <button
                onClick={() => { lineNotification.setUserId('U_demo_12345'); setLinked(true) }}
                className="text-[11.5px] text-ink-muted underline w-fit"
              >
                (Demo: จำลองการเชื่อมต่อ)
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Schedule settings */}
      <Card className={`p-6 mb-5 ${enabled && linked ? '' : 'opacity-50 pointer-events-none'}`}>
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

      {/* Line message preview */}
      <Card className="overflow-hidden mb-5">
        <div className="px-5 py-3 bg-[#F9F7F2] border-b border-line text-[12px] text-ink-muted">ตัวอย่างข้อความ Line</div>
        <div className="px-5 py-4 bg-[#8BABD8] min-h-[100px] flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#06C755] flex-shrink-0 flex items-center justify-center text-white text-[11px] font-bold">R</div>
          <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 max-w-[320px] shadow-sm">
            <p className="text-[12px] text-[#333] leading-relaxed whitespace-pre-line">
              {`⏰ สวัสดีคุณ${user?.name?.split(' ')[0] || 'สมชาย'}!\nอย่าลืมฝึกกายภาพบำบัดวันนี้เวลา ${time} น. นะ\nต่อเนื่อง 5 วันแล้ว ไปต่อได้เลย! 💪\n\nเข้าแอปได้ที่ rehabai.app`}
            </p>
            <p className="text-[10px] text-[#999] mt-1.5 text-right">{time}</p>
          </div>
        </div>
      </Card>

      <Button
        variant="primary"
        className="w-auto"
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
      >
        {saved ? 'บันทึกแล้ว ✓' : 'บันทึกการตั้งค่า'}
      </Button>
    </div>
  )
}
