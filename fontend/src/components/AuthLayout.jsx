// Split-screen auth shell — matches the "login"/"register" sections of
// design/bridge-mockup.html: a sky-blue gradient hero on the left (BRIDGE mark,
// big headline, tagline) and the form in a single plain column on the right,
// topped by the "ขนาดตัวอักษร" (text size) control.
//
// Sizes are the mockup px ÷ 1.4, because App.jsx applies a body zoom of 1.4 to
// the patient portal — so what renders matches the mockup.
import { useEffect, useState } from 'react'
import { Logo } from './ui.jsx'

const FONT_STEPS = [1, 1.12, 1.25]
const STORE_KEY = 'bridge.authFontStep'

function TextSizeControl({ step, onChange }) {
  return (
    <div
      role="group"
      aria-label="ขนาดตัวอักษร"
      className="flex items-center gap-2.5 pl-5 pr-2 py-2 rounded-[24px] bg-surface border-2 border-line"
    >
      <span className="text-b-sm font-semibold">ขนาดตัวอักษร</span>
      <button
        type="button"
        onClick={() => onChange(step - 1)}
        disabled={step === 0}
        aria-label="ลดขนาดตัวอักษร"
        className="w-[52px] h-[52px] rounded-[18px] border-2 border-line bg-surface text-ink-primary text-b-sm font-bold disabled:opacity-40"
      >
        ก
      </button>
      <button
        type="button"
        onClick={() => onChange(step + 1)}
        disabled={step === FONT_STEPS.length - 1}
        aria-label="เพิ่มขนาดตัวอักษร"
        className="w-[52px] h-[52px] rounded-[18px] border-2 border-line bg-surface text-ink-primary text-b-h3 font-bold disabled:opacity-40"
      >
        ก
      </button>
    </div>
  )
}

export default function AuthLayout({ children, therapist = false, hero = true, cardWidth = 486 }) {
  const [step, setStep] = useState(() => {
    const n = Number(localStorage.getItem(STORE_KEY))
    return Number.isInteger(n) && n >= 0 && n < FONT_STEPS.length ? n : 0
  })

  useEffect(() => {
    localStorage.setItem(STORE_KEY, String(step))
  }, [step])

  const clamp = (n) => Math.max(0, Math.min(FONT_STEPS.length - 1, n))

  return (
    <div className="min-h-screen flex flex-wrap bg-bg font-body font-medium text-ink-primary">
      {/* Left · sky-blue hero */}
      {hero && (
        <aside
          className="hidden md:flex flex-col justify-between gap-10 relative overflow-hidden flex-[1_1_330px] p-10"
          style={{ background: 'linear-gradient(110deg, #CCE6F1 0%, #B4DCEC 40%, #92D0E5 72%, #87CBE8 100%)' }}
        >
          <Logo size={43} />

          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-b-hero font-bold leading-[1.3] m-0">
              {therapist ? (
                <>ดูแลผู้ป่วย<br />ของคุณ<br />ได้ทุกที่</>
              ) : (
                <>ฟื้นฟูร่างกาย<br />และเสียงพูด<br />ที่บ้านของคุณ</>
              )}
            </h2>
            <p className="text-b-base font-semibold leading-[1.7] m-0" style={{ color: '#133E59' }}>
              {therapist
                ? 'ติดตามความคืบหน้าของผู้ป่วยพาร์กินสัน สั่งการบ้าน และพูดคุยกันได้ในที่เดียว'
                : 'กล้องช่วยดูท่าทาง ไมโครโฟนช่วยฟังเสียง และนักกายภาพของคุณเห็นความคืบหน้าทุกครั้งที่ฝึก'}
            </p>
          </div>

          <p className="text-b-sm font-semibold m-0" style={{ color: '#133E59' }}>
            ฝึกกายภาพและฝึกเสียงพูดที่บ้าน โดยมีนักกายภาพดูแล
          </p>
        </aside>
      )}

      {/* Right · form column */}
      <main className="flex-[1.3_1_457px] flex flex-col items-center gap-7 px-6 py-8 md:px-10 md:py-9">
        <div className="self-stretch flex justify-end">
          <TextSizeControl step={step} onChange={(n) => setStep(clamp(n))} />
        </div>
        <div
          className="w-full flex flex-col gap-7"
          style={{ maxWidth: cardWidth, zoom: FONT_STEPS[step] }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
