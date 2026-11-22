# RehabAI — Codebase Handoff Guide

**Audience:** a developer joining the project who needs to work independently.
This document explains what the project is, how it's structured, how to run it, the
conventions to follow, and how to do the common tasks — for **both the frontend and the
backend**. Read the "Mental model" section first; everything else is reference.

---

## 0. Mental model (read this first)

RehabAI is a rehab web app for **Parkinson's patients at Hoehn & Yahr stage 1–2** (mild;
still independent). It delivers two clinical programs at home:

- **LSVT BIG** — large-amplitude *movement* exercises, guided by **webcam pose estimation**.
- **LSVT LOUD** — vocal *loudness* exercises, guided by a **microphone loudness meter**.

There are **two user types**, each with its own area of the app:
- **Patient** — does the exercises, tracks progress, chats with their therapist.
- **Therapist (นักกายภาพบำบัด)** — a read-only portal to monitor their patients and set
  per-patient LOUD loudness targets.

The repo has **two independent halves that are not yet connected**:

| Half | Folder | Stack | What it is |
|---|---|---|---|
| **Frontend** | `fontend/` | React + Vite + Tailwind | The entire web UI. Runs today on **mock data** (no real backend). |
| **Backend** | `backend/` | Python + PyTorch + MediaPipe | A trained **movement-quality AI model** + a **webcam test script**. Standalone research code. |

> ⚠️ **Folder is spelled `fontend`** (missing "r"). That's the real path on disk — not a typo
> in this doc. All frontend commands run from `fontend/`.

The **integration that doesn't exist yet**: the backend model scores whether an exercise rep
was done correctly; the frontend's live BIG session is where that score is *supposed* to be
shown. Today the frontend fakes pose feedback locally and the backend runs on its own. Wiring
them together is the main open task (see §7).

---

## 1. Repository layout

```
physio-ai/
├── README.md              # short Thai readme (frontend-focused)
├── backend/               # Python AI model + webcam test harness  (see §6)
│   ├── test.py
│   ├── meta.json
│   ├── norm_stats.npz
│   ├── quality_net.pt
│   └── pose_landmarker_full.task
└── fontend/               # React web app  (see §2–§5)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── public/
    │   ├── RehabAI_Build_Spec.md         # THE functional spec (source of truth)
    │   ├── rehabai_web_mockup_full.html  # THE visual mockup
    │   └── CODEBASE.md                    # this file
    └── src/                               # all React source
```

---

## 2. Frontend — getting started

### Prerequisites
- **Node.js** (project was tested on a recent Node; anything ≥ 18 is fine). `brew install node`.

### Install & run
```bash
cd fontend
npm install
npm run dev      # Vite dev server → http://localhost:5173 (opens automatically)
npm run build    # production build → fontend/dist/
npm run preview  # serve the built dist/ locally
```

### Demo login (no real auth yet)
- Patient: go to `/login`, enter **any** email + **any** password → you're in.
- Therapist: `/therapist/login`, same — any credentials work.
- Session is stored in `localStorage` under `rehabai_session`. To "log out" manually, clear it.

### Tech stack
| Concern | Choice | Notes |
|---|---|---|
| UI framework | React 18 | function components + hooks only, no class components |
| Routing | react-router-dom v6 | all routes in `src/App.jsx` |
| Build | Vite 5 | `vite.config.js`, dev port 5173 |
| Styling | Tailwind CSS 3 | tokens in `tailwind.config.js`, helper classes in `index.css` |
| State | React Context + local `useState` | only global state is auth (`AuthContext`) |
| Data | mock layer | `src/lib/services.js` (localStorage) + `src/lib/mockData.js` |
| Icons | inline SVGs | `src/components/icons.jsx` (no icon library) |

There is **no TypeScript**, no Redux, no data-fetching library. Keep it simple.

---

## 3. Frontend — architecture & conventions

### 3.1 App entry & providers
`src/main.jsx` mounts:
```
<BrowserRouter> → <AuthProvider> → <App/>
```
So every component can use routing and `useAuth()`.

### 3.2 Routing (`src/App.jsx`)
All routes live in one file. Structure:
- **Public routes**: `/login`, `/register`, `/onboarding/*`, therapist `/login` + `/register`.
- **Guarded routes**: wrapped in `<RequireAuth role="patient|therapist">`. If not logged in →
  redirect to the right login; if wrong role → redirect.
- **Layout routes**: patient app pages render inside `<PatientLayout/>` (sidebar+topbar);
  therapist pages inside `<TherapistLayout/>`. **Live session pages render full-screen**
  (outside the sidebar layout) but are still auth-guarded.
- **Catch-all `*`**: redirects to `/home`, `/therapist/patients`, or `/login` based on auth.

Full route list:

| Route | Page component | Notes |
|---|---|---|
| `/login` | `patient/Login` | split-screen auth |
| `/register` | `patient/Register` | → onboarding on success |
| `/onboarding/select-therapist` | `patient/OnboardingSelectTherapist` | tap-select; `?change=1` reuses it from Profile |
| `/onboarding/emergency-contact` | `patient/OnboardingEmergency` | skippable |
| `/home` | `patient/Home` | streak + program cards |
| `/training/big` | `patient/TrainingBig` | 8-exercise list (head-to-toe order) |
| `/training/loud` | `patient/TrainingLoud` | 2-step list |
| `/training/big/session` | `patient/SessionBig` | live cam, `?exercise=:id` |
| `/training/big/session-weightshift` | `patient/SessionWeightShift` | live cam + floor markers |
| `/training/loud/session` | `patient/SessionLoud` | live mic + VU meter |
| `/dashboard` | `patient/Dashboard` | metrics + 7-day chart + history |
| `/profile` | `patient/Profile` | hub: personal info, therapist link, settings links, danger zone |
| `/chat` | `patient/Chat` | chat w/ linked therapist |
| `/settings/notifications` | `patient/NotificationSettings` | SMS reminders |
| `/settings/emergency` | `patient/EmergencySettings` | emergency contacts + 1669 |
| `/emergency-alert` | `patient/EmergencyAlert` | SOS / fall countdown |
| `/therapist/login` | `therapist/TherapistLogin` | |
| `/therapist/register` | `therapist/TherapistRegister` | cascading hospital + email-domain check |
| `/therapist/patients` | `therapist/Patients` | patient list (auto-populated) |
| `/therapist/patients/:id` | `therapist/PatientDetail` | read-only metrics + LOUD dB targets + notes |
| `/therapist/messages` | `therapist/Messages` | all conversations |

### 3.3 Auth (`src/context/AuthContext.jsx` + `src/lib/services.js`)
- `useAuth()` returns `{ user, signIn, register, signOut, updateUser }`.
- `user` shape: `{ uid, email, role: 'patient'|'therapist', name, parkinsonStage, createdAt, verificationStatus? }`.
- The context just wraps `auth` in `services.js`, which persists to `localStorage`
  (`rehabai_session`). **Swap this file for real Firebase Auth later — components don't change.**

### 3.4 The service layer (`src/lib/services.js`) — the Firebase swap-in point
Everything that will eventually be Firebase/Cloud Functions is stubbed here so the UI behaves
realistically. Contract to preserve when you wire real backends:

- **`auth`** — `current()`, `signIn({email,password,role})`, `register({...})`, `signOut()`, `update(patch)`.
  All async, all persisted to localStorage. `signIn` accepts any credentials (demo).
- **`sms`** — `send({to, body})`; currently just `console.info`. Real version → Twilio / Thai SMS gateway via Cloud Function.
- **`therapistLink`** — `get()`, `set(link)`, `clear()`. Persists the patient↔therapist link to
  localStorage key `rehabai_therapist_link`. A link is `{ name, pos, hospital, region, status:'approved', linkedAt }`.
  There is **no connection code and no "pending" state** — selecting a verified therapist links instantly (see §3.6).

### 3.5 Mock data (`src/lib/mockData.js`)
Single source of demo/domain data. Key exports:
- `PARKINSON_STAGES` — the only two allowed stages (stage1, stage2).
- `BIG_EXERCISES` — the 8 LSVT BIG exercises **in fixed head-to-toe order** (id 1→8). Each has
  `group` (`stretch|balance|strength`), `how`, `target`, `status`, `accuracy`, and `weightShift` on #8.
- `LOUD_STEPS` — the 2 LSVT LOUD steps (loudness drill, everyday speech).
- `RELATIONSHIPS` — emergency-contact relationship options.
- `WEEK_FREQUENCY`, `HISTORY` — chart + table demo data.
- `emergencyContactsSeed`, `PATIENTS`, `CHAT_SEED` — seed lists.
- **Therapist directory**: `REGIONS`, `REGION_HOSPITALS` (all 6 Thai regions, ~90 hospitals),
  `HOSPITAL_DOMAINS` (corporate email domains for the register soft-check),
  `HOSPITAL_THERAPISTS` + `therapistsForHospital(hospital)` (verified therapists per hospital).

### 3.6 Two important domain rules (don't break these)
1. **Tap-select, auto-link therapist model.** Patients pick region → hospital → therapist from
   dropdowns (no typing) and are linked **immediately**. The assumption: the patient already met
   this therapist in person, so no approval step is needed. Only therapists with
   `verificationStatus: 'active'` and hospitals with `status: 'approved'` are shown. Implemented
   by `TherapistPicker.jsx` + `therapistLink`.
2. **Therapist view is read-only.** On `/therapist/patients/:id` the therapist can view metrics,
   write private notes, and set the patient's **LOUD dB targets** — but must **never** be able to
   add/remove/edit the patient's exercise program.

### 3.7 Design system
- **Tokens** are in `tailwind.config.js` (mirrors the spec §1 / the mockup CSS variables):

  | Token | Hex | Use |
  |---|---|---|
  | `bg` | #FAF8F4 | app background |
  | `surface` | #FFFFFF | cards/panels |
  | `teal.900/800/700/500/100` | … | LSVT BIG / primary actions / headings / sidebar |
  | `coral.700/100` | #B9542A / #FBE7D9 | LSVT LOUD / balance |
  | `ink.primary/secondary/muted` | text colors |
  | `line` | #E6E0D4 | borders |
  | `cam` | #152622 | camera/mic panel background |
  | `danger` | #D9483E | SOS / delete |
  | `warn.{bg,fg}` / `ok.{bg,fg}` | status yellow / green |

  Fonts: `font-heading` = Poppins, `font-body` = Inter (Sarabun fallback for Thai),
  `font-mono` = JetBrains Mono. Radii: `rounded-card` (14px), `rounded-btn` (9px).

- **Reusable primitives** in `src/components/ui.jsx`: `Logo, Field, Input, Select, Button,
  Badge, ProgressBar, Toggle, Card, SectionTitle, Avatar`. Prefer these over raw markup.
- **Helper CSS classes** in `src/index.css`: `.card, .input-wrap, .btn-primary, .field-label,
  .field-error, .toggle-track, .thin-scroll, .rec-pulse`.
- **Icons**: `src/components/icons.jsx` — inline stroke SVGs (`currentColor`). Add new icons here
  following the existing `Icon` wrapper pattern.

### 3.8 Shared layout/session components
- `AuthLayout.jsx` — split-screen shell for login/register (`therapist` prop swaps the copy).
- `PatientLayout.jsx` — patient sidebar (หน้าแรก · ฝึกกายภาพบำบัด · สรุปผล · แชท · โปรไฟล์) + topbar
  with time-based greeting. Secondary settings (SMS, emergency contacts) live inside Profile.
- `TherapistLayout.jsx` — therapist sidebar shell.
- `TherapistPicker.jsx` — the cascading region→hospital→therapist selector (used by onboarding and Profile's "change therapist").
- `LoudTargetSettings.jsx` — per-patient LOUD min/goal/max dB editor with a live preview bar (therapist).
- `SOSButton.jsx` — red SOS pill floating on cam/mic panels → `/emergency-alert`.
- `SessionInfoCard.jsx` — the right-hand stats column shared by all live sessions.
- `PoseSkeleton.jsx` — **decorative** animated stick-figure drawn over the camera (placeholder for real MediaPipe overlay).
- `MetricRow.jsx`, `FrequencyChart.jsx` — dashboard metric cards + 7-day BIG-vs-LOUD bar chart.

### 3.9 How live sessions work today (important — it's simulated)
Look at `src/pages/patient/SessionBig.jsx` as the reference:
- `useCamera()` / `useMicLevel()` in `src/lib/useCamera.js` request **real** webcam/mic via WebRTC.
  The camera stream is bound to a `<video>`; the mic hook computes an **uncalibrated** dB-ish level
  from Web Audio RMS.
- **Rep detection and accuracy are FAKED**: a `setInterval` loop advances a fake movement `phase`,
  flips a "good form" flag in the mid-range, nudges an accuracy number, and counts a rep each cycle.
  `PoseSkeleton` just animates from that `phase`.
- This is exactly where the **backend model** should plug in (replace the simulated loop with real
  pose landmarks → features → model confidence). See §7.
- `SessionWeightShift.jsx` adds floor-marker overlays; `SessionLoud.jsx` uses the mic VU meter.
- `EmergencyAlert.jsx` implements the spec's strict order: (1) fire SMS to contact #1 immediately on
  mount, (2) countdown (7s normal / 4s high-risk via `?reason=fall`), (3) cancel / call-now / auto-call 1669.

---

## 4. Frontend — common tasks (how-to)

**Add a new page**
1. Create `src/pages/patient/Foo.jsx` (or `therapist/`).
2. Import + add a `<Route path="/foo" element={<Foo/>}/>` in `src/App.jsx` (inside the right layout
   group and `RequireAuth` if it needs auth).
3. If it needs a sidebar entry, add it to the `NAV` array in `PatientLayout.jsx` / `TherapistLayout.jsx`.

**Add/adjust an exercise** — edit `BIG_EXERCISES` (keep the head-to-toe order) or `LOUD_STEPS` in
`mockData.js`. The list pages, session pages, and accuracy charts all read from these.

**Change design tokens** — edit `tailwind.config.js`; restart isn't needed (HMR). Don't hardcode
hex values in components — use the token classes.

**Wire real Firebase** — replace the internals of `src/lib/services.js` (`auth`, `sms`,
`therapistLink`) keeping the same function signatures. `AuthContext` and every page keep working.

**Gotchas**
- Folder is `fontend/`, not `frontend/`.
- Any-credentials login is intentional demo behavior — don't treat it as a bug.
- Session pages request camera/mic permission; browsers require **https or localhost**.
- Thai copy is the product language; keep new strings in Thai to match.

---

## 5. Frontend — where the spec lives
`fontend/public/RehabAI_Build_Spec.md` is the **functional source of truth** (every page, field,
flow, Firestore data model, and the SMS/emergency rules). `rehabai_web_mockup_full.html` is the
**visual** reference (design tokens + real Thai copy for every screen). When in doubt about intended
behavior or wording, check these two before asking.

---

## 6. Backend (`backend/`)

A standalone **PyTorch** model that judges whether one exercise **rep** was performed correctly
(binary: correct / needs-work), plus a **live webcam test harness** (`test.py`).

### 6.1 Files
| File | What |
|---|---|
| `test.py` | Live test: webcam → MediaPipe pose → features → model → on-screen verdict |
| `meta.json` | Model card: feature count, seq length, exercise map, metrics, limitations |
| `norm_stats.npz` | Feature normalization `mean` / `std` |
| `quality_net.pt` | Trained `QualityNet` weights |
| `pose_landmarker_full.task` | MediaPipe BlazePose model (~9 MB, downloaded) |
| `v6_results.png` | Training/eval results figure |

### 6.2 Dependencies & running
```bash
cd backend                     # paths in test.py are relative — run from here
/usr/bin/python3 test.py
```
Requires: `opencv-python`, `mediapipe`, `torch`, `numpy`.
If `pose_landmarker_full.task` is ever missing, re-download it:
```bash
curl -L -o pose_landmarker_full.task \
  https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task
```
Controls in the window: **SPACE** = start/stop recording a rep (on stop it scores it and prints
`conf`, `duration`, top-3 ROM); **q** = quit. Choose the exercise via the `EXERCISE` variable
(`squat | lateral_raise | overhead_reach | forward_lunge | knee_lift`).

### 6.3 Model — `QualityNet` (defined verbatim in `test.py`)
- **Inputs:** one rep resampled to **48 frames × 115 features**, plus an **exercise-id embedding**
  (so one model handles all exercises).
- **Architecture:** 3× dilated **1-D CNN** stem (Conv1d + BatchNorm + ReLU + Dropout) →
  temporal **mean + max** pooling → concat the exercise embedding → small MLP head → 2-way softmax.
- **Output per rep:** `conf` = P(correct), `duration` (s), and per-joint **range-of-motion**.
- **Calibration:** temperature scaling (`temperature` in `meta.json`, ≈1.72) is applied to the logits.

### 6.4 Feature pipeline (115 features/frame) — `build_rep()` in `test.py`
> Copied verbatim from the training notebook (Cell 5). **Do not "improve" it** or the model input
> distribution breaks.
1. **Normalized 3-D landmarks** — 33 BlazePose landmarks × (x,y,z), hip-centered and scaled by
   torso length (translation/scale invariant).
2. **8 joint angles** — elbow L/R, shoulder L/R, hip L/R, knee L/R.
3. **Angular velocities** — per-frame diff of the 8 angles × fps.
Also handles NaN filtering and resampling to a fixed 48-frame sequence. Then features are normalized
with `norm_stats.npz` before the model.

### 6.5 Model card (`meta.json`) — know the caveats
- **v6**, task = binary movement correctness.
- **Dataset:** REHAB24-6 (Cernek et al., SISAP 2024, CC-BY-NC 4.0) — 1008 reps, 9 subjects.
- **Feature extractor:** MediaPipe Pose / BlazePose, 33 landmarks.
- **Performance (LOSO cross-val):** accuracy ≈ **0.66** ± 0.07, F1 ≈ 0.64, AUC ≈ 0.73; ECE ≈ 0.043
  (beats logreg 0.56 / GBM 0.59 baselines).
- **Exercises covered:** `lateral_raise, overhead_reach, knee_lift, forward_lunge, squat`.
- **Limitations (must communicate to clinicians):**
  - Trained on **10 healthy adults 25–50 — NO Parkinson's patients**.
  - Errors were **scripted by a physiotherapist**, not spontaneous patient errors.
  - Lab lighting/framing; subjects in motion-capture suits.
  - Only **4 of 8** RehabAI exercises have training data; bicep curl / arm extension / sit-to-stand
    fall back to a **rule-based scorer**.
  - Knee lift is approximated by leg abduction (different movement plane).

---

## 7. Integration plan (the main open task)
The frontend BIG session (§3.9) currently fakes pose feedback. The backend produces a real per-rep
`conf`/ROM. To connect them, options:
- **In-browser:** run MediaPipe Pose (JS/WASM) in the session page, port the feature pipeline (§6.4)
  to JS, and run the model client-side (e.g. ONNX/TF.js) — matches the spec's "client-side" intent.
- **Service:** wrap `test.py`'s scoring in a small Python API and stream landmarks/reps to it.
Either way: replace the simulated `setInterval` loop in `SessionBig.jsx` with real landmark capture →
feature extraction → model confidence → drive the accuracy/rep UI from that. Mind the model's
limitations (§6.5): it wasn't trained on patients and only covers 4 exercises.

---

## 8. Glossary
- **LSVT BIG / LSVT LOUD** — evidence-based Parkinson's therapy protocols (big movements / loud voice).
- **Hoehn & Yahr stage 1–2** — mild Parkinson's; patient is still independent (the only supported group).
- **Rep** — one repetition of an exercise; the unit the backend model scores.
- **ROM** — range of motion (max−min joint angle over a rep).
- **1669** — Thailand's national emergency medical number (hardcoded in the emergency flow).
- **BlazePose** — MediaPipe's 33-landmark pose model used for feature extraction.
- **LOSO** — leave-one-subject-out cross-validation (how the model was evaluated).
```
