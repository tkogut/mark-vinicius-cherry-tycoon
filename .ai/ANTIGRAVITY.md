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
WSL Agent          →  http://127.0.0.1:9222   (CDP endpoint, local)
start_tunnel.py    →  WINDOWS_IP:9223         (bridge)
Windows netsh      →  0.0.0.0:9223 → 127.0.0.1:9222
Chrome (Windows)   →  127.0.0.1:9222          (CDP server)
```

### Port Lockdown (Rule 05.1)
| Port | Purpose | Rule |
|---|---|---|
| `9222` | Agent CDP Control | NEVER browse manually |
| `9223` | WSL Bridge Target | Managed by `start_tunnel.py` |
| `5173` | Vite Dev Server | ALWAYS use for manual verification |

### Chrome Launch Command (Windows)
```powershell
chrome.exe --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0 --remote-allow-origins=* --profile-directory="roostertk"
```

### netsh Portproxy (run once, PowerShell Admin)
```powershell
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=9223 connectaddress=127.0.0.1 connectport=9222
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
→ See `.ai/AGENTS.md` for collaboration rules, Yarn standards, and Virtual CLI specification.
