import { useState, useEffect, useRef } from 'react'
import { Button, SettingRow } from '../../components/ui.jsx'
import { Check } from '../../components/icons.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { lineNotification } from '../../lib/services.js'

// "การแจ้งเตือนทาง LINE" — the "#notifications" section of the mockup.
// The LINE link-code flow (generate → poll → store userId) is unchanged; only
// the presentation follows the mockup. Mockup px ÷ 1.4.

const DAYS = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
const TIMES = ['09:00', '12:00', '18:00']
const CONDITIONS = [
  { value: 'always', label: 'ทุกวันที่เลือกไว้' },
  { value: 'missedOnly', label: 'เฉพาะวันที่ยังไม่ได้ฝึก' },
]

const LINE_OA_URL = import.meta.env.VITE_LINE_OA_URL || 'https://line.me/R/ti/p/@rehabai'

const LineIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
)

function Section({ title, children }) {
  return (
    <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-4">
      {title && <h2 className="font-heading text-b-h2 font-bold m-0 leading-[1.3]">{title}</h2>}
      {children}
    </section>
  )
}

// Mockup pill: filled blue when picked, outlined otherwise.
function Pill({ on, children, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-[51px] px-5 rounded-pill border-[3px] text-b-base font-bold transition-colors ${
        on ? 'bg-teal-700 border-teal-700 text-white' : 'bg-surface border-line text-ink-primary hover:bg-teal-50'
      }`}
    >
      {children}
    </button>
  )
}

export default function NotificationSettings() {
  const { user } = useAuth()
  const [linked, setLinked] = useState(() => !!lineNotification.getUserId())
  const [enabled, setEnabled] = useState(true)
  const [weekly, setWeekly] = useState(true)
  const [tellFamily, setTellFamily] = useState(true)
  const [days, setDays] = useState(['จ', 'อ', 'พ', 'พฤ', 'ศ'])
  const [time, setTime] = useState('09:00')
  const [condition, setCondition] = useState('always')
  const [saved, setSaved] = useState(false)
  const [testStatus, setTestStatus] = useState(null) // null | 'sending' | 'ok' | 'fail'

  // Link-code flow
  const [linkCode, setLinkCode] = useState(null)
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkError, setLinkError] = useState(null)
  const pollRef = useRef(null)

  useEffect(() => () => clearInterval(pollRef.current), [])

  async function handleStartLink() {
    setLinkLoading(true)
    setLinkError(null)
    try {
      const code = await lineNotification.generateLinkCode()
      setLinkCode(code)
      pollRef.current = setInterval(async () => {
        const { userId, expired } = await lineNotification.pollLinkCode(code)
        if (userId) {
          clearInterval(pollRef.current)
          lineNotification.setUserId(userId)
          setLinked(true)
          setLinkCode(null)
        } else if (expired) {
          clearInterval(pollRef.current)
          setLinkCode(null)
          setLinkError('รหัสหมดอายุแล้ว กรุณาลองใหม่')
        }
      }, 3000)
    } catch {
      setLinkError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่')
    } finally {
      setLinkLoading(false)
    }
  }

  function handleCancelLink() {
    clearInterval(pollRef.current)
    setLinkCode(null)
  }

  function handleUnlink() {
    clearInterval(pollRef.current)
    lineNotification.clearUserId()
    setLinked(false)
    setLinkCode(null)
  }

  const toggleDay = (d) => setDays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d]))

  const firstName = user?.name?.split(' ')[0] || 'สมชาย'
  const previewText = `สวัสดีตอนเช้าครับคุณ${firstName}\nได้เวลาฝึกกายภาพวันนี้แล้ว ฝึกต่อเนื่องมา 5 วัน ไปต่อกันเลย`

  const scheduleOff = !(enabled && linked)

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-b-label font-semibold text-ink-secondary m-0 mb-1">ตั้งค่า</p>
        <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">การแจ้งเตือนทาง LINE</h1>
      </header>

      {/* Enable + account link */}
      <Section>
        <SettingRow
          title="เปิดใช้งานการแจ้งเตือนทาง LINE"
          desc="ต้องเพิ่ม BRIDGE เป็นเพื่อนใน LINE ก่อน จึงจะรับการแจ้งเตือนได้"
          on={enabled && linked}
          onChange={setEnabled}
          disabled={!linked}
          last
        />

        {linked ? (
          <div className="flex items-center gap-4 flex-wrap">
            <span
              className="inline-flex items-center gap-2.5 rounded-btn border-2 px-4 py-2.5 text-b-base font-bold"
              style={{ background: '#E3F1DC', borderColor: '#BFDDB0', color: '#24661A' }}
            >
              <Check size={20} /> เชื่อมต่อ LINE แล้ว
            </span>
            <button onClick={handleUnlink} className="text-b-base text-ink-secondary hover:text-danger underline">
              ยกเลิกการเชื่อมต่อ
            </button>
          </div>
        ) : linkCode ? (
          <div className="flex flex-col gap-4">
            <p className="text-b-base text-ink-secondary leading-[1.6] m-0">
              1. กด <strong>เพิ่มเพื่อน</strong> เพื่อเพิ่ม BRIDGE ใน LINE<br />
              2. ส่งรหัสนี้ในแชทของ BRIDGE LINE OA
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-mono text-b-h2 font-bold tracking-[0.18em] text-teal-800 bg-teal-50 border-2 border-line px-5 py-2.5 rounded-[14px] select-all">
                {linkCode}
              </span>
              <a
                href={LINE_OA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 min-h-[57px] px-6 rounded-pill text-white text-b-btn font-bold no-underline"
                style={{ background: '#06C755' }}
              >
                <LineIcon /> เพิ่มเพื่อน
              </a>
            </div>
            <p className="text-b-sm text-ink-secondary flex items-center gap-2.5 m-0">
              <span className="inline-block w-4 h-4 rounded-full border-2 border-teal-700 border-t-transparent animate-spin" />
              รอการยืนยันจาก LINE… (รหัสหมดอายุใน 10 นาที)
            </p>
            <button onClick={handleCancelLink} className="text-b-sm text-ink-secondary underline w-fit">
              ยกเลิก
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {linkError && <p className="text-b-base text-danger m-0">{linkError}</p>}
            <p className="text-b-base text-ink-secondary leading-[1.6] m-0">
              กดปุ่มด้านล่างเพื่อรับรหัสเชื่อมต่อ แล้วส่งรหัสนั้นในแชทของ LINE OA BRIDGE
            </p>
            <button
              onClick={handleStartLink}
              disabled={linkLoading}
              className="inline-flex items-center gap-3.5 w-fit min-h-[62px] px-7 rounded-pill text-white text-b-btn font-bold disabled:opacity-60 transition-opacity"
              style={{ background: '#06C755' }}
            >
              <LineIcon size={26} />
              {linkLoading ? 'กำลังสร้างรหัส…' : 'เชื่อมต่อ LINE'}
            </button>
          </div>
        )}
      </Section>

      {/* Extra notifications */}
      <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card px-6 py-2">
        <SettingRow
          title="ส่งสรุปผลรายสัปดาห์"
          desc="ทุกวันอาทิตย์ ส่งสรุปว่าสัปดาห์นี้ฝึกไปกี่วัน"
          on={weekly}
          onChange={setWeekly}
          disabled={scheduleOff}
        />
        <SettingRow
          title="เตือนญาติด้วยเมื่อขาดฝึก 3 วัน"
          desc="ส่งข้อความ LINE หาผู้ติดต่อฉุกเฉินลำดับแรก ให้ช่วยชวนฝึก"
          on={tellFamily}
          onChange={setTellFamily}
          disabled={scheduleOff}
          last
        />
      </section>

      <div className={scheduleOff ? 'opacity-50 pointer-events-none flex flex-col gap-6' : 'flex flex-col gap-6'}>
        <Section title="วันที่ให้เตือน">
          <div className="flex flex-wrap gap-3">
            {DAYS.map((d) => (
              <Pill key={d} on={days.includes(d)} onClick={() => toggleDay(d)}>{d}</Pill>
            ))}
          </div>
        </Section>

        <Section title="เวลาที่ให้เตือน">
          <div className="flex flex-wrap gap-3">
            {TIMES.map((t) => (
              <Pill key={t} on={time === t} onClick={() => setTime(t)}>{t} น.</Pill>
            ))}
          </div>
        </Section>

        <Section title="เตือนเมื่อไร">
          {CONDITIONS.map((c) => {
            const on = condition === c.value
            return (
              <button
                key={c.value}
                type="button"
                aria-pressed={on}
                onClick={() => setCondition(c.value)}
                className={`flex items-center gap-4 min-h-[60px] px-5 py-2.5 rounded-btn border-[3px] text-left transition-colors ${
                  on ? 'border-teal-700 bg-teal-100' : 'border-line bg-surface hover:bg-teal-50'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full border-[3px] flex items-center justify-center flex-shrink-0 ${
                    on ? 'border-teal-700 bg-teal-700 text-white' : 'border-line bg-surface'
                  }`}
                >
                  {on && <Check size={16} />}
                </span>
                <span className="text-b-base font-bold">{c.label}</span>
              </button>
            )
          })}
        </Section>

        {/* LINE message preview */}
        <Section title="ตัวอย่างข้อความใน LINE">
          <div className="max-w-[520px] rounded-[20px] overflow-hidden border-[1.5px] border-line">
            <div className="flex items-center gap-3.5 px-5 py-3" style={{ background: '#2B3A4A', color: '#FFFFFF' }}>
              <span className="w-[34px] h-[34px] rounded-full bg-teal-700 flex items-center justify-center text-white">
                <LineIcon size={20} />
              </span>
              <span className="text-b-label font-bold">BRIDGE</span>
            </div>
            <div className="px-5 py-5 flex flex-col gap-2.5" style={{ background: '#8CABD9' }}>
              <div
                className="self-start max-w-[380px] bg-white overflow-hidden"
                style={{ borderRadius: 19, borderTopLeftRadius: 6 }}
              >
                <div className="px-5 py-4 text-b-base leading-[1.6] whitespace-pre-line" style={{ color: '#111111' }}>
                  {previewText}
                </div>
                <div
                  className="block px-5 py-3 text-center text-b-base font-bold text-teal-700 border-t-[1.5px]"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  เปิดแอปเพื่อเริ่มฝึก
                </div>
              </div>
              <span className="text-b-xs self-start" style={{ color: '#1F2D3D' }}>{time}</span>
            </div>
          </div>
        </Section>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Button
          as="button"
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
          className="min-h-[57px]"
        >
          {saved ? 'บันทึกแล้ว ✓' : 'บันทึกการตั้งค่า'}
        </Button>

        {linked && (
          <button
            disabled={testStatus === 'sending'}
            onClick={async () => {
              setTestStatus('sending')
              const { ok } = await lineNotification.send({ body: previewText })
              setTestStatus(ok ? 'ok' : 'fail')
              setTimeout(() => setTestStatus(null), 3000)
            }}
            className="inline-flex items-center gap-3 min-h-[57px] px-6 rounded-pill border-[3px] text-b-base font-bold disabled:opacity-60 transition-colors"
            style={{ borderColor: '#06C755', color: '#06C755' }}
          >
            <LineIcon size={22} />
            {testStatus === 'sending' ? 'กำลังส่ง…'
              : testStatus === 'ok' ? 'ส่งแล้ว ✓'
                : testStatus === 'fail' ? 'ส่งไม่สำเร็จ ✗'
                  : 'ส่งข้อความทดสอบ'}
          </button>
        )}
      </div>
    </div>
  )
}
