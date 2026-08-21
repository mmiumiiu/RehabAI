import { useNavigate } from 'react-router-dom'
import { Badge, Button } from '../../components/ui.jsx'
import { Check, Clock } from '../../components/icons.jsx'
import PlayPhraseButton from '../../components/PlayPhraseButton.jsx'
import { BIG_EXERCISES, groupLoudSteps } from '../../lib/mockData.js'
import { useLoudSteps } from '../../lib/useLoudSteps.js'
import { useExerciseProgress } from '../../lib/useExerciseProgress.js'
import { useAuth } from '../../context/AuthContext.jsx'

// LSVT BIG standard set — 7 Maximal Daily Exercises, grouped by posture.
// Seated poses (ท่านั่ง) need a chair; they are shown with a muted "locked"
// look and are NOT counted in the daily standing progress. The color change is
// purely visual grouping — the "เริ่มฝึก" button and status badge stay active.

// muted palette for the seated ("locked") rows — mirrors .ex-row.locked in the mockup
const lockedRow = { background: '#EDEBF6', borderColor: '#DDD8EC' }
const lockedNum = { background: '#DDD8EC', borderColor: '#C9C3DC', color: '#69637C' }

function ExerciseRow({ ex, locked = false, onStart, done = false }) {
  return (
    <div className="flex flex-wrap items-center gap-3 card px-4 py-4 sm:px-5" style={locked ? lockedRow : undefined}>
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
          <h4 className="font-heading text-[22px] font-semibold" style={locked ? { color: '#69637C' } : undefined}>
            {ex.name}
          </h4>
          {ex.highRisk && <Badge tone="balance">เสี่ยงสูง</Badge>}
        </div>
        <p className={`text-[15px] leading-snug mt-0.5 ${locked ? '' : 'text-ink-secondary'}`} style={locked ? { color: '#9E97AF' } : undefined}>
          {ex.how}
        </p>
      </div>

      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
        <span className={`text-[12px] whitespace-nowrap ${locked ? '' : 'text-ink-muted'}`} style={locked ? { color: '#9E97AF' } : undefined}>
          {ex.targetLabel}
        </span>
        {done ? (
          <>
            <Badge tone="done">เสร็จแล้ว</Badge>
            <Button variant="outline" onClick={() => onStart(ex)}>ทำซ้ำ</Button>
          </>
        ) : (
          <>
            <Badge tone="todo" className="hidden sm:inline-flex">ยังไม่เริ่ม</Badge>
            <Button variant="outline" onClick={() => onStart(ex)}>เริ่มฝึก</Button>
          </>
        )}
      </div>
    </div>
  )
}

export default function TrainingBig() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const prog = useExerciseProgress()
  const seated = BIG_EXERCISES.filter((e) => e.posture === 'seated')
  const standing = BIG_EXERCISES.filter((e) => e.posture === 'standing')
  const bigDone = standing.filter((e) => prog.big.includes(e.id)).length
  const loudSteps = useLoudSteps()
  const loudDone = loudSteps.filter((s) => prog.loud.includes(s.id)).length

  function start(ex) {
    if (ex.weightShift) navigate('/training/big/session-weightshift')
    else navigate(`/training/big/session?exercise=${ex.id}`)
  }

  return (
    <div className="max-w-[820px]">
      {/* ── LSVT BIG ── */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-[16px] text-teal-700 font-semibold uppercase tracking-wide">
          ฝึกกายภาพบำบัด · ท่ามาตรฐาน LSVT BIG (7 Maximal Daily Exercises)
        </p>
        <span className="text-[12px] text-teal-700 font-semibold bg-teal-100 px-3 py-1.5 rounded-full">
          {bigDone}/{standing.length} ท่าเสร็จแล้ว
        </span>
      </div>
      <p className="text-[13.5px] text-coral-700 font-semibold mb-1">
        ข้อแนะนำ: ควรทำกายภาพก่อนรับประทานอาหาร
      </p>
      {user?.fallHistory && (
        <p className="text-[13.5px] text-coral-700 font-semibold mb-4">
          เนื่องจากคุณมีประวัติการล้ม การทำกายภาพควรมีผู้ดูแลอยู่ด้วย
        </p>
      )}
      {!user?.fallHistory && <div className="mb-4" />}
      <h1 className="font-heading text-[24px] font-semibold text-ink-primary mb-6">
        LSVT BIG — ฝึกการเคลื่อนไหว
      </h1>

      {seated.length > 0 && (
        <div className="mb-7">
          <h3 className="font-heading text-[22px] font-semibold text-ink-primary mb-4">ท่านั่ง</h3>
          <div className="space-y-3">
            {seated.map((ex) => (
              <ExerciseRow key={ex.id} ex={ex} locked onStart={start} done={prog.big.includes(ex.id)} />
            ))}
          </div>
        </div>
      )}

      <h3 className="font-heading text-[22px] font-semibold text-ink-primary mb-4">ท่ายืน</h3>
      <div className="space-y-3 mb-10">
        {standing.map((ex) => (
          <ExerciseRow key={ex.id} ex={ex} onStart={start} done={prog.big.includes(ex.id)} />
        ))}
      </div>

      {/* ── LSVT LOUD ── */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-[16px] text-coral-700 font-semibold uppercase tracking-wide">
          ฝึกเสียงพูด · LSVT LOUD
        </p>
        <span className="text-[12px] text-coral-700 font-semibold bg-coral-100 px-3 py-1.5 rounded-full">
          {loudDone}/{loudSteps.length} ขั้นตอนเสร็จแล้ว
        </span>
      </div>
      <h2 className="font-heading text-[22px] font-semibold text-ink-primary mb-5">
        LSVT LOUD — ฝึกความดังของเสียงพูด
      </h2>

      {groupLoudSteps(loudSteps).map((group) => (
        <div key={group.title} className="mb-6">
          <h3 className="font-heading text-[22px] font-semibold text-ink-primary mb-4">{group.title}</h3>
          <div className="space-y-3">
            {group.steps.map((s, i) => (
              <div key={s.id} className="flex flex-wrap items-center gap-3 card px-4 py-4 sm:px-5">
                {prog.loud.includes(s.id) ? (
                  <div className="w-[26px] h-[26px] rounded-full bg-ok-bg text-ok-fg flex items-center justify-center flex-shrink-0">
                    <Check size={15} />
                  </div>
                ) : (
                  <div className="w-[26px] h-[26px] rounded-full bg-bg border border-line flex items-center justify-center text-[12px] font-semibold text-ink-secondary flex-shrink-0">
                    {i + 1}
                  </div>
                )}
                <div className="w-11 h-11 rounded-[10px] bg-coral-100 text-coral-700 flex-shrink-0 flex items-center justify-center font-heading font-semibold text-[15px]">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading text-[18px] font-semibold">{s.name}</h4>
                  <p className="text-[15px] leading-snug mt-0.5 text-ink-secondary">{s.detail}</p>
                </div>
                <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                  <span className="flex items-center gap-1 text-[12px] text-ink-muted whitespace-nowrap">
                    <Clock size={14} /> {s.minutes} นาที
                  </span>
                  <PlayPhraseButton text={s.phrase} />
                  {prog.loud.includes(s.id) ? (
                    <>
                      <Badge tone="done">เสร็จแล้ว</Badge>
                      <Button variant="outlineCoral" onClick={() => navigate(`/training/loud/session?step=${s.id}`)}>
                        ทำซ้ำ
                      </Button>
                    </>
                  ) : (
                    <Button variant="outlineCoral" onClick={() => navigate(`/training/loud/session?step=${s.id}`)}>
                      เริ่มฝึก
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
