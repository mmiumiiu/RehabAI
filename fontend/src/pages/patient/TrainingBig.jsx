import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ProgressRing } from '../../components/ui.jsx'
import { Check, Activity, AlertTriangle, ChevronRight } from '../../components/icons.jsx'
import { BIG_EXERCISES } from '../../lib/mockData.js'
import { useExerciseProgress } from '../../lib/useExerciseProgress.js'
import { useAuth } from '../../context/AuthContext.jsx'

// LSVT BIG standard set — 7 Maximal Daily Exercises, grouped by posture.
// Layout follows the "movelist" section of design/bridge-mockup.html: a summary
// ring + next-exercise button, an amber safety card, posture filter pills, then
// one large card per exercise. Mockup px ÷ 1.4 (the patient portal body zoom).

const FILTERS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'seated', label: 'ท่านั่ง' },
  { key: 'standing', label: 'ท่ายืน' },
]

const POSTURE_BADGE = {
  seated: { label: 'ท่านั่ง', background: '#E0F1FA', color: '#0B3550' },
  standing: { label: 'ท่ายืน', background: '#FFF1C7', color: '#6B4A00' },
}

// Mockup exercise card: index circle, 93px picture tile, title + badges, action.
function ExerciseCard({ ex, index, done, next, onStart }) {
  const badge = POSTURE_BADGE[ex.posture]
  return (
    <article
      className="bg-surface rounded-card shadow-card px-5 py-4 flex flex-wrap items-center gap-5"
      style={next ? { border: '3px solid #157AB5' } : { border: '1.5px solid #CDE3EE' }}
    >
      <span
        className="w-[43px] h-[43px] rounded-full flex items-center justify-center text-b-btn font-bold flex-shrink-0"
        style={next ? { background: '#157AB5', color: '#fff' } : { background: '#E6F1F7', color: '#0B2E45' }}
      >
        {index}
      </span>

      <span className="w-[93px] h-[93px] rounded-[19px] bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
        <Activity size={44} />
      </span>

      <div className="flex-1 min-w-[220px] flex flex-col gap-2.5">
        <h3 className="font-heading text-b-h3 font-bold m-0 leading-[1.25]">{ex.name}</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-b-sm font-bold px-4 py-1 rounded-pill" style={badge}>
            {badge.label}
          </span>
          {ex.highRisk && (
            <span className="inline-flex items-center gap-1.5 text-b-sm font-bold px-4 py-1 rounded-pill bg-coral-100 text-coral-700">
              <AlertTriangle size={17} /> เสี่ยงสูง
            </span>
          )}
          <span className="text-b-base">{ex.targetLabel}</span>
        </div>
        <p className="text-b-sm text-ink-secondary leading-[1.5] m-0">{ex.how}</p>
      </div>

      <div className="flex-shrink-0 flex items-center gap-3">
        {done ? (
          <>
            <span className="inline-flex items-center gap-2.5 text-b-base font-bold text-ok-fg">
              <Check size={22} /> ทำแล้ว
            </span>
            <Button variant="outline" onClick={() => onStart(ex)} className="min-h-[54px]">ทำซ้ำ</Button>
          </>
        ) : next ? (
          <Button variant="blue" onClick={() => onStart(ex)} className="min-h-[57px]">
            เริ่มท่านี้<ChevronRight size={22} />
          </Button>
        ) : (
          <Button variant="outline" onClick={() => onStart(ex)} className="min-h-[54px]">เริ่ม</Button>
        )}
      </div>
    </article>
  )
}

export default function TrainingBig() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const prog = useExerciseProgress()
  const [filter, setFilter] = useState('all')

  // Progress is over the whole set of 7, matching the home page.
  const bigDone = BIG_EXERCISES.filter((e) => prog.big.includes(e.id)).length
  const bigLeft = BIG_EXERCISES.length - bigDone

  // Next up = first exercise of the day that isn't finished yet.
  const nextEx = BIG_EXERCISES.find((e) => !prog.big.includes(e.id))

  const shown = filter === 'all' ? BIG_EXERCISES : BIG_EXERCISES.filter((e) => e.posture === filter)
  const countOf = (key) => (key === 'all' ? BIG_EXERCISES.length : BIG_EXERCISES.filter((e) => e.posture === key).length)

  function start(ex) {
    navigate(`/training/big/session?exercise=${ex.id}`)
  }

  return (
    <div className="flex flex-col gap-7">
      <header>
        <p className="text-b-label font-semibold text-ink-secondary m-0 mb-1">
          ฝึกเคลื่อนไหว · ท่ามาตรฐาน LSVT BIG
        </p>
        <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">ท่าฝึกของวันนี้</h1>
      </header>

      <div className="flex flex-wrap gap-5 items-stretch">
        {/* Summary: ring + next-exercise button */}
        <section className="flex-[2_1_420px] min-w-0 bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-wrap gap-6 items-center">
          <ProgressRing value={bigDone} goal={BIG_EXERCISES.length} label="ท่า" />
          <div className="flex-1 min-w-[220px] flex flex-col gap-4">
            <h2 className="font-heading text-b-h1 font-bold m-0 leading-[1.2] whitespace-nowrap">
              {bigLeft > 0 ? `เหลืออีก ${bigLeft} ท่า` : 'ฝึกครบแล้ว เก่งมาก'}
            </h2>
            {nextEx && (
              <Button variant="blue" onClick={() => start(nextEx)} className="min-h-[57px] self-start">
                ฝึกท่าถัดไป<ChevronRight size={22} />
              </Button>
            )}
          </div>
        </section>

        {/* Safety card */}
        <section
          className="flex-[1_1_300px] min-w-0 rounded-[20px] border-2 p-6 flex flex-col gap-3.5"
          style={{ background: '#FFF1C7', borderColor: '#E6CF86', color: '#6B4A00' }}
        >
          <h2 className="flex items-center gap-3 font-heading text-b-h3 font-bold m-0">
            <AlertTriangle size={26} /> ก่อนเริ่มฝึก
          </h2>
          <p className="text-b-label font-semibold leading-[1.5] m-0">วางเก้าอี้ที่มั่นคงไว้ข้างตัว</p>
          <p className="text-b-label font-semibold leading-[1.5] m-0">ยืนห่างกล้อง 2 เมตร ให้เห็นทั้งตัว</p>
          <p className="text-b-label font-semibold leading-[1.5] m-0">หยุดทันทีถ้าเวียนหัวหรือเจ็บ</p>
          <p className="text-b-label font-semibold leading-[1.5] m-0">ควรทำกายภาพก่อนรับประทานอาหาร</p>
          {user?.fallHistory && (
            <p className="text-b-label font-bold leading-[1.5] m-0">
              คุณมีประวัติการล้ม — ควรมีผู้ดูแลอยู่ด้วยขณะฝึก
            </p>
          )}
        </section>
      </div>

      {/* Posture filter pills */}
      <div className="flex flex-wrap gap-3">
        {FILTERS.map(({ key, label }) => {
          const on = filter === key
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(key)}
              className={`min-h-[51px] px-5 rounded-pill border-[3px] text-b-base font-bold transition-colors ${
                on ? 'bg-teal-700 border-teal-700 text-white' : 'bg-surface border-line text-ink-primary hover:bg-teal-50'
              }`}
            >
              {label} {countOf(key)} ท่า
            </button>
          )
        })}
      </div>

      {/* One big card per exercise */}
      <div className="flex flex-col gap-4">
        {shown.map((ex) => (
          <ExerciseCard
            key={ex.id}
            ex={ex}
            // Position in the training order, not `ex.id` — ids are stable keys
            // and no longer run in list order.
            index={BIG_EXERCISES.indexOf(ex) + 1}
            done={prog.big.includes(ex.id)}
            next={nextEx?.id === ex.id}
            onStart={start}
          />
        ))}
      </div>
    </div>
  )
}
