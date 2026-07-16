// Row of metric cards (spec §3.10 / §4.4)
export default function MetricRow({ items }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
      {items.map((m) => (
        <div key={m.label} className="card px-4 py-4">
          <div className="font-heading text-[22px] font-semibold text-teal-900">{m.value}</div>
          <div className="text-[12px] text-ink-secondary mt-1">{m.label}</div>
        </div>
      ))}
    </div>
  )
}
