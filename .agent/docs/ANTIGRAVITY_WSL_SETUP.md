# Antigravity WSL Setup Guide

This document provides instructions for setting up **Google Antigravity** to work seamlessly within **WSL2**, including local integration and a CDP Browser Bridge for automation.

---

## 1. Local IDE Integration (Windows to WSL)

To launch Antigravity from any WSL terminal and open the current project, add the following to your `~/.bashrc`:

```bash
# Antigravity launch function
agy() {
    # Adjust this path if Antigravity is installed elsewhere
    local AG_EXE="/mnt/c/Users/tkogut/AppData/Local/Programs/Antigravity/bin/antigravity"
    "$AG_EXE" --remote wsl+Ubuntu "$(pwd)"
}

# Ensure HOME is correctly set for agents (Optional but recommended)
export HOME=/home/tkogut
```

---

## 2. Browser Subagent Bridge (Windows Chrome to WSL)

Since browser automation often fails in pure WSL due to environment restrictions (missing $HOME, OOM), follow this bridge configuration to use your native Windows Chrome.

### A. Windows Setup (PowerShell Admin)
Run these commands once on the Windows host to bridge the network:

```powershell
# Get your Gateway IP from WSL: 'ip route show | grep default'
$GATEWAY_IP = "172.27.32.1" 

# Bridge WSL traffic to Windows Localhost
netsh interface portproxy add v4tov4 listenport=9222 listenaddress=$GATEWAY_IP connectport=9222 connectaddress=127.0.0.1

# Allow the port in Firewall
New-NetFirewallRule -DisplayName "Antigravity Browser Bridge" -Direction Inbound -LocalPort 9222 -Protocol TCP -Action Allow
```

### B. Chrome Launcher (Windows)
Create a file at `C:\Users\admin_tk\.antigravity\antigravity_chrome.bat`:

```batch
@echo off
set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist %CHROME% set CHROME="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
%CHROME% --remote-debugging-port=9222 --user-data-dir="C:\Users\admin_tk\.antigravity\chrome_profile" --no-first-run
```

### C. WSL Tunnel (Python Bridge)
If `socat` is unavailable or locked, use this Python bridge. Save it to `wsl_bridge.py`:

```python
import socket, threading
def forward(src, dst):
    try:
        while True:
            data = src.recv(4096)
            if not data: break
            dst.sendall(data)
    finally: src.close(); dst.close()

def start(local_port, remote_host, remote_port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM); s.bind(('127.0.0.1', local_port)); s.listen(5)
    while True:
        c, _ = s.accept(); r = socket.socket(socket.AF_INET, socket.SOCK_STREAM); r.connect((remote_host, remote_port))
        threading.Thread(target=forward, args=(c, r)).start(); threading.Thread(target=forward, args=(r, c)).start()

if __name__ == "__main__": start(9222, '172.27.32.1', 9222)
```

**Add this to `~/.bashrc` to start automatically:**
```bash
if ! pgrep -f "wsl_bridge.py" > /dev/null; then
    nohup python3 /path/to/wsl_bridge.py > /tmp/wsl_bridge.log 2>&1 &
fi
```

---

## 3. IDE Configuration

In Antigravity **Settings -> Browser Subagent**:
- **Browser CDP Port**: `9222`
- **Chrome Binary Path**: Leave empty (it counts on the bridge) or use a dummy script to prevent local spawns.

## 4. Environment Rules

Ensure `.agent/rules/environment.md` exists with:
```md
# Environment Context
- OS: WSL2 (Ubuntu)
- Browser: Bridged via CDP on port 9222 to Windows Host.
```
