// Browser built-in Thai TTS (Web Speech API), used as a fallback when the
// backend gTTS audio can't be reached/played (API not running, offline, autoplay
// quirks) so anything that speaks always produces audible sound.

function pickThaiVoice(synth) {
  const voices = synth.getVoices()
  return voices.find((v) => v.lang?.toLowerCase().startsWith('th')) || null
}

// Speak `text` locally. Calls `onEnd` once when finished/errored (also if speech
// synthesis is unavailable). Returns true if it started speaking.
export function speakLocal(text, onEnd) {
  const synth = typeof window !== 'undefined' && window.speechSynthesis
  if (!synth || !text) { onEnd?.(); return false }

  synth.cancel()  // stop anything already speaking
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'th-TH'

  let done = false
  const finish = () => { if (!done) { done = true; onEnd?.() } }
  u.onend = finish
  u.onerror = finish

  const voice = pickThaiVoice(synth)
  if (voice) u.voice = voice

  // Voices can load asynchronously; if none are ready yet, wait once for them so
  // we can prefer a Thai voice, then speak.
  if (!voice && synth.getVoices().length === 0 && 'onvoiceschanged' in synth) {
    synth.onvoiceschanged = () => {
      const v = pickThaiVoice(synth)
      if (v) u.voice = v
      synth.onvoiceschanged = null
      synth.speak(u)
    }
  } else {
    synth.speak(u)
  }
  return true
}

export function cancelLocal() {
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
}
