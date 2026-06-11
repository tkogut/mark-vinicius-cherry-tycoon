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
The agent:
4. **Start Vite**: `npm run dev` in `frontend/`.
   - **Network Check**: Verify `0.0.0.0:5173` binding.
5. **Atomic Auth**: Confirm `isAuthenticated` toggles ONLY after `backendActor` is ready.

🗣️ **Usage Rule**:
Activate via `/frontend-startup`. 
Handshake: `"Handshake Verified: Tunnel -> DFX -> NPM sequence enforced."`

## 🚀 Mandatory Sequence:

1. **Start CDP Bridge & Proxy Tunnel**:
   ```bash
   python3 execution/start_tunnel.py
   ```
   *Rationale: Auto-checks port 9223 and 5173, triggering a Windows UAC prompt if netsh proxies are lost due to WSL dynamic IP changes. Ensures `localhost` is always reliable.*

2. **Ensure DFX Replica is Running**:
   ```bash
   dfx start --background --clean
   ```
   *Rationale: Canisters must be active for the next step.*

3. **Deploy Backend (Sync IDs)**:
   
   ```bash
   dfx deploy backend
   ```
   *Rationale: Refreshes `canister_ids.json` and generates the latest TS/Candid declarations in `@/declarations/`.*

4. **Start Vite Dev Server**

   ```bash
   cd frontend && pkill -f vite || true && nohup npm run dev -- --host 0.0.0.0 > /tmp/vite.log 2>&1 &
   ```
   *Rationale: Binds to public interface. Użyj **BEZWZGLĘDNIE** `nohup` i `&`, w przeciwnym razie serwer Vite umrze po zakończeniu kroku agenta (powodując `ERR_CONNECTION_RESET` w Chrome).*

## 📝 References
- [.ai/ANTIGRAVITY.md](file:///home/tkogut/projects/mark-vinicius-cherry-tycoon/.ai/ANTIGRAVITY.md) — Network / Port Topology
- [.ai/skills/browser-connectivity/SKILL.md](file:///home/tkogut/projects/mark-vinicius-cherry-tycoon/.ai/skills/browser-connectivity/SKILL.md) — CDP Bridge Skill
