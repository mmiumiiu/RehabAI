import { ProgressBar } from './ui.jsx'

// Right-hand info column shared by all live-session pages (spec §3.7 right column).
export default function SessionInfoCard({ name, desc, reps, target, stats, tone = 'big', onStop }) {
  return (
    <div className="card p-6 flex flex-col">
      <h2 className="font-heading text-[18px] font-semibold text-teal-900 mb-1.5">{name}</h2>
      <p className="text-[13px] text-ink-secondary leading-relaxed mb-5">{desc}</p>

      <ProgressBar value={reps} max={target} tone={tone} />
      <div className="flex justify-between text-[11.5px] text-ink-muted mt-1.5 mb-5">
        <span>ครั้งที่ {reps}</span>
        <span>เป้าหมาย {target}</span>
      </div>

      <div className="mt-auto">
        {stats.map((s) => (
          <div key={s.k} className="flex justify-between py-2.5 border-t border-line text-[13px]">
            <span className="text-ink-secondary">{s.k}</span>
            <span className="font-semibold font-mono">{s.v}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onStop}
        className="w-full mt-4 py-3 rounded-btn border border-danger text-danger font-semibold text-[13.5px] hover:bg-[#FBEAE8] transition-colors"
      >
        หยุดฝึก
      </button>
    </div>
  )
}
