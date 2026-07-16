import { WEEK_FREQUENCY } from '../lib/mockData.js'

// 7-day BIG vs LOUD frequency bar chart (spec §3.10 / §4.4)
export default function FrequencyChart({ data = WEEK_FREQUENCY }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.big, d.loud]))
  return (
    <div className="card p-6">
      <p className="text-[13px] font-semibold text-ink-secondary mb-5">ความถี่การฝึกย้อนหลัง 7 วัน</p>
      <div className="flex items-end gap-6 h-[140px]">
        {data.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <div className="flex gap-[5px] items-end h-full">
              <div className="w-4 rounded-t bg-teal-500" style={{ height: `${(d.big / max) * 100}%` }} title={`BIG ${d.big}`} />
              <div className="w-4 rounded-t bg-coral-700" style={{ height: `${(d.loud / max) * 100}%` }} title={`LOUD ${d.loud}`} />
            </div>
            <span className="text-[11px] text-ink-muted">{d.day}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-5 mt-4">
        <span className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
          <span className="w-2 h-2 rounded-full bg-teal-500" /> LSVT BIG
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
          <span className="w-2 h-2 rounded-full bg-coral-700" /> LSVT LOUD
        </span>
      </div>
    </div>
  )
}
