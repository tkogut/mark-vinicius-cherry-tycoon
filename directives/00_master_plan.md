# MASTER PLAN: Mark Vinicius Cherry Tycoon [COORDINATOR]

> **Current Status**: **Phase 0 — Close Out Phase 2.5 (Pre-req for Phase 5)**
> **Environment**: **WSL (Ubuntu)** — See `SETUP_WSL.md` & `DEV_PROGRESS_REPORT.md`
> **Next Focus**: Phase 5 — Living World (Weather, AI Competitors, Animations, Rankings)
> **Security**: Proactive Security Agent active — reviews all backend commits
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

### Phase 0: Close Out Phase 2.5 (ACTIVE — PRE-REQUISITE)
- [ ] **Backend Verification**: Test ALL functions via `dfx canister call`
- [ ] **Error Handling**: Verify error toasts for seasonal restrictions
- [ ] **Code Cleanup**: Remove temporary debug logs
- [x] **Caffeine Purge**: Remove ALL legacy mentions across codebase ✅ *DONE 2026-02-17*
- [ ] **Security Baseline**: Initial full codebase security audit

### Phase 5: Living World (NEXT — After Phase 0)
- [ ] **5.1 Weather + Season Sub-Phases** (Parallel):
    - [ ] Weather event system (`weather_logic.mo`)
    - [ ] Season sub-phases: Preparation → Growth → Harvest → Sales → OffSeason
    - [ ] Phase-gated actions
    - [ ] Weather-Based UI Themes
    - [ ] Opole DNA county multipliers active
- [ ] **5.2 AI Competitors + Shared Market**:
    - [ ] Marek, Kasia, Hans AI farms (`ai_logic.mo`)
    - [ ] Shared market: `Price = Base * (Demand / Total_Supply)`
    - [ ] Competitors Panel UI
    - [ ] Market Saturation Warnings in SellModal
- [ ] **5.3 Frontend Living World + Animations**:
    - [ ] SVG/Lottie tree growth morphing
    - [ ] Cherry particle bursts on harvest
    - [ ] Juice Meter hydration indicator
    - [ ] Micro-animations on all buttons
    - [ ] Historical Price Chart
- [ ] **5.4 Rankings + End-of-Season Summary**:
    - [ ] `getLeaderboard()` query
    - [ ] Rankings Panel UI
    - [ ] Enhanced FinancialReportModal
- [ ] **5.5 Foundation (i18n + Monetization)**:
    - [ ] `react-i18next` framework (EN, PL, DE, ES + Asian stubs)
    - [ ] CHERRY Credits type & balance (structure only)
    - [ ] Consumable Boosts types (Bio-Stimulant, Cloud Summoner, etc.)
    - [ ] Strategic Map Expansion types

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
