# Agent Instructions [PROJECT SPECIFIC]

> **System**: Mark Vinicius Cherry Tycoon Orchestration
> **Structure**: 3-Agent Model (Backend, Frontend, QA) + Manager

## The Setup
This project uses a file-based orchestration system.

### 1. The Directives (The Brain)
Located in `directives/`:
- **`00_master_plan.md`**: The High-Level Roadmap. (Managed by **Manager**).
- **`01_backend_backlog.md`**: Motoko/Backend tasks. (Managed by **Backend Agent**).
- **`02_frontend_backlog.md`**: React/Frontend tasks. (Managed by **Frontend Agent**).
- **`03_qa_checklist.md`**: Testing tasks. (Managed by **QA Agent**).
- **`99_agent_protocols.md`**: Rules of engagement.

### 2. The Execution (The Hands)
Located in `execution/`:
- Scripts for automating tasks (e.g., `test-backend.ps1`).

### 3. How to Work
1.  **Check `00_master_plan.md`** to see the current phase.
2.  **Select your Role** (e.g., "I am working on Backend").
3.  **Read your specific Directive** (e.g., `01_backend_backlog.md`).
4.  **Execute** the top priority item.
5.  **Update** the directive file and `00_master_plan.md` upon completion.

### 4. Self-Correction
- If a script fails, fix it in `execution/`.
- If a directive is unclear, update it in `directives/`.
- If you are blocked, flag it in `00_master_plan.md`.

---
*Refer to `directives/99_agent_protocols.md` for detailed instructions.*

