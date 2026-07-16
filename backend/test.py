# live_test.py — real-time RehabAI quality check from webcam
# Feature functions are COPIED VERBATIM from notebook Cell 5. Do not "improve" them.
import cv2, json, time, numpy as np, torch, torch.nn as nn, torch.nn.functional as F
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

# ── model definition: copied verbatim from Cell 8 ───────────────────────────
class QualityNet(nn.Module):
    def __init__(self, n_feat, n_ex, d=64, n_emb=8):
        super().__init__()
        self.emb = nn.Embedding(n_ex, n_emb)
        self.stem = nn.Sequential(
            nn.Conv1d(n_feat, d, 5, padding=2), nn.BatchNorm1d(d), nn.ReLU(), nn.Dropout(0.2),
            nn.Conv1d(d, d, 3, padding=2, dilation=2), nn.BatchNorm1d(d), nn.ReLU(), nn.Dropout(0.2),
            nn.Conv1d(d, d, 3, padding=4, dilation=4), nn.BatchNorm1d(d), nn.ReLU(),
        )
        self.head = nn.Sequential(
            nn.Linear(2*d + n_emb, 64), nn.ReLU(), nn.Dropout(0.3), nn.Linear(64, 2))
    def forward(self, x, e):
        x = self.stem(x.permute(0, 2, 1))
        x = torch.cat([x.mean(-1), x.max(-1).values], -1)
        return self.head(torch.cat([x, self.emb(e)], -1))

# ── feature engineering: copied verbatim from Cell 5 ────────────────────────
class L:
    LEFT_SHOULDER, RIGHT_SHOULDER = 11, 12
    LEFT_ELBOW, RIGHT_ELBOW = 13, 14
    LEFT_WRIST, RIGHT_WRIST = 15, 16
    LEFT_HIP, RIGHT_HIP = 23, 24
    LEFT_KNEE, RIGHT_KNEE = 25, 26
    LEFT_ANKLE, RIGHT_ANKLE = 27, 28

def normalize_pose(seq):
    xyz = seq[..., :3].copy()
    mid_hip = (xyz[:, L.LEFT_HIP] + xyz[:, L.RIGHT_HIP]) / 2
    mid_sho = (xyz[:, L.LEFT_SHOULDER] + xyz[:, L.RIGHT_SHOULDER]) / 2
    torso = np.clip(np.linalg.norm(mid_sho - mid_hip, axis=-1, keepdims=True), 1e-3, None)
    return (xyz - mid_hip[:, None, :]) / torso[:, None, :]

def angle(a, b, c):
    ba, bc = a - b, c - b
    cos = np.sum(ba*bc, -1) / (np.linalg.norm(ba, axis=-1)*np.linalg.norm(bc, axis=-1) + 1e-8)
    return np.degrees(np.arccos(np.clip(cos, -1, 1)))

ANGLE_DEFS = {
    "elbow_L": (L.LEFT_SHOULDER, L.LEFT_ELBOW, L.LEFT_WRIST),
    "elbow_R": (L.RIGHT_SHOULDER, L.RIGHT_ELBOW, L.RIGHT_WRIST),
    "shoulder_L": (L.LEFT_ELBOW, L.LEFT_SHOULDER, L.LEFT_HIP),
    "shoulder_R": (L.RIGHT_ELBOW, L.RIGHT_SHOULDER, L.RIGHT_HIP),
    "hip_L": (L.LEFT_SHOULDER, L.LEFT_HIP, L.LEFT_KNEE),
    "hip_R": (L.RIGHT_SHOULDER, L.RIGHT_HIP, L.RIGHT_KNEE),
    "knee_L": (L.LEFT_HIP, L.LEFT_KNEE, L.LEFT_ANKLE),
    "knee_R": (L.RIGHT_HIP, L.RIGHT_KNEE, L.RIGHT_ANKLE),
}
ANGLE_NAMES = list(ANGLE_DEFS)

def joint_angles(xyz):
    return np.stack([angle(xyz[:, a], xyz[:, b], xyz[:, c])
                     for a, b, c in ANGLE_DEFS.values()], -1).astype(np.float32)

SEQ_LEN = 48
def resample(a, T=SEQ_LEN):
    n = len(a)
    if n < 2: return np.repeat(a[:1], T, 0)
    idx = np.linspace(0, n-1, T)
    lo, hi = np.floor(idx).astype(int), np.ceil(idx).astype(int)
    w = (idx - lo)[:, None]
    return (a[lo]*(1-w) + a[hi]*w).astype(np.float32)

def build_rep(seq_raw, fps=30.0):
    ok = ~np.isnan(seq_raw[..., :3]).any((1, 2))
    if ok.sum() < 5: return None
    seq_raw = seq_raw[ok]
    xyz = normalize_pose(seq_raw)
    ang = joint_angles(xyz)
    duration = len(seq_raw) / fps
    vel = np.diff(ang, axis=0, prepend=ang[:1]) * fps
    seq_feat = np.concatenate([xyz.reshape(len(xyz), -1), ang, vel], -1)
    summ = []
    for i in range(len(ANGLE_NAMES)):
        a = ang[:, i]; summ += [a.min(), a.max(), a.max()-a.min(), a.mean(), a.std()]
    for i in range(len(ANGLE_NAMES)):
        v = np.abs(vel[:, i]); summ += [v.mean(), v.max()]
    summ += [duration, float(np.nanmean(seq_raw[..., 3]))]
    return {"seq": resample(seq_feat), "summ": np.asarray(summ, np.float32), "duration": duration}

# ── load model ──────────────────────────────────────────────────────────────
meta = json.load(open("meta.json"))
stats = np.load("norm_stats.npz")
MU, SD, T = stats["mean"], stats["std"], meta["temperature"]
EX_MAP = {v: int(k) for k, v in meta["exercise_map"].items() if v}   # name -> id
net = QualityNet(meta["n_features"], meta["n_exercises"])
net.load_state_dict(torch.load("quality_net.pt", map_location="cpu"))
net.eval()

# ── PICK THE EXERCISE YOU WILL PERFORM ──────────────────────────────────────
EXERCISE = "squat"          # squat | lateral_raise | overhead_reach | forward_lunge | knee_lift
EX_ID = EX_MAP[EXERCISE]
print(f"Testing exercise: {EXERCISE} (id {EX_ID})")
print(f"Model expects {meta['n_features']} features, {SEQ_LEN} frames/rep")

def score(buffer):
    r = build_rep(np.asarray(buffer, np.float32))
    if r is None: return None
    x = torch.from_numpy(((r["seq"] - MU) / SD).astype(np.float32))[None]
    e = torch.tensor([EX_ID])
    with torch.no_grad():
        p = F.softmax(net(x, e) / T, 1).numpy()[0]
    return {"conf": float(p[1]), "duration": r["duration"],
            "rom": {n: float(r["summ"][i*5+2]) for i, n in enumerate(ANGLE_NAMES)}}

# ── MediaPipe live loop ─────────────────────────────────────────────────────
# Download the model file once:
#   wget https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task
lm = vision.PoseLandmarker.create_from_options(vision.PoseLandmarkerOptions(
    base_options=mp_python.BaseOptions(model_asset_path="pose_landmarker_full.task"),
    running_mode=vision.RunningMode.VIDEO, num_poses=1,
    min_pose_detection_confidence=0.5, min_tracking_confidence=0.5))

cap = cv2.VideoCapture(0)
buffer, recording, t0, last = [], False, time.time(), None
print("\n[SPACE] start/stop a rep   [q] quit\n")

while True:
    ok, frame = cap.read()
    if not ok: break
    frame = cv2.flip(frame, 1)
    ts = int((time.time() - t0) * 1000)
    res = lm.detect_for_video(
        mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)), ts)

    detected = bool(res.pose_landmarks)
    if detected:
        p = res.pose_landmarks[0]
        for k in p:
            cv2.circle(frame, (int(k.x*frame.shape[1]), int(k.y*frame.shape[0])), 3, (0,255,0), -1)
        if recording:
            buffer.append([[k.x, k.y, k.z, k.visibility] for k in p])

    # HUD
    cv2.putText(frame, f"{EXERCISE}  {'REC '+str(len(buffer)) if recording else 'idle'}",
                (10,30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,0,255) if recording else (200,200,200), 2)
    if not detected:
        cv2.putText(frame, "NO PERSON", (10,70), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,0,255), 2)
    if last:
        col = (0,180,0) if last["conf"] >= 0.5 else (0,0,220)
        verdict = "CORRECT" if last["conf"] >= 0.5 else "NEEDS WORK"
        cv2.putText(frame, f"{verdict}  {last['conf']:.0%}", (10, frame.shape[0]-50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.0, col, 2)
        cv2.putText(frame, f"dur {last['duration']:.1f}s", (10, frame.shape[0]-20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, col, 1)

    cv2.imshow("RehabAI live", frame)
    key = cv2.waitKey(1) & 0xFF
    if key == ord(' '):
        if not recording:
            buffer, recording = [], True
        else:
            recording = False
            last = score(buffer)
            if last:
                print(f"\n{verdict if last else ''} conf={last['conf']:.2f} dur={last['duration']:.1f}s")
                big = sorted(last["rom"].items(), key=lambda kv: -kv[1])[:3]
                print("  largest ROM:", {k: round(v,0) for k,v in big})
            else:
                print("Rep too short / no person — try again")
    elif key == ord('q'):
        break

cap.release(); cv2.destroyAllWindows()