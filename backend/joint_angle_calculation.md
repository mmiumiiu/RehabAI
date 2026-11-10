# การคำนวณมุมข้อต่อ (Joint Angle Calculation)

เอกสารนี้อธิบายตรรกะ (logic) ที่ใช้คำนวณมุมข้อต่อในโฟลเดอร์ `backend/`
โค้ดอยู่ใน `backend/main.py` และซ้ำแบบเดียวกันใน `backend/test.py`

> ⚠️ ตามข้อกำหนดใน `CLAUDE.md`: ฟังก์ชัน feature engineering เหล่านี้คัดลอกมาจาก
> training notebook แบบตรงตัว **ห้ามแก้ไขหรือ refactor** เพราะจะทำให้ผลลัพธ์ของโมเดล
> คลาดเคลื่อน (model outputs drift)

---

## 1. สูตรหลัก — `angle(a, b, c)` (`main.py:48`)

```python
def angle(a, b, c):
    ba, bc = a - b, c - b
    cos = np.sum(ba*bc, -1) / (np.linalg.norm(ba, axis=-1)*np.linalg.norm(bc, axis=-1) + 1e-8)
    return np.degrees(np.arccos(np.clip(cos, -1, 1)))
```

คำนวณมุมที่จุดข้อต่อ **`b`** ซึ่งเกิดจากกระดูก 2 ท่อนที่ยื่นออกไปยังจุด **`a`** และ **`c`**
โดยใช้วิธี vector มาตรฐาน:

1. สร้างเวกเตอร์กระดูกจากจุดยอด (vertex): `ba = a − b`, `bc = c − b`
2. **หา cosine ด้วย dot product**: `cos = (ba · bc) / (‖ba‖ · ‖bc‖)`
   ตัว `+ 1e-8` ป้องกันการหารด้วยศูนย์
3. `np.clip(cos, -1, 1)` ป้องกันค่าที่หลุดออกจากช่วง `[-1, 1]` เนื่องจาก floating-point
   ก่อนส่งเข้า `arccos`
4. `arccos` → เรเดียน แล้วแปลงเป็นองศาด้วย `np.degrees(...)`

ผลลัพธ์คือมุมภายใน (interior angle) หน่วย **องศา** (ช่วง 0–180)

---

## 2. ข้อต่อที่คำนวณ — `ANGLE_DEFS` (`main.py:53`)

มี 8 มุม ทั้งซ้าย–ขวา แต่ละมุมกำหนดด้วย triple ของ landmark MediaPipe
ในรูปแบบ (ปลายข้างหนึ่ง, **จุดยอด/vertex**, ปลายอีกข้าง):

| มุม | Triple (a, **vertex b**, c) |
|---|---|
| `elbow_L/R` (ข้อศอก) | shoulder – **elbow** – wrist |
| `shoulder_L/R` (ไหล่) | elbow – **shoulder** – hip |
| `hip_L/R` (สะโพก) | shoulder – **hip** – knee |
| `knee_L/R` (เข่า) | hip – **knee** – ankle |

---

## 3. การคำนวณต่อเฟรม — `joint_angles(xyz)` (`main.py:65`)

```python
def joint_angles(xyz):
    return np.stack([angle(xyz[:, a], xyz[:, b], xyz[:, c])
                     for a, b, c in ANGLE_DEFS.values()], -1).astype(np.float32)
```

รัน `angle()` ครบทั้ง 8 นิยาม ในทุกเฟรม แล้ว stack เป็น array ขนาด `(frames, 8)`

รายละเอียดสำคัญเกี่ยวกับ input:

- **พิกัดถูก normalize ก่อน** (`normalize_pose`, `main.py:41`): landmark ทุกจุดถูกเลื่อน
  ให้อ้างอิงจุดกึ่งกลางสะโพก (mid-hip) แล้วหารด้วยความยาวลำตัว (ระยะไหล่–สะโพก)
  ทำให้ค่าไม่ขึ้นกับขนาดตัวและตำแหน่ง (scale / position invariant)
- คณิตศาสตร์ dot-product / norm เป็นแบบ 3 มิติเต็ม (ใช้ x, y, z) ดังนั้นจึงเป็น
  **มุมข้อต่อ 3 มิติจริง** ไม่ใช่แค่การฉายบนระนาบภาพ

---

## 4. การนำไปใช้ต่อ — `build_rep()` (`main.py:78`)

ในแต่ละ repetition ชุดค่ามุม (angle series) จะถูกนำไปใช้ต่อดังนี้:

- **ความเร็วเชิงมุม (angular velocity)**: `vel = np.diff(ang) * fps` (`main.py:85`)
- **สถิติสรุป (summary stats)** ต่อข้อต่อ: min, max, **range-of-motion (max−min)**, mean, std
  (`main.py:88`) — ค่า ROM นี้คือค่าที่ถูกส่งออกเป็น `"rom"` ภายหลังที่ (`main.py:265`)
- พิกัดดิบ + มุม + ความเร็ว ถูก concatenate เป็น feature vector ป้อนเข้าโมเดล `QualityNet`

---

## อ้างอิงตำแหน่งโค้ด

| ฟังก์ชัน | ไฟล์ / บรรทัด |
|---|---|
| `angle()` | `backend/main.py:48` |
| `ANGLE_DEFS` | `backend/main.py:53` |
| `joint_angles()` | `backend/main.py:65` |
| `normalize_pose()` | `backend/main.py:41` |
| `build_rep()` | `backend/main.py:78` |
