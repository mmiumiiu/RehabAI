import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCamera } from '../../lib/useCamera.js'
import PoseSkeleton from '../../components/PoseSkeleton.jsx'
import SessionInfoCard from '../../components/SessionInfoCard.jsx'
import SOSButton from '../../components/SOSButton.jsx'
import { Camera, Check } from '../../components/icons.jsx'
import { BIG_EXERCISES } from '../../lib/mockData.js'

function useSessionClock() {
  const [t, setT] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setT((v) => v + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const mm = String(Math.floor(t / 60)).padStart(2, '0')
  const ss = String(t % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export default function SessionBig() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const exId = Number(params.get('exercise')) || 1
  const ex = BIG_EXERCISES.find((e) => e.id === exId) || BIG_EXERCISES[0]

  const { videoRef, status } = useCamera(true)
  const clock = useSessionClock()
  const [reps, setReps] = useState(0)
  const [phase, setPhase] = useState(0)
  const [accuracy, setAccuracy] = useState(90)
  const [good, setGood] = useState(true)
  const doneRef = useRef(false)

  // Simulated rep detection loop: advance a movement phase; each full cycle = 1 rep.
  useEffect(() => {
    if (status !== 'live') return
    let frame = 0
    const id = setInterval(() => {
      frame += 1
      const p = (frame % 30) / 30
      setPhase(p)
      // "good form" band in the middle of the range of motion
      const g = p > 0.15 && p < 0.85
      setGood(g)
      setAccuracy((a) => Math.max(70, Math.min(99, a + (g ? 1 : -2))))
      if (frame % 30 === 0 && !doneRef.current) {
        setReps((r) => {
          const next = r + 1
          if (next >= ex.target) doneRef.current = true
          return Math.min(next, ex.target)
        })
      }
    }, 80)
    return () => clearInterval(id)
  }, [status, ex.target])

  const complete = reps >= ex.target

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-[1100px] mx-auto grid lg:grid-cols-[1.6fr_1fr] gap-5">
        {/* Cam panel */}
        <div className="relative rounded-2xl overflow-hidden bg-cam aspect-[16/10] flex items-center justify-center">
          <video
            ref={videoRef}
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-90"
            style={{ transform: 'scaleX(-1)' }}
          />
          {/* pose overlay */}
          {status === 'live' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <PoseSkeleton phase={phase} good={good} />
            </div>
          )}
          {status !== 'live' && (
            <div className="relative z-[1] text-center text-white/70 px-6">
              <Camera size={40} className="mx-auto mb-3 opacity-70" />
              {status === 'denied' ? (
                <p className="text-[13.5px]">ไม่สามารถเข้าถึงกล้องได้ — กรุณาอนุญาตการใช้กล้องในเบราว์เซอร์</p>
              ) : (
                <p className="text-[13.5px]">กำลังเปิดกล้อง…</p>
              )}
            </div>
          )}

          <SOSButton reason="fall" />
          <div className="absolute top-4 left-4 bg-white/[0.12] text-white px-4 py-2 rounded-[10px] font-heading text-[14px] font-semibold">
            ครั้งที่ {reps} / {ex.target}
          </div>
          <div className="absolute top-4 right-4 bg-white/[0.12] text-white px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5">
            <span className="w-[7px] h-[7px] rounded-full bg-[#E4746A] rec-pulse" />
            วิเคราะห์ท่าทางแบบเรียลไทม์
          </div>

          <div
            className="absolute bottom-4 left-4 right-4 px-4 py-3 rounded-[10px] text-white text-[13.5px] font-medium flex items-center gap-2"
            style={{ background: good ? 'rgba(78,148,132,0.92)' : 'rgba(185,84,42,0.92)' }}
          >
            {good ? <Check size={18} /> : null}
            {complete
              ? 'เยี่ยมมาก! ทำครบตามเป้าหมายแล้ว'
              : good
              ? 'ท่าถูกต้อง — ยกแขนได้สุดช่วงเคลื่อนไหวแล้ว'
              : 'พยายามยกให้สุดช่วงและเคลื่อนไหวช้าๆ'}
          </div>
        </div>

        <SessionInfoCard
          name={ex.name}
          desc={ex.how}
          reps={reps}
          target={ex.target}
          tone="big"
          stats={[
            { k: 'ความแม่นยำท่าทาง', v: `${Math.round(accuracy)}%` },
            { k: 'เวลาในเซสชันนี้', v: clock },
            { k: 'คะแนนสะสมวันนี้', v: `${86 + reps}` },
          ]}
          onStop={() => navigate('/training/big')}
        />
      </div>

      {complete && (
        <div className="max-w-[1100px] mx-auto mt-4 flex justify-end">
          <button onClick={() => navigate('/training/big')} className="btn-primary max-w-[220px]">
            เสร็จสิ้น — กลับไปรายการท่าฝึก
          </button>
        </div>
      )}
    </div>
  )
}
