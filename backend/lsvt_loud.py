# lsvt_loud.py — LSVT LOUD scoring for Parkinson's voice therapy.
#
# Scores a single voice attempt on TWO independent axes, both mapped to the
# SAME 0–100 scale so they can be combined with equal weight:
#
#   1. Loudness (dB)  — how loud the patient spoke, graded against a per-patient
#                       band the therapist sets:  min · good_min–good_max · max
#                       e.g. min=65, good=70–85, max=90.
#   2. Word accuracy  — how closely the recognised speech matches a target word
#                       (e.g. "สวัสดี"), via string similarity.
#
# The loudness detection (mic RMS→dB) and the speech-to-text run in the browser;
# this module is the scoring authority: given the measured dB, the recognised
# transcript, the target word and the therapist's band, it returns per-axis
# scores plus a combined score.  Only the Python stdlib is used (difflib) so no
# new deploy dependencies are added.

from difflib import SequenceMatcher
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/lsvt", tags=["lsvt-loud"])

# A rep only counts when BOTH parts score at least this out of 100.
COUNT_THRESHOLD = 80


class Band(BaseModel):
    """Therapist-defined loudness band for one patient (in dB)."""
    min: float = 65        # below this = too soft (fails)
    good_min: float = 70   # start of the ideal zone
    good_max: float = 85   # end of the ideal zone
    max: float = 90        # above this = too loud (fails)


def _lerp(x, x0, y0, x1, y1):
    """Linear interpolation of x between anchor points, guarding zero-width spans."""
    if x1 == x0:
        return y1 if x >= x1 else y0
    return y0 + (y1 - y0) * (x - x0) / (x1 - x0)


def score_db(db: float, band: Band):
    """Map a measured dB reading to 0–100 against the therapist's band.

    Anchor points (piecewise-linear):
        far-below → 0 · min → 70 · good_min → 100 · good_max → 100 · max → 70 · far-above → 0
    where "far" is the same width as the acceptable ramp on each side, so the
    score reaches 0 symmetrically outside the [min, max] window.
    """
    low_ramp = max(band.good_min - band.min, 1e-6)   # width of the soft-but-ok zone
    high_ramp = max(band.max - band.good_max, 1e-6)   # width of the loud-but-ok zone

    if band.good_min <= db <= band.good_max:
        score = 100.0
    elif band.min <= db < band.good_min:
        score = _lerp(db, band.min, 70, band.good_min, 100)
    elif band.good_max < db <= band.max:
        score = _lerp(db, band.good_max, 100, band.max, 70)
    elif db < band.min:
        score = _lerp(db, band.min - low_ramp, 0, band.min, 70)
    else:  # db > band.max
        score = _lerp(db, band.max, 70, band.max + high_ramp, 0)

    score = max(0.0, min(100.0, score))

    if db < band.min:
        verdict = "too_soft"
    elif db > band.max:
        verdict = "too_loud"
    elif db < band.good_min:
        verdict = "soft_ok"
    elif db > band.good_max:
        verdict = "loud_ok"
    else:
        verdict = "good"

    return {
        "score": round(score),
        "verdict": verdict,
        "passed": band.min <= db <= band.max,
    }


def _normalize(text: str) -> str:
    """Lowercase and strip spaces so 'สวัสดี ' and 'สวัสดี' compare equal."""
    return "".join(text.split()).lower()


def score_word(transcript: str, target: str, threshold: float = 0.7):
    """Compare recognised speech to the target word, mapped to 0–100.

    Uses difflib's ratio (character-level similarity). Passes when similarity is
    at least `threshold` (default 0.7), tolerating small ASR slips.
    """
    a, b = _normalize(transcript), _normalize(target)
    similarity = 1.0 if (not a and not b) else SequenceMatcher(None, a, b).ratio()
    return {
        "score": round(similarity * 100),
        "similarity": round(similarity, 3),
        "verdict": "correct" if similarity >= threshold else "incorrect",
        "passed": similarity >= threshold,
    }


def score_hold(hold_sec: float, hold_min: float, hold_target: float):
    """Score a sustained-phonation hold (e.g. saying "อา") against an acceptable
    range [hold_min, hold_target] seconds.

    The range is mapped straight onto the pass band: reaching hold_min scores
    exactly COUNT_THRESHOLD (the pass mark), hold_target and beyond score 100, and
    anything shorter ramps down to 0. So holding within 5–7 s == passing (> 80%).
    """
    if hold_sec >= hold_target:
        score = 100.0
    elif hold_sec >= hold_min:
        score = _lerp(hold_sec, hold_min, COUNT_THRESHOLD, hold_target, 100)
    else:
        score = _lerp(hold_sec, 0, 0, hold_min, COUNT_THRESHOLD)
    score = max(0.0, min(100.0, score))
    return {
        "score": round(score),
        "hold_sec": round(hold_sec, 1),
        "min_sec": round(hold_min, 1),
        "target_sec": round(hold_target, 1),
        "verdict": "reached" if hold_sec >= hold_min else "short",
        "passed": hold_sec >= hold_min,
    }


class ScoreRequest(BaseModel):
    db: float = Field(..., description="Measured loudness in dB")
    mode: str = Field("word", description="'word' = word accuracy · 'sustain' = hold duration")
    transcript: str = Field("", description="Speech-to-text result (word mode)")
    target_word: str = Field("", description="Word the patient should say (word mode)")
    hold_sec: float = Field(0, description="Seconds the vowel was sustained (sustain mode)")
    hold_min: float = Field(5, description="Low end of the acceptable hold range (sustain mode)")
    hold_target: float = Field(7, description="High end / full-marks hold time (sustain mode)")
    band: Band = Band()
    word_threshold: float = 0.7


@router.post("/score")
def score(req: ScoreRequest):
    """Score one LSVT LOUD attempt on up to THREE independent parts (each /100):

      - db   → ความดัง (loudness accuracy)              — always scored
      - word → ความถูกต้องของคำ (word accuracy)         — when target_word is given
      - hold → ระยะเวลาการออกเสียง (phonation duration) — when mode == 'sustain'

    Which parts apply depends on the exercise step (e.g. "อา" uses all three;
    a spoken sentence uses db + word). Parts are reported separately, never
    merged. A rep only counts (`passed` = True) when EVERY applied part scores at
    least COUNT_THRESHOLD (> 80%).
    """
    db = score_db(req.db, req.band)
    word = score_word(req.transcript, req.target_word, req.word_threshold) if req.target_word else None
    hold = score_hold(req.hold_sec, req.hold_min, req.hold_target) if req.mode == "sustain" else None

    parts = [p["score"] for p in (db, word, hold) if p is not None]
    return {
        "db": db,      # loudness part, 0–100
        "word": word,  # word part, 0–100 (or null if not scored)
        "hold": hold,  # duration part, 0–100 (or null if not scored)
        "passed": all(s >= COUNT_THRESHOLD for s in parts),
    }
