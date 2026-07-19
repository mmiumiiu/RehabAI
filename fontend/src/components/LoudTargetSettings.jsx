import { useState } from 'react'
import { Card, Field, Select, Button } from './ui.jsx'
import { loudSettings } from '../lib/services.js'

const DB_OPTIONS = Array.from({ length: 15 }, (_, i) => 40 + i * 5) // 40…110
const REPS_OPTIONS = [5, 10, 15, 20, 25, 30]
const SCALE_MIN = 40
const SCALE_MAX = 110
const pct = (v) => Math.max(0, Math.min(100, ((v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100))

function DbField({ label, hint, value, onChange }) {
  return (
    <Field label={label} className="mb-0">
      <Select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {DB_OPTIONS.map((db) => (
          <option key={db} value={db}>{db} dB</option>
        ))}
      </Select>
      <p className="text-[11px] text-ink-muted mt-1.5">{hint}</p>
    </Field>
  )
}

export default function LoudTargetSettings() {
  const saved = loudSettings.get()
  const [min, setMin] = useState(saved?.min ?? 60)
  const [goal, setGoal] = useState(saved?.goal ?? 80)
  const [max, setMax] = useState(saved?.max ?? 95)
  const [reps, setReps] = useState(saved?.reps ?? 10)
  const [isSaved, setIsSaved] = useState(false)

  const invalid = min >= max
  const goalOutOfRange = goal < min || goal > max

  function save() {
    loudSettings.save({ min, goal, max, reps })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <Card className="p-6 mb-7">
      <p className="text-[12.5px] text-ink-secondary leading-relaxed mb-4">
        กำหนดช่วงความดังเสียง (เดซิเบล) และจำนวนครั้งเฉพาะบุคคล ระบบจะใช้ค่านี้แสดงเป็นเป้าหมายในหน้าฝึกจริงของผู้ป่วยแทนค่าเริ่มต้นของระบบ
        ปรับตามเสียงฐาน (baseline) ของผู้ป่วยแต่ละคน
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <DbField label="ค่าต่ำสุด (Min)" hint="ต่ำกว่านี้ถือว่าเบาเกินไป" value={min} onChange={setMin} />
        <DbField label="ค่าเป้าหมาย (Goal)" hint="ระดับที่อยากให้ทำได้" value={goal} onChange={setGoal} />
        <DbField label="ค่าสูงสุด (Max)" hint="ดังเกินนี้เสี่ยงตะโกน" value={max} onChange={setMax} />
        <Field label="จำนวนครั้งต่อเซสชัน" className="mb-0">
          <Select value={reps} onChange={(e) => setReps(Number(e.target.value))}>
            {REPS_OPTIONS.map((r) => (
              <option key={r} value={r}>{r} ครั้ง</option>
            ))}
          </Select>
          <p className="text-[11px] text-ink-muted mt-1.5">กดปุ่มนับครั้งต่อเซสชัน</p>
        </Field>
      </div>

      {/* preview: accepted band */}
      <div className="relative h-2.5 rounded-full bg-bg mt-5 overflow-visible">
        {!invalid && (
          <div
            className="absolute h-full rounded-full bg-coral-100"
            style={{ left: `${pct(min)}%`, width: `${pct(max) - pct(min)}%` }}
          />
        )}
        {!invalid && !goalOutOfRange && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-coral-700 ring-2 ring-white"
            style={{ left: `${pct(goal)}%` }}
          />
        )}
      </div>
      <p className={`text-[11px] mt-2 ${invalid ? 'text-danger' : 'text-ink-muted'}`}>
        {invalid
          ? 'ค่าต่ำสุดต้องน้อยกว่าค่าสูงสุด'
          : `ช่วงที่ยอมรับได้ ${min}-${max} dB · เป้าหมาย ${goal} dB · ${reps} ครั้ง`}
      </p>

      <Button
        variant="primary"
        className="w-auto mt-4"
        disabled={invalid || goalOutOfRange}
        onClick={save}
      >
        {isSaved ? 'บันทึกแล้ว ✓' : 'บันทึกค่าสำหรับผู้ป่วยคนนี้'}
      </Button>
    </Card>
  )
}
