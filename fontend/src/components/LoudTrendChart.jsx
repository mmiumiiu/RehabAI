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

  const W = 640, H = 380, mL = 48, mT = 22, mR = 30, mB = 44
  const yTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] // finer scale
  const plotW = W - mL - mR, plotH = H - mT - mB
  const x = (i) => (pts.length === 1 ? mL + plotW / 2 : mL + (i / (pts.length - 1)) * plotW)
  const y = (v) => mT + plotH - (v / 100) * plotH
  const line = (key) => pts.map((p, i) => `${x(i)},${y(p[key])}`).join(' ')

  const series = [
    { key: 'loud', color: '#1B9C4C', label: 'ความดัง' },
    { key: 'acc', color: '#D94A1D', label: 'ความถูกต้อง' },
  ]

  return (
    <div className="card p-6">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={mL} y1={y(v)} x2={mL + plotW} y2={y(v)} stroke="#EBE8F5" strokeWidth="1" strokeDasharray={v === 0 ? '0' : '3 3'} />
            <text x={mL - 8} y={y(v) + 4} fontSize="12" fill="#9E97AF" textAnchor="end">{v}</text>
          </g>
        ))}
        {series.map((s) => (
          <g key={s.key}>
            {pts.length > 1 && (
              <polyline points={line(s.key)} fill="none" stroke={s.color} strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
            )}
            {pts.map((p, i) => {
              // Higher value → label above its point; lower → below (ties: loud above).
              const above = s.key === 'loud' ? p.loud >= p.acc : p.acc > p.loud
              return (
                <g key={i}>
                  <circle cx={x(i)} cy={y(p[s.key])} r="5.5" fill="#fff" stroke={s.color} strokeWidth="2.6" />
                  <text x={x(i)} y={y(p[s.key]) + (above ? -13 : 25)} fontSize="13" fill={s.color} textAnchor="middle" fontWeight="700">{p[s.key]}</text>
                </g>
              )
            })}
          </g>
        ))}
        {pts.map((p, i) => (
          <text key={i} x={x(i)} y={mT + plotH + 26} fontSize="13.5" fill="#69637C" textAnchor="middle">{p.label}</text>
        ))}
      </svg>
      <div className="flex gap-6 mt-4 justify-center">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-2 text-[14px] font-medium text-ink-secondary">
            <span className="w-5 h-1.5 rounded-full" style={{ background: s.color }} /> {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}
