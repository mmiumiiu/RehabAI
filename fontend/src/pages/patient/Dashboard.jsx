import MetricRow from '../../components/MetricRow.jsx'
import FrequencyChart from '../../components/FrequencyChart.jsx'
import { Badge, SectionTitle } from '../../components/ui.jsx'
import { HISTORY } from '../../lib/mockData.js'

export default function Dashboard() {
  return (
    <div className="max-w-[900px]">
      <h1 className="font-heading text-[24px] font-semibold text-teal-900 mb-6">สรุปผลการฝึก</h1>

      <MetricRow
        items={[
          { value: '1,284', label: 'คะแนนสะสม' },
          { value: '46', label: 'จำนวนครั้งที่ฝึก' },
          { value: '5/7', label: 'วันที่ฝึกสัปดาห์นี้' },
          { value: '86', label: 'คะแนนล่าสุด' },
        ]}
      />

      <div className="mb-7">
        <FrequencyChart />
      </div>

      <SectionTitle>ประวัติล่าสุด</SectionTitle>
      <table className="w-full border-collapse card overflow-hidden">
        <thead>
          <tr className="bg-[#F5F2EA]">
            {['วันที่', 'ประเภทการฝึก', 'ระยะเวลา', 'คะแนน'].map((h) => (
              <th key={h} className="text-left text-[11.5px] uppercase tracking-wide text-ink-muted px-5 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HISTORY.map((r, i) => (
            <tr key={i} className="border-t border-line">
              <td className="px-5 py-3 text-[13.5px]">{r.date}</td>
              <td className="px-5 py-3">
                <Badge tone={r.type}>{r.type === 'big' ? 'LSVT BIG' : 'LSVT LOUD'}</Badge>
              </td>
              <td className="px-5 py-3 text-[13.5px]">{r.duration}</td>
              <td className="px-5 py-3 text-[13.5px] font-semibold font-mono">{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
