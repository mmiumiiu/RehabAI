import { useState } from 'react'
import { useLoudScorer } from '../../lib/useLoudScorer.js'
import { Button, Input, Field, SectionTitle } from '../../components/ui.jsx'
import { Mic } from '../../components/icons.jsx'

// LSVT LOUD test page — measures loudness (dB) and word accuracy on the SAME
// 0–100 scale, then combines them equally. Lets you tweak the therapist band
// (min · good_min–good_max · max) and target word (e.g. "สวัสดี") live. Recording,
// speech recognition and scoring are shared with the real session via
// useLoudScorer; the backend /lsvt/score endpoint is the scoring authority.

export default function LsvtLoudTest() {
  // Therapist-defined band + target word (defaults match the brief).
  const [band, setBand] = useState({ min: 65, good_min: 70, good_max: 85, max: 90 })
  const [target, setTarget] = useState('สวัสดี')

  const { db, micStatus: status, recording, transcript, result, error, start, stop } =
    useLoudScorer({ band, target })

  function setBandField(key, value) {
    setBand((b) => ({ ...b, [key]: Number(value) }))
  }

  const startRecording = start
  const stopRecording = stop

  // Live dB meter geometry, matching SessionLoud's 40–90 display scale.
  const pct = Math.max(0, Math.min(100, ((db - 40) / (90 - 40)) * 100))
  const bandLeft = ((band.good_min - 40) / (90 - 40)) * 100
  const bandWidth = ((band.good_max - band.good_min) / (90 - 40)) * 100

  return (
    <div className="max-w-[760px] mx-auto p-4 md:p-6">
      <p className="text-[13px] text-teal-700 font-semibold uppercase tracking-wide mb-1">
        ทดสอบระบบ · LSVT LOUD
      </p>
      <h1 className="font-heading text-[24px] font-semibold text-ink-primary mb-2">
        ตรวจจับความดังเสียง (dB) และความถูกต้องของคำ
      </h1>
      <p className="text-[13px] text-ink-secondary mb-6">
        พูดคำเป้าหมายให้ดังและชัด ระบบให้คะแนน 2 ด้านในสเกลเดียวกัน (0–100) แล้วรวมแบบถ่วงน้ำหนักเท่ากัน
      </p>

      {error && <div className="card px-4 py-3 mb-5 text-[13px] text-danger">{error}</div>}

      {/* ── Therapist settings ── */}
      <SectionTitle>ค่าที่นักกายภาพกำหนด</SectionTitle>
      <div className="card px-5 py-4 mb-6">
        <Field label="คำเป้าหมาย (Target word)">
          <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="เช่น สวัสดี" />
        </Field>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <Field label="Min (dB)">
            <Input type="number" value={band.min} onChange={(e) => setBandField('min', e.target.value)} />
          </Field>
          <Field label="ดี-ต่ำ (dB)">
            <Input type="number" value={band.good_min} onChange={(e) => setBandField('good_min', e.target.value)} />
          </Field>
          <Field label="ดี-สูง (dB)">
            <Input type="number" value={band.good_max} onChange={(e) => setBandField('good_max', e.target.value)} />
          </Field>
          <Field label="Max (dB)">
            <Input type="number" value={band.max} onChange={(e) => setBandField('max', e.target.value)} />
          </Field>
        </div>
      </div>

      {/* ── Live mic + record ── */}
      <SectionTitle>วัดเสียง</SectionTitle>
      <div className="card px-5 py-5 mb-6">
        {/* dB meter with the "good" band highlighted */}
        <div className="mb-4">
          <div className="flex justify-between text-[12px] text-ink-secondary mb-1">
            <span>ระดับเสียงตอนนี้</span>
            <span className="font-semibold text-teal-800">{db} dB</span>
          </div>
          <div className="relative h-3 bg-line rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-teal-100"
              style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }}
            />
            <div
              className="h-full rounded-full relative"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#1B9C4C,#29B85E)', transition: 'width 0.1s' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-ink-muted mt-1">
            <span>เบา (40)</span>
            <span>ช่วงดี {band.good_min}–{band.good_max}</span>
            <span>ดัง (90)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!recording ? (
            <Button onClick={startRecording} className="!w-auto px-5">
              <Mic size={16} /> เริ่มพูด
            </Button>
          ) : (
            <Button variant="outline" onClick={stopRecording} className="!w-auto px-5">
              หยุด
            </Button>
          )}
          {recording && (
            <span className="flex items-center gap-2 text-[13px] text-teal-700">
              <span className="rec-pulse w-2.5 h-2.5 rounded-full bg-danger" /> กำลังฟัง…
            </span>
          )}
          {status === 'calibrating' && (
            <span className="text-[12px] text-ink-muted">กำลังวัดเสียงพื้นหลัง…</span>
          )}
          {status === 'denied' && (
            <span className="text-[12px] text-danger">กรุณาอนุญาตไมโครโฟน</span>
          )}
        </div>

        {transcript && (
          <p className="text-[13px] text-ink-secondary mt-3">
            ได้ยินว่า: <span className="font-semibold text-ink-primary">“{transcript}”</span>
          </p>
        )}
      </div>

      {/* ── Result ── */}
      {result && (
        <>
          <SectionTitle>ผลการประเมิน</SectionTitle>
          <div className="card px-5 py-5">
            <ScoreRow
              label="ความถูกต้องของระดับเสียง"
              percent={result.db.score}
              detail={`${verdictTh(result.db.verdict)} · วัดได้สูงสุด ${result.measured_db} dB`}
            />
            <ScoreRow
              label="ความถูกต้องของคำพูด"
              percent={result.word.score}
              detail={`ตรงกับ “${target}” ${Math.round(result.word.similarity * 100)}% · ${result.word.verdict === 'correct' ? 'ถูกต้อง' : 'ยังไม่ตรง'}`}
            />

            <p className="text-[12px] mt-4" style={{ color: result.passed ? '#1B9C4C' : '#D94A1D' }}>
              {result.passed
                ? 'ผ่านทั้งสองส่วน (เกิน 80%) — นับ 1 ครั้ง 🎉'
                : 'ยังไม่นับ — ต้องได้เกิน 80% ทั้งความดังเสียงและคำพูด'}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

// A part passes (shows green) when it reaches 80%.
function ScoreRow({ label, percent, detail }) {
  const passed = percent >= 80
  return (
    <div className="py-2 border-t border-line first:border-t-0">
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-ink-primary">{label}</span>
        <span className="font-heading text-[20px] font-semibold" style={{ color: passed ? '#1B9C4C' : '#D94A1D' }}>
          {percent}%
        </span>
      </div>
      <div className="h-2 bg-line rounded-full overflow-hidden mt-1.5">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percent}%`, background: passed ? 'linear-gradient(90deg,#1B9C4C,#29B85E)' : '#FF8452' }}
        />
      </div>
      <p className="text-[11.5px] text-ink-muted mt-1">{detail}</p>
    </div>
  )
}

function verdictTh(v) {
  return {
    good: 'อยู่ในช่วงดี',
    soft_ok: 'เบาแต่รับได้',
    loud_ok: 'ดังแต่รับได้',
    too_soft: 'เบาเกินไป',
    too_loud: 'ดังเกินไป',
  }[v] || v
}
