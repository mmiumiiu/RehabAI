# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All frontend commands run from `fontend/`:

```bash
cd fontend
npm install        # first-time setup
npm run dev        # dev server → http://localhost:5173 (auto-opens browser)
npm run build      # production build → fontend/dist/
npm run preview    # preview the production build
```

No test suite exists yet. There is no linter configured.

Backend (`backend/`) is a standalone Python script (`test.py`) — not a server. Run it directly with Python after installing `mediapipe`, `torch`, `cv2`, `numpy`.

## Architecture

### Frontend (React + Vite + Tailwind)

**Two separate user portals** share a single React app:

- **Patient portal** — routes under `/`, `/training/*`, `/settings/*`, `/dashboard`, `/chat`, `/emergency-alert`
- **Therapist portal** — all routes under `/therapist/*`

Both portals are guarded by `RequireAuth` in `App.jsx` which checks `user.role` from `AuthContext`.

**Service layer stub** (`src/lib/services.js`): All Firebase Auth, Firestore, and SMS calls are stubbed. The layer is async and localStorage-backed so it behaves identically to real Firebase. When wiring real Firebase, replace only this file — components don't need to change.

- `auth` — sign in / register / sign out / update user (persists to `localStorage`)
- `sms` — logs to console instead of hitting Twilio/Thai SMS
- `therapistLink` — stores patient→therapist association in localStorage

**Mock data** (`src/lib/mockData.js`): Stands in for Firestore documents. Contains domain constants (`BIG_EXERCISES`, `LOUD_EXERCISES`, `PARKINSON_STAGES`, patients, session history). New exercises or patients are added here.

**Design system** (`src/components/ui.jsx`): All primitive UI components (`Button`, `Input`, `Field`, `Card`, `Badge`, etc.) plus `Logo`. Class names map to the custom tokens in `tailwind.config.js`. Always use these primitives rather than raw Tailwind classes for consistency.

**Camera/mic hooks** (`src/lib/useCamera.js`):
- `useCamera(enabled)` — requests webcam, returns `{ videoRef, status }`. Status: `idle | requesting | live | denied | error`.
- `useMicLevel(enabled)` — requests mic, returns `{ db, status }` where `db` is a mapped 40–90 dB scale (uncalibrated).

**Live session pages** (`SessionBig`, `SessionLoud`, `SessionWeightShift`) — full-screen, rendered outside `PatientLayout` (no sidebar). They overlay a simulated pose skeleton (`PoseSkeleton.jsx`) on the live webcam feed. Real MediaPipe inference is the backlog item that replaces the simulation.

**SOS** — `SOSButton.jsx` is a floating button present during high-risk exercises. Triggers `EmergencyAlert` flow which calls `sms.send`.

### Backend (Python ML)

`backend/` contains a trained PyTorch model (`quality_net.pt`) and a live webcam test script (`test.py`). The model (`QualityNet`) classifies movement correctness per-repetition using 48-frame windows of 115 MediaPipe landmark features. `meta.json` describes the training dataset and exercise mapping. This is not yet integrated into the web app.

**Important constraint**: The feature engineering functions in `backend/test.py` are copied verbatim from a training notebook. Do not refactor or "improve" them — they must stay bit-for-bit identical to the notebook cell or model outputs will drift.

## Key conventions

- Route-level pages import from `src/components/ui.jsx` for all shared primitives.
- `useAuth()` hook (from `AuthContext`) is the only way to read or mutate auth state — never read localStorage directly in components.
- The `fontend/` directory name is intentionally misspelled (typo from initial commit) — do not rename it.

## Backlog (not yet implemented)

- Real Firebase Auth + Firestore replacing `src/lib/services.js` stubs
- Real MediaPipe Pose inference in session pages (replacing `PoseSkeleton` simulation)
- Microphone noise-floor calibration
- SMS gateway (Twilio or Thai provider) replacing `sms` stub
- Clinical pre/post-tests (UPDRS, 10MWT, etc.)
