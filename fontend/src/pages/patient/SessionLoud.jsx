import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLoudScorer, LOUD_BAND } from '../../lib/useLoudScorer.js'
import SessionInfoCard from '../../components/SessionInfoCard.jsx'
import SOSButton from '../../components/SOSButton.jsx'
import PlayPhraseButton from '../../components/PlayPhraseButton.jsx'
import { Mic, Check } from '../../components/icons.jsx'
import { LOUD_STEPS } from '../../lib/mockData.js'
import { loudSettings, sessionHistory } from '../../lib/services.js'
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

const VERDICT_TH = {
  good: 'อยู่ในช่วงดี',
  soft_ok: 'เบาแต่รับได้',
  loud_ok: 'ดังแต่รับได้',
  too_soft: 'เบาเกินไป',
  too_loud: 'ดังเกินไป',
}

export default function SessionLoud() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const stepId = Number(params.get('step')) || 1
  const step = LOUD_STEPS.find((s) => s.id === stepId) || LOUD_STEPS[0]

  const settings = loudSettings.get()
  const repGoal = settings?.reps ?? 10
  // Loudness band is fixed for now (the therapist-adjustable value — see
  // LOUD_BAND). Target word comes from the exercise step.
  const band = LOUD_BAND
  // Word accuracy is scored only when the step opts in (scoreWord !== false).
  // The "อา" sustain step scores loudness + duration only, so it sends no target.
  const target = step.scoreWord === false ? '' : step.phrase

  const { clock } = useSessionClock()

  const [reps, setReps] = useState(0)
  const [pulse, setPulse] = useState(false)
  const [sessionDone, setSessionDone] = useState(false)
  const publishedRef = useRef(false)
  const scoreSumRef = useRef(0)   // sum of per-attempt quality for counted reps
  const scoreCountRef = useRef(0)

  // A rep only counts when EVERY scored part (loudness + word and/or duration)
  // is above 80% — the backend decides this via `passed`. Attempts that fall
  // short still show feedback but don't advance the counter.
  function handleScore(data) {
    if (sessionDone) return
    setPulse(true)
    setTimeout(() => setPulse(false), 200)
    if (!data?.passed) return

    // Accumulate this attempt's quality (mean of whichever parts were scored).
    const parts = [data.db?.score, data.word?.score, data.hold?.score].filter((v) => v != null)
    if (parts.length) {
      scoreSumRef.current += parts.reduce((a, b) => a + b, 0) / parts.length
      scoreCountRef.current += 1
    }

    setReps((r) => {
      const next = r + 1
      if (next >= repGoal && !publishedRef.current) {
        publishedRef.current = true
        setSessionDone(true)
        sessionService.publish(PATIENT_ID, { reps: next, goal: repGoal, duration: clock, complete: true })
        sessionHistory.add({
          type: 'loud',
          score: scoreCountRef.current ? scoreSumRef.current / scoreCountRef.current : null,
          reps: next,
          goal: repGoal,
          duration: clock,
        })
      }
      return Math.min(next, repGoal)
    })
  }

  const { db, micStatus, recording, transcript, holdSec, result, error, start, stop } = useLoudScorer({
    band,
    target,
    mode: step.mode ?? 'word',
    holdMin: step.holdMin ?? 5,
    holdTarget: step.holdTarget ?? 7,
    onResult: handleScore,
  })

  function stopSession() {
    if (!publishedRef.current) {
      publishedRef.current = true
      sessionService.publish(PATIENT_ID, { reps, goal: repGoal, duration: clock, complete: false })
    }
    navigate('/training/loud')
  }

  const progressPct = Math.round((reps / repGoal) * 100)

  // dB meter geometry on the shared 40–90 display scale.
  const pct = Math.max(0, Math.min(100, ((db - 40) / (90 - 40)) * 100))
  const bandLeft = ((band.good_min - 40) / (90 - 40)) * 100
  const bandWidth = ((band.good_max - band.good_min) / (90 - 40)) * 100

  const passed = result?.passed
  const isSustain = (step.mode ?? 'word') === 'sustain'

  // Up to three scored parts, each shown as its own percentage.
  const parts = result
    ? [
        { key: 'db', label: 'ความดังเสียง', score: result.db.score },
        result.word && { key: 'word', label: 'ความถูกต้องของคำ', score: result.word.score },
        result.hold && { key: 'hold', label: 'ระยะเวลาออกเสียง', score: result.hold.score },
      ].filter(Boolean)
    : []

  return (
    <div className="min-h-screen bg-bg p-3 md:p-6">
      <div className="max-w-[1100px] mx-auto grid lg:grid-cols-[1.6fr_1fr] gap-5">

        {/* Voice panel */}
        <div className="relative rounded-2xl bg-cam p-6 md:p-9 flex flex-col items-center justify-center gap-5 min-h-[400px]">
          <SOSButton reason="sos" />

          {/* Phrase */}
          <div className="w-full max-w-[300px] bg-white/[0.08] rounded-xl px-6 py-4 text-center">
            <p className="text-[11px] text-white/55 uppercase tracking-wide mb-1.5">พูดตามนี้</p>
            <p className="font-heading text-[22px] font-semibold text-white mb-3">{step.phrase}</p>
            <PlayPhraseButton text={step.phrase} dark />
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

          {/* Record / speak button */}
          {!sessionDone ? (
            <button
              onPointerDown={() => (recording ? stop() : start())}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1 text-white font-semibold text-[13px] select-none transition-transform active:scale-95 ${
                pulse ? 'scale-95' : ''
              }`}
              style={{
                background: recording
                  ? 'rgba(185,84,42,0.85)'
                  : passed === false
                    ? 'rgba(185,84,42,0.85)'
                    : passed === true
                      ? 'rgba(78,148,132,0.85)'
                      : 'rgba(255,255,255,0.14)',
                boxShadow: '0 0 0 6px rgba(255,255,255,0.06)',
              }}
            >
              <Mic size={28} />
              {recording
                ? (isSustain ? `${holdSec.toFixed(1)} วิ` : 'กำลังฟัง…')
                : (isSustain ? 'กดเริ่มออกเสียง' : 'กดแล้วพูด')}
            </button>
          ) : (
            <div className="w-28 h-28 rounded-full bg-[rgba(78,148,132,0.85)] flex flex-col items-center justify-center gap-1 text-white">
              <Check size={32} />
              <span className="text-[12px] font-semibold">เสร็จแล้ว!</span>
            </div>
          )}

          {/* Live sustain hint */}
          {isSustain && recording && !sessionDone && (
            <p className="text-[12px] text-white/55 -mt-1">
              ค้างเสียง "อา" ไว้ให้นานที่สุด · ระบบจะหยุดให้เองเมื่อคุณเงียบ · เป้าหมาย {step.holdMin ?? 5}–{step.holdTarget ?? 7} วินาที
            </p>
          )}

          {/* Per-attempt feedback — each scored part shown separately */}
          {result && !sessionDone && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-5">
                {parts.map((p) => (
                  <div key={p.key}>
                    <p className="font-heading text-[22px] font-semibold leading-none" style={{ color: p.score >= 80 ? '#7FB88A' : '#E39159' }}>
                      {p.score}%
                    </p>
                    <p className="text-[11px] text-white/55 mt-0.5">{p.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[12px] mt-1.5" style={{ color: passed ? '#7FB88A' : '#E39159' }}>
                {passed
                  ? 'ผ่าน — นับ 1 ครั้ง ✓'
                  : `ยังไม่นับ — ต้องเกิน 80% ทุกส่วน (${VERDICT_TH[result.db.verdict] || result.db.verdict}${result.hold ? `, ค้างเสียง ${result.hold.hold_sec} วิ` : ''}${result.word && result.word.verdict !== 'correct' ? `, ได้ยิน “${transcript || '—'}”` : ''})`}
              </p>
            </div>
          )}
          {error && !sessionDone && (
            <p className="text-[12px] text-[#E39159] text-center max-w-[280px]">{error}</p>
          )}

          {/* Live dB meter with the good band highlighted */}
          <div className="w-full max-w-[260px]">
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute top-0 bottom-0 bg-white/25"
                style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }}
              />
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#B9542A,#E39159)', transition: 'width 0.1s' }} />
            </div>
            <div className="flex justify-between text-[10px] text-white/35 mt-1">
              <span>เบา</span>
              <span>ช่วงดี {band.good_min}–{band.good_max}</span>
              <span>ดัง</span>
            </div>
          </div>

          {micStatus === 'calibrating' && (
            <div className="text-white/60 text-[12px] flex items-center gap-1.5">
              <Mic size={15} />
              กำลังวัดเสียงพื้นหลัง — โปรดนิ่งเงียบสักครู่…
            </div>
          )}
          {(micStatus === 'requesting' || micStatus === 'denied' || micStatus === 'error') && (
            <div className="text-white/60 text-[12px] flex items-center gap-1.5">
              <Mic size={15} />
              {micStatus === 'denied' ? 'กรุณาอนุญาตไมโครโฟน' : 'กำลังเปิดไมโครโฟน…'}
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
            { k: 'ช่วงเป้าหมาย dB', v: `${band.good_min}–${band.good_max} dB` },
            ...(isSustain ? [{ k: 'เป้าหมายค้างเสียง', v: `${step.holdMin ?? 5}–${step.holdTarget ?? 7} วินาที` }] : []),
            { k: 'เวลาในเซสชันนี้', v: clock },
          ]}
          onStop={stopSession}
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
        * ค่า dB ยังไม่ได้สอบเทียบ noise floor ของไมโครโฟน · ช่วงเป้าหมายและคำจะปรับตามที่นักกายภาพกำหนดให้ผู้ป่วยแต่ละคน
      </p>
    </div>
  )
}
