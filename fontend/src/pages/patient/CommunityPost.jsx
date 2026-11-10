import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import PostCard, { AuthorBadge, Avatar } from '../../components/PostCard.jsx'
import GardenPlot from '../../components/GardenPlot.jsx'
import { StatCard } from '../../components/ui.jsx'
import { ArrowLeft, Award, Chat, Send, Mic, Plus, Check, AlertTriangle } from '../../components/icons.jsx'
import {
  COMMUNITY_POSTS, COMMUNITY_COMMENTS, QUICK_COMMENTS, COMMUNITY_DISCLAIMER,
} from '../../lib/mockData.js'
import { useAuth } from '../../context/AuthContext.jsx'

// Single post + comments — the "#communitypost" section of the mockup.
// Comments are mock (mockData.js); new ones live in page state only.

function Comment({ c }) {
  const [cheered, setCheered] = useState(false)
  return (
    <div
      className="flex gap-4 py-4 border-t-[1.5px]"
      style={{ borderColor: '#E6F1F7', marginLeft: c.reply ? 60 : 0 }}
    >
      <Avatar name={c.author} size={43} verified={c.verified} />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-b-label font-bold">{c.author}</span>
          <AuthorBadge label={c.badge} verified={c.verified} />
          <span className="text-b-xs text-ink-secondary">{c.when}</span>
        </div>
        <p className="text-b-label leading-[1.6] m-0">{c.body}</p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setCheered((v) => !v)}
            className={`inline-flex items-center gap-2.5 min-h-[46px] px-3.5 rounded-[13px] border-2 text-b-sm font-bold transition-colors ${
              cheered ? 'bg-teal-100 border-teal-700 text-teal-800' : 'bg-surface border-line text-ink-primary hover:bg-teal-50'
            }`}
          >
            <Award size={20} /> ให้กำลังใจ · {c.cheers + (cheered ? 1 : 0)}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2.5 min-h-[46px] px-3.5 rounded-[13px] border-2 border-line bg-surface text-b-sm font-bold hover:bg-teal-50 transition-colors"
          >
            <Chat size={20} /> ตอบกลับ
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CommunityPost() {
  const { id } = useParams()
  const { user } = useAuth()
  const myName = user?.name || 'ผู้ใช้งาน'

  const post = COMMUNITY_POSTS.find((p) => String(p.id) === id)
  const [draft, setDraft] = useState('')
  const [added, setAdded] = useState([])
  const [following, setFollowing] = useState(false)

  // Posts created this session aren't in mockData, so fall back to the feed.
  if (!post) return <Navigate to="/community" replace />

  const comments = [...(COMMUNITY_COMMENTS[post.id] || []), ...added]

  function send() {
    if (!draft.trim()) return
    setAdded((list) => [
      ...list,
      { id: `new-${Date.now()}`, author: myName, badge: 'ความคิดเห็นของคุณ', when: 'เมื่อสักครู่', cheers: 0, body: draft.trim() },
    ])
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-b-label font-semibold text-ink-secondary m-0 mb-1">ชุมชนของเรา</p>
          <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">โพสต์ของ{post.author}</h1>
        </div>
      </header>

      <Link
        to="/community"
        className="self-start inline-flex items-center gap-2.5 min-h-[48px] px-4 rounded-btn bg-surface border-[3px] border-line text-ink-primary text-b-base font-bold hover:bg-teal-50 transition-colors"
      >
        <ArrowLeft size={20} /> กลับไปหน้าชุมชน
      </Link>

      <div className="flex flex-wrap gap-5 items-start">
        <div className="flex-[2_1_440px] min-w-0 flex flex-col gap-5">
          <PostCard post={post} linkBody={false} />

          {/* Comments */}
          <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-4">
            <h2 className="font-heading text-b-h3 font-bold m-0">
              ความคิดเห็น {post.comments + added.length} รายการ
            </h2>

            {/* Composer */}
            <div className="flex gap-3.5 items-start">
              <Avatar name={myName} size={43} />
              <div className="flex-1 flex flex-col gap-3">
                <label className="sr-only" htmlFor="newcomment">เขียนความคิดเห็น</label>
                <textarea
                  id="newcomment"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="เขียนให้กำลังใจหรือแบ่งปันประสบการณ์"
                  className="min-h-[72px] px-5 py-3.5 rounded-field border-2 border-line bg-bg text-b-base font-body text-ink-primary outline-none focus:border-teal-700 transition-colors resize-y"
                />

                <div className="flex flex-wrap gap-2.5">
                  {QUICK_COMMENTS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setDraft(q)}
                      className="min-h-[46px] px-4 rounded-pill border-2 border-teal-700 bg-surface text-teal-700 text-b-sm font-bold hover:bg-teal-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-2.5">
                  <button type="button" className="flex items-center gap-3 min-h-[48px] px-5 rounded-btn border-[3px] border-line bg-surface text-b-base font-bold hover:bg-teal-50 transition-colors">
                    <Mic size={20} /> พูดแทนพิมพ์
                  </button>
                  <button
                    type="button"
                    onClick={send}
                    disabled={!draft.trim()}
                    className="flex items-center gap-3 min-h-[48px] px-5 rounded-btn bg-teal-700 border-[3px] border-teal-700 text-white text-b-base font-bold disabled:opacity-50 hover:bg-teal-800 hover:border-teal-800 transition-colors"
                  >
                    <Send size={20} /> ส่ง
                  </button>
                </div>
              </div>
            </div>

            {comments.map((c) => <Comment key={c.id} c={c} />)}
          </section>
        </div>

        {/* Author aside */}
        <aside className="flex-[1_1_280px] min-w-0 flex flex-col gap-5">
          <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-4">
            <div className="flex gap-3.5 items-center">
              <Avatar name={post.author} size={57} verified={post.verified} />
              <div>
                <div className="text-b-btn font-bold">{post.author}</div>
                <div className="text-b-sm text-ink-secondary">{post.memberFor}</div>
              </div>
            </div>

            {post.streak != null && (
              <div className="flex gap-2.5 flex-wrap">
                <StatCard value={`${post.streak} วัน`} label="ฝึกติดต่อกัน" />
                <div className="flex-1 min-w-[130px] bg-surface rounded-card border-[1.5px] border-line shadow-card p-4 flex flex-col gap-2" style={{ borderTop: '6px solid #157AB5' }}>
                  <div className="rounded-[10px] overflow-hidden bg-teal-50">
                    <GardenPlot level={post.gardenLevel} trees={post.gardenLevel * 15} seed={post.id} className="w-full h-auto" />
                  </div>
                  <div>
                    <div className="text-b-h3 font-bold leading-[1.2]">ระดับ {post.gardenLevel}</div>
                    <div className="text-b-sm text-ink-secondary">สวนของ{post.author}</div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setFollowing((f) => !f)}
              className={`w-full flex items-center justify-center gap-3 min-h-[51px] px-6 rounded-btn border-[3px] text-b-btn font-bold transition-colors ${
                following
                  ? 'bg-teal-700 border-teal-700 text-white'
                  : 'bg-surface border-teal-700 text-teal-700 hover:bg-teal-100'
              }`}
            >
              {following ? <><Check size={22} /> ติดตามแล้ว</> : <><Plus size={22} /> ติดตาม</>}
            </button>
          </section>

          <div
            className="flex gap-4 items-start rounded-[17px] border-2 px-5 py-4 text-b-label leading-[1.6]"
            style={{ background: '#E0F1FA', borderColor: '#B4DCEC', color: '#0B3550' }}
          >
            <AlertTriangle size={22} className="flex-shrink-0" />
            {COMMUNITY_DISCLAIMER}
          </div>
        </aside>
      </div>
    </div>
  )
}
