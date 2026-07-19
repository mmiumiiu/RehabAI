import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMicLevel } from '../../lib/useCamera.js'
import SessionInfoCard from '../../components/SessionInfoCard.jsx'
import SOSButton from '../../components/SOSButton.jsx'
import { Mic, Check } from '../../components/icons.jsx'
import { LOUD_STEPS } from '../../lib/mockData.js'
import { loudSettings } from '../../lib/services.js'
import { sessionService } from '../../lib/sessionService.js'

// Demo: patient is always mapped to patient ID "p1"
const PATIENT_ID = 'p1'

function useSessionClock() {
  const [t, setT] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setT((v) => v + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const mm = String(Math.floor(t / 60)).padStart(2, '0')
  const ss = String(t % 60).padStart(2, '0')
  return { clock: `${mm}:${ss}`, seconds: t }
}

export default function SessionLoud() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const stepId = Number(params.get('step')) || 1
  const step = LOUD_STEPS.find((s) => s.id === stepId) || LOUD_STEPS[0]

  const settings = loudSettings.get()
  const repGoal = settings?.reps ?? 10
  const dbGoal = settings?.goal ?? 70

  const { db, status } = useMicLevel(true)
  const { clock, seconds } = useSessionClock()

  const [reps, setReps] = useState(0)
  const [pulse, setPulse] = useState(false)
  const [lastLoud, setLastLoud] = useState(null) // true=good, false=too quiet, null=not yet
  const [sessionDone, setSessionDone] = useState(false)
  const publishedRef = useRef(false)

  const pct = Math.max(0, Math.min(100, ((db - 40) / (90 - 40)) * 100))
  const targetPct = ((dbGoal - 40) / (90 - 40)) * 100

  function tap() {
    if (sessionDone) return
    const loud = db >= dbGoal
    setLastLoud(loud)
    setPulse(true)
    setTimeout(() => setPulse(false), 200)
    setReps((r) => {
      const next = r + 1
      if (next >= repGoal && !publishedRef.current) {
        publishedRef.current = true
        setSessionDone(true)
        sessionService.publish(PATIENT_ID, { reps: next, goal: repGoal, duration: clock, complete: true })
      }
      return Math.min(next, repGoal)
    })
  }

  function stop() {
    if (!publishedRef.current) {
      publishedRef.current = true
      sessionService.publish(PATIENT_ID, { reps, goal: repGoal, duration: clock, complete: false })
    }
    navigate('/training/loud')
  }

  const progressPct = Math.round((reps / repGoal) * 100)

  return (
    <div className="min-h-screen bg-bg p-3 md:p-6">
      <div className="max-w-[1100px] mx-auto grid lg:grid-cols-[1.6fr_1fr] gap-5">

        {/* Tap panel */}
        <div className="relative rounded-2xl bg-cam p-6 md:p-9 flex flex-col items-center justify-center gap-5 min-h-[400px]">
          <SOSButton reason="sos" />

          {/* Phrase */}
          <div className="bg-white/[0.08] rounded-xl px-6 py-4 text-center">
            <p className="text-[11px] text-white/55 uppercase tracking-wide mb-1.5">พูดตามนี้</p>
            <p className="font-heading text-[22px] font-semibold text-white">{step.phrase}</p>
          </div>

          {/* Rep counter */}
          <div className="text-center">
            <div className="font-heading text-[52px] font-semibold text-white leading-none">
              {reps}
              <span className="text-[20px] text-white/40 font-normal"> / {repGoal}</span>
            </div>
            <p className="text-[11.5px] text-white/50 mt-1">ครั้ง</p>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-[300px]">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg,#4E9484,#7FB88A)' }}
              />
            </div>
          </div>

          {/* Big tap button */}
          {!sessionDone ? (
            <button
              onPointerDown={tap}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1 text-white font-semibold text-[13px] select-none transition-transform active:scale-95 ${
                pulse ? 'scale-95' : ''
              }`}
              style={{
                background: lastLoud === false ? 'rgba(185,84,42,0.85)' : lastLoud === true ? 'rgba(78,148,132,0.85)' : 'rgba(255,255,255,0.14)',
                boxShadow: '0 0 0 6px rgba(255,255,255,0.06)',
              }}
            >
              <Mic size={28} />
              กด 1 ครั้ง
            </button>
          ) : (
            <div className="w-28 h-28 rounded-full bg-[rgba(78,148,132,0.85)] flex flex-col items-center justify-center gap-1 text-white">
              <Check size={32} />
              <span className="text-[12px] font-semibold">เสร็จแล้ว!</span>
            </div>
          )}

          {/* dB feedback */}
          {lastLoud !== null && !sessionDone && (
            <p className="text-[12.5px] font-medium" style={{ color: lastLoud ? '#7FB88A' : '#E39159' }}>
              {lastLoud ? `เสียงดี (${db} dB) ✓` : `เบาเกินไป — ลองดังขึ้น (${db} dB < ${dbGoal} dB)`}
            </p>
          )}

          {/* small dB meter */}
          <div className="w-full max-w-[260px]">
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#B9542A,#E39159)', transition: 'width 0.1s' }} />
              <div className="absolute -top-0.5 -bottom-0.5 w-0.5 bg-white/40" style={{ left: `${targetPct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-white/35 mt-1">
              <span>เบา</span>
              <span>เป้า {dbGoal} dB</span>
              <span>ดัง</span>
            </div>
          </div>

          {status === 'calibrating' && (
            <div className="text-white/60 text-[12px] flex items-center gap-1.5">
              <Mic size={15} />
              กำลังวัดเสียงพื้นหลัง — โปรดนิ่งเงียบสักครู่…
            </div>
          )}
          {(status === 'requesting' || status === 'denied' || status === 'error') && (
            <div className="text-white/60 text-[12px] flex items-center gap-1.5">
              <Mic size={15} />
              {status === 'denied' ? 'กรุณาอนุญาตไมโครโฟน' : 'กำลังเปิดไมโครโฟน…'}
            </div>
          )}
        </div>

        <SessionInfoCard
          name={step.name}
          desc={step.detail}
          reps={reps}
          target={repGoal}
          tone="loud"
          stats={[
            { k: 'ครั้งที่เสร็จแล้ว', v: `${reps} / ${repGoal}` },
            { k: 'เป้าหมาย dB', v: `${dbGoal} dB` },
            { k: 'เวลาในเซสชันนี้', v: clock },
          ]}
          onStop={stop}
        />
      </div>

      {sessionDone && (
        <div className="max-w-[1100px] mx-auto mt-4 flex justify-end">
          <button onClick={() => navigate('/training/loud')} className="btn-primary max-w-[240px]">
            เสร็จสิ้น — กลับไปรายการแบบฝึกหัด
          </button>
        </div>
      )}

      <p className="max-w-[1100px] mx-auto mt-3 text-[11.5px] text-ink-muted">
        * ค่า dB ยังไม่ได้สอบเทียบ noise floor ของไมโครโฟน — ใช้เพื่อสาธิตการทำงานเท่านั้น
      </p>
    </div>
  )
}
