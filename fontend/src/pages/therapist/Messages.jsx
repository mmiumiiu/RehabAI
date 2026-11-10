import { useState, useRef, useEffect } from 'react'
import { Button } from '../../components/ui.jsx'
import { Send, AlertTriangle, Chart, ArrowLeft } from '../../components/icons.jsx'
import { PATIENTS, PARKINSON_STAGES } from '../../lib/mockData.js'
import { chatService } from '../../lib/chatService.js'

// "ข้อความจากผู้ป่วย" — the "#therapistchat" section of the mockup: a thread
// list beside the conversation, inside one card. Mockup px ÷ 1.4.

const stageShort = (s) => PARKINSON_STAGES.find((x) => x.value === s)?.short || s

export default function Messages() {
  const [activeId, setActiveId] = useState(PATIENTS[0].id)
  const [threads, setThreads] = useState(() => Object.fromEntries(PATIENTS.map((p) => [p.id, []])))
  const [text, setText] = useState('')
  const [showChat, setShowChat] = useState(false) // mobile: toggle list vs chat
  const endRef = useRef(null)
  const active = PATIENTS.find((p) => p.id === activeId)
  const messages = threads[activeId] || []

  useEffect(() => {
    chatService.join(activeId, (msg) => {
      setThreads((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), msg] }))
    })
    return () => chatService.leave()
  }, [activeId])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function selectPatient(id) {
    setText('')
    setActiveId(id)
    setShowChat(true)
  }

  function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    chatService.send(activeId, 'therapist', text.trim())
    setText('')
  }

  return (
    <div className="max-w-[1100px] mx-auto w-full px-4 md:px-9 py-6 md:py-8 flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">ข้อความจากผู้ป่วย</h1>
      </header>

      <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card overflow-hidden flex flex-wrap">
        {/* Thread list */}
        <div
          className={`${showChat ? 'hidden' : 'block'} md:block flex-[1_1_240px] md:max-w-[270px] w-full md:border-r-2`}
          style={{ borderColor: '#E6F1F7' }}
        >
          {PATIENTS.map((p) => {
            const on = activeId === p.id
            const last = threads[p.id]?.slice(-1)[0]
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => selectPatient(p.id)}
                className="w-full flex items-center gap-4 px-5 py-4 border-b-2 text-left transition-colors"
                style={{ borderColor: '#E6F1F7', background: on ? '#E0F1FA' : '#FFFFFF' }}
              >
                <span className="w-[43px] h-[43px] rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-b-sm font-bold flex-shrink-0">
                  {p.initials}
                </span>
                <span className="min-w-0">
                  <span className="block text-b-base font-bold truncate">{p.name}</span>
                  <span className="block text-b-sm text-ink-secondary truncate">
                    {last ? `${last.from === 'therapist' ? 'คุณ: ' : ''}${last.text}` : 'ยังไม่มีข้อความ'}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Conversation */}
        <div className={`${showChat ? 'flex' : 'hidden'} md:flex flex-[3_1_380px] min-w-0 flex-col`}>
          {/* Conversation header */}
          <div
            className="flex items-center justify-between gap-4 px-6 py-4 border-b-2 flex-wrap"
            style={{ borderColor: '#E6F1F7' }}
          >
            <div className="flex items-center gap-4">
              <button className="md:hidden text-ink-secondary" onClick={() => setShowChat(false)} aria-label="กลับไปรายชื่อ">
                <ArrowLeft size={22} />
              </button>
              <span className="w-[46px] h-[46px] rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-b-base font-bold flex-shrink-0">
                {active.initials}
              </span>
              <div>
                <div className="text-b-btn font-bold">{active.name}</div>
                <div className="text-b-sm text-ink-secondary">{stageShort(active.stage)}</div>
              </div>
            </div>
            <Button variant="outline" to={`/therapist/patients/${active.id}`} className="min-h-[48px]">
              <Chart size={20} /> ดูความคืบหน้า
            </Button>
          </div>

          {/* Not-an-emergency notice */}
          <div
            className="flex items-start gap-3 px-6 py-3"
            style={{ background: '#FFF1C7', color: '#6B4A00' }}
          >
            <AlertTriangle size={20} className="flex-shrink-0" />
            <p className="text-b-sm font-semibold leading-[1.5] m-0">
              ช่องทางนี้ไม่ใช่สำหรับเหตุฉุกเฉิน ระบบจะแจ้งเตือนให้ตอบภายใน 1-2 วันทำการ
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 px-6 py-6 flex flex-col gap-4 bg-bg min-h-[280px] max-h-[44vh] overflow-auto thin-scroll">
            {messages.length === 0 && (
              <p className="text-b-base text-ink-secondary text-center m-0 py-8">
                เริ่มการสนทนากับ {active.name}
              </p>
            )}
            {messages.map((m) => {
              const mine = m.from === 'therapist'
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
          <form onSubmit={send} className="px-6 py-4 border-t-2 flex gap-3.5 flex-wrap" style={{ borderColor: '#E6F1F7' }}>
            <label className="sr-only" htmlFor="therapistmsg">พิมพ์ข้อความ</label>
            <input
              id="therapistmsg"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="พิมพ์ข้อความถึงผู้ป่วย"
              className="flex-[1_1_220px] min-h-[54px] px-5 rounded-field border-[3px] border-line bg-surface text-b-base font-body text-ink-primary outline-none focus:border-teal-700 transition-colors"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex items-center justify-center gap-3 min-h-[54px] px-6 rounded-btn bg-teal-700 border-[3px] border-teal-700 text-white text-b-btn font-bold disabled:opacity-50 hover:bg-teal-800 hover:border-teal-800 transition-colors"
            >
              <Send size={20} /> ส่ง
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
