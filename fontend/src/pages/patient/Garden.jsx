import { Link } from 'react-router-dom'
import GardenPlot from '../../components/GardenPlot.jsx'
import { StatCard } from '../../components/ui.jsx'
import { MapPin, Activity, Award, Users, ShieldCheck } from '../../components/icons.jsx'
import {
  MY_GARDEN, GARDEN_LEVELS, GARDEN_WATERINGS, GARDEN_CHEERS, GARDEN_RULES,
  gardenLevelOf, nextGardenLevel,
} from '../../lib/mockData.js'

// "สวนของฉัน" — the "#garden" section of design/bridge-mockup.html.
// Data is mock (mockData.js) until the backend exists.

const RULE_ICONS = [Activity, Award, ShieldCheck, Users]

function GrowthTile({ level, current }) {
  const on = level.level === current
  return (
    <div
      className="flex-1 min-w-[130px] flex flex-col gap-2 p-3 rounded-[14px] border-[3px]"
      style={on
        ? { borderColor: '#157AB5', background: '#E0F1FA' }
        : { borderColor: '#CDE3EE', background: '#FFFFFF' }}
    >
      <div className="rounded-[10px] overflow-hidden bg-teal-50">
        <GardenPlot level={level.level} trees={level.trees} seed={level.level * 3} className="w-full h-auto" />
      </div>
      <span className="text-b-label font-bold">ระดับ {level.level} · {level.trees} ต้น</span>
      <span className="text-b-xs">{level.name}</span>
    </div>
  )
}

export default function Garden() {
  const { trees, streak, totalDays } = MY_GARDEN
  const level = gardenLevelOf(trees)
  const next = nextGardenLevel(trees)

  // Progress from this level's requirement toward the next one.
  const span = next ? next.trees - level.trees : 0
  const pct = next ? Math.round(((trees - level.trees) / span) * 100) : 100

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-b-label font-semibold text-ink-secondary m-0 mb-1">ฝึกทุกวัน สวนก็โตขึ้นทุกวัน</p>
          <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">สวนของฉัน</h1>
        </div>
        <Link
          to="/village"
          className="inline-flex items-center justify-center gap-3 min-h-[51px] px-6 rounded-btn bg-surface border-[3px] border-line text-ink-primary text-b-btn font-bold hover:bg-teal-50 transition-colors"
        >
          <MapPin size={22} /> กลับแผนที่หมู่บ้าน
        </Link>
      </header>

      <div className="flex flex-wrap gap-5 items-stretch">
        {/* The garden itself */}
        <section className="flex-[2_1_420px] min-w-0 bg-surface rounded-card border-[1.5px] border-line shadow-card overflow-hidden">
          <div style={{ background: 'linear-gradient(180deg, #BFE9F6 0%, #9BD67A 52%)' }}>
            <GardenPlot level={level.level} trees={trees} seed={99} className="w-full h-auto" title="สวนของฉัน" />
          </div>
          <div className="p-6 flex flex-col gap-3.5">
            <div className="flex justify-between items-baseline flex-wrap gap-2">
              <h2 className="font-heading text-b-h2 font-bold m-0">ระดับ {level.level} · {level.name}</h2>
              <span className="text-b-h3 font-bold text-teal-700">ต้นไม้ {trees} ต้น</span>
            </div>
            <div className="h-[16px] rounded-pill bg-teal-50 overflow-hidden">
              <div className="h-full rounded-pill bg-teal-700" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-b-btn m-0">
              {next
                ? <>ปลูกอีก <b>{next.trees - trees} ต้น</b> สวนจะเป็น <b>{next.name}</b></>
                : 'สวนของคุณอยู่ระดับสูงสุดแล้ว'}
            </p>
          </div>
        </section>

        {/* How the garden grows */}
        <div className="flex-[1_1_300px] min-w-0 flex flex-col gap-5">
          <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-3.5">
            <h2 className="font-heading text-b-h2 font-bold m-0 leading-[1.3]">สวนโตจากอะไร</h2>
            <p className="text-b-base leading-[1.5] m-0">ฝึก 1 วัน ปลูกต้นไม้ 1 ต้น</p>
            <p className="text-b-base leading-[1.5] m-0">ฝึกครบ 4 วันในสัปดาห์ ต้นไม้ออกผล</p>
            <p className="text-b-base leading-[1.5] m-0">เพื่อนมารดน้ำ ดอกไม้บานเพิ่ม</p>
            <div
              className="rounded-[17px] border-2 px-5 py-4 text-b-label font-semibold leading-[1.6]"
              style={{ background: '#E0F1FA', borderColor: '#A9D3C6', color: '#0B3550' }}
            >
              วันที่ไม่ได้ฝึก ต้นไม้ไม่ตาย แค่รอคุณกลับมา
            </div>
          </section>

          <div className="flex flex-wrap gap-4">
            <StatCard value={`${streak} วัน`} label="ฝึกติดต่อกัน" />
            <StatCard value={`${totalDays} วัน`} label="ฝึกรวมทั้งหมด" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-5">
        {/* Who watered your garden */}
        <section className="flex-1 min-w-[300px] bg-surface rounded-card border-[1.5px] border-line shadow-card p-6">
          <h2 className="font-heading text-b-h2 font-bold m-0 mb-3 leading-[1.3]">ใครมารดน้ำให้คุณ</h2>
          {GARDEN_WATERINGS.map((w) => (
            <div
              key={w.name + w.when}
              className="flex items-center gap-4 py-3 border-t-2"
              style={{ borderColor: '#E6F1F7' }}
            >
              <span className="w-[40px] h-[40px] rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-b-base font-bold flex-shrink-0">
                {w.name[0]}
              </span>
              <div className="flex-1 text-b-base">
                <b>{w.name} มารดน้ำให้</b>
              </div>
              <span className="text-b-sm text-ink-secondary">{w.when}</span>
            </div>
          ))}
        </section>

        {/* Encouragement box */}
        <section className="flex-1 min-w-[300px] bg-indigo-100 rounded-card p-6 flex flex-col gap-3.5">
          <h2 className="font-heading text-b-h2 font-bold m-0 leading-[1.3]">กล่องให้กำลังใจ</h2>
          {GARDEN_CHEERS.map((c) => (
            <div key={c.text + c.from} className="bg-surface rounded-[14px] px-5 py-3.5">
              <div className="text-b-btn font-bold">“{c.text}”</div>
              <div className="text-b-sm text-ink-secondary">จาก {c.from} · {c.when}</div>
            </div>
          ))}
        </section>
      </div>

      {/* Growth path */}
      <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-4">
        <h2 className="font-heading text-b-h2 font-bold m-0 leading-[1.3]">เส้นทางการเติบโตของสวน</h2>
        <div className="flex flex-wrap gap-2">
          {GARDEN_LEVELS.map((l) => <GrowthTile key={l.level} level={l} current={level.level} />)}
        </div>
      </section>

      {/* Level rules + table */}
      <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-4">
        <h2 className="font-heading text-b-h2 font-bold m-0 leading-[1.3]">เกณฑ์ประเมินระดับสวน</h2>

        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {GARDEN_RULES.map((r, i) => {
            const Icon = RULE_ICONS[i] || Activity
            return (
              <div key={r.title} className="flex gap-4 items-start px-5 py-4 rounded-[14px] bg-bg">
                <span className="w-[43px] h-[43px] rounded-[13px] bg-surface text-teal-700 flex items-center justify-center flex-shrink-0">
                  <Icon size={22} />
                </span>
                <div>
                  <div className="text-b-base font-bold">{r.title}</div>
                  <div className="text-b-sm text-ink-secondary leading-[1.55]">{r.detail}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="overflow-x-auto border-[1.5px] border-line rounded-[14px]">
          <table className="w-full border-collapse min-w-[560px]">
            <caption className="text-left px-5 py-3 text-b-label font-bold">
              ต้นไม้ที่ต้องมีในแต่ละระดับ (คิดเวลาจากการฝึก 4 วันต่อสัปดาห์)
            </caption>
            <thead>
              <tr>
                {['ระดับ', 'ชื่อสวน', 'ต้นไม้สะสม', 'ใช้เวลาประมาณ', 'สิ่งที่ได้ในสวน'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-b-sm font-bold text-ink-secondary bg-teal-50">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GARDEN_LEVELS.map((l) => (
                <tr key={l.level} style={l.level === level.level ? { background: '#E0F1FA' } : undefined}>
                  <td className="px-5 py-3 text-b-base font-bold">ระดับ {l.level}</td>
                  <td className="px-5 py-3 text-b-base font-bold">{l.name}</td>
                  <td className="px-5 py-3 text-b-base">{l.trees} ต้น</td>
                  <td className="px-5 py-3 text-b-label">{l.time}</td>
                  <td className="px-5 py-3 text-b-label">{l.reward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-b-sm text-ink-secondary m-0">แถวสีฟ้าคือระดับปัจจุบันของคุณ</p>
      </section>
    </div>
  )
}
