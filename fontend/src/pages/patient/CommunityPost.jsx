import { useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import PostCard, { AuthorBadge, Avatar, Action } from '../../components/PostCard.jsx'
import GardenPlot from '../../components/GardenPlot.jsx'
import { StatCard } from '../../components/ui.jsx'
import {
  ArrowLeft, Award, Chat, Send, Mic, Plus, Check, AlertTriangle, Trash,
} from '../../components/icons.jsx'
import { QUICK_COMMENTS, COMMUNITY_DISCLAIMER } from '../../lib/mockData.js'
import { community } from '../../lib/services.js'
import { useCommunityPost, commentCheerCount } from '../../lib/useCommunity.js'
import { useSpeechInput } from '../../lib/useSpeechInput.js'
import { useAuth } from '../../context/AuthContext.jsx'

// Single post + comments — the "#communitypost" section of the mockup, wired to
// the `community` service so comments and cheers persist. Mockup px ÷ 1.4.

function Comment({ postId, comment, state, onReply }) {
  const { on, count } = commentCheerCount(comment, state)
  return (
    <div
      className="flex gap-4 py-4 border-t-[1.5px]"
      style={{ borderColor: '#E6F1F7', marginLeft: comment.reply ? 60 : 0 }}
    >
      <Avatar name={comment.author} size={43} verified={comment.verified} />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-b-label font-bold">{comment.author}</span>
          <AuthorBadge label={comment.badge} verified={comment.verified} />
          <span className="text-b-xs text-ink-secondary">{comment.when}</span>
        </div>
        <p className="text-b-label leading-[1.6] m-0 whitespace-pre-line">{comment.body}</p>
        <div className="flex gap-1.5 flex-wrap">
          <Action
            icon={Award}
            label="ให้กำลังใจ"
            count={count}
            on={on}
            onClick={() => community.toggleCommentCheer(comment.id)}
          />
          <Action icon={Chat} label="ตอบกลับ" onClick={() => onReply(comment.author)} />
          {comment.own && (
            <Action
              icon={Trash}
              label="ลบ"
              onClick={() => {
                if (confirm('ลบความคิดเห็นนี้ใช่ไหม')) community.deleteComment(postId, comment.id)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommunityPost() {
  const { id } = useParams()
  const { user } = useAuth()
  const myName = user?.name || 'ผู้ใช้งาน'
  const { post, state } = useCommunityPost(id)

  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const boxRef = useRef(null)

  const speech = useSpeechInput((text) =>
    setDraft((d) => (d.trim() ? `${d.trim()} ${text}` : text)))

  // "ตอบกลับ" jumps to the comment box, addressing the person when given.
  function focusComposer(author) {
    if (author) setDraft((d) => (d.startsWith(`@${author}`) ? d : `@${author} `))
    boxRef.current?.focus()
    boxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // A post that was deleted (or never existed) sends the reader back to the feed.
  if (!post) return <Navigate to="/community" replace />

  const canSend = draft.trim().length > 0 && !busy

  async function send() {
    if (!canSend) return
    setBusy(true)
    setError(null)
    try {
      await community.addComment(post.id, draft)
      setDraft('')
    } catch (err) {
      setError(err.message || 'ส่งความคิดเห็นไม่สำเร็จ')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-b-label font-semibold text-ink-secondary m-0 mb-1">ชุมชนของเรา</p>
        <h1 className="font-heading text-b-h1 font-bold m-0 leading-[1.25]">โพสต์ของ{post.author}</h1>
      </header>

      <Link
        to="/community"
        className="self-start inline-flex items-center gap-2.5 min-h-[51px] px-4 rounded-btn bg-surface border-[3px] border-line text-ink-primary text-b-base font-bold hover:bg-teal-50 transition-colors"
      >
        <ArrowLeft size={20} /> กลับไปหน้าชุมชน
      </Link>

      <div className="flex flex-wrap gap-5 items-start">
        <div className="flex-[2_1_440px] min-w-0 flex flex-col gap-5">
          <PostCard post={post} linkBody={false} onReply={() => focusComposer()} />

          {/* Comments */}
          <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-4">
            <h2 className="font-heading text-b-h3 font-bold m-0">
              ความคิดเห็น {post.comments.length} รายการ
            </h2>

            {/* Composer */}
            <div className="flex gap-3.5 items-start">
              <Avatar name={myName} size={43} />
              <div className="flex-1 flex flex-col gap-3">
                <label className="sr-only" htmlFor="newcomment">เขียนความคิดเห็น</label>
                <textarea
                  id="newcomment"
                  ref={boxRef}
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
                      className="min-h-[50px] px-4 rounded-pill border-2 border-teal-700 bg-surface text-teal-700 text-b-sm font-bold hover:bg-teal-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {(error || speech.error) && (
                  <p
                    className="text-b-base font-semibold leading-[1.6] m-0 rounded-[14px] border-2 px-4 py-3"
                    style={{ background: '#FBE3E0', borderColor: '#EDB3AD', color: '#B3261E' }}
                  >
                    {error || speech.error}
                  </p>
                )}

                <div className="flex justify-end gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={speech.toggle}
                    aria-pressed={speech.listening}
                    className={`flex items-center gap-3 min-h-[54px] px-5 rounded-btn border-[3px] text-b-base font-bold transition-colors ${
                      speech.listening
                        ? 'bg-coral-600 border-coral-600 text-white'
                        : 'border-line bg-surface text-ink-primary hover:bg-teal-50'
                    }`}
                  >
                    <Mic size={22} /> {speech.listening ? 'กำลังฟัง… กดเพื่อหยุด' : 'พูดแทนพิมพ์'}
                  </button>
                  <button
                    type="button"
                    onClick={send}
                    disabled={!canSend}
                    className="flex items-center gap-3 min-h-[54px] px-5 rounded-btn bg-teal-700 border-[3px] border-teal-700 text-white text-b-base font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-800 hover:border-teal-800 transition-colors"
                  >
                    <Send size={22} /> {busy ? 'กำลังส่ง…' : 'ส่ง'}
                  </button>
                </div>
              </div>
            </div>

            {post.comments.length === 0 && (
              <p className="text-b-base text-ink-secondary leading-[1.6] m-0 py-2">
                ยังไม่มีความคิดเห็น — เขียนให้กำลังใจเป็นคนแรกได้เลย
              </p>
            )}
            {post.comments.map((c) => (
              <Comment key={c.id} postId={post.id} comment={c} state={state} onReply={focusComposer} />
            ))}
          </section>
        </div>

        {/* Author aside */}
        <aside className="flex-[1_1_280px] min-w-0 flex flex-col gap-5">
          <section className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-4">
            <div className="flex gap-3.5 items-center">
              <Avatar name={post.author} size={57} verified={post.verified} />
              <div>
                <div className="text-b-btn font-bold">{post.author}</div>
                <div className="text-b-sm text-ink-secondary">{post.memberFor || 'สมาชิกชุมชน'}</div>
              </div>
            </div>

            {post.streak != null && (
              <div className="flex gap-2.5 flex-wrap">
                <StatCard value={`${post.streak} วัน`} label="ฝึกติดต่อกัน" />
                <div
                  className="flex-1 min-w-[130px] bg-surface rounded-card border-[1.5px] border-line shadow-card p-4 flex flex-col gap-2"
                  style={{ borderTop: '6px solid #157AB5' }}
                >
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

            {!post.own && (
              <button
                type="button"
                aria-pressed={post.following}
                onClick={() => community.toggleFollow(post.author)}
                className={`w-full flex items-center justify-center gap-3 min-h-[57px] px-6 rounded-btn border-[3px] text-b-btn font-bold transition-colors ${
                  post.following
                    ? 'bg-teal-700 border-teal-700 text-white'
                    : 'bg-surface border-teal-700 text-teal-700 hover:bg-teal-100'
                }`}
              >
                {post.following ? <><Check size={22} /> ติดตามแล้ว</> : <><Plus size={22} /> ติดตาม</>}
              </button>
            )}
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
