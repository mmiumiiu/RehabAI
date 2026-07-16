# RehabAI — คำสั่งแก้ไข Codebase ให้เป็นเวอร์ชันล่าสุด

> เอกสารนี้เทียบระหว่างไฟล์ที่อัปโหลดมา (สถานะปัจจุบันของ codebase) กับเวอร์ชันล่าสุดที่ควรจะเป็น สรุปเป็นคำสั่งแก้ไขทีละจุด ให้ Claude Code หรือ dev นำไปแก้ codebase จริงได้ทันที ไม่ต้องเดา

**ไฟล์ที่อ้างอิง:** `rehabai_web_mockup_full.html` (โครงสร้าง/CSS/markup ต้นแบบ), `RehabAI_Build_Spec.md` (ไม่มีการเปลี่ยนแปลงในรอบนี้ ใช้เวอร์ชันเดิมได้)

มีการแก้ไขทั้งหมด **3 จุด** ในไฟล์ `rehabai_web_mockup_full.html` (หรือ component ที่สอดคล้องกันใน codebase จริง)

---

## แก้ไขที่ 1 — CSS: จัดกึ่งกลางเนื้อหาทุกหน้า (`.app-content`)

**ปัญหา:** พื้นที่เนื้อหาหลักในทุกหน้าแอป (Home, รายการท่าฝึก, Dashboard, โปรไฟล์, Therapist Portal ฯลฯ) ไม่มี `max-width` หรือการจัดกึ่งกลาง ทำให้บนจอกว้างเนื้อหาชิดซ้าย ไม่สมส่วนกับพื้นที่ว่างด้านขวา

**หา CSS rule นี้:**
```css
.app-content{ padding:28px 32px; }
```

**แก้เป็น:**
```css
.app-content{ padding:28px 32px; max-width:960px; margin:0 auto; }
```

**Component/ไฟล์ที่ต้องแก้ (ถ้าเป็น React/Vue):** เป็น global style ของ layout wrapper ที่ครอบเนื้อหาในทุกหน้าที่มี sidebar (ทั้งฝั่งผู้ป่วยและฝั่งนักกายภาพบำบัด) ควรอยู่ใน shared layout component เดียว ไม่ใช่ style เฉพาะหน้า

---

## แก้ไขที่ 2 — CSS: เพิ่ม class สำหรับแถวท่าฝึกกลุ่ม "ท่านั่ง" (สีเข้มกว่า)

**เพิ่ม CSS rules ใหม่ทั้งหมดนี้** (ยังไม่มีในไฟล์เดิม) — วางต่อจาก `.step-num{...}`:

```css
.ex-row.locked{ background:#EAE6D9; border-color:#D8D0BC; cursor:not-allowed; }
.ex-row.locked .step-num{ background:#D8D0BC; border-color:#C7BDA3; color:#6B6350; }
.ex-row.locked h4{ color:#6B6350; }
.ex-row.locked p{ color:#8C8368; }
.ex-row.locked .ex-meta{ color:#8C8368; }
.locked-badge{ font-size:11px; font-weight:600; padding:3px 10px; border-radius:6px; background:#D8D0BC; color:#5B5340; display:inline-flex; align-items:center; gap:4px; white-space:nowrap; }
```

**หมายเหตุ:** `.locked-badge` ถูกสร้างไว้แต่ **ไม่ได้ใช้งานจริงในเวอร์ชันล่าสุด** (ทดลองใส่ไอคอนล็อก/ข้อความ "ต้องใช้เก้าอี้" แล้วถูกขอให้เอาออก) — เก็บ CSS rule นี้ไว้เผื่อใช้ในอนาคตได้ แต่ปัจจุบันแถว "ท่านั่ง" ใช้แค่ class `.locked` เพื่อเปลี่ยนสีเท่านั้น ไม่มี badge หรือไอคอนใดๆ เพิ่มเติม

**สำคัญ:** `.ex-row.locked` เปลี่ยนแค่ **สี** ปุ่ม "เริ่มฝึก" และ badge สถานะ ("ยังไม่เริ่ม") ยังคงแสดงและกดได้ปกติทุกอย่าง — ไม่ใช่การ disable ฟังก์ชันการทำงานจริง เป็นแค่การจัดกลุ่มด้วยสีให้เห็นว่าท่านี้เป็นท่านั่ง (ต้องมีเก้าอี้)

---

## แก้ไขที่ 3 — เปลี่ยนชุดท่าฝึก LSVT BIG ทั้งหมด (8 ท่าเดิม → 7 ท่ามาตรฐานสากล)

นี่คือการแก้ไขที่ใหญ่ที่สุด — **แทนที่ท่าฝึกทั้ง 8 ท่าเดิมด้วยชุดท่ามาตรฐาน LSVT BIG จริง (7 Maximal Daily Exercises)** เพราะ 8 ท่าเดิมเป็นท่าที่ออกแบบเองแบบประยุกต์ ไม่ใช่ท่ามาตรฐานของโปรโตคอลจริง

### 3.1 แก้ topbar
**เดิม:**
```html
<p class="greet-label">ฝึกกายภาพบำบัด · เรียงจากศีรษะไปเท้า</p>
<p class="greet-name">LSVT BIG — ฝึกการเคลื่อนไหว</p>
...
<span class="progress-pill">2/8 ท่าเสร็จแล้ว</span>
```
**ใหม่:**
```html
<p class="greet-label">ฝึกกายภาพบำบัด · ท่ามาตรฐาน LSVT BIG (7 Maximal Daily Exercises)</p>
<p class="greet-name">LSVT BIG — ฝึกการเคลื่อนไหว</p>
...
<span class="progress-pill">0/5 ท่าเสร็จแล้ว</span>
```
(นับ progress เฉพาะ 5 ท่ายืนที่ใช้งานได้ปกติ ไม่นับรวม 2 ท่านั่ง)

### 3.2 ลบท่าเดิมทั้ง 8 ท่าออกทั้งหมด
ลบ `<div class="ex-row">...</div>` ทั้ง 8 รายการ (หมุนไหล่ออก, Overhead Reach, Lateral Raise, ยกแขน-ขา, Marching+Cross Touch, Sit-to-Stand, เขย่งเท้า, ก้าวถ่ายน้ำหนัก)

### 3.3 ใส่ท่าชุดใหม่แทน — แบ่งเป็น 2 กลุ่มพร้อมหัวข้อคั่น

**กลุ่ม "ท่านั่ง"** (ใช้ class `.ex-row.locked` ตามแก้ไขที่ 2):

```html
<p class="section-title">ท่านั่ง</p>
<div class="ex-row locked">
  <div class="step-num">1</div>
  <div class="ex-info"><h4>ท่าที่ 1 — บนล่าง (Floor to Ceiling)</h4><p>นั่งริมขอบเก้าอี้ ผลักแขนไปข้างหน้า→ลงพื้น→ขึ้นเหนือศีรษะ→กางแขนค้างไว้ 10 วินาที แล้วกลับสู่ท่าเริ่มต้น</p></div>
  <span class="ex-meta">8 ครั้ง</span>
  <span class="badge todo">ยังไม่เริ่ม</span>
  <button class="mini-btn" style="margin-left:12px;">เริ่มฝึก</button>
</div>
<div class="ex-row locked">
  <div class="step-num">2</div>
  <div class="ex-info"><h4>ท่าที่ 2 — ซ้ายขวา (Sitting Side to Side)</h4><p>นั่งริมขอบเก้าอี้ หมุนลำตัวและแขนไปด้านตรงข้ามให้สุด ค้างไว้ 10 วินาที ทำสลับซ้าย-ขวา</p></div>
  <span class="ex-meta">8 ครั้ง/ข้าง</span>
  <span class="badge todo">ยังไม่เริ่ม</span>
  <button class="mini-btn" style="margin-left:12px;">เริ่มฝึก</button>
</div>
```

**กลุ่ม "ท่ายืน"** (แถวปกติ ไม่มี `.locked`):

```html
<p class="section-title" style="margin-top:24px;">ท่ายืน</p>

<div class="ex-row">
  <div class="step-num">3</div>
  <div class="ex-info"><h4>ท่าที่ 3 — ก้าวหน้า (Forward Step)</h4><p>ยืนตรง เท้าวางเสมอระดับไหล่ ก้าวขาไปด้านหน้าพร้อมกางแขนสองข้างออกให้สุด แล้วกลับสู่ท่าเริ่มต้น</p></div>
  <span class="ex-meta">8 ครั้ง/ข้าง</span>
  <span class="badge todo">ยังไม่เริ่ม</span>
  <button class="mini-btn" style="margin-left:12px;">เริ่มฝึก</button>
</div>

<div class="ex-row">
  <div class="step-num">4</div>
  <div class="ex-info"><h4>ท่าที่ 4 — ก้าวข้าง (Sideways Step)</h4><p>ยืนตรง ก้าวขาไปด้านข้างพร้อมกางแขนสองข้างไปทางด้านหลังให้สุด แล้วกลับสู่ท่าเริ่มต้น</p></div>
  <span class="ex-meta">8 ครั้ง/ข้าง</span>
  <span class="badge todo">ยังไม่เริ่ม</span>
  <button class="mini-btn" style="margin-left:12px;">เริ่มฝึก</button>
</div>

<div class="ex-row">
  <div class="step-num">5</div>
  <div class="ex-info"><h4>ท่าที่ 5 — ก้าวหลัง (Backward Step) <span class="tag-group balance">เสี่ยงสูง</span></h4><p>ยืนตรง มือยกขึ้นกระดกข้อมือ ก้าวขาไปด้านหลัง ก้มลำตัว ผลักแขนสองข้างไปด้านหลังให้สุด — ท่าที่เสี่ยงหกล้มมากที่สุดในชุดนี้ กดปุ่ม SOS ได้ตลอดเวลาระหว่างฝึก</p></div>
  <span class="ex-meta">8 ครั้ง/ข้าง</span>
  <span class="badge todo">ยังไม่เริ่ม</span>
  <button class="mini-btn" style="margin-left:12px;">เริ่มฝึก</button>
</div>

<div class="ex-row">
  <div class="step-num">6</div>
  <div class="ex-info"><h4>ท่าที่ 6 — ก้าวเอื้อม (Forward Rock and Reach)</h4><p>ยืนตรง ก้าวขาไปด้านหน้า เอื้อมแขนหน้า-หลังสลับกันโยกตัวไปมา</p></div>
  <span class="ex-meta">8 ครั้ง/ข้าง</span>
  <span class="badge todo">ยังไม่เริ่ม</span>
  <button class="mini-btn" style="margin-left:12px;">เริ่มฝึก</button>
</div>

<div class="ex-row">
  <div class="step-num">7</div>
  <div class="ex-info"><h4>ท่าที่ 7 — เอื้อมหมุน (Sideways Rock &amp; Reach)</h4><p>ยืนตรง กางขาสองข้าง กางแขนและหมุนลำตัวไปด้านข้างให้สุด แล้วกลับสู่ท่าเริ่มต้น</p></div>
  <span class="ex-meta">8 ครั้ง/ข้าง</span>
  <span class="badge todo">ยังไม่เริ่ม</span>
  <button class="mini-btn" style="margin-left:12px;">เริ่มฝึก</button>
</div>
```

### 3.4 ผลกระทบต่อ logic/ระบบ backend (ไม่ใช่แค่ UI)

ถ้า codebase มีข้อมูลท่าฝึกเก็บใน database/config (เช่น `exercise_configs` collection ตาม Build Spec เดิม) ต้องอัปเดต**ข้อมูลจริง**ไม่ใช่แค่หน้าจอด้วย:

- **ลบท่าเดิม 8 รายการ** ออกจาก exercise config/database (หมุนไหล่ออก, Overhead Reach, Lateral Raise, ยกแขน-ขา, Marching+Cross Touch, Sit-to-Stand, เขย่งเท้า, ก้าวถ่ายน้ำหนัก)
- **เพิ่ม field ใหม่ `posture`** ("นั่ง" | "ยืน") ในโครงสร้างข้อมูลท่าฝึก
- **ท่าที่ 1-2 ต้องการ pose estimation logic แบบ state machine** เพราะมีหลายจังหวะย่อยต่อ 1 ท่า (เช่น ท่าที่ 1 มี Out→Down→Up→Hold 4 จังหวะ) ต่างจาก logic เดิมที่วัดแค่มุมเดียว — ต้องออกแบบใหม่ ไม่ใช่ reuse ของเดิม
- **ท่าที่ 2-7 ต้อง track ทั้งสองข้าง** (ซ้าย+ขวา) แยกกัน ในขณะที่ของเดิมบางท่า track แค่ข้างเดียวหรือไม่ต้องแยกข้าง
- รายละเอียดวิธีทำแต่ละท่าฉบับเต็ม (รวมท่าเริ่มต้น ลำดับการเคลื่อนไหว) อยู่ในไฟล์ `LSVT_BIG_Exercise_Update.md` ที่ให้ไว้ก่อนหน้านี้ — ใช้เป็นแหล่งอ้างอิงหลักสำหรับ implement pose detection logic ของแต่ละท่า

---

## แก้ไขที่ 4 — CSS เล็กน้อย: จัดกึ่งกลางการ์ดในหน้ารายชื่อผู้ป่วย (ฝั่งนักกายภาพบำบัด)

**หา:**
```html
<div class="settings-card" style="max-width:520px;background:#F5F9F0;border-color:#D6E8C6;">
```

**แก้เป็น:**
```html
<div class="settings-card" style="max-width:520px;margin:0 auto 20px;background:#F5F9F0;border-color:#D6E8C6;">
```

(การ์ดนี้คือข้อความแจ้งว่า "ผู้ป่วยที่เลือกคุณเป็นนักกายภาพบำบัดจะปรากฏในรายชื่อนี้อัตโนมัติ" ในหน้า `/patients` — เดิมมี `max-width` แต่ไม่ได้จัดกึ่งกลาง)

---

## สรุปลำดับการแก้ไขที่แนะนำ

1. แก้ CSS `.app-content` (แก้ไขที่ 1) — ผลกระทบกว้างที่สุด ทำก่อน
2. เพิ่ม CSS class `.ex-row.locked` (แก้ไขที่ 2)
3. แก้ CSS การ์ดหน้ารายชื่อผู้ป่วย (แก้ไขที่ 4) — เล็กน้อย ทำพร้อมข้อ 2 ได้
4. แทนที่ชุดท่าฝึก LSVT BIG ทั้งหมด (แก้ไขที่ 3) — ใหญ่สุด ทำเป็นลำดับสุดท้าย เพราะกระทบทั้ง UI และ data model/backend logic
