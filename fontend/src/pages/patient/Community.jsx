import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PostCard, { Avatar } from '../../components/PostCard.jsx'
import {
  MapPin, Camera, Mic, Send, Check, AlertTriangle, Trash, Clock, Users,
} from '../../components/icons.jsx'
import {
  COMMUNITY_TOPICS, COMMUNITY_TAGS, COMMUNITY_RULES, COMMUNITY_DISCLAIMER,
} from '../../lib/mockData.js'
import { community } from '../../lib/services.js'
import { useCommunity } from '../../lib/useCommunity.js'
import { useSpeechInput } from '../../lib/useSpeechInput.js'
import { fileToDataUrl, isImageFile, MAX_IMAGES } from '../../lib/imageFile.js'
import { useAuth } from '../../context/AuthContext.jsx'

// "ชุมชนของเรา" — single full-width column on a white page, no tabs and no right
// rail. Order: rules bar (yellow) → events → hashtags → composer → topic filter
// → feed.
// Cards are white with a light-blue (#CDE3EE) border. Every control is ≥50px
// tall and wired to the `community` service, so state survives a refresh.

const CARD = 'bg-surface rounded-card border-[1.5px] border-line'
const FILTERS = ['ทั้งหมด', ...COMMUNITY_TOPICS, 'คนที่ติดตาม']

// Big round hashtag button.
function TagButton({ tag, posts, on, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`flex flex-col items-center justify-center text-center gap-0.5 rounded-full border-[3px] transition-colors px-4 ${
        on
          ? 'bg-teal-700 border-teal-700 text-white'
          : 'bg-surface border-line text-ink-primary hover:bg-teal-50'
      }`}
      style={{ minWidth: 128, minHeight: 128 }}
    >
      <span className="text-b-label font-bold leading-tight break-words">{tag}</span>
      <span className={`text-b-sm ${on ? 'text-white/80' : 'text-ink-secondary'}`}>{posts} โพสต์</span>
    </button>
  )
}

// Stacked top to bottom — date row, then title, time, place — so a long event
// name wraps onto its own lines instead of being squeezed beside the date.
function EventCard({ event }) {
  return (
    <article className={`${CARD} p-5 flex flex-col gap-3`}>
      {/* Date — full-width top row */}
      <div
        className="flex items-center gap-3 self-start px-4 py-2 rounded-[14px]"
        style={{ background: event.tint }}
      >
        <span className="text-b-h3 font-bold leading-none">{event.day}</span>
        <span className="text-b-label font-bold" style={{ color: '#B4233A' }}>{event.month}</span>
      </div>

      <h3 className="font-heading text-b-h3 font-bold m-0 leading-snug break-words">{event.title}</h3>

      <div className="text-b-base flex items-start gap-2">
        <Clock size={20} className="flex-shrink-0 mt-0.5" /> {event.time}
      </div>

      <div className="text-b-base flex items-start gap-2">
        <MapPin size={20} className="flex-shrink-0 mt-0.5" /> {event.place}
      </div>

      <div className="text-b-sm text-ink-secondary flex items-center gap-2">
        <Users size={18} /> ไปด้วยแล้ว {event.goingCount} คน
      </div>

      <button
        type="button"
        aria-pressed={event.going}
        onClick={() => community.toggleEventGoing(event.id)}
        className={`mt-auto flex items-center justify-center gap-3 min-h-[57px] px-5 rounded-btn text-b-btn font-bold border-[3px] transition-colors ${
          event.going
            ? 'bg-teal-700 border-teal-700 text-white'
            : 'bg-surface border-teal-700 text-teal-700 hover:bg-teal-100'
        }`}
      >
        {event.going ? <><Check size={22} /> ไปด้วยแล้ว</> : 'ไปด้วย'}
      </button>
    </article>
  )
}

export default function Community() {
  const { user } = useAuth()
  const name = user?.name || 'ผู้ใช้งาน'
  const { posts, events, state } = useCommunity()

  const [draft, setDraft] = useState('')
  const [topic, setTopic] = useState(COMMUNITY_TOPICS[0])
  const [images, setImages] = useState([])
  const [filter, setFilter] = useState('ทั้งหมด')
  const [tag, setTag] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  const speech = useSpeechInput((text) =>
    setDraft((d) => (d.trim() ? `${d.trim()} ${text}` : text)))

  const canPost = draft.trim().length > 0 && !busy

  async function pickImages(e) {
    setError(null)
    const files = Array.from(e.target.files || []).filter(isImageFile)
    e.target.value = '' // let the same file be picked again later
    if (!files.length) return
    const room = MAX_IMAGES - images.length
    if (room <= 0) {
      setError(`แนบรูปได้ไม่เกิน ${MAX_IMAGES} รูปต่อโพสต์`)
      return
    }
    try {
      const added = await Promise.all(files.slice(0, room).map(fileToDataUrl))
      setImages((list) => [...list, ...added])
    } catch (err) {
      setError(err.message || 'เพิ่มรูปไม่สำเร็จ')
    }
  }

  async function submit() {
    if (!canPost) return
    setBusy(true)
    setError(null)
    try {
      await community.addPost({ text: draft, topic, images })
      setDraft('')
      setImages([])
      setFilter('ทั้งหมด') // make sure the new post is visible
      setTag(null)
    } catch (err) {
      setError(err.message || 'โพสต์ไม่สำเร็จ')
    } finally {
      setBusy(false)
    }
  }

  // Hashtag and topic filters stack: both must match.
  const shown = posts
    .filter((p) => (tag ? (p.tags || []).includes(tag) : true))
    .filter((p) => {
      if (COMMUNITY_TOPICS.includes(filter)) return p.topic === filter
      if (filter === 'คนที่ติดตาม') return !!state.follows[p.author]
      return true
    })

  return (
    <div className="bg-surface -mx-4 md:-mx-9 -my-6 md:-my-8 px-4 md:px-9 py-6 md:py-8 min-h-screen flex flex-col gap-8">
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

      {/* 1 · Community rules — yellow bar straight under the heading */}
      <section
        className="rounded-card border-2 p-6 flex flex-col gap-4"
        style={{ background: '#FFF1C7', borderColor: '#E6CF86', color: '#6B4A00' }}
      >
        <h2 className="flex items-center gap-3 font-heading text-b-h2 font-bold m-0 leading-[1.3]">
          <AlertTriangle size={26} className="flex-shrink-0" /> กติกาของชุมชน
        </h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {COMMUNITY_RULES.map((r) => (
            <div key={r} className="flex gap-3 text-b-base font-semibold leading-[1.5]">
              <Check size={20} className="flex-shrink-0" />
              {r}
            </div>
          ))}
        </div>
        <p className="text-b-label font-semibold leading-[1.6] m-0">{COMMUNITY_DISCLAIMER}</p>
      </section>

      {/* 2 · Events — three cards on one row */}
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-b-h2 font-bold m-0 leading-[1.3]">กิจกรรมใกล้คุณ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </section>

      {/* 3 · Hashtags — big round buttons that filter the feed */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-heading text-b-h2 font-bold m-0 leading-[1.3]">หัวข้อที่คุยกันเยอะ</h2>
          {tag && (
            <button
              type="button"
              onClick={() => setTag(null)}
              className="inline-flex items-center gap-2.5 min-h-[50px] px-5 rounded-pill border-[3px] border-line bg-surface text-b-base font-bold hover:bg-teal-50 transition-colors"
            >
              <Trash size={20} /> ล้างตัวกรองแท็ก
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          {COMMUNITY_TAGS.map((t) => (
            <TagButton
              key={t.tag}
              tag={t.tag}
              posts={t.posts}
              on={tag === t.tag}
              onClick={() => setTag((cur) => (cur === t.tag ? null : t.tag))}
            />
          ))}
        </div>
      </section>

      {/* 4 · Composer */}
      <section className={`${CARD} p-6 flex flex-col gap-3.5`}>
        <div className="flex gap-4 items-start">
          <Avatar name={name} />
          <label className="sr-only" htmlFor="newpost">เขียนโพสต์</label>
          <textarea
            id="newpost"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="วันนี้เป็นอย่างไร เล่าให้เพื่อนฟังได้เลย · พิมพ์ #แท็ก เพื่อให้คนอื่นหาเจอ"
            className="flex-1 min-h-[93px] px-5 py-3.5 rounded-field border-2 border-line bg-bg text-b-base font-body text-ink-primary outline-none focus:border-teal-700 transition-colors resize-y"
          />
        </div>

        {/* Picked images — preview before posting, removable */}
        {images.length > 0 && (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            {images.map((src, i) => (
              <div key={i} className="relative">
                <img
                  src={src}
                  alt={`รูปที่ ${i + 1} ที่จะโพสต์`}
                  className="w-full rounded-[17px] border-2 border-line"
                  style={{ height: 130, objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => setImages((list) => list.filter((_, n) => n !== i))}
                  aria-label={`ลบรูปที่ ${i + 1}`}
                  className="absolute top-2 right-2 w-[44px] h-[44px] rounded-full bg-coral-600 text-white flex items-center justify-center shadow-soft hover:bg-coral-800 transition-colors"
                >
                  <Trash size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2.5 items-center">
          <span className="text-b-sm font-bold text-ink-secondary">โพสต์นี้เกี่ยวกับ</span>
          {COMMUNITY_TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={topic === t}
              onClick={() => setTopic(t)}
              className={`min-h-[50px] px-4 rounded-pill border-2 text-b-sm font-bold transition-colors ${
                topic === t ? 'border-teal-700 bg-teal-100 text-ink-primary' : 'border-line bg-surface text-ink-primary hover:bg-teal-50'
              }`}
            >
              {t}
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

        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2.5 flex-wrap">
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={pickImages} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-3 min-h-[54px] px-5 rounded-btn border-[3px] border-line bg-surface text-b-base font-bold hover:bg-teal-50 transition-colors"
            >
              <Camera size={22} /> รูปภาพ
            </button>
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
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!canPost}
            className="flex items-center gap-3 min-h-[57px] px-6 rounded-btn bg-teal-700 border-[3px] border-teal-700 text-white text-b-btn font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-800 hover:border-teal-800 transition-colors"
          >
            <Send size={22} /> {busy ? 'กำลังโพสต์…' : 'โพสต์'}
          </button>
        </div>
      </section>

      {/* 5 · Topic filter — pills, not tabs */}
      <section className="flex flex-wrap gap-3 items-center">
        <span className="text-b-base font-bold text-ink-secondary">ดูโพสต์</span>
        {FILTERS.map((f) => {
          const on = filter === f
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(f)}
              className={`min-h-[54px] px-5 rounded-pill border-[3px] text-b-base font-bold transition-colors ${
                on ? 'bg-teal-700 border-teal-700 text-white' : 'bg-surface border-line text-ink-primary hover:bg-teal-50'
              }`}
            >
              {f}
            </button>
          )
        })}
      </section>

      {/* 6 · Feed */}
      <section className="flex flex-col gap-5">
        {tag && (
          <p className="text-b-base text-ink-secondary m-0">
            กำลังดูโพสต์ที่มีแท็ก <b className="text-teal-700">{tag}</b>
          </p>
        )}
        {shown.length === 0 ? (
          <div className={`${CARD} p-6`}>
            <p className="text-b-base text-ink-secondary leading-[1.6] m-0">
              {filter === 'คนที่ติดตาม'
                ? 'คุณยังไม่ได้ติดตามใคร — กดเข้าไปในโพสต์แล้วกด “ติดตาม” เพื่อเห็นโพสต์ของคนนั้นที่นี่'
                : tag
                  ? `ยังไม่มีโพสต์ที่มีแท็ก ${tag} — เขียนโพสต์แล้วใส่แท็กนี้ได้เลย`
                  : `ยังไม่มีโพสต์ในหมวด “${filter}” — เขียนโพสต์แรกได้เลย`}
            </p>
          </div>
        ) : (
          shown.map((p) => <PostCard key={p.id} post={p} onTagClick={setTag} />)
        )}
      </section>

    </div>
  )
}
