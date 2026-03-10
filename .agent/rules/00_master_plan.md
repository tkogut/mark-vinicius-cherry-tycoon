# MASTER PLAN: Mark Vinicius Cherry Tycoon [COORDINATOR]

> **Current Status**: **Phase 5.8 Advanced Economic Stress Testing — COMPLETE ✅**
> **Environment**: **WSL (Ubuntu)** ✅ ACTIVE — `dfx 0.24.3` + `Motoko 0.30.2` (EOP) working.
> **Protocol**: **Remote Browser** via Port 9222 (Profile: `roostertk`).
> **Dual-Entrypoint**: `main.mo` (Playground) / `main_mainnet.mo` (Mainnet) strictly maintained.
> **Last Updated**: 2026-03-09

## High-Level Roadmap

### Phase 1: Stabilization (Complete ✅)
- [x] **Setup**: Local environment with dfx and Motoko.
- [x] **Migration**: Moved code from legacy. **All legacy references purged.**
- [x] **Backend Fixes**: Type errors fixed, `assignParcelToPlayer` implemented.
- [x] **Core Logic**: `harvestCherries`, `plantTrees`, etc. implemented and verified.
- [x] **Economy**: `buyParcel`, `sellCherries` implemented.
- [x] **Persistence**: Stable storage verified.

### Phase 2/2.5: MVP & Integration (Complete ✅)
- [x] **Auth Layer**: `useAuth` hook with `@dfinity/auth-client`.
- [x] **Canister Integration**: UI connected to backend.
- [x] **Dashboard**: Sidebar, FarmGrid, InventoryBar.
- [x] **Action Modals**: Plant, Water, Fertilize, Sell.
- [x] **State Management**: React Query optimistic updates.
- [x] **Frontend Debugging**: JSON-RPC serialization fix.
- [x] **E2E Testing**: Backend verified via scripts.

### Phase 3: Surface the Simulation (Complete ✅)
- [x] **Frontend**: Soil Type, pH, Fertility on Parcel Cards.
- [x] **Backend**: `getPlayerFarm` returns full parcel attributes.
- [x] **UI**: Yield modifier tooltips implemented.

### Phase 4: Economy & Infrastructure (Complete ✅)
- [x] GDD-compliant infrastructure types & costs.
- [x] Labor efficiency and quality modifiers.
- [x] Seasonal spoilage and storage protection.
- [x] Organic certification lifecycle & premiums.
- [x] Server-side economy logic (multiplayer prep).
- [x] Infrastructure Shop (Marketplace.tsx).

### Phase 0: Close Out Phase 2.5 (✅ COMPLETE)
- [x] **Backend Verification**: All 22 functions verified ✅ *DONE 2026-02-19*
- [x] **Error Handling**: Seasonal restriction errors verified ✅ *DONE 2026-02-19*
- [x] **Code Cleanup**: No `Debug.print` in backend ✅ *CONFIRMED 2026-02-19*
- [x] **Caffeine Purge (Source)**: All `.mo`/`.ts`/`.tsx` files — CLEAN ✅ *DONE 2026-02-17*
- [x] **Dual Entrypoint Parity**: Identical API surface ✅ *CONFIRMED 2026-02-19*
- [x] **Node.js gap identified**: Native Linux node not installed — install via `nvm` before frontend work
- [ ] **Security Baseline**: `npm audit` pending (blocked on native Node.js install in WSL)

### 🔴 STRATEGIC SHIFT: HEADLESS-FIRST (Backend-Heavy)
> The Producer has mandated a "Headless-First" focus. The UI layer (Frontend) will pause development until the underlying backend mathematical logic and content systems (Phases 5-7) are **feature-complete and security audited**. 
> - **Immutable Rules:** Dual-entrypoint mirroring is absolute. `initializePlayer` signature MUST remain `(text, text)`. All math is STRICT integer precision (zero floating point).

### Phase 5.7: Mechanics Deepening (DONE ✅)
- [x] Backend logic complete (Bulk Supply, Drought Watering, Contracts, Machine Decay).

### Phase 5.9: Security Exploitation Audit (ACTIVE — Security Agent PENDING)
- [ ] Audit Phase 5.7 Backend code for double-spend, integer wrap, and market price manipulation vulnerabilities.

### Phase 6.1: Competitive Foundation (ACTIVE — Backend Agent PENDING)
- [ ] Global Leaderboards & Prestige Score Implementation (Refer to `.agent/plans/002_Phase_6_1_Leaderboards.md`)

### Phase 7.0: Content Deepening (Upcoming)
- [ ] Random backend events & specific weather encounters.

### Phase 7.5: Frontend Execution (Paused)
- [ ] Build the UI layer for 5.7, 6.1, and 7.0 once the backend canister ecosystem is rock solid.

## Active Directives (Delegate Tasks)

| Domain | Assigned To | Directive File | Status |
| :--- | :--- | :--- | :--- |
| **Backend** | Backend Agent | `.agent/rules/01_backend_backlog.md` | **ACTIVE** — Implement Phase 6.1 Leaderboards |
| **Frontend** | Frontend Agent | `.agent/rules/02_frontend_backlog.md` | **PAUSED** — On hold for Headless-First Strategy |
| **QA** | QA Agent | `.agent/rules/03_qa_checklist.md` | **PAUSED** — Awaiting Phase 6/7 Backend deployments |
| **Security** | Security Agent | `.agent/rules/04_security_backlog.md` | **ACTIVE** — Audit Phase 5.7 (Phase 5.9 Focus) |

## Inter-Agent Communication
- **Coordinator**: Monitor this file. Update roadmap. Assign tasks to domain backlogs.
- **Backend Agent**: Check `01_backend_backlog.md`. Execute tasks. Report blockers.
- **Frontend Agent**: Check `02_frontend_backlog.md`. Execute tasks.
- **QA Agent**: Check `03_qa_checklist.md`. Run tests. Report failures.
- **Security Agent**: Check `04_security_backlog.md`. Review commits. Block on Critical/High findings.
- **Security Policy**: `.agent/rules/SECURITY_DIRECTIVE_V1.md` — all agents must comply.
