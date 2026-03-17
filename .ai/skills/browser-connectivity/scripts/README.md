# scripts/ — Browser Connectivity Scripts

> **Canonical location**: Scripts live in `execution/` in the project root.
> This directory documents them; do NOT duplicate the actual script files.

## start_tunnel.py

**Path**: `../../execution/start_tunnel.py`

**Purpose**: Auto-detects the WSL gateway IP and starts the TCP tunnel from
`WSL:9222` → `WINDOWS_IP:9223`.

**Usage**:
```bash
python3 execution/start_tunnel.py
```

**What it does**:
1. Runs `ip route show | grep default` to detect gateway IP dynamically.
2. Validates port 9222 is not already in use (ghost clean).
3. Opens tunnel to `WINDOWS_IP:9223` (where netsh portproxy forwards to Chrome).
4. Prints connection status and keeps running until Ctrl+C.

---

## wsl_bridge_universal.py

**Path**: `../../execution/wsl_bridge_universal.py`

**Purpose**: Universal fallback bridge when `start_tunnel.py` fails.
Handles edge cases with multiple network interfaces.

**Usage**:
```bash
python3 execution/wsl_bridge_universal.py
```

---

## Activation Order

```
1. Launch Chrome on Windows with --remote-debugging-port=9222 --profile-directory="roostertk"
2. Confirm netsh portproxy: 0.0.0.0:9223 → 127.0.0.1:9222
3. python3 execution/start_tunnel.py
4. curl -s http://127.0.0.1:9222/json/version  # verify HTTP 200
```
