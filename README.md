# RehabAI — Web App

โปรแกรมฟื้นฟูผู้ป่วยพาร์กินสันระยะ 1–2 (LSVT BIG + LSVT LOUD) สร้างด้วย **React + Vite + Tailwind CSS**
ตาม `RehabAI_Build_Spec.md` และ mockup `rehabai_web_mockup_full.html`

## รันโปรเจกต์

```bash
npm install
npm run dev      # เปิด http://localhost:5173
npm run build    # production build → dist/
```

> ต้องมี Node.js ติดตั้งไว้ (ทดสอบบน Node 26). ติดตั้งได้ด้วย `brew install node`

## สถานะปัจจุบัน (UI-first + mock data)

- **ครบทุกหน้า** ทั้งฝั่งผู้ป่วยและ Therapist Portal ตาม spec §3–§4
- **Design system** map ตรงกับ token/สีใน mockup (Tailwind config)
- กล้อง/ไมค์ **ใช้ WebRTC จริง** ในหน้าฝึก (pose skeleton + VU meter เป็นการจำลอง)
- Firebase Auth / Firestore / SMS gateway ถูก **stub ไว้ใน `src/lib/services.js`**
  (เก็บ session ใน localStorage) — สลับเป็น Firebase จริงได้โดยไม่ต้องแก้ component

### เข้าใช้งานโหมดสาธิต
- ผู้ป่วย: ไปที่ `/login` กรอกอีเมล/รหัสผ่านอะไรก็ได้ → เข้าสู่ระบบ
- นักกายภาพบำบัด: `/therapist/login`

## โครงสร้าง

```
src/
  App.jsx                 # routing (patient + /therapist/*)
  context/AuthContext.jsx # auth state
  lib/
    services.js           # stubbed Firebase/SMS (swap-in point)
    mockData.js           # exercises, patients, history ฯลฯ
    useCamera.js          # webcam + mic (Web Audio) hooks
  components/              # design-system + layouts + SOS + charts
  pages/patient/           # 15 หน้าฝั่งผู้ป่วย
  pages/therapist/         # 5 หน้า Therapist Portal
```

## ยังไม่ทำ (ตาม spec §7 backlog / ต้องมี backend จริง)
- Firebase จริง, Cloud Functions ส่ง SMS (cron + STOP opt-out)
- MediaPipe Pose จริง + calibration กล้อง/noise floor ไมค์
- Pre/Post-test ทางคลินิก (UPDRS ฯลฯ)
