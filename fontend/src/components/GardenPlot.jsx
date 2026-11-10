// Garden illustration for the village map and the garden page.
//
// Each garden is drawn as a little island: a thick brown soil rim, a grass top
// darker than the map behind it, and a soft shadow underneath. What grows on it
// scales with the level: seedling → vegetable rows → fence + flowers → many
// flowers → fruit → big trees + pond → pavilion + stream. Placement is seeded by
// the plot id so a garden looks the same on every render.
//
// `ring`: 'own' draws a red glow around the island (the player's own plot).
// Inside a parent with the `group` class, hovering swaps in a blue ring to show
// the plot is clickable.

// Small deterministic PRNG so plots are stable across renders.
function rng(seed) {
  let s = seed * 9301 + 49297
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const GRASS = '#9BD27E'
const SOIL = '#8E5F2C'
const SOIL_DARK = '#73491F'
const LEAF = ['#4E9E3E', '#3F8A33', '#5CB04A', '#68BE55']
const BLOSSOM = ['#F2789F', '#F5A4C0', '#FFD166', '#E06AA3', '#C76BE0']

function Tree({ x, y, scale, color, fruit, big }) {
  // Slightly larger canopies than before so plots read at map size.
  const r = (big ? 15.5 : 11) * scale
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-1.9 * scale} y={-r * 0.5} width={3.8 * scale} height={r * 1.15} rx={1.6} fill={SOIL} />
      <circle cx={0} cy={-r * 0.9} r={r} fill={color} />
      <circle cx={-r * 0.5} cy={-r * 0.5} r={r * 0.68} fill={color} opacity="0.9" />
      <circle cx={r * 0.5} cy={-r * 0.55} r={r * 0.6} fill={color} opacity="0.85" />
      {fruit && (
        <>
          <circle cx={-r * 0.35} cy={-r * 0.9} r={2.4 * scale} fill="#E8553F" />
          <circle cx={r * 0.4} cy={-r * 1.2} r={2.4 * scale} fill="#E8553F" />
        </>
      )}
    </g>
  )
}

export default function GardenPlot({ level = 1, trees = 1, seed = 1, className = '', title, ring = null }) {
  const rand = rng(seed * 37 + level)
  const W = 200
  const H = 160

  // Island geometry — everything on the plot is placed relative to this.
  const cx = W / 2
  const cy = H - 46
  const rx = 92
  const ry = 32

  // How many little trees to draw (the real count can run to 100+).
  const drawn = Math.min(trees, level >= 6 ? 14 : level >= 5 ? 11 : level >= 4 ? 8 : level >= 3 ? 6 : level >= 2 ? 3 : 1)

  const spots = Array.from({ length: drawn }, (_, i) => {
    const col = i % 4
    const row = Math.floor(i / 4)
    return {
      x: 44 + col * 38 + (rand() - 0.5) * 12,
      y: cy - 6 + row * 13 - rand() * 5,
      scale: 0.8 + rand() * 0.4,
      color: LEAF[Math.floor(rand() * LEAF.length)],
      big: level >= 6 && i % 5 === 0,
      fruit: level >= 5 && i % 3 === 0,
    }
  })

  const flowers = level >= 3
    ? Array.from({ length: level >= 4 ? 14 : 6 }, () => ({
      x: cx + (rand() - 0.5) * rx * 1.5,
      y: cy + 6 + rand() * (ry * 0.7),
      r: 2.6 + rand() * 1.8,
      color: BLOSSOM[Math.floor(rand() * BLOSSOM.length)],
    }))
    : []

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={title || 'สวน'}>
      {/* shadow cast on the ground below the island */}
      <ellipse cx={cx} cy={cy + ry + 12} rx={rx * 0.86} ry={9} fill="#2F4A1E" opacity="0.18" />

      {/* rings — red for your own plot, blue while hovered */}
      {ring === 'own' && (
        <ellipse
          className="transition-opacity group-hover:opacity-0"
          cx={cx} cy={cy} rx={rx + 9} ry={ry + 9}
          fill="none" stroke="#D32F2F" strokeWidth="7" opacity="0.5"
        />
      )}
      <ellipse
        className="opacity-0 transition-opacity group-hover:opacity-100"
        cx={cx} cy={cy} rx={rx + 9} ry={ry + 9}
        fill="none" stroke="#157AB5" strokeWidth="7"
      />

      {/* thick soil rim, then the grass top */}
      <ellipse cx={cx} cy={cy + 9} rx={rx} ry={ry} fill={SOIL_DARK} />
      <ellipse cx={cx} cy={cy + 4} rx={rx} ry={ry} fill={SOIL} />
      <ellipse cx={cx} cy={cy} rx={rx - 6} ry={ry - 5} fill={GRASS} />

      {/* level 6+ pond, level 7 stream */}
      {level >= 7 && (
        <path
          d={`M${cx - rx + 16} ${cy + 16} q46 -13 92 0`}
          stroke="#7EC8E3" strokeWidth="8" fill="none" strokeLinecap="round"
        />
      )}
      {level >= 6 && <ellipse cx={cx - 46} cy={cy + 6} rx={22} ry={9} fill="#7EC8E3" />}

      {/* level 2 vegetable rows */}
      {level >= 2 && level < 4 && [0, 1, 2].map((i) => (
        <rect key={i} x={cx - 40 + i * 34} y={cy + 8} width={24} height={6} rx={3} fill={SOIL_DARK} opacity="0.55" />
      ))}

      {/* level 3+ wooden fence along the front edge */}
      {level >= 3 && (
        <g stroke={SOIL} strokeWidth="3.6" strokeLinecap="round">
          {[-74, -56, -38, 38, 56, 74].map((dx) => (
            <line key={dx} x1={cx + dx} y1={cy + 4} x2={cx + dx} y2={cy + 20} />
          ))}
          <line x1={cx - 78} y1={cy + 10} x2={cx - 34} y2={cy + 10} />
          <line x1={cx + 34} y1={cy + 10} x2={cx + 78} y2={cy + 10} />
        </g>
      )}

      {/* level 7 pavilion */}
      {level >= 7 && (
        <g>
          <rect x={cx + 48} y={cy - 44} width={34} height={26} rx={3} fill="#F3E2BE" stroke={SOIL} strokeWidth="2.5" />
          <path d={`M${cx + 43} ${cy - 43} L${cx + 65} ${cy - 58} L${cx + 87} ${cy - 43} Z`} fill="#C8763A" stroke={SOIL} strokeWidth="2.5" />
        </g>
      )}

      {spots.map((s, i) => <Tree key={i} {...s} />)}

      {flowers.map((f, i) => (
        <circle key={i} cx={f.x} cy={f.y} r={f.r} fill={f.color} />
      ))}

      {/* a single seedling at level 1 */}
      {level === 1 && (
        <g transform={`translate(${cx} ${cy})`}>
          <rect x={-1.6} y={-16} width={3.2} height={16} rx={1.6} fill={SOIL} />
          <ellipse cx={-7} cy={-17} rx={8} ry={5} fill="#5CB04A" />
          <ellipse cx={7} cy={-20} rx={8} ry={5} fill="#4E9E3E" />
        </g>
      )}
    </svg>
  )
}
