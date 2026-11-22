import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Check } from '../../components/icons.jsx'

const XMark = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

// Shown once, right after a patient signs up. Presents the Privacy Notice and a
// consent form; the required consents must be ticked before "ยินยอมและดำเนินการต่อ"
// is enabled. "ไม่ยินยอม" signs the new account out and returns to login.
export default function PrivacyConsent() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [c, setC] = useState({ read: false, health: false, lineNotify: false, lineSOS: false })
  const set = (k) => (e) => setC((v) => ({ ...v, [k]: e.target.checked }))
  const canProceed = c.read && c.health

  async function decline() {
    try { await signOut() } finally { navigate('/register') }
  }
  function accept() {
    if (!canProceed) return
    // Persist the choices alongside the account (best-effort; localStorage stub).
    try {
      localStorage.setItem('rehabai_consent', JSON.stringify({ ...c, at: new Date().toISOString() }))
    } catch { /* ignore */ }
    navigate('/onboarding/select-therapist')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8" style={{ background: '#D8D3F3' }}>
      <div className="w-full max-w-[720px] bg-white rounded-[22px] overflow-hidden flex flex-col max-h-[92vh]" style={{ boxShadow: '0 20px 50px rgba(30,40,80,.25)' }}>

        {/* header */}
        <div className="px-6 md:px-8 pt-6 pb-4 border-b border-line flex items-center gap-3.5 flex-shrink-0">
          <div className="w-11 h-11 rounded-[13px] bg-white border border-line flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="RehabAI" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="font-heading text-[19px] font-semibold text-ink-primary leading-tight">ประกาศความเป็นส่วนตัวและหนังสือให้ความยินยอม</h1>
            <p className="text-[12.5px] text-ink-muted">Privacy Notice &amp; Consent · สำหรับผู้ป่วยผู้ใช้งาน RehabAI · ปรับปรุงล่าสุด 21 สิงหาคม 2569</p>
          </div>
        </div>

        {/* scrollable notice */}
        <div className="overflow-y-auto thin-scroll px-6 md:px-8 py-5 text-[13.5px] leading-relaxed text-ink-secondary space-y-4">
          <p>
            RehabAI (“แอปพลิเคชัน” หรือ “เรา”) ให้ความสำคัญกับความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคลของท่าน
            ก่อนเริ่มใช้งาน โปรดอ่านประกาศฉบับนี้เพื่อทำความเข้าใจว่าเราเก็บรวบรวม ใช้ เปิดเผย และจัดเก็บข้อมูลส่วนบุคคลของท่านอย่างไร
          </p>
          <p>
            ข้อมูลบางประเภทที่ RehabAI เก็บรวบรวม เช่น ระยะของโรคพาร์กินสัน ผลการประเมินท่าทาง ผลการฝึก และข้อมูลเสียง
            ถือเป็น <b>ข้อมูลสุขภาพซึ่งเป็นข้อมูลส่วนบุคคลที่มีความอ่อนไหว (Sensitive Personal Data)</b> ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
            พ.ศ. 2562 (“PDPA”) การประมวลผลข้อมูลดังกล่าวจะดำเนินการตามฐานทางกฎหมายที่เกี่ยวข้อง และในกรณีที่กฎหมายกำหนด
            เราจะขอความยินยอมโดยชัดแจ้งจากท่าน
          </p>

          <Section title="1. ข้อมูลส่วนบุคคลที่เราเก็บรวบรวม">
            <b>1.1 ข้อมูลบัญชีและข้อมูลระบุตัวตน</b> — ชื่อและนามสกุล, อีเมล, ข้อมูลสำหรับสมัคร/เข้าสู่ระบบ และข้อมูลบัญชีที่จัดการผ่าน Firebase Authentication
            (RehabAI ไม่จัดเก็บรหัสผ่านของท่านในรูปแบบข้อความที่อ่านได้โดยตรง)
            <br /><b>1.2 ข้อมูลสุขภาพ</b> — ระยะของโรคพาร์กินสัน (Hoehn &amp; Yahr ระยะ 1–2), ผลประเมินท่าทาง/การเคลื่อนไหว,
            พิกัดตำแหน่งข้อต่อจาก Pose Estimation, ผลประเมินเสียงพูดและระดับความดัง, คะแนน ประวัติการฝึก และพัฒนาการด้านการฟื้นฟู
            <br /><b>1.3 ข้อมูลเกี่ยวกับการรักษา</b> — ภาค, โรงพยาบาล และนักกายภาพบำบัดที่ท่านเลือกเชื่อมโยงบัญชี
            (ต้องเคยพบนักกายภาพบำบัดอย่างน้อย 1 ครั้งก่อนสมัครใช้งาน)
            <br /><b>1.4 ข้อมูลการเชื่อมต่อ LINE</b> — LINE User ID, สถานะการเชื่อมต่อกับ LINE OA และข้อมูลที่จำเป็นสำหรับการส่งการแจ้งเตือน
            <br /><b>1.5 ข้อมูลผู้ติดต่อฉุกเฉิน</b> — ชื่อ, ความสัมพันธ์, หมายเลขโทรศัพท์, LINE User ID/สถานะการเชื่อมต่อ
            (หมายเลขใช้สำหรับปุ่ม “โทรทันที” ที่ผู้ใช้กดเอง ไม่ใช้ส่ง SMS อัตโนมัติ)
            <br /><b>1.6 ข้อมูลการสื่อสาร</b> — ข้อความแชทระหว่างท่านกับนักกายภาพบำบัด
            <br /><b>1.7 ข้อมูลภาพและเสียงระหว่างการฝึก</b> — ประมวลผลแบบเรียลไทม์เพื่อวิเคราะห์ท่าทาง/เสียง โดยประมวลผลหลักบนอุปกรณ์ของผู้ใช้ (Client-side)
            และไม่ส่งวิดีโอ/เสียงดิบไปยังบริการ AI ภายนอก เว้นแต่ผู้ใช้เลือกใช้ฟังก์ชันอื่นที่มีการแจ้งให้ทราบ
            <br /><b>1.8 ข้อมูลการใช้งาน</b> — ประวัติการเข้าใช้งาน, คะแนน, จำนวน/ระยะเวลาการฝึก, การตั้งค่าตารางฝึกและการแจ้งเตือน และข้อมูลทางเทคนิคที่จำเป็น
          </Section>

          <Section title="2. วัตถุประสงค์ในการใช้ข้อมูล">
            สร้างบัญชีและยืนยันตัวตน, เชื่อมโยงกับโรงพยาบาล/นักกายภาพบำบัด, ให้บริการฝึก LSVT BIG และ LSVT LOUD,
            วิเคราะห์ท่าทางและเสียงแบบเรียลไทม์, คำนวณคะแนนและแสดงผลป้อนกลับ, บันทึกประวัติและแสดงความคืบหน้าผ่าน Dashboard,
            ให้นักกายภาพบำบัดติดตามพัฒนาการ, ให้บริการแชท, ส่งการแจ้งเตือนผ่าน LINE OA, ดำเนินการระบบ SOS,
            รักษาความปลอดภัยของระบบ และปฏิบัติตามกฎหมาย
          </Section>

          <Section title="3. การแจ้งเตือนผ่าน LINE Official Account">
            RehabAI ใช้ LINE OA (“LINE RehabAI”) สำหรับการแจ้งเตือนตารางฝึก (เป็นทางเลือก ไม่กระทบฟังก์ชันหลัก)
            และการแจ้งเหตุฉุกเฉิน โดยผู้ติดต่อฉุกเฉินต้องเพิ่มเพื่อนและเชื่อมต่อ LINE OA ผ่าน QR Code/ลิงก์เชิญก่อนจึงจะรับข้อความได้
            RehabAI ไม่ใช้ SMS, Twilio หรือ SMS Gateway สำหรับการแจ้งเตือนอัตโนมัติ
          </Section>

          <Section title="4. ระบบ SOS และเหตุฉุกเฉิน">
            เมื่อตรวจพบการหกล้มหรือเมื่อกดปุ่ม SOS ระบบอาจแสดงสถานะแจ้งเหตุ, ส่งข้อความผ่าน LINE OA ไปยังผู้ติดต่อฉุกเฉินที่เชื่อมต่อสำเร็จ,
            เริ่มนับถอยหลัง และโทรไปสายด่วน 1669 ตามเงื่อนไขของระบบ
            RehabAI เป็นเครื่องมือสนับสนุน ไม่ควรใช้เป็นช่องทางเดียวในภาวะฉุกเฉิน และระบบอัตโนมัติอาจได้รับผลกระทบจากอินเทอร์เน็ต/อุปกรณ์/การเชื่อมต่อ LINE
          </Section>

          <Section title="5. การใช้ข้อมูลกับระบบปัญญาประดิษฐ์ (AI)">
            แบบจำลอง AI เช่น QualityNet พัฒนา/ฝึกจากชุดข้อมูลสาธารณะ เช่น UI-PRMD, Italian Parkinson’s Voice and Speech Dataset และ REHAB24-6
            RehabAI จะไม่นำข้อมูลภาพ เสียง หรือข้อมูลส่วนบุคคลของผู้ป่วยจากการใช้งานจริงไปฝึก/ปรับปรุงแบบจำลองภายใต้วัตถุประสงค์ปัจจุบัน
            หากในอนาคตมีวัตถุประสงค์ดังกล่าว จะแจ้งรายละเอียดและขอความยินยอมเพิ่มเติมแยกต่างหากก่อน
          </Section>

          <Section title="6. ความจำเป็นในการให้ข้อมูล">
            ข้อมูลบัญชี/สุขภาพ/โรงพยาบาลและนักกายภาพบำบัด จำเป็นต่อการให้บริการหลัก; ข้อมูลผู้ติดต่อฉุกเฉินและการเชื่อมต่อ LINE ของผู้ใช้เป็นทางเลือก;
            สิทธิ์กล้อง/ไมโครโฟนจำเป็นสำหรับ LSVT BIG และ LSVT LOUD (หากไม่อนุญาตยังใช้ส่วนอื่นได้)
          </Section>

          <Section title="7. การเปิดเผยข้อมูลแก่บุคคลภายนอก">
            อาจเปิดเผยเท่าที่จำเป็นแก่ นักกายภาพบำบัดที่ดูแลท่าน, Firebase/Google Cloud, LY Corporation (LINE OA),
            ผู้ติดต่อฉุกเฉินที่ท่านกำหนด, หน่วยบริการการแพทย์ฉุกเฉิน/1669 และหน่วยงานรัฐตามกฎหมาย
            เราจะไม่จำหน่ายหรือเปิดเผยข้อมูลเพื่อการตลาดของบุคคลภายนอกโดยไม่มีฐานทางกฎหมาย
          </Section>

          <Section title="8. การส่งหรือโอนข้อมูลไปต่างประเทศ">
            ผู้ให้บริการบางราย (เช่น Google/Firebase, LY Corporation) อาจมีเซิร์ฟเวอร์นอกประเทศไทย ข้อมูลบางประเภทจึงอาจถูกส่ง/ประมวลผลในต่างประเทศ
            โดยดำเนินการตามหลักเกณฑ์ของกฎหมายคุ้มครองข้อมูลส่วนบุคคลและใช้มาตรการที่เหมาะสม
          </Section>

          <Section title="9. ระยะเวลาในการเก็บรักษาข้อมูล">
            เก็บตลอดระยะเวลาที่บัญชีเปิดใช้งานหรือเท่าที่จำเป็น หลังปิดบัญชีจะเก็บไม่เกิน 2 ปี เว้นแต่กฎหมายกำหนดหรือมีความจำเป็นทางกฎหมาย
            เมื่อพ้นระยะเวลาจะลบ ทำลาย หรือทำให้ข้อมูลไม่สามารถระบุตัวบุคคลได้
          </Section>

          <Section title="10. สิทธิของเจ้าของข้อมูลส่วนบุคคล">
            ท่านอาจมีสิทธิ ขอเข้าถึง/รับสำเนา, แก้ไข, ลบ/ทำลาย, ระงับการใช้, คัดค้านการประมวลผล, ขอรับ/โอนข้อมูล, ถอนความยินยอม
            และร้องเรียนต่อหน่วยงานกำกับดูแล การถอนความยินยอมไม่กระทบการประมวลผลที่ชอบด้วยกฎหมายก่อนหน้า
            และอาจทำให้ไม่สามารถให้บริการบางส่วนได้
          </Section>

          <Section title="11. การรักษาความมั่นคงปลอดภัยของข้อมูล">
            ใช้มาตรการทางเทคนิคและการจัดการที่เหมาะสม รวมถึงบริการ Authentication และฐานข้อมูลของ Firebase/Google Cloud
            และการควบคุมสิทธิ์การเข้าถึงตามบทบาทของผู้ใช้งาน
          </Section>

          <Section title="12. ผู้ควบคุมข้อมูลส่วนบุคคลและช่องทางติดต่อ">
            ทีมพัฒนาแอปพลิเคชัน RehabAI · โครงการ “การพัฒนาระบบกายภาพสำหรับผู้ป่วยโรคพาร์กินสัน โดยวิธี LSVT BIG และ LSVT LOUD ผ่านอุปกรณ์สื่อสาร”
            ภายใต้การดูแลของอาจารย์ที่ปรึกษา โรงเรียนสาธิตมหาวิทยาลัยศรีนครินทรวิโรฒ ปทุมวัน
            <br />อีเมลติดต่อเรื่องข้อมูลส่วนบุคคล: <b>rehabAI@gmail.com</b>
          </Section>

          {/* consent */}
          <div className="pt-2 border-t border-line">
            <h2 className="font-heading text-[16px] font-semibold text-ink-primary mt-3 mb-1">หนังสือให้ความยินยอม (Consent)</h2>
            <p className="text-[12.5px] text-ink-muted mb-3">โปรดอ่านและเลือกให้ความยินยอมก่อนเริ่มใช้งาน RehabAI</p>

            <p className="text-[12.5px] font-bold text-ink-primary mb-1.5">ความยินยอมที่จำเป็น</p>
            <ConsentRow checked={c.read} onChange={set('read')}>
              ข้าพเจ้าได้อ่านและรับทราบประกาศความเป็นส่วนตัวของ RehabAI แล้ว
            </ConsentRow>
            <ConsentRow checked={c.health} onChange={set('health')}>
              ข้าพเจ้ายินยอมโดยชัดแจ้งให้ RehabAI เก็บรวบรวม ใช้ และเปิดเผยข้อมูลสุขภาพของข้าพเจ้า (ระยะของโรคพาร์กินสัน
              ผลการประเมินท่าทางและเสียง คะแนน และประวัติการฝึก) เพื่อวัตถุประสงค์ในการให้บริการกายภาพบำบัด ประเมินผล
              ติดตามความคืบหน้า และให้นักกายภาพบำบัดที่ดูแลข้าพเจ้าติดตามผล ตามรายละเอียดในประกาศความเป็นส่วนตัว
            </ConsentRow>

            <p className="text-[12.5px] font-bold text-ink-primary mt-3 mb-1.5">ความยินยอม/การตั้งค่าที่เป็นทางเลือก</p>
            <ConsentRow checked={c.lineNotify} onChange={set('lineNotify')}>
              ข้าพเจ้าต้องการเชื่อมต่อบัญชี LINE กับ LINE Official Account ของ RehabAI เพื่อรับการแจ้งเตือนตารางฝึก
            </ConsentRow>
            <ConsentRow checked={c.lineSOS} onChange={set('lineSOS')}>
              ข้าพเจ้าต้องการเปิดใช้งานระบบแจ้งเหตุฉุกเฉินผ่าน LINE และรับทราบว่าผู้ติดต่อฉุกเฉินต้องเชื่อมต่อ LINE OA สำเร็จก่อน
              ระบบจึงจะสามารถส่งข้อความแจ้งเหตุฉุกเฉินไปยังบุคคลดังกล่าวได้
            </ConsentRow>

            <p className="text-[12px] text-ink-muted mt-3 leading-relaxed">
              การเลือก “ยอมรับและดำเนินการต่อ” ถือเป็นการยืนยันว่าท่านได้อ่านและเข้าใจประกาศความเป็นส่วนตัวฉบับนี้
              และได้แสดงเจตนาเกี่ยวกับความยินยอมตามตัวเลือกข้างต้น ท่านสามารถถอนความยินยอมในส่วนที่กฎหมายอนุญาตได้ภายหลัง โดยติดต่อ rehabAI@gmail.com
            </p>
          </div>
        </div>

        {/* footer buttons — two squares: accept / decline */}
        <div className="px-6 md:px-8 py-4 border-t border-line flex flex-col sm:flex-row gap-3 flex-shrink-0 bg-white">
          <button
            onClick={accept}
            disabled={!canProceed}
            className="flex-1 min-h-[54px] rounded-[14px] flex items-center justify-center gap-2.5 font-heading font-bold text-[15px] text-white border-[2.5px] transition-all disabled:opacity-45 disabled:cursor-not-allowed active:translate-y-[3px] active:shadow-none"
            style={{ background: '#2FA65A', borderColor: '#1E7A40', boxShadow: canProceed ? '0 4px 0 #1E7A40' : 'none' }}
          >
            <span className="w-6 h-6 rounded-[6px] bg-white/25 border-2 border-white/70 flex items-center justify-center"><Check size={14} /></span>
            ยินยอมและดำเนินการต่อ
          </button>
          <button
            onClick={decline}
            className="flex-1 min-h-[54px] rounded-[14px] flex items-center justify-center gap-2.5 font-heading font-bold text-[15px] bg-white border-2 border-line text-ink-secondary hover:bg-bg active:translate-y-[2px] transition-all"
          >
            <span className="w-6 h-6 rounded-[6px] border-2 border-ink-muted flex items-center justify-center"><XMark size={14} /></span>
            ไม่ยินยอม
          </button>
        </div>
        {!canProceed && (
          <p className="text-center text-[11.5px] text-ink-muted pb-3 -mt-1">กรุณาติ๊กความยินยอมที่จำเป็นทั้ง 2 ข้อ เพื่อดำเนินการต่อ</p>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="font-heading text-[15px] font-semibold text-ink-primary mb-1">{title}</h2>
      <p className="text-[13px] leading-relaxed">{children}</p>
    </div>
  )
}

function ConsentRow({ checked, onChange, children }) {
  return (
    <label className="flex items-start gap-2.5 mb-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-teal-600 mt-0.5 w-[18px] h-[18px] flex-shrink-0" />
      <span className="text-[13px] leading-relaxed text-ink-secondary">{children}</span>
    </label>
  )
}
