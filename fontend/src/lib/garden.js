// Garden progress built from real training. One training day = one tree.
//
// A day counts once the patient finishes a whole program that day — every LSVT
// BIG exercise, or every LSVT LOUD step (see GARDEN_RULES in mockData.js). The
// day log is stored per account in localStorage, like sessionHistory, so it can
// be swapped for a Firestore collection later without touching the pages.
import { auth } from './services.js'
import { BIG_EXERCISES, getLoudSteps } from './mockData.js'

const DAYS_KEY = 'rehabai_garden_days'
const DAY_MS = 24 * 60 * 60 * 1000

function daysKey() {
  const u = auth.current()
  return `${DAYS_KEY}::${u?.email || u?.uid || 'guest'}`
}

// Local-time YYYY-MM-DD (not toISOString, which would shift days in UTC+7).
function dayStr(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function daysAgo(n) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  return dayStr(new Date(d.getTime() - n * DAY_MS))
}

function read() {
  try { return JSON.parse(localStorage.getItem(daysKey()) || '{}') } catch { return {} }
}

function write(days) {
  localStorage.setItem(daysKey(), JSON.stringify(days))
  window.dispatchEvent(new CustomEvent('rehabai:garden'))
}

export const garden = {
  // { 'YYYY-MM-DD': { big: bool, loud: bool } }
  days: read,

  // Record that a whole program was finished today. Returns true when this is
  // the first program of the day — i.e. a new tree was just planted.
  markProgram(kind) {
    const days = read()
    const today = dayStr()
    const isNewDay = !days[today]
    if (days[today]?.[kind]) return false
    days[today] = { ...(days[today] || {}), [kind]: true }
    write(days)
    if (isNewDay) {
      window.dispatchEvent(new CustomEvent('rehabai:garden-grew', { detail: { kind, ...this.stats() } }))
    }
    return isNewDay
  },

  // Called whenever today's exercise progress changes: plants a tree once a
  // whole program is complete.
  syncFromProgress(progress) {
    if (BIG_EXERCISES.every((e) => progress.big.includes(e.id))) this.markProgram('big')
    const loud = getLoudSteps()
    if (loud.length && loud.every((s) => progress.loud.includes(s.id))) this.markProgram('loud')
  },

  stats() {
    const days = read()
    const trees = Object.keys(days).length

    // Streak: consecutive training days ending today — or yesterday, so the
    // streak isn't shown as broken in the morning before today's session.
    let start = days[daysAgo(0)] ? 0 : 1
    let streak = 0
    while (days[daysAgo(start + streak)]) streak++

    let week = 0
    for (let i = 0; i < 7; i++) if (days[daysAgo(i)]) week++

    return { trees, streak, totalDays: trees, week, todayDone: !!days[daysAgo(0)] }
  },

  // Demo history for presentations: 22 training days over the last ~6 weeks,
  // ending YESTERDAY with a 5-day streak — so finishing a program live on stage
  // plants tree #23 and the celebration pops up.
  seedDemo() {
    const pattern = [1, 2, 3, 4, 5, 8, 9, 11, 12, 13, 15, 16, 18, 19, 22, 23, 25, 27, 29, 32, 35, 38]
    const days = {}
    pattern.forEach((ago, i) => {
      days[daysAgo(ago)] = { big: true, loud: i % 3 !== 2 }
    })
    write(days)
  },

  clear() {
    localStorage.removeItem(daysKey())
    window.dispatchEvent(new CustomEvent('rehabai:garden'))
  },
}
