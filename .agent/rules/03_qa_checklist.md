# QA AGENT: Mark Vinicius Cherry Tycoon [QA] Keep always the name of chat as "QA Agent"

> **Current Directive**: **Phase 8.0 Competitive Pool — ACTIVE. Auction API verified ✅.** Test suite added for 4 new endpoints.
> **Constraint**: **WSL Terminal Required** — You CANNOT run `dfx` or `npm` commands. Formulate commands and ask the **User** to execute in WSL. Redirect: `COMMAND 2>&1 | tee .tmp/qa.log`.
> **Architecture**: **Dual Entrypoint** — Both `main.mo` (Playground) and `main_mainnet.mo` (Mainnet/EOP) must build successfully.
> **Last Updated**: 2026-03-10

## Backlog

### 🔴 Phase 0: Verify Baseline (FIRST)
- [ ] **Run Full E2E**: `bash execution/phase0_verify.sh 2>&1 | tee .tmp/phase0.log` — all-in-one Phase 0 test (deploy + lifecycle + phase system + economy)
- [x] **Dual Entrypoint Build**: VERIFIED — `main.mo` and `main_mainnet.mo` have identical API surface ✅ *CONFIRMED 2026-02-19*
- [ ] **Verify Seasonal Restrictions**: Covered in `phase0_verify.sh` section 4
- [x] **Legacy Reference Check**: Source grep clean — zero results in .mo/.ts/.tsx ✅ *DONE 2026-02-17*
- [ ] **Dependency Audit**: Ask User to run `npm audit` in WSL — requires native Node.js install first

### 🟡 Phase 7.0: Living World Tests
- [x] **`verify_living_world.sh`**: ✅ *VERIFIED 2026-03-10*
  - [x] Verify event generation: Disease (Spring), Pests (Summer), Flood (Autumn)
  - [x] Verify mitigation: Sprayers successfully mitigate Disease/Pests ✅
  - [x] Verify catastrophic event payout: Frost/Flood trigger 5000 PLN/parcel ✅
  - [x] Verify insurance annual reset: Reset to false in Year 2 Spring ✅
  - [x] Verify `purchaseCropInsurance` cost and state update ✅

### 🔴 Phase 8.0: The Competitive Pool Tests (ACTIVE — PRIORITY 1)
> **Verified in this session**: `test_phase8_auctions.sh` → ✅ 9/9 PASSED 2026-03-10

- [x] **`test_phase8_auctions.sh`** — 9/9 PASS ✅ *VERIFIED 2026-03-10*
  - [x] `getActiveContracts` returns Ok from any authenticated caller ✅
  - [x] `commitPreSeasonFuture` rejected outside `#Planning` phase ✅
  - [x] `submitAuctionBid` rejected outside `#Market` phase ✅
  - [x] Advanced to `#Market` phase successfully ✅
  - [x] `submitAuctionBid` rejected — no contracts loaded, no inventory ✅
  - [x] `resolveSeasonAuctions` rejected outside `#Storage` phase ✅
  - [x] `resolveSeasonAuctions` completes cleanly with no active contracts ✅
  - [x] `getActiveContracts` stable after Storage phase ✅

- [ ] **[TODO] Integration test — full Pre-Season Future lifecycle**:
  - Seed `stableAuctionContracts` via admin → commit → harvest → shortfall → check buyback
- [ ] **[TODO] Integration test — Post-Harvest closed-bid auction win**:
  - Load player inventory → submit bid at base − 10% →  verify revenue credited + contract `#Fulfilled`
- [ ] **[TODO] AI archetype gate test**:
  - Hans: `stableHansStorage < 120%` → no bid injected
  - Kasia: Export contract → Kasia returns null bid
  - Marek: Bio contract → Marek returns null bid
- [ ] **[TODO] Flood Factor degradation test**:
  - Submit losing bid → verify `stableSpotPrice` decreased

### 🟣 Phase 10.0: Sports Patron Tests (DEFERRED — Endgame)
> **Status**: Deferred by Producer directive. Tests pending until `patron_logic.mo` is implemented.
- [ ] **[FUTURE] `test_patron_logic.sh`**:
  - Verify Team Power Index (TPI) calculation
  - Verify Match Outcome probabilities
  - Verify Local Reputation impact on labor costs
  - Verify Prestige score integration

### 🟠 Phase 5.1: Weather & Sub-Phase Tests
- [ ] **[NEW] `test_weather_system.sh`**:
  - Verify event generation across all 4 seasons
  - Verify infrastructure mitigation (Sprayer prevents pest damage)
  - Verify phase gating (cannot harvest during Growth, cannot plant during Harvest)
  - Verify Opole county multipliers apply correctly per region

### 🟡 Phase 5.2: AI Competitor Tests
- [ ] **[NEW] `test_ai_competitors.sh`**:
  - Verify AI farm initialization (3 archetypes: Marek, Kasia, Hans)
  - Verify seasonal AI decisions execute without errors
  - Verify shared market price impact (prices drop when AI floods supply)
  - Verify each archetype's personality-driven behavior

### 🟢 Phase 5.4: Rankings Tests
- [ ] **Verify `getLeaderboard()`**: Returns valid rankings with player + AI farms
- [ ] **Verify Sort Order**: Profit, Value, Efficiency sortable

### 🟡 Phase 5.6: Activity-Based Turn System
- [x] **[NEW] `test_phase5_6.sh`**: ✅ *VERIFIED 2026-03-10*
  - [x] Verify linear 10-turn sequence and `advancePhase` logic.
  - [x] Verify strict phase/action locks (e.g., `harvestCherries` ONLY in `#Harvest`).
  - [x] Verify `#CutAndPrune` logic.

### 🟣 Phase 5.7: Economy & Mechanics Deepening
- [x] **[NEW] `test_phase5_7.sh`**: ✅ *VERIFIED 2026-03-10*
  - [x] Verify Phase Gating: `waterParcel` in Procurement/Investment/Growth only.
  - [x] Verify Bulk Supplies discount and purchase limits.
  - [x] Verify Forward Contracts logic and commitment fees.
  - [x] Verify `inspectAndRepair` mechanic to prevent infrastructure degradation.
  - [x] Verify `purchaseMarketForecast`.
  - [x] Verify atomic state preservation during `advancePhase` (Emergency labor fallback).

### ⚪ Phase 5.8: Advanced Economic Stress Testing
- [x] **[NEW] Multi-year Stress Test**: ✅ *VERIFIED 2026-03-10*
  - [x] Verify Multi-year survival proof (Year 4 sustainability).
  - [x] Review Dual-Entrypoint logic parity audit.
  - [x] Verify Victorian Insight Generation (Fiscal Hemorrhage).

### 🔵 Security Coordination
- [ ] **Coordinate with Security Agent**: Share test results from `.tmp/qa.log`
- [ ] **Run Security Test Script**: Ask User to execute `execution/tests/test_security_audit.sh` in WSL — log to `.tmp/security.log`

---

### ✅ Completed (Archive)

<details>
<summary>Previous Phases</summary>

- [x] Verify `assignParcelToPlayer`, `harvestCherries`, Persistence
- [x] `e2e_backend.sh` passing, `integration_tests.ts` passing, `useAuth.test.tsx` 6/6
</details>

## Agent Instructions
1. Monitor Backend Agent progress.
2. Create test scripts in `execution/tests/`.
3. **⚠️ WSL Constraint**: You CANNOT run `dfx` or `npm` commands. Formulate exact commands and ask the **User** to run in WSL: `COMMAND 2>&1 | tee .tmp/qa.log`.
4. Read the log yourself using `view_file` to analyze test results.
5. **Dual Entrypoint**: Verify both `main.mo` and `main_mainnet.mo` compile and expose the same API.
6. Log bugs in `.agent/rules/01_backend_backlog.md` (add "Bug Fix" tasks).
7. **Share findings** with Security Agent via `04_security_backlog.md`.
8. Update the checklist as you complete tasks.
