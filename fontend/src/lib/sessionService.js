// WebSocket client for publishing/subscribing live session results.
// Separate singleton from chatService to avoid message type collision.

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

let socket = null
let currentPatient = null
let onResultCallback = null
let reconnectTimer = null

function connect() {
  if (socket && socket.readyState < 2) return
  socket = new WebSocket(WS_URL)

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.type === 'session_result' && onResultCallback) {
      onResultCallback(msg.result)
    }
  }

  socket.onopen = () => {
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
    if (currentPatient) {
      socket.send(JSON.stringify({ type: 'join_session', patientId: currentPatient }))
    }
  }

  socket.onclose = () => {
    if (currentPatient) reconnectTimer = setTimeout(connect, 2000)
  }

  socket.onerror = () => socket.close()
}

export const sessionService = {
  // Therapist side: subscribe to live updates for a patient
  subscribe(patientId, onResult) {
    currentPatient = patientId
    onResultCallback = onResult
    connect()
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'join_session', patientId }))
    }
  },

  // Patient side: publish result when session ends or stops
  publish(patientId, result) {
    connect()
    const send = () => socket.send(JSON.stringify({ type: 'session_result', patientId, result }))
    if (socket.readyState === WebSocket.OPEN) {
      send()
    } else {
      socket.addEventListener('open', send, { once: true })
    }
  },

  unsubscribe() {
    currentPatient = null
    onResultCallback = null
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
  },
}
