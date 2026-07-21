# RehabAI

ระบบฟื้นฟูผู้ป่วยพาร์กินสันระยะ 1–2 (LSVT BIG + LSVT LOUD) พร้อม AI วิเคราะห์ท่าทางแบบเรียลไทม์

- **Frontend** — React + Vite + Tailwind CSS → deploy บน Vercel
- **Backend** — FastAPI + PyTorch (QualityNet) → deploy บน Railway
- **AI** — MediaPipe Pose (browser) + โมเดล QualityNet ประเมินความถูกต้องของท่าทางต่อ rep

---

## โครงสร้างโปรเจกต์

```
RehabAI/
├── fontend/          # React app (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── lib/
│   │   │   ├── services.js          # Firebase/SMS stub (swap-in point)
│   │   │   ├── mockData.js          # exercises, patients, history
│   │   │   ├── useCamera.js         # webcam + mic hooks
│   │   │   ├── usePoseLandmarker.js # MediaPipe JS pose detection
│   │   │   └── useRepScorer.js      # rep detection + API scoring
│   │   ├── components/
│   │   │   ├── PoseCanvas.jsx       # real skeleton overlay
│   │   │   └── ...                  # design system + layouts
│   │   └── pages/
│   │       ├── patient/             # 15 patient pages
│   │       └── therapist/           # 5 therapist pages
│   ├── .env.example
│   └── package.json
└── backend/          # FastAPI scoring server
    ├── main.py
    ├── quality_net.pt
    ├── norm_stats.npz
    ├── meta.json
    ├── requirements.txt
    └── railway.toml
```

---

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.10+
- pip

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000
# → http://localhost:8000/health  (health check)
```

### 2. Frontend

```bash
cd fontend
npm install

# copy env and point at local backend
cp .env.example .env.local
# .env.local already defaults to http://localhost:8000 — no edit needed

npm run dev
# → http://localhost:5173
```

### Demo accounts (pre-filled on login/register pages)

| Portal | Email | Password |
|---|---|---|
| ผู้ป่วย | `patient@demo.com` | `demo1234` |
| นักกายภาพบำบัด | `therapist@demo.com` | `demo1234` |

---

## Deploy

### Backend → Railway

1. สร้าง project ใหม่บน [railway.app](https://railway.app)
2. เชื่อม GitHub repo หรืออัปโหลด `backend/` folder
3. Railway จะอ่าน `railway.toml` และรัน `uvicorn main:app --host 0.0.0.0 --port $PORT` อัตโนมัติ
4. คัดลอก **Public URL** ที่ได้ เช่น `https://rehabai-backend.up.railway.app`

> Railway ต้องการ RAM อย่างน้อย 1 GB สำหรับ PyTorch (ใช้ plan Hobby ขึ้นไป)

### Frontend → Vercel

1. Push โค้ดขึ้น GitHub
2. Import repo บน [vercel.com](https://vercel.com)
3. ตั้งค่า:
   - **Root Directory**: `fontend`
   - **Framework Preset**: Vite
4. เพิ่ม Environment Variable:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | URL ของ Railway backend เช่น `https://rehabai-backend.up.railway.app` |

5. กด **Deploy**

---

## AI Scoring Flow

```
Browser                                    Railway (FastAPI)
───────────────────────────────────────    ─────────────────────────────
MediaPipe JS โหลด pose model จาก CDN
↓
ตรวจจับ landmarks 33 จุด บนวิดีโอ (20 fps)
↓
usePoseLandmarker → landmarks[]
↓
useRepScorer ตรวจจับ rep (wrist height)
↓  เมื่อ rep เสร็จ
POST /score  ──────────────────────────→  build_rep() → QualityNet
{ landmarks, exercise, fps }              ← { conf, verdict, rom }
↓
แสดงผล: "ถูกต้อง 87%" หรือ "ต้องปรับ"
แสดง session summary เมื่อครบ target
```

**Exercise mapping** (BIG exercises → model):

| หน้า SessionBig | โมเดล |
|---|---|
| บนล่าง (Floor to Ceiling) | `overhead_reach` |
| ก้าวหน้า (Forward Step) | `forward_lunge` |
| ก้าวข้าง (Sideways Step) | `lateral_raise` |
| ก้าวหลัง (Backward Step) | `forward_lunge` |
| ก้าวเอื้อม | `overhead_reach` |
| เอื้อมหมุน | `lateral_raise` |
| ซ้ายขวา | ไม่รองรับ (ไม่มี training data) |

---

## API Reference

### `GET /health`

```json
{ "status": "ok", "exercises": ["lateral_raise", "overhead_reach", ...] }
```

### `POST /score`

**Request**
```json
{
  "landmarks": [[[x, y, z, visibility], ...33], ...n_frames],
  "exercise": "overhead_reach",
  "fps": 20.0
}
```

**Response**
```json
{
  "conf": 0.87,
  "verdict": "correct",
  "duration": 2.3,
  "rom": { "shoulder_L": 142.5, "elbow_L": 167.2, ... }
}
```

`verdict` values: `correct` · `needs_work` · `too_short` · `unsupported`

---

## Backlog

- Firebase Auth + Firestore แทน localStorage stub ใน `src/lib/services.js`
- SMS gateway (Twilio / Thai provider) แทน `sms` stub
- MediaPipe บน SessionLoud และ SessionWeightShift
- Noise-floor calibration สำหรับไมค์
- Pre/Post-tests ทางคลินิก (UPDRS, 10MWT)
