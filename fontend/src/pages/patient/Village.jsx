import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GardenPlot from '../../components/GardenPlot.jsx'
import { MapPin, ArrowLeft, Check } from '../../components/icons.jsx'
import {
  VILLAGE_NEIGHBORS, MY_GARDEN, NEIGHBOR_PLOT_WIDTH, CHEER_MESSAGES, gardenLevelOf,
} from '../../lib/mockData.js'
import { useAuth } from '../../context/AuthContext.jsx'

// Village map — a pale-green meadow holding one island per garden. The player's
// plot sits dead centre at 1.5× the size with a red glow; tapping a neighbour
// opens their garden panel, tapping your own goes to /garden. The page title and
// the "แตะที่สวน" hint live above the map, not inside it.
// Data is mock (mockData.js) until the backend exists.

// Mockup's wooden sign: cream fill, thick brown border, solid bottom shadow.
const WOOD = {
  background: '#FFF6E3',
  border: '3px solid #8E5F2C',
  boxShadow: '0 4px 0 #8E5F2C',
  color: '#4A2E0F',
}
const WOOD_BIG = { ...WOOD, border: '4px solid #8E5F2C', boxShadow: '0 5px 0 #8E5F2C' }

// Level badge colour ladder: grey → blue → orange → gold as the garden grows.
function levelColor(level) {
  if (level >= 7) return '#C9971C'
  if (level >= 5) return '#E07B1A'
  if (level >= 3) return '#157AB5'
  return '#7B8A93'
}

function LevelBadge({ level }) {
  return (
    <span
      className="text-b-xs font-bold text-white rounded-[8px] px-2.5 py-px"
      style={{ background: levelColor(level) }}
    >
      {level}
    </span>
  )
}

// One clickable island on the map. Hovering lifts it and turns its ring blue
// (handled inside GardenPlot via `group-hover`) so it reads as tappable.
function Plot({ left, top, width, seed, trees, label, mine, onClick }) {
  const level = gardenLevelOf(trees).level
  return (
    <div
      className="absolute"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        transform: mine ? 'translate(-50%, -50%)' : undefined,
      }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={mine ? 'ดูรายละเอียดสวนของคุณ' : `ดูสวนของ${label}`}
        className="group w-full flex flex-col items-center p-0 bg-transparent border-0 cursor-pointer transition-transform duration-150 hover:-translate-y-2 focus-visible:-translate-y-2"
      >
        <GardenPlot
          level={level}
          trees={trees}
          seed={seed}
          ring={mine ? 'own' : null}
          className="w-full h-auto"
          title={`สวนของ${label}`}
        />
        {mine ? (
          <span
            className="-mt-2 inline-flex items-center px-4 py-1.5 rounded-[12px] font-bold whitespace-nowrap text-white"
            style={{ background: '#D32F2F', fontSize: 20 }}
          >
            สวนของคุณ · ระดับ {level}
          </span>
        ) : (
          <span
            className="-mt-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-[10px] font-bold whitespace-nowrap bg-surface"
            style={{ border: '2px solid #D7DEE3', color: '#0B2E45', fontSize: 16 }}
          >
            {label}
            <LevelBadge level={level} />
          </span>
        )}
      </button>
    </div>
  )
}

// Neighbour garden overlay — mockup's "vpanel" dialog.
function NeighborPanel({ neighbor, onClose }) {
  const level = gardenLevelOf(neighbor.trees)
  const [watered, setWatered] = useState(neighbor.watered)
  const [justWatered, setJustWatered] = useState(false)
  const [sentCheer, setSentCheer] = useState(null)

  function water() {
    setWatered((n) => n + 1)
    setJustWatered(true)
  }

  return (
    <div
      role="dialog"
      aria-label={`สวนของ${neighbor.name}`}
      className="absolute inset-0 z-50 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #BFE9F6 0%, #9BD67A 46%)' }}
    >
      <GardenPlot
        level={level.level}
        trees={neighbor.trees}
        seed={neighbor.id}
        className="absolute left-1/2 -translate-x-1/2 bottom-[16%] w-[62%] h-auto"
        title={`สวนของ${neighbor.name}`}
      />

      <div className="absolute left-0 right-0 top-0 p-5 flex justify-between items-start gap-3 flex-wrap">
        <div className="rounded-[17px] px-5 py-3" style={WOOD_BIG}>
          <div className="flex items-center gap-3.5">
            <h2 className="font-heading text-b-h2 font-bold m-0">สวนของ{neighbor.name}</h2>
            <span className="text-b-label font-bold bg-teal-700 text-white rounded-[9px] px-3 py-0.5">
              ระดับ {level.level}
            </span>
          </div>
          <div className="text-b-base font-semibold">{level.name} · ต้นไม้ {neighbor.trees} ต้น</div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="min-h-[60px] px-5 rounded-[17px] font-heading text-b-btn font-bold flex items-center gap-2.5"
          style={WOOD_BIG}
        >
          <ArrowLeft size={22} /> กลับแผนที่
        </button>
      </div>

      <div className="absolute left-0 right-0 bottom-0 p-5 flex flex-wrap gap-3 items-stretch">
        <div className="flex-[1_1_260px] rounded-[17px] px-5 py-3.5 flex gap-5" style={WOOD_BIG}>
          <div className="flex-1">
            <div className="text-b-h2 font-bold leading-[1.2]">{neighbor.streak} วัน</div>
            <div className="text-b-sm">ฝึกติดต่อกัน</div>
          </div>
          <div className="flex-1">
            <div className="text-b-h2 font-bold leading-[1.2]">{neighbor.trees} วัน</div>
            <div className="text-b-sm">ฝึกรวมทั้งหมด</div>
          </div>
        </div>

        <button
          type="button"
          onClick={water}
          className="flex-[1_1_240px] min-h-[62px] px-6 rounded-btn text-white text-b-btn font-bold flex items-center justify-center gap-3 bg-teal-700 hover:bg-teal-800 transition-colors"
        >
          {justWatered ? <Check size={22} /> : null}
          รดน้ำต้นไม้ให้ · {watered} ครั้งแล้ว
        </button>

        <div className="flex-[2_1_380px] rounded-[17px] px-4 py-3.5 flex flex-col gap-2.5" style={WOOD_BIG}>
          <div className="flex items-center gap-2.5 text-b-btn font-bold text-indigo-600">
            ใส่กล่องให้กำลังใจ
          </div>
          <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            {CHEER_MESSAGES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSentCheer(m)}
                className={`min-h-[54px] rounded-[14px] border-[3px] text-b-base font-bold transition-colors ${
                  sentCheer === m
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-indigo-100 border-[#CDBDF0] text-indigo-700 hover:bg-[#E3DAF7]'
                }`}
              >
                {sentCheer === m ? 'ส่งแล้ว ✓' : m}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Village() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [open, setOpen] = useState(null)

  const myName = user?.name?.split(' ')[0] || 'คุณ'
  const neighbor = VILLAGE_NEIGHBORS.find((n) => n.id === open) || null

  return (
    <div className="flex flex-col gap-6">
      {/* Page header — outside the map, same shape as every other page */}
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-b-label font-semibold text-ink-secondary m-0 mb-1">แตะที่สวนเพื่อเข้าไปดู</p>
          <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">แผนที่หมู่บ้าน</h1>
        </div>
        <Link
          to="/garden"
          className="inline-flex items-center justify-center gap-3 min-h-[51px] px-6 rounded-btn bg-surface border-[3px] border-line text-ink-primary text-b-btn font-bold hover:bg-teal-50 transition-colors"
        >
          <MapPin size={22} /> สวนของฉัน
        </Link>
      </header>

      <section
        aria-label="แผนที่หมู่บ้าน"
        className="relative w-full rounded-card overflow-hidden border-[1.5px] border-line"
        style={{ aspectRatio: '16 / 11', minHeight: 420, background: '#E6F4DC' }}
      >
        {/* soft meadow texture — no path, just a faint speckle */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(155,210,126,0.35) 0 3px, transparent 4px), radial-gradient(circle at 70% 60%, rgba(155,210,126,0.28) 0 3px, transparent 4px)',
            backgroundSize: '90px 90px, 130px 130px',
          }}
        />

        {VILLAGE_NEIGHBORS.map((n) => (
          <Plot
            key={n.id}
            left={n.left}
            top={n.top}
            width={NEIGHBOR_PLOT_WIDTH}
            seed={n.id}
            trees={n.trees}
            label={n.name}
            onClick={() => setOpen(n.id)}
          />
        ))}

        {/* Your plot — dead centre, 1.5× the size of a neighbour's */}
        <Plot
          left={50}
          top={48}
          width={NEIGHBOR_PLOT_WIDTH * 1.5}
          seed={99}
          trees={MY_GARDEN.trees}
          label={myName}
          mine
          onClick={() => navigate('/garden')}
        />

        {neighbor && <NeighborPanel neighbor={neighbor} onClose={() => setOpen(null)} />}
      </section>
    </div>
  )
}
