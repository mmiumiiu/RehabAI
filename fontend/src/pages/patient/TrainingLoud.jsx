import { useNavigate } from 'react-router-dom'
import { Button, ProgressRing } from '../../components/ui.jsx'
import { Check, Mic, AlertTriangle, ChevronRight } from '../../components/icons.jsx'
import PlayPhraseButton from '../../components/PlayPhraseButton.jsx'
import { useLoudSteps } from '../../lib/useLoudSteps.js'
import { useExerciseProgress } from '../../lib/useExerciseProgress.js'

// Layout follows the "voicelist" section of design/bridge-mockup.html: summary
// ring + next-step button, an amber room-setup card, then one large card per
// step. Purple (#6D3FC0) is the voice-training accent. Mockup px ÷ 1.4.

const ACCENT = '#6D3FC0'

function StepCard({ step, index, done, next, onStart }) {
  return (
    <article
      className="bg-surface rounded-card shadow-card px-5 py-5 flex flex-wrap items-center gap-5"
      style={next ? { border: `3px solid ${ACCENT}` } : { border: '1.5px solid #CDE3EE' }}
    >
      <span
        className="w-[43px] h-[43px] rounded-full flex items-center justify-center text-b-btn font-bold flex-shrink-0"
        style={next ? { background: ACCENT, color: '#fff' } : { background: '#E6F1F7', color: '#0B2E45' }}
      >
        {index}
      </span>

      <span
        className="w-[69px] h-[69px] rounded-[17px] flex items-center justify-center flex-shrink-0"
        style={{ background: '#EEE8FA', color: ACCENT }}
      >
        <Mic size={34} />
      </span>

      <div className="flex-1 min-w-[220px] flex flex-col gap-1.5">
        <h3 className="font-heading text-b-h3 font-bold m-0 leading-[1.25]">{step.name}</h3>
        <span className="text-b-base leading-[1.5]">{step.detail} · {step.minutes} นาที</span>
      </div>

      <div className="flex-shrink-0 flex items-center gap-3">
        <PlayPhraseButton text={step.phrase} />
        {done ? (
          <>
            <span className="inline-flex items-center gap-2.5 text-b-base font-bold text-ok-fg">
              <Check size={22} /> ทำแล้ว
            </span>
            <Button variant="outline" onClick={() => onStart(step)} className="min-h-[54px]">ทำซ้ำ</Button>
          </>
        ) : next ? (
          <Button
            as="button"
            onClick={() => onStart(step)}
            className="min-h-[57px]"
            style={{ background: ACCENT, borderColor: ACCENT }}
          >
            เริ่มขั้นนี้<ChevronRight size={22} />
          </Button>
        ) : (
          <Button variant="outline" onClick={() => onStart(step)} className="min-h-[54px]">เริ่ม</Button>
        )}
      </div>
    </article>
  )
}

export default function TrainingLoud() {
  const navigate = useNavigate()
  const steps = useLoudSteps()
  const prog = useExerciseProgress()

  const done = steps.filter((s) => prog.loud.includes(s.id)).length
  const left = steps.length - done
  const nextStep = steps.find((s) => !prog.loud.includes(s.id))
  const start = (s) => navigate(`/training/loud/session?step=${s.id}`)

  return (
    <div className="flex flex-col gap-7">
      <header>
        <p className="text-b-label font-semibold text-ink-secondary m-0 mb-1">
          ฝึกเสียงพูด · {steps.length} ขั้นตอน
        </p>
        <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">ฝึกเสียงพูดวันนี้</h1>
      </header>

      <div className="flex flex-wrap gap-5 items-stretch">
        <section className="flex-[2_1_420px] min-w-0 bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-wrap gap-6 items-center">
          <ProgressRing value={done} goal={steps.length} label="ขั้นตอน" color={ACCENT} />
          <div className="flex-1 min-w-[220px] flex flex-col gap-4">
            <h2 className="font-heading text-b-h1 font-bold m-0 leading-[1.2] whitespace-nowrap">
              {left > 0 ? `เหลืออีก ${left} ขั้นตอน` : 'ฝึกครบแล้ว เก่งมาก'}
            </h2>
            {nextStep && (
              <Button
                as="button"
                onClick={() => start(nextStep)}
                className="min-h-[57px] self-start"
                style={{ background: ACCENT, borderColor: ACCENT }}
              >
                ฝึกขั้นถัดไป<ChevronRight size={22} />
              </Button>
            )}
          </div>
        </section>

        <section
          className="flex-[1_1_300px] min-w-0 rounded-[20px] border-2 p-6 flex flex-col gap-3.5"
          style={{ background: '#FFF1C7', borderColor: '#E6CF86', color: '#6B4A00' }}
        >
          <h2 className="flex items-center gap-3 font-heading text-b-h3 font-bold m-0">
            <AlertTriangle size={26} /> ก่อนเริ่มฝึก
          </h2>
          <p className="text-b-label font-semibold leading-[1.6] m-0">
            นั่งในห้องที่เงียบ ปิดทีวีหรือเพลง และวางเครื่องห่างปากประมาณ 1 ศอก
          </p>
        </section>
      </div>

      <div className="flex flex-col gap-4">
        {steps.map((s, i) => (
          <StepCard
            key={s.id}
            step={s}
            index={i + 1}
            done={prog.loud.includes(s.id)}
            next={nextStep?.id === s.id}
            onStart={start}
          />
        ))}
      </div>
    </div>
  )
}
