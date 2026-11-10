import { Link } from 'react-router-dom'
import FrequencyChart from '../../components/FrequencyChart.jsx'
import LoudTrendChart from '../../components/LoudTrendChart.jsx'
import { StatCard } from '../../components/ui.jsx'
import { Activity, Mic, Flame, Clock, Chat } from '../../components/icons.jsx'
import { useSessionHistory, startOfDay, trainingStreak } from '../../lib/useSessionHistory.js'
import { useLoudResults } from '../../lib/useLoudResults.js'

// Layout follows the "results" section of design/bridge-mockup.html: stat cards,
// the 7-day minutes chart, then the session history. Mockup px ÷ 1.4 (the
// patient portal body zoom). Accuracy figures are deliberately not shown here.

const THAI_DOW = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const DAY_MS = 86400000

// 'mm:ss' → whole minutes (rounded up, so a 40-second session still counts).
function durationMinutes(duration) {
  const [mm = '0', ss = '0'] = String(duration || '').split(':')
  const total = Number(mm) * 60 + Number(ss)
  return Number.isFinite(total) && total > 0 ? Math.max(1, Math.round(total / 60)) : 0
}

function hoursLabel(minutes) {
  if (minutes < 60) return `${minutes} นาที`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} ชม. ${m} นาที` : `${h} ชม.`
}

// "วันนี้ 08:40" / "เมื่อวาน 17:10" / "8 พ.ย. 09:15" — as in the mockup.
function whenLabel(ts) {
  const d = new Date(ts)
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  const diff = (startOfDay(Date.now()) - startOfDay(ts)) / DAY_MS
  if (diff === 0) return `วันนี้ ${time}`
  if (diff === 1) return `เมื่อวาน ${time}`
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${time}`
}

const VERDICTS = [
  { min: 85, label: 'ดีมาก', background: '#E3F1DC', color: '#24661A' },
  { min: 70, label: 'ดี', background: '#E3F1DC', color: '#24661A' },
  { min: 0, label: 'ควรฝึกเพิ่ม', background: '#FFF1C7', color: '#6B4A00' },
]
const verdictOf = (score) => VERDICTS.find((v) => score >= v.min) || VERDICTS[2]

export default function Dashboard() {
  const rows = useSessionHistory()
  const loud = useLoudResults()

  const today0 = startOfDay(Date.now())
  const weekStart0 = today0 - 6 * DAY_MS

  const trainedDays = new Set(rows.map((r) => startOfDay(r.ts)))
  const streak = trainingStreak(rows)

  const weekRows = rows.filter((r) => startOfDay(r.ts) >= weekStart0)
  const weekMinutes = weekRows.reduce((sum, r) => sum + durationMinutes(r.duration), 0)

  // 7-day minutes per type (oldest → today) for the chart.
  const freq = Array.from({ length: 7 }, (_, i) => {
    const day0 = weekStart0 + i * DAY_MS
    const dayRows = rows.filter((r) => startOfDay(r.ts) === day0)
    const sum = (type) => dayRows.filter((r) => r.type === type).reduce((s, r) => s + durationMinutes(r.duration), 0)
    return { day: THAI_DOW[new Date(day0).getDay()], big: sum('big'), loud: sum('loud') }
  })

  const recent = rows.slice(0, 8)

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-b-label font-semibold text-ink-secondary m-0 mb-1">ภาพรวมของคุณ</p>
          <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">สรุปผลการฝึก</h1>
        </div>
        <Link
          to="/chat"
          className="inline-flex items-center justify-center gap-3 min-h-[51px] px-6 rounded-btn bg-surface border-[3px] border-line text-ink-primary text-b-btn font-bold hover:bg-teal-50 transition-colors"
        >
          คุยกับนักกายภาพ <Chat size={22} />
        </Link>
      </header>

      {/* Three stat cards — one full row on desktop, stacked on phones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard layout="grid" icon={Activity} value={`${trainedDays.size} วัน`} label="ฝึกรวมทั้งหมด" />
        <StatCard layout="grid" icon={Flame} value={`${streak} วัน`} label="ฝึกติดต่อกัน" rule="#6B4A00" tint="#FFF1C7" />
        <StatCard layout="grid" icon={Clock} value={hoursLabel(weekMinutes)} label="เวลาฝึกสัปดาห์นี้" />
      </div>

      <FrequencyChart data={freq} />

      <div className="flex flex-wrap gap-5">
        {/* Session history */}
        <section className="flex-1 min-w-[320px] bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col">
          <h2 className="font-heading text-b-h2 font-bold m-0 mb-4 leading-[1.3]">ประวัติการฝึก</h2>

          {recent.length === 0 ? (
            <p className="text-b-base text-ink-secondary leading-[1.6] m-0 py-4">
              ยังไม่มีประวัติการฝึก — เริ่มฝึกเคลื่อนไหวหรือฝึกเสียงพูด แล้วผลจะถูกบันทึกที่นี่อัตโนมัติ
            </p>
          ) : (
            recent.map((r) => {
              const isBig = r.type === 'big'
              const v = r.score == null ? null : verdictOf(r.score)
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-4 flex-wrap py-4 border-t-2"
                  style={{ borderColor: '#E6F1F7' }}
                >
                  <span
                    className="w-[51px] h-[51px] rounded-[14px] flex items-center justify-center flex-shrink-0"
                    style={isBig ? { background: '#E0F1FA', color: '#157AB5' } : { background: '#EEE8FA', color: '#6D3FC0' }}
                  >
                    {isBig ? <Activity size={26} /> : <Mic size={26} />}
                  </span>
                  <div className="flex-1 min-w-[160px]">
                    <div className="text-b-btn font-bold">{isBig ? 'ฝึกเคลื่อนไหว' : 'ฝึกเสียงพูด'}</div>
                    <div className="text-b-label">
                      {whenLabel(r.ts)} · {r.duration}
                      {r.reps != null && r.goal != null && ` · ${r.reps}/${r.goal} ครั้ง`}
                    </div>
                  </div>
                  {v && (
                    <span
                      className="inline-flex items-center gap-1.5 text-b-sm font-bold px-4 py-1 rounded-pill"
                      style={{ background: v.background, color: v.color }}
                    >
                      {v.label}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </section>
      </div>

      {/* Voice-training trend — real LOUD results, kept from the previous page. */}
      <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-5">
        <h2 className="font-heading text-b-h2 font-bold m-0 leading-[1.3]">ความคืบหน้าการฝึกเสียงพูด</h2>
        <LoudTrendChart rows={loud} />
      </section>
    </div>
  )
}
