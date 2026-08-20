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
      {/* Streak card */}
      <div
        className="rounded-card p-6 mb-7 text-white flex items-center justify-between relative overflow-hidden shadow-soft"
        style={{ background: 'linear-gradient(135deg,#FF8452,#D94A1D)' }}
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.14) 2px, transparent 2.5px)', backgroundSize: '24px 24px' }}
        />
        <div className="relative flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-[13px] bg-sun-500 text-coral-700 flex items-center justify-center flex-shrink-0">
            <Flame size={22} />
          </div>
          <div>
            <div className="opacity-75 text-[13px] mb-1">ฝึกต่อเนื่อง</div>
            <div className="font-heading text-[30px] font-semibold leading-none">
              {streak} <span className="text-[15px] font-normal opacity-75">วันติดต่อกัน</span>
            </div>
            <p className="text-[12.5px] opacity-75 mt-1.5">
              {streak > 0 ? 'ทำได้ดีมาก! ฝึกวันนี้เพื่อรักษาสถิติต่อเนื่องไว้' : 'เริ่มฝึกวันนี้เพื่อสร้างสถิติต่อเนื่อง'}
            </p>
          </div>
        </div>
        <div className="relative text-right">
          <div className="opacity-65 text-[12px] mb-1">ท่าที่ทำวันนี้</div>
          <div className="font-heading text-[28px] font-semibold text-sun-200">{doneToday}</div>
        </div>
      </div>

      <SectionTitle>เลือกโปรแกรมฝึกวันนี้</SectionTitle>
      <div className="grid md:grid-cols-2 gap-[18px]">
        <Card className="p-6">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center mb-3.5">
            <Activity size={24} />
          </div>
          <h3 className="font-heading text-[16px] font-semibold mb-1">LSVT BIG</h3>
          <p className="text-[13px] text-ink-secondary leading-relaxed mb-1">
            ฝึกการเคลื่อนไหวร่างกาย ผ่านกล้องเว็บแคมพร้อมวิเคราะห์ท่าทางแบบเรียลไทม์
          </p>
          <p className="text-[12px] text-ink-muted mb-4">20 นาที · เหลืออีก {bigLeft} ท่าวันนี้</p>
          <Button to="/training/big" variant="primary">เริ่มฝึก</Button>
        </Card>

        <Card className="p-6">
          <div className="w-12 h-12 rounded-xl bg-coral-100 text-coral-700 flex items-center justify-center mb-3.5">
            <Mic size={24} />
          </div>
          <h3 className="font-heading text-[16px] font-semibold mb-1">LSVT LOUD</h3>
          <p className="text-[13px] text-ink-secondary leading-relaxed mb-1">
            ฝึกความดังของเสียงพูด ผ่านไมโครโฟนพร้อมวัดระดับเสียงแบบเรียลไทม์
          </p>
          <p className="text-[12px] text-ink-muted mb-4">10 นาที · เหลืออีก {loudLeft} แบบฝึกหัด</p>
          <Button to="/training/loud" variant="coral">เริ่มฝึก</Button>
        </Card>
      </div>

      <Link
        to="/dashboard"
        className="mt-5 flex items-center justify-between rounded-card px-5 py-4 bg-sky-100 border border-sky-200 hover:brightness-[0.98] transition"
      >
        <span className="flex items-center gap-2 text-[13.5px] text-sky-600 font-semibold">
          <Chart size={17} /> ดูสรุปผลและความคืบหน้าของคุณ
        </span>
        <ChevronRight size={18} className="text-sky-600" />
      </Link>
    </div>
  )
}
