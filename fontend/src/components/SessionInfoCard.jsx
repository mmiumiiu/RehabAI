import { ProgressBar } from './ui.jsx'

// Right-hand info column shared by the live-session pages (spec §3.7 right
// column). Large type throughout (nothing under 20px) and a 64px-tall stop
// button, since this is used mid-exercise at arm's length.
export default function SessionInfoCard({ name, desc, reps, target, stats, tone = 'big', onStop }) {
  return (
    <div className="card p-6 flex flex-col">
      <h2 className="font-heading text-[26px] font-bold text-ink-primary mb-2">{name}</h2>
      <p className="text-[20px] text-ink-secondary leading-relaxed mb-5">{desc}</p>

      {/* Big rep counter — readable from across the room */}
      <div className="text-center mb-3">
        <div className="font-heading font-bold leading-none text-ink-primary" style={{ fontSize: 88 }}>
          {reps}
          <span className="text-ink-muted font-normal" style={{ fontSize: 34 }}>/{target}</span>
        </div>
        <div className="text-[20px] text-ink-secondary mt-1">ครั้ง</div>
      </div>

      <ProgressBar value={reps} max={target} tone={tone} />
      <div className="flex justify-between text-[20px] text-ink-secondary mt-2 mb-5">
        <span>ทำแล้ว {reps}</span>
        <span>เป้าหมาย {target}</span>
      </div>

      <div className="mt-auto">
        {stats.map((s) => (
          <div key={s.k} className="flex justify-between gap-3 py-3 border-t border-line text-[20px]">
            <span className="text-ink-secondary">{s.k}</span>
            <span className="font-bold font-mono">{s.v}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onStop}
        className="w-full mt-5 min-h-[64px] px-6 rounded-btn border-[3px] border-danger text-danger font-bold text-[22px] hover:bg-coral-100 transition-colors"
      >
        หยุดฝึก
      </button>
    </div>
  )
}
