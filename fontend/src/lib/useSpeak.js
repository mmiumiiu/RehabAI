import { useEffect, useRef } from 'react'
import { speechStart, speechEnd } from './speechBus.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Speaks `text` aloud via the backend Thai TTS (gTTS), once, after an optional
// delay. Re-speaks whenever `text` changes. Handles cleanup on unmount and
// silently ignores autoplay rejections (browser blocking sound without a
// gesture). Used to read the exercise instruction at the start of a session.
export function useSpeak(text, { delayMs = 0, enabled = true } = {}) {
  const audioRef = useRef(null)

  useEffect(() => {
    if (!enabled || !text) return
    let cancelled = false

    // Balance speechStart with exactly one speechEnd (whether by finishing,
    // erroring, autoplay-block, or unmount) — and only if we actually started.
    let started = false
    let finished = false
    const finish = () => {
      if (!started || finished) return
      finished = true
      speechEnd()
    }

    const timer = setTimeout(() => {
      if (cancelled) return
      const audio = new Audio(`${API_URL}/tts?text=${encodeURIComponent(text)}`)
      audioRef.current = audio
      audio.addEventListener('ended', finish)
      audio.addEventListener('error', finish)
      // Duck the background music while the guidance speaks.
      started = true
      speechStart()
      // Autoplay may be blocked if the click that started the session has aged
      // out — fail silently rather than throwing an unhandled rejection.
      audio.play().catch(finish)
    }, delayMs)

    return () => {
      cancelled = true
      clearTimeout(timer)
      if (audioRef.current) {
        audioRef.current.onerror = null
        audioRef.current.pause()
        audioRef.current = null
      }
      // If the timer fired we started speaking; make sure the music un-ducks.
      finish()
    }
  }, [text, delayMs, enabled])
}
