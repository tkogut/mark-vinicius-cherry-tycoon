---
name: Browser Observer Skill
description: Orchestration for remote browser-subagent connection over CDP bridge.
---

# BROWSER_OBSERVER Skill

## Overview
This skill governs how agents interact with the web browser when running in a WSL2 environment. It bypasses local browser launches in favor of a bridged CDP connection to a Windows-hosted Chrome instance.

## Connection Protocol (Dual-Port Strategy)
- **Endpoint**: `http://127.0.0.1:9222` (Mapped locally in WSL).
- **Remote Target**: `WINDOWS_IP:9223` (Host Windows).
- **Method**: `browserType.connectOverCDP`.
- **Constraint**: NEVER use `browser.launch()`. Use `roostertk` profile.

## Verification Workflow (Check_Bridge_Health)
1. **IP Detection**: `ip route show | grep default | awk '{print $3}'`.
2. **Bridge Audit**: Ensure `start_tunnel.py` or `wsl_bridge_universal.py` is active.
3. **Endpoint Ping**: `curl -I http://127.0.0.1:9222/json/version`.
4. **Diagnostic Filter**:
   - `Exit Code 7 (Failed to connect)` -> Bridge script is DEAD.
   - `Empty reply from server` -> Chrome is running but CDP Port is CLOSED.
   - `HTTP 200` -> Connection Stable.

## Error Recovery
- **If Bridge is Dead**: Run `python3 execution/start_tunnel.py`.
- **If Port 9223 Blocked**: Tell user: "Proszę zresetować netsh: `netsh interface portproxy reset`".
- **If Chrome Unresponsive**: Verify flags: `--remote-debugging-port=9222` is mandatory.

## Handshake Protocol
> "Browser Handshake: CDP Connection verified at http://localhost:9222 via wsl_bridge_universal.py."
