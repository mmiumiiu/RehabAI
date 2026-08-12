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

function avgConf(repScores) {
  if (!repScores.length) return null
  return repScores.reduce((s, r) => s + r.conf, 0) / repScores.length
}

function stars(conf) {
  if (conf >= 0.75) return { s: '★★★', label: 'ดีมาก' }
  if (conf >= 0.50) return { s: '★★☆', label: 'ดี' }
  return { s: '★☆☆', label: 'ต้องฝึกเพิ่ม' }
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

  // Bottom bar message
  let barMsg = ex.how.split(' ').slice(0, 8).join(' ') + '…'
  if (complete) barMsg = 'เยี่ยมมาก! ทำครบตามเป้าหมายแล้ว'
  else if (recording) barMsg = 'กำลังวิเคราะห์ท่า…'
  else if (lastScore?.verdict === 'correct') barMsg = `ท่าถูกต้อง — ${stars(lastScore.conf).s} ${stars(lastScore.conf).label}`
  else if (lastScore?.verdict === 'needs_work') barMsg = `ปรับท่าให้ดีขึ้น — ${stars(lastScore.conf).s} ${stars(lastScore.conf).label}`
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
            <video src={ex.video} autoPlay loop muted playsInline className="w-full h-full object-cover" />
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

          {/* Per-rep score badge — shown briefly after each scored rep */}
          {lastScore && !recording && lastScore.verdict !== 'too_short' && (
            <div
              className="absolute top-14 right-4 px-3 py-2 rounded-lg text-white text-[13px] font-semibold"
              style={{ background: lastScore.verdict === 'correct' ? 'rgba(78,148,132,0.92)' : 'rgba(185,84,42,0.92)' }}
            >
              {lastScore.verdict === 'correct' ? '✓' : '⚠'} {stars(lastScore.conf).s} {stars(lastScore.conf).label}
            </div>
          )}

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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { k: 'ความแม่นยำท่าทาง', v: accuracy != null ? `${stars(accuracy).s} ${stars(accuracy).label}` : modelExercise ? '—' : 'ไม่รองรับ' },
              { k: 'เวลาในเซสชันนี้', v: clock },
              { k: 'ครั้งที่ประเมินแล้ว', v: `${repScores.length}` },
            ].map((s) => (
              <div key={s.k} className="rounded-xl bg-bg px-4 py-3 flex flex-col gap-0.5">
                <span className="text-[11.5px] text-ink-secondary">{s.k}</span>
                <span className="font-semibold font-mono text-[14px]">{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {complete && (
        <div className="max-w-[1100px] mx-auto mt-4">
          {/* Session summary */}
          {repScores.length > 0 && (
            <div className="bg-surface rounded-2xl p-5 mb-4 border border-line">
              <h3 className="font-heading text-[15px] font-semibold text-teal-900 mb-3">สรุปผลการฝึก</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {repScores.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-3 text-center text-[13px]"
                    style={{
                      background: r.verdict === 'correct' ? '#E6F0E1' : '#FDF3D9',
                      color: r.verdict === 'correct' ? '#3B6D11' : '#9A6B0A',
                    }}
                  >
                    <div className="font-semibold">ครั้งที่ {i + 1}</div>
                    <div className="text-[18px] font-bold">{stars(r.conf).s}</div>
                    <div className="text-[11px]">{stars(r.conf).label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <button onClick={() => navigate('/training/big')} className="btn-primary max-w-[220px]">
              เสร็จสิ้น — กลับไปรายการท่าฝึก
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
