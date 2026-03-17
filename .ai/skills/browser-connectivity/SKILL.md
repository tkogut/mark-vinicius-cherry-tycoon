---
name: browser-connectivity
description: >
  [Trigger Words: "browser", "CDP", "9222", "9223", "bridge", "start_tunnel",
  "wsl_bridge", "chrome debug", "automation", "netsh", "connection refused", "empty reply"]
  [Domain: WSL2, Chrome Remote Debugging Protocol, wsl_bridge_universal.py, start_tunnel.py]
  [Outcomes: stable cross-OS CDP browser debugging, error diagnosis, connection recovery]
---

# Browser Connectivity Skill

## Purpose
Govern all agent interactions with the Windows-hosted Chrome browser from WSL2.
Provides diagnostics, recovery procedures, and the dual-port connection topology.

## Connection Topology

```
WSL Agent            →  http://127.0.0.1:9222   (local CDP endpoint)
execution/start_tunnel.py  →  WINDOWS_IP:9223   (auto-detect gateway)
Windows netsh proxy  →  0.0.0.0:9223 → 127.0.0.1:9222
Chrome (Windows)     →  127.0.0.1:9222          (CDP server, roostertk profile)
```

**Rule**: NEVER use `browser.launch()`. ALWAYS use `browserType.connectOverCDP('http://127.0.0.1:9222')`.

## Port Lockdown (Rule 05.1)

| Port | Role | Agent Rule |
|---|---|---|
| `9222` | CDP Control | Agent-only. Never browse manually. |
| `9223` | WSL Bridge Target | Managed by `start_tunnel.py`. |
| `5173` | Vite Dev Server | Manual verification target. Always use this for UI checks. |

## Diagnostic Filter

| Symptom | Root Cause | Recovery |
|---|---|---|
| `Exit Code 7 / Connection Refused` | Bridge script dead | Run `python3 execution/start_tunnel.py` |
| `Empty reply from server` | Chrome running, CDP port CLOSED | Launch Chrome with `--remote-debugging-port=9222` |
| `errno 52 (ECONNRESET)` | Connection reset mid-session | Restart bridge; check Chrome hasn't restarted |
| `errno 56 (ENOTSOCK)` | Socket not valid / bridge process died | `pkill -f start_tunnel.py` then restart |
| `Zero Width/Height Error` | Browser window minimized or uninitialized | Call `browser_resize_window` |
| `HTTP 200 on /json/version` | ✅ Stable | Proceed |

## Windows Configuration

### Chrome Launch (PowerShell)
```powershell
chrome.exe --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0 `
  --remote-allow-origins=* --profile-directory="roostertk"
```

### netsh Portproxy (run once, Admin PowerShell)
```powershell
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=9223 `
  connectaddress=127.0.0.1 connectport=9222
# Reset if needed:
netsh interface portproxy reset
```

## Workflow (`/connectivity` activation)

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
4. **Interpret result** using Diagnostic Filter above.
5. **Verify Vite** (separate, port 5173):
   ```bash
   curl -I http://127.0.0.1:5173/
   ```
6. Output handshake: `"Browser Handshake: CDP verified at http://127.0.0.1:9222 via start_tunnel.py."`

## Scripts
- `../../execution/start_tunnel.py` — primary bridge (auto-detects gateway IP)
- `../../execution/wsl_bridge_universal.py` — universal fallback bridge

## References
- `references/connection_golden_standard.md` — Rule 05 full spec
- `references/error_codes.md` — errno 52/56 and netsh reference
- `references/wsl_setup.md` — full WSL/Windows one-time setup guide
