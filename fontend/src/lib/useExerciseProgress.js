import { useEffect, useState } from 'react'
import { exerciseProgress } from './services.js'

// Live view of today's completed exercises for this account. Re-reads whenever an
// exercise is marked done (this tab, another tab, or on focus) so the "เหลืออีก
// กี่ท่า" counters and "เสร็จแล้ว" badges update in real time.
export function useExerciseProgress() {
  const [progress, setProgress] = useState(() => exerciseProgress.get())
  useEffect(() => {
    const refresh = () => setProgress(exerciseProgress.get())
    window.addEventListener('rehabai:progress', refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener('rehabai:progress', refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])
  return progress
}
