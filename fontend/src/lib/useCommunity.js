import { useCallback, useEffect, useState } from 'react'
import { community } from './services.js'
import { COMMUNITY_POSTS, COMMUNITY_COMMENTS, COMMUNITY_EVENTS } from './mockData.js'

// Live view of the community feed: the seeded demo posts from mockData with the
// viewer's own posts, comments and reactions (from the `community` service)
// merged on top. Re-reads whenever the service writes — in this tab (custom
// event), in another tab (storage event), or when the tab regains focus.

// Fold the viewer's stored state into one post.
function decorate(post, state) {
  const id = String(post.id)
  const cheered = !!state.cheers[id]
  const saved = !!state.saves[id]
  const going = !!state.going[id]
  const ownComments = state.comments[id] || []
  const comments = [...(COMMUNITY_COMMENTS[post.id] || []), ...ownComments]
  return {
    ...post,
    cheered,
    saved,
    following: !!state.follows[post.author],
    // Seeded counts are the baseline; the viewer's own reaction adds one.
    cheerCount: (post.cheers || 0) + (cheered ? 1 : 0),
    commentCount: (post.comments || 0) + ownComments.length,
    comments,
    event: post.event
      ? { ...post.event, going, goingCount: post.event.going + (going ? 1 : 0) }
      : null,
  }
}

function buildFeed() {
  const state = community.state()
  const posts = [...state.posts, ...COMMUNITY_POSTS].map((p) => decorate(p, state))
  // Standalone event cards carry their own RSVP, keyed "ev:<id>".
  const events = COMMUNITY_EVENTS.map((e) => {
    const going = !!state.going[`ev:${e.id}`]
    return { ...e, going, goingCount: e.going + (going ? 1 : 0) }
  })
  return { posts, events, state }
}

export function useCommunity() {
  const [{ posts, events, state }, setFeed] = useState(buildFeed)

  const reload = useCallback(() => setFeed(buildFeed()), [])

  useEffect(() => {
    window.addEventListener('rehabai:community', reload)
    window.addEventListener('storage', reload)
    window.addEventListener('focus', reload)
    return () => {
      window.removeEventListener('rehabai:community', reload)
      window.removeEventListener('storage', reload)
      window.removeEventListener('focus', reload)
    }
  }, [reload])

  return { posts, events, state, reload }
}

// One post by id (own posts included), or null when it doesn't exist.
export function useCommunityPost(id) {
  const { posts, state } = useCommunity()
  const post = posts.find((p) => String(p.id) === String(id)) || null
  return { post, state }
}

// Comment cheer counts live in the same per-viewer bucket.
export function commentCheerCount(comment, state) {
  const on = !!state.commentCheers[String(comment.id)]
  return { on, count: (comment.cheers || 0) + (on ? 1 : 0) }
}
