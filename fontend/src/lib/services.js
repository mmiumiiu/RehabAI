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

// Line OA notification stub — logs instead of hitting Line Messaging API.
// In production, replace with a backend call to POST /line/send.
const LINE_USER_KEY = 'rehabai_line_user_id'
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
  async send({ body }) {
    const userId = this.getUserId()
    if (!userId) { console.warn('[Line] no userId linked'); return { ok: false } }
    await wait(300)
    // eslint-disable-next-line no-console
    console.info(`[Line→${userId}] ${body}`)
    return { ok: true }
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
