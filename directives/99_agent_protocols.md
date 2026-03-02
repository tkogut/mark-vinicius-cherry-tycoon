# AGENT PROTOCOLS: Orchestration System [SYSTEM]

## Overview
This project uses a "Multi-Agent Simulation" workflow. Even if run by a single human or single AI instance, we switch contexts using these protocols.

**Producer:** JaPiTo Group — all branding must reflect this. Zero legacy references (Caffeine AI, etc.).

**Architecture:** Dual Entrypoint — `main.mo` (Playground/dfx 0.24.3) + `main_mainnet.mo` (Mainnet/EOP). See `motoko-playground-mainnet-directive.md`.

## Roles & Recommended Models

### 1. Coordinator (Manager) — Keep always the name of chat as "Coordinator (Manager)"
- **Role**: Thinker, Planner, Orchestrator.
- **Task**: Writes `00_master_plan.md`. Decides *what* to do next. Breaks down complex problems.
- **Recommended Model**: **Gemini 1.5 Pro (High) / Claude 3.5 Sonnet**
- **Why**: Needs the highest reasoning capability and largest context window to maintain project coherence.

### 2. Backend Agent (Motoko Architect) — Keep always the name of chat as "Backend Agent"
- **Role**: Core Logic, strict typings, security.
- **Task**: Writes Motoko code, handles ICP specifics.
- **Recommended Model**: **Claude 3.5 Sonnet** (Primary) or **Gemini 1.5 Pro (High)**
- **Why**: Motoko is a niche language. Claude 3.5 Sonnet excels at strict syntax and complex logic.

### 3. Frontend Agent (The Builder) — Keep always the name of chat as "Frontend Agent"
- **Role**: UI Implementation, Component Assembly, Animations.
- **Task**: Writes React/Vite/Tailwind code. Implements SVG morphing, Lottie, particle effects.
- **Recommended Model**: **Gemini 1.5 Flash** or **Gemini 1.5 Pro (Low)**
- **Why**: React is standard boilerplate. Speed is prioritized. Flash is very capable here.

### 4. QA Agent (The Critic) — Keep always the name of chat as "QA Agent"
- **Role**: Verification, Edge Case Discovery.
- **Task**: Writes test scripts, breaks things.
- **Recommended Model**: **Gemini 1.5 Pro (High)** or **Gemini 1.5 Pro (Low)**
- **Why**: Needs high reasoning to spot logic flaws, not just write syntax.

### 5. Security Agent (The Gatekeeper) — Keep always the name of chat as "Security Agent"
- **Role**: Proactive security reviewer. Blockchain & frontend security.
- **Task**: Reviews every backend commit before merge. Audits against 7 security domains. Blocks Critical/High findings.
- **Recommended Model**: **Gemini 1.5 Pro (High)** or **Claude 3.5 Sonnet**
- **Why**: Needs deep reasoning about attack vectors, economic exploits, and ICP-specific vulnerabilities.
- **Policy**: `directives/SECURITY_DIRECTIVE_V1.md`
- **Backlog**: `directives/04_security_backlog.md`

## Workflow Loop
1. **AWARENESS (Every Turn)**: Before making any decision or tool call, check the `directives/` folder to see if the Manager or another agent has updated the roadmap or backlog.
2. **SITUATION**: Read your specific directive file (e.g., `01_backend_backlog.md`) to see the latest tasks.
3. **EXECUTE**:
    - Switch context to your Role.
    - Write code / Run commands.
    - Update your backlog (mark `[x]`).
4. **SECURITY CHECK (Backend Only)**: After completing a task, the Security Agent reviews the changes.
5. **REPORT**: Update `00_master_plan.md` or alert the user of progress/blockers.

### ⌨️ Slash Commands
Support the following short-hands by reading their definitions in `.agent/workflows/`:
- `/check-logs`: Analyze your role's log file.
- `/check-backlog`: Read your role-specific backlog and report tasks.
- `/status`: Summarize progress and update backlog.
- `/sync`: Re-sync with the Master Plan and other agents.
- `/start`: Pick a new task and begin implementation.
- `/continue`: Resume current task or start next one.
- `/test-cycle`: Execute tests relevant to the active phase.
- `/test-backend`: Run standardized backend verification tests in WSL.
- `/test-frontend`: Run standardized frontend build & verify tests in WSL.
- `/security-audit`: Trigger a security audit of specified scope.

## Agent Instructions
1. Read your backlog and identify implementation gaps.
2. Implement one function at a time.
3. **Dual Entrypoint**: New logic goes in shared modules. Public functions must be exposed in **both** `main.mo` and `main_mainnet.mo`.
4. **⚠️ WSL Constraint**: You CANNOT run `dfx` or `npm` commands. Formulate exact commands and ask the **User** to run them in WSL.
5. Tell the user to redirect output: `COMMAND 2>&1 | tee .tmp/<role>.log`.
6. Read the log yourself using `view_file` to analyze errors.
7. Update your backlog (mark as `[x]`) upon completion.
8. Notify Coordinator (`00_master_plan.md`) if blocked.

## Tool Usage
- **Manager**: Uses `task_boundary` to define high-level tasks.
- **Dev Agents**: Use `write_to_file`, `run_command` (dfx/npm), `view_file`.
- **QA Agent**: Uses `run_command` (test scripts), `view_file`.
- **Security Agent**: Uses `view_file`, `grep_search`, `view_code_item`. Writes findings to `04_security_backlog.md`.

## Context Management (Chat Windows)

### Single-Window Mode (Easy)
- **How**: Just say "Switch to Backend Agent".
- **Pros**: Maintains all history, easy flow.
- **Cons**: Context window fills up, model might get confused.

### New-Window Mode (Recommended for Deep Work)
- **How**: User opens a **New Chat**, pastes the bootstrap prompt from `BOOTSTRAP_PROMPTS.md`.
- **Pros**: Fresh context, focused model, no distractions.
- **Procedure**:
    1. Manager (Window A) defines tasks in `directives/`.
    2. User opens Window B (Backend), C (Frontend), D (QA), E (Security).
    3. Agents work and update `directives/`.
    4. Manager (Window A) reads updates and plans next steps.

## Inter-Agent Communication: The "File-Based Hand-off"

Since agents are in separate chat windows, they do not "talk" directly. They use `directives/` as a digital whiteboard.

### 1. Direct Backlog Editing (Fast)
- **QA → Backend**: When QA finds a bug, add to `01_backend_backlog.md` under `### 🐞 Bug Fixes`.
- **Backend → Frontend**: When backend is ready, update `02_frontend_backlog.md`.
- **Security → Backend**: When Security finds a vulnerability, add `**BLOCKED**` to `01_backend_backlog.md`.

### 2. The Coordinator's Role (Big Picture)
- If a change affects multiple domains, the Agent reports to the User.
- The Coordinator updates `00_master_plan.md` and cascades to all backlogs.

### 3. "Blocked" Flags
- If an agent cannot proceed, add `**BLOCKED**` to its directive status.
- Security Agent can block any deployment with Critical/High findings.

### Backend & QA (dfx/Testing)
- **Problem**: `dfx` requires a Linux environment (WSL). The AI agent operates in Windows.
- **Workflow**:
    1. **Agent**: Writes code using Windows paths.
    2. **Agent**: Formulates exact `dfx` commands.
    3. **User**: Runs in WSL with output redirect:
        - Backend: `[command] 2>&1 | tee .tmp/backend.log`
        - QA: `[command] 2>&1 | tee .tmp/qa.log`
        - Security: `[command] 2>&1 | tee .tmp/security.log`
    4. **Agent**: Reads their respective log using `view_file`.

## Directory Structure
- `directives/`: The "Brain". State and instructions.
- `execution/`: The "Hands". Scripts and tools.
- `backend/`: Source code (Backend).
- `frontend/`: Source code (Frontend).
- `.tmp/`: Scratchpad and logs.

## 🏗️ Added: Browser Tunnel Protocol
- The browser subagent is bridged to Windows via socat on port 9222.
- Ensure WIN_IP is correctly mapped in ~/.bashrc to 172.27.32.1.
