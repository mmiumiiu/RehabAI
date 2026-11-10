// 7-day training-time bar chart — the "เวลาฝึก 7 วันที่ผ่านมา (นาที)" card from
// the results section of design/bridge-mockup.html. One blue bar (movement) and
// one purple bar (voice) per day; days with no training read "ไม่ได้ฝึก".
// `data`: [{ day, big, loud }] where big/loud are minutes, oldest → today.

const BIG_COLOR = '#157AB5'
const LOUD_COLOR = '#6D3FC0'

function Bar({ minutes, max, color }) {
  if (!minutes) return null
  return (
    <div
      className="w-[34%] max-w-[26px] rounded-t-[7px] rounded-b-[3px]"
      style={{ height: `${Math.max(4, (minutes / max) * 100)}%`, background: color }}
      title={`${minutes} นาที`}
    />
  )
}

export default function FrequencyChart({ data = [] }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.big, d.loud]))

  return (
    <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-5">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <h2 className="font-heading text-b-h2 font-bold m-0 leading-[1.3]">เวลาฝึก 7 วันที่ผ่านมา (นาที)</h2>
        <div className="flex gap-5 text-b-base font-semibold">
          <span className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-[4px]" style={{ background: BIG_COLOR }} /> เคลื่อนไหว
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-[4px]" style={{ background: LOUD_COLOR }} /> เสียงพูด
          </span>
        </div>
      </div>

      <div className="h-[214px] flex gap-2.5">
        {data.map((d, i) => (
          <div key={`${d.day}-${i}`} className="flex-1 flex flex-col items-center gap-2.5 h-full">
            <div className="flex-1 w-full flex items-end justify-center gap-1.5">
              {d.big || d.loud ? (
                <>
                  <Bar minutes={d.big} max={max} color={BIG_COLOR} />
                  <Bar minutes={d.loud} max={max} color={LOUD_COLOR} />
                </>
              ) : (
                <span className="text-b-xs font-bold text-ink-secondary">ไม่ได้ฝึก</span>
              )}
            </div>
            <span className="text-b-base font-bold">{d.day}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
