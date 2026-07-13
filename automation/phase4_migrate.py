#!/usr/bin/env python3
"""WER CRM Phase 4 migration: create the `reviews` tab (review detection's last-seen store + audit).
Idempotent: skips creation if the tab exists, writes the header only if row 1 is empty.
Env: WER_SHEET_ID (Home/credentials/wer.env), SA JSON path in GOOGLE_APPLICATION_CREDENTIALS
     (Home/credentials/hermes-integration-499005-e1a4d8632952.json).
"""
import os, sys, requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request

SHEET = os.environ["WER_SHEET_ID"]
HEADER = ["ts", "biz_id", "review_id", "author", "rating", "published", "text", "matched_contact", "kind"]

creds = service_account.Credentials.from_service_account_file(
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"],
    scopes=["https://www.googleapis.com/auth/spreadsheets"])
creds.refresh(Request())
H = {"Authorization": "Bearer " + creds.token}
BASE = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET}"

meta = requests.get(BASE, headers=H).json()
tabs = [s["properties"]["title"] for s in meta["sheets"]]
print("tabs before:", tabs)

if "reviews" not in tabs:
    r = requests.post(BASE + ":batchUpdate", headers=H,
                      json={"requests": [{"addSheet": {"properties": {"title": "reviews"}}}]})
    r.raise_for_status()
    print("created tab: reviews")
else:
    print("tab exists: reviews")

row1 = requests.get(BASE + "/values/reviews!A1:I1", headers=H).json().get("values", [])
if not row1:
    r = requests.put(BASE + "/values/reviews!A1?valueInputOption=RAW", headers=H,
                     json={"values": [HEADER]})
    r.raise_for_status()
    print("header written:", HEADER)
else:
    print("header already present:", row1[0])
    if row1[0] != HEADER:
        sys.exit("HEADER MISMATCH, fix by hand")

# verify
got = requests.get(BASE + "/values/reviews!A1:I1", headers=H).json()["values"][0]
assert got == HEADER, got
print("PASS: reviews tab ready, header verified")
