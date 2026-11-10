// Presentation data plan for the demo account (patient@demo.com).
//
// One entry per day the patient trained, `ago` days before today. `big`/`loud`
// are minutes spent in each programme that day (0 = didn't do it), and the
// scores feed the history verdict pills. No imports, so both the service layer
// (which seeds the patient's localStorage) and mockData (which builds the
// therapist's view of สมชาย ใจดี) can read it without a circular import.
//
// Shaped so the numbers come out as:
//   · 22 distinct training days in total
//   · a 5-day streak ending today (day 5 back is a rest day)
//   · 5 of the last 7 days trained → the dashboard's 7-day chart is nearly full
//   · the last 14 days hold 11 training days of history
export const DEMO_EMAIL = 'patient@demo.com'

export const DEMO_PLAN = [
  // current streak — 5 days up to and including today
  { ago: 0, big: 20, loud: 9, bigScore: 88, loudScore: 84 },
  { ago: 1, big: 22, loud: 10, bigScore: 90, loudScore: 86 },
  { ago: 2, big: 18, loud: 0, bigScore: 85, loudScore: null },
  { ago: 3, big: 25, loud: 11, bigScore: 92, loudScore: 88 },
  { ago: 4, big: 16, loud: 8, bigScore: 84, loudScore: 80 },
  // (day 5 back: rest — this is what ends the streak at 5)
  { ago: 6, big: 19, loud: 9, bigScore: 86, loudScore: 83 },
  { ago: 7, big: 21, loud: 0, bigScore: 87, loudScore: null },
  { ago: 8, big: 17, loud: 8, bigScore: 83, loudScore: 79 },
  { ago: 9, big: 23, loud: 10, bigScore: 89, loudScore: 85 },
  { ago: 11, big: 18, loud: 7, bigScore: 85, loudScore: 81 },
  { ago: 12, big: 20, loud: 9, bigScore: 86, loudScore: 82 },
  { ago: 13, big: 15, loud: 0, bigScore: 82, loudScore: null },
  { ago: 14, big: 22, loud: 10, bigScore: 88, loudScore: 84 },
  { ago: 15, big: 19, loud: 8, bigScore: 85, loudScore: 80 },
  { ago: 17, big: 16, loud: 7, bigScore: 83, loudScore: 78 },
  { ago: 18, big: 21, loud: 9, bigScore: 87, loudScore: 82 },
  { ago: 19, big: 18, loud: 0, bigScore: 84, loudScore: null },
  { ago: 20, big: 20, loud: 8, bigScore: 86, loudScore: 81 },
  { ago: 21, big: 14, loud: 6, bigScore: 80, loudScore: 76 },
  { ago: 22, big: 17, loud: 7, bigScore: 82, loudScore: 78 },
  { ago: 24, big: 15, loud: 0, bigScore: 79, loudScore: null },
  { ago: 26, big: 13, loud: 6, bigScore: 77, loudScore: 74 },
]

// Exercises / voice steps already finished today, so the demo opens mid-day
// with "ฝึกต่อ" rather than a blank slate.
export const DEMO_TODAY_BIG = 3 // first 3 of BIG_EXERCISES
export const DEMO_TODAY_LOUD = 2 // first 2 voice steps

const DAY_MS = 86400000

// Distinct days trained — also the garden's tree count (1 day = 1 tree).
export const demoTotalDays = () => DEMO_PLAN.length

// Consecutive days ending today (or yesterday, matching trainingStreak()).
export function demoStreak() {
  const days = new Set(DEMO_PLAN.map((d) => d.ago))
  let ago = days.has(0) ? 0 : 1
  let streak = 0
  while (days.has(ago)) { streak++; ago++ }
  return streak
}

// Distinct days trained within the last 7 (today + 6 back).
export const demoWeekCount = () => DEMO_PLAN.filter((d) => d.ago <= 6).length

// Minutes per day for the last 7 days, oldest → today, for the bar charts.
export function demoWeekMinutes() {
  return Array.from({ length: 7 }, (_, i) => {
    const ago = 6 - i
    const day = DEMO_PLAN.find((d) => d.ago === ago)
    return { big: day?.big || 0, loud: day?.loud || 0 }
  })
}

// Average of every recorded score, for the therapist's "ท่าถูกต้องเฉลี่ย".
export function demoAvgScore() {
  const all = DEMO_PLAN.flatMap((d) => [d.bigScore, d.loudScore]).filter((n) => n != null)
  return Math.round(all.reduce((a, b) => a + b, 0) / all.length)
}

// Most recent score, for the therapist list's "คะแนนล่าสุด".
export const demoLastScore = () => DEMO_PLAN[0].bigScore

// Absolute timestamp for a plan row, at a plausible morning hour.
export function demoTimestamp(ago, hour = 8, minute = 40) {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d.getTime() - ago * DAY_MS
}
