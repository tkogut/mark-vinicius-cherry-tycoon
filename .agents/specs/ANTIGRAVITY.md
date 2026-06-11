# ANTIGRAVITY PROJECT IDENTITY
> **Źródło prawdy**: Ten plik. Zawsze aktualizuj go jako pierwszy przy zmianie infrastruktury.

---

## 1. System Identity

| Field | Value |
|---|---|
| **Project** | Mark Vinicius Cherry Tycoon |
| **Orchestration Layer** | AntiGravity AI Environment |
| **Producer** | JaPiTo Group |
| **WSL User** | `admin_tk` (Ubuntu) |
| **Windows Host User** | `tkogut` (Windows 11) |
| **Chrome Profile** | `roostertk` |
| **Project Root (WSL)** | `/home/tkogut/projects/mark-vinicius-cherry-tycoon` |

---

## 2. Network / Port Topology

```
WSL Agent (Cypress/Sub) →  http://127.0.0.1:9222   (CDP endpoint, local)
start_tunnel.py    →  WINDOWS_IP:9223         (bridge)
Windows netsh      →  0.0.0.0:9223 → 127.0.0.1:9222
Windows netsh      →  0.0.0.0:5173 → WSL_IP:5173 (Vite Access)
Chrome (Windows)   →  127.0.0.1:9222          (CDP server)
Vite Server (WSL)  →  0.0.0.0:5173            (Host: true)
```

### Port Lockdown (Rule 05.1)
| Port | Purpose | Rule |
|---|---|---|
| `9222` | Agent CDP Control | NEVER browse manually |
| `9223` | WSL Bridge Target | Managed by `start_tunnel.py` |
| `5173` | Vite Dev Server | MUST use `--host 0.0.0.0` and Windows portproxy |

### Chrome Launch Command (Windows)
```powershell
chrome.exe --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0 --remote-allow-origins=* --profile-directory="roostertk"
```

### netsh Portproxy (run once, PowerShell Admin)
```powershell
# CDP Bridge
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=9223 connectaddress=127.0.0.1 connectport=9222
# Vite Bridge (Replace <WSL_IP> with current IP from 'hostname -I')
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=5173 connectaddress=<WSL_IP> connectport=5173
```

### Bridge Activation (WSL)
```bash
python3 execution/start_tunnel.py
```

---

## 3. Motoko Segregation Matrix

| | Track A (Local/Playground) | Track B (Mainnet) |
|---|---|---|
| **dfx Version** | `0.24.3` | `0.30.x+` |
| **Actor File** | `backend/main.mo` | `backend/main_mainnet.mo` |
| **Actor Syntax** | `actor { ... }` + `stable var` | `persistent actor { }` + `transient` |
| **Paradigm** | Traditional Motoko (Non-EOP) | Enhanced Orthogonal Persistence (EOP) |
| **Deploy Target** | Local / ICP Playground / GitHub Actions | ICP Mainnet |
| **Status** | ✅ ACTIVE | 🗓️ FUTURE ROADMAP |

> [!CAUTION]
> **CATEGORICAL PROHIBITION**: Never copy actor declarations or persistence keywords between Track A and Track B.
> They are architecturally distinct. Violation causes deployment failure on both environments.

---

## 4. Visual Design System

**Style**: **Neo-Steampunk Cherry** ("Golden Harvester" aesthetic)
**Setting**: Rural Poland (Opole/Namysłów/Głubczyce) — brass tractors, steam-powered cherry shakers.

### Color Tokens
| Token | Role |
|---|---|
| `brass` | Primary headers, dials, borders |
| `copper` | Secondary accents, status indicators |
| `ruby` | Cherry harvest, alert states |
| `charcoal` | Background panels, `hull` containers |
| `mahogany` | Card surfaces, rivalry plates |

### Mandatory CSS Classes
- `.mechanical-hull` — wraps every container (industrial texture)
- `.hull-header` — titles with `gear-spin` icon animation
- `.god-ray` — cinematic lighting overlay for full-page views

### Skill Entry Point
→ See `.ai/skills/ui-factory/SKILL.md` for full UI generation workflow.

---

## 5. Skill Registry

| Slash Command | Skill Folder | Purpose |
|---|---|---|
| `/ui-factory`, `/visualize-concept` | `ui-factory/` | Neo-Steampunk UI generation + Nano Banana 2 |
| `/connectivity` | `browser-connectivity/` | CDP bridge management |
| `/audit-economy` | `economic-math-auditor/` | Formula verification |
| `/check-dual` | `dual-entrypoint-sync/` | Track A/B parity audit |
| `/particles` | `particle-engine/` | Cinematic particle overlays |
| `/infrastructure` | `infrastructure-blueprint/` | Farm asset cost/effect parity |
| *(backend work)* | `motoko-backend/` | Track A/B standards enforcement |

---

## 6. Agent Protocols Reference
→ See `.ai/AGENTS.md` for collaboration rules, NPM standards, and Virtual CLI specification.

---

## 7. Master Plan & Roadmap
> **Current Status**: **Phase 12.0: Cinematic Upgrade — COMPLETE ✅**
> **Environment**: **WSL (Ubuntu)** ✅ ACTIVE — `dfx 0.24.3` + `Motoko 0.30.2` (EOP) working.
> **Dual-Entrypoint**: `main.mo` (Playground) / `main_mainnet.mo` (Mainnet) strictly maintained.

### High-Level Roadmap

#### Phase 1 to Phase 8.0 (COMPLETE ✅)
- **Phase 1-4**: Core logic, MVP integration, economy, infrastructure, multiplayer prep.
- **Phase 5.7**: Mechanics deepening (Bulk Supply, Phase Watering, Machine Decay).
- **Phase 5.9**: Security Excellence (SEC-019, SEC-020).
- **Phase 6.1**: Global Leaderboards & Prestige Scoring implemented. `topPlayersCache` active.
- **Phase 7.0**: The Living World (Event system, Weather, Crop Insurance).
- **Phase 8.0**: The Competitive Pool (`auction_logic.mo`, Bids, Flood Factor, Base AI Archetypes).

#### Phase 9.0: Frontend Implementation (PROD-READY (Local) ✅)
- [x] **Phase 8.1**: Imperial Contract Bid Modal + Refined Gauge System.
- [x] **Phase 9.0**: Auction Dashboard core implementation.
- [ ] **Phase 7.0**: Weather & Event UI integration.
- [ ] **Phase 6.1**: Enhanced Leaderboard & Rankings UI.

#### Phase 11.0: Advanced AI Market Competitors (COMPLETE ✅)
*Objective: Enhance the competitive pool by introducing specialized AI archetypes.*
- **The Aggressive (Marek)**: High-volatility Imperial Contracts, aggressive step-ups.
- **The Eco (Kasia)**: Low-risk, high-quality organic bundles, methodical increments.
- **The Tactician (Hans)**: Adaptive response, diversified portfolio.
- **Backend**: Dynamic strategy updates in `auction_logic.mo` and `game_logic.mo`.
- **Frontend**: Visual variants for `AIBidderCard.tsx` based on strategy.

#### Phase 10.0: Sports Patron (IV Liga Opolska) [DEFERRED]
- **Scope**: 16 regional teams (Odra II, Namysłów, Nysa, etc.) from Opole province.
- **Backend**: `FootballClub` HashMap seeding, TPI (Team Power Index) calculation.
- **Frontend**: `SportsCenter.tsx` with gauge-dials and regional reputation link.

#### Cinematic Upgrade: "The Golden Harvester" (COMPLETE ✅)
*Implement the ultimate infrastructure upgrade combining robust economic scaling with a premium "Neo-Steampunk Cherry" frontend.*
- **Backend**: `golden_harvester_level` tracking, safe cost deductions, `(1.05^Level)` multiplier.
- **Frontend**: `GoldenHarvesterView.tsx` with God Rays, Golden Hour lighting, `GoldenPollen` particles, and haptic feedback.

### Active Directives
| Domain | Assigned To | Status |
| :--- | :--- | :--- |
| **Backend** | Backend Agent | **COMPLETE** — Phase 8.0 Competitive Pool implemented. |
| **Frontend** | Frontend Agent | **ACTIVE** — Phase 8.1 / 9.0 complete. Refining UI. |
| **QA** | QA Agent | **ACTIVE** — Verify Phase 6.1 Leaderboard logic via Candid |
| **Security** | Security Agent | **ACTIVE** — Monitoring for new Phase 7 commits |
| **Logic** | Core Architect | **ENFORCED** — **Atomic Auth**: `isAuthenticated` SET ONLY after `backendActor` is ready. |
