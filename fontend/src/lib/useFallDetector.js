import { useEffect, useRef, useState } from 'react'

// Heuristic fall detector from MediaPipe pose landmarks (33 points, y increases
// downward, normalised 0–1). Flags a fall when the torso becomes horizontal AND
// the person sits low in the frame, held continuously for ~HOLD_MS — which
// filters out bending/reaching. Re-arms only after the person is upright again.
const HOLD_MS = 1200
const TILT_DEG = 55        // torso angle from vertical (90 = lying flat)
const LOW_Y = 0.55         // shoulders below this (lower in frame) = near the floor
const MIN_VIS = 0.3

function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }

export function useFallDetector(landmarks, enabled = true) {
  const [fallen, setFallen] = useState(false)
  const startRef = useRef(null)   // when the fall condition first became true
  const firedRef = useRef(false)  // already flagged for this fall (until upright again)

  useEffect(() => {
    if (!enabled || !landmarks) { startRef.current = null; return }
    const L = landmarks
    const vis = (i) => L[i]?.visibility ?? 0
    if (vis(11) < MIN_VIS || vis(12) < MIN_VIS || vis(23) < MIN_VIS || vis(24) < MIN_VIS) {
      startRef.current = null
      return
    }

    const sho = mid(L[11], L[12])   // mid-shoulder
    const hip = mid(L[23], L[24])   // mid-hip
    const dx = sho.x - hip.x
    const dy = sho.y - hip.y
    const tilt = (Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI // 0 = upright, 90 = flat
    const horizontal = tilt > TILT_DEG
    const low = sho.y > LOW_Y

    if (horizontal && low) {
      const now = performance.now()
      if (startRef.current == null) startRef.current = now
      else if (!firedRef.current && now - startRef.current > HOLD_MS) {
        firedRef.current = true
        setFallen(true)
      }
    } else {
      // Upright again → reset so a future fall can re-trigger.
      startRef.current = null
      firedRef.current = false
    }
  }, [landmarks, enabled])

  return { fallen, dismiss: () => setFallen(false) }
}
