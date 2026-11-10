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
      name: role === 'therapist' ? 'กภ. ธนกร รักษาดี' : 'สมชาย ใจดี',
      parkinsonStage: 'stage1',
      createdAt: '15 มิ.ย. 2568',
      verificationStatus: role === 'therapist' ? 'active' : undefined,
    }
    writeSession(user)
    return user
  },

  async register({ name, email, phone, role = 'patient', parkinsonStage, fallHistory }) {
    await wait(700)
    const user = {
      uid: 'demo-' + role,
      email,
      phone,
      role,
      name,
      parkinsonStage: parkinsonStage || 'stage1',
      fallHistory: !!fallHistory,
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
  // Synchronous read from the local cache (used to build steps during render).
  get() {
    try {
      const v = JSON.parse(localStorage.getItem(PHRASES_KEY) || 'null')
      return Array.isArray(v) ? v : DEFAULT_LOUD_PHRASES
    } catch {
      return DEFAULT_LOUD_PHRASES
    }
  },
  // Update the cache and notify listeners — only when the list actually changed,
  // so polling doesn't cause needless re-renders.
  _cache(list) {
    const next = JSON.stringify(list)
    if (localStorage.getItem(PHRASES_KEY) === next) return
    localStorage.setItem(PHRASES_KEY, next)
    window.dispatchEvent(new CustomEvent('rehabai:loud-phrases'))
  },
  // Patient side: pull the therapist's current list from the backend.
  async pull() {
    try {
      const res = await fetch(`${API_URL}/loud-phrases`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.phrases)) { this._cache(data.phrases); return data.phrases }
      }
    } catch { /* offline — keep cached */ }
    return this.get()
  },
  // Therapist side: push the list to the backend (and cache locally).
  async save(list) {
    this._cache(list)
    try {
      await fetch(`${API_URL}/loud-phrases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrases: list }),
      })
    } catch { /* offline — cached locally, will re-sync on next save */ }
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

// Today's completed exercises per account — which BIG exercises / LOUD steps the
// patient has finished today. Drives the "เหลืออีกกี่ท่า" counters and "เสร็จแล้ว"
// badges, live. Resets each day.
const PROGRESS_KEY = 'rehabai_progress'
function progressKey() {
  const u = readSession()
  return `${PROGRESS_KEY}::${u?.email || u?.uid || 'guest'}`
}
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
export const exerciseProgress = {
  get() {
    try {
      const v = JSON.parse(localStorage.getItem(progressKey()) || 'null')
      if (v && v.date === todayStr()) return { date: v.date, big: v.big || [], loud: v.loud || [] }
    } catch { /* ignore */ }
    return { date: todayStr(), big: [], loud: [] }
  },
  // kind: 'big' | 'loud'
  mark(kind, id) {
    const p = this.get()
    if (!p[kind].includes(id)) {
      p[kind] = [...p[kind], id]
      localStorage.setItem(progressKey(), JSON.stringify(p))
      window.dispatchEvent(new CustomEvent('rehabai:progress'))
    }
  },
}

// LSVT LOUD per-session results (loudness % + word/hold %) per account, so the
// patient can be told whether they did better than last time. Newest-first.
const LOUD_RESULTS_KEY = 'rehabai_loud_results'
function loudResultsKey() {
  const u = readSession()
  return `${LOUD_RESULTS_KEY}::${u?.email || u?.uid || 'guest'}`
}
export const loudResults = {
  getAll() {
    try { return JSON.parse(localStorage.getItem(loudResultsKey()) || '[]') } catch { return [] }
  },
  // Most recent prior result for the same step (for the "better than last time?" compare).
  latestFor(stepId) {
    return this.getAll().find((r) => r.stepId === stepId) || null
  },
  // rec: { stepId, stepName, loud, word|null, hold|null }
  add(rec) {
    const ts = Date.now()
    const entry = { ...rec, id: String(ts), ts, date: thaiDate(ts) }
    const all = [entry, ...this.getAll()].slice(0, 200)
    localStorage.setItem(loudResultsKey(), JSON.stringify(all))
    window.dispatchEvent(new CustomEvent('rehabai:loud-results'))
    return entry
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

// ─── Community feed ─────────────────────────────────────────────────────────
// Peer-support feed: the patient's own posts, comments, and per-viewer state
// (cheers / saves / "ไปด้วย" / follows). Stands in for Firestore collections
// `posts`, `posts/{id}/comments` and `users/{uid}/reactions`.
//
// The seeded posts in mockData are read-only demo content; everything the user
// does is stored here and merged on top when reading. Swapping in Firebase means
// replacing this object only — components call nothing else.
//
// Stored PER ACCOUNT, like sessionHistory, so each account sees its own state.
const COMMUNITY_KEY = 'rehabai_community'

function communityKey() {
  const u = readSession()
  return `${COMMUNITY_KEY}::${u?.email || u?.uid || 'guest'}`
}

const EMPTY_STATE = {
  posts: [],        // posts this user wrote, newest first
  comments: {},     // postId -> [comment]
  cheers: {},       // postId -> true
  commentCheers: {}, // commentId -> true
  saves: {},        // postId -> true
  going: {},        // postId -> true
  follows: {},      // author name -> true
}

function readCommunity() {
  try {
    return { ...EMPTY_STATE, ...JSON.parse(localStorage.getItem(communityKey()) || '{}') }
  } catch {
    return { ...EMPTY_STATE }
  }
}

function writeCommunity(state) {
  try {
    localStorage.setItem(communityKey(), JSON.stringify(state))
  } catch {
    // localStorage is a few MB; post images are the only thing big enough to
    // fill it. Surface a message the composer can show instead of failing mute.
    throw new Error('พื้นที่เก็บข้อมูลเต็ม — ลองลบรูปออกบางรูป หรือลบโพสต์เก่า')
  }
  // 'storage' only fires in OTHER tabs, so emit a same-tab event too.
  window.dispatchEvent(new CustomEvent('rehabai:community'))
}

// Pull "#คำ" out of post text. Thai has no word spacing, so a tag runs until
// whitespace or punctuation.
function extractTags(text) {
  const found = String(text).match(/#[^\s#.,!?()[\]{}"'“”‘’]+/g) || []
  return [...new Set(found)]
}

export const community = {
  // Raw per-viewer state — components read reaction flags straight off this.
  state() {
    return readCommunity()
  },

  // Author identity for new posts/comments, taken from the signed-in account.
  me() {
    const u = readSession()
    return { name: u?.name || 'ผู้ใช้งาน' }
  },

  // post = { text, topic, images:[dataUrl] }
  // Any #hashtag the user types becomes a tag, so their post shows up under the
  // matching hashtag filter.
  async addPost({ text, topic, images = [] }) {
    await wait(300)
    const body = String(text || '').trim()
    if (!body) throw new Error('กรุณาเขียนข้อความก่อนโพสต์')
    const ts = Date.now()
    const post = {
      id: `u${ts}`,
      own: true,
      author: this.me().name,
      when: 'เมื่อสักครู่',
      ts,
      topic,
      body,
      images,
      tags: extractTags(body),
      cheers: 0,
      shares: 0,
    }
    const s = readCommunity()
    s.posts = [post, ...s.posts]
    writeCommunity(s)
    return post
  },

  async deletePost(postId) {
    await wait(200)
    const s = readCommunity()
    s.posts = s.posts.filter((p) => p.id !== postId)
    delete s.comments[postId]
    delete s.cheers[postId]
    delete s.saves[postId]
    writeCommunity(s)
  },

  // comment = { text } on any post (seeded or own)
  async addComment(postId, text) {
    await wait(250)
    const body = String(text || '').trim()
    if (!body) throw new Error('กรุณาเขียนความคิดเห็นก่อนส่ง')
    const ts = Date.now()
    const comment = {
      id: `c${ts}`,
      own: true,
      author: this.me().name,
      when: 'เมื่อสักครู่',
      ts,
      body,
      cheers: 0,
    }
    const s = readCommunity()
    s.comments[postId] = [...(s.comments[postId] || []), comment]
    writeCommunity(s)
    return comment
  },

  async deleteComment(postId, commentId) {
    await wait(200)
    const s = readCommunity()
    s.comments[postId] = (s.comments[postId] || []).filter((c) => c.id !== commentId)
    writeCommunity(s)
  },

  // Toggles below are the per-viewer reactions. Each returns the new flag.
  _toggle(bucket, key) {
    const s = readCommunity()
    const on = !s[bucket][key]
    if (on) s[bucket][key] = true
    else delete s[bucket][key]
    writeCommunity(s)
    return on
  },

  async toggleCheer(postId) {
    return this._toggle('cheers', String(postId))
  },

  async toggleCommentCheer(commentId) {
    return this._toggle('commentCheers', String(commentId))
  },

  async toggleSave(postId) {
    return this._toggle('saves', String(postId))
  },

  async toggleGoing(postId) {
    return this._toggle('going', String(postId))
  },

  // Standalone "กิจกรรมใกล้คุณ" cards, keyed apart from post ids.
  async toggleEventGoing(eventId) {
    return this._toggle('going', `ev:${eventId}`)
  },

  isEventGoing(eventId) {
    return !!readCommunity().going[`ev:${eventId}`]
  },

  async toggleFollow(author) {
    return this._toggle('follows', author)
  },

  // Wipes this account's community data (used by tests / "reset demo").
  async clear() {
    await wait(150)
    localStorage.removeItem(communityKey())
    window.dispatchEvent(new CustomEvent('rehabai:community'))
  },
}
