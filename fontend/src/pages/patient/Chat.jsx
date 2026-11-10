import { useState, useRef, useEffect } from 'react'
import { AlertTriangle, Mic, Send } from '../../components/icons.jsx'
import { therapistLink } from '../../lib/services.js'
import { chatService } from '../../lib/chatService.js'

// "แชทกับนักกายภาพ" — the "#chat" section of design/bridge-mockup.html.
// Mockup px ÷ 1.4 (the patient portal body zoom).

const DEFAULT_THERAPIST = { name: 'กภ. ธนกร รักษาดี' }
const initialsOf = (name) => name.replace(/^กภ\.?/, '').trim().slice(0, 2)

const QUICK_REPLIES = ['ขอบคุณครับ', 'วันนี้ปวดนิดหน่อย', 'ทำได้ไม่ครบ', 'ขอนัดคุย']

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
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-b-label font-semibold text-ink-secondary m-0 mb-1">ปรึกษาเรื่องการฝึก</p>
        <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">แชทกับนักกายภาพ</h1>
      </header>

      {/* Not-an-emergency notice */}
      <div
        className="flex gap-4 items-start px-5 py-4 rounded-btn border-2"
        style={{ background: '#FFF1C7', borderColor: '#E6CF86', color: '#6B4A00' }}
      >
        <AlertTriangle size={24} className="flex-shrink-0" />
        <p className="text-b-label font-semibold leading-[1.6] m-0">
          แชทนี้ไม่ใช่ช่องทางฉุกเฉิน นักกายภาพจะตอบภายใน 1-2 วันทำการ ถ้าฉุกเฉินกดปุ่มสีแดงหรือโทร 1669
        </p>
      </div>

      <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card overflow-hidden flex flex-col">
        {/* Therapist header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b-2" style={{ borderColor: '#E6F1F7' }}>
          <span
            className="w-[51px] h-[51px] rounded-full flex items-center justify-center text-b-base font-bold flex-shrink-0"
            style={{ background: '#EEE8FA', color: '#4B2A86' }}
          >
            {initialsOf(therapist.name)}
          </span>
          <div>
            <div className="text-b-h3 font-bold">{therapist.name}</div>
            <div className="text-b-sm text-ink-secondary">
              นักกายภาพของคุณ{therapist.hospital ? ` · ${therapist.hospital}` : ''}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="px-6 py-6 flex flex-col gap-4 bg-bg min-h-[300px] max-h-[46vh] overflow-auto thin-scroll">
          {messages.length === 0 && (
            <p className="text-b-base text-ink-secondary text-center m-0 py-6">
              ยังไม่มีข้อความ — ทักทายนักกายภาพของคุณได้เลย
            </p>
          )}
          {messages.map((m) => {
            const mine = m.from === 'patient'
            return (
              <div
                key={m.id}
                className="max-w-[78%] px-5 py-3.5 text-b-base leading-[1.6]"
                style={mine
                  ? { alignSelf: 'flex-end', background: '#157AB5', color: '#FFFFFF', borderRadius: 20, borderBottomRightRadius: 6 }
                  : { alignSelf: 'flex-start', background: '#FFFFFF', border: '2px solid #CDE3EE', borderRadius: 20, borderBottomLeftRadius: 6 }}
              >
                {m.text}
                <span
                  className="block text-b-xs mt-1"
                  style={{ color: mine ? 'rgba(255,255,255,0.75)' : '#6C8699', textAlign: mine ? 'right' : 'left' }}
                >
                  {m.at}
                </span>
              </div>
            )
          })}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        <div className="px-6 py-4 border-t-2 flex flex-col gap-4" style={{ borderColor: '#E6F1F7' }}>
          <div className="flex flex-wrap gap-3">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setText(q)}
                className="min-h-[46px] px-5 rounded-pill border-[3px] border-teal-700 bg-surface text-teal-700 text-b-base font-bold hover:bg-teal-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={send} className="flex gap-3.5 items-center flex-wrap">
            <label className="sr-only" htmlFor="chatmsg">พิมพ์ข้อความ</label>
            <input
              id="chatmsg"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="พิมพ์ข้อความถึงนักกายภาพ"
              className="flex-[1_1_260px] min-h-[57px] px-5 rounded-field border-[3px] border-line bg-surface text-b-base font-body text-ink-primary outline-none focus:border-teal-700 transition-colors"
            />
            <button
              type="button"
              className="flex items-center justify-center gap-3 min-h-[57px] px-5 rounded-btn border-[3px] border-line bg-surface text-b-base font-bold hover:bg-teal-50 transition-colors"
            >
              <Mic size={20} /> พูดแทนพิมพ์
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex items-center justify-center gap-3 min-h-[57px] px-6 rounded-btn bg-teal-700 border-[3px] border-teal-700 text-white text-b-btn font-bold disabled:opacity-50 hover:bg-teal-800 hover:border-teal-800 transition-colors"
            >
              <Send size={20} /> ส่ง
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
