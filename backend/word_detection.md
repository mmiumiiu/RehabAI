# การ Detect คำ (Word Accuracy Detection)

เอกสารนี้อธิบายตรรกะ (logic) ที่ใช้ตรวจจับ/ให้คะแนนความถูกต้องของคำในโฟลเดอร์ `backend/`
โค้ดอยู่ใน `backend/lsvt_loud.py` (ส่วนของ LSVT LOUD — การบำบัดเสียงสำหรับผู้ป่วยพาร์กินสัน)

> หมายเหตุ: การถอดเสียงเป็นข้อความ (speech-to-text / ASR) ทำในเบราว์เซอร์
> โมดูลนี้เป็น "ผู้ตัดสินคะแนน" เท่านั้น — รับข้อความที่ถอดได้แล้วมาเทียบกับคำเป้าหมาย
> ใช้แค่ Python stdlib (`difflib`) จึงไม่เพิ่ม dependency ตอน deploy

---

## 1. สูตรหลัก — `score_word()` (`lsvt_loud.py:90`)

```python
from difflib import SequenceMatcher


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
```

---

## 2. ตรรกะการทำงาน (ทีละขั้น)

1. **รับ input จากเบราว์เซอร์** — โมดูลไม่ได้ทำ ASR เอง แต่รับ `transcript`
   (ข้อความที่ถอดเสียงได้แล้ว) มาเทียบกับ `target` (คำเป้าหมาย เช่น `"สวัสดี"`)
2. **`_normalize()`** — ตัดช่องว่างทั้งหมดและแปลงเป็นตัวพิมพ์เล็ก
   เพื่อให้ `"สวัสดี "` กับ `"สวัสดี"` ถือว่าเท่ากัน
3. **วัดความคล้าย (similarity)** — ใช้ `difflib.SequenceMatcher(None, a, b).ratio()`
   เทียบความเหมือนระดับตัวอักษร (character-level) ได้ค่าในช่วง `0.0–1.0`
   - กรณีทั้งสองข้อความว่างเปล่า จะถือว่าเหมือนกันสมบูรณ์ (`1.0`)
4. **แปลงเป็นคะแนน** — `score = round(similarity * 100)` → ช่วง 0–100
5. **ตัดสินผ่าน/ไม่ผ่าน** — ผ่าน (`passed = True`, `verdict = "correct"`)
   เมื่อ `similarity >= threshold` (ค่าเริ่มต้น `0.7`)
   เพื่อผ่อนปรนความคลาดเคลื่อนเล็กน้อยของ ASR

### รูปแบบผลลัพธ์ (return)

| Field | ความหมาย |
|---|---|
| `score` | คะแนนความถูกต้องของคำ 0–100 |
| `similarity` | ค่าความคล้าย 0.0–1.0 (ปัดทศนิยม 3 ตำแหน่ง) |
| `verdict` | `"correct"` หรือ `"incorrect"` |
| `passed` | ผ่านเกณฑ์ threshold หรือไม่ (boolean) |

---

## 3. จุดที่ถูกเรียกใช้ — endpoint `/lsvt/score` (`lsvt_loud.py:143`)

```python
word = score_word(req.transcript, req.target_word, req.word_threshold) if req.target_word else None
```

- การ detect คำจะทำ **เฉพาะเมื่อมีการส่ง `target_word` มาเท่านั้น**
- ผลถูกรายงานแยกใน field `"word"` ของ response (ไม่รวมกับคะแนนความดัง `db`
  หรือระยะเวลาออกเสียง `hold`)
- 1 repetition จะนับว่า `passed` เมื่อ **ทุกส่วนที่ถูกให้คะแนน** ได้อย่างน้อย
  `COUNT_THRESHOLD` (= 80 คะแนน)

พารามิเตอร์ที่เกี่ยวข้องใน `ScoreRequest` (`lsvt_loud.py:131`):

| พารามิเตอร์ | ความหมาย |
|---|---|
| `transcript` | ผลถอดเสียงเป็นข้อความ (word mode) |
| `target_word` | คำที่ผู้ป่วยต้องพูด |
| `word_threshold` | เกณฑ์ความคล้ายขั้นต่ำที่ถือว่าผ่าน (ค่าเริ่มต้น 0.7) |

---

## อ้างอิงตำแหน่งโค้ด

| ฟังก์ชัน / สิ่งที่เกี่ยวข้อง | ไฟล์ / บรรทัด |
|---|---|
| `from difflib import SequenceMatcher` | `backend/lsvt_loud.py:18` |
| `_normalize()` | `backend/lsvt_loud.py:85` |
| `score_word()` | `backend/lsvt_loud.py:90` |
| `ScoreRequest` | `backend/lsvt_loud.py:131` |
| endpoint `/lsvt/score` | `backend/lsvt_loud.py:143` |
