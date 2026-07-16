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

// Requests microphone and exposes a live loudness reading in dB (approx SPL-ish,
// uncalibrated — real calibration is in the spec backlog §7).
export function useMicLevel(enabled = true) {
  const [db, setDb] = useState(0)
  const [status, setStatus] = useState('idle')
  const raf = useRef(null)

  useEffect(() => {
    if (!enabled) return
    let ctx, analyser, source, stream, cancelled = false
    setStatus('requesting')
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((s) => {
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return }
        stream = s
        ctx = new (window.AudioContext || window.webkitAudioContext)()
        analyser = ctx.createAnalyser()
        analyser.fftSize = 1024
        source = ctx.createMediaStreamSource(stream)
        source.connect(analyser)
        const data = new Uint8Array(analyser.fftSize)
        setStatus('live')
        const loop = () => {
          analyser.getByteTimeDomainData(data)
          let sum = 0
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128
            sum += v * v
          }
          const rms = Math.sqrt(sum / data.length)
          // map RMS → a friendly 40–90 dB-ish scale for the meter
          const level = rms > 0 ? 20 * Math.log10(rms) : -60
          const mapped = Math.max(40, Math.min(90, 90 + level * 0.9))
          setDb(Math.round(mapped))
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
