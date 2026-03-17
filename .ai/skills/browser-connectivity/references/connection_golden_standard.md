---
trigger: always_on
---

# 📜 Connection Golden Standard: WSL-to-Windows CDP Bridge

To ensure 100% stability in cross-OS browser debugging, all agents MUST adhere to these rules.

## 1. Network Topology
- **WSL Agent** connects to `http://127.0.0.1:9222`.
- **WSL Bridge** (`start_tunnel.py`) forwards traffic to `WINDOWS_IP:9223`.
- **Windows Portproxy** maps `9223` to `127.0.0.1:9222`.
- **Windows Chrome** listens on `127.0.0.1:9222`.

## 2. Windows-Side Configuration (User: tkogut)
Chrome must be launched with:
```bash
chrome.exe --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0 --remote-allow-origins=* --profile-directory="roostertk"
```

The Portproxy must be set once:
```powershell
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=9223 connectaddress=127.0.0.1 connectport=9222
```

## 3. WSL-Side Automation
Agents should trigger `python3 execution/start_tunnel.py` before any browser task. 

### Diagnostics:
- **Connection Refused**: Bridge or Portproxy is down.
- **Empty Reply from Server**: Chrome is running but NOT in debug mode (missing `--remote-debugging-port`).
- **Zero Width/Height Error**: Browser session is active but not fully initialized or window is minimized. Call `browser_resize_window`.

## 4. Environment Persistence
- Always use the **roostertk** profile.
- Default Vite port: `5173`.
- Gateway IP must be dynamically detected via `ip route show | grep default`.
- **🚨 PORT SAFETY RULE**: Port 9222 is for **Agent Control** (CDP). For **User Interaction/Test**, use `http://localhost:5173/`.

## 5. Rule 05.1: Port Lockdown
- **Frontend MUST** always run on `http://127.0.0.1:5173`.
- **Strict Port**: Use `strictPort: true` in `vite.config.ts` to prevent environmental drift.
- **Ghost Clean**: Before `dfx deploy` or starting Vite, perform a fuser-based cleanup of ports 5173-5175.
