import { useNavigate } from 'react-router-dom'
import { Badge, Button } from '../../components/ui.jsx'
import { Check, Clock } from '../../components/icons.jsx'
import { LOUD_STEPS } from '../../lib/mockData.js'

export default function TrainingLoud() {
  const navigate = useNavigate()
  const done = LOUD_STEPS.filter((s) => s.status === 'done').length

  return (
    <div className="max-w-[820px]">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[13px] text-coral-700 font-semibold uppercase tracking-wide">ฝึกกายภาพบำบัด</p>
        <span className="text-[12px] text-coral-700 font-semibold bg-coral-100 px-3 py-1.5 rounded-full">
          {done}/{LOUD_STEPS.length} ขั้นตอนเสร็จแล้ว
        </span>
      </div>
      <h1 className="font-heading text-[24px] font-semibold text-teal-900 mb-6">
        LSVT LOUD — ฝึกความดังของเสียงพูด
      </h1>

      <div className="space-y-3">
        {LOUD_STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-4 card px-5 py-4">
            {s.status === 'done' ? (
              <div className="w-[26px] h-[26px] rounded-full bg-ok-bg text-ok-fg flex items-center justify-center flex-shrink-0">
                <Check size={15} />
              </div>
            ) : (
              <div className="w-[26px] h-[26px] rounded-full bg-bg border border-line flex items-center justify-center text-[12px] font-semibold text-ink-secondary flex-shrink-0">
                {i + 1}
              </div>
            )}
            <div className="w-12 h-12 rounded-[10px] bg-coral-100 text-coral-700 flex-shrink-0 flex items-center justify-center font-heading font-semibold">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-heading text-[14.5px] font-semibold">{s.name}</h4>
              <p className="text-[12.5px] text-ink-secondary truncate">{s.detail}</p>
            </div>
            <span className="flex items-center gap-1 text-[12px] text-ink-muted whitespace-nowrap mr-1">
              <Clock size={14} /> {s.minutes} นาที
            </span>
            {s.status === 'done' ? (
              <Badge tone="done">เสร็จแล้ว</Badge>
            ) : (
              <Button variant="outlineCoral" onClick={() => navigate(`/training/loud/session?step=${s.id}`)}>
                เริ่มฝึก
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
