// Stubbed service layer standing in for Firebase Auth / Firestore / SMS gateway.
// Everything is async + localStorage-backed so the UI behaves like the real thing
// and can be swapped for real Firebase later without touching components.

const LS_KEY = 'rehabai_session'
const wait = (ms = 500) => new Promise((r) => setTimeout(r, ms))

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || 'null')
  } catch {
    return null
  }
}
function writeSession(user) {
  if (user) localStorage.setItem(LS_KEY, JSON.stringify(user))
  else localStorage.removeItem(LS_KEY)
}

export const auth = {
  current: () => readSession(),

  async signIn({ email, password, role = 'patient' }) {
    await wait(600)
    if (!email || !password) throw new Error('กรุณากรอกข้อมูลให้ครบ')
    const user = {
      uid: 'demo-' + role,
      email,
      role,
      name: role === 'therapist' ? 'ก.พ. ธนกร รักษาดี' : 'สมชาย ใจดี',
      parkinsonStage: 'stage1',
      createdAt: '15 มิ.ย. 2568',
      verificationStatus: role === 'therapist' ? 'active' : undefined,
    }
    writeSession(user)
    return user
  },

  async register({ name, email, role = 'patient', parkinsonStage }) {
    await wait(700)
    const user = {
      uid: 'demo-' + role,
      email,
      role,
      name,
      parkinsonStage: parkinsonStage || 'stage1',
      createdAt: 'วันนี้',
      // therapist accounts start pending license verification (spec §4.2)
      verificationStatus: role === 'therapist' ? 'pending' : undefined,
    }
    writeSession(user)
    return user
  },

  async signOut() {
    await wait(150)
    writeSession(null)
  },

  update(patch) {
    const cur = readSession()
    if (!cur) return null
    const next = { ...cur, ...patch }
    writeSession(next)
    return next
  },
}

const LINE_USER_KEY = 'rehabai_line_user_id'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const lineNotification = {
  getUserId() {
    return localStorage.getItem(LINE_USER_KEY) || null
  },
  setUserId(userId) {
    localStorage.setItem(LINE_USER_KEY, userId)
  },
  clearUserId() {
    localStorage.removeItem(LINE_USER_KEY)
  },
  async generateLinkCode() {
    const res = await fetch(`${API_URL}/line/link-code`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to generate link code')
    return (await res.json()).code
  },
  async pollLinkCode(code) {
    const res = await fetch(`${API_URL}/line/link-code/${code}`)
    if (!res.ok) return { userId: null, expired: true }
    return res.json()
  },
  async send({ body }) {
    const userId = this.getUserId()
    if (!userId) { console.warn('[Line] no userId linked'); return { ok: false } }
    const res = await fetch(`${API_URL}/line/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, text: body }),
    })
    return res.ok ? { ok: true } : { ok: false }
  },
}

// LSVT LOUD per-patient targets set by the therapist in LoudTargetSettings.
// Stands in for a Firestore doc on the patient's record.
const LOUD_KEY = 'rehabai_loud_settings'
export const loudSettings = {
  get() {
    try { return JSON.parse(localStorage.getItem(LOUD_KEY) || 'null') } catch { return null }
  },
  save({ min, goal, max, reps }) {
    localStorage.setItem(LOUD_KEY, JSON.stringify({ min, goal, max, reps }))
  },
}

// Daily-life phrases the therapist curates for the patient (LSVT LOUD "ประโยคใน
// ชีวิตประจำวัน" group). Stored as a plain string list; the patient's training
// list/session build their word steps from this.
const PHRASES_KEY = 'rehabai_loud_phrases'
const DEFAULT_LOUD_PHRASES = [
  'สวัสดี', 'ขอโทษ', 'ขอบคุณ', 'ไม่เป็นไร', 'สบายดีไหม',
  'ไปห้องน้ำ', 'หิวข้าว', 'ช่วยพาไปที่เตียงนอนหน่อย',
  'วันนี้ต้องไปที่ไหนบ้าง', 'ขอดูเมนูหน่อย',
]
export const loudPhrases = {
  defaults: DEFAULT_LOUD_PHRASES,
  get() {
    try {
      const v = JSON.parse(localStorage.getItem(PHRASES_KEY) || 'null')
      return Array.isArray(v) ? v : DEFAULT_LOUD_PHRASES
    } catch {
      return DEFAULT_LOUD_PHRASES
    }
  },
  save(list) {
    localStorage.setItem(PHRASES_KEY, JSON.stringify(list))
    window.dispatchEvent(new CustomEvent('rehabai:loud-phrases'))
  },
}

// Recorded training sessions — the real results a patient completes in BIG/LOUD
// sessions. Stands in for a Firestore subcollection users/{uid}/sessions. Kept
// newest-first. The dashboard reads this and recomputes its summary live.
//
// Stored PER ACCOUNT: the key is namespaced by the signed-in user's email (the
// stub's per-account identifier) so each account only ever sees its own history.
const HISTORY_KEY = 'rehabai_session_history'
const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

function thaiDate(ts) {
  const d = new Date(ts)
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
}

// Key scoped to the current account. Falls back to 'guest' when signed out.
function historyKey() {
  const u = readSession()
  return `${HISTORY_KEY}::${u?.email || u?.uid || 'guest'}`
}

export const sessionHistory = {
  getAll() {
    try { return JSON.parse(localStorage.getItem(historyKey()) || '[]') } catch { return [] }
  },
  // record: { type:'big'|'loud', score:0-100|null, reps, goal, duration:'mm:ss' }
  add(record) {
    const ts = Date.now()
    const entry = {
      ...record,
      id: String(ts),
      ts,
      date: thaiDate(ts),
      score: record.score == null ? null : Math.round(record.score),
    }
    const all = [entry, ...this.getAll()].slice(0, 200)
    localStorage.setItem(historyKey(), JSON.stringify(all))
    // 'storage' only fires in OTHER tabs, so emit a same-tab event too for live
    // dashboard updates.
    window.dispatchEvent(new CustomEvent('rehabai:session-added', { detail: entry }))
    return entry
  },
  clear() {
    localStorage.removeItem(historyKey())
    window.dispatchEvent(new CustomEvent('rehabai:session-added'))
  },
}

// Therapist link (spec §3.3 / §6.1). Patients tap-select a verified therapist
// and are auto-linked immediately — there is no connection code and no pending
// approval state anymore. Stands in for users/{uid}/therapistLinks/{therapistId}.
const LINK_KEY = 'rehabai_therapist_link'

export const therapistLink = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(LINK_KEY) || 'null')
    } catch {
      return null
    }
  },
  // link = { name, pos, hospital, region }
  async set(link) {
    await wait(500)
    const record = { ...link, status: 'approved', linkedAt: new Date().toISOString() }
    localStorage.setItem(LINK_KEY, JSON.stringify(record))
    return record
  },
  async clear() {
    await wait(200)
    localStorage.removeItem(LINK_KEY)
  },
}
