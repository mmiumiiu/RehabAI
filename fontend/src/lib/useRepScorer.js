import { useEffect, useRef, useState } from 'react'

// Counts reps for a BIG exercise from the live pose (wrists raised above the
// midpoint then lowered = 1 rep). Pose-quality / accuracy scoring has been
// removed — this only counts movements.
export function useRepScorer(landmarks, exerciseId, enabled = true) {
  const [repCount, setRepCount] = useState(0)
  const [recording, setRecording] = useState(false)

  const stateRef = useRef('IDLE') // IDLE | UP
  const smoothYRef = useRef(0.65)
  const repStartRef = useRef(0)

  useEffect(() => {
    if (!enabled || !landmarks) return

    const rawY = (landmarks[15].y + landmarks[16].y) / 2
    smoothYRef.current = 0.25 * rawY + 0.75 * smoothYRef.current
    const sY = smoothYRef.current
    const elapsed = (Date.now() - repStartRef.current) / 1000

    if (stateRef.current === 'IDLE' && sY < 0.42) {
      stateRef.current = 'UP'
      repStartRef.current = Date.now()
      setRecording(true)
    } else if (stateRef.current === 'UP' && elapsed > 0.4 && sY > 0.58) {
      stateRef.current = 'IDLE'
      setRecording(false)
      setRepCount(c => c + 1)
    } else if (stateRef.current === 'UP' && elapsed > 10) {
      stateRef.current = 'IDLE'
      setRecording(false)
      setRepCount(c => c + 1)
    }
  }, [landmarks, enabled, exerciseId])

  return { repCount, recording }
}
