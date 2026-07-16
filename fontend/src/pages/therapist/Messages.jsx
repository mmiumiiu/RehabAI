import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Button } from '../../components/ui.jsx'
import { Send, AlertTriangle, Chart } from '../../components/icons.jsx'
import { PATIENTS, CHAT_SEED } from '../../lib/mockData.js'

export default function Messages() {
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState(PATIENTS[0].id)
  const [threads, setThreads] = useState(() =>
    Object.fromEntries(PATIENTS.map((p, i) => [p.id, i === 0 ? CHAT_SEED : []])),
  )
  const [text, setText] = useState('')
  const endRef = useRef(null)
  const active = PATIENTS.find((p) => p.id === activeId)
  const messages = threads[activeId] || []

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    setThreads((t) => ({ ...t, [activeId]: [...(t[activeId] || []), { id: Date.now(), from: 'therapist', text: text.trim(), at: 'ตอนนี้' }] }))
    setText('')
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="px-8 py-5 border-b border-line bg-surface">
        <h1 className="font-heading text-[20px] font-semibold text-teal-900">ข้อความ</h1>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* conversation list */}
        <div className="w-[280px] border-r border-line overflow-auto thin-scroll bg-surface">
          {PATIENTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-line text-left transition-colors ${activeId === p.id ? 'bg-teal-100/60' : 'hover:bg-bg'}`}
            >
              <Avatar text={p.initials} />
              <div className="min-w-0">
                <div className="text-[13.5px] font-medium truncate">{p.name}</div>
                <div className="text-[11.5px] text-ink-muted truncate">
                  {(threads[p.id]?.slice(-1)[0]?.text) || 'ยังไม่มีข้อความ'}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* chat window */}
        <div className="flex-1 flex flex-col min-w-0 bg-bg/40">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-line bg-surface">
            <Avatar text={active.initials} />
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-teal-900">{active.name}</div>
              <div className="text-[11.5px] text-ink-muted">ฝึกล่าสุด {active.lastActive}</div>
            </div>
            <Button variant="outline" className="w-auto py-2" onClick={() => navigate(`/therapist/patients/${active.id}`)}>
              <Chart size={16} /> ดูความคืบหน้า
            </Button>
          </div>

          <div className="flex items-start gap-2 px-5 py-2.5 text-[12px]" style={{ background: '#FDF3D9', color: '#9A6B0A' }}>
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <p>ช่องทางนี้ไม่ใช่สำหรับเหตุฉุกเฉิน ระบบจะแจ้งเตือนให้ตอบภายใน 1-2 วันทำการ</p>
          </div>

          <div className="flex-1 overflow-auto thin-scroll px-5 py-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'therapist' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[70%]">
                  <div className={`px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${m.from === 'therapist' ? 'bg-teal-700 text-white rounded-br-sm' : 'bg-white border border-line rounded-bl-sm'}`}>
                    {m.text}
                  </div>
                  <div className={`text-[10.5px] text-ink-muted mt-1 ${m.from === 'therapist' ? 'text-right' : ''}`}>{m.at}</div>
                </div>
              </div>
            ))}
            {messages.length === 0 && <p className="text-[13px] text-ink-muted text-center py-10">เริ่มการสนทนากับ {active.name}</p>}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex items-center gap-2 px-4 py-3 border-t border-line bg-surface">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="พิมพ์ข้อความ…" className="flex-1 border border-line rounded-full px-4 py-2.5 text-[14px] outline-none focus:border-teal-700" />
            <button type="submit" className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center flex-shrink-0"><Send size={18} /></button>
          </form>
        </div>
      </div>
    </div>
  )
}
