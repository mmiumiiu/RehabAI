import { useEffect, useRef, useState } from 'react'
import { Button, SectionTitle } from '../../components/ui.jsx'
import { Mic } from '../../components/icons.jsx'
import { BIG_EXERCISES } from '../../lib/mockData.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Text-to-speech test page. Uses the backend gTTS endpoint so the Thai voice is
// identical on every device, independent of the OS's installed voices.

export default function TtsTest() {
  const [selectedId, setSelectedId] = useState(BIG_EXERCISES[0].id)
  const [speaking, setSpeaking] = useState(false)
  const [rate, setRate] = useState(1)
  const [error, setError] = useState('')
  const audioRef = useRef(null)
  const firstRun = useRef(true)

  const exercise = BIG_EXERCISES.find((e) => e.id === selectedId)
  const exerciseDescription = exercise?.how ?? ''

  function speak(text) {
    if (!text) return
    setError('')
    // Stop anything currently playing so descriptions don't overlap. Detach the
    // old element's handlers first so clearing it doesn't fire a spurious error.
    if (audioRef.current) {
      audioRef.current.onerror = null
      audioRef.current.onplaying = null
      audioRef.current.onended = null
      audioRef.current.pause()
    }
    const audio = new Audio(`${API_URL}/tts?text=${encodeURIComponent(text)}`)
    audio.playbackRate = rate
    audio.onplaying = () => setSpeaking(true)
    audio.onended = () => setSpeaking(false)
    audio.onerror = () => {
      // Only surface an error if this is still the current audio (not a stale one
      // we just replaced).
      if (audioRef.current === audio) {
        setSpeaking(false)
        setError('โหลดเสียงไม่สำเร็จ — ตรวจสอบว่า backend กำลังทำงานอยู่')
      }
    }
    audioRef.current = audio
    audio.play().catch((err) => {
      setSpeaking(false)
      // Interrupting playback to start a new one throws AbortError — that's normal,
      // don't show it as a failure.
      if (err?.name === 'AbortError' || audioRef.current !== audio) return
      if (err?.name === 'NotAllowedError') {
        setError('เบราว์เซอร์บล็อกการเล่นเสียงอัตโนมัติ — กด "อ่านอีกครั้ง"')
      } else {
        setError('เล่นเสียงไม่ได้: ' + (err?.message || err))
      }
    })
  }

  // อ่านใหม่ทุกครั้งที่เปลี่ยนท่า (ข้ามการโหลดครั้งแรก เพราะเบราว์เซอร์บล็อก autoplay
  // ถ้ายังไม่มี user gesture — ผู้ใช้กดปุ่ม/เลือกท่าเองแล้วเสียงจะเล่นได้)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    speak(exerciseDescription)
    return () => {
      if (audioRef.current) audioRef.current.pause()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseDescription])

  // ปรับความเร็วขณะเล่นได้ทันที
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate
  }, [rate])

  function stop() {
    if (audioRef.current) audioRef.current.pause()
    setSpeaking(false)
  }

  return (
    <div className="max-w-[720px]">
      <p className="text-[13px] text-teal-700 font-semibold uppercase tracking-wide mb-1">
        ทดสอบระบบเสียง · Text-to-Speech (gTTS)
      </p>
      <h1 className="font-heading text-[24px] font-semibold text-ink-primary mb-2">
        อ่านคำอธิบายท่าออกเสียง (ภาษาไทย)
      </h1>
      <p className="text-[13px] text-ink-secondary mb-6">
        เสียงไทยสร้างจาก backend (gTTS) จึงเหมือนกันทุกเครื่อง ไม่ต้องพึ่ง voice ในเครื่องผู้ใช้
      </p>

      {error && (
        <div className="card px-4 py-3 mb-5 text-[13px] text-danger">{error}</div>
      )}

      {/* ── ความเร็ว ── */}
      <SectionTitle>ตั้งค่าเสียง</SectionTitle>
      <div className="card px-5 py-4 mb-6">
        <span className="field-label">ความเร็ว (Rate): {rate.toFixed(1)}×</span>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="w-full accent-teal-700"
        />
        <div className="flex justify-between text-[11px] text-ink-muted mt-1">
          <span>ช้า 0.5×</span>
          <span>เร็ว 2.0×</span>
        </div>
      </div>

      <SectionTitle>เลือกท่าฝึก</SectionTitle>
      <div className="flex flex-wrap gap-2 mb-6">
        {BIG_EXERCISES.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setSelectedId(ex.id)}
            className={`px-4 py-2 rounded-pill text-[13px] font-heading font-medium border transition-colors ${
              ex.id === selectedId
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-surface text-ink-secondary border-line hover:border-teal-700'
            }`}
          >
            {ex.name}
          </button>
        ))}
      </div>

      <div className="card px-5 py-5">
        <h3 className="font-heading text-[16px] font-semibold text-ink-primary mb-2">
          {exercise?.name}
        </h3>
        <p className="text-[14px] text-ink-primary leading-relaxed mb-5">
          {exerciseDescription}
        </p>
        <div className="flex items-center gap-3">
          <Button onClick={() => speak(exerciseDescription)} className="!w-auto px-5">
            <Mic size={16} /> อ่านอีกครั้ง
          </Button>
          <Button variant="outline" onClick={stop} className="!w-auto px-5">
            หยุด
          </Button>
          {speaking && (
            <span className="flex items-center gap-2 text-[13px] text-teal-700">
              <span className="rec-pulse w-2.5 h-2.5 rounded-full bg-teal-700" /> กำลังอ่าน…
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
