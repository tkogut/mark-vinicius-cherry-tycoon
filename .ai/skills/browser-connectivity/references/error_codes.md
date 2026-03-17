# Error Codes — Browser Connectivity Reference

## errno 52 — ECONNRESET

**Meaning**: The remote host (Windows Chrome / bridge) forcibly closed the connection mid-session.

**Common Causes**:
- Chrome restarted while the bridge was active.
- Windows went to sleep / lock screen killed the debug session.
- `start_tunnel.py` process was killed externally.

**Recovery**:
1. `pkill -f start_tunnel.py` — kill stale bridge process.
2. Verify Chrome is still running with `--remote-debugging-port=9222`.
3. Restart: `python3 execution/start_tunnel.py`.
4. Health check: `curl -s http://127.0.0.1:9222/json/version`.

---

## errno 56 — ENOTSOCK

**Meaning**: Operation attempted on something that is not a valid socket.
The bridge process died, leaving a zombie socket reference.

**Recovery**:
1. `pkill -f wsl_bridge_universal.py` — hard kill all bridge variants.
2. `pkill -f start_tunnel.py`
3. Wait 2 seconds, then restart: `python3 execution/start_tunnel.py`.

---

## netsh Portproxy Reference

### Add Proxy (run once, Admin PowerShell)
```powershell
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=9223 connectaddress=127.0.0.1 connectport=9222
```

### Verify Proxy is Active
```powershell
netsh interface portproxy show all
```
Expected output: one row mapping `0.0.0.0:9223 → 127.0.0.1:9222`.

### Reset All Proxies (emergency)
```powershell
netsh interface portproxy reset
```

### Firewall Rule (allow inbound port 9223)
```powershell
New-NetFirewallRule -DisplayName "AntiGravity CDP Bridge" -Direction Inbound -LocalPort 9223 -Protocol TCP -Action Allow
```

---

## Connection Test Sequence

```bash
# 1. Detect gateway
GATEWAY=$(ip route show | grep default | awk '{print $3}')
echo "Gateway: $GATEWAY"

# 2. Test local CDP endpoint
curl -s http://127.0.0.1:9222/json/version | python3 -m json.tool

# 3. Interpret:
# HTTP 200 + JSON   → ✅ STABLE
# curl: (7)          → Bridge dead → restart start_tunnel.py
# Empty reply        → Chrome no CDP flag → relaunch Chrome
# errno 52           → Connection reset → pkill + restart
# errno 56           → Bad socket → pkill all + restart
```
