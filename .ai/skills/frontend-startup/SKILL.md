---
name: frontend-startup
description: >
  [Trigger Words: "start frontend", "dev mode", "npm run dev", "vite startup", "startup sequence", "canister not found"]
  [Domain: Vite, DFX, CDP Bridge, Local Development]
  [Outcomes: guaranteed environmental synchronization, prevents "Canister ID not found" errors]
---

# Frontend Startup Skill

🎯 **Purpose**: 
Enforce the correct startup sequence for local development to ensure that the Vite dev server correctly picks up the Internet Computer environment variables and Candid declarations.

🛠️ **Implementation Logic**:
The agent must NEVER run `npm run dev` before the CDP bridge and DFX replica are ready.

🗣️ **Usage Rule**:
Activate via `/frontend-startup`. 
Handshake: `"Handshake Verified: Tunnel -> DFX -> NPM sequence enforced."`

## 🚀 Mandatory Sequence:

1. **Start CDP Bridge (Tunnel)**:
   ```bash
   python3 execution/start_tunnel.py
   ```
   *Rationale: Establishes the connection to the Windows Chrome browser for CDP automation.*

2. **Ensure DFX Replica is Running**:
   ```bash
   dfx start --background
   ```
   *Rationale: Canisters must be active for the next step.*

3. **Deploy Backend (Sync IDs)**:
   ```bash
   dfx deploy backend
   ```
   *Rationale: Refreshes `canister_ids.json` and generates the latest TS/Candid declarations in `@/declarations/`.*

4. **Start Vite Dev Server**:
   ```bash
   cd frontend && npm run dev
   ```
   *Rationale: Vite loads env variables on startup. If DFX is not ready, it will fail to find canister IDs.*

## 📝 References
- [.ai/ANTIGRAVITY.md](file:///home/tkogut/projects/mark-vinicius-cherry-tycoon/.ai/ANTIGRAVITY.md) — Network / Port Topology
- [.ai/skills/browser-connectivity/SKILL.md](file:///home/tkogut/projects/mark-vinicius-cherry-tycoon/.ai/skills/browser-connectivity/SKILL.md) — CDP Bridge Skill
