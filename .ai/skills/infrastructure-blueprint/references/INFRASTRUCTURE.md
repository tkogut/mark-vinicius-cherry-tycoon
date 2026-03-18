# Cherry Tycoon Environment & Agent Directives

## 🌍 Environment Context
- **OS**: WSL2 (Ubuntu) — **ACTIVE since 2026-03-02**
- **Primary Tooling**: 
  - dfx **0.30.2** (Internet Computer SDK) — Updated 2026-03-02
  - Node.js **v24.14.0** (installed via nvm in WSL)
  - npm **11.9.0**
  - Motoko (Backend logic)
  - React / Vite (Frontend)
  - Python3 wsl_bridge.py (CDP Network bridging)
- **Path Mapping**:
  - Windows: `C:\Users\tkogut\AppData\Local\Programs\Antigravity` (Antigravity IDE)
  - WSL: `/home/tkogut/projects/mark-vinicius-cherry-tycoon` ✅ (canonical path)

## 🌉 Browser Automation (The Bridge)
- **Status**: ACTIVE
- **CDP Bridge**: Antigravity agents use a Windows Chrome instance via a socat tunnel.
- **Settings**:
  - **CDP Port**: 9222
  - **Gateway IP**: 172.27.32.1
- **Rule**: When browser automation is needed, ensure the ntigravity_chrome.bat launcher is active on the Windows host.

## 🤖 Agent Protocols & Communication
- **Central Intelligence**: All planning and state are stored in the .agent/rules/ folder.
- **Domain Hand-offs**:
  - Use .agent/rules/01_backend_backlog.md to communicate logic changes.
  - Use .agent/rules/02_frontend_backlog.md for UI tasks.
  - Use .agent/rules/03_qa_checklist.md for testing results.
- **Workflow**:
  1. Read .agent/rules/00_master_plan.md before starting any task.
  2. Perform work in your assigned domain.
  3. Update the corresponding .md file in .agent/rules/ to reflect progress or blockers.
  4. If a task requires terminal output (e.g., dfx deploy), pipe logs to .tmp/ for analysis.

## 🛠️ Command Execution Rules
- **Binary Paths**: Always prefer WSL binaries when running dfx or system tools.
- **Non-Root**: Execute commands as the default WSL user (	kogut), do not use sudo for project-level tasks.
- **Shell**: Use ash for all internal command formulations.
