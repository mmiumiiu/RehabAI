import { useRef, useState } from 'react'
import { speakLocal, cancelLocal } from '../lib/ttsLocal.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Plays the given Thai text aloud so the patient can hear the target phrase
// pronounced. Tries the backend TTS (gTTS) first; if that fails, falls back to
// the browser's speechSynthesis so there's always audible output. Text-only
// button. `dark` styles it for the dark session panel; default is the light
// training-list style.
export default function PlayPhraseButton({ text, label = 'กดเพื่อฟัง', dark = false, className = '' }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  function play(e) {
    e?.stopPropagation?.()
    if (!text) return

    // Stop any in-flight playback (backend audio + local speech) first.
    if (audioRef.current) {
      audioRef.current.onended = audioRef.current.onerror = null
      audioRef.current.pause()
      audioRef.current = null
    }
    cancelLocal()

    const stop = () => setPlaying(false)
    let fellBack = false
    const fallback = () => {
      if (fellBack) return
      fellBack = true
      speakLocal(text, stop)  // backend unreachable / bad response → speak locally
    }

    const audio = new Audio(`${API_URL}/tts?text=${encodeURIComponent(text)}`)
    audioRef.current = audio
    audio.onended = stop
    audio.onerror = fallback
    setPlaying(true)
    // play() rejects on autoplay block or load failure — fall back there too.
    audio.play().catch(fallback)
  }

  const base = 'inline-flex items-center px-5 py-2.5 rounded-pill text-[15px] font-heading font-semibold whitespace-nowrap transition-colors'
  const theme = dark
    ? 'bg-white/[0.12] text-white hover:bg-white/[0.2]'
    : 'border border-coral-700 text-coral-700 bg-surface hover:bg-coral-100'

  return (
    <button type="button" onClick={play} className={`${base} ${theme} ${className}`}>
      {playing ? 'กำลังเล่น…' : label}
    </button>
  )
}
