import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GardenPlot from './GardenPlot.jsx'
import { Button } from './ui.jsx'
import { garden } from '../lib/garden.js'
import { exerciseProgress, gardenShare } from '../lib/services.js'
import { gardenLevelOf, nextGardenLevel, DEMO_PATIENT_ID } from '../lib/mockData.js'
import { useAuth } from '../context/AuthContext.jsx'

// Mounted once in App. Watches today's exercise progress; when a whole program
// is finished it plants today's tree (garden.markProgram) and pops up a
// "ต้นไม้ต้นใหม่งอกแล้ว" celebration on top of the session's own completion popup.
// Also publishes the garden stats for the therapist's view.
export default function GardenGrowth() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [grew, setGrew] = useState(null)

  useEffect(() => {
    if (user?.role !== 'patient') return
    const sync = () => garden.syncFromProgress(exerciseProgress.get())
    const onGrew = (e) => setGrew(e.detail)
    // Publish garden stats so the therapist sees this patient's real garden.
    const share = () => gardenShare.push(DEMO_PATIENT_ID, garden.stats())
    sync() // catch up if a program was finished before this mounted
    share()
    window.addEventListener('rehabai:progress', sync)
    window.addEventListener('rehabai:garden-grew', onGrew)
    window.addEventListener('rehabai:garden', share)
    return () => {
      window.removeEventListener('rehabai:progress', sync)
      window.removeEventListener('rehabai:garden-grew', onGrew)
      window.removeEventListener('rehabai:garden', share)
    }
  }, [user?.role, user?.email])

  if (!grew) return null

  const level = gardenLevelOf(grew.trees)
  const next = nextGardenLevel(grew.trees)
  const levelUp = level.trees === grew.trees // this tree reached a new level
  const program = grew.kind === 'loud' ? 'ฝึกเสียง' : 'ฝึกเคลื่อนไหว'

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-[420px] bg-surface rounded-card shadow-soft overflow-hidden text-center">
        <div style={{ background: 'linear-gradient(180deg, #BFE9F6 0%, #9BD67A 60%)' }}>
          <GardenPlot level={level.level} trees={grew.trees} seed={99} className="w-full h-auto" title="สวนของฉัน" />
        </div>
        <div className="p-6 flex flex-col gap-3">
          <div className="font-heading text-[24px] font-bold text-ink-primary">ต้นไม้ต้นใหม่งอกแล้ว 🌱</div>
          <p className="text-[15px] text-ink-secondary m-0 leading-[1.6]">
            {program}ครบวันนี้ สวนของคุณมีต้นไม้ <b className="text-teal-800">{grew.trees} ต้น</b>
            {grew.streak > 1 && <> · ฝึกติดต่อกัน <b className="text-teal-800">{grew.streak} วัน</b></>}
          </p>
          {levelUp && grew.trees > 1 ? (
            <div className="rounded-[14px] bg-sun-100 text-sun-text px-4 py-3 text-[15px] font-bold">
              🎉 สวนขึ้นเป็นระดับ {level.level} · {level.name}
            </div>
          ) : next ? (
            <p className="text-[14px] text-ink-muted m-0">อีก {next.trees - grew.trees} ต้น สวนจะเป็น{next.name}</p>
          ) : null}
          <div className="flex gap-3 justify-center mt-2">
            <Button variant="outline" onClick={() => setGrew(null)}>ปิด</Button>
            <Button onClick={() => { setGrew(null); navigate('/garden') }}>ไปดูสวน</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
