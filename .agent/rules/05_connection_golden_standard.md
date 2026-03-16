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
