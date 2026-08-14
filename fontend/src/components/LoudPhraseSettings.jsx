import { useState } from 'react'
import { Card, Button } from './ui.jsx'
import { loudPhrases } from '../lib/services.js'

// Therapist-side manager for the LSVT LOUD daily-life phrases (spec / mockup
// therapist_loud_settings_6.html). Add/remove phrases and save; the patient's
// "ประโยคในชีวิตประจำวัน" training group is built from this list.
export default function LoudPhraseSettings() {
  const [phrases, setPhrases] = useState(() => loudPhrases.get())
  const [text, setText] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  function add() {
    const v = text.trim()
    if (!v) return
    setPhrases((p) => [...p, v])
    setText('')
    setIsSaved(false)
  }

  function remove(i) {
    setPhrases((p) => p.filter((_, idx) => idx !== i))
    setIsSaved(false)
  }

  function save() {
    loudPhrases.save(phrases)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 1500)
  }

  return (
    <Card className="p-6 mb-7">
      <h3 className="font-heading text-[16px] font-semibold text-teal-900 mb-1">คำพูดในชีวิตประจำวัน</h3>
      <p className="text-[12.5px] text-ink-secondary leading-relaxed mb-4">
        ใช้ในหมวด “ประโยคในชีวิตประจำวัน” ของ LSVT LOUD — เพิ่ม/ลบประโยคที่ผู้ป่วยจะฝึกพูดให้ดังและชัด
        เลือกประโยคที่ผู้ป่วยใช้บ่อยจริงเพื่อให้ฝึกแล้วนำไปใช้ได้จริง
      </p>

      <div className="flex gap-2.5 mb-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add() }}
          placeholder="พิมพ์ประโยคใหม่ เช่น ช่วยหยิบแว่นให้หน่อยครับ…"
          className="flex-1 border border-line rounded-[10px] px-4 py-2.5 text-[14px] outline-none focus:border-coral-700"
        />
        <Button variant="outlineCoral" onClick={add} className="!w-auto px-5">
          + เพิ่ม
        </Button>
      </div>

      <div className="space-y-2">
        {phrases.length === 0 ? (
          <p className="text-center text-ink-muted text-[12.5px] py-4">
            ยังไม่มีประโยคที่เพิ่มไว้ — เพิ่มประโยคแรกด้านบนได้เลย
          </p>
        ) : (
          phrases.map((p, i) => (
            <div key={i} className="flex items-center gap-3 bg-bg border border-line rounded-[10px] px-4 py-2.5">
              <span className="flex-1 text-[13.5px]">{p}</span>
              <button
                onClick={() => remove(i)}
                title="ลบประโยคนี้"
                className="text-ink-muted hover:text-danger text-[16px] leading-none px-1.5 py-0.5 rounded"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <p className="text-[11.5px] text-ink-muted mt-3">ทั้งหมด {phrases.length} ประโยค</p>

      <Button variant="primary" className="w-auto mt-4" onClick={save}>
        {isSaved ? 'บันทึกแล้ว ✓' : 'บันทึกประโยคสำหรับผู้ป่วยคนนี้'}
      </Button>
    </Card>
  )
}
