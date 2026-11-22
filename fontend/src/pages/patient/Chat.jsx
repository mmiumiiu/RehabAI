import { useState, useRef, useEffect } from 'react'
import { Avatar } from '../../components/ui.jsx'
import { Send, AlertTriangle } from '../../components/icons.jsx'
import { therapistLink } from '../../lib/services.js'
import { chatService } from '../../lib/chatService.js'

const DEFAULT_THERAPIST = { name: 'ก.พ. ธนกร รักษาดี' }
const initialsOf = (name) => name.replace(/^กภ\.?|^ก\.พ\.?/, '').trim().slice(0, 2)

// Demo: patient is always mapped to thread "p1"
const THREAD_ID = 'p1'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const endRef = useRef(null)
  const therapist = therapistLink.get() || DEFAULT_THERAPIST

  useEffect(() => {
    chatService.join(THREAD_ID, (msg) => setMessages((m) => [...m, msg]))
    return () => chatService.leave()
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    chatService.send(THREAD_ID, 'patient', text.trim())
    setText('')
  }

  // Height = visible screen (corrected for the app zoom) minus the header, page
  // padding and — on mobile — the bottom nav, so the input is always on screen.
  return (
    <div className="max-w-[760px] mx-auto h-[calc(100dvh/var(--app-zoom,1)-185px)] md:h-[calc(100dvh/var(--app-zoom,1)-136px)] min-h-[300px] flex flex-col">
      <div className="card flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3.5 px-5 py-3.5 border-b border-line flex-shrink-0">
          <Avatar text={initialsOf(therapist.name)} size={44} />
          <div className="flex-1">
            <div className="text-[18px] font-semibold text-ink-primary">{therapist.name}</div>
            <div className="text-[14px] text-ok-fg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#147A3D]" /> ออนไลน์
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 px-5 py-2 text-[14px] leading-snug flex-shrink-0" style={{ background: '#FFF7D6', color: '#8A6400' }}>
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <p>ไม่ใช่ช่องทางฉุกเฉิน · นักกายภาพตอบภายใน 1–2 วันทำการ · ฉุกเฉินกด SOS หรือโทร 1669</p>
        </div>

        <div className="flex-1 min-h-0 overflow-auto thin-scroll px-5 py-4 space-y-3.5 bg-bg/50">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'patient' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%]">
                <div
                  className={`px-4 py-3 rounded-2xl text-[18px] leading-relaxed ${
                    m.from === 'patient' ? 'bg-teal-700 text-white rounded-br-sm' : 'bg-white border border-line rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
                <div className={`text-[13px] text-ink-muted mt-1 ${m.from === 'patient' ? 'text-right' : ''}`}>{m.at}</div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="flex items-center gap-2.5 px-4 py-3 border-t border-line bg-surface flex-shrink-0">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="พิมพ์ข้อความ…"
            className="flex-1 min-w-0 border-2 border-line rounded-full px-5 py-3 text-[18px] outline-none focus:border-teal-700"
          />
          <button type="submit" aria-label="ส่งข้อความ" className="w-[52px] h-[52px] rounded-full bg-teal-700 text-white flex items-center justify-center flex-shrink-0">
            <Send size={22} />
          </button>
        </form>
      </div>
    </div>
  )
}
