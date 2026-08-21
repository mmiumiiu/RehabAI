// Split-screen auth shell — matches the "login UI" design: a green hero panel on
// the left (dot texture + floating confetti + logo + tagline + feature chips) and
// the form in a white rounded card on the right.
export default function AuthLayout({ children, therapist = false }) {
  return (
    <div className="min-h-screen flex" style={{ background: '#F4FAF5' }}>
      {/* Left · green hero */}
      <aside
        className="hidden md:flex flex-col justify-center relative overflow-hidden w-[46%] max-w-[560px] p-12 text-white"
        style={{ background: '#2FA65A' }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.14) 2px, transparent 2.6px)', backgroundSize: '26px 26px' }}
        />
        {/* floating confetti */}
        <span className="absolute top-10 right-16 w-4 h-4 rounded-full" style={{ background: '#F7C132' }} />
        <span className="absolute top-24 right-32 w-2.5 h-2.5 rounded-full" style={{ background: '#E8554D' }} />
        <span className="absolute bottom-24 right-20 w-3 h-3 rounded-[4px] rotate-[20deg]" style={{ background: '#BDEFCF' }} />
        <span className="absolute bottom-32 left-12 w-2.5 h-2.5 rounded-[3px] -rotate-[15deg]" style={{ background: '#D9538F' }} />

        <div className="relative">
          <div className="w-16 h-16 rounded-[20px] bg-white flex items-center justify-center mb-6 overflow-hidden" style={{ boxShadow: '0 10px 24px rgba(0,0,0,.2)' }}>
            <img src="/logo.png" alt="RehabAI" className="w-[46px] h-[46px] object-contain" />
          </div>
          <div className="font-heading text-[32px] font-semibold leading-[1.3] mb-2.5">
            {therapist ? (
              <>ดูแลผู้ป่วยของคุณ<br />ได้ทุกที่ ทุกเวลา 🩺</>
            ) : (
              <>ฝึกกายภาพที่บ้าน<br />ง่าย สนุก ได้ผลจริง 💪</>
            )}
          </div>
          <p className="text-[15.5px] opacity-85 leading-[1.7] max-w-[360px]">
            {therapist
              ? 'พอร์ทัลสำหรับนักกายภาพบำบัด ติดตามความคืบหน้าของผู้ป่วยพาร์กินสัน พร้อมสั่งการบ้านและพูดคุยแบบเรียลไทม์'
              : 'RehabAI ช่วยผู้ป่วยพาร์กินสันฝึก LSVT BIG และ LSVT LOUD ผ่านกล้องและไมค์ พร้อมนักกายภาพบำบัดดูแลใกล้ชิด'}
          </p>
          <div className="flex flex-wrap gap-2.5 mt-6">
            {(therapist
              ? ['👥 ดูแลผู้ป่วย', '📋 สั่งการบ้าน', '💬 พูดคุย']
              : ['🏃 ฝึกท่าทาง', '🎤 ฝึกเสียง', '📊 ติดตามผล']
            ).map((t) => (
              <span key={t} className="px-4 py-2 rounded-pill text-[13.5px] font-semibold" style={{ background: 'rgba(255,255,255,.18)' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* Right · form card */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-[440px] bg-white rounded-[24px] p-7 md:p-9" style={{ boxShadow: '0 12px 30px rgba(30,90,50,.1)' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
