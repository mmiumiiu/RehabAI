import { useEffect, useState } from 'react'
import { cheers, gardenShare } from './services.js'

// Live cheers for a patient: fetch on mount, poll, and re-read on local
// changes / other tabs / focus — same approach as useLoudSteps.
export function useCheers(patientId) {
  const [list, setList] = useState(() => cheers.get(patientId))
  useEffect(() => {
    let alive = true
    const refresh = () => { if (alive) setList(cheers.get(patientId)) }
    refresh()
    cheers.pull(patientId).then(refresh)
    const poll = setInterval(() => cheers.pull(patientId).then(refresh), 8000)
    window.addEventListener('rehabai:cheers', refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      alive = false
      clearInterval(poll)
      window.removeEventListener('rehabai:cheers', refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [patientId])
  return list
}

// Therapist side: a patient's garden stats as last published by their app.
export function useSharedGarden(patientId) {
  const [stats, setStats] = useState(() => gardenShare.get(patientId))
  useEffect(() => {
    let alive = true
    const refresh = () => { if (alive) setStats(gardenShare.get(patientId)) }
    refresh()
    gardenShare.pull(patientId).then(refresh)
    const poll = setInterval(() => gardenShare.pull(patientId).then(refresh), 8000)
    window.addEventListener('rehabai:garden-share', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      alive = false
      clearInterval(poll)
      window.removeEventListener('rehabai:garden-share', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [patientId])
  return stats
}

// "2 ชม. ที่แล้ว"-style label for a timestamp.
export function timeAgo(ts) {
  const s = Math.max(0, (Date.now() - ts) / 1000)
  if (s < 60) return 'เมื่อสักครู่'
  if (s < 3600) return `${Math.floor(s / 60)} นาทีที่แล้ว`
  if (s < 86400) return `${Math.floor(s / 3600)} ชม. ที่แล้ว`
  return `${Math.floor(s / 86400)} วันก่อน`
}
