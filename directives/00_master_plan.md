# MASTER PLAN: Mark Vinicius Cherry Tycoon [COORDINATOR]

> **Current Status**: **Phase 5 Backend Complete — Ready for Frontend Implementation (Living World)**
> **Environment**: **WSL (Ubuntu)** ✅ ACTIVE — `dfx 0.24.3` working. ⚠️ Node.js not yet native in Linux — install via `nvm`.
> **Next Focus**: Phase 5 Frontend — UI Themes, Competitors Panel, Rankings
> **Security**: Proactive Security Agent active — Critical+High findings all **FIXED**. Deployment UNBLOCKED.
> **Last Updated**: 2026-02-19

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

### Phase 5: Living World (ACTIVE — Backend DONE ✅, Frontend PENDING)
- [x] **5.1 Weather + Season Sub-Phases**:
    - [x] Weather event system (`weather_logic.mo`) ✅ *IMPLEMENTED + VERIFIED 2026-02-19*
    - [x] Season sub-phases: Preparation → Growth → Harvest → Sales → OffSeason ✅
    - [x] Phase-gated actions (`advancePhase`, `advanceSeason`) ✅
    - [x] `dfx deploy backend` + E2E verification ✅ *DONE 2026-02-19*
    - [x] Weather-Based UI Themes (Frontend Agent) ✅ *DONE*
    - [x] Opole DNA county multipliers active ✅
- [x] **5.2 AI Competitors + Shared Market**:
    - [x] Marek, Kasia, Hans AI farms (`ai_logic.mo`) ✅ *DONE*
    - [x] Shared market: `Price = Base * (Demand / Total_Supply)` ✅ *DONE*
    - [x] Competitors Panel UI (Frontend Agent) ✅ *DONE*
    - [x] Market Saturation Warnings in SellModal (Frontend Agent) ✅ *DONE*
- [ ] **5.3 Frontend Living World + Animations**:
    - [x] SVG/Lottie tree growth morphing ✅ *DONE*
    - [x] Cherry particle bursts on harvest ✅ *DONE*
    - [x] Juice Meter hydration indicator ✅ *DONE*
    - [x] Micro-animations on all buttons ✅ *DONE*
    - [x] Historical Price Chart ✅ *DONE*
- [x] **5.4 Rankings + End-of-Season Summary**:
    - [x] `getLeaderboard()` query ✅ *DONE*
    - [x] Rankings Panel UI (Frontend Agent) ✅ *DONE*
    - [x] Enhanced FinancialReportModal (Frontend Agent) ✅ *DONE*
- [ ] **5.5 Foundation (i18n + Monetization)**:
    - [x] `react-i18next` framework (EN, PL, DE, ES + Asian stubs) ✅ *DONE*
    - [ ] CHERRY Credits type & balance (structure only)
    - [ ] Consumable Boosts types (Bio-Stimulant, Cloud Summoner, etc.)
    - [ ] Strategic Map Expansion types

### Phase 6: Audio System (Backend N/A, Frontend DONE ✅)
- [x] **Engine**: `howler.js` ✅
- [x] **Sound Effects**: UI & Farm Actions ✅
- [x] **Background Music**: Ambient Loops ✅

### Phase 6+: Advanced Features (Paused)
- [ ] **Football Clubs**: Deferred until core loop maturity achieved
- [ ] **Geographic Expansion**: Interactive Poland Map
- [ ] **NFT Integration**: Parcels & clubs as NFTs
- [ ] **Multi-Canister Architecture**
- [ ] **DAO Governance**

## Active Directives (Delegate Tasks)

| Domain | Assigned To | Directive File | Status |
| :--- | :--- | :--- | :--- |
| **Backend** | Backend Agent | `directives/01_backend_backlog.md` | **ACTIVE** — Phase 0 cleanup, then Phase 5 |
| **Frontend** | Frontend Agent | `directives/02_frontend_backlog.md` | **ACTIVE** — Phase 0 cleanup, then Phase 5 |
| **QA** | QA Agent | `directives/03_qa_checklist.md` | **ACTIVE** — Verify Phase 0, prepare Phase 5 tests |
| **Security** | Security Agent | `directives/04_security_backlog.md` | **NEW** — Baseline audit + proactive review |

## Inter-Agent Communication
- **Coordinator**: Monitor this file. Update roadmap. Assign tasks to domain backlogs.
- **Backend Agent**: Check `01_backend_backlog.md`. Execute tasks. Report blockers.
- **Frontend Agent**: Check `02_frontend_backlog.md`. Execute tasks.
- **QA Agent**: Check `03_qa_checklist.md`. Run tests. Report failures.
- **Security Agent**: Check `04_security_backlog.md`. Review commits. Block on Critical/High findings.
- **Security Policy**: `directives/SECURITY_DIRECTIVE_V1.md` — all agents must comply.
