import { useEffect, useRef } from 'react'

// MediaPipe Pose landmark connections (indices into the 33-landmark array)
const CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],  // arms
  [11, 23], [12, 24], [23, 24],                        // torso
  [23, 25], [25, 27], [24, 26], [26, 28],              // legs
  [27, 31], [28, 32],                                  // feet
]
const JOINTS = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]

export default function PoseCanvas({ landmarks, good }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Sync canvas pixel size to its CSS size
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    ctx.clearRect(0, 0, w, h)
    if (!landmarks || landmarks.length < 29) return

    // Video is mirrored (scaleX -1), so flip landmark X to match
    const px = (lm) => [(1 - lm.x) * w, lm.y * h]
    const color = good ? '#4E9484' : '#E39159'

    ctx.strokeStyle = color
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.globalAlpha = 0.9

    for (const [a, b] of CONNECTIONS) {
      if (!landmarks[a] || !landmarks[b]) continue
      const [ax, ay] = px(landmarks[a])
      const [bx, by] = px(landmarks[b])
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(bx, by)
      ctx.stroke()
    }

    ctx.fillStyle = '#DCEEE8'
    for (const i of JOINTS) {
      if (!landmarks[i]) continue
      const [x, y] = px(landmarks[i])
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [landmarks, good])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ filter: 'drop-shadow(0 0 6px rgba(78,148,132,.35))' }}
    />
  )
}
