---
name: browser-connectivity
description: >
  [Trigger Words: "browser", "CDP", "9222", "9223", "bridge", "start_tunnel",
  "wsl_bridge", "chrome debug", "automation", "netsh", "connection refused", "empty reply"]
  [Domain: WSL2, Chrome Remote Debugging Protocol, wsl_bridge_universal.py, start_tunnel.py]
  [Outcomes: stable cross-OS CDP browser debugging, error diagnosis, connection recovery]
---

# Browser Connectivity Skill

🎯 **Purpose**: 
Govern all agent interactions with the Windows-hosted Chrome browser from WSL2. Provides diagnostics, recovery procedures, and the dual-port connection topology.

🛠️ **Implementation Logic**:
Agents must use the scripts in `scripts/` to establish the bridge and check `references/` for troubleshooting.
- **Topology**: WSL (9222) → Bridge (9223) → Windows (9222).
- **Rule**: ALWAYS use `browserType.connectOverCDP('http://127.0.0.1:9222')`.

🗣️ **Usage Rule**:
Activate via `/connectivity`. 
Handshake: `"Browser Handshake: CDP verified at http://127.0.0.1:9222 via start_tunnel.py."`

## Workflow:

1. **Detect Gateway IP**:
   ```bash
   ip route show | grep default | awk '{print $3}'
   ```
2. **Start Bridge**:
   ```bash
   python3 execution/start_tunnel.py
   ```
3. **Health Ping**:
   ```bash
   curl -s http://127.0.0.1:9222/json/version | python3 -m json.tool
   ```
4. **Verify Vite** (Port 5173):
   ```bash
   curl -I http://127.0.0.1:5173/
   ```
5. **Interpret Health**: If connection refused, check `scripts/wsl_bridge_universal.py`.

## Scripts
- `../../execution/start_tunnel.py` — primary bridge (auto-detects gateway IP)
- `scripts/wsl_bridge_universal.py` — universal fallback bridge

## References
- `references/connection_golden_standard.md` — Rule 05 full spec
- `references/network_troubleshooting.md` — Error diagnosis
