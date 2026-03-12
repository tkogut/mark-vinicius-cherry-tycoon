# MASTER PLAN: Mark Vinicius Cherry Tycoon [COORDINATOR]

> **Current Status**: **Phase 9.0 Frontend Implementation — ACTIVE 🎨**
> **Environment**: **WSL (Ubuntu)** ✅ ACTIVE — `dfx 0.24.3` + `Motoko 0.30.2` (EOP) working.
> **Protocol**: **Remote Browser** via Port 9222 (Profile: `roostertk`).
> **Dual-Entrypoint**: `main.mo` (Playground) / `main_mainnet.mo` (Mainnet) strictly maintained.
> **Last Updated**: 2026-03-11

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

### 🟢 IRON FOUNDATION STAGE (COMPLETE ✅)
> The core "Headless" backend is now a fully decoupled, secure "Single Source of Truth".
> - **API Lock**: `initializePlayer` is strictly `(text, text)`.
> - **Parity**: 100% logic alignment between `main.mo` and `main_mainnet.mo`.
> - **Scalability**: Incremental Ledger / Pre-computed Cache implemented for O(1) performance.
> - **Math**: Integer precision math verified across all economy modules.

#### Phase 5.7: Mechanics Deepening (DONE ✅)
- [x] Backend logic: Bulk Supply, Phase-based Watering, Contracts, Machine Decay.
- [x] Economic Stability: "Death Spiral" fixed and verified.

#### Phase 5.9: Security Excellence (DONE ✅)
- [x] **SEC-019**: All 23 anonymous principal guards in `main_mainnet.mo` restored.
- [x] **SEC-020**: Legacy `buySupplies` ghost function purged.

#### Phase 6.1: Competitive Foundation (DONE ✅)
- [x] Global Leaderboards with Prestige Scoring implemented.
- [x] O(1) Scalability Patch: Incremental updates via `topPlayersCache`.

#### Phase 7.0: The Living World (COMPLETE ✅)
- [x] **Event System Architecture**: Modular trigger logic for random occurrences.
- [x] **Weather Encounters**: Direct backend impact on farm state via specialized events.
- [x] **Trigger Logic**: Weighted probability tables for seasonal events.
- [x] **Crop Insurance**: Payout and reset logic implementation.

### Phase 8.0: The Competitive Pool (COMPLETE ✅)
- [x] **`auction_logic.mo`**: New module — Pre-Season Futures, Post-Harvest Auctions, Shortfall Logic, Flood Factor.
- [x] **Type Definitions**: `AuctionContract`, `Bid`, `ContractStatus`, `ContractCategory` in `types.mo`.
- [x] **API Surface**: 4 new public endpoints in both `main.mo` and `main_mainnet.mo`.
- [x] **AI Archetypes**: Marek (undercutter), Kasia (bio-specialist), Hans (trap logic) bidding behavior.
- [x] **Math**: V_bid formula with scaled-integer precision. Market Saturation (Flood Factor) and Recovery implemented.

### Phase 9.0: Frontend Implementation (TODO ⭕)
- [ ] Build the UI layer for 5.7, 6.1, 7.0, and 8.0 once Backend is "Feature Complete".

### Phase 10.0: Sports Patron (District League) (DEFERRED — Endgame)
> **Deferred** by Producer directive. Implement after Phase 8.0 auction engine is verified.
- [ ] **GDD Integration**: Map `gdd_sports_patron.md` to backend logic.
- [ ] **Team Power Index (TPI)**: Implement squad simulation math.
- [ ] **Local Reputation**: Link football results to Orchard prestige and labor costs.

## Active Directives (Delegate Tasks)

| Domain | Assigned To | Directive File | Status |
| :--- | :--- | :--- | :--- |
| **Backend** | Backend Agent | `.agent/rules/01_backend_backlog.md` | **COMPLETE** — Phase 8.0 Competitive Pool implemented. |
| **Frontend** | Frontend Agent | `.agent/rules/02_frontend_backlog.md` | **PAUSED** — On hold for Headless-First Strategy |
| **QA** | QA Agent | `.agent/rules/03_qa_checklist.md` | **ACTIVE** — Verify Phase 6.1 Leaderboard logic via Candid |
| **Security** | Security Agent | `.agent/rules/04_security_backlog.md` | **ACTIVE** — Monitoring for new Phase 7 commits |

## Inter-Agent Communication
- **Coordinator**: Monitor this file. Update roadmap. Assign tasks to domain backlogs.
- **Backend Agent**: Check `01_backend_backlog.md`. Execute tasks. Report blockers.
- **Frontend Agent**: Check `02_frontend_backlog.md`. Execute tasks.
- **QA Agent**: Check `03_qa_checklist.md`. Run tests. Report failures.
- **Security Agent**: Check `04_security_backlog.md`. Review commits. Block on Critical/High findings.
- **Security Policy**: `.agent/rules/SECURITY_DIRECTIVE_V1.md` — all agents must comply.
