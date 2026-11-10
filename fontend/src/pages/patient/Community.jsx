import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PostCard, { Avatar } from '../../components/PostCard.jsx'
import { MapPin, Camera, Mic, Send, Check, AlertTriangle } from '../../components/icons.jsx'
import {
  COMMUNITY_POSTS, COMMUNITY_TOPICS, COMMUNITY_EVENTS, COMMUNITY_TAGS, COMMUNITY_RULES,
} from '../../lib/mockData.js'
import { useAuth } from '../../context/AuthContext.jsx'

// "ชุมชนของเรา" — the "#community" section of design/bridge-mockup.html:
// composer, topic tabs, feed, and the right-hand aside.
// Posts are mock (mockData.js) and new ones live in page state only.

const TABS = ['ทั้งหมด', ...COMMUNITY_TOPICS, 'คนที่ติดตาม']

export default function Community() {
  const { user } = useAuth()
  const name = user?.name || 'ผู้ใช้งาน'

  const [draft, setDraft] = useState('')
  const [topic, setTopic] = useState(COMMUNITY_TOPICS[0])
  const [tab, setTab] = useState('ทั้งหมด')
  const [posted, setPosted] = useState([])

  const posts = useMemo(() => [...posted, ...COMMUNITY_POSTS], [posted])
  const shown = COMMUNITY_TOPICS.includes(tab) ? posts.filter((p) => p.topic === tab) : posts

  function submit() {
    if (!draft.trim()) return
    setPosted((list) => [
      {
        id: `new-${Date.now()}`,
        author: name,
        badge: 'โพสต์ของคุณ',
        when: 'เมื่อสักครู่',
        topic,
        body: draft.trim(),
        cheers: 0, comments: 0, shares: 0,
      },
      ...list,
    ])
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-b-label font-semibold text-ink-secondary m-0 mb-1">พื้นที่แบ่งปันประสบการณ์และส่งกำลังใจ</p>
          <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">ชุมชนของเรา</h1>
        </div>
        <Link
          to="/village"
          className="inline-flex items-center justify-center gap-3 min-h-[51px] px-6 rounded-btn bg-surface border-[3px] border-line text-ink-primary text-b-btn font-bold hover:bg-teal-50 transition-colors"
        >
          <MapPin size={22} /> แผนที่หมู่บ้าน
        </Link>
      </header>

      <div className="flex flex-wrap gap-5 items-start">
        <div className="flex-[2_1_440px] min-w-0 flex flex-col gap-5">
          {/* Composer */}
          <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-3.5">
            <div className="flex gap-4 items-start">
              <Avatar name={name} />
              <label className="sr-only" htmlFor="newpost">เขียนโพสต์</label>
              <textarea
                id="newpost"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="วันนี้เป็นอย่างไร เล่าให้เพื่อนฟังได้เลย"
                className="flex-1 min-h-[93px] px-5 py-3.5 rounded-field border-2 border-line bg-bg text-b-base font-body text-ink-primary outline-none focus:border-teal-700 transition-colors resize-y"
              />
            </div>

            <div className="flex flex-wrap gap-2.5 items-center">
              <span className="text-b-sm font-bold text-ink-secondary">โพสต์นี้เกี่ยวกับ</span>
              {COMMUNITY_TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={topic === t}
                  onClick={() => setTopic(t)}
                  className={`min-h-[46px] px-4 rounded-pill border-2 text-b-sm font-bold transition-colors ${
                    topic === t ? 'border-teal-700 bg-teal-100 text-ink-primary' : 'border-line bg-surface text-ink-primary hover:bg-teal-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 justify-between items-center">
              <div className="flex gap-2.5 flex-wrap">
                <button type="button" className="flex items-center gap-3 min-h-[48px] px-5 rounded-btn border-[3px] border-line bg-surface text-b-base font-bold hover:bg-teal-50 transition-colors">
                  <Camera size={20} /> รูปภาพ
                </button>
                <button type="button" className="flex items-center gap-3 min-h-[48px] px-5 rounded-btn border-[3px] border-line bg-surface text-b-base font-bold hover:bg-teal-50 transition-colors">
                  <Mic size={20} /> พูดแทนพิมพ์
                </button>
              </div>
              <button
                type="button"
                onClick={submit}
                disabled={!draft.trim()}
                className="flex items-center gap-3 min-h-[54px] px-6 rounded-btn bg-teal-700 border-[3px] border-teal-700 text-white text-b-btn font-bold disabled:opacity-50 hover:bg-teal-800 hover:border-teal-800 transition-colors"
              >
                <Send size={20} /> โพสต์
              </button>
            </div>
          </section>

          {/* Topic tabs */}
          <div className="flex flex-wrap border-b-2 border-line">
            {TABS.map((t) => {
              const on = tab === t
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTab(t)}
                  className={`min-h-[46px] px-4 bg-transparent text-b-base transition-colors ${
                    on ? 'font-bold text-ink-primary' : 'font-semibold text-ink-secondary hover:text-ink-primary'
                  }`}
                  style={{ borderBottom: `4px solid ${on ? '#157AB5' : 'transparent'}` }}
                >
                  {t}
                </button>
              )
            })}
          </div>

          {/* Feed */}
          {tab === 'คนที่ติดตาม' ? (
            <div className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6">
              <p className="text-b-base text-ink-secondary leading-[1.6] m-0">
                คุณยังไม่ได้ติดตามใคร — กดเข้าไปในโพสต์แล้วกด “ติดตาม” เพื่อเห็นโพสต์ของคนนั้นที่นี่
              </p>
            </div>
          ) : (
            shown.map((p) => <PostCard key={p.id} post={p} />)
          )}
        </div>

        {/* Aside */}
        <aside className="flex-[1_1_280px] min-w-0 flex flex-col gap-5">
          <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-4">
            <h2 className="font-heading text-b-h3 font-bold m-0">กิจกรรมใกล้คุณ</h2>
            {COMMUNITY_EVENTS.map((e) => (
              <div key={e.id} className="flex gap-3.5">
                <span
                  className="w-[51px] h-[51px] rounded-[12px] flex flex-col items-center justify-center flex-shrink-0"
                  style={{ background: e.tint }}
                >
                  <span className="text-b-xs font-bold" style={{ color: '#B4233A' }}>{e.month}</span>
                  <span className="text-b-label font-bold leading-none">{e.day}</span>
                </span>
                <div>
                  <div className="text-b-label font-bold">{e.title}</div>
                  <div className="text-b-sm text-ink-secondary">{e.place} · {e.going} คนไปด้วย</div>
                </div>
              </div>
            ))}
          </section>

          <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-3">
            <h2 className="font-heading text-b-h3 font-bold m-0">หัวข้อที่คุยกันเยอะ</h2>
            {COMMUNITY_TAGS.map((t) => (
              <div key={t.tag}>
                <div className="text-b-label font-bold text-teal-700">{t.tag}</div>
                <div className="text-b-xs text-ink-secondary">{t.posts} โพสต์</div>
              </div>
            ))}
          </section>

          <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-3">
            <h2 className="font-heading text-b-h3 font-bold m-0">กติกาของชุมชน</h2>
            {COMMUNITY_RULES.map((r) => (
              <div key={r} className="flex gap-3 text-b-sm leading-[1.5]">
                <Check size={18} className="flex-shrink-0 text-teal-700" />
                {r}
              </div>
            ))}
            <div
              className="flex gap-3 items-start rounded-[14px] border-2 px-4 py-3 text-b-sm leading-[1.5]"
              style={{ background: '#FFF1C7', borderColor: '#E6CF86', color: '#6B4A00' }}
            >
              <AlertTriangle size={18} className="flex-shrink-0" />
              เรื่องยาและการรักษา ปรึกษาแพทย์ก่อนทำตามเสมอ
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
