const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function dayKey(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime() }
function dayLabel(ts) { const d = new Date(ts); return `${d.getDate()} ${MONTHS[d.getMonth()]}` }

// Per-day LSVT LOUD progress: average loudness % vs correctness % (word, or hold
// for the "อา" step), one group of bars per day so days can be compared over time.
export default function LoudTrendChart({ rows, days = 8 }) {
  const byDay = new Map()
  for (const r of rows) {
    const k = dayKey(r.ts)
    const acc = r.word != null ? r.word : r.hold
    const e = byDay.get(k) || { loudSum: 0, loudN: 0, accSum: 0, accN: 0 }
    if (r.loud != null) { e.loudSum += r.loud; e.loudN++ }
    if (acc != null) { e.accSum += acc; e.accN++ }
    byDay.set(k, e)
  }
  const bars = [...byDay.keys()].sort((a, b) => a - b).slice(-days).map((k) => {
    const e = byDay.get(k)
    return {
      label: dayLabel(k),
      loud: e.loudN ? Math.round(e.loudSum / e.loudN) : 0,
      acc: e.accN ? Math.round(e.accSum / e.accN) : 0,
    }
  })

  if (bars.length === 0) {
    return (
      <div className="card px-5 py-8 text-center text-[13.5px] text-ink-secondary">
        ยังไม่มีผลฝึกออกเสียง — ฝึก LSVT LOUD ให้ครบเป้าเพื่อบันทึกความดังและความถูกต้องที่นี่
      </div>
    )
  }

  const W = 640, H = 240, mL = 40, mT = 14, mR = 14, mB = 34
  const plotW = W - mL - mR, plotH = H - mT - mB
  const groupW = plotW / bars.length
  const barW = Math.min(18, groupW * 0.3), gap = 5

  return (
    <div className="card p-6">
      <p className="text-[13px] font-semibold text-ink-secondary mb-4">ความดัง vs ความถูกต้อง — เทียบแต่ละวัน (%)</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        <rect x={mL} y={mT} width={plotW} height={plotH} fill="none" stroke="#E6E0D4" strokeWidth="1.2" />
        {[0, 25, 50, 75, 100].map((v) => {
          const y = mT + plotH - (v / 100) * plotH
          return (
            <g key={v}>
              {v > 0 && <line x1={mL} y1={y} x2={mL + plotW} y2={y} stroke="#E6E0D4" strokeWidth="1" strokeDasharray="3 3" />}
              <text x={mL - 6} y={y + 3} fontSize="10" fill="#8E9B96" textAnchor="end">{v}</text>
            </g>
          )
        })}
        {bars.map((b, i) => {
          const gx = mL + i * groupW + groupW / 2
          const loudH = (b.loud / 100) * plotH, accH = (b.acc / 100) * plotH
          const loudX = gx - barW - gap / 2, accX = gx + gap / 2
          const loudY = mT + plotH - loudH, accY = mT + plotH - accH
          return (
            <g key={i}>
              <rect x={loudX} y={loudY} width={barW} height={loudH} fill="#4E9484" rx="2" />
              <rect x={accX} y={accY} width={barW} height={accH} fill="#B9542A" rx="2" />
              <text x={loudX + barW / 2} y={loudY - 4} fontSize="9" fill="#2F6F62" textAnchor="middle" fontWeight="600">{b.loud}</text>
              <text x={accX + barW / 2} y={accY - 4} fontSize="9" fill="#B9542A" textAnchor="middle" fontWeight="600">{b.acc}</text>
              <text x={gx} y={mT + plotH + 16} fontSize="10" fill="#5B6B66" textAnchor="middle">{b.label}</text>
            </g>
          )
        })}
      </svg>
      <div className="flex gap-5 mt-3.5">
        <span className="flex items-center gap-1.5 text-[12px] text-ink-secondary"><span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> ความดัง</span>
        <span className="flex items-center gap-1.5 text-[12px] text-ink-secondary"><span className="w-2.5 h-2.5 rounded-full bg-coral-700" /> ความถูกต้อง</span>
      </div>
    </div>
  )
}
