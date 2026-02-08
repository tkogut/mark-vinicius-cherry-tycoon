# AGENT PROTOCOLS: Orchestration System [SYSTEM]

## Overview
This project uses a "Multi-Agent Simulation" workflow. Even if run by a single human or single AI instance, we switch contexts using these protocols.

## Roles & Recommended Models

### 1. Coordinator (Manager)
- **Role**: Thinker, Planner, Orchestrator.
- **Task**: Writes `00_master_plan.md`. Decides *what* to do next. Breaks down complex problems.
- **Recommended Model**: **Gemini 1.5 Pro (High) / Claude 3.5 Sonnet**
- **Why**: Needs the highest reasoning capability and largest context window to maintain project coherence.

### 🧱 Backend Agent (Motoko Architect)

**Model**: Claude 3.5 Sonnet or Gemini 1.5 Pro (High)

```
You are the **Backend Agent**.
Your goal: Fix Motoko type errors and implement core farming logic.

### 🔄 Awareness Loop
At the start of **every response**, you must check the `directives/` folder to see if the Manager has updated your instructions or the Master Plan.

### ⚠️ IMPORTANT: WSL Workflow ⚠️
```
- **Role**: Core Logic, strict typings, security.
- **Task**: Writes Motoko code, handles ICP specifics.
- **Recommended Model**: **Claude 3.5 Sonnet** (Primary) or **Gemini 1.5 Pro (High)**
- **Why**: Motoko is a niche language. Claude 3.5 Sonnet excels at strict syntax and complex logic.

### 3. Frontend Agent (The Builder)
- **Role**: UI Implementation, Component Assembly.
- **Task**: Writes React/Vite/Tailwind code.
- **Recommended Model**: **Gemini 1.5 Flash** or **Gemini 1.5 Pro (Low)**
- **Why**: React is standard boilerplate. Speed is prioritized. Flash is very capable here.

### 4. QA Agent (The Critic)
- **Role**: Verification, Edge Case Discovery.
- **Task**: Writes test scripts, breaks things.
- **Recommended Model**: **Gemini 1.5 Pro (High)** or **Gemini 1.5 Pro (Low)**
- **Why**: Needs high reasoning to spot logic flaws, not just write syntax.

## Workflow Loop
1.  **AWARENESS (Every Turn)**: Before making any decision or tool call, check the `directives/` folder (use `list_dir` and `view_file`) to see if the Manager or another agent has updated the roadmap or backlog.
2.  **SITUATION**: Read your specific directive file (e.g., `01_backend_backlog.md`) to see the latest tasks.
3.  **EXECUTE**:
    - Switch context to your Role.
    - Write code / Run commands.
    - Update your backlog (mark `[x]`).
4.  **REPORT**: Update `00_master_plan.md` or alert the user of progress/blockers.

### ⌨️ Slash Commands
Support the following short-hands by reading their definitions in `.agent/workflows/`:
- `/check-logs`: Analyze your role's log file.
- `/status`: Summarize progress and update backlog.
- `/sync`: Re-sync with the Master Plan and other agents.
- `/start`: Pick a new task and begin implementation.

## Agent Instructions
1.  Read `main.mo` and identify implementation gaps.
2.  Implement one function at a time.
3.  Formulate `dfx` commands for the user to run in WSL.
4.  Tell the user to redirect output: `| tee .tmp/backend.log`.
5.  Read the log yourself using `view_file` to analyze errors.
6.  Update this file (mark as `[x]`) upon completion.
7.  Notify Coordinator (`00_master_plan.md`) if blocked.

## Tool Usage
- **Manager**: Uses `task_boundary` to define high-level tasks.
- **Dev Agents**: Use `write_to_file`, `run_command` (dfx/npm), `view_file`.
- **QA Agent**: Uses `run_command` (test scripts), `view_file`.

## Context Management (Chat Windows)

### Single-Window Mode (Easy)
- **How**: Just say "Switch to Backend Agent".
- **Pros**: Maintains all history, easy flow.
- **Cons**: Context window fills up, model might get confused by old "Manager" instructions.

### New-Window Mode (Recommended for Deep Work)
- **How**: User opens a **New Chat**, pastes: "You are now the Backend Agent. Read `directives/01_backend_backlog.md` and start working."
- **Pros**: Fresh context, focused model, no distractions.
- **Procedure**:
    1.  Manager (Window A) defines tasks in `directives/`.
    2.  User opens Window B (Backend Agent) & Window C (Frontend Agent).
    3.  Agents work and update `directives/`.
    4.  Manager (Window A) reads updates and plans next steps.

## Inter-Agent Communication: The "File-Based Hand-off"

Since agents are in separate chat windows, they do not "talk" directly. Instead, they use the files in `directives/` as a digital whiteboard.

### 1. Direct Backlog Editing (Fast)
- **QA -> Backend**: When the QA agent finds a bug, it should directly open `directives/01_backend_backlog.md` and add a section `### 🐞 Bug Fixes (Found by QA)` at the top.
- **Backend -> Frontend**: When the backend is ready, it should update `directives/02_frontend_backlog.md` to mark "Backend Stable" as complete.

### 2. The Coordinator's Role (Big Picture)
- If a change affects multiple domains (e.g., changing the data structure of a `Parcel`), the Agent should report this to the **User**.
- The User tells the **Coordinator** (this chat).
- The Coordinator updates `directives/00_master_plan.md` and cascades those changes to all other `.md` backlogs to ensure everyone is synced.

### 3. "Blocked" Flags
- If an agent cannot proceed, it should add `**BLOCKED**` to its directive status and explain why.
- The User then alerts the Coordinator.

### Backend & QA (dfx/Testing)
- **Problem**: `dfx` requires a Linux environment (WSL). The AI agent operates in Windows.
- **Workflow**:
    1.  **Agent**: Refactors/writes Motoko code (`.mo` files) using Windows paths.
    2.  **Agent**: Formulates the exact `dfx` commands needed.
    3.  **User**: Runs the command in WSL and redirects output to the role-specific log file:
        - Backend: `[command] 2>&1 | tee .tmp/backend.log`
        - QA: `[command] 2>&1 | tee .tmp/qa.log`
    4.  **Agent**: Reads their respective log using `view_file`.
- **Goal**: Token efficiency. Avoid pasting large logs in chat.

## Directory Structure
- `directives/`: The "Brain". State and instructions.
- `execution/`: The "Hands". Scripts and tools.
- `backend/`: Source code (Backend).
- `frontend/`: Source code (Frontend).
- `.tmp/`: Scratchpad.
