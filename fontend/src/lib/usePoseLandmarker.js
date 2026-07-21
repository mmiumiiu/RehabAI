import { useEffect, useRef, useState } from 'react'

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'

export function usePoseLandmarker(videoRef, enabled = true) {
  const [ready, setReady] = useState(false)
  const [landmarks, setLandmarks] = useState(null)
  const landmarkerRef = useRef(null)
  const rafRef = useRef(null)
  const lastTsRef = useRef(0)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    async function init() {
      const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL)
      const lm = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })
      if (cancelled) { lm.close(); return }
      landmarkerRef.current = lm
      setReady(true)
    }

    init().catch(console.error)

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      landmarkerRef.current?.close()
      landmarkerRef.current = null
      setReady(false)
      setLandmarks(null)
    }
  }, [enabled])

  useEffect(() => {
    if (!ready) return
    const video = videoRef.current
    if (!video) return

    function loop() {
      rafRef.current = requestAnimationFrame(loop)
      if (video.readyState < 2 || video.paused) return
      const now = performance.now()
      if (now - lastTsRef.current < 50) return  // cap at ~20 fps
      lastTsRef.current = now
      const result = landmarkerRef.current?.detectForVideo(video, now)
      setLandmarks(result?.landmarks?.[0] ?? null)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [ready, videoRef])

  return { landmarks, ready }
}
