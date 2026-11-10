import { useState } from 'react'
import { Button, StatCard } from '../../components/ui.jsx'
import { Search, Chat, Users, Activity, AlertTriangle } from '../../components/icons.jsx'
import { PATIENTS, PARKINSON_STAGES } from '../../lib/mockData.js'
import { useAuth } from '../../context/AuthContext.jsx'

// "ผู้ป่วยของฉัน" — the "#therapistpatients" section of design/bridge-mockup.html.
// Sizes are the mockup px ÷ 1.4; the therapist portal runs at body zoom 1.3
// (App.jsx), so everything renders a touch smaller than the mockup.

const stageShort = (s) => PARKINSON_STAGES.find((x) => x.value === s)?.short || s

// One metric column inside a patient row.
function Metric({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-b-h3 font-bold leading-[1.2]">{value}</div>
      <div className="text-b-xs text-ink-secondary">{label}</div>
    </div>
  )
}

export default function Patients() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  const list = PATIENTS.filter((p) => p.name.includes(query))
  const trainedThisWeek = PATIENTS.filter((p) => p.weekCount > 0).length
  const inactive = PATIENTS.filter((p) => p.daysSince >= 3).length

  return (
    <div className="max-w-[1100px] mx-auto w-full px-4 md:px-9 py-6 md:py-8 flex flex-col gap-6">
      <header>
        <p className="text-b-label font-semibold text-ink-secondary m-0 mb-1">{user?.name || 'นักกายภาพบำบัด'}</p>
        <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">ผู้ป่วยของฉัน</h1>
      </header>

      {/* Three summary cards */}
      <div className="flex flex-wrap gap-4">
        <StatCard icon={Users} value={`${PATIENTS.length} คน`} label="ผู้ป่วยที่ดูแล" />
        <StatCard icon={Activity} value={`${trainedThisWeek} คน`} label="ฝึกในสัปดาห์นี้" rule="#24661A" tint="#E3F1DC" />
        <StatCard icon={AlertTriangle} value={`${inactive} คน`} label="ไม่ได้ฝึกเกิน 3 วัน" rule="#6D3FC0" tint="#EEE8FA" />
      </div>

      {/* Search */}
      <div className="flex items-center gap-3.5 min-h-[57px] px-5 rounded-btn border-[3px] border-line bg-surface focus-within:border-teal-700 transition-colors">
        <Search size={22} className="text-ink-secondary flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาผู้ป่วย"
          className="flex-1 border-0 outline-none bg-transparent text-b-base font-body text-ink-primary"
        />
      </div>

      {/* Patient rows */}
      <div className="flex flex-col gap-4">
        {list.map((p) => (
          <div
            key={p.id}
            className="bg-surface rounded-card border-[1.5px] border-line shadow-card px-6 py-5 flex flex-wrap items-center gap-6"
          >
            <span className="w-[51px] h-[51px] rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-b-base font-bold flex-shrink-0">
              {p.initials}
            </span>

            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-b-h3 font-bold">{p.name}</span>
                {p.daysSince >= 3 && (
                  <span
                    className="inline-flex items-center gap-1.5 text-b-sm font-bold px-3.5 py-1 rounded-pill"
                    style={{ background: '#FBE3E0', color: '#B3261E' }}
                  >
                    <AlertTriangle size={17} /> ไม่ได้ฝึก {p.daysSince} วัน
                  </span>
                )}
              </div>
              <div className="text-b-sm text-ink-secondary">
                {stageShort(p.stage)} · ฝึกล่าสุด {p.lastActive}
              </div>
            </div>

            <div className="flex gap-6">
              <Metric value={p.streak} label="วันติดต่อกัน" />
              <Metric value={p.lastScore} label="คะแนนล่าสุด" />
              <Metric value={`${p.weekCount}/7`} label="สัปดาห์นี้" />
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button variant="blue" to={`/therapist/patients/${p.id}`} className="min-h-[51px]">
                ดูรายละเอียด
              </Button>
              <Button variant="outline" to="/therapist/messages" className="min-h-[51px]">
                <Chat size={20} /> แชท
              </Button>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <p className="text-b-base text-ink-secondary text-center py-8 m-0">ไม่พบผู้ป่วยที่ตรงกับคำค้นหา</p>
        )}
      </div>
    </div>
  )
}
