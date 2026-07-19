// WebSocket chat client — singleton connection shared across both portals.
// For cross-device demo set VITE_WS_URL=ws://192.168.x.x:3001 in .env.local

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

let socket = null
let currentThread = null
let onMessageCallback = null
let reconnectTimer = null

function connect() {
  if (socket && socket.readyState < 2) return // already open or connecting
  socket = new WebSocket(WS_URL)

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (!onMessageCallback) return

    if (msg.type === 'history') {
      msg.messages.forEach((m) => onMessageCallback(m))
    } else if (msg.type === 'message') {
      onMessageCallback(msg.message)
    }
  }

  socket.onopen = () => {
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
    if (currentThread) socket.send(JSON.stringify({ type: 'join', threadId: currentThread }))
  }

  socket.onclose = () => {
    // Reconnect after 2 s if we have an active thread
    if (currentThread) reconnectTimer = setTimeout(connect, 2000)
  }

  socket.onerror = () => socket.close()
}

export const chatService = {
  // Subscribe to a thread; callback receives each message object as it arrives
  // (history is replayed on join, then live messages stream in)
  join(threadId, onMessage) {
    currentThread = threadId
    onMessageCallback = onMessage

    connect()

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'join', threadId }))
    }
  },

  send(threadId, from, text) {
    const message = {
      type: 'message',
      threadId,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      from,
      text,
      at: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message))
    }
  },

  leave() {
    currentThread = null
    onMessageCallback = null
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
  },
}
