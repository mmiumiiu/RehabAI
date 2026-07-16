// Decorative animated pose skeleton drawn over the live camera feed.
// A stand-in for a real MediaPipe Pose overlay; `phase` (0..1) gently animates joints.
export default function PoseSkeleton({ phase = 0, good = true }) {
  const lift = Math.sin(phase * Math.PI * 2) * 8 // arm swing
  const color = good ? '#4E9484' : '#E39159'
  const joint = (cx, cy) => <circle cx={cx} cy={cy} r="2.6" fill="#DCEEE8" />

  // normalized coords on a 200x250 viewbox, roughly centred
  const head = [100, 40]
  const neck = [100, 62]
  const shoulderL = [78, 70]
  const shoulderR = [122, 70]
  const elbowL = [66, 96 - lift]
  const elbowR = [134, 96 - lift]
  const handL = [58, 122 - lift * 1.4]
  const handR = [142, 122 - lift * 1.4]
  const hip = [100, 130]
  const hipL = [86, 132]
  const hipR = [114, 132]
  const kneeL = [84, 176]
  const kneeR = [116, 176]
  const footL = [82, 214]
  const footR = [118, 214]

  const line = (a, b) => (
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth="2.4" strokeLinecap="round" />
  )

  return (
    <svg viewBox="0 0 200 250" className="w-[46%] max-w-[280px] opacity-90" style={{ filter: 'drop-shadow(0 0 6px rgba(78,148,132,.4))' }}>
      <circle cx={head[0]} cy={head[1]} r="14" stroke={color} strokeWidth="2.4" fill="none" />
      {line(neck, hip)}
      {line(shoulderL, shoulderR)}
      {line(shoulderL, elbowL)}
      {line(elbowL, handL)}
      {line(shoulderR, elbowR)}
      {line(elbowR, handR)}
      {line(hipL, hipR)}
      {line(hip, kneeL)}
      {line(kneeL, footL)}
      {line(hip, kneeR)}
      {line(kneeR, footR)}
      {[neck, shoulderL, shoulderR, elbowL, elbowR, handL, handR, hip, kneeL, kneeR, footL, footR].map((p, i) => (
        <g key={i}>{joint(p[0], p[1])}</g>
      ))}
    </svg>
  )
}
