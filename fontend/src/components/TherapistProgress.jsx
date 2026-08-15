import { useState } from 'react'

// Therapist view of a patient's training volume (minutes), following the
// therapist_patient_dashboard_7.html mockup: month/week tabs + grouped BIG/LOUD
// bar chart + time metrics. Data is mock for now (the patient's real sessions
// live on their own device/account and aren't reachable from the therapist yet).
const WEEK_DATA = [
  { range: '1–7 ก.ค. 2569', daysTrained: 5, days: [
    { d: 'จ', big: 18, loud: 8 }, { d: 'อ', big: 22, loud: 12 }, { d: 'พ', big: 0, loud: 0 },
    { d: 'พฤ', big: 25, loud: 15 }, { d: 'ศ', big: 15, loud: 8 }, { d: 'ส', big: 0, loud: 0 }, { d: 'อา', big: 20, loud: 10 } ] },
  { range: '8–14 ก.ค. 2569', daysTrained: 6, days: [
    { d: 'จ', big: 20, loud: 10 }, { d: 'อ', big: 24, loud: 14 }, { d: 'พ', big: 10, loud: 5 },
    { d: 'พฤ', big: 28, loud: 16 }, { d: 'ศ', big: 18, loud: 9 }, { d: 'ส', big: 0, loud: 0 }, { d: 'อา', big: 22, loud: 12 } ] },
  { range: '15–21 ก.ค. 2569', daysTrained: 4, days: [
    { d: 'จ', big: 15, loud: 6 }, { d: 'อ', big: 0, loud: 0 }, { d: 'พ', big: 20, loud: 10 },
    { d: 'พฤ', big: 0, loud: 0 }, { d: 'ศ', big: 25, loud: 12 }, { d: 'ส', big: 0, loud: 0 }, { d: 'อา', big: 18, loud: 8 } ] },
  { range: '22–28 ก.ค. 2569', daysTrained: 7, days: [
    { d: 'จ', big: 22, loud: 11 }, { d: 'อ', big: 26, loud: 13 }, { d: 'พ', big: 19, loud: 9 },
    { d: 'พฤ', big: 30, loud: 18 }, { d: 'ศ', big: 24, loud: 12 }, { d: 'ส', big: 15, loud: 6 }, { d: 'อา', big: 20, loud: 10 } ] },
]
const DAYS_IN_MONTH = 31

function weekTotals(w) {
  return w.days.reduce((a, d) => ({ big: a.big + d.big, loud: a.loud + d.loud }), { big: 0, loud: 0 })
}
function niceMax(v) {
  if (v <= 0) return 5
  if (v <= 20) return Math.ceil(v / 5) * 5
  if (v <= 100) return Math.ceil(v / 10) * 10
  return Math.ceil(v / 50) * 50
}

// Grouped bar chart (BIG teal / LOUD coral) with a value axis — ported from the mockup SVG.
function GroupedBars({ bars }) {
  const W = 640, H = 220, mL = 54, mT = 14, mR = 16, mB = 34
  const plotW = W - mL - mR, plotH = H - mT - mB
  const groupW = plotW / bars.length
  const barW = Math.min(20, groupW * 0.28), gap = 5
  const maxVal = niceMax(Math.max(1, ...bars.map((b) => Math.max(b.big, b.loud))))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect x={mL} y={mT} width={plotW} height={plotH} fill="none" stroke="#E6E0D4" strokeWidth="1.2" />
      {[0, 1, 2, 3, 4].map((i) => {
        const y = mT + plotH - (i / 4) * plotH
        return (
          <g key={`t${i}`}>
            {i > 0 && <line x1={mL} y1={y} x2={mL + plotW} y2={y} stroke="#E6E0D4" strokeWidth="1" strokeDasharray="3 3" />}
            <text x={mL - 8} y={y + 3} fontSize="10" fill="#8E9B96" textAnchor="end">{Math.round((maxVal * i) / 4)}</text>
          </g>
        )
      })}
      {bars.map((b, i) => {
        const gx = mL + i * groupW + groupW / 2
        const bigH = (b.big / maxVal) * plotH, loudH = (b.loud / maxVal) * plotH
        const bigX = gx - barW - gap / 2, loudX = gx + gap / 2
        const bigY = mT + plotH - bigH, loudY = mT + plotH - loudH
        return (
          <g key={`b${i}`}>
            <rect x={bigX} y={bigY} width={barW} height={bigH} fill="#4E9484" rx="2" />
            <rect x={loudX} y={loudY} width={barW} height={loudH} fill="#B9542A" rx="2" />
            {b.big > 0 && <text x={bigX + barW / 2} y={bigY - 4} fontSize="9.5" fill="#1F4A40" textAnchor="middle" fontWeight="600">{b.big}</text>}
            {b.loud > 0 && <text x={loudX + barW / 2} y={loudY - 4} fontSize="9.5" fill="#B9542A" textAnchor="middle" fontWeight="600">{b.loud}</text>}
            <text x={gx} y={mT + plotH + 16} fontSize="10.5" fill="#5B6B66" textAnchor="middle">{b.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function TherapistProgress() {
  const [view, setView] = useState('month')
  const [weekIdx, setWeekIdx] = useState(0)
  const isMonth = view === 'month'

  let metrics, bars, title
  if (isMonth) {
    const totalBig = WEEK_DATA.reduce((s, w) => s + weekTotals(w).big, 0)
    const totalLoud = WEEK_DATA.reduce((s, w) => s + weekTotals(w).loud, 0)
    const days = WEEK_DATA.reduce((s, w) => s + w.daysTrained, 0)
    metrics = [
      { value: `${days} / ${DAYS_IN_MONTH}`, label: 'วันที่ฝึกในเดือนนี้' },
      { value: `${totalBig} นาที`, label: 'รวมเวลา LSVT BIG' },
      { value: `${totalLoud} นาที`, label: 'รวมเวลา LSVT LOUD' },
    ]
    bars = WEEK_DATA.map((w, i) => ({ label: 'สัปดาห์ ' + (i + 1), ...weekTotals(w) }))
    title = 'ระยะเวลาฝึกรวมรายสัปดาห์ — เดือน ก.ค. 2569 (นาที)'
  } else {
    const w = WEEK_DATA[weekIdx]
    const t = weekTotals(w)
    metrics = [
      { value: `${w.daysTrained} / 7`, label: 'วันที่ฝึกสัปดาห์นี้' },
      { value: `${t.big} นาที`, label: 'รวมเวลา LSVT BIG' },
      { value: `${t.loud} นาที`, label: 'รวมเวลา LSVT LOUD' },
    ]
    bars = w.days.map((d) => ({ label: d.d, big: d.big, loud: d.loud }))
    title = `ระยะเวลาฝึกรายวัน — สัปดาห์ที่ ${weekIdx + 1} (${w.range}) · นาที`
  }

  return (
    <div>
      {/* month / week tabs */}
      <div className="flex border-b border-line mb-4">
        {[['month', 'รายเดือน'], ['week', 'รายสัปดาห์']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`py-2.5 mr-7 -mb-px text-[14px] font-semibold border-b-[2.5px] transition-colors ${
              view === v ? 'text-teal-900 border-teal-700' : 'text-ink-secondary border-transparent'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* week sub-tabs */}
      {!isMonth && (
        <div className="flex flex-wrap gap-2 mb-5">
          {WEEK_DATA.map((w, i) => (
            <button
              key={i}
              onClick={() => setWeekIdx(i)}
              className={`px-4 py-1.5 rounded-full text-[12.5px] font-semibold border transition-colors ${
                weekIdx === i ? 'bg-teal-700 border-teal-700 text-white' : 'bg-surface border-line text-ink-secondary'
              }`}
            >
              สัปดาห์ที่ {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* time metrics */}
      <div className="flex flex-wrap gap-3.5 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className="flex-1 min-w-[150px] card px-[18px] py-4">
            <div className="font-heading text-[22px] font-semibold text-teal-900">{m.value}</div>
            <div className="text-[12px] text-ink-secondary mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* chart */}
      <div className="card p-6 mb-7">
        <p className="text-[13px] font-semibold text-ink-secondary mb-4">{title}</p>
        <GroupedBars bars={bars} />
        <div className="flex gap-5 mt-3.5">
          <span className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
            <span className="w-2 h-2 rounded-full bg-teal-500" /> LSVT BIG
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
            <span className="w-2 h-2 rounded-full bg-coral-700" /> LSVT LOUD
          </span>
        </div>
      </div>
    </div>
  )
}
