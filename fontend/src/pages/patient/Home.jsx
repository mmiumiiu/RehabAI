import { Link } from 'react-router-dom'
import { Card, SectionTitle, Button } from '../../components/ui.jsx'
import { Flame, Activity, Mic, ChevronRight, Chart } from '../../components/icons.jsx'
import { BIG_EXERCISES } from '../../lib/mockData.js'
import { useLoudSteps } from '../../lib/useLoudSteps.js'
import { useExerciseProgress } from '../../lib/useExerciseProgress.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSessionHistory, trainingStreak } from '../../lib/useSessionHistory.js'

export default function Home() {
  const { user } = useAuth()
  const loudSteps = useLoudSteps()
  const prog = useExerciseProgress()

  // Remaining (not-yet-done-today) counts — update live as the patient finishes.
  const standing = BIG_EXERCISES.filter((e) => e.posture === 'standing')
  const bigLeft = standing.filter((e) => !prog.big.includes(e.id)).length
  const loudLeft = loudSteps.filter((s) => !prog.loud.includes(s.id)).length
  const doneToday = prog.big.length + prog.loud.length

  const rows = useSessionHistory()
  const streak = trainingStreak(rows)

  return (
    <div className="max-w-[900px]">
      {/* Streak hero */}
      <div
        className="rounded-card p-7 mb-7 text-white flex items-center gap-6 relative overflow-hidden"
        style={{ background: '#5B50E0', boxShadow: '0 14px 32px rgba(91,80,224,.35)' }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.16) 2px, transparent 2.6px)', backgroundSize: '26px 26px' }} />
        <div className="absolute -top-8 right-28 w-28 h-28 rounded-full" style={{ background: 'rgba(247,193,50,.25)' }} />
        <div className="relative flex-1 min-w-0">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill text-[13.5px] font-bold" style={{ background: '#F7C132', color: '#5C4400' }}>
            <Flame size={15} /> ฝึกต่อเนื่อง {streak} วัน
          </span>
          <div className="font-heading text-[27px] font-semibold mt-3 mb-1">วันนี้เหลืออีก {bigLeft + loudLeft} โปรแกรม 💪</div>
          <div className="text-[14.5px] opacity-85">ทำได้ดีมาก! ฝึกให้ครบวันนี้เพื่อรักษาสถิติของคุณ · ทำแล้ว {doneToday} ท่า</div>
        </div>
        <button
          onClick={() => navigate('/training/big')}
          className="relative flex-shrink-0 rounded-[16px] font-heading font-bold text-[16px] px-7 min-h-[56px] active:translate-y-[3px] active:shadow-none transition-all"
          style={{ background: '#F7C132', color: '#3A2C00', border: '2.5px solid #D9A616', boxShadow: '0 4px 0 #D9A616' }}
        >
          เริ่มฝึกต่อ ›
        </button>
      </div>

      <SectionTitle>เลือกโปรแกรมฝึกวันนี้</SectionTitle>
      <div className="grid md:grid-cols-2 gap-[18px]">
        <div className="rounded-card p-6" style={{ background: '#E3F6E9' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-14 h-14 rounded-full text-white flex items-center justify-center" style={{ background: '#2FA65A', boxShadow: '0 8px 16px rgba(47,166,90,.4)' }}>
              <Activity size={26} />
            </div>
            <span className="text-[12.5px] font-bold px-3.5 py-1.5 rounded-pill bg-white" style={{ color: '#1E7A40' }}>20 นาที</span>
          </div>
          <h3 className="font-heading text-[21px] font-semibold mb-1" style={{ color: '#14522B' }}>LSVT BIG</h3>
          <p className="text-[14.5px] mb-3" style={{ color: '#2C6A45' }}>ฝึกการเคลื่อนไหวร่างกายผ่านกล้องเว็บแคม</p>
          <p className="text-[13px] font-semibold mb-4" style={{ color: '#2C6A45' }}>เหลืออีก {bigLeft} ท่าวันนี้</p>
          <Button to="/training/big" variant="primary" className="w-full">เริ่มฝึก LSVT BIG</Button>
        </div>

        <div className="rounded-card p-6" style={{ background: '#FDE8E4' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-14 h-14 rounded-full text-white flex items-center justify-center" style={{ background: '#E8554D', boxShadow: '0 8px 16px rgba(232,85,77,.4)' }}>
              <Mic size={26} />
            </div>
            <span className="text-[12.5px] font-bold px-3.5 py-1.5 rounded-pill bg-white" style={{ color: '#B33630' }}>10 นาที</span>
          </div>
          <h3 className="font-heading text-[21px] font-semibold mb-1" style={{ color: '#7A241F' }}>LSVT LOUD</h3>
          <p className="text-[14.5px] mb-3" style={{ color: '#8F4A44' }}>ฝึกความดังของเสียงพูดผ่านไมค์</p>
          <p className="text-[13px] font-semibold mb-4" style={{ color: '#8F4A44' }}>เหลืออีก {loudLeft} แบบฝึกหัด</p>
          <Button to="/training/loud" variant="coral" className="w-full">เริ่มฝึก LSVT LOUD</Button>
        </div>
      </div>

      <Link
        to="/dashboard"
        className="mt-[18px] flex items-center justify-between rounded-[18px] px-5 py-4 min-h-[56px] font-bold"
        style={{ background: '#E7F0FE', color: '#1D5FBF' }}
      >
        <span className="flex items-center gap-3 text-[15px]">
          <span className="w-9 h-9 rounded-full text-white flex items-center justify-center" style={{ background: '#3D87E8' }}><Chart size={17} /></span>
          ดูสรุปผลและความคืบหน้าของคุณ
        </span>
        <span className="text-[20px]">›</span>
      </Link>
    </div>
  )
}
