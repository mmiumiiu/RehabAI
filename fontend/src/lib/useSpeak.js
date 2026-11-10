import { useEffect, useRef } from 'react'
import { speechStart, speechEnd } from './speechBus.js'
import { speakLocal, cancelLocal } from './ttsLocal.js'

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

    // If the backend audio can't load/play, speak with the browser's TTS so the
    // guidance is still heard — keep the music ducked until the local speech ends.
    let fellBack = false
    const fallback = () => {
      if (fellBack || cancelled) return
      fellBack = true
      speakLocal(text, finish)
    }

    const timer = setTimeout(() => {
      if (cancelled) return
      const audio = new Audio(`${API_URL}/tts?text=${encodeURIComponent(text)}`)
      audioRef.current = audio
      audio.addEventListener('ended', finish)
      audio.addEventListener('error', fallback)
      // Duck the background music while the guidance speaks.
      started = true
      speechStart()
      // Autoplay may be blocked if the click that started the session has aged
      // out — fall back to browser TTS rather than throwing.
      audio.play().catch(fallback)
    }, delayMs)

    return () => {
      cancelled = true
      clearTimeout(timer)
      if (audioRef.current) {
        audioRef.current.onerror = null
        audioRef.current.pause()
        audioRef.current = null
      }
      cancelLocal()
      // If the timer fired we started speaking; make sure the music un-ducks.
      finish()
    }
  }, [text, delayMs, enabled])
}
