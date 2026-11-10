import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import FrequencyChart from '../../components/FrequencyChart.jsx'
import LoudTargetSettings from '../../components/LoudTargetSettings.jsx'
import LoudPhraseSettings from '../../components/LoudPhraseSettings.jsx'
import { Button, StatCard } from '../../components/ui.jsx'
import { Chat, Mic, Activity, Flame, Clock, Award, AlertTriangle } from '../../components/icons.jsx'
import { BIG_EXERCISES, PATIENTS, HISTORY, PARKINSON_STAGES } from '../../lib/mockData.js'
import { sessionService } from '../../lib/sessionService.js'

// "#therapistpatient" section of design/bridge-mockup.html: four stat cards, the
// 7-day minutes chart, per-exercise accuracy next to the private note, then the
// LSVT LOUD settings this app adds. Mockup px ÷ 1.4.

const THAI_DOW = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']

function AccuracyBar({ name, accuracy }) {
  const weak = accuracy < 70
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-3 text-b-base font-semibold">
        <span className="min-w-0">{name}</span>
        <span className="font-bold whitespace-nowrap">
          {accuracy}% · {weak ? 'ควรฝึกเพิ่ม' : accuracy >= 85 ? 'ดี' : 'พอใช้'}
        </span>
      </div>
      <div className="h-[13px] rounded-[9px] bg-teal-50 overflow-hidden">
        <div className="h-full rounded-[9px]" style={{ width: `${accuracy}%`, background: weak ? '#6D3FC0' : '#157AB5' }} />
      </div>
    </div>
  )
}

export default function PatientDetail() {
  const { id } = useParams()
  const patient = PATIENTS.find((p) => p.id === id) || PATIENTS[0]
  const [note, setNote] = useState('ท่าทรงตัว 2 ท่ายังต่ำกว่าท่าอื่น แนะนำให้ยืนใกล้ผนัง ติดตามผลนัดครั้งหน้า')
  const [saved, setSaved] = useState(false)
  const [liveSession, setLiveSession] = useState(null)
  const dismissTimer = useRef(null)

  useEffect(() => {
    sessionService.subscribe(patient.id, (result) => {
      setLiveSession(result)
      // auto-dismiss 5 minutes after the last update
      if (dismissTimer.current) clearTimeout(dismissTimer.current)
      dismissTimer.current = setTimeout(() => setLiveSession(null), 5 * 60 * 1000)
    })
    return () => {
      sessionService.unsubscribe()
      if (dismissTimer.current) clearTimeout(dismissTimer.current)
    }
  }, [patient.id])

  const stageShort = PARKINSON_STAGES.find((s) => s.value === patient.stage)?.short
  const week = (patient.week || []).map((d, i) => ({ day: THAI_DOW[i], big: d.big, loud: d.loud }))
  const weakest = BIG_EXERCISES.filter((e) => e.accuracy < 70)

  return (
    <div className="max-w-[1100px] mx-auto w-full px-4 md:px-9 py-6 md:py-8 flex flex-col gap-6">
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-b-label font-semibold text-ink-secondary m-0 mb-1">รายชื่อผู้ป่วย</p>
          <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">
            {patient.name} · {stageShort}
          </h1>
        </div>
        <Button variant="outline" to="/therapist/messages" className="min-h-[51px]">
          <Chat size={22} /> แชทกับผู้ป่วย
        </Button>
      </header>

      {/* Live session banner — only while the patient is training */}
      {liveSession && (
        <div
          className="rounded-card border-2 px-6 py-5 flex items-center gap-5 flex-wrap"
          style={{ background: '#E3F1DC', borderColor: '#BFDDB0', color: '#24661A' }}
        >
          <span className="w-[51px] h-[51px] rounded-full bg-ok-fg text-white flex items-center justify-center flex-shrink-0">
            {liveSession.complete ? '✓' : <Mic size={24} />}
          </span>
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-b-btn font-bold">
                {liveSession.complete ? 'เสร็จสิ้นการฝึกเสียงพูดแล้ว' : 'กำลังฝึกเสียงพูดอยู่ขณะนี้'}
              </span>
              {!liveSession.complete && <span className="w-2.5 h-2.5 rounded-full bg-ok-fg animate-pulse" />}
            </div>
            <div className="text-b-label">
              {liveSession.reps} / {liveSession.goal} ครั้ง · {liveSession.duration}
            </div>
          </div>
          <div className="text-right">
            <div className="text-b-h2 font-bold leading-[1.2]">
              {Math.round((liveSession.reps / liveSession.goal) * 100)}%
            </div>
            <div className="text-b-sm">สำเร็จ</div>
          </div>
        </div>
      )}

      {/* Four stat cards */}
      <div className="flex flex-wrap gap-4">
        <StatCard icon={Activity} value={`${patient.totalDays} วัน`} label="ฝึกรวม" />
        <StatCard icon={Flame} value={`${patient.streak} วัน`} label="ฝึกติดต่อกัน" rule="#6B4A00" tint="#FFF1C7" />
        <StatCard icon={Clock} value={`${patient.weekCount}/7`} label="วันที่ฝึกสัปดาห์นี้" />
        <StatCard icon={Award} value={`${patient.avgAccuracy}%`} label="ท่าถูกต้องเฉลี่ย" rule="#14807A" tint="#DDF3F1" />
      </div>

      <FrequencyChart data={week} />

      <div className="flex flex-wrap gap-5">
        {/* Per-exercise accuracy */}
        <section className="flex-1 min-w-[320px] bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-5">
          <h2 className="font-heading text-b-h2 font-bold m-0 leading-[1.3]">ความถูกต้องแยกตามท่า</h2>
          {BIG_EXERCISES.map((ex) => (
            <AccuracyBar key={ex.id} name={ex.name} accuracy={ex.accuracy} />
          ))}
          {weakest.length > 0 && (
            <div
              className="flex gap-4 items-start rounded-[17px] border-2 px-5 py-4"
              style={{ background: '#FFF1C7', borderColor: '#E6CF86', color: '#6B4A00' }}
            >
              <AlertTriangle size={24} className="flex-shrink-0" />
              <p className="text-b-label font-semibold leading-[1.6] m-0">
                {weakest.length} ท่ายังทำได้น้อยกว่าท่าอื่น แนะนำให้ฝึกช้า ๆ ใกล้ผนังหรือเก้าอี้
              </p>
            </div>
          )}
        </section>

        {/* Private note */}
        <section className="flex-1 min-w-[320px] bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center gap-3 flex-wrap">
            <h2 className="font-heading text-b-h2 font-bold m-0 leading-[1.3]">บันทึกของฉัน</h2>
            <p className="text-b-sm text-ink-secondary m-0">ผู้ป่วยไม่เห็นบันทึกนี้</p>
          </div>
          <label className="sr-only" htmlFor="note">บันทึก</label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[157px] p-5 rounded-field border-[3px] border-line bg-surface text-b-label font-body text-ink-primary outline-none focus:border-teal-700 transition-colors resize-y"
          />
          <Button
            as="button"
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
            className="self-start min-h-[57px]"
          >
            {saved ? 'บันทึกแล้ว ✓' : 'บันทึก'}
          </Button>
        </section>
      </div>

      {/* LSVT LOUD settings for this patient (not in the mockup) */}
      <h2 className="font-heading text-b-h2 font-bold m-0 leading-[1.3]">ตั้งค่าการฝึกเสียงพูดของผู้ป่วยคนนี้</h2>
      <LoudTargetSettings />
      <LoudPhraseSettings />

      {/* Session history */}
      <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col">
        <h2 className="font-heading text-b-h2 font-bold m-0 mb-3 leading-[1.3]">ประวัติการฝึก</h2>
        {HISTORY.map((r, i) => {
          const isBig = r.type === 'big'
          return (
            <div
              key={i}
              className="flex items-center gap-4 flex-wrap py-4 border-t-2"
              style={{ borderColor: '#E6F1F7' }}
            >
              <span
                className="w-[51px] h-[51px] rounded-[14px] flex items-center justify-center flex-shrink-0"
                style={isBig ? { background: '#E0F1FA', color: '#157AB5' } : { background: '#EEE8FA', color: '#6D3FC0' }}
              >
                {isBig ? <Activity size={26} /> : <Mic size={26} />}
              </span>
              <div className="flex-1 min-w-[160px]">
                <div className="text-b-btn font-bold">{isBig ? 'ฝึกเคลื่อนไหว' : 'ฝึกเสียงพูด'}</div>
                <div className="text-b-label text-ink-secondary">{r.date} · {r.duration}</div>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
