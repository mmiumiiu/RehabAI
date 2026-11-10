import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Chat, Send, Check, MapPin, Clock, ShieldCheck, Trash } from './icons.jsx'
import { TOPIC_STYLES } from '../lib/mockData.js'
import { community } from '../lib/services.js'

// Community post card, shared by the feed (#community) and the post page
// (#communitypost). All reactions go through the `community` service, so they
// persist and both pages stay in sync. Mockup px ÷ 1.4; every tappable thing is
// at least ~46px tall for older hands.

// The only badge shown under an author's name is the therapist verification.
// Members get none — no years-with-Parkinson's, no relationship to the patient.
export function AuthorBadge({ label, verified }) {
  if (!verified) return null
  return (
    <span
      className="inline-flex items-center gap-1.5 text-b-xs font-bold px-3 py-0.5 rounded-pill"
      style={{ background: '#DDF3F1', color: '#0E5E58' }}
    >
      <ShieldCheck size={15} />
      {label || 'นักกายภาพยืนยันแล้ว'}
    </span>
  )
}

export function TopicPill({ topic }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-b-sm font-bold px-4 py-1 rounded-pill"
      style={TOPIC_STYLES[topic] || TOPIC_STYLES['ประสบการณ์']}
    >
      {topic}
    </span>
  )
}

export function Avatar({ name, size = 48, verified }) {
  return (
    <span
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: verified ? '#DDF3F1' : '#E0F1FA',
        color: verified ? '#0E5E58' : '#0B3550',
      }}
    >
      {String(name || '?').replace(/^กภ\./, '').slice(0, 2)}
    </span>
  )
}

// Action row button — outlined pill that fills in once pressed.
export function Action({ icon: Icon, label, count, on, onClick, to }) {
  const cls = `inline-flex items-center gap-2.5 min-h-[50px] px-4 rounded-[13px] border-2 text-b-sm font-bold transition-colors ${
    on ? 'bg-teal-100 border-teal-700 text-teal-800' : 'bg-surface border-line text-ink-primary hover:bg-teal-50'
  }`
  const body = (
    <>
      <Icon size={20} />
      {label}{count != null && ` · ${count}`}
    </>
  )
  if (to) return <Link to={to} className={cls}>{body}</Link>
  return <button type="button" onClick={onClick} aria-pressed={on} className={cls}>{body}</button>
}

// Images attached to a post: one fills the width, several tile in a grid.
function PostImages({ images, alt }) {
  if (!images?.length) return null
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: images.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(160px, 1fr))' }}
    >
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${alt} รูปที่ ${i + 1}`}
          className="w-full rounded-[17px] border-[1.5px] border-line"
          style={{ maxHeight: 340, objectFit: 'cover' }}
        />
      ))}
    </div>
  )
}

// The event invite block inside a "ชวนทำกิจกรรม" post.
function EventBlock({ post }) {
  const { event } = post
  return (
    <div className="flex flex-wrap items-center gap-5 px-5 py-4 rounded-btn" style={{ background: '#F5FAFD' }}>
      <div className="w-[69px] h-[69px] rounded-[14px] bg-surface flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-b-xs font-bold" style={{ color: '#B4233A' }}>{event.month}</span>
        <span className="text-b-h3 font-bold leading-none">{event.day}</span>
      </div>
      <div className="flex-1 min-w-[200px]">
        <div className="text-b-btn font-bold">{event.title}</div>
        <div className="text-b-sm flex items-center gap-2 flex-wrap">
          <Clock size={17} /> {event.time} · <MapPin size={17} /> {event.place}
        </div>
        <div className="text-b-sm text-ink-secondary">ไปด้วยแล้ว {event.goingCount} คน</div>
      </div>
      <button
        type="button"
        aria-pressed={event.going}
        onClick={() => community.toggleGoing(post.id)}
        className={`flex items-center justify-center gap-3 min-h-[57px] px-6 rounded-btn text-b-btn font-bold border-[3px] transition-colors ${
          event.going ? 'bg-teal-700 border-teal-700 text-white' : 'bg-surface border-teal-700 text-teal-700 hover:bg-teal-100'
        }`}
      >
        {event.going ? <><Check size={22} /> ไปด้วยแล้ว</> : 'ไปด้วย'}
      </button>
    </div>
  )
}

// "แชร์ต่อ" — hand the post link to the OS share sheet when there is one,
// otherwise copy it to the clipboard and say so.
async function sharePost(post, done) {
  const url = `${window.location.origin}/community/${post.id}`
  const text = `${post.author}: ${post.body.slice(0, 80)}`
  try {
    if (navigator.share) {
      await navigator.share({ title: 'BRIDGE — ชุมชนของเรา', text, url })
      done('shared')
      return
    }
    await navigator.clipboard.writeText(url)
    done('copied')
  } catch {
    done(null) // user dismissed the sheet, or clipboard was blocked
  }
}

// Hashtags on a post. On the feed they filter it; elsewhere they're plain text.
function PostTags({ tags, onTagClick }) {
  if (!tags?.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (onTagClick ? (
        <button
          key={t}
          type="button"
          onClick={() => onTagClick(t)}
          className="min-h-[46px] px-4 rounded-pill border-2 border-line bg-surface text-teal-700 text-b-sm font-bold hover:bg-teal-100 transition-colors"
        >
          {t}
        </button>
      ) : (
        <span key={t} className="min-h-[46px] px-4 py-2 rounded-pill border-2 border-line text-teal-700 text-b-sm font-bold">
          {t}
        </span>
      )))}
    </div>
  )
}

export default function PostCard({ post, linkBody = true, onReply, onTagClick }) {
  const [shared, setShared] = useState(null)
  const body = <p className="text-b-base leading-[1.65] m-0 whitespace-pre-line">{post.body}</p>

  function share() {
    sharePost(post, (result) => {
      setShared(result)
      if (result) setTimeout(() => setShared(null), 2500)
    })
  }

  return (
    <article className="bg-surface rounded-card border-[1.5px] border-line shadow-card p-6 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <Avatar name={post.author} verified={post.verified} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-b-h3 font-bold">{post.author}</span>
            <AuthorBadge label={post.badge} verified={post.verified} />
          </div>
          <div className="flex flex-wrap items-center gap-2.5 mt-1">
            <span className="text-b-sm text-ink-secondary">{post.when}</span>
            <TopicPill topic={post.topic} />
          </div>
        </div>
        {post.own && (
          <button
            type="button"
            onClick={() => {
              if (confirm('ลบโพสต์นี้ใช่ไหม')) community.deletePost(post.id)
            }}
            aria-label="ลบโพสต์ของฉัน"
            className="w-[50px] h-[50px] rounded-[13px] border-2 border-line bg-surface text-ink-secondary flex items-center justify-center flex-shrink-0 hover:bg-coral-100 hover:text-coral-700 hover:border-coral-600 transition-colors"
          >
            <Trash size={20} />
          </button>
        )}
      </div>

      {linkBody
        ? <Link to={`/community/${post.id}`} className="text-ink-primary no-underline">{body}</Link>
        : body}

      <PostTags tags={post.tags} onTagClick={onTagClick} />

      <PostImages images={post.images} alt={`โพสต์ของ${post.author}`} />

      {post.event && <EventBlock post={post} />}

      <div className="flex flex-wrap gap-1.5 border-t-[1.5px] pt-2" style={{ borderColor: '#E6F1F7' }}>
        <Action
          icon={Award}
          label="ให้กำลังใจ"
          count={post.cheerCount}
          on={post.cheered}
          onClick={() => community.toggleCheer(post.id)}
        />
        {onReply
          ? <Action icon={Chat} label="ตอบกลับ" count={post.commentCount} onClick={() => onReply()} />
          : <Action icon={Chat} label="ความคิดเห็น" count={post.commentCount} to={`/community/${post.id}`} />}
        <Action
          icon={Send}
          label={shared === 'copied' ? 'คัดลอกลิงก์แล้ว' : shared === 'shared' ? 'แชร์แล้ว' : 'แชร์ต่อ'}
          count={shared ? null : post.shares}
          on={!!shared}
          onClick={share}
        />
        <Action
          icon={Check}
          label={post.saved ? 'บันทึกแล้ว' : 'บันทึก'}
          on={post.saved}
          onClick={() => community.toggleSave(post.id)}
        />
      </div>
    </article>
  )
}
