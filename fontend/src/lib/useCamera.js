import { useEffect, useRef, useState } from 'react'

// Requests the webcam and binds the stream to a <video> ref.
// Real pose estimation (MediaPipe) would consume this same stream; here the
// session pages overlay a simulated skeleton on top of the live feed.
export function useCamera(enabled = true) {
  const videoRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | requesting | live | denied | error
  const streamRef = useRef(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setStatus('requesting')
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
        setStatus('live')
      })
      .catch((err) => {
        setStatus(err?.name === 'NotAllowedError' ? 'denied' : 'error')
      })

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [enabled])

  return { videoRef, status }
}

// Requests microphone and exposes a calibrated loudness reading.
//
// Calibration process (status = 'calibrating', ~1 second):
//   Measures the noise floor (ambient silence) for CALIBRATION_FRAMES frames.
//   Subtracts that power from every subsequent reading so the meter starts at 0
//   when the room is quiet and rises with actual vocal output.
//
// Output `db` is dB above the measured noise floor, mapped to a 40–90 display
// scale where 40 = silence and 90 = ~35 dB above noise floor (loud voice).
// status: 'idle' | 'requesting' | 'calibrating' | 'live' | 'denied' | 'error'
export function useMicLevel(enabled = true) {
  const [db, setDb] = useState(0)
  const [status, setStatus] = useState('idle')
  const raf = useRef(null)

  useEffect(() => {
    if (!enabled) return
    let ctx, analyser, source, stream, cancelled = false
    let calibrationSamples = []
    let noiseFloorPower = null
    const CALIBRATION_FRAMES = 60  // ~1 s at 60 fps
    const DISPLAY_MIN = 40
    const DISPLAY_MAX = 90
    const SIGNAL_RANGE_DB = 35     // dB above noise floor that maps to display max

    setStatus('requesting')
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((s) => {
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return }
        stream = s
        ctx = new (window.AudioContext || window.webkitAudioContext)()
        analyser = ctx.createAnalyser()
        analyser.fftSize = 2048
        source = ctx.createMediaStreamSource(stream)
        source.connect(analyser)
        // Float32Array avoids the 8-bit precision loss of getByteTimeDomainData
        const data = new Float32Array(analyser.fftSize)
        setStatus('calibrating')

        const loop = () => {
          analyser.getFloatTimeDomainData(data)  // samples in -1…+1

          let sum = 0
          for (let i = 0; i < data.length; i++) sum += data[i] * data[i]
          const power = sum / data.length  // mean square = RMS²

          if (noiseFloorPower === null) {
            // ── Calibration phase ───────────────────────────────────────────
            calibrationSamples.push(power)
            if (calibrationSamples.length >= CALIBRATION_FRAMES) {
              noiseFloorPower = calibrationSamples.reduce((a, b) => a + b, 0) / calibrationSamples.length
              setStatus('live')
            }
          } else {
            // ── Live phase ──────────────────────────────────────────────────
            // Subtract noise floor power; clamp to 0 so silence stays at min
            const netPower = Math.max(0, power - noiseFloorPower)
            const noiseRms = Math.sqrt(noiseFloorPower + 1e-12)
            const netRms = Math.sqrt(netPower)
            // dB above noise floor (0 = as loud as noise, positive = louder)
            const dbAboveNoise = netRms > 1e-9 ? 20 * Math.log10(netRms / noiseRms) : -80
            const mapped = DISPLAY_MIN + Math.max(0, Math.min(dbAboveNoise, SIGNAL_RANGE_DB)) / SIGNAL_RANGE_DB * (DISPLAY_MAX - DISPLAY_MIN)
            setDb(Math.round(mapped))
          }

          raf.current = requestAnimationFrame(loop)
        }
        loop()
      })
      .catch((err) => setStatus(err?.name === 'NotAllowedError' ? 'denied' : 'error'))

    return () => {
      cancelled = true
      if (raf.current) cancelAnimationFrame(raf.current)
      stream?.getTracks().forEach((t) => t.stop())
      ctx?.close?.()
    }
  }, [enabled])

  return { db, status }
}
