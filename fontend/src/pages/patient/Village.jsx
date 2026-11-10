import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GardenPlot from '../../components/GardenPlot.jsx'
import { Home, MapPin, ArrowLeft, Check } from '../../components/icons.jsx'
import {
  VILLAGE_NEIGHBORS, MY_GARDEN, MY_PLOT, NEIGHBOR_PLOT_WIDTH,
  CHEER_MESSAGES, gardenLevelOf,
} from '../../lib/mockData.js'
import { useAuth } from '../../context/AuthContext.jsx'

// Village map — the "#village" section of design/bridge-mockup.html. The
// player's plot sits in the middle of a ring of neighbours; tapping a neighbour
// opens their garden panel, tapping your own goes to /garden.
// Data is mock (mockData.js) until the backend exists.

// Mockup's wooden sign: cream fill, thick brown border, solid bottom shadow.
const WOOD = {
  background: '#FFF6E3',
  border: '3px solid #8E5F2C',
  boxShadow: '0 4px 0 #8E5F2C',
  color: '#4A2E0F',
}
const WOOD_BIG = { ...WOOD, border: '4px solid #8E5F2C', boxShadow: '0 5px 0 #8E5F2C' }

function LevelBadge({ level }) {
  return (
    <span className="text-b-xs font-bold bg-teal-700 text-white rounded-[7px] px-2 py-px">{level}</span>
  )
}

// One clickable plot on the map, positioned by percentage.
function Plot({ left, top, width, seed, trees, label, mine, onClick }) {
  const level = gardenLevelOf(trees).level
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={mine ? 'ดูรายละเอียดสวนของคุณ' : `ดูสวนของ${label}`}
      className="absolute flex flex-col items-center p-0 bg-transparent border-0 cursor-pointer"
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%` }}
    >
      <GardenPlot level={level} trees={trees} seed={seed} className="w-full h-auto" title={`สวนของ${label}`} />
      <span
        className="-mt-1.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-[10px] font-bold whitespace-nowrap max-w-[120%]"
        style={mine
          ? { background: '#EEE8FA', border: '3px solid #6D3FC0', boxShadow: '0 4px 0 #6D3FC0', color: '#4B2A86', fontSize: 21 }
          : { ...WOOD, fontSize: 16 }}
      >
        {label}
        <LevelBadge level={level} />
      </span>
    </button>
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
    <section
      aria-label="แผนที่หมู่บ้าน"
      className="relative w-full rounded-card overflow-hidden"
      style={{ aspectRatio: '16 / 11', minHeight: 420, background: '#9BD67A' }}
    >
      {/* soft field texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.22) 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.18) 0 2px, transparent 3px)',
          backgroundSize: '90px 90px, 120px 120px',
        }}
      />
      {/* a path ring under the plots */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: '74%', height: '74%', border: '18px solid #C8B487', opacity: 0.45 }}
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

      <Plot
        left={MY_PLOT.left}
        top={MY_PLOT.top}
        width={MY_PLOT.width}
        seed={99}
        trees={MY_GARDEN.trees}
        label={`${myName} (คุณ)`}
        mine
        onClick={() => navigate('/garden')}
      />

      {/* floating header */}
      <div className="absolute left-0 right-0 top-0 p-4 flex justify-between items-start gap-3 flex-wrap pointer-events-none">
        <div className="flex gap-2.5 flex-wrap pointer-events-auto">
          <Link
            to="/home"
            className="inline-flex items-center gap-2.5 min-h-[54px] px-4 rounded-btn font-heading text-b-base font-bold no-underline"
            style={WOOD_BIG}
          >
            <Home size={22} /> หน้าแรก
          </Link>
          <h1
            className="inline-flex items-center gap-2.5 min-h-[54px] px-4 rounded-btn font-heading text-b-h3 font-bold m-0"
            style={WOOD_BIG}
          >
            <MapPin size={22} /> แผนที่หมู่บ้าน
          </h1>
        </div>
      </div>

      <div
        className="absolute right-4 bottom-4 px-4 py-2.5 rounded-[13px] text-b-base font-bold"
        style={{ background: 'rgba(255,246,227,0.96)', color: '#4A2E0F' }}
      >
        แตะที่สวนเพื่อเข้าไปดู
      </div>

      {neighbor && <NeighborPanel neighbor={neighbor} onClose={() => setOpen(null)} />}
    </section>
  )
}
