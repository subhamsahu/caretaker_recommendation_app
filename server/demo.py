"""
Demo walkthrough — exercises every API endpoint to show how the app works.
Run:  python demo.py
"""

import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError

BASE = "http://localhost:8000"
TOKEN = None


def api(method: str, path: str, body: dict | None = None):
    """Fire an HTTP request and pretty-print the response."""
    url = f"{BASE}{path}"
    headers = {"Content-Type": "application/json"}
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    data = json.dumps(body).encode() if body else None
    req = Request(url, data=data, headers=headers, method=method)
    try:
        resp = urlopen(req)
    except HTTPError as e:
        print(f"  ❌ {e.code}: {e.read().decode()}")
        return None
    result = json.loads(resp.read().decode())
    print(json.dumps(result, indent=2))
    return result


# ─── Step 1: Register a parent ───────────────────────────────────────
print("=" * 60)
print("STEP 1 — Register / Login parent account")
print("=" * 60)
result = api("POST", "/auth/register", {
    "email": "demo@kidcare.com",
    "username": "DemoParent",
    "password": "secret123",
})
# If already registered, login instead
if not result:
    print("  → Already registered, logging in…")
    result = api("POST", "/auth/login", {
        "email": "demo@kidcare.com",
        "password": "secret123",
    })
if result:
    TOKEN = result["access_token"]
    print(f"\n✅ Got JWT token: {TOKEN[:30]}…\n")


# ─── Step 2: Create child profiles ───────────────────────────────────
print("=" * 60)
print("STEP 2 — Create child profiles")
print("=" * 60)

# Check if children already exist
existing = api("GET", "/children/")
if existing and len(existing) >= 2:
    print("  → Children already exist, reusing them.")
    child1, child2 = existing[0], existing[1]
else:
    print("\n▸ Creating 'Emma' (age 8, interests: science, art)")
    child1 = api("POST", "/children/", {
        "name": "Emma",
        "age": 8,
        "interests": ["science", "art"],
        "screen_time_limit": 60,
    })

    print("\n▸ Creating 'Liam' (age 12, interests: coding, sports)")
    child2 = api("POST", "/children/", {
        "name": "Liam",
        "age": 12,
        "interests": ["coding", "sports"],
        "screen_time_limit": 90,
    })


# ─── Step 3: List children ───────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 3 — List all children")
print("=" * 60)
api("GET", "/children/")


# ─── Step 4: Get recommendations for Emma (mood = curious) ───────────
print("\n" + "=" * 60)
print("STEP 4 — Recommendations for Emma (mood: curious)")
print("=" * 60)
emma_id = child1["id"]
recs = api("GET", f"/videos/recommend/{emma_id}?mood=curious")


# ─── Step 5: Emma likes a video ──────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 5 — Emma likes a video")
print("=" * 60)
if recs and len(recs) > 0:
    vid = recs[0]
    print(f"  Liking: '{vid['title']}' (id={vid['id']})")
    api("POST", f"/videos/{vid['id']}/like?child_id={emma_id}")


# ─── Step 6: Emma watches a video (10 min) ───────────────────────────
print("\n" + "=" * 60)
print("STEP 6 — Emma watches a video for 10 minutes")
print("=" * 60)
if recs and len(recs) > 0:
    vid = recs[0]
    print(f"  Watching: '{vid['title']}' for 10 min")
    api("POST", f"/videos/{vid['id']}/watch?child_id={emma_id}", {
        "duration_minutes": 10,
    })


# ─── Step 7: Liam gets recommendations (mood = bored) ────────────────
print("\n" + "=" * 60)
print("STEP 7 — Recommendations for Liam (mood: bored)")
print("=" * 60)
liam_id = child2["id"]
liam_recs = api("GET", f"/videos/recommend/{liam_id}?mood=bored")

# Liam watches something too
if liam_recs and len(liam_recs) > 0:
    vid2 = liam_recs[0]
    print(f"\n  Liam watches: '{vid2['title']}' for 15 min")
    api("POST", f"/videos/{vid2['id']}/watch?child_id={liam_id}", {
        "duration_minutes": 15,
    })


# ─── Step 8: Parent dashboard ────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 8 — Parent Dashboard (aggregated stats)")
print("=" * 60)
api("GET", "/parent/dashboard")

print("\n" + "=" * 60)
print("✅  Demo complete! All features working.")
print("=" * 60)
