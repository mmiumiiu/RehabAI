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

// ─── Village: watering / cheering neighbours' gardens ───────────────────────
// What THIS patient did for their neighbours, stored per account so it survives
// reloads: one watering per neighbour per day, plus the cheers put in their box.
// Neighbours themselves are mock (VILLAGE_NEIGHBORS) until there are real peers.
const VILLAGE_KEY = 'rehabai_village'

function villageKey() {
  const u = auth.current()
  return `${VILLAGE_KEY}::${u?.email || u?.uid || 'guest'}`
}

function readVillage() {
  try {
    const v = JSON.parse(localStorage.getItem(villageKey()) || '{}')
    return { waterings: v.waterings || {}, cheers: v.cheers || [] }
  } catch {
    return { waterings: {}, cheers: [] }
  }
}

function writeVillage(v) {
  localStorage.setItem(villageKey(), JSON.stringify(v))
  window.dispatchEvent(new CustomEvent('rehabai:village'))
}

export const village = {
  state: readVillage,

  // How many times this patient has watered a neighbour, and whether today.
  wateredBy(neighborId) {
    const days = readVillage().waterings[neighborId] || []
    return { count: days.length, today: days.includes(dayStr()) }
  },

  // Returns false if already watered this neighbour today.
  water(neighborId) {
    const v = readVillage()
    const days = v.waterings[neighborId] || []
    if (days.includes(dayStr())) return false
    v.waterings[neighborId] = [...days, dayStr()]
    writeVillage(v)
    return true
  },

  // Cheers sent to a neighbour, newest first.
  cheersTo(neighborId) {
    return readVillage().cheers.filter((c) => c.to === neighborId)
  },

  // Messages already sent to a neighbour today.
  sentToday(neighborId) {
    const today = dayStr()
    return new Set(readVillage().cheers.filter((c) => c.to === neighborId && c.day === today).map((c) => c.text))
  },

  // Returns false if this exact message was already sent to them today.
  cheer(neighborId, text) {
    const v = readVillage()
    const today = dayStr()
    if (v.cheers.some((c) => c.to === neighborId && c.text === text && c.day === today)) return false
    v.cheers = [{ to: neighborId, text, day: today, ts: Date.now() }, ...v.cheers].slice(0, 200)
    writeVillage(v)
    return true
  },

  // Neighbours watered today — for the "วันนี้รดน้ำให้เพื่อนแล้ว" counter.
  wateredToday() {
    const today = dayStr()
    return Object.entries(readVillage().waterings)
      .filter(([, days]) => days.includes(today))
      .map(([id]) => Number(id))
  },
}
