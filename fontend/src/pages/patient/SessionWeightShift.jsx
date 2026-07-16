import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCamera } from '../../lib/useCamera.js'
import SessionInfoCard from '../../components/SessionInfoCard.jsx'
import SOSButton from '../../components/SOSButton.jsx'
import { Camera, Check } from '../../components/icons.jsx'
import { BIG_EXERCISES } from '../../lib/mockData.js'

const EX = BIG_EXERCISES.find((e) => e.weightShift)

export default function SessionWeightShift() {
  const navigate = useNavigate()
  const { videoRef, status } = useCamera(true)
  const [reps, setReps] = useState(0)
  const [distance, setDistance] = useState(32) // cm, target 30–35
  const [seconds, setSeconds] = useState(0)
  const doneRef = useRef(false)

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (status !== 'live') return
    let frame = 0
    const id = setInterval(() => {
      frame += 1
      // measured foot-to-foot distance oscillates as the patient steps
      const d = 30 + Math.abs(Math.sin(frame / 10)) * 8
      setDistance(Math.round(d))
      if (frame % 24 === 0 && !doneRef.current) {
        setReps((r) => {
          const next = r + 1
          if (next >= EX.target) doneRef.current = true
          return Math.min(next, EX.target)
        })
      }
    }, 90)
    return () => clearInterval(id)
  }, [status])

  const inRange = distance >= 30 && distance <= 35
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-[1100px] mx-auto grid lg:grid-cols-[1.6fr_1fr] gap-5">
        <div className="relative rounded-2xl overflow-hidden bg-cam aspect-[16/10] flex items-center justify-center">
          <video ref={videoRef} muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-90" style={{ transform: 'scaleX(-1)' }} />
          {status !== 'live' && (
            <div className="relative z-[1] text-center text-white/70 px-6">
              <Camera size={40} className="mx-auto mb-3 opacity-70" />
              <p className="text-[13.5px]">{status === 'denied' ? 'กรุณาอนุญาตการใช้กล้อง' : 'กำลังเปิดกล้อง…'}</p>
            </div>
          )}

          <SOSButton reason="fall" />
          <div className="absolute top-4 left-4 bg-white/[0.12] text-white px-4 py-2 rounded-[10px] font-heading text-[14px] font-semibold">
            ครั้งที่ {reps} / {EX.target}
          </div>
          <div className="absolute top-4 right-4 bg-white/[0.12] text-white px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5">
            <span className="w-[7px] h-[7px] rounded-full bg-[#E4746A] rec-pulse" />
            วัดระยะก้าวแบบเรียลไทม์
          </div>

          {/* Floor markers (spec §3.8) */}
          {status === 'live' && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[70px] w-[220px] h-1">
              <div className="absolute left-3.5 right-3.5 top-0 border-t-2 border-dashed border-white/40" />
              <div className="absolute -top-1.5 left-0 w-3.5 h-3.5 rounded-full border-2 border-teal-500 bg-teal-500/25" />
              <div className="absolute -top-1.5 right-0 w-3.5 h-3.5 rounded-full border-2 border-teal-500 bg-teal-500/25" />
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] text-white px-3 py-1 rounded-md"
                style={{ background: inRange ? 'rgba(78,148,132,0.9)' : 'rgba(185,84,42,0.9)' }}
              >
                ระยะก้าว {distance} ซม. {inRange ? '✓ อยู่ในเกณฑ์ (30-35 ซม.)' : 'ปรับระยะให้อยู่ 30-35 ซม.'}
              </div>
            </div>
          )}

          <div
            className="absolute bottom-4 left-4 right-4 px-4 py-3 rounded-[10px] text-white text-[13.5px] font-medium flex items-center gap-2"
            style={{ background: inRange ? 'rgba(78,148,132,0.92)' : 'rgba(185,84,42,0.92)' }}
          >
            {inRange ? <Check size={18} /> : null}
            {inRange ? 'ระยะก้าวกำลังดี ถ่ายน้ำหนักไปเท้าหน้าให้มั่นคง' : 'ก้าวให้ปลายเท้าห่างกัน 30-35 ซม.'}
          </div>
        </div>

        <SessionInfoCard
          name={EX.name}
          desc={EX.how}
          reps={reps}
          target={EX.target}
          tone="big"
          stats={[
            { k: 'ระยะก้าวปัจจุบัน', v: `${distance} ซม.` },
            { k: 'เวลาในเซสชันนี้', v: `${mm}:${ss}` },
            { k: 'คะแนนสะสมวันนี้', v: `${86 + reps}` },
          ]}
          onStop={() => navigate('/training/big')}
        />
      </div>
    </div>
  )
}
