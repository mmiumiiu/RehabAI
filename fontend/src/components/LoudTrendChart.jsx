const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function dayKey(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime() }
function dayLabel(ts) { const d = new Date(ts); return `${d.getDate()} ${MONTHS[d.getMonth()]}` }

// LSVT LOUD progress as a line chart: Y = percent, X = day. Two lines — average
// loudness % and correctness % (word, or hold for the "อา" step) per day.
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
  const pts = [...byDay.keys()].sort((a, b) => a - b).slice(-days).map((k) => {
    const e = byDay.get(k)
    return {
      label: dayLabel(k),
      loud: e.loudN ? Math.round(e.loudSum / e.loudN) : 0,
      acc: e.accN ? Math.round(e.accSum / e.accN) : 0,
    }
  })

  if (pts.length === 0) {
    return (
      <div className="card px-5 py-8 text-center text-[13.5px] text-ink-secondary">
        ยังไม่มีผลฝึกออกเสียง — ฝึก LSVT LOUD ให้ครบเป้าเพื่อบันทึกความดังและความถูกต้องที่นี่
      </div>
    )
  }

  const W = 640, H = 240, mL = 40, mT = 16, mR = 16, mB = 34
  const plotW = W - mL - mR, plotH = H - mT - mB
  const x = (i) => (pts.length === 1 ? mL + plotW / 2 : mL + (i / (pts.length - 1)) * plotW)
  const y = (v) => mT + plotH - (v / 100) * plotH
  const line = (key) => pts.map((p, i) => `${x(i)},${y(p[key])}`).join(' ')

  const series = [
    { key: 'loud', color: '#4E9484', label: 'ความดัง' },
    { key: 'acc', color: '#B9542A', label: 'ความถูกต้อง' },
  ]

  return (
    <div className="card p-6">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={mL} y1={y(v)} x2={mL + plotW} y2={y(v)} stroke="#E6E0D4" strokeWidth="1" strokeDasharray={v === 0 ? '0' : '3 3'} />
            <text x={mL - 6} y={y(v) + 3} fontSize="10" fill="#8E9B96" textAnchor="end">{v}</text>
          </g>
        ))}
        {series.map((s) => (
          <g key={s.key}>
            {pts.length > 1 && (
              <polyline points={line(s.key)} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
            )}
            {pts.map((p, i) => (
              <g key={i}>
                <circle cx={x(i)} cy={y(p[s.key])} r="3.5" fill="#fff" stroke={s.color} strokeWidth="2" />
                <text x={x(i)} y={y(p[s.key]) - 8} fontSize="9.5" fill={s.color} textAnchor="middle" fontWeight="600">{p[s.key]}</text>
              </g>
            ))}
          </g>
        ))}
        {pts.map((p, i) => (
          <text key={i} x={x(i)} y={mT + plotH + 16} fontSize="10" fill="#5B6B66" textAnchor="middle">{p.label}</text>
        ))}
      </svg>
      <div className="flex gap-5 mt-3.5">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
            <span className="w-3 h-1 rounded-full" style={{ background: s.color }} /> {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}
