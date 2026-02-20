# Cherry Tycoon Environment & Agent Directives

## 🌍 Environment Context
- **OS**: WSL2 (Ubuntu)
- **Primary Tooling**: 
  - dfx 0.24.3 (Internet Computer SDK)
  - Motoko (Backend logic)
  - React / Next.js (Frontend)
  - socat (Network bridging)
- **Path Mapping**:
  - Windows: C:\Users\admintk\.gemini\antigravity\playground\mark-vinicius-checker-tycoon-1 (Note: Project root name on Windows might vary slightly, always use relative paths from root).
  - WSL: /home/tkogut/projects/mark-vinicius-cherry-tycoon-1

## 🌉 Browser Automation (The Bridge)
- **Status**: ACTIVE
- **CDP Bridge**: Antigravity agents use a Windows Chrome instance via a socat tunnel.
- **Settings**:
  - **CDP Port**: 9222
  - **Gateway IP**: 172.27.32.1
- **Rule**: When browser automation is needed, ensure the ntigravity_chrome.bat launcher is active on the Windows host.

## 🤖 Agent Protocols & Communication
- **Central Intelligence**: All planning and state are stored in the directives/ folder.
- **Domain Hand-offs**:
  - Use directives/01_backend_backlog.md to communicate logic changes.
  - Use directives/02_frontend_backlog.md for UI tasks.
  - Use directives/03_qa_checklist.md for testing results.
- **Workflow**:
  1. Read directives/00_master_plan.md before starting any task.
  2. Perform work in your assigned domain.
  3. Update the corresponding .md file in directives/ to reflect progress or blockers.
  4. If a task requires terminal output (e.g., dfx deploy), pipe logs to .tmp/ for analysis.

## 🛠️ Command Execution Rules
- **Binary Paths**: Always prefer WSL binaries when running dfx or system tools.
- **Non-Root**: Execute commands as the default WSL user (	kogut), do not use sudo for project-level tasks.
- **Shell**: Use ash for all internal command formulations.
