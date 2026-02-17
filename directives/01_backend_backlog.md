# BACKEND AGENT: Mark Vinicius Cherry Tycoon [BACKEND]

> **Current Directive**: **Phase 0 — Close Out 2.5 Cleanup, then Phase 5 — Living World**
> **Constraint**: **WSL Terminal Required** - Use Windows path for files, but User executes `dfx` commands in WSL terminal manually.
> **Security**: All commits reviewed by Security Agent before merge (see `SECURITY_DIRECTIVE_V1.md`)
> **Last Updated**: 2026-02-17

## Backlog

### 🔴 Phase 0: Close Out Phase 2.5 (FIRST — Pre-requisite)
- [ ] **Full Function Verification**: Test ALL public functions via `dfx canister call` — log results
- [ ] **Error Handling Verification**: Verify `#SeasonalRestriction` errors return proper toasts
- [ ] **Code Cleanup**: Remove all temporary `Debug.print` statements
- [ ] **Caffeine AI Purge**: Remove ALL legacy "Caffeine AI" references from codebase & docs — replace with "JaPiTo Group"
- [ ] **Baseline Green**: Confirm E2E test suite passes with zero failures

### 🟠 Phase 5.1: Weather Events + Season Sub-Phases
- [ ] **[NEW] `weather_logic.mo`**: Weather event system
  - `generateWeatherEvent(season, region)` with probability tables per season
  - Spring: Late Frost (15%), Heavy Rain (20%)
  - Summer: Drought (20%), Heatwave (15%), Hailstorm (5%)
  - Autumn: Early Frost (10%), Storm (15%)
  - Winter: Deep Freeze (25%)
  - Pest events: Cherry Fruit Fly (20% summer), Monilinia (15% spring) — mitigated by Sprayer
- [ ] **Season Sub-Phases**: Add `SeasonPhase` type to `types.mo`:
  - `#Preparation | #Growth | #Harvest | #Sales | #OffSeason`
- [ ] **Phase-Gated Actions** in `main.mo`:
  - `#Preparation`: Buy land, hire workers, buy supplies, upgrade infrastructure
  - `#Growth`: Water, fertilize, treat pests. Weather events fire here
  - `#Harvest`: Harvest only. Yield = DNA + Weather + Quality
  - `#Sales`: Sell cherries. View market
  - `#OffSeason`: Plan, review financials
- [ ] **`advancePhase()`**: Function to step through sub-phases within a season
- [ ] **Integrate Weather**: Fire `generateWeatherEvent()` on Growth phase transition
- [ ] **Opole DNA**: Activate county multipliers (soil/pH/fertility) from GDD §3.1

### 🟡 Phase 5.2: AI Competitors + Shared Market
- [ ] **[NEW] `ai_logic.mo`**: AI competitor engine
  - **Marek "The Traditionalist"** (Głubczyce, GL_02): Mass producer, low risk, crashes wholesale
  - **Kasia "The Eco-Visionary"** (Brzeg, BR_03): 100% organic, retail prestige, premium pricing
  - **Hans "The Aggressor"** (Opole, OP_CITY): High-tech scaler, outbids export contracts
- [ ] **`simulateAITurn()`**: AI makes seasonal decisions (plant/water/harvest/sell)
- [ ] **Shared Market Formula**: `Price = Base * (Demand / Total_Supply)` where `Total_Supply = Player + AI + Global`
- [ ] **`getCompetitorSummaries()`**: Query returning AI farm states
- [ ] **Integrate**: Call `simulateAITurn()` during `advanceSeason()`

### 🟢 Phase 5.4: Rankings
- [ ] **`getLeaderboard()`**: Query returning top farms by profit, total value, efficiency (profit/ha)
- [ ] **Include AI**: AI farms appear in rankings for competitive context

### 🔵 Phase 5.5: Monetization Readiness (Structure Only)
- [ ] **CHERRY Credits Type**: Balance tracking (ICP-linked, no live token yet)
- [ ] **Consumable Boosts**: Types for BioStimulant, CloudSummoner, PestShield, LegalLoophole
- [ ] **Strategic Map Expansions**: Purchasable province unlock types
- [ ] **Feature Flags**: All monetization behind flags — not active until CHERRY Credits go live

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
1. Read `main.mo` and identify implementation gaps.
2. Implement one function at a time.
3. Formulate `dfx` commands for the user to run in WSL.
4. Tell the user to redirect output: `| tee .tmp/backend.log`.
5. Read the log yourself using `view_file` to analyze errors.
6. Update this file (mark as `[x]`) upon completion.
7. Notify Coordinator (`00_master_plan.md`) if blocked.
8. **Security**: All code subject to Security Agent review before merge.
