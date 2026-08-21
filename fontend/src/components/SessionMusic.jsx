import { useEffect, useRef, useState } from 'react'
import { Settings } from './icons.jsx'
import { onSpeechChange, isSpeaking } from '../lib/speechBus.js'

const MUSIC_KEY = 'rehabai_music'
const DUCK_VOLUME = 0.05   // quiet level while the spoken guidance is playing
const RAMP_MS = 3000       // fade back up to the set volume after it finishes
function load() {
  try { return JSON.parse(localStorage.getItem(MUSIC_KEY)) || {} } catch { return {} }
}

// Background music for the training sessions with a gear control (top-right) to
// toggle on/off and set the volume. Preference is remembered across sessions.
export default function SessionMusic() {
  const saved = load()
  const [open, setOpen] = useState(false)
  const [enabled, setEnabled] = useState(saved.enabled ?? true)
  const [volume, setVolume] = useState(saved.volume ?? 0.35)
  const audioRef = useRef(null)
  const volRef = useRef(volume)   // latest target volume, for the duck/ramp logic
  const rampRef = useRef(null)

  function clearRamp() {
    if (rampRef.current) { clearInterval(rampRef.current); rampRef.current = null }
  }

  useEffect(() => {
    volRef.current = volume
    localStorage.setItem(MUSIC_KEY, JSON.stringify({ enabled, volume }))
    // Apply immediately unless we're ducked for the spoken guidance.
    if (audioRef.current && !isSpeaking()) { clearRamp(); audioRef.current.volume = volume }
  }, [enabled, volume])

  // Duck while the TTS guidance speaks; ramp gently back up when it finishes.
  useEffect(() => {
    const unsub = onSpeechChange((speaking) => {
      const a = audioRef.current
      if (!a) return
      clearRamp()
      if (speaking) {
        a.volume = Math.min(volRef.current, DUCK_VOLUME)
        return
      }
      const start = a.volume
      const target = volRef.current
      if (target <= start) { a.volume = target; return }
      const steps = 30
      let i = 0
      rampRef.current = setInterval(() => {
        i += 1
        a.volume = start + (target - start) * (i / steps)
        if (i >= steps) { a.volume = target; clearRamp() }
      }, RAMP_MS / steps)
    })
    return () => { unsub(); clearRamp() }
  }, [])

  // Play when enabled. Autoplay may be blocked until a gesture, so also retry on
  // the first pointer interaction with the page.
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (!enabled) { a.pause(); return }
    const tryPlay = () => a.play().catch(() => {})
    tryPlay()
    window.addEventListener('pointerdown', tryPlay, { once: true })
    return () => window.removeEventListener('pointerdown', tryPlay)
  }, [enabled])

  return (
    <div className="fixed top-3 right-3 z-50">
      <audio ref={audioRef} src="/sound.mp3" loop preload="auto" />
      <button
        onClick={() => setOpen((o) => !o)}
        title="เพลงประกอบ"
        className="w-10 h-10 rounded-full bg-black/35 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur transition-colors"
      >
        <Settings size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-surface rounded-xl shadow-2xl border border-line p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13.5px] font-semibold text-ink-primary">เพลงประกอบ</span>
            <button
              onClick={() => setEnabled((e) => !e)}
              className={`w-11 h-6 rounded-full relative transition-colors ${enabled ? 'bg-teal-500' : 'bg-line'}`}
            >
              <span className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex justify-between text-[11.5px] text-ink-secondary mb-1">
            <span>ความดัง</span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range" min="0" max="1" step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full accent-teal-700 disabled:opacity-40"
          />
          <p className="text-[11px] text-ink-muted mt-2">
            {enabled ? 'เปิดเพลงระหว่างฝึก' : 'ปิดเพลงอยู่'}
          </p>
        </div>
      )}
    </div>
  )
}
