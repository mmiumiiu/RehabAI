import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../../components/ui.jsx'
import { ArrowLeft, Send, AlertTriangle } from '../../components/icons.jsx'
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

  return (
    <div className="max-w-[720px] h-[calc(100vh-196px)] md:h-[calc(100vh-140px)] flex flex-col">
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary hover:text-teal-700 mb-3">
        <ArrowLeft size={16} /> กลับไปโปรไฟล์
      </Link>

      <div className="card flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-line">
          <Avatar text={initialsOf(therapist.name)} />
          <div className="flex-1">
            <div className="text-[14px] font-semibold text-teal-900">{therapist.name}</div>
            <div className="text-[11.5px] text-ok-fg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3B6D11]" /> ออนไลน์
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 px-5 py-2.5 text-[12px]" style={{ background: '#FDF3D9', color: '#9A6B0A' }}>
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <p>ช่องทางนี้ไม่ใช่สำหรับเหตุฉุกเฉิน นักกายภาพบำบัดจะตอบภายใน 1-2 วันทำการ หากมีเหตุฉุกเฉินให้ใช้ปุ่ม SOS หรือโทร 1669</p>
        </div>

        <div className="flex-1 overflow-auto thin-scroll px-5 py-4 space-y-3 bg-bg/50">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'patient' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[75%]">
                <div
                  className={`px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${
                    m.from === 'patient' ? 'bg-teal-700 text-white rounded-br-sm' : 'bg-white border border-line rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
                <div className={`text-[10.5px] text-ink-muted mt-1 ${m.from === 'patient' ? 'text-right' : ''}`}>{m.at}</div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="flex items-center gap-2 px-4 py-3 border-t border-line">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="พิมพ์ข้อความ…"
            className="flex-1 border border-line rounded-full px-4 py-2.5 text-[14px] outline-none focus:border-teal-700"
          />
          <button type="submit" className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center flex-shrink-0">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
