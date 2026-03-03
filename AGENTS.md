# MASTER_ONBOARDING_V1

## 1. Mission Briefing

* **Project Name**: Mark Vinicius Cherry Tycoon
* **Objective**: A cinematic, high-fidelity idle management game with deep mechanical simulation. It emphasizes a "Vibe-First," highly tactile "Neo-Steampunk Cherry" aesthetic.
* **Tech Stack**:
  * **Backend**: Motoko (Internet Computer native actor)
  * **Frontend**: React, Vite, TypeScript
  * **Styling**: Tailwind CSS & scoped CSS for specific visual effects
  * **Operations**: Antigravity 2026 Native Orchestration Framework

## 2. Orchestration Framework Map

### The Brain (`.agent/rules/`)
These are the foundational 'Always-On' rules that govern every action taken by the AI agents:
* **Math-Consistency Rule (`math_consistency.md`)**: Enforces deterministic economic formulas (Yield, Shared Market) and strict safe arithmetic policies.
* **Anti-Split-Brain Protocol (`agent_protocols.md`)**: Mandates that file-based directives and internal UI Task Lists are updated symmetrically.
* **UI Consistency Rule (`ui-consistency.md`)**: Enforces "Neo-Steampunk Cherry" aesthetics, dynamic lighting, and interactive 'Juice' rules.
* **Security Gatekeeper (`security_directive.md`)**: Defines proactive auditing against 7 key web3 and architecture domains.

### The Skills (`.agent/skills/`)
Reusable implementations for specific visual and technical tasks:
* **Particle Engine (`particle-engine.md`)**: A React + Canvas/Three.js overlay system dynamically theming cinematic effects (e.g., *CherryBlossom*, *GoldenPollen*, *SteamSparks*) with `pointer-events-none` overlays to ensure UI interactivity.

### The Workflows (`.agent/workflows/`)
Slash commands representing repeatable processes available to the orchestration team:
* `/bootstrap-[role]`: Specialized initialization for Manager, Backend, Frontend, QA, or Security agents.
* `/visualize-lore`: Guides the creation of mathematically grounded concept art via Nano Banana.
* `/ui-mockup`: Backlog-driven layout generation mapped to our existing game lore.
* `/playtest-ui`: UX/Psychology critique audit (Validates interactive 'Juice' and structural logic).

## 3. Data Integrity & Sync

* **Source of Truth**: All progress, updates, and task completions MUST be updated in BOTH the file-based directives (`directives/`) and the internal Antigravity Task List (`task.md`). This symmetry prevents conflicting states ("split-brain").
* **Math Formulas**: Strict adherence to the provided Yield Calculation and Shared Market constraints (`.agent/rules/math_consistency.md`) is mandatory for all code generation. No agent should invent arbitrary scaling logic.

## 4. Operational Entry Points

Standardized scripts exist in the `scripts/` directory for local development and CI testing:
* **Local Deployment**: Use `./scripts/start.sh` to boot the local replica, deploy the backend, and spin up the Vite frontend.
* **Auditing & QA**: Use `./scripts/test.sh` for economy checks and security audits directly linked to your Motoko testing framework.
* **Frontend Verification**: Use `./scripts/verify-ui.sh` to mock a CI build check for styling and unhandled TS compile errors.
