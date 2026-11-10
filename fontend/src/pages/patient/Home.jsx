import { Link } from 'react-router-dom'
import { Button, ProgressRing, StatCard } from '../../components/ui.jsx'
import { Flame, Activity, Mic, Chat, ChevronRight } from '../../components/icons.jsx'
import { BIG_EXERCISES } from '../../lib/mockData.js'
import { useLoudSteps } from '../../lib/useLoudSteps.js'
import { useExerciseProgress } from '../../lib/useExerciseProgress.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSessionHistory, trainingStreak, startOfDay } from '../../lib/useSessionHistory.js'

const WEEK_GOAL = 5
const DAY_MS = 86400000

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

function todayLabel() {
  const d = new Date()
  return `วัน${THAI_DAYS[d.getDay()]}ที่ ${d.getDate()} ${THAI_MONTHS[d.getMonth()]}`
}

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'สวัสดีตอนดึก'
  if (h < 12) return 'สวัสดีตอนเช้า'
  if (h < 17) return 'สวัสดีตอนบ่าย'
  if (h < 20) return 'สวัสดีตอนเย็น'
  return 'สวัสดีตอนค่ำ'
}

// Monday 00:00 of the current week.
function startOfWeek() {
  const t = startOfDay(Date.now())
  const dow = new Date(t).getDay() // 0 = Sunday
  return t - ((dow + 6) % 7) * DAY_MS
}

function TrainingCard({ icon: Icon, tint, accent, title, blurb, done, total, unit, cta, to }) {
  const pct = total ? Math.max(2, Math.round((done / total) * 100)) : 0
  return (
    <article className="flex-1 min-w-[300px] bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="w-[60px] h-[60px] rounded-[17px] flex items-center justify-center flex-shrink-0" style={{ background: tint, color: accent }}>
          <Icon size={31} />
        </span>
        <h3 className="font-heading text-b-h3 font-bold m-0">{title}</h3>
      </div>

      <p className="text-b-base leading-[1.6] m-0">{blurb}</p>

      <div>
        <div className="flex justify-between text-b-base font-bold mb-2.5">
          <span>ทำแล้ว {done} จาก {total} {unit}</span>
        </div>
        <div className="h-[13px] rounded-[9px] bg-teal-50 overflow-hidden">
          <div className="h-full rounded-[9px]" style={{ width: `${pct}%`, background: accent }} />
        </div>
      </div>

      <Link
        to={to}
        className="flex items-center justify-center gap-3 min-h-[57px] px-6 rounded-btn text-white text-b-btn font-bold"
        style={{ background: accent, border: `3px solid ${accent}` }}
      >
        {cta}<ChevronRight size={22} />
      </Link>
    </article>
  )
}

export default function Home() {
  const { user } = useAuth()
  const loudSteps = useLoudSteps()
  const prog = useExerciseProgress()

  // Remaining (not-yet-done-today) counts — update live as the patient finishes.
  // The whole BIG set counts, so this matches the training list and its ring.
  const bigLeft = BIG_EXERCISES.filter((e) => !prog.big.includes(e.id)).length
  const loudLeft = loudSteps.filter((s) => !prog.loud.includes(s.id)).length
  const doneToday = prog.big.length + prog.loud.length

  const rows = useSessionHistory()
  const streak = trainingStreak(rows)

  const trainedDays = new Set(rows.map((r) => startOfDay(r.ts)))
  const weekStart = startOfWeek()
  const daysThisWeek = [...trainedDays].filter((d) => d >= weekStart).length
  const programsLeft = (bigLeft ? 1 : 0) + (loudLeft ? 1 : 0)
  const firstTarget = bigLeft ? '/training/big' : '/training/loud'

  const name = user?.name?.split(' ')[0] || 'ผู้ใช้งาน'

  return (
    <div className="flex flex-col gap-7">
      {/* Greeting bar */}
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-b-label font-semibold text-ink-secondary m-0 mb-1">{todayLabel()}</p>
          <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">{greeting()} คุณ{name}</h1>
        </div>
        <Link
          to="/chat"
          className="inline-flex items-center gap-2.5 min-h-[51px] px-4 rounded-btn bg-indigo-100 text-indigo-700 text-b-label font-bold"
        >
          <Chat size={20} /> ข้อความจากนักกายภาพ
        </Link>
      </header>

      {/* Hero — streak, today's plan, big red CTA, progress ring */}
      <section
        className="rounded-[23px] px-7 py-8 flex flex-wrap items-center justify-between gap-8 text-ink-primary"
        style={{ background: 'linear-gradient(110deg, #CCE6F1 0%, #B4DCEC 40%, #92D0E5 72%, #87CBE8 100%)' }}
      >
        <div className="flex-1 min-w-[300px] flex flex-col gap-4">
          <span className="self-start inline-flex items-center gap-2.5 px-5 py-2 rounded-pill text-b-label font-bold" style={{ background: 'rgba(255,255,255,0.8)' }}>
            <Flame size={20} className="text-sun-600" /> ฝึกต่อเนื่อง {streak} วันแล้ว
          </span>

          {programsLeft > 0 ? (
            <>
              <h2 className="font-heading text-b-hero font-bold m-0 leading-[1.25]">
                วันนี้ฝึก {programsLeft} อย่าง
              </h2>
              <p className="text-b-base font-semibold leading-[1.6] m-0">
                ฝึกเคลื่อนไหว {bigLeft} ท่า · ฝึกเสียงพูด {loudLeft} ขั้นตอน
              </p>
            </>
          ) : (
            <>
              <h2 className="font-heading text-b-hero font-bold m-0 leading-[1.25]">
                วันนี้ฝึกครบแล้ว<br />เยี่ยมมาก
              </h2>
              <p className="text-b-base font-semibold leading-[1.6] m-0">
                ทำไปทั้งหมด {doneToday} รายการวันนี้ · พักผ่อนได้เลย
              </p>
            </>
          )}

          <div>
            <Button
              to={programsLeft > 0 ? firstTarget : '/dashboard'}
              className="min-h-[69px]"
              style={{ borderColor: '#A61F1F' }}
            >
              {programsLeft > 0 ? 'เริ่มฝึกวันนี้' : 'ดูสรุปผลของวันนี้'}
              <ChevronRight size={22} />
            </Button>
          </div>
        </div>

        <ProgressRing
          value={daysThisWeek}
          goal={WEEK_GOAL}
          label="วันในสัปดาห์นี้"
          size={171}
          stroke={16}
          track="rgba(255,255,255,0.7)"
        />
      </section>

      {/* Three stat cards — one full row on desktop, stacked on phones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard layout="grid" value={`${streak} วัน`} label="ฝึกติดต่อกัน" />
        <StatCard layout="grid" value={`${trainedDays.size} วัน`} label="ฝึกรวมทั้งหมด" />
        <StatCard layout="grid" value={`${doneToday} รายการ`} label="ทำแล้ววันนี้" />
      </div>

      {/* Two training programmes */}
      <div className="flex flex-wrap gap-5">
        <TrainingCard
          icon={Activity}
          tint="#E0F1FA"
          accent="#157AB5"
          title="ฝึกเคลื่อนไหว"
          blurb="กล้องช่วยดูท่าทาง และบอกทันทีว่าทำถูกหรือไม่"
          done={BIG_EXERCISES.length - bigLeft}
          total={BIG_EXERCISES.length}
          unit="ท่า"
          cta={bigLeft < BIG_EXERCISES.length ? 'ฝึกต่อ' : 'เริ่มฝึก'}
          to="/training/big"
        />
        <TrainingCard
          icon={Mic}
          tint="#EEE8FA"
          accent="#6D3FC0"
          title="ฝึกเสียงพูด"
          blurb="ไมโครโฟนวัดความดังของเสียง ช่วยให้พูดชัดขึ้น"
          done={loudSteps.length - loudLeft}
          total={loudSteps.length}
          unit="ขั้นตอน"
          cta={loudLeft < loudSteps.length ? 'ฝึกต่อ' : 'เริ่มฝึก'}
          to="/training/loud"
        />
      </div>
    </div>
  )
}
