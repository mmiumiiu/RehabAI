// Client-side LSVT LOUD scoring — a faithful port of backend/lsvt_loud.py, used
// as a fallback when the backend /lsvt/score endpoint can't be reached so the
// exercise still works offline / without the API running. The backend stays the
// source of truth when available; this only fills in when it isn't.

const COUNT_THRESHOLD = 80  // a part passes at >= this (matches lsvt_loud.py)

// Linear interpolation of x between anchor points, guarding zero-width spans.
function lerp(x, x0, y0, x1, y1) {
  if (x1 === x0) return x >= x1 ? y1 : y0
  return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
}

// Map a measured dB reading to 0–100 against the therapist's band.
export function scoreDb(db, band) {
  const lowRamp = Math.max(band.good_min - band.min, 1e-6)
  const highRamp = Math.max(band.max - band.good_max, 1e-6)

  let score
  if (db >= band.good_min && db <= band.good_max) score = 100
  else if (db >= band.min && db < band.good_min) score = lerp(db, band.min, 70, band.good_min, 100)
  else if (db > band.good_max && db <= band.max) score = lerp(db, band.good_max, 100, band.max, 70)
  else if (db < band.min) score = lerp(db, band.min - lowRamp, 0, band.min, 70)
  else score = lerp(db, band.max, 70, band.max + highRamp, 0)  // db > band.max
  score = Math.max(0, Math.min(100, score))

  let verdict
  if (db < band.min) verdict = 'too_soft'
  else if (db > band.max) verdict = 'too_loud'
  else if (db < band.good_min) verdict = 'soft_ok'
  else if (db > band.good_max) verdict = 'loud_ok'
  else verdict = 'good'

  return { score: Math.round(score), verdict, passed: db >= band.min && db <= band.max }
}

const normalize = (t) => (t || '').split(/\s+/).join('').toLowerCase()

// Ratcliff/Obershelp similarity — the same measure difflib.SequenceMatcher.ratio
// computes: 2 * (sum of longest matching blocks) / (len(a) + len(b)).
function longestMatch(a, b, alo, ahi, blo, bhi) {
  let bestI = alo, bestJ = blo, bestSize = 0
  for (let i = alo; i < ahi; i++) {
    for (let j = blo; j < bhi; j++) {
      let k = 0
      while (i + k < ahi && j + k < bhi && a[i + k] === b[j + k]) k++
      if (k > bestSize) { bestI = i; bestJ = j; bestSize = k }
    }
  }
  return [bestI, bestJ, bestSize]
}

function matchingBlocks(a, b, alo, ahi, blo, bhi) {
  const [i, j, k] = longestMatch(a, b, alo, ahi, blo, bhi)
  if (k === 0) return 0
  return k + matchingBlocks(a, b, alo, i, blo, j) + matchingBlocks(a, b, i + k, ahi, j + k, bhi)
}

function ratio(a, b) {
  const total = a.length + b.length
  if (total === 0) return 1
  return (2 * matchingBlocks(a, b, 0, a.length, 0, b.length)) / total
}

// Compare recognised speech to the target word, mapped to 0–100.
export function scoreWord(transcript, target, threshold = 0.7) {
  const a = normalize(transcript), b = normalize(target)
  const similarity = (!a && !b) ? 1 : ratio(a, b)
  return {
    score: Math.round(similarity * 100),
    similarity: Math.round(similarity * 1000) / 1000,
    verdict: similarity >= threshold ? 'correct' : 'incorrect',
    passed: similarity >= threshold,
  }
}

// Score a sustained-phonation hold against the acceptable range.
export function scoreHold(holdSec, holdMin, holdTarget) {
  let score
  if (holdSec >= holdTarget) score = 100
  else if (holdSec >= holdMin) score = lerp(holdSec, holdMin, COUNT_THRESHOLD, holdTarget, 100)
  else score = lerp(holdSec, 0, 0, holdMin, COUNT_THRESHOLD)
  score = Math.max(0, Math.min(100, score))
  return {
    score: Math.round(score),
    hold_sec: Math.round(holdSec * 10) / 10,
    min_sec: Math.round(holdMin * 10) / 10,
    target_sec: Math.round(holdTarget * 10) / 10,
    verdict: holdSec >= holdMin ? 'reached' : 'short',
    passed: holdSec >= holdMin,
  }
}

// Mirror of the backend POST /lsvt/score response shape.
export function scoreLoud({ db, mode = 'word', transcript = '', target_word = '',
  hold_sec = 0, hold_min = 5, hold_target = 7, band, word_threshold = 0.7 }) {
  const dbPart = scoreDb(db, band)
  const wordPart = target_word ? scoreWord(transcript, target_word, word_threshold) : null
  const holdPart = mode === 'sustain' ? scoreHold(hold_sec, hold_min, hold_target) : null
  const parts = [dbPart, wordPart, holdPart].filter(Boolean).map((p) => p.score)
  return {
    db: dbPart,
    word: wordPart,
    hold: holdPart,
    passed: parts.every((s) => s >= COUNT_THRESHOLD),
  }
}
