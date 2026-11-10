#!/usr/bin/env python
"""Evaluate QualityNet on a labelled validation set: Precision, Recall, F1.

The repo ships only the trained weights (quality_net.pt) — no validation data —
so you must supply a labelled set. This script reuses the SAME feature pipeline
and model as the live API (imported from main.py) so scores match production.

── Expected data file (.npz) ────────────────────────────────────────────────
Provide ONE of the two input layouts:

  A) Pre-built feature sequences (what the model consumes directly):
       seq       float32  [N, 48, 115]   # build_rep()["seq"], BEFORE (x-MU)/SD
       exercise  [N]                      # exercise id (int) OR name (str)
       label     int      [N]             # ground truth: 1 = correct, 0 = wrong

  B) Raw per-rep landmark sequences (needs feature extraction) — pass --raw:
       reps      object   [N] of float32 [frames, 33, 4]  # x,y,z,visibility
       exercise  [N]
       label     int      [N]
       fps       float                    # optional, default 20.0

Key names are configurable via --seq-key/--label-key/--exercise-key.

── Usage ─────────────────────────────────────────────────────────────────────
  cd backend
  .venv/bin/python eval_metrics.py val.npz                 # layout A
  .venv/bin/python eval_metrics.py val.npz --raw           # layout B
  .venv/bin/python eval_metrics.py val.npz --threshold 0.5

Positive class = "correct" (label 1). Threshold is on the model's P(correct).
"""
import argparse
import sys
import numpy as np
import torch
import torch.nn.functional as F

# Reuse the exact production pipeline: model, norm stats, temperature, exercise
# map and the feature builder. Importing main is heavy (loads the net) but keeps
# scoring bit-for-bit identical to /score.
from main import net, MU, SD, TEMP, EX_MAP, build_rep


def _resolve_exercise(ex):
    """Accept an exercise given as an int id or a name string; return the id."""
    if isinstance(ex, (bytes, np.bytes_)):
        ex = ex.decode()
    if isinstance(ex, str):
        if ex not in EX_MAP:
            raise SystemExit(f"unknown exercise '{ex}'. known: {sorted(EX_MAP)}")
        return EX_MAP[ex]
    return int(ex)


def _prf(tp, fp, fn):
    """Precision, recall, F1 for one class from its counts."""
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0
    return precision, recall, f1


def _report(y_true, y_pred, title):
    y_true = np.asarray(y_true).astype(int)
    y_pred = np.asarray(y_pred).astype(int)
    n = len(y_true)
    # Per-class counts (class 1 = correct is the positive class).
    tp = int(((y_pred == 1) & (y_true == 1)).sum())
    fp = int(((y_pred == 1) & (y_true == 0)).sum())
    fn = int(((y_pred == 0) & (y_true == 1)).sum())
    tn = int(((y_pred == 0) & (y_true == 0)).sum())

    p1, r1, f1_1 = _prf(tp, fp, fn)          # positive class (correct)
    p0, r0, f1_0 = _prf(tn, fn, fp)          # negative class (wrong)
    accuracy = (tp + tn) / n if n else 0.0
    macro_f1 = (f1_1 + f1_0) / 2
    # Support-weighted (like sklearn 'weighted' avg).
    sup1, sup0 = tp + fn, tn + fp
    w_p = (p1 * sup1 + p0 * sup0) / n if n else 0.0
    w_r = (r1 * sup1 + r0 * sup0) / n if n else 0.0
    w_f1 = (f1_1 * sup1 + f1_0 * sup0) / n if n else 0.0

    print(f"\n=== {title}  (N={n}) ===")
    print(f"{'class':<14}{'precision':>10}{'recall':>10}{'f1':>10}{'support':>10}")
    print(f"{'wrong (0)':<14}{p0:>10.3f}{r0:>10.3f}{f1_0:>10.3f}{sup0:>10}")
    print(f"{'correct (1)':<14}{p1:>10.3f}{r1:>10.3f}{f1_1:>10.3f}{sup1:>10}")
    print(f"{'-'*54}")
    print(f"{'accuracy':<14}{'':>10}{'':>10}{accuracy:>10.3f}{n:>10}")
    print(f"{'macro avg':<14}{(p0+p1)/2:>10.3f}{(r0+r1)/2:>10.3f}{macro_f1:>10.3f}{n:>10}")
    print(f"{'weighted avg':<14}{w_p:>10.3f}{w_r:>10.3f}{w_f1:>10.3f}{n:>10}")
    print(f"\nconfusion matrix (rows=true, cols=pred):")
    print(f"          pred_0  pred_1")
    print(f"  true_0  {tn:>6}  {fp:>6}")
    print(f"  true_1  {fn:>6}  {tp:>6}")


def main():
    ap = argparse.ArgumentParser(description="Precision/Recall/F1 for QualityNet on a validation set")
    ap.add_argument("data", help="path to the .npz validation file")
    ap.add_argument("--raw", action="store_true", help="data holds raw landmark reps; extract features with build_rep")
    ap.add_argument("--seq-key", default="seq")
    ap.add_argument("--reps-key", default="reps")
    ap.add_argument("--label-key", default="label")
    ap.add_argument("--exercise-key", default="exercise")
    ap.add_argument("--threshold", type=float, default=0.5, help="decision threshold on P(correct)")
    ap.add_argument("--per-exercise", action="store_true", help="also break metrics down per exercise")
    args = ap.parse_args()

    try:
        data = np.load(args.data, allow_pickle=True)
    except Exception as e:
        raise SystemExit(f"could not load '{args.data}': {e}")

    labels = np.asarray(data[args.label_key]).astype(int)
    exercises_raw = data[args.exercise_key]
    ex_ids = np.array([_resolve_exercise(e) for e in exercises_raw], dtype=np.int64)

    # Build the [N, 48, 115] feature tensor.
    if args.raw:
        seqs = []
        keep = []
        for i, rep in enumerate(data[args.reps_key]):
            r = build_rep(np.asarray(rep, dtype=np.float32),
                          fps=float(data["fps"]) if "fps" in data else 20.0)
            if r is None:      # too short / all-NaN — drop it and its label
                continue
            seqs.append(r["seq"]); keep.append(i)
        if not seqs:
            raise SystemExit("no valid reps after feature extraction")
        seq = np.stack(seqs).astype(np.float32)
        labels = labels[keep]; ex_ids = ex_ids[keep]
    else:
        seq = np.asarray(data[args.seq_key], dtype=np.float32)

    if seq.ndim != 3 or seq.shape[1:] != (48, 115):
        raise SystemExit(f"expected seq shape [N,48,115], got {seq.shape}")
    if not (len(seq) == len(labels) == len(ex_ids)):
        raise SystemExit(f"length mismatch: seq={len(seq)} label={len(labels)} exercise={len(ex_ids)}")

    # Normalise and run the model in one batch.
    x = torch.from_numpy(((seq - MU) / SD).astype(np.float32))
    e = torch.from_numpy(ex_ids)
    with torch.no_grad():
        conf = F.softmax(net(x, e) / TEMP, 1).numpy()[:, 1]   # P(correct)
    preds = (conf >= args.threshold).astype(int)

    _report(labels, preds, f"Overall (threshold={args.threshold})")

    if args.per_exercise:
        id2name = {v: k for k, v in EX_MAP.items()}
        for eid in sorted(set(ex_ids.tolist())):
            m = ex_ids == eid
            _report(labels[m], preds[m], f"Exercise: {id2name.get(eid, eid)}")


if __name__ == "__main__":
    main()
