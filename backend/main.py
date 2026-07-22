from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np, torch, torch.nn as nn, torch.nn.functional as F
import json, pathlib, os, hmac, hashlib, base64, httpx

BASE = pathlib.Path(__file__).parent

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

# ── load model ───────────────────────────────────────────────────────────────
meta = json.loads((BASE / "meta.json").read_text())
stats = np.load(BASE / "norm_stats.npz")
MU, SD, TEMP = stats["mean"], stats["std"], meta["temperature"]
EX_MAP = {v: int(k) for k, v in meta["exercise_map"].items() if v}
net = QualityNet(meta["n_features"], meta["n_exercises"])
net.load_state_dict(torch.load(BASE / "quality_net.pt", map_location="cpu"))
net.eval()

# ── app ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="RehabAI Scoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

class ScoreRequest(BaseModel):
    landmarks: List[List[List[float]]]  # [n_frames][33][4: x,y,z,visibility]
    exercise: str
    fps: float = 20.0

LINE_TOKEN = os.getenv("LINE_CHANNEL_ACCESS_TOKEN", "")
LINE_SECRET = os.getenv("LINE_CHANNEL_SECRET", "")
LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push"

def _verify_line_signature(body: bytes, signature: str) -> bool:
    if not LINE_SECRET:
        return True  # skip verification in dev if secret not set
    mac = hmac.new(LINE_SECRET.encode(), body, hashlib.sha256).digest()
    return hmac.compare_digest(base64.b64encode(mac).decode(), signature)

@app.post("/line/webhook")
async def line_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("X-Line-Signature", "")
    if not _verify_line_signature(body, sig):
        raise HTTPException(status_code=400, detail="invalid signature")

    data = json.loads(body)
    for event in data.get("events", []):
        if event.get("type") == "message" and event.get("source", {}).get("type") == "user":
            user_id = event["source"]["userId"]
            # TODO: persist userId → patient account mapping in Firestore
            print(f"[Line] new user linked: {user_id}")
            # Send welcome message
            if LINE_TOKEN:
                async with httpx.AsyncClient() as client:
                    await client.post(
                        LINE_PUSH_URL,
                        headers={"Authorization": f"Bearer {LINE_TOKEN}"},
                        json={"to": user_id, "messages": [{"type": "text", "text": "เชื่อมต่อ RehabAI สำเร็จแล้ว! คุณจะได้รับการแจ้งเตือนการฝึกทาง Line นี้"}]},
                    )
    return {"status": "ok"}

@app.post("/line/send")
async def line_send(payload: dict):
    """Push a message to a patient's Line account. Called by scheduled jobs."""
    user_id = payload.get("userId")
    text = payload.get("text")
    if not user_id or not text:
        raise HTTPException(status_code=422, detail="userId and text required")
    if not LINE_TOKEN:
        print(f"[Line stub→{user_id}] {text}")
        return {"ok": True, "stub": True}
    async with httpx.AsyncClient() as client:
        res = await client.post(
            LINE_PUSH_URL,
            headers={"Authorization": f"Bearer {LINE_TOKEN}"},
            json={"to": user_id, "messages": [{"type": "text", "text": text}]},
        )
    return {"ok": res.status_code == 200}

@app.get("/health")
def health():
    return {"status": "ok", "exercises": list(EX_MAP.keys())}

@app.post("/score")
def score(req: ScoreRequest):
    if req.exercise not in EX_MAP:
        return {"conf": 0.0, "verdict": "unsupported", "duration": 0.0, "rom": {}}

    seq_raw = np.asarray(req.landmarks, dtype=np.float32)
    rep = build_rep(seq_raw, fps=req.fps)
    if rep is None:
        return {"conf": 0.0, "verdict": "too_short", "duration": 0.0, "rom": {}}

    x = torch.from_numpy(((rep["seq"] - MU) / SD).astype(np.float32))[None]
    e = torch.tensor([EX_MAP[req.exercise]])
    with torch.no_grad():
        p = F.softmax(net(x, e) / TEMP, 1).numpy()[0]

    conf = float(p[1])
    return {
        "conf": conf,
        "verdict": "correct" if conf >= 0.5 else "needs_work",
        "duration": rep["duration"],
        "rom": {n: float(rep["summ"][i * 5 + 2]) for i, n in enumerate(ANGLE_NAMES)},
    }
