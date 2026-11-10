// Mock data + domain constants derived directly from RehabAI_Build_Spec.md.
// This stands in for Firestore; the service layer (lib/services.js) reads from here.
import { loudPhrases } from './services.js'

export const PARKINSON_STAGES = [
  {
    value: 'stage1',
    label: 'ระยะ 1 — มีอาการข้างเดียว ยังช่วยเหลือตนเองได้เต็มที่',
    short: 'ระยะ 1',
  },
  {
    value: 'stage2',
    label: 'ระยะ 2 — มีอาการสองข้าง ยังทรงตัวและช่วยเหลือตนเองได้',
    short: 'ระยะ 2',
  },
]

// LSVT BIG — grouped by posture: seated first (ท่านั่ง), then standing (ท่ายืน).
// Order within the list is fixed by id. `posture` drives the section grouping on
// the training-list page; `highRisk` shows the "เสี่ยงสูง" badge (fall risk).
export const BIG_EXERCISES = [
  {
    id: 1,
    posture: 'seated',
    name: 'บนล่าง (Floor to Ceiling)',
    nameEn: 'Floor to Ceiling',
    how: 'นั่งริมขอบเก้าอี้ ผลักแขนไปข้างหน้า→ลงพื้น→ขึ้นเหนือศีรษะ→กางแขนค้างไว้ 10 วินาที แล้วกลับสู่ท่าเริ่มต้น',
    target: 8,
    targetLabel: '8 ครั้ง',
    status: 'todo',
    accuracy: 84,
  },
  {
    id: 2,
    posture: 'seated',
    name: 'ซ้ายขวา (Sitting Side to Side)',
    nameEn: 'Sitting Side to Side',
    how: 'นั่งตัวตรง กางแขน 1 ข้างออกไปด้านข้าง วาดแขนลงข้างล่างกวาดไปจนขึ้นไปถึงหัว',
    target: 8,
    targetLabel: '8 ครั้ง/ข้าง',
    status: 'todo',
    accuracy: 80,
  },
  {
    id: 3,
    posture: 'standing',
    name: 'ก้าวหน้า (Forward Step)',
    nameEn: 'Forward Step',
    how: 'ยืนตรง เท้าวางเสมอระดับไหล่ ก้าวขาไปด้านหน้าพร้อมกางแขนสองข้างออกให้สุด แล้วกลับสู่ท่าเริ่มต้น',
    video: '/forward-step.mp4',
    target: 8,
    targetLabel: '8 ครั้ง/ข้าง',
    status: 'todo',
    accuracy: 76,
  },
  {
    id: 4,
    posture: 'standing',
    name: 'ก้าวข้าง (Sideways Step)',
    nameEn: 'Sideways Step',
    how: 'ยืนตรง ก้าวขาไปด้านข้างพร้อมกางแขนสองข้างไปทางด้านข้างให้สุด แล้วกลับสู่ท่าเริ่มต้น',
    video: '/side-step.mp4',
    target: 8,
    targetLabel: '8 ครั้ง/ข้าง',
    status: 'todo',
    accuracy: 73,
  },
  {
    id: 5,
    posture: 'standing',
    highRisk: true,
    name: 'ก้าวหลัง (Backward Step)',
    nameEn: 'Backward Step',
    how: 'ยืนตรง ยกมือไปข้างหน้าระดับหัวไหล่ ก้าวขาไปด้านหลัง ก้มลำตัว กวาดมือไปด้านหลังให้สุด — ท่าที่เสี่ยงหกล้มมากที่สุดในชุดนี้ กดปุ่ม SOS ได้ตลอดเวลาระหว่างฝึก',
    video: '/back-step.mp4',
    target: 8,
    targetLabel: '8 ครั้ง/ข้าง',
    status: 'todo',
    accuracy: 66,
  },
  {
    id: 6,
    posture: 'standing',
    name: 'ก้าวเอื้อม (Forward Rock and Reach)',
    nameEn: 'Forward Rock and Reach',
    how: 'ยืนตรง ก้าวขาไปด้านหน้า แกว่งแขนซ้าย-ขวาสลับกัน ถ่ายเทน้ำหนักสลับระหว่างขาซ้าย-ขวา',
    target: 8,
    targetLabel: '8 ครั้ง/ข้าง',
    status: 'todo',
    accuracy: 71,
  },
  {
    id: 7,
    posture: 'standing',
    name: 'เอื้อมหมุน (Sideways Rock & Reach)',
    nameEn: 'Sideways Rock & Reach',
    how: 'ยืนตรง กางขาสองข้างให้กว้างกว่าระดับไหล่เล็กน้อย กางแขนออกด้านข้างให้สุดพร้อมหมุนลำตัวไปด้านข้าง กลับสู่ท่าเริ่มต้น',
    target: 8,
    targetLabel: '8 ครั้ง/ข้าง',
    status: 'todo',
    accuracy: 69,
  },
]

// LSVT LOUD — reduced scope to 2 core steps (spec §3.6).
// Breathing / oral-motor / pitch-glide drills are out of scope in this phase.
// `mode` selects which scoring axes apply:
//   'sustain' → ความดัง + ระยะเวลาออกเสียง · holdMin–holdTarget = ช่วงวินาทีที่ยอมรับ
//   'word'    → ความดัง + ความถูกต้องของคำ
// `scoreWord: false` ปิดการให้คะแนนคำ (step "อา" วัดแค่ความดัง + ระยะเวลา)
// `group` ใช้จัดหัวข้อในหน้ารายการฝึก
// The sustained-phonation "อา" step is fixed; the daily-life phrase steps are
// built from the therapist-curated list (loudPhrases) so editing them on the
// therapist side changes what the patient practises.
const SUSTAIN_STEP = {
  id: 1, group: 'ฝึกออกเสียงค้าง', name: 'ฝึกออกเสียงค้าง',
  detail: 'เปล่งเสียง "อา" ให้ดังและต่อเนื่อง — เป้าหมายค้างเสียง 5–7 วินาที',
  minutes: 5, phrase: 'อา', mode: 'sustain', scoreWord: false, holdMin: 5, holdTarget: 7, status: 'todo',
}

export function getLoudSteps() {
  return [
    SUSTAIN_STEP,
    ...loudPhrases.get().map((text, i) => ({
      id: i + 2,
      group: 'ประโยคในชีวิตประจำวัน',
      name: text,
      detail: 'พูดให้ดังและชัด',
      minutes: 2,
      phrase: text,
      mode: 'word',
      status: 'todo',
    })),
  ]
}

// Group LOUD steps by their `group` heading, preserving order.
export function groupLoudSteps(steps = getLoudSteps()) {
  const groups = []
  for (const s of steps) {
    let g = groups.find((g) => g.title === s.group)
    if (!g) { g = { title: s.group, steps: [] }; groups.push(g) }
    g.steps.push(s)
  }
  return groups
}

export const RELATIONSHIPS = [
  { value: 'child', label: 'บุตร/ธิดา' },
  { value: 'spouse', label: 'คู่สมรส' },
  { value: 'relative', label: 'ญาติ' },
  { value: 'other', label: 'อื่นๆ' },
]

// 7-day training frequency for charts (BIG vs LOUD counts)
export const WEEK_FREQUENCY = [
  { day: 'จ', big: 2, loud: 1 },
  { day: 'อ', big: 1, loud: 1 },
  { day: 'พ', big: 3, loud: 2 },
  { day: 'พฤ', big: 0, loud: 1 },
  { day: 'ศ', big: 2, loud: 2 },
  { day: 'ส', big: 3, loud: 1 },
  { day: 'อา', big: 1, loud: 0 },
]

export const HISTORY = [
  { date: '9 ก.ค. 2568', type: 'big', duration: '18 นาที', score: 86 },
  { date: '9 ก.ค. 2568', type: 'loud', duration: '9 นาที', score: 78 },
  { date: '8 ก.ค. 2568', type: 'big', duration: '20 นาที', score: 82 },
  { date: '7 ก.ค. 2568', type: 'loud', duration: '10 นาที', score: 74 },
  { date: '6 ก.ค. 2568', type: 'big', duration: '17 นาที', score: 80 },
]

export const emergencyContactsSeed = [
  { id: 'c1', name: 'สมหญิง ใจดี', relationship: 'บุตร/ธิดา', phone: '081-234-5678', priority: 1, source: 'registration' },
  { id: 'c2', name: 'มานพ ใจดี', relationship: 'คู่สมรส', phone: '089-111-2222', priority: 2, source: 'manual' },
]

// Therapist portal patient list. Spec §4.3
// `daysSince` = days since the last session (drives the "ไม่ได้ฝึก N วัน" flag),
// `totalDays` / `avgAccuracy` feed the detail-page stat cards, and `week` is the
// 7-day minutes series (oldest → today) for the training-time chart.
export const PATIENTS = [
  {
    id: 'p1', name: 'สมชาย ใจดี', stage: 'stage1', lastActive: 'วันนี้ 08:40',
    streak: 5, lastScore: 88, weekCount: 5, initials: 'สช',
    daysSince: 0, totalDays: 22, avgAccuracy: 86,
    week: [
      { big: 18, loud: 8 }, { big: 22, loud: 10 }, { big: 0, loud: 0 }, { big: 25, loud: 11 },
      { big: 15, loud: 7 }, { big: 20, loud: 9 }, { big: 0, loud: 0 },
    ],
  },
  {
    id: 'p2', name: 'นภาพร ชื่นใจ', stage: 'stage1', lastActive: 'เมื่อวาน',
    streak: 2, lastScore: 64, weekCount: 3, initials: 'นภ',
    daysSince: 1, totalDays: 11, avgAccuracy: 68,
    week: [
      { big: 0, loud: 0 }, { big: 14, loud: 6 }, { big: 0, loud: 0 }, { big: 12, loud: 8 },
      { big: 0, loud: 0 }, { big: 16, loud: 5 }, { big: 0, loud: 0 },
    ],
  },
  {
    id: 'p3', name: 'วิชัย ถาวรกุล', stage: 'stage2', lastActive: '4 วันก่อน',
    streak: 0, lastScore: 41, weekCount: 1, initials: 'วช',
    daysSince: 4, totalDays: 6, avgAccuracy: 52,
    week: [
      { big: 10, loud: 4 }, { big: 0, loud: 0 }, { big: 0, loud: 0 }, { big: 0, loud: 0 },
      { big: 0, loud: 0 }, { big: 0, loud: 0 }, { big: 0, loud: 0 },
    ],
  },
]

export const CHAT_SEED = [
  { id: 'm1', from: 'therapist', text: 'สวัสดีครับคุณสมชาย สัปดาห์นี้ฝึกได้ดีมากครับ ท่า Sit-to-Stand ดีขึ้นเยอะเลย', at: 'เมื่อวาน 14:20' },
  { id: 'm2', from: 'patient', text: 'ขอบคุณครับคุณหมอ ช่วงนี้รู้สึกลุกนั่งคล่องขึ้นจริงๆ', at: 'เมื่อวาน 15:02' },
  { id: 'm3', from: 'therapist', text: 'เยี่ยมเลยครับ ลองเพิ่มท่าเขย่งเท้าให้ครบ 10 ครั้งนะครับ แล้วมาอัปเดตกัน', at: 'เมื่อวาน 15:10' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Therapist directory — powers the tap-only region→hospital→therapist selection
// (spec §3.3 patient onboarding + §4.2 therapist register). Stands in for the
// Firestore `hospitals` + `therapists` collections. Patients only ever see
// hospitals with status "approved" and therapists with verificationStatus
// "active" — mirrored here by only listing verified entries.
// ─────────────────────────────────────────────────────────────────────────────

export const REGIONS = [
  'ภาคกลาง',
  'ภาคเหนือ',
  'ภาคตะวันออกเฉียงเหนือ',
  'ภาคใต้',
  'ภาคตะวันออก',
  'ภาคตะวันตก',
]

// region → hospital names (approved). Sourced from rehabai_web_mockup_full.html.
export const REGION_HOSPITALS = {
  'ภาคกลาง': ['โรงพยาบาลศิริราช', 'โรงพยาบาลจุฬาลงกรณ์', 'โรงพยาบาลรามาธิบดี', 'โรงพยาบาลพระมงกุฎเกล้า', 'โรงพยาบาลราชวิถี', 'โรงพยาบาลวชิรพยาบาล', 'โรงพยาบาลตำรวจ', 'โรงพยาบาลภูมิพลอดุลยเดช', 'โรงพยาบาลบำรุงราษฎร์', 'โรงพยาบาลสมิติเวช', 'โรงพยาบาลกรุงเทพ', 'โรงพยาบาลพระนั่งเกล้า (นนทบุรี)', 'โรงพยาบาลปทุมธานี', 'โรงพยาบาลสมุทรปราการ', 'โรงพยาบาลสมุทรสาคร', 'โรงพยาบาลสมุทรสงคราม', 'โรงพยาบาลนครปฐม', 'โรงพยาบาลพระนครศรีอยุธยา', 'โรงพยาบาลสระบุรี', 'โรงพยาบาลลพบุรี', 'โรงพยาบาลอ่างทอง', 'โรงพยาบาลสิงห์บุรี', 'โรงพยาบาลชัยนาท', 'โรงพยาบาลเจ้าพระยายมราช (สุพรรณบุรี)'],
  'ภาคเหนือ': ['โรงพยาบาลมหาราชนครเชียงใหม่', 'โรงพยาบาลนครพิงค์', 'โรงพยาบาลลำปาง', 'โรงพยาบาลลำพูน', 'โรงพยาบาลพุทธชินราช (พิษณุโลก)', 'โรงพยาบาลแพร่', 'โรงพยาบาลน่าน', 'โรงพยาบาลพะเยา', 'โรงพยาบาลเชียงรายประชานุเคราะห์', 'โรงพยาบาลแม่สอด (ตาก)', 'โรงพยาบาลตาก', 'โรงพยาบาลสุโขทัย', 'โรงพยาบาลอุตรดิตถ์', 'โรงพยาบาลกำแพงเพชร', 'โรงพยาบาลพิจิตร', 'โรงพยาบาลเพชรบูรณ์', 'โรงพยาบาลแม่ฮ่องสอน'],
  'ภาคตะวันออกเฉียงเหนือ': ['โรงพยาบาลศรีนครินทร์ (ขอนแก่น)', 'โรงพยาบาลขอนแก่น', 'โรงพยาบาลอุดรธานี', 'โรงพยาบาลมหาสารคาม', 'โรงพยาบาลสรรพสิทธิประสงค์ (อุบลราชธานี)', 'โรงพยาบาลบุรีรัมย์', 'โรงพยาบาลมหาราชนครราชสีมา', 'โรงพยาบาลร้อยเอ็ด', 'โรงพยาบาลชัยภูมิ', 'โรงพยาบาลหนองคาย', 'โรงพยาบาลเลย', 'โรงพยาบาลสกลนคร', 'โรงพยาบาลนครพนม', 'โรงพยาบาลมุกดาหาร', 'โรงพยาบาลกาฬสินธุ์', 'โรงพยาบาลยโสธร', 'โรงพยาบาลอำนาจเจริญ', 'โรงพยาบาลศรีสะเกษ', 'โรงพยาบาลสุรินทร์', 'โรงพยาบาลหนองบัวลำภู', 'โรงพยาบาลบึงกาฬ'],
  'ภาคใต้': ['โรงพยาบาลสงขลานครินทร์ (หาดใหญ่)', 'โรงพยาบาลสุราษฎร์ธานี', 'โรงพยาบาลวชิระภูเก็ต', 'โรงพยาบาลตรัง', 'โรงพยาบาลยะลา', 'โรงพยาบาลมหาราชนครศรีธรรมราช', 'โรงพยาบาลกระบี่', 'โรงพยาบาลชุมพร', 'โรงพยาบาลระนอง', 'โรงพยาบาลพังงา', 'โรงพยาบาลพัทลุง', 'โรงพยาบาลสตูล', 'โรงพยาบาลปัตตานี', 'โรงพยาบาลนราธิวาส'],
  'ภาคตะวันออก': ['โรงพยาบาลชลบุรี', 'โรงพยาบาลพระปกเกล้า (จันทบุรี)', 'โรงพยาบาลระยอง', 'โรงพยาบาลสมเด็จพระบรมราชเทวี ณ ศรีราชา', 'โรงพยาบาลตราด', 'โรงพยาบาลฉะเชิงเทรา', 'โรงพยาบาลปราจีนบุรี', 'โรงพยาบาลสระแก้ว', 'โรงพยาบาลนครนายก'],
  'ภาคตะวันตก': ['โรงพยาบาลราชบุรี', 'โรงพยาบาลเพชรบุรี', 'โรงพยาบาลหัวหิน', 'โรงพยาบาลกาญจนบุรี', 'โรงพยาบาลประจวบคีรีขันธ์', 'โรงพยาบาลบ้านโป่ง (ราชบุรี)'],
}

// Corporate email domains bound to some hospitals — used for the therapist
// register real-time soft-signal check (spec §4.2). null / missing = no domain
// on file → falls straight through to manual review.
export const HOSPITAL_DOMAINS = {
  'โรงพยาบาลศิริราช': 'si.mahidol.ac.th',
  'โรงพยาบาลรามาธิบดี': 'mahidol.ac.th',
  'โรงพยาบาลจุฬาลงกรณ์': 'chula.ac.th',
  'โรงพยาบาลมหาราชนครเชียงใหม่': 'cmu.ac.th',
  'โรงพยาบาลสงขลานครินทร์ (หาดใหญ่)': 'psu.ac.th',
  'โรงพยาบาลศรีนครินทร์ (ขอนแก่น)': 'kku.ac.th',
}

// Hospital-specific verified therapists. Any hospital not listed falls back to
// DEFAULT_THERAPISTS so the flow always has selectable, verified names.
const DEFAULT_THERAPISTS = [
  { name: 'กภ.สมชาย ใจเย็น', pos: 'นักกายภาพบำบัด' },
  { name: 'กภ.สมหญิง ประเสริฐ', pos: 'นักกายภาพบำบัดอาวุโส' },
]

export const HOSPITAL_THERAPISTS = {
  'โรงพยาบาลศิริราช': [
    { name: 'กภ.สุนิสา รักษ์ดี', pos: 'นักกายภาพบำบัด (แผนกเวชศาสตร์ฟื้นฟู)' },
    { name: 'กภ.อรุณี แสงใส', pos: 'นักกายภาพบำบัดอาวุโส (แผนกเวชศาสตร์ฟื้นฟู)' },
    { name: 'กภ.วิชาญ ทองดี', pos: 'หัวหน้าแผนกกายภาพบำบัด' },
  ],
}

// Verified (verificationStatus === "active") therapists for a hospital.
export function therapistsForHospital(hospital) {
  return HOSPITAL_THERAPISTS[hospital] || DEFAULT_THERAPISTS
}

// ─── Garden / village (mockup sections #village and #garden) ────────────────
// Gamification layer: one training day plants one tree, and the accumulated
// tree count decides the garden's level. Mock stand-in for Firestore.

export const GARDEN_LEVELS = [
  { level: 1, name: 'ต้นกล้าต้นแรก', trees: 1, time: 'วันแรก', reward: 'ต้นกล้า 1 ต้น' },
  { level: 2, name: 'แปลงผักเล็ก', trees: 3, time: 'สัปดาห์แรก', reward: 'แปลงผักหน้าบ้าน' },
  { level: 3, name: 'สวนหย่อม', trees: 7, time: 'ประมาณ 2 สัปดาห์', reward: 'รั้วไม้ + ดอกไม้' },
  { level: 4, name: 'สวนดอกไม้', trees: 16, time: 'ประมาณ 1 เดือน', reward: 'ดอกไม้หลายสี' },
  { level: 5, name: 'สวนผลไม้', trees: 30, time: 'ประมาณ 2 เดือน', reward: 'ต้นไม้ออกผล' },
  { level: 6, name: 'สวนป่าร่มรื่น', trees: 60, time: 'ประมาณ 3–4 เดือน', reward: 'บ่อน้ำ + ต้นไม้ใหญ่' },
  { level: 7, name: 'สวนพฤกษาริมน้ำ', trees: 100, time: 'ประมาณ 6 เดือน', reward: 'ศาลา + ลำธาร' },
]

// Highest level whose tree requirement is met (level 1 until the first tree).
export function gardenLevelOf(trees) {
  let current = GARDEN_LEVELS[0]
  for (const l of GARDEN_LEVELS) if (trees >= l.trees) current = l
  return current
}

// The level after the current one, or null at the top.
export function nextGardenLevel(trees) {
  return GARDEN_LEVELS.find((l) => l.trees > trees) || null
}

export const MY_GARDEN = { trees: 22, streak: 5, totalDays: 22 }

// Neighbours ringing the player's plot. left/top are percentages of the map
// box, taken from the mockup so the ring keeps its shape at any size.
export const VILLAGE_NEIGHBORS = [
  { id: 1, name: 'ป้าแดง', trees: 104, streak: 21, watered: 12, left: 43.12, top: 3.18 },
  { id: 2, name: 'ลุงสมพงษ์', trees: 63, streak: 9, watered: 7, left: 64.44, top: 9.0 },
  { id: 3, name: 'ยายบุญมี', trees: 41, streak: 6, watered: 4, left: 78.94, top: 24.73 },
  { id: 4, name: 'น้าจันทร์', trees: 18, streak: 3, watered: 9, left: 82.12, top: 45.27 },
  { id: 5, name: 'ตาจ่อย', trees: 72, streak: 14, watered: 2, left: 72.88, top: 64.09 },
  { id: 6, name: 'ป้าสมศรี', trees: 35, streak: 4, watered: 5, left: 54.19, top: 75.36 },
  { id: 7, name: 'ตาเปี๊ยก', trees: 9, streak: 2, watered: 1, left: 32.06, top: 75.36 },
  { id: 8, name: 'น้าแอ๊ด', trees: 12, streak: 5, watered: 3, left: 13.38, top: 64.09 },
  { id: 9, name: 'ยายหอม', trees: 25, streak: 7, watered: 6, left: 4.12, top: 45.27 },
  { id: 10, name: 'ลุงเฉลิม', trees: 4, streak: 1, watered: 0, left: 7.31, top: 24.73 },
  { id: 11, name: 'พี่หนึ่ง', trees: 1, streak: 1, watered: 0, left: 21.81, top: 9.0 },
]

// The player's own plot sits in the middle of the ring.
export const MY_PLOT = { left: 36.88, top: 30.45, width: 26.25 }
export const NEIGHBOR_PLOT_WIDTH = 13.75

export const GARDEN_WATERINGS = [
  { name: 'ป้าแดง', when: 'เมื่อเช้า' },
  { name: 'ลุงสมพงษ์', when: 'เมื่อวาน' },
  { name: 'น้าจันทร์', when: '2 วันก่อน' },
]

export const GARDEN_CHEERS = [
  { text: 'วันนี้ก็ทำได้ดี', from: 'ป้าแดง', when: 'เมื่อเช้า' },
  { text: 'สู้ ๆ นะ', from: 'ยายบุญมี', when: 'เมื่อวาน' },
]

export const CHEER_MESSAGES = ['สู้ ๆ นะ', 'เก่งมาก ฝึกต่อไปนะ', 'วันนี้ก็ทำได้ดี', 'เป็นกำลังใจให้เสมอ']

export const GARDEN_RULES = [
  {
    title: 'วันไหนนับเป็น 1 ต้น',
    detail: 'ฝึกจบอย่างน้อย 1 โปรแกรมของวันนั้น (ฝึกเคลื่อนไหวครบทุกท่า หรือฝึกเสียงพูดครบทุกขั้นตอน)',
  },
  {
    title: 'ระดับดูจากต้นไม้สะสม',
    detail: 'นับรวมทุกวันที่ฝึก ไม่ต้องติดต่อกัน ต้นไม้ไม่ตาย และระดับไม่ลดลง',
  },
  {
    title: 'ของตกแต่งพิเศษ',
    detail: 'ฝึกครบ 4 วันในสัปดาห์ ต้นไม้ออกผล · ฝึกครบทั้ง 2 โปรแกรมในวันเดียวกัน ได้ของตกแต่งเพิ่ม',
  },
  {
    title: 'กำลังใจจากเพื่อน',
    detail: 'เพื่อนมารดน้ำหรือส่งกำลังใจ ดอกไม้ในสวนบานเพิ่ม แต่ไม่นับเป็นต้นไม้',
  },
]

// ─── Community (mockup sections #community and #communitypost) ──────────────
// Peer-support feed. Mock stand-in for Firestore; comments are keyed by post id.

export const COMMUNITY_TOPICS = ['ประสบการณ์', 'ชะลออาการ', 'ชวนทำกิจกรรม', 'ให้กำลังใจ']

// Pill colours per topic, straight from the mockup.
export const TOPIC_STYLES = {
  ประสบการณ์: { background: '#E0F1FA', color: '#0B3550' },
  ชะลออาการ: { background: '#E3F1DC', color: '#24661A' },
  ชวนทำกิจกรรม: { background: '#FFF1C7', color: '#6B4A00' },
  ให้กำลังใจ: { background: '#EEE8FA', color: '#4B2A86' },
}

// `verified` marks a therapist account (teal badge); otherwise the badge shows
// how long the member has lived with Parkinson's.
export const COMMUNITY_POSTS = [
  {
    id: 1,
    author: 'ป้าแดง',
    badge: 'เป็นมา 4 ปี',
    when: '2 ชั่วโมงที่แล้ว',
    topic: 'ประสบการณ์',
    body: 'ช่วงแรกมือสั่นจนติดกระดุมเสื้อเองไม่ได้ ท้อมาก ตอนนี้ฝึกทุกเช้าวันละ 20 นาที ติดต่อกันมา 3 เดือน รู้สึกว่าเดินมั่นคงขึ้น ติดกระดุมได้เองแล้ว ใครเพิ่งเริ่มอย่าเพิ่งท้อนะคะ ค่อย ๆ ไปทีละวัน',
    cheers: 128, comments: 24, shares: 6,
    memberFor: 'สมาชิก 7 เดือน · 42 โพสต์', streak: 21, gardenLevel: 7,
  },
  {
    id: 2,
    author: 'กภ.สุนิสา รักษ์ดี',
    verified: true,
    badge: 'นักกายภาพยืนยันแล้ว',
    when: 'เมื่อเช้า',
    topic: 'ชะลออาการ',
    body: 'เคล็ดลับวันนี้: ตอนเดินให้ก้าวยาว ๆ และแกว่งแขนให้สุด ทำวันละ 10 นาที ช่วยฝึกการทรงตัวและลดการเดินซอยเท้า ควรมีคนอยู่ใกล้ ๆ หรือเดินข้างราวจับนะครับ มีคำถามถามใต้โพสต์นี้ได้เลย',
    cheers: 96, comments: 31, shares: 40,
    memberFor: 'นักกายภาพบำบัด · โรงพยาบาลศิริราช',
  },
  {
    id: 3,
    author: 'ลุงสมพงษ์',
    badge: 'เป็นมา 2 ปี',
    when: 'เมื่อวาน',
    topic: 'ชวนทำกิจกรรม',
    body: 'ใครอยู่แถวสีลมมารำไทชิด้วยกันไหมครับ ช้า ๆ ไม่หนัก ผมไปมา 2 เดือน ได้เพื่อนเยอะ ใจก็สบายขึ้น ใครไปไม่ไหวมาเป็นกำลังใจทางนี้ได้ครับ',
    cheers: 54, comments: 18, shares: 9,
    memberFor: 'สมาชิก 1 ปี · 15 โพสต์', streak: 9, gardenLevel: 6,
    event: { month: 'พ.ย.', day: 15, title: 'รำไทชิเช้าวันเสาร์', time: '07:00–08:00 น.', place: 'สวนลุมพินี ประตูฝั่งสีลม', going: 12 },
  },
  {
    id: 4,
    author: 'น้าจันทร์',
    badge: 'เป็นมา 1 ปี',
    when: '2 วันก่อน',
    topic: 'ให้กำลังใจ',
    body: 'วันนี้หลานบอกว่าได้ยินยายพูดชัดขึ้นเยอะ ดีใจจนน้ำตาซึม ขอบคุณทุกคนในกลุ่มที่คอยส่งกำลังใจกันนะคะ ถ้าใครเหนื่อยวันนี้ ส่งกำลังใจให้ค่ะ สู้ไปด้วยกัน',
    cheers: 211, comments: 47, shares: 12,
    memberFor: 'สมาชิก 4 เดือน · 9 โพสต์', streak: 3, gardenLevel: 4,
  },
]

// `reply: true` indents the comment under the one above it.
export const COMMUNITY_COMMENTS = {
  1: [
    { id: 1, author: 'น้าจันทร์', badge: 'เป็นมา 1 ปี', when: '1 ชั่วโมงที่แล้ว', cheers: 18, body: 'อ่านแล้วมีกำลังใจขึ้นเยอะเลยค่ะป้า ฉันก็ติดกระดุมยากเหมือนกัน จะลองฝึกทุกเช้าดูค่ะ' },
    { id: 2, author: 'ป้าแดง', badge: 'เจ้าของโพสต์', when: '50 นาทีที่แล้ว', cheers: 12, reply: true, body: 'สู้ ๆ นะน้า ช่วงแรกฝึกแค่ 5 นาทีก่อนก็ได้ ไม่ต้องหักโหม' },
    { id: 3, author: 'กภ.สุนิสา รักษ์ดี', verified: true, badge: 'นักกายภาพยืนยันแล้ว', when: '30 นาทีที่แล้ว', cheers: 34, body: 'ดีใจด้วยครับป้าแดง การฝึกสม่ำเสมอสำคัญที่สุด ส่วนการติดกระดุม ลองฝึกหยิบเหรียญใส่กระปุกวันละนิดช่วยเรื่องนิ้วมือได้ครับ' },
    { id: 4, author: 'ลุงสมพงษ์', badge: 'เป็นมา 2 ปี', when: '10 นาทีที่แล้ว', cheers: 7, body: 'เป็นกำลังใจให้ครับ วันเสาร์มารำไทชิด้วยกันนะครับป้า' },
  ],
}

export const QUICK_COMMENTS = ['สู้ ๆ นะคะ', 'ขอบคุณที่แบ่งปัน', 'เป็นกำลังใจให้', 'ขอลองทำตามบ้าง']

export const COMMUNITY_EVENTS = [
  { id: 1, month: 'พ.ย.', day: 15, title: 'รำไทชิเช้าวันเสาร์', place: 'สวนลุมพินี', going: 12, tint: '#FFF6E0' },
  { id: 2, month: 'พ.ย.', day: 20, title: 'ร้องเพลงฝึกเสียง', place: 'ออนไลน์', going: 26, tint: '#E0F1FA' },
]

export const COMMUNITY_TAGS = [
  { tag: '#เดินทุกเช้า', posts: 86 },
  { tag: '#ไทชิ', posts: 41 },
  { tag: '#ร้องเพลงฝึกเสียง', posts: 33 },
  { tag: '#นอนหลับสบาย', posts: 28 },
]

export const COMMUNITY_RULES = [
  'พูดกันด้วยความสุภาพและเห็นใจ',
  'ห้ามขายยา อาหารเสริม หรือชวนลงทุน',
  'เรื่องยาและการรักษา ปรึกษาแพทย์ก่อนทำตามเสมอ',
  'เห็นโพสต์ไม่เหมาะสม กดรายงานได้',
]

export const COMMUNITY_DISCLAIMER =
  'เนื้อหาในชุมชนเป็นประสบการณ์ส่วนตัว ไม่ใช่คำแนะนำทางการแพทย์ เรื่องยาและการรักษาควรปรึกษาแพทย์ของคุณก่อนเสมอ'
