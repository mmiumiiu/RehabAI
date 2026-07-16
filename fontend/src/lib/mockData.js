// Mock data + domain constants derived directly from RehabAI_Build_Spec.md.
// This stands in for Firestore; the service layer (lib/services.js) reads from here.

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
    how: 'นั่งริมขอบเก้าอี้ หมุนลำตัวและแขนไปด้านตรงข้ามให้สุด ค้างไว้ 10 วินาที ทำสลับซ้าย-ขวา',
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
    how: 'ยืนตรง ก้าวขาไปด้านข้างพร้อมกางแขนสองข้างไปทางด้านหลังให้สุด แล้วกลับสู่ท่าเริ่มต้น',
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
    how: 'ยืนตรง มือยกขึ้นกระดูกข้อมือ ก้าวขาไปด้านหลัง ก้มลำตัว ผลักแขนสองข้างไปด้านหลังให้สุด — ท่าที่เสี่ยงหกล้มมากที่สุดในชุดนี้ กดปุ่ม SOS ได้ตลอดเวลาระหว่างฝึก',
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
    how: 'ยืนตรง ก้าวขาไปด้านหน้า เอื้อมแขนหน้า-หลังสลับกันโยกตัวไปมา',
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
    how: 'ยืนตรง กางขาสองข้าง กางแขนและหมุนลำตัวไปด้านข้างให้สุด แล้วกลับสู่ท่าเริ่มต้น',
    target: 8,
    targetLabel: '8 ครั้ง/ข้าง',
    status: 'todo',
    accuracy: 69,
  },
]

// LSVT LOUD — reduced scope to 2 core steps (spec §3.6).
// Breathing / oral-motor / pitch-glide drills are out of scope in this phase.
export const LOUD_STEPS = [
  { id: 1, name: 'ฝึกความดังเสียง', detail: 'เปล่งเสียง "อาา" ให้ดังและยาวที่สุด — เป้าหมาย dB อ้างอิงค่าที่นักกายภาพบำบัดตั้งไว้เฉพาะคุณ', minutes: 5, phrase: 'อาาาาา', status: 'todo' },
  { id: 2, name: 'พูดในชีวิตประจำวัน', detail: 'ฝึกพูดประโยคที่ใช้บ่อยด้วยเสียงดังชัด', minutes: 5, phrase: 'สวัสดีครับ วันนี้อากาศดี', status: 'todo' },
]

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
export const PATIENTS = [
  {
    id: 'p1', name: 'สมชาย ใจดี', stage: 'stage1', lastActive: '2 ชม. ที่แล้ว',
    streak: 5, lastScore: 86, weekCount: 4, initials: 'สช',
  },
  {
    id: 'p2', name: 'วิภา สุขสันต์', stage: 'stage2', lastActive: 'เมื่อวานนี้',
    streak: 12, lastScore: 79, weekCount: 6, initials: 'วภ',
  },
  {
    id: 'p3', name: 'ประเสริฐ มั่นคง', stage: 'stage1', lastActive: '3 วันที่แล้ว',
    streak: 0, lastScore: 71, weekCount: 1, initials: 'ปส',
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
