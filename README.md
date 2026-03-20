# Chaos or Release? — v2
### The DevOps Survival Game · FlowPay Edition

A real-time multiplayer DevOps decision game for up to 55 teams. Teams race to make correct Deploy/Delay decisions across 4 escalating levels while sabotaging rivals with special power cards.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Real-time | Socket.io |
| Database | Firebase Realtime Database |
| Locking | Redis (ioredis) |
| Hosting | Railway |

---

## Project Structure

```
cor-v2-2/
├── server.js                  # Main server — state machine, scoring, socket handlers
├── scenarios.js               # Server-side scenarios WITH answers (never expose to client)
├── package.json
├── .env                       # Local env vars (never commit)
└── public/                    # Static files served to browser
    ├── index.html             # Single-page app
    ├── client.js              # Frontend logic
    ├── style.css              # Styles
    ├── scenarios.js           # Client-side scenarios WITHOUT answers (anti-cheat)
    └── images/
        ├── l2-1-firewall.svg
        ├── l2-2-memoryleak.svg
        ├── l2-3-protocol.svg
        ├── l2-4-loadbalancer.svg
        ├── l2-5-deadlock.svg
        └── l2-6-waf.svg
```

> ⚠️ There are **two** `scenarios.js` files. The root one (used by `server.js`) contains `answer:` fields. The one in `public/` does not — this is intentional to prevent teams from inspecting the correct answers in the browser.

---

## Environment Variables

Set these in Railway → your service → **Variables**:

| Variable | Description | Example |
|---|---|---|
| `FIREBASE_PROJECT_ID` | Firebase project ID | `chaos-or-release-abc123` |
| `FIREBASE_CLIENT_EMAIL` | Service account email | `firebase-adminsdk-xxx@project.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Service account private key | `-----BEGIN PRIVATE KEY-----\nMII...` |
| `FIREBASE_DATABASE_URL` | Realtime Database URL | `https://project-default-rtdb.firebaseio.com` |
| `REDIS_URL` | Redis connection string | `redis://default:pass@host:6379` |
| `ADMIN_PASSWORD` | Admin panel password | `admin123` |
| `PROJECTOR_PASSWORD` | Projector view password | `projector123` |

> **Note on `FIREBASE_PRIVATE_KEY`**: Paste as a single line with literal `\n` characters. Do not wrap in quotes.

---

## Running Locally

```bash
npm install
cp .env.example .env   # fill in your credentials
npm run dev            # uses nodemon
```

---

## Game Flow (Per Round)

```
LOBBY → BRIEFING (60s) → BREACH (45-180s) → SABOTAGE PULSE (last 15s) → AFTERMATH (20s) → RECON (15s) → LOBBY
```

| Phase | Duration | What happens |
|---|---|---|
| **LOBBY** | — | Admin selects level/scenario, teams wait |
| **BRIEFING** | 60s | Scenario pushed to all dashboards. Read-only. |
| **BREACH** | L1: 45s · L2: 60s · L3: 90s · L4: 180s | Teams submit Deploy/Delay + level-specific answers |
| **SABOTAGE PULSE** | Last 15s of BREACH | Freeze and Double Risk cards unlock |
| **AFTERMATH** | 20s | Answer revealed, scores calculated, Rollback window opens (7s) |
| **RECON** | 15s | Leaderboard updates, admin advances to next round |

---

## Scoring Matrix

| Event | Points |
|---|---|
| Correct decision | **+6 pts** |
| Correct decision (with Double Risk on you) | **+10 pts** |
| Wrong decision | **−5 pts** |
| Wrong decision (with Double Risk on you) | **−8 pts** |
| No submission (timer expired) | **−6 pts** (−5 wrong + −1 late) |
| Late submission (correct) | **+5 pts** (+6 − 1 late) |
| Each correct Level 3 clue | **+2 pts** |
| Rollback (after wrong Deploy) | Changes penalty to **−2 pts** |
| Unused card at end of Level 4 | **−2 pts each** |

---

## Special Cards (One-time use per team)

| Card | When | Effect |
|---|---|---|
| ❄ **Freeze** | Sabotage Pulse | Target team is locked out of the **next** round entirely |
| ⚡ **Double Risk** | Sabotage Pulse | If target answers wrong → −8 pts. If correct → +10 pts |
| ⏪ **Rollback** | 7s after wrong Deploy is revealed | Reduces penalty to −2 pts |

> **Hoarding Penalty**: Any card not used by the end of Level 4 Round 6 costs −2 pts automatically.

---

## The 4 Levels

### Level 1 — The Deployment Trenches (14 rounds)
Standard text scenarios. One-click Deploy or Delay. Analysis window: 45s.

### Level 2 — The Architect's Anatomy (6 rounds)
Visual system diagrams. Teams must answer a 4-option bottleneck ID quiz correctly before Deploy/Delay unlocks. Analysis window: 60s.

### Level 3 — Digital Forensic Trail (8 rounds)
3 sequential clues per mission (+2 pts each). All clues must be answered to unlock the final decision. Analysis window: 90s.

### Level 4 — The BlackBox Protocol (6 rounds)
Caesar Cipher decryption (Shift 3 backward). Teams decode an encrypted message to determine Deploy or Delay. Analysis window: 180s.

---

## Admin Panel

Access: click **⚙ Admin** on the login screen → enter admin password.

| Control | Function |
|---|---|
| **START ROUND** | Kicks off BRIEFING → BREACH → SABOTAGE → AFTERMATH flow |
| **REVEAL NOW** | Manually triggers scoring at any point during an active round |
| **NEXT ROUND** | Advances to the next scenario (available during AFTERMATH/RECON) |
| **FORCE READY** | Emergency reset to LOBBY without advancing the scenario |
| **+ Team** | Add/remove teams and set passwords |
| **↺ Reset** | Full game reset — clears all scores and returns to Level 1 Round 1 |
| Click any team | Opens score override modal |
| Unfreeze button | Manually unfreeze a team for hardware issues |

---

## Projector View

Access: click **📡 Projector** on the login screen or from Admin panel.

Shows:
- Current scenario and phase
- Live decision grid (all teams — green when submitted, ❄ if frozen, ⚡ if targeted)
- Central countdown timer (turns red + pulses in final 10s)
- Real-time leaderboard

---

## Default Teams (after reset)

| Team | Password |
|---|---|
| Team Alpha | `alpha` |
| Team Beta | `beta` |
| Team Gamma | `gamma` |
| Team Delta | `delta` |

Add custom teams via Admin → **+ Team**.

---

## Deployment (Railway)

1. Push changes to your GitHub repo
2. Railway auto-deploys on push (takes ~60s)
3. Check **Deploy Logs** for:
   ```
   ✅ Redis connected
   ✅ Firebase connected
   ✅ Firebase ready
   ```

### Common Issues

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot GET /` | Static path wrong in server.js | Lines 24-25 must serve from `public/` |
| `Cannot find module './scenarios'` | Root scenarios.js missing `module.exports` | Add `module.exports = SCENARIOS;` at bottom |
| `FIREBASE WARNING: {}` | Bad env vars | Check all 4 Firebase vars in Railway Variables |
| SVG diagrams not loading | Images not committed to git or gitignored | Run `git add public/images/` and push |
| Correct answer shows `?` | Root scenarios.js missing `answer:` fields | Replace with server-side version that has answers |

---

## Architecture Notes

- **State machine** runs entirely on the server. All 55 clients stay in sync via Socket.io broadcasts.
- **Firebase Realtime Database** stores all game state — scores, decisions, quiz answers, card inventory, freeze status.
- **Redis** provides atomic "first-to-commit" locking for card actions (prevents two teams freezing the same target simultaneously).
- **`frozenNextRound`** flag is set when Freeze card is used. It promotes to `frozen=true` at the START of the next round (in `startRound`), not at reveal time — ensuring the current round is unaffected.
- **`revealedAnswer`** is sent as a top-level field in every `gameState` broadcast AND directly on the `phase` event for AFTERMATH/RECON — guaranteeing clients always have it before rendering results.
- Client-side `public/scenarios.js` intentionally omits `answer:` fields. The server requires the root `scenarios.js` which has all answers.

---

*Built with Claude · Deployed on Railway · Firebase + Redis backend*
