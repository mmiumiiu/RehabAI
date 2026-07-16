import { useNavigate } from 'react-router-dom'
import { Badge, Button, SectionTitle } from '../../components/ui.jsx'
import { Check } from '../../components/icons.jsx'
import { BIG_EXERCISES } from '../../lib/mockData.js'

// LSVT BIG standard set — 7 Maximal Daily Exercises, grouped by posture.
// Seated poses (ท่านั่ง) need a chair; they are shown with a muted "locked"
// look and are NOT counted in the daily standing progress. The color change is
// purely visual grouping — the "เริ่มฝึก" button and status badge stay active.

// muted palette for the seated ("locked") rows — mirrors .ex-row.locked in the mockup
const lockedRow = { background: '#EAE6D9', borderColor: '#D8D0BC' }
const lockedNum = { background: '#D8D0BC', borderColor: '#C7BDA3', color: '#6B6350' }

function ExerciseRow({ ex, locked = false, onStart }) {
  const done = ex.status === 'done'
  return (
    <div className="flex items-center gap-4 card px-5 py-4" style={locked ? lockedRow : undefined}>
      {done ? (
        <div className="w-[26px] h-[26px] rounded-full bg-ok-bg text-ok-fg flex items-center justify-center flex-shrink-0">
          <Check size={15} />
        </div>
      ) : (
        <div
          className="w-[26px] h-[26px] rounded-full border flex items-center justify-center text-[12px] font-semibold flex-shrink-0 bg-bg border-line text-ink-secondary"
          style={locked ? lockedNum : undefined}
        >
          {ex.id}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-heading text-[14.5px] font-semibold" style={locked ? { color: '#6B6350' } : undefined}>
            {ex.name}
          </h4>
          {ex.highRisk && <Badge tone="balance">เสี่ยงสูง</Badge>}
        </div>
        <p className={`text-[12.5px] truncate ${locked ? '' : 'text-ink-secondary'}`} style={locked ? { color: '#8C8368' } : undefined}>
          {ex.how}
        </p>
      </div>

      <span className={`text-[12px] whitespace-nowrap mr-1 ${locked ? '' : 'text-ink-muted'}`} style={locked ? { color: '#8C8368' } : undefined}>
        {ex.targetLabel}
      </span>
      {done ? (
        <Badge tone="done">เสร็จแล้ว</Badge>
      ) : (
        <>
          <Badge tone="todo">ยังไม่เริ่ม</Badge>
          <Button variant="outline" className="ml-3" onClick={() => onStart(ex)}>เริ่มฝึก</Button>
        </>
      )}
    </div>
  )
}

export default function TrainingBig() {
  const navigate = useNavigate()

  const seated = BIG_EXERCISES.filter((e) => e.posture === 'seated')
  const standing = BIG_EXERCISES.filter((e) => e.posture === 'standing')
  // progress counts standing poses only (seated ท่านั่ง are grouped separately)
  const done = standing.filter((e) => e.status === 'done').length

  function start(ex) {
    if (ex.weightShift) navigate('/training/big/session-weightshift')
    else navigate(`/training/big/session?exercise=${ex.id}`)
  }

  return (
    <div className="max-w-[820px]">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[13px] text-teal-700 font-semibold uppercase tracking-wide">
          ฝึกกายภาพบำบัด · ท่ามาตรฐาน LSVT BIG (7 Maximal Daily Exercises)
        </p>
        <span className="text-[12px] text-teal-700 font-semibold bg-teal-100 px-3 py-1.5 rounded-full">
          {done}/{standing.length} ท่าเสร็จแล้ว
        </span>
      </div>
      <h1 className="font-heading text-[24px] font-semibold text-teal-900 mb-6">
        LSVT BIG — ฝึกการเคลื่อนไหว
      </h1>

      {seated.length > 0 && (
        <div className="mb-7">
          <SectionTitle>ท่านั่ง</SectionTitle>
          <div className="space-y-3">
            {seated.map((ex) => (
              <ExerciseRow key={ex.id} ex={ex} locked onStart={start} />
            ))}
          </div>
        </div>
      )}

      <SectionTitle>ท่ายืน</SectionTitle>
      <div className="space-y-3">
        {standing.map((ex) => (
          <ExerciseRow key={ex.id} ex={ex} onStart={start} />
        ))}
      </div>
    </div>
  )
}
