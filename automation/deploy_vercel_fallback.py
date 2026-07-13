#!/usr/bin/env python3
"""Deploy /tmp/wer to the Vercel project `wellearnedreviews` (production).
Pattern per HANDOFF: file-hash upload (POST /v2/files) + POST /v13/deployments. No CLI.
Env: VERCEL_TOKEN. Team: chris-terry-hermes-projects.
"""
import os, sys, hashlib, requests

TOKEN = os.environ["VERCEL_TOKEN"]
TEAM = "team_zqYDA6v9hqYOoObOfsVSPTbe"
PROJECT = "wellearnedreviews"
ROOT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/wer"
H = {"Authorization": "Bearer " + TOKEN}

files = []
for dirpath, dirs, names in os.walk(ROOT):
    for n in names:
        p = os.path.join(dirpath, n)
        rel = os.path.relpath(p, ROOT)
        if rel.startswith(".") or "__MACOSX" in rel or n == ".DS_Store":
            continue
        data = open(p, "rb").read()
        files.append((rel, hashlib.sha1(data).hexdigest(), len(data), data))

print(f"{len(files)} files")
for rel, sha, size, data in files:
    r = requests.post("https://api.vercel.com/v2/files", params={"teamId": TEAM},
                      headers={**H, "x-vercel-digest": sha, "Content-Type": "application/octet-stream"},
                      data=data)
    if r.status_code not in (200, 201):
        sys.exit(f"upload failed {rel}: {r.status_code} {r.text[:200]}")

r = requests.post("https://api.vercel.com/v13/deployments", params={"teamId": TEAM, "skipAutoDetectionConfirmation": "1"},
                  headers=H,
                  json={"name": PROJECT, "project": PROJECT, "target": "production",
                        "files": [{"file": rel, "sha": sha, "size": size} for rel, sha, size, _ in files]})
d = r.json()
if r.status_code not in (200, 201):
    sys.exit(f"deploy failed: {r.status_code} {str(d)[:400]}")
dpl = d.get("id")
print("deployment:", dpl, d.get("readyState"))

import time
for _ in range(60):
    time.sleep(5)
    s = requests.get(f"https://api.vercel.com/v13/deployments/{dpl}", params={"teamId": TEAM}, headers=H).json()
    state = s.get("readyState")
    if state in ("READY", "ERROR", "CANCELED"):
        print("final:", state, s.get("url"))
        sys.exit(0 if state == "READY" else 1)
print("timed out waiting for READY")
sys.exit(1)
