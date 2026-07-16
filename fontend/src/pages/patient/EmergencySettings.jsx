import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Toggle, Button, Avatar, Badge } from '../../components/ui.jsx'
import { ArrowLeft, Phone, Plus, MapPin } from '../../components/icons.jsx'
import { emergencyContactsSeed } from '../../lib/mockData.js'

export default function EmergencySettings() {
  const [autoCall, setAutoCall] = useState(true)
  const [shareLoc, setShareLoc] = useState(true)
  const [contacts] = useState(emergencyContactsSeed)

  return (
    <div className="max-w-[680px]">
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary hover:text-teal-700 mb-3">
        <ArrowLeft size={16} /> กลับไปโปรไฟล์
      </Link>
      <h1 className="font-heading text-[22px] font-semibold text-teal-900 mb-6">ผู้ติดต่อฉุกเฉิน</h1>

      <Card className="p-6 mb-5">
        <div className="flex justify-between items-center py-3 border-b border-line">
          <div>
            <p className="text-[14px] font-medium mb-1">โทรฉุกเฉินอัตโนมัติเมื่อระบบตรวจพบการล้ม</p>
            <p className="text-[12px] text-ink-secondary max-w-[420px]">ระบบจะเริ่มนับถอยหลังก่อนโทร 1669 ให้อัตโนมัติ ยกเลิกได้เสมอ</p>
          </div>
          <Toggle on={autoCall} onChange={setAutoCall} />
        </div>
        <div className="flex justify-between items-center py-3">
          <div>
            <p className="text-[14px] font-medium mb-1">แชร์ตำแหน่งเมื่อโทรฉุกเฉิน</p>
            <p className="text-[12px] text-ink-secondary max-w-[420px]">ส่งพิกัดปัจจุบันไปยังผู้ติดต่อฉุกเฉินพร้อมข้อความแจ้งเตือน</p>
          </div>
          <Toggle on={shareLoc} onChange={setShareLoc} />
        </div>
      </Card>

      <p className="text-[13px] font-semibold text-ink-secondary uppercase tracking-wide mb-3">รายชื่อผู้ติดต่อ (เรียงตามลำดับความสำคัญ)</p>
      <div className="space-y-3 mb-4">
        {contacts.map((c) => (
          <Card key={c.id} className="p-4 flex items-center gap-3.5">
            <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-900 flex items-center justify-center text-[12px] font-semibold flex-shrink-0">
              {c.priority}
            </div>
            <Avatar text={c.name.slice(0, 2)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13.5px] font-medium">{c.name}</span>
                {c.source === 'registration' && <Badge tone="active">จากตอนสมัครสมาชิก</Badge>}
              </div>
              <div className="text-[12px] text-ink-muted">{c.relationship} · {c.phone}</div>
            </div>
            <Button variant="outline" className="w-auto py-2"><Phone size={15} /> โทรทันที</Button>
          </Card>
        ))}
      </div>

      <Button variant="outline" className="w-auto mb-6"><Plus size={16} /> เพิ่มผู้ติดต่อฉุกเฉิน</Button>

      <Card className="p-5 flex items-center gap-4" style={{ background: '#FBEAE8', borderColor: '#EBC6C1' }}>
        <div className="w-11 h-11 rounded-xl bg-danger text-white flex items-center justify-center flex-shrink-0">
          <MapPin size={22} />
        </div>
        <div className="flex-1">
          <p className="text-[13px] text-ink-secondary">หมายเลขฉุกเฉินสาธารณะ (ค่าคงที่ของระบบ)</p>
          <p className="font-heading text-[22px] font-semibold text-danger">1669 <span className="text-[13px] font-normal text-ink-secondary">· สถาบันการแพทย์ฉุกเฉินแห่งชาติ</span></p>
        </div>
      </Card>
    </div>
  )
}
