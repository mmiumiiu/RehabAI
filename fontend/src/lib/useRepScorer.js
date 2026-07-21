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
  const repStartRef = useRef(0)
  const scoringRef = useRef(false)

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

    // Smoothed average wrist Y (0 = top of frame, 1 = bottom)
    const rawY = (landmarks[15].y + landmarks[16].y) / 2
    smoothYRef.current = 0.25 * rawY + 0.75 * smoothYRef.current
    const sY = smoothYRef.current
    const elapsed = (Date.now() - repStartRef.current) / 1000

    if (stateRef.current === 'IDLE' && sY < 0.42) {
      // Wrists rose above midpoint → rep started
      stateRef.current = 'UP'
      repStartRef.current = Date.now()
      bufferRef.current = [[...landmarks]]
      setRecording(true)
    } else if (stateRef.current === 'UP' && elapsed > 0.4 && sY > 0.58) {
      // Wrists returned to resting position → rep done
      stateRef.current = 'IDLE'
      setRecording(false)
      setRepCount(c => c + 1)
      scoreBuffer()
    } else if (stateRef.current === 'UP' && elapsed > 10) {
      // Safety timeout — score whatever was captured
      stateRef.current = 'IDLE'
      setRecording(false)
      setRepCount(c => c + 1)
      scoreBuffer()
    }
  }, [landmarks, enabled, scoreBuffer])

  return { repCount, repScores, lastScore, recording, modelExercise }
}
