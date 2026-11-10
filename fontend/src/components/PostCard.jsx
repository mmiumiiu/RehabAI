import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Chat, Send, Check, MapPin, Clock, ShieldCheck } from './icons.jsx'
import { TOPIC_STYLES } from '../lib/mockData.js'

// Community post card, shared by the feed (#community) and the post page
// (#communitypost). Mockup px ÷ 1.4 (the patient portal body zoom).

export function AuthorBadge({ label, verified }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-b-xs font-bold px-3 py-0.5 rounded-pill"
      style={verified ? { background: '#DDF3F1', color: '#0E5E58' } : { background: '#E0F1FA', color: '#0B3550' }}
    >
      {verified && <ShieldCheck size={15} />}
      {label}
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

function Avatar({ name, size = 48, verified }) {
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
      {name.replace(/^กภ\./, '').slice(0, 2)}
    </span>
  )
}

// Action row button — outlined pill that fills in once pressed.
function Action({ icon: Icon, label, count, on, onClick, as, to }) {
  const cls = `inline-flex items-center gap-2.5 min-h-[46px] px-3.5 rounded-[13px] border-2 text-b-sm font-bold transition-colors ${
    on ? 'bg-teal-100 border-teal-700 text-teal-800' : 'bg-surface border-line text-ink-primary hover:bg-teal-50'
  }`
  const body = (
    <>
      <Icon size={20} />
      {label}{count != null && ` · ${count}`}
    </>
  )
  if (as === 'link') return <Link to={to} className={cls}>{body}</Link>
  return <button type="button" onClick={onClick} className={cls}>{body}</button>
}

// The event invite block inside a "ชวนทำกิจกรรม" post.
function EventBlock({ event }) {
  const [going, setGoing] = useState(false)
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
        <div className="text-b-sm text-ink-secondary">ไปด้วยแล้ว {event.going + (going ? 1 : 0)} คน</div>
      </div>
      <button
        type="button"
        onClick={() => setGoing((g) => !g)}
        className={`flex items-center justify-center gap-3 min-h-[51px] px-6 rounded-btn text-b-btn font-bold border-[3px] transition-colors ${
          going ? 'bg-teal-700 border-teal-700 text-white' : 'bg-surface border-teal-700 text-teal-700'
        }`}
      >
        {going ? <><Check size={22} /> ไปด้วยแล้ว</> : 'ไปด้วย'}
      </button>
    </div>
  )
}

export default function PostCard({ post, linkBody = true }) {
  const [cheered, setCheered] = useState(false)
  const [saved, setSaved] = useState(false)

  const body = (
    <p className="text-b-base leading-[1.65] m-0">{post.body}</p>
  )

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
      </div>

      {linkBody
        ? <Link to={`/community/${post.id}`} className="text-ink-primary no-underline">{body}</Link>
        : body}

      {post.event && <EventBlock event={post.event} />}

      <div className="flex flex-wrap gap-1.5 border-t-[1.5px] pt-2" style={{ borderColor: '#E6F1F7' }}>
        <Action
          icon={Award}
          label="ให้กำลังใจ"
          count={post.cheers + (cheered ? 1 : 0)}
          on={cheered}
          onClick={() => setCheered((c) => !c)}
        />
        <Action icon={Chat} label="ความคิดเห็น" count={post.comments} as="link" to={`/community/${post.id}`} />
        <Action icon={Send} label="แชร์ต่อ" count={post.shares} />
        <Action icon={Check} label={saved ? 'บันทึกแล้ว' : 'บันทึก'} on={saved} onClick={() => setSaved((s) => !s)} />
      </div>
    </article>
  )
}

export { Avatar }
