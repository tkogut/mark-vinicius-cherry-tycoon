---
name: Browser Observer Skill
description: Orchestration for remote browser-subagent connection over CDP bridge.
---

# BROWSER_OBSERVER Skill

## Overview
This skill governs how agents interact with the web browser when running in a WSL2 environment. It bypasses local browser launches in favor of a bridged CDP connection to a Windows-hosted Chrome instance.

## Connection Protocol
- **Endpoint**: `http://localhost:9222`
- **Method**: `browserType.connectOverCDP`
- **Constraint**: NEVER use `browser.launch()`. agents must share the single bridged session.

## Verification Workflow
Before performing any browser actions, verify the bridge integrity:
1. **Bridge Audit**: Check if `python3 wsl_bridge.py` is running in WSL.
2. **Target Discovery**: Query `http://localhost:9222/json`.
3. **Responsive Check**: Ensure the AntiGravity extension is detected in the target list.

## Error Recovery
- If "Connection Refused":
  - Validate that `wsl_bridge.py` is running.
  - Restart bridge: `nohup python3 /home/tkogut/projects/mark-vinicius-cherry-tycoon/execution/wsl_bridge.py > /tmp/wsl_bridge.log 2>&1 &`
- If bridge is running but `curl` hangs:
  - Verify Windows Gateway IP (usually `172.20.32.1` or `172.27.32.1`).
  - Ensure Windows Chrome is launched with `--remote-debugging-port=9222`.
  - Check Windows `netsh interface portproxy` settings.

## Handshake Protocol
> "Browser Handshake: CDP Connection verified at http://localhost:9222 via wsl_bridge.py."
