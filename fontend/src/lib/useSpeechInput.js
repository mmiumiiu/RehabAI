import { useCallback, useEffect, useRef, useState } from 'react'

// Thai speech-to-text via the Web Speech API (SpeechRecognition). Chrome/Edge
// and Safari support it; Firefox does not, so `supported` is false there and the
// caller shows a message instead.
//
// onResult receives the recognised text so the caller can append it to a field.

const Recognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

export function useSpeechInput(onResult, { lang = 'th-TH' } = {}) {
  const supported = !!Recognition
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)
  const recRef = useRef(null)
  const resultRef = useRef(onResult)

  // Keep the latest callback without restarting recognition.
  useEffect(() => { resultRef.current = onResult }, [onResult])

  useEffect(() => () => {
    try { recRef.current?.abort() } catch { /* already stopped */ }
  }, [])

  const stop = useCallback(() => {
    try { recRef.current?.stop() } catch { /* not running */ }
    setListening(false)
  }, [])

  const start = useCallback(() => {
    if (!supported) {
      setError('เบราว์เซอร์นี้ยังไม่รองรับการพูดแทนพิมพ์ — กรุณาพิมพ์ข้อความ หรือลองใช้ Chrome')
      return
    }
    setError(null)

    const rec = new Recognition()
    recRef.current = rec
    rec.lang = lang
    rec.interimResults = false
    rec.continuous = false
    rec.maxAlternatives = 1

    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0]?.transcript || '')
        .join(' ')
        .trim()
      if (text) resultRef.current?.(text)
    }
    rec.onerror = (e) => {
      setListening(false)
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setError('ไม่ได้รับอนุญาตให้ใช้ไมโครโฟน — กรุณาอนุญาตในเบราว์เซอร์')
      } else if (e.error === 'no-speech') {
        setError('ไม่ได้ยินเสียงพูด — ลองกดแล้วพูดอีกครั้ง')
      } else if (e.error !== 'aborted') {
        setError('เกิดข้อผิดพลาดในการฟังเสียง — ลองอีกครั้ง')
      }
    }
    rec.onend = () => setListening(false)

    try {
      rec.start()
      setListening(true)
    } catch {
      setError('ไม่สามารถเริ่มฟังเสียงได้ — ลองอีกครั้ง')
      setListening(false)
    }
  }, [supported, lang])

  const toggle = useCallback(() => {
    if (listening) stop()
    else start()
  }, [listening, start, stop])

  return { supported, listening, error, start, stop, toggle, clearError: () => setError(null) }
}
