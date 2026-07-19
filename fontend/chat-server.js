// RehabAI relay server — chat messages + live session results
//
// Same-device demo (two browser tabs):
//   node chat-server.js          (or: npm run dev:full)
//
// Cross-device demo (laptop + phone on same WiFi):
//   VITE_WS_URL=ws://192.168.x.x:3001 npm run dev:full
//   → set VITE_WS_URL in fontend/.env.local, then open the Vite URL on the phone

import { WebSocketServer } from 'ws'

const PORT = process.env.CHAT_PORT || 3001

// ── Chat threads ─────────────────────────────────────────────────────────────
// threadId → message[]
const threads = new Map([
  ['p1', [
    { id: 'm1', from: 'therapist', text: 'สวัสดีครับคุณสมชาย สัปดาห์นี้ฝึกได้ดีมากครับ ท่า Sit-to-Stand ดีขึ้นเยอะเลย', at: 'เมื่อวาน 14:20' },
    { id: 'm2', from: 'patient',   text: 'ขอบคุณครับคุณหมอ ช่วงนี้รู้สึกลุกนั่งคล่องขึ้นจริงๆ', at: 'เมื่อวาน 15:02' },
    { id: 'm3', from: 'therapist', text: 'เยี่ยมเลยครับ ลองเพิ่มท่าเขย่งเท้าให้ครบ 10 ครั้งนะครับ แล้วมาอัปเดตกัน', at: 'เมื่อวาน 15:10' },
  ]],
])

// threadId → Set<WebSocket>
const chatSubs = new Map()
function getChatSubs(threadId) {
  if (!chatSubs.has(threadId)) chatSubs.set(threadId, new Set())
  return chatSubs.get(threadId)
}

// ── Session results ───────────────────────────────────────────────────────────
// patientId → latest result object (kept for replay on subscribe)
const sessionResults = new Map()

// patientId → Set<WebSocket>
const sessionSubs = new Map()
function getSessionSubs(patientId) {
  if (!sessionSubs.has(patientId)) sessionSubs.set(patientId, new Set())
  return sessionSubs.get(patientId)
}

// ── Server ────────────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ port: PORT })

wss.on('connection', (ws) => {
  let currentThread = null
  let currentSessionPatient = null

  ws.on('message', (raw) => {
    let msg
    try { msg = JSON.parse(raw) } catch { return }

    // ── Chat ──────────────────────────────────────────────────────────────────
    if (msg.type === 'join') {
      if (currentThread) getChatSubs(currentThread).delete(ws)
      currentThread = msg.threadId
      getChatSubs(currentThread).add(ws)
      const history = threads.get(currentThread) || []
      ws.send(JSON.stringify({ type: 'history', messages: history }))
    }

    if (msg.type === 'message' && currentThread) {
      const record = { id: msg.id, from: msg.from, text: msg.text, at: msg.at }
      if (!threads.has(currentThread)) threads.set(currentThread, [])
      threads.get(currentThread).push(record)
      const broadcast = JSON.stringify({ type: 'message', message: record })
      for (const client of getChatSubs(currentThread)) {
        if (client.readyState === 1) client.send(broadcast)
      }
    }

    // ── Session results ───────────────────────────────────────────────────────
    if (msg.type === 'join_session') {
      if (currentSessionPatient) getSessionSubs(currentSessionPatient).delete(ws)
      currentSessionPatient = msg.patientId
      getSessionSubs(currentSessionPatient).add(ws)
      const latest = sessionResults.get(currentSessionPatient)
      if (latest) ws.send(JSON.stringify({ type: 'session_result', result: latest }))
    }

    if (msg.type === 'session_result') {
      sessionResults.set(msg.patientId, msg.result)
      const broadcast = JSON.stringify({ type: 'session_result', result: msg.result })
      for (const client of getSessionSubs(msg.patientId)) {
        if (client.readyState === 1) client.send(broadcast)
      }
    }
  })

  ws.on('close', () => {
    if (currentThread) getChatSubs(currentThread).delete(ws)
    if (currentSessionPatient) getSessionSubs(currentSessionPatient).delete(ws)
  })
})

console.log(`[chat-server] WebSocket listening on ws://localhost:${PORT}`)
