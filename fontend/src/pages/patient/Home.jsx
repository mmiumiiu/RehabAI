import { Link } from 'react-router-dom'
import { Card, SectionTitle, Button } from '../../components/ui.jsx'
import { Flame, Activity, Mic, ChevronRight } from '../../components/icons.jsx'
import { BIG_EXERCISES, LOUD_STEPS } from '../../lib/mockData.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Home() {
  const { user } = useAuth()
  const bigLeft = BIG_EXERCISES.filter((e) => e.status !== 'done').length
  const loudLeft = LOUD_STEPS.filter((e) => e.status !== 'done').length

  return (
    <div className="max-w-[900px]">
      {/* Streak card */}
      <div
        className="rounded-card p-6 mb-7 text-white flex items-center justify-between"
        style={{ background: '#1F4A40' }}
      >
        <div>
          <div className="flex items-center gap-2 text-white/70 text-[13px] mb-1">
            <Flame size={18} /> ฝึกต่อเนื่อง
          </div>
          <div className="font-heading text-[30px] font-semibold leading-none">
            5 <span className="text-[16px] font-normal opacity-70">วันติดต่อกัน</span>
          </div>
          <p className="text-[12.5px] text-white/60 mt-2">ทำได้ดีมาก! ฝึกวันนี้เพื่อรักษาสถิติต่อเนื่องไว้</p>
        </div>
        <div className="text-right">
          <div className="text-white/60 text-[12px] mb-1">คะแนนล่าสุด</div>
          <div className="font-heading text-[28px] font-semibold text-teal-100">86</div>
        </div>
      </div>

      <SectionTitle>เลือกโปรแกรมฝึกวันนี้</SectionTitle>
      <div className="grid md:grid-cols-2 gap-[18px]">
        <Card className="p-6">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center mb-3.5">
            <Activity size={24} />
          </div>
          <h3 className="font-heading text-[16px] font-semibold mb-1">LSVT BIG</h3>
          <p className="text-[13px] text-ink-secondary leading-relaxed mb-1">
            ฝึกการเคลื่อนไหวร่างกาย ผ่านกล้องเว็บแคมพร้อมวิเคราะห์ท่าทางแบบเรียลไทม์
          </p>
          <p className="text-[12px] text-ink-muted mb-4">20 นาที · เหลืออีก {bigLeft} ท่าวันนี้</p>
          <Button to="/training/big" variant="primary">เริ่มฝึก</Button>
        </Card>

        <Card className="p-6">
          <div className="w-12 h-12 rounded-xl bg-coral-100 text-coral-700 flex items-center justify-center mb-3.5">
            <Mic size={24} />
          </div>
          <h3 className="font-heading text-[16px] font-semibold mb-1">LSVT LOUD</h3>
          <p className="text-[13px] text-ink-secondary leading-relaxed mb-1">
            ฝึกความดังของเสียงพูด ผ่านไมโครโฟนพร้อมวัดระดับเสียงแบบเรียลไทม์
          </p>
          <p className="text-[12px] text-ink-muted mb-4">10 นาที · เหลืออีก {loudLeft} แบบฝึกหัด</p>
          <Button to="/training/loud" variant="coral">เริ่มฝึก</Button>
        </Card>
      </div>

      <Link
        to="/dashboard"
        className="mt-5 flex items-center justify-between card px-5 py-4 hover:border-teal-500 transition-colors"
      >
        <span className="text-[13.5px] text-ink-secondary">ดูสรุปผลและความคืบหน้าของคุณ</span>
        <ChevronRight size={18} className="text-teal-700" />
      </Link>
    </div>
  )
}
