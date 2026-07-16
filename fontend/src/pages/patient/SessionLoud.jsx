import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMicLevel } from '../../lib/useCamera.js'
import SessionInfoCard from '../../components/SessionInfoCard.jsx'
import SOSButton from '../../components/SOSButton.jsx'
import { Mic } from '../../components/icons.jsx'
import { LOUD_STEPS } from '../../lib/mockData.js'

const TARGET_DB = 70

export default function SessionLoud() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const stepId = Number(params.get('step')) || 3
  const step = LOUD_STEPS.find((s) => s.id === stepId) || LOUD_STEPS[2]

  const { db, status } = useMicLevel(true)
  const [seconds, setSeconds] = useState(0)
  const [maxSustain, setMaxSustain] = useState(0)
  const [avg, setAvg] = useState(0)
  const sustainRef = useRef(0)
  const samplesRef = useRef([])

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // track sustained loud phonation + running average
  useEffect(() => {
    if (status !== 'live') return
    samplesRef.current.push(db)
    if (samplesRef.current.length > 40) samplesRef.current.shift()
    setAvg(Math.round(samplesRef.current.reduce((a, b) => a + b, 0) / samplesRef.current.length))
    if (db >= TARGET_DB) {
      sustainRef.current += 0.25
      setMaxSustain((m) => Math.max(m, Math.round(sustainRef.current)))
    } else {
      sustainRef.current = 0
    }
  }, [db, status])

  const pct = Math.max(0, Math.min(100, ((db - 40) / (90 - 40)) * 100))
  const targetPct = ((TARGET_DB - 40) / (90 - 40)) * 100
  const loud = db >= TARGET_DB
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-[1100px] mx-auto grid lg:grid-cols-[1.6fr_1fr] gap-5">
        {/* Mic panel */}
        <div className="relative rounded-2xl bg-cam p-9 flex flex-col items-center justify-center gap-6 min-h-[360px]">
          <SOSButton reason="sos" />

          <div className="bg-white/[0.08] rounded-xl px-6 py-4 text-center">
            <p className="text-[11px] text-white/55 uppercase tracking-wide mb-1.5">พูดตามนี้</p>
            <p className="font-heading text-[22px] font-semibold text-white">{step.phrase}</p>
          </div>

          <div className="font-mono text-[42px] font-medium text-white">
            {status === 'live' ? db : '--'}
            <span className="text-[16px] opacity-50 ml-1">dB</span>
          </div>

          <div className="w-full max-w-[340px]">
            <div className="relative h-3.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#B9542A,#E39159)' }} />
              <div className="absolute -top-1 -bottom-1 w-0.5 bg-white/50" style={{ left: `${targetPct}%` }} />
            </div>
            <div className="flex justify-between text-[10.5px] text-white/45 mt-1.5">
              <span>เบา</span>
              <span>เป้าหมาย {TARGET_DB} dB</span>
              <span>ดัง</span>
            </div>
          </div>

          {status !== 'live' && (
            <div className="text-white/70 text-[13px] flex items-center gap-2">
              <Mic size={18} />
              {status === 'denied' ? 'กรุณาอนุญาตการใช้ไมโครโฟน' : 'กำลังเปิดไมโครโฟน…'}
            </div>
          )}
          {status === 'live' && (
            <p className="text-[13px] font-medium" style={{ color: loud ? '#7FB88A' : '#E39159' }}>
              {loud ? 'เสียงดังชัดเจน เยี่ยมมาก!' : 'ลองเปล่งเสียงให้ดังขึ้นอีกนิด'}
            </p>
          )}
        </div>

        <SessionInfoCard
          name={step.name}
          desc={step.detail}
          reps={Math.min(seconds, step.minutes * 60)}
          target={step.minutes * 60}
          tone="loud"
          stats={[
            { k: 'ความดังเฉลี่ย', v: `${avg} dB` },
            { k: 'เปล่งเสียงนานสุด', v: `${maxSustain} วิ` },
            { k: 'คะแนนสะสมวันนี้', v: `${78 + maxSustain}` },
          ]}
          onStop={() => navigate('/training/loud')}
        />
      </div>
      <p className="max-w-[1100px] mx-auto mt-3 text-[11.5px] text-ink-muted">
        * ค่า dB ยังไม่ได้สอบเทียบ noise floor ของไมโครโฟน (อยู่ใน backlog) — ใช้เพื่อสาธิตการทำงานเท่านั้น
      </p>
    </div>
  )
}
