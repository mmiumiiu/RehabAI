import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCamera } from '../../lib/useCamera.js'
import { usePoseLandmarker } from '../../lib/usePoseLandmarker.js'
import { useRepScorer } from '../../lib/useRepScorer.js'
import { useSpeak } from '../../lib/useSpeak.js'
import PoseCanvas from '../../components/PoseCanvas.jsx'
import PoseSkeleton from '../../components/PoseSkeleton.jsx'
import SOSButton from '../../components/SOSButton.jsx'
import { ProgressBar } from '../../components/ui.jsx'
import { Camera, Check, Home } from '../../components/icons.jsx'
import { BIG_EXERCISES } from '../../lib/mockData.js'
import { sessionHistory } from '../../lib/services.js'

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

function avgConf(repScores) {
  if (!repScores.length) return null
  return repScores.reduce((s, r) => s + r.conf, 0) / repScores.length
}

export default function SessionBig() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const exId = Number(params.get('exercise')) || 1
  const ex = BIG_EXERCISES.find((e) => e.id === exId) || BIG_EXERCISES[0]
  const clock = useSessionClock()

  const { videoRef, status } = useCamera(true)
  const { landmarks, ready: poseReady } = usePoseLandmarker(videoRef, status === 'live')
  const { repCount, repScores, lastScore, recording, modelExercise } =
    useRepScorer(landmarks, exId, status === 'live')

  // Read the exercise instruction aloud 2s after the session opens.
  useSpeak(`${ex.name} ${ex.how}`, { delayMs: 2000 })

  const complete = repCount >= ex.target
  const good = lastScore ? lastScore.verdict === 'correct' : true
  const accuracy = avgConf(repScores)

  // Persist the real session result once the target is reached (score = average
  // pose-quality confidence from the model; null when the exercise has no model).
  const recordedRef = useRef(false)
  useEffect(() => {
    if (!complete || recordedRef.current) return
    recordedRef.current = true
    sessionHistory.add({
      type: 'big',
      score: accuracy != null ? accuracy * 100 : null,
      reps: repCount,
      goal: ex.target,
      duration: clock,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete])

  // Bottom bar message
  let barMsg = ex.how.split(' ').slice(0, 8).join(' ') + '…'
  if (complete) barMsg = 'เยี่ยมมาก! ทำครบตามเป้าหมายแล้ว'
  else if (recording) barMsg = 'กำลังวิเคราะห์ท่า…'
  else if (lastScore?.verdict === 'correct') barMsg = 'ท่าถูกต้อง'
  else if (lastScore?.verdict === 'needs_work') barMsg = 'ลองปรับท่าให้ดีขึ้น'
  else if (status === 'live' && !poseReady) barMsg = 'กำลังโหลด AI…'
  else if (status === 'live' && poseReady && !landmarks) barMsg = 'ไม่พบผู้ใช้งานในกล้อง'

  return (
    <div className="min-h-screen bg-bg p-3 md:p-6">
      <div className="max-w-[1100px] mx-auto space-y-5">

        {/* Top: demo animation (left) + live camera (right) */}
        <div className="grid lg:grid-cols-2 gap-5">

        {/* Demo animation — loops continuously */}
        <div className="relative rounded-2xl overflow-hidden bg-cam aspect-[16/10] flex items-center justify-center">
          {ex.video ? (
            <video src={ex.video} autoPlay loop muted playsInline className="w-full h-full object-contain" />
          ) : (
            <div className="text-white/60 text-[13px] text-center px-6">
              <Camera size={36} className="mx-auto mb-2 opacity-70" />
              ยังไม่มีวิดีโอสาธิตสำหรับท่านี้
            </div>
          )}
          <span className="absolute top-4 left-4 bg-white/[0.12] text-white px-3 py-1.5 rounded-lg text-[11px]">
            ท่าสาธิต
          </span>
        </div>

        {/* Camera panel */}
        <div className="relative rounded-2xl overflow-hidden bg-cam aspect-[16/10] flex items-center justify-center">
          <video
            ref={videoRef}
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-90"
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* Real skeleton when pose is ready, simulated skeleton as fallback */}
          {status === 'live' && (
            poseReady
              ? <PoseCanvas landmarks={landmarks} good={good} />
              : (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <PoseSkeleton phase={0} good={true} />
                </div>
              )
          )}

          {status !== 'live' && (
            <div className="relative z-[1] text-center text-white/70 px-6">
              <Camera size={40} className="mx-auto mb-3 opacity-70" />
              {status === 'denied'
                ? <p className="text-[13.5px]">ไม่สามารถเข้าถึงกล้องได้ — กรุณาอนุญาตการใช้กล้องในเบราว์เซอร์</p>
                : <p className="text-[13.5px]">กำลังเปิดกล้อง…</p>}
            </div>
          )}

          <SOSButton reason="fall" />

          <div className="absolute top-4 left-4 bg-white/[0.12] text-white px-4 py-2 rounded-[10px] font-heading text-[14px] font-semibold">
            ครั้งที่ {repCount} / {ex.target}
          </div>

          <div className="absolute top-4 right-4 bg-white/[0.12] text-white px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5">
            {recording
              ? <><span className="w-[7px] h-[7px] rounded-full bg-[#E4746A] rec-pulse" />บันทึก</>
              : <><span className="w-[7px] h-[7px] rounded-full bg-[#4E9484]" />วิเคราะห์ท่าทางแบบเรียลไทม์</>}
          </div>

          <div
            className="absolute bottom-4 left-4 right-4 px-4 py-3 rounded-[10px] text-white text-[13.5px] font-medium flex items-center gap-2"
            style={{ background: complete ? 'rgba(78,148,132,0.92)' : good ? 'rgba(78,148,132,0.80)' : 'rgba(185,84,42,0.80)' }}
          >
            {(complete || good) && <Check size={18} />}
            {barMsg}
          </div>
        </div>
        </div>

        {/* Bottom: exercise description + progress + stats */}
        <div className="card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-[18px] font-semibold text-teal-900 mb-1.5">{ex.name}</h2>
              <p className="text-[13.5px] text-ink-secondary leading-relaxed">{ex.how}</p>
            </div>
            <button
              onClick={() => navigate('/training/big')}
              className="flex-shrink-0 py-2.5 px-5 rounded-btn border border-danger text-danger font-semibold text-[13.5px] hover:bg-[#FBEAE8] transition-colors"
            >
              หยุดฝึก
            </button>
          </div>

          <ProgressBar value={repCount} max={ex.target} tone="big" />
          <div className="flex justify-between text-[11.5px] text-ink-muted mt-1.5 mb-4">
            <span>ครั้งที่ {repCount}</span>
            <span>เป้าหมาย {ex.target}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { k: 'ครั้งที่ทำแล้ว', v: `${repCount} / ${ex.target}` },
              { k: 'เวลาในเซสชันนี้', v: clock },
            ].map((s) => (
              <div key={s.k} className="rounded-xl bg-bg px-4 py-3 flex flex-col gap-0.5">
                <span className="text-[11.5px] text-ink-secondary">{s.k}</span>
                <span className="font-semibold font-mono text-[14px]">{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Completion popup — celebrates finishing the exercise and sends the
          patient back to Home to pick the next one. */}
      {complete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-2xl w-full max-w-[440px] p-7 text-center shadow-2xl">
            <div className="text-[46px] leading-none mb-2">🎉</div>
            <h2 className="font-heading text-[24px] font-semibold text-teal-900 mb-1">Congratulations!</h2>
            <p className="text-[14px] text-ink-secondary mb-5">
              ยินดีด้วย! คุณทำท่า “{ex.name}” ครบ {ex.target} ครั้งแล้ว
            </p>

            <button
              onClick={() => navigate('/home')}
              className="btn-primary w-full flex items-center justify-center gap-2 mb-2"
            >
              <Home size={18} /> ไปหน้าหลัก — ทำท่าต่อไป
            </button>
            <button
              onClick={() => navigate('/training/big')}
              className="w-full py-2.5 text-[13.5px] text-ink-secondary hover:text-teal-700 transition-colors"
            >
              กลับไปรายการท่าฝึก
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
