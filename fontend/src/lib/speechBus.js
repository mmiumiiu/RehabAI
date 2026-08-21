// Tiny pub/sub so the background music can "duck" (drop quiet) while the spoken
// TTS guidance is playing, then ramp back up once the explanation finishes.
// useSpeak reports start/end; SessionMusic listens.

let speaking = 0
const listeners = new Set()

function emit() {
  const on = speaking > 0
  listeners.forEach((fn) => fn(on))
}

export function speechStart() {
  speaking += 1
  emit()
}

export function speechEnd() {
  speaking = Math.max(0, speaking - 1)
  emit()
}

export function isSpeaking() {
  return speaking > 0
}

// Subscribe to speaking on/off. Fires immediately with the current state and
// returns an unsubscribe function.
export function onSpeechChange(fn) {
  listeners.add(fn)
  fn(speaking > 0)
  return () => listeners.delete(fn)
}
