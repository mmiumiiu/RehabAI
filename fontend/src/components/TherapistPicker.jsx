import { useEffect, useMemo, useState } from 'react'
import { Select } from './ui.jsx'
import { MapPin, Hospital, Users, Check } from './icons.jsx'
import { REGIONS, REGION_HOSPITALS, therapistsForHospital } from '../lib/mockData.js'

// Tap-only cascading selector: ภาค → โรงพยาบาล → นักกายภาพบำบัด (spec §3.3).
// Every step is a native <select> (no free typing) and each level's options are
// derived in real time from the level above. Selecting a therapist reports the
// full link object up via onSelect and shows the green auto-connect confirmation.
export default function TherapistPicker({ onSelect }) {
  const [region, setRegion] = useState(REGIONS[0])
  const hospitals = REGION_HOSPITALS[region] || []
  const [hospital, setHospital] = useState(hospitals[0] || '')
  const therapists = useMemo(() => therapistsForHospital(hospital), [hospital])
  const [tIndex, setTIndex] = useState(0)

  // When region changes, snap hospital back to the first in the new region.
  useEffect(() => {
    setHospital((REGION_HOSPITALS[region] || [])[0] || '')
  }, [region])

  // When hospital changes, snap therapist selection back to the first.
  useEffect(() => {
    setTIndex(0)
  }, [hospital])

  const selected = therapists[tIndex]

  // Bubble the current selection up whenever it settles.
  useEffect(() => {
    if (selected && hospital) {
      onSelect?.({ name: selected.name, pos: selected.pos, hospital, region })
    }
  }, [selected, hospital, region]) // eslint-disable-line react-hooks/exhaustive-deps

  const step = (num, done, title, control, hint) => (
    <div className="mb-5">
      <div className="flex items-center gap-2.5 mb-2">
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold ${
            done ? 'bg-ok-bg text-ok-fg' : 'bg-teal-100 text-teal-900'
          }`}
        >
          {done ? <Check size={14} /> : num}
        </span>
        <span className="text-[14px] font-heading font-medium text-teal-900">{title}</span>
      </div>
      {control}
      {hint && <p className="text-[11.5px] text-ink-muted mt-1.5">{hint}</p>}
    </div>
  )

  return (
    <div>
      {step(
        1,
        true,
        'เลือกภาค',
        <Select icon={MapPin} value={region} onChange={(e) => setRegion(e.target.value)}>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>,
      )}

      {step(
        2,
        true,
        'เลือกโรงพยาบาล',
        <Select icon={Hospital} value={hospital} onChange={(e) => setHospital(e.target.value)}>
          {hospitals.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </Select>,
      )}

      {step(
        3,
        false,
        'เลือกนักกายภาพบำบัด',
        <Select icon={Users} value={tIndex} onChange={(e) => setTIndex(Number(e.target.value))}>
          {therapists.map((t, i) => (
            <option key={t.name} value={i}>{t.name} — {t.pos}</option>
          ))}
        </Select>,
        'รายชื่อดึงจากนักกายภาพบำบัดที่สมัครและผ่านการยืนยันแล้วของโรงพยาบาลนี้เท่านั้น',
      )}

      {selected && (
        <div className="flex items-start gap-2.5 rounded-btn p-4 mt-1" style={{ background: '#E6F0E1' }}>
          <span className="text-ok-fg flex-shrink-0 mt-0.5"><Check size={16} /></span>
          <p className="text-[12.5px] leading-relaxed" style={{ color: '#3B6D11' }}>
            <strong>เชื่อมต่อกับ {selected.name} เรียบร้อยแล้ว</strong> — เนื่องจากคุณเลือกนักกายภาพบำบัดที่มีตัวตนยืนยันแล้วในระบบ
            (สังกัด{hospital}) ระบบจึงเชื่อมต่อบัญชีให้ทันที ไม่ต้องรออนุมัติ
          </p>
        </div>
      )}
    </div>
  )
}
