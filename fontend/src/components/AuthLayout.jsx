import { Logo } from './ui.jsx'

// Split-screen auth shell (spec §1.3). Brand panel left 38%, form right.
export default function AuthLayout({ children, therapist = false }) {
  return (
    <div className="min-h-screen flex bg-surface">
      <aside
        className="hidden md:flex flex-col justify-between w-[38%] p-12 text-white"
        style={{ background: '#1F4A40' }}
      >
        <Logo light />
        <div>
          <h2 className="font-heading text-[26px] font-semibold leading-snug m-0">
            ฟื้นฟูการเคลื่อนไหว
            <br />
            และการพูด ในที่เดียว
          </h2>
          <p className="text-[13.5px] opacity-75 leading-relaxed mt-3 max-w-[320px]">
            {therapist
              ? 'พอร์ทัลสำหรับนักกายภาพบำบัด ติดตามความคืบหน้าของผู้ป่วยพาร์กินสันระยะ 1-2 แบบเรียลไทม์'
              : 'โปรแกรมฝึก LSVT BIG และ LSVT LOUD ที่บ้าน พร้อมวิเคราะห์ท่าทางและระดับเสียงแบบเรียลไทม์ ออกแบบสำหรับผู้ป่วยพาร์กินสันระยะ 1-2'}
          </p>
        </div>
        <p className="text-[12.5px] opacity-60 leading-relaxed">
          โครงการเพื่อการฟื้นฟูผู้ป่วยพาร์กินสัน · RehabAI © 2568
        </p>
      </aside>

      <main className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-[380px]">{children}</div>
      </main>
    </div>
  )
}
