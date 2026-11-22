import { useState } from 'react'
import GardenPlot from './GardenPlot.jsx'
import { Card, Button } from './ui.jsx'
import { Send } from './icons.jsx'
import { cheers } from '../lib/services.js'
import { useCheers, useSharedGarden, timeAgo } from '../lib/useCheers.js'
import { DEMO_PATIENT_ID, THERAPIST_CHEERS, gardenLevelOf } from '../lib/mockData.js'
import { useAuth } from '../context/AuthContext.jsx'

// Therapist's view of a patient's garden + a box to send encouragement. Cheers
// land in the patient's "กล่องให้กำลังใจ" (Garden page) and on their home page.
// The demo patient (DEMO_PATIENT_ID) shows their real garden as published by
// the patient app; other patients use their mock tree count.
export default function TherapistGardenCheer({ patient }) {
  const { user } = useAuth()
  const shared = useSharedGarden(patient.id)
  const sent = useCheers(patient.id)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [justSent, setJustSent] = useState(false)

  const live = patient.id === DEMO_PATIENT_ID && shared
  const trees = live ? shared.trees : patient.gardenTrees ?? 0
  const level = gardenLevelOf(trees)
  const streak = live ? shared.streak : patient.streak
  const week = live ? shared.week : patient.weekCount

  async function send(message) {
    setError('')
    setSending(true)
    try {
      await cheers.send(patient.id, { text: message, from: user?.name || 'นักกายภาพบำบัด' })
      setText('')
      setJustSent(true)
      setTimeout(() => setJustSent(false), 2500)
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-[18px] mb-7">
      <Card className="p-0 overflow-hidden">
        <div style={{ background: 'linear-gradient(180deg, #BFE9F6 0%, #9BD67A 60%)' }}>
          <GardenPlot level={level.level} trees={trees} seed={99} className="w-full h-auto" title={`สวนของ${patient.name}`} />
        </div>
        <div className="p-5">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <div className="font-heading text-[18px] font-semibold text-ink-primary">
              {trees === 0 ? 'ยังไม่มีต้นไม้' : `ระดับ ${level.level} · ${level.name}`}
            </div>
            <div className="text-[14px] font-bold text-teal-800">{trees} ต้น</div>
          </div>
          <div className="text-[13px] text-ink-secondary mt-1.5">
            ฝึกติดต่อกัน {streak} วัน · สัปดาห์นี้ {week}/7 วัน
            {live && shared.todayDone && <span className="text-teal-800 font-semibold"> · วันนี้ฝึกแล้ว ✓</span>}
          </div>
          {live && (
            <div className="flex items-center gap-1.5 text-[11.5px] text-ink-muted mt-2">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" /> ข้อมูลจริงจากแอปผู้ป่วย
            </div>
          )}
        </div>
      </Card>

      <Card className="p-5 flex flex-col gap-3">
        <div className="font-heading text-[18px] font-semibold text-ink-primary">ส่งกำลังใจให้ผู้ป่วย</div>
        <p className="text-[13px] text-ink-secondary m-0">ข้อความจะไปขึ้นที่หน้าแรกและกล่องให้กำลังใจในสวนของผู้ป่วย</p>

        <div className="flex flex-wrap gap-2">
          {THERAPIST_CHEERS.map((m) => (
            <button
              key={m}
              type="button"
              disabled={sending}
              onClick={() => send(m)}
              className="text-[13px] font-semibold px-3.5 py-2 rounded-pill bg-teal-100 text-teal-900 hover:bg-teal-200 transition-colors disabled:opacity-50"
            >
              {m}
            </button>
          ))}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => { e.preventDefault(); send(text) }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={300}
            placeholder="หรือเขียนข้อความเอง…"
            className="flex-1 min-w-0 border border-line rounded-btn px-3.5 py-2.5 text-[14px] outline-none focus:border-teal-700"
          />
          <Button type="submit" disabled={sending || !text.trim()} className="w-auto">
            <Send size={15} /> ส่ง
          </Button>
        </form>
        {justSent && <div className="text-[13px] font-semibold text-teal-800">ส่งกำลังใจแล้ว ✓</div>}
        {error && <div className="text-[13px] font-semibold text-danger">{error}</div>}

        {sent.length > 0 && (
          <div className="border-t border-line pt-3 mt-1">
            <div className="text-[12px] font-semibold text-ink-muted mb-2">ส่งไปแล้ว</div>
            <div className="flex flex-col gap-2 max-h-[180px] overflow-auto">
              {sent.slice(0, 10).map((c) => (
                <div key={c.id} className="text-[13.5px] flex justify-between gap-3">
                  <span className="text-ink-primary">“{c.text}”</span>
                  <span className="text-ink-muted flex-shrink-0 text-[12px]">{timeAgo(c.ts)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
