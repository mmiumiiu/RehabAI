import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import MetricRow from '../../components/MetricRow.jsx'
import FrequencyChart from '../../components/FrequencyChart.jsx'
import LoudTargetSettings from '../../components/LoudTargetSettings.jsx'
import { Card, Button, Badge, ProgressBar, SectionTitle } from '../../components/ui.jsx'
import { ArrowLeft, Chat } from '../../components/icons.jsx'
import { PATIENTS, BIG_EXERCISES, HISTORY, PARKINSON_STAGES } from '../../lib/mockData.js'

// Read-only patient detail (spec §4.4). No mutation of training program allowed.
export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const patient = PATIENTS.find((p) => p.id === id) || PATIENTS[0]
  const [note, setNote] = useState('ผู้ป่วยทำท่า Sit-to-Stand ได้ดีขึ้น ควรเน้นท่าทรงตัวเพิ่มในสัปดาห์หน้า')
  const [saved, setSaved] = useState(false)

  return (
    <div>
      <header className="flex justify-between items-center px-8 py-5 border-b border-line bg-surface">
        <Link to="/therapist/patients" className="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary hover:text-teal-700">
          <ArrowLeft size={16} /> รายชื่อผู้ป่วย
        </Link>
        <Button variant="outline" className="w-auto py-2" onClick={() => navigate('/therapist/messages')}>
          <Chat size={16} /> แชทกับผู้ป่วย
        </Button>
      </header>

      <div className="px-8 py-7 max-w-[900px]">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="font-heading text-[22px] font-semibold text-teal-900">{patient.name}</h1>
          <Badge tone="big">{PARKINSON_STAGES.find((s) => s.value === patient.stage)?.short}</Badge>
        </div>

        <MetricRow
          items={[
            { value: '1,284', label: 'คะแนนสะสม' },
            { value: '46', label: 'จำนวนครั้งที่ฝึก' },
            { value: `${patient.streak}`, label: 'ฝึกต่อเนื่อง (วัน)' },
            { value: `${patient.weekCount}/7`, label: 'วันที่ฝึกสัปดาห์นี้' },
          ]}
        />

        <div className="mb-7"><FrequencyChart /></div>

        <SectionTitle>ความแม่นยำแยกตามท่าฝึก (LSVT BIG)</SectionTitle>
        <Card className="p-6 mb-7 space-y-3.5">
          {BIG_EXERCISES.map((ex) => (
            <div key={ex.id}>
              <div className="flex justify-between text-[12.5px] mb-1.5">
                <span className="text-ink-secondary">{ex.id}. {ex.name}</span>
                <span className={`font-semibold font-mono ${ex.accuracy < 70 ? 'text-coral-700' : 'text-teal-900'}`}>{ex.accuracy}%</span>
              </div>
              <ProgressBar value={ex.accuracy} tone={ex.accuracy < 70 ? 'loud' : 'big'} />
            </div>
          ))}
        </Card>

        <SectionTitle>ตั้งค่า LSVT LOUD สำหรับผู้ป่วยคนนี้</SectionTitle>
        <LoudTargetSettings />

        <SectionTitle>ประวัติการฝึกล่าสุด</SectionTitle>
        <table className="w-full border-collapse card overflow-hidden mb-7">
          <thead>
            <tr className="bg-[#F5F2EA]">
              {['วันที่', 'ประเภท', 'ระยะเวลา', 'คะแนน'].map((h) => (
                <th key={h} className="text-left text-[11.5px] uppercase tracking-wide text-ink-muted px-5 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((r, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-5 py-3 text-[13.5px]">{r.date}</td>
                <td className="px-5 py-3"><Badge tone={r.type}>{r.type === 'big' ? 'LSVT BIG' : 'LSVT LOUD'}</Badge></td>
                <td className="px-5 py-3 text-[13.5px]">{r.duration}</td>
                <td className="px-5 py-3 text-[13.5px] font-semibold font-mono">{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <SectionTitle>บันทึกของฉัน (เห็นเฉพาะคุณ)</SectionTitle>
        <Card className="p-5">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="w-full border border-line rounded-btn p-3 text-[13.5px] outline-none focus:border-teal-700 resize-y"
          />
          <Button variant="primary" className="w-auto mt-3" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}>
            {saved ? 'บันทึกแล้ว ✓' : 'บันทึก'}
          </Button>
        </Card>
      </div>
    </div>
  )
}
