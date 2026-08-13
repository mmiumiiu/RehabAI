import { useEffect, useState } from 'react'
import { sessionHistory } from './services.js'

// Live view of the patient's recorded sessions. Re-reads whenever a session is
// saved — in this tab (custom event fired by sessionHistory.add), in another tab
// (storage event), or when the tab regains focus. This is what lets the
// dashboard / home summary update in real time.
export function useSessionHistory() {
  const [rows, setRows] = useState(() => sessionHistory.getAll())
  useEffect(() => {
    const refresh = () => setRows(sessionHistory.getAll())
    window.addEventListener('rehabai:session-added', refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener('rehabai:session-added', refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])
  return rows
}

const DAY_MS = 86400000

export function startOfDay(ts) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

// Consecutive days (ending today, with a one-day grace) that have ≥1 session.
export function trainingStreak(rows) {
  const days = new Set(rows.map((r) => startOfDay(r.ts)))
  let cursor = startOfDay(Date.now())
  if (!days.has(cursor)) cursor -= DAY_MS // haven't trained today yet — count up to yesterday
  let streak = 0
  while (days.has(cursor)) {
    streak++
    cursor -= DAY_MS
  }
  return streak
}
