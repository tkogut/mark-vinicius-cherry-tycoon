# Infrastructure & Architectural Source of Truth

This document standardizes the deployment infrastructure and environmental boundaries for the Mark Vinicius Cherry Tycoon project.

## Track A: Local & Playground (CURRENT)
This is the primary development and fast-iteration environment.

- **Dfinity Engine**: `dfx 0.24.3`
- **Main Actor**: `backend/main.mo`
- **Motoko Syntax**: Traditional `actor` and `stable var` (Non-EOP).
- **Tooling Connectivity**: Browser Bridge via `wsl_bridge_universal.py` (Dynamic Gateway IP, Port `9222`).
- **Browser Profile**: Chrome `roostertk` (Folder: `Default`).

## Track B: Mainnet (FUTURE ROADMAP)
This is the high-stability production environment.

- **Dfinity Engine**: `dfx 3.0` (or `0.30.x+`)
- **Main Actor**: `backend/main_mainnet.mo`
- **Motoko Syntax**: Enhanced Orthogonal Persistence (EOP) using `persistent actor` and `transient` state.

## Deployment Protocols
1. **Never mix environments**: Track A and Track B use fundamentally different Motoko paradigms. Do not copy `actor` headers or state variable declarations between `main.mo` and `main_mainnet.mo`.
2. **Bridge Resiliency**: The agent accesses the Windows browser via `wsl_bridge_universal.py`. The bridge MUST auto-detect the dynamic gateway IP. Hardcoded IPs (like `172.20.32.1`) are deprecated.
3. **Browser Recovery**: If CDP port `9222` is unresponsive, use PowerShell (Admin) to launch Chrome with `--remote-debugging-port=9222` and the specific `--user-data-dir` flag associated with the user's primary identity. Do not launch temporary profiles.
