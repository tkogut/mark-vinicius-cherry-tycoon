# BACKEND AGENT: Mark Vinicius Cherry Tycoon [BACKEND]

> **Current Directive**: **Phase 5.8 Stress Test COMPLETE. Resuming Phase 5.7 Mechanics Deepening.**
> **Constraint**: **WSL Terminal Required** - Use Windows path for files, but User executes `dfx` and `npm` commands in WSL terminal manually.
> **Architecture**: **Dual Entrypoint** - `main.mo` (Playground) + `main_mainnet.mo` (Mainnet). **STRICT PARITY REQUIRED.**
> **Protocol**: **Remote Browser** via Port 9222 (Profile: `roostertk`).
> **Last Updated**: 2026-03-09

## Backlog

### 🔴 Phase 0: Close Out Phase 2.5 (FIRST — Pre-requisite)
- [x] **Full Function Verification**: All 22 public functions verified via `dfx canister call` ✅ *DONE 2026-02-19*
- [x] **Error Handling Verification**: `#SeasonalRestriction` errors verified for harvest (Spring) and fertilize (Summer) ✅ *DONE 2026-02-19*
- [x] **Code Cleanup**: No `Debug.print` statements found in backend ✅ *CONFIRMED 2026-02-19*
- [x] **Legacy Purge**: Remove ALL legacy references from codebase & docs — replace with "JaPiTo Group" ✅ *DONE 2026-02-17*
- [x] **Dual Entrypoint Parity**: `main.mo` and `main_mainnet.mo` expose identical public API ✅ *CONFIRMED 2026-02-19*
- [x] **Baseline Green**: Full E2E tests passed — all 22 functions verified, 0 failures ✅ *DONE 2026-02-19*

### 🟠 Phase 5.1: Weather Events + Season Sub-Phases
- [x] **[NEW] `weather_logic.mo`**: Weather event system ✅ *DONE (prior session + pest events 2026-02-19)*
  - `generateWeatherEvent(season, region)` with probability tables per season
  - Spring: Late Frost (15%), Heavy Rain (20%), **Monilinia (15%)**
  - Summer: Drought (20%), Heatwave (15%), Hailstorm (5%), **Cherry Fruit Fly (20%)**
  - Autumn: Early Frost (10%), Storm (15%)
  - Winter: Deep Freeze (25%)
- [x] **Season Sub-Phases**: `SeasonPhase` type in `types.mo` ✅ *DONE (prior session)*
  - `#Preparation | #Growth | #Harvest | #Sales | #OffSeason`
- [x] **Phase-Gated Actions** in `main.mo` + `main_mainnet.mo` ✅ *DONE 2026-02-19*
  - `#Preparation`: plantTrees, upgradeInfrastructure
  - `#Growth`: waterParcel, fertilizeParcel
  - `#Harvest`: harvestCherries (+ weather impact on yield)
  - `#Sales`: sellCherries
- [x] **`advancePhase()`**: Function to step through sub-phases ✅ *DONE (prior session)*
- [x] **Integrate Weather**: `applyWeatherImpact()` applied to harvest yield ✅ *DONE 2026-02-19*
- [x] **Opole DNA**: County multipliers (Głubczyce 1.10x, Opole 1.08x, Namysłów 1.05x) in `calculateYieldPotential` ✅ *DONE 2026-02-19*

### 🟡 Phase 5.2: AI Competitors + Shared Market
- [x] **[NEW] `competitor_logic.mo`**: AI competitor engine ✅ *DONE 2026-02-19*
  - **Marek "The Traditionalist"** (Głubczyce, GL_02): Mass producer, low risk, crashes wholesale
  - **Kasia "The Eco-Visionary"** (Namysłów, NM_01): 100% organic, retail prestige, premium pricing
  - **Hans "The Aggressor"** (Opole, OP_CITY): High-tech scaler, outbids export contracts
- [x] **`simulateAITurn()`**: AI makes seasonal decisions (deterministic LCG) ✅ *DONE 2026-02-19*
- [x] **Shared Market Formula**: `Price = Base * clamp(Demand / (Player+AI+Baseline), 0.5, 1.0)` — price floor enforced ✅ *DONE 2026-02-19*
- [x] **`getCompetitorSummaries()`**: Query returning AI farm states ✅ *DONE 2026-02-19*
- [x] **`getLeaderboard()`**: Query returning player+AI farms sorted by revenue ✅ *DONE 2026-02-19*
- [x] **Integrate**: AI turns simulated in `advanceSeason()` response; AI supply in `sellCherries()` pricing ✅ *DONE 2026-02-19*
- [x] **Dual Entrypoint Parity**: All functions added to both `main.mo` and `main_mainnet.mo` ✅ *DONE 2026-02-19*

### 🟢 Phase 5.6: Activity-Based Turn System (CRITICAL REFACTOR)
- [x] **Redefine `SeasonPhase`**: Implement 10 unique phases in `types.mo` (Hiring, Procurement, Investment, Growth, Harvest, Market, Storage, CutAndPrune, Maintenance, Planning). ✅ *DONE*
- [x] **Unified Turn Logic**: Overhaul `advancePhase()` to handle the linear 10-turn sequence. Remove `advanceSeason()` as a standalone caller. ✅ *DONE*
- [x] **Strict Action Gating**: Implement seasonal/phase locks for all public functions (e.g., `harvestCherries` ONLY in `#Harvest`). ✅ *DONE*
- [x] **`cutAndPrune()`**: Implement the new activity logic for the `#CutAndPrune` phase. ✅ *DONE*
- [x] **Dual Entrypoint Parity**: Apply these changes to both `main.mo` and `main_mainnet.mo`. ✅ *DONE*
- [x] **Motoko 0.30.2 Compliance**: Updated `stable` to `transient` for persistent actor state management. ✅ *DONE 2026-03-05*
- [x] **Handshake Verified**: Dual-Entrypoint and Math-Consistency checked using respective .agent/skills/. ✅ *DONE 2026-03-05*

---

### 🔵 Phase 5.7: Phase Engagement & Mechanics Deepening
- [x] **Hiring Phase Rework (Spring)**: Introduce a Hybrid Cost Model for labor (`#Village`, `#Standard`, `#City`). Upfront retainer fees in `#Hiring` + per kg costs at `#Harvest`. Auto-assign punishing `#Emergency` labor if skipped. (Backend Logic Complete)
- [x] **Spring Watering**: `waterParcel` now phase-gated to `#Procurement | #Investment | #Growth` (was erroneously season-gated). Enables early drought combat. ✅ *DONE 2026-03-10*
- [x] **Bulk Supply (`purchaseSupplies`, `#Procurement`)**: Market price fluctuations via `inputMarket`. Bulk discount tiers (qty≥20 → 10%, qty≥50 → 20%). Max 100 units/call. ✅ *DONE 2026-03-10*
- [x] **Forward Contract Negotiation (`negotiateForwardContract`, `#Market`)**: Lock-in contracts with Marek (wholesale), Kasia (organic retail), Hans (export). 5% commitment fee. Revenue credited immediately. ✅ *DONE 2026-03-10*
- [x] **Machine Degradation (`inspectAndRepair`, `#Maintenance`)**: Pay 500 PLN/infra-level to prevent degradation. Sentinel stored in `maintenanceCost` field. Skip = degradation on next advance. ✅ *DONE 2026-03-10*
- [x] **Market Forecasting (`purchaseMarketForecast`, `#Planning`)**: 2000 PLN for `ForecastReport` with weather warnings + price range for next season. Deterministic seed = `(seasonNumber + 1) % 100`. ✅ *DONE 2026-03-10*
- [x] **Phase 5.8: Advanced Economic Stress Testing**:
    - [x] Multi-year survival proof (Year 4 sustainability verified) ✅
    - [x] Dual-Entrypoint logic parity (Audit complete) ✅
    - [x] Victorian Insight Generation (Fiscal Hemorrhage verified) ✅

---

### ✅ Completed Phases (Archive)

<details>
<summary>Phase 2.5: Integration Verification (Complete)</summary>

- [x] Test `getPlayerFarm()`, `plantTrees()`, `waterParcel()`, `harvestCherries()`, `sellCherries()`
- [x] Debug logging, Parcel IDs, `assignParcelToPlayer`, Type Errors
- [x] `getMarketPrices`, `getFarmOverview`, `debugResetPlayer`
</details>

<details>
<summary>Bug Fixes (Complete)</summary>

- [x] Seasonal Fertilization/Harvest Restriction
- [x] JSON-RPC Serialization Error (Time.Time → Nat)
- [x] Parcel ID Mismatch, Redundant Lookup Logic
- [x] `sellCherries` average quality logic
</details>

<details>
<summary>Phase 3 & 4 (Complete)</summary>

- [x] API: `soilType`, `phLevel`, `fertility` exposed. `getParcelDetails()` implemented
- [x] Market Saturation, Infrastructure Costs/Effects, E2E Script
- [x] Stable Storage with `preupgrade`/`postupgrade`
- [x] Structured Error Handling, Market Data API, Farm Overview
</details>

## Agent Instructions
1. Read `main.mo` AND `main_mainnet.mo` — identify implementation gaps in **both** entrypoints.
2. Implement one function at a time.
3. **Dual Entrypoint Rule**: All new logic goes in shared modules (e.g., `weather_logic.mo`, `ai_logic.mo`). New public functions must be exposed in **both** `main.mo` (Playground) and `main_mainnet.mo` (Mainnet/EOP).
4. **⚠️ WSL Constraint**: You CANNOT run `dfx` or `npm` commands. Formulate exact commands and ask the **User** to run them in WSL.
5. Tell the user to redirect output: `COMMAND 2>&1 | tee .tmp/backend.log`.
6. Read the log yourself using `view_file` to analyze errors.
7. Update this file (mark as `[x]`) upon completion.
8. Notify Coordinator (`00_master_plan.md`) if blocked.
9. **Security**: All code subject to Security Agent review before merge.
