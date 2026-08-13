import { useEffect, useRef, useState } from 'react'
import { useMicLevel } from './useCamera.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

// Mic-only attempts (e.g. the "อา" hold) auto-stop after this many seconds of
// continuous silence, once the patient has actually started phonating.
const SILENCE_STOP_SEC = 1.0

// "Voice present" threshold on the 40–90 display scale (40 ≈ silence after
// calibration). Used only to arm / trigger the silence auto-stop, so recording
// ends whenever the patient stops speaking — independent of how loud they are.
// Loudness *scoring* still uses the therapist's band floor.
const VOICE_FLOOR = 47

// Records one LSVT LOUD attempt and scores it.
//
// While recording it captures the PEAK loudness (dB) from the mic and lets the
// browser's SpeechRecognition transcribe the spoken word. On stop it POSTs the
// measured dB + transcript to the backend /lsvt/score endpoint, which grades
// loudness against the therapist's `band` and word accuracy against `target`
// (both on the same 0–100 scale). Scoring lives server-side — see
// backend/lsvt_loud.py.
//
// Options:
//   band     — { min, good_min, good_max, max } from the patient's settings
//   target   — the word/phrase the patient should say (e.g. step.phrase)
//   enabled  — whether the mic is live (default true)
//   onResult — called with the score payload after each completed attempt
export function useLoudScorer({ band, target, mode = 'word', holdMin = 5, holdTarget = 7, enabled = true, onResult } = {}) {
  const { db, status: micStatus } = useMicLevel(enabled)
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [holdSec, setHoldSec] = useState(0)  // live phonation duration while recording
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const recRef = useRef(null)
  const dbRef = useRef(0)       // latest dB, so the peak tracker reads it without re-subscribing
  const peakRef = useRef(0)     // loudest dB captured during the current attempt
  const heardRef = useRef('')   // transcript captured from the recogniser
  const holdRef = useRef(0)     // accumulated seconds spent loud enough to count as phonation
  const lastTsRef = useRef(0)   // timestamp of the previous frame, for dt
  const phonatedRef = useRef(false)  // has the patient started phonating this attempt?
  const silenceRef = useRef(0)  // seconds of continuous silence since last phonation
  const submittedRef = useRef(false)
  // Keep the latest scoring inputs/callback in refs so `start()` stays stable.
  const bandRef = useRef(band)
  const targetRef = useRef(target)
  const modeRef = useRef(mode)
  const holdMinRef = useRef(holdMin)
  const holdTargetRef = useRef(holdTarget)
  const onResultRef = useRef(onResult)
  bandRef.current = band
  targetRef.current = target
  modeRef.current = mode
  holdMinRef.current = holdMin
  holdTargetRef.current = holdTarget
  onResultRef.current = onResult

  // Keep the latest dB in a ref so the timer loop below can read it. We can't do
  // the accumulation in a [db]-effect: when the patient goes silent the reading
  // settles to a constant value, React skips the re-render (state unchanged), the
  // effect stops firing, and the silence timer would never advance.
  useEffect(() => { dbRef.current = db }, [db])

  // While recording, an independent timer tracks peak loudness, accumulates the
  // phonation time (seconds at or above the band floor), and — for mic-only
  // attempts like the "อา" hold — auto-stops after a short stretch of silence
  // once the patient has actually phonated. In word mode the speech recogniser
  // ends the attempt itself (recRef is set), so we skip the silence stop there.
  useEffect(() => {
    if (!recording) return
    lastTsRef.current = performance.now()
    const id = setInterval(() => {
      const d = dbRef.current
      if (d > peakRef.current) peakRef.current = d
      const now = performance.now()
      const dt = (now - lastTsRef.current) / 1000
      lastTsRef.current = now

      // Loud enough to count toward the phonation-duration score.
      if (d >= (bandRef.current?.min ?? 65)) {
        holdRef.current += dt
        setHoldSec(Math.round(holdRef.current * 10) / 10)
      }
      // Voice-present vs silence drives the auto-stop (armed on any voice, not
      // just the loud band). Mic-only attempts end after SILENCE_STOP_SEC of
      // silence once the patient has spoken; word mode lets the recogniser end.
      if (d >= VOICE_FLOOR) {
        phonatedRef.current = true
        silenceRef.current = 0
      } else if (phonatedRef.current && !recRef.current) {
        silenceRef.current += dt
        if (silenceRef.current >= SILENCE_STOP_SEC) stop()
      }
    }, 50)
    return () => clearInterval(id)
  }, [recording])

  function start() {
    // Speech recognition is only needed when a word is being scored. Steps that
    // score just loudness + duration (no target word) skip it entirely.
    const useSR = !!targetRef.current
    if (useSR && !SR) {
      setError('เบราว์เซอร์นี้ไม่รองรับการรู้จำเสียงพูด — ลองใช้ Chrome')
      return
    }
    setError('')
    setResult(null)
    setTranscript('')
    setHoldSec(0)
    peakRef.current = dbRef.current
    heardRef.current = ''
    holdRef.current = 0
    lastTsRef.current = performance.now()
    phonatedRef.current = false
    silenceRef.current = 0
    submittedRef.current = false
    setRecording(true)

    if (!useSR) {
      recRef.current = null  // no recogniser this attempt; stop() finalises it
      return
    }

    const rec = new SR()
    rec.lang = 'th-TH'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      heardRef.current = text
      setTranscript(text)
    }
    rec.onerror = (e) => {
      // In sustain mode the vowel may not register as a word — that's expected,
      // duration is what matters, so don't treat "no-speech" as a failure.
      if (modeRef.current === 'sustain' && (e.error === 'no-speech' || e.error === 'aborted')) return
      if (e.error === 'no-speech') setError('ไม่ได้ยินเสียงพูด — ลองพูดดังขึ้น')
      else if (e.error !== 'aborted') setError('รู้จำเสียงไม่สำเร็จ: ' + e.error)
    }
    rec.onend = () => {
      // Word mode ends the attempt when the recogniser stops. Sustain mode keeps
      // measuring duration until the patient presses stop, so ignore it here.
      if (modeRef.current === 'word') {
        setRecording(false)
        submit(peakRef.current, heardRef.current, holdRef.current)
      }
    }
    recRef.current = rec
    rec.start()
  }

  function stop() {
    recRef.current?.stop()
    // Sustain mode has no recogniser-driven end, so finalise the attempt here.
    if (modeRef.current === 'sustain') {
      setRecording(false)
      submit(peakRef.current, heardRef.current, holdRef.current)
    }
  }

  async function submit(measuredDb, heard, heldSec) {
    if (submittedRef.current) return
    submittedRef.current = true
    try {
      const res = await fetch(`${API_URL}/lsvt/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          db: measuredDb,
          mode: modeRef.current,
          transcript: heard,
          target_word: targetRef.current,
          hold_sec: heldSec,
          hold_min: holdMinRef.current,
          hold_target: holdTargetRef.current,
          band: bandRef.current,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      // Echo back the dB we measured so callers can display it (the endpoint
      // only returns the derived score, not the raw reading).
      data.measured_db = Math.round(measuredDb)
      setResult(data)
      onResultRef.current?.(data)
    } catch (err) {
      setError('เชื่อมต่อ backend ไม่สำเร็จ — ตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่ (' + (err?.message || err) + ')')
    }
  }

  return { db, micStatus, recording, transcript, holdSec, result, error, supported: !!SR, start, stop }
}

// Loudness band (dB): min · good_min–good_max · max.
//
// This is the ONLY part the therapist will adjust per patient. For now it is
// FIXED at these values — once the therapist UI exposes it, swap this constant
// for the patient's saved setting. The pass rule (both parts > 80%) is
// independent of these numbers, so any band the therapist sets still works.
export const LOUD_BAND = { min: 65, good_min: 70, good_max: 85, max: 90 }
