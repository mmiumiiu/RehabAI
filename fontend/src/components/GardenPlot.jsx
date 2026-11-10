// Garden illustration for the village map and the garden page.
//
// The mockup draws each plot as a hand-made SVG scene; this is a parametric
// stand-in that grows with the level: mound → vegetable rows → fence + flowers
// → many flowers → fruit → big trees + pond → pavilion + stream. Placement is
// seeded by the plot id so a garden looks the same every render.

// Small deterministic PRNG so plots are stable across renders.
function rng(seed) {
  let s = seed * 9301 + 49297
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const LEAF = ['#4E9E3E', '#3F8A33', '#5CB04A', '#68BE55']
const BLOSSOM = ['#F2789F', '#F5A4C0', '#FFD166', '#E06AA3', '#C76BE0']

function Tree({ x, y, scale, color, fruit, big }) {
  const r = (big ? 13 : 9) * scale
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-1.6 * scale} y={-r * 0.5} width={3.2 * scale} height={r * 1.1} rx={1.4} fill="#8E5F2C" />
      <circle cx={0} cy={-r * 0.9} r={r} fill={color} />
      <circle cx={-r * 0.5} cy={-r * 0.5} r={r * 0.68} fill={color} opacity="0.9" />
      <circle cx={r * 0.5} cy={-r * 0.55} r={r * 0.6} fill={color} opacity="0.85" />
      {fruit && (
        <>
          <circle cx={-r * 0.35} cy={-r * 0.9} r={2.1 * scale} fill="#E8553F" />
          <circle cx={r * 0.4} cy={-r * 1.2} r={2.1 * scale} fill="#E8553F" />
        </>
      )}
    </g>
  )
}

export default function GardenPlot({ level = 1, trees = 1, seed = 1, className = '', title }) {
  const rand = rng(seed * 37 + level)
  const W = 200
  const H = 150

  // How many little trees to draw (the real count can run to 100+).
  const drawn = Math.min(trees, level >= 6 ? 14 : level >= 5 ? 11 : level >= 4 ? 8 : level >= 3 ? 6 : level >= 2 ? 3 : 1)

  const spots = Array.from({ length: drawn }, (_, i) => {
    const col = i % 4
    const row = Math.floor(i / 4)
    return {
      x: 38 + col * 42 + (rand() - 0.5) * 14,
      y: 96 + row * 15 - (rand() * 6),
      scale: 0.78 + rand() * 0.45,
      color: LEAF[Math.floor(rand() * LEAF.length)],
      big: level >= 6 && i % 5 === 0,
      fruit: level >= 5 && i % 3 === 0,
    }
  })

  const flowers = level >= 3
    ? Array.from({ length: level >= 4 ? 14 : 6 }, () => ({
      x: 18 + rand() * (W - 36),
      y: 112 + rand() * 28,
      r: 2.4 + rand() * 1.8,
      color: BLOSSOM[Math.floor(rand() * BLOSSOM.length)],
    }))
    : []

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={title || 'สวน'}>
      {/* ground mound */}
      <ellipse cx={W / 2} cy={H - 18} rx={94} ry={34} fill="#8FCB6E" />
      <ellipse cx={W / 2} cy={H - 24} rx={84} ry={27} fill="#9BD67A" />

      {/* level 6+ pond, level 7 stream */}
      {level >= 7 && (
        <path d={`M8 ${H - 12} q46 -14 92 0 q46 14 92 0`} stroke="#7EC8E3" strokeWidth="9" fill="none" strokeLinecap="round" />
      )}
      {level >= 6 && <ellipse cx={46} cy={H - 26} rx={24} ry={11} fill="#7EC8E3" />}

      {/* level 2 vegetable rows */}
      {level >= 2 && level < 4 && [0, 1, 2].map((i) => (
        <rect key={i} x={46 + i * 36} y={H - 34} width={26} height={7} rx={3} fill="#7A5327" opacity="0.5" />
      ))}

      {/* level 3+ wooden fence */}
      {level >= 3 && (
        <g stroke="#8E5F2C" strokeWidth="3.4" strokeLinecap="round">
          {[14, 34, 54, 146, 166, 186].map((x) => <line key={x} x1={x} y1={H - 40} x2={x} y2={H - 20} />)}
          <line x1="10" y1={H - 34} x2="58" y2={H - 34} />
          <line x1="142" y1={H - 34} x2="190" y2={H - 34} />
        </g>
      )}

      {/* level 7 pavilion */}
      {level >= 7 && (
        <g>
          <rect x={150} y={70} width={34} height={26} rx={3} fill="#F3E2BE" stroke="#8E5F2C" strokeWidth="2.5" />
          <path d="M145 71 L167 56 L189 71 Z" fill="#C8763A" stroke="#8E5F2C" strokeWidth="2.5" />
        </g>
      )}

      {spots.map((s, i) => <Tree key={i} {...s} />)}

      {flowers.map((f, i) => (
        <circle key={i} cx={f.x} cy={f.y} r={f.r} fill={f.color} />
      ))}

      {/* a single seedling at level 1 */}
      {level === 1 && (
        <g transform={`translate(${W / 2} ${H - 30})`}>
          <rect x={-1.4} y={-14} width={2.8} height={14} rx={1.4} fill="#8E5F2C" />
          <ellipse cx={-6} cy={-15} rx={7} ry={4.4} fill="#5CB04A" />
          <ellipse cx={6} cy={-18} rx={7} ry={4.4} fill="#4E9E3E" />
        </g>
      )}
    </svg>
  )
}
