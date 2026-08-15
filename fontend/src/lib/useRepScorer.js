import { useCallback, useEffect, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// BIG exercise id → model exercise name. null = no model, skip scoring.
const MODEL_EXERCISE = {
  1: 'overhead_reach',   // บนล่าง (Floor to Ceiling)
  2: null,               // ซ้ายขวา (no close match)
  3: 'forward_lunge',    // ก้าวหน้า
  4: 'lateral_raise',    // ก้าวข้าง
  5: 'forward_lunge',    // ก้าวหลัง
  6: 'overhead_reach',   // ก้าวเอื้อม
  7: 'lateral_raise',    // เอื้อมหมุน
}

export function useRepScorer(landmarks, exerciseId, enabled = true) {
  const [repCount, setRepCount] = useState(0)
  const [repScores, setRepScores] = useState([])
  const [lastScore, setLastScore] = useState(null)
  const [recording, setRecording] = useState(false)

  const bufferRef = useRef([])
  const stateRef = useRef('IDLE')  // IDLE | UP
  const smoothYRef = useRef(0.65)
  const smoothSpanRef = useRef(null) // smoothed arm span (forward-step counting)
  const repStartRef = useRef(0)
  const scoringRef = useRef(false)

  // ก้าวหน้า (Forward Step) is counted by arm spread instead of wrist height:
  // spread the arms out (span ≥ SPAN_ENTER × shoulder width) then bring them
  // back (span ≤ SPAN_EXIT) = one rep.
  const SPAN_ENTER = 1.7
  const SPAN_EXIT = 1.15

  const modelExercise = MODEL_EXERCISE[exerciseId] ?? null

  const scoreBuffer = useCallback(async () => {
    if (scoringRef.current || !modelExercise) return
    const buf = bufferRef.current.splice(0)
    if (buf.length < 8) return

    scoringRef.current = true
    try {
      const res = await fetch(`${API_URL}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landmarks: buf.map(frame =>
            frame.map(lm => [lm.x, lm.y, lm.z ?? 0, lm.visibility ?? 1.0])
          ),
          exercise: modelExercise,
          fps: 20,
        }),
      })
      if (!res.ok) throw new Error(res.statusText)
      const data = await res.json()
      if (data.verdict !== 'too_short' && data.verdict !== 'unsupported') {
        setLastScore(data)
        setRepScores(prev => [...prev, data])
      }
    } catch (e) {
      console.warn('[RehabAI] scoring error:', e.message)
    } finally {
      scoringRef.current = false
    }
  }, [modelExercise])

  useEffect(() => {
    if (!enabled || !landmarks) return

    // Buffer this frame
    bufferRef.current.push([...landmarks])
    if (bufferRef.current.length > 200) bufferRef.current.shift()

    const elapsed = (Date.now() - repStartRef.current) / 1000

    const startRep = () => {
      stateRef.current = 'UP'
      repStartRef.current = Date.now()
      bufferRef.current = [[...landmarks]]
      setRecording(true)
    }
    const finishRep = () => {
      stateRef.current = 'IDLE'
      setRecording(false)
      setRepCount(c => c + 1)
      scoreBuffer()
    }

    // ── ก้าวหน้า (Forward Step): count by arm spread ────────────────────────
    if (exerciseId === 3) {
      const shoulderW = Math.abs(landmarks[11].x - landmarks[12].x) || 1e-3
      const span = Math.abs(landmarks[15].x - landmarks[16].x) / shoulderW
      smoothSpanRef.current = smoothSpanRef.current == null
        ? span
        : 0.25 * span + 0.75 * smoothSpanRef.current
      const s = smoothSpanRef.current

      if (stateRef.current === 'IDLE' && s > SPAN_ENTER) startRep()        // arms spread out
      else if (stateRef.current === 'UP' && elapsed > 0.4 && s < SPAN_EXIT) finishRep() // arms back
      else if (stateRef.current === 'UP' && elapsed > 10) finishRep()      // safety timeout
      return
    }

    // ── Default (arm raises): count by wrist height ─────────────────────────
    const rawY = (landmarks[15].y + landmarks[16].y) / 2
    smoothYRef.current = 0.25 * rawY + 0.75 * smoothYRef.current
    const sY = smoothYRef.current

    if (stateRef.current === 'IDLE' && sY < 0.42) startRep()               // wrists rose above midpoint
    else if (stateRef.current === 'UP' && elapsed > 0.4 && sY > 0.58) finishRep() // wrists returned down
    else if (stateRef.current === 'UP' && elapsed > 10) finishRep()        // safety timeout
  }, [landmarks, enabled, scoreBuffer, exerciseId])

  return { repCount, repScores, lastScore, recording, modelExercise }
}
