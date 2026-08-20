import { useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Plays the given Thai text aloud via the backend TTS (gTTS) so the patient can
// hear the target phrase pronounced. Text-only button. `dark` styles it for the
// dark session panel; default is the light training-list style.
export default function PlayPhraseButton({ text, label = 'กดเพื่อฟัง', dark = false, className = '' }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  function play(e) {
    e?.stopPropagation?.()
    if (!text) return
    if (audioRef.current) {
      audioRef.current.onended = null
      audioRef.current.pause()
    }
    const audio = new Audio(`${API_URL}/tts?text=${encodeURIComponent(text)}`)
    audioRef.current = audio
    audio.onended = () => setPlaying(false)
    audio.onerror = () => setPlaying(false)
    setPlaying(true)
    audio.play().catch(() => setPlaying(false))
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
