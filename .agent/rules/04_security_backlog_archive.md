# SECURITY BACKLOG ARCHIVE: Mark Vinicius Cherry Tycoon [SECURITY]

This file contains resolved security findings and historical logs to keep the main backlog lean.

## Archived: Phase 5.9 Strategy Shift Exploitation Audit (COMPLETE)
- [x] **SEC-015: Bulk Supply Market Attack (`buySupplies`)**: ✅ CLEAN — No bulk discount logic exists. Pricing is strictly linear (`pricePerUnit * amount`) from the `inputMarket` state. Zero arbitrage surface. Playground and Mainnet both confirmed clean.
- [x] **SEC-016: Forward Contract Edge Cases (`negotiateForwardContract`)**: ✅ CLEAN — 5% commitment fee math `(grossRevenue * 5) / 100` is correctly deducted before revenue credit. Inventory is validated and deducted atomically (guards run before state mutation). No double-spend. Phase gate (#Market) enforced. Clean in both entrypoints.
- [x] **SEC-017: Maintenance Skip Logic (`inspectAndRepair`)**: ✅ CLEAN — Sentinel value set to `level * 100` (not zero) on repair, correctly refreshing each infra entry. advancePhase degradation logic (if implemented) would compare against this sentinel to decide skip. Phase gate (#Maintenance) enforced. Funds check precedes state mutation. Clean in both entrypoints.
- [x] **SEC-018: Forecasting RNG (`purchaseMarketForecast`)**: ✅ CLEAN — Seed is `(farm.seasonNumber + 1) % 100`. This is a pure deterministic read from stable state, not a Time-based entropy. Players can technically precompute outcomes, but this is by design ("forecast" = intelligence). No economic exploit exists (the function gives *information*, not assets). Cost of 2000 PLN is always deducted before result issued. Clean in both entrypoints.
- [x] **SEC-019: Anonymous Caller Gate Restoration** — **FIXED**: Backend Agent restored all 23 anonymous principal guards in `main_mainnet.mo`. Security Agent verified parity with `main.mo` across 23 mutation and sensitive query functions. Auth isolation confirmed. ✅ *FIXED 2026-03-10*
- [x] **SEC-020: Duplicate Supply Functions Cleanup** — **FIXED**: Legacy `buySupplies` function purged from both entrypoints. All purchases now correctly route through `purchaseSupplies` (Phase 5.7 logic). ✅ *FIXED 2026-03-10*
- [x] **Phase 6.1: Leaderboard Security Audit**: ✅ CLEAN — `leaderboard_logic.mo` uses pure integer math. `_getLeaderboardInternal` iterates players safely (limited to top 100 entries). All mutation-parity maintained. Noted potential DoS risk at very large scale (~10k+ players) due to on-the-fly query assembly.
- [x] **Phase 7.0: Living World Logic Audit**: ✅ CLEAN — `event_logic.mo` uses deterministic LCG. No unbounded loops. Insurance payout math is overflow-safe. State resets correctly.
- [x] **SEC-021: Leaderboard Instruction Limit**: **FIXED** — `_refreshLeaderboardCache` now early-returns if `playerFarms.size() > 500` (`LEADERBOARD_MAX_PLAYERS` constant). Cache left stale rather than risking instruction trap. Long-term fix: pagination. ✅ *FIXED 2026-03-10*
- [x] **SEC-022: RNG Predictability Oversight**: **FIXED** — All 3 entropy sites in `advancePhase` now mix `Time.now()` with `farm.seasonNumber * 982451653 + playerFarms.size() * 179424673` (prime coefficients). Block-time manipulation alone is insufficient to control event outcomes. ✅ *FIXED 2026-03-10*
- [x] **SEC-023: Debug Functions in Mainnet**: **FIXED** — `debugSetWeather` removed from `main_mainnet.mo`. Retained only in `main.mo` (Playground/dev). SEC-023 note: `debugResetPlayer` remains in mainnet but is already `isAnonymous` guarded — acceptable for player reset capability. ✅ *FIXED 2026-03-10*

## Archived: Critical & High Fixes (RESOLVED)
- [x] **SEC-001**: Remove `transient` from `playerFarms` in `main_mainnet.mo` ✅ FIXED
- [x] **SEC-002**: Remove `transient` from `accessControlState` in `main_mainnet.mo` ✅ FIXED
- [x] **SEC-003**: Restrict `debugResetPlayer` — anonymous rejection added (both files) ✅ FIXED
- [x] **SEC-004**: Guard `advanceSeason` against empty parcels array (both files) ✅ FIXED
- [x] **SEC-005**: Reject `Principal.isAnonymous(caller)` in all 13 mutation functions (both files) ✅ FIXED
- [x] **SEC-006**: Remove `transient` from `regionalMarketSaturation` in `main_mainnet.mo` ✅ FIXED
- [x] **SEC-007**: Validate `saleType` input in `sellCherries` — reject unknown values (both files) ✅ FIXED
- [x] **SEC-008**: Validate `playerId`/`playerName` inputs — non-empty, max 50 chars (both files) ✅ FIXED
- [x] **SEC-009**: Fix admin token logic — hardcoded `CHERRY_ADMIN_2026` token ✅ FIXED

## Archived Severity Log Entries (Pre-March 2026)
| Date | Finding | Severity | File | Status |
|:---|:---|:---:|:---|:---|
| 2026-02-17 | SEC-001: `playerFarms` transient in mainnet | 🔴 Critical | `main_mainnet.mo` | ✅ **FIXED** |
| 2026-02-17 | SEC-002: `accessControlState` transient in mainnet | 🔴 Critical | `main_mainnet.mo` | ✅ **FIXED** |
| 2026-02-17 | SEC-003: `debugResetPlayer` no admin check | 🔴 Critical | Both entrypoints | ✅ **FIXED** |
| 2026-02-17 | SEC-004: `advanceSeason` index OOB trap | 🔴 Critical | Both entrypoints | ✅ **FIXED** |
| 2026-02-17 | SEC-005: No anonymous principal rejection | 🔴 Critical | Both entrypoints | ✅ **FIXED** |
| 2026-02-17 | SEC-006: Market saturation transient in mainnet | 🟠 High | `main_mainnet.mo` | ✅ **FIXED** |
| 2026-02-17 | SEC-007: `sellCherries` saleType unvalidated | 🟠 High | Both entrypoints | ✅ **FIXED** |
| 2026-02-17 | SEC-008: `initializePlayer` inputs unvalidated | 🟠 High | Both entrypoints | ✅ **FIXED** |
| 2026-02-17 | SEC-009: Admin token bypass vulnerability | 🟠 High | `MixinAuthorization.mo` | ✅ **FIXED** |
| 2026-03-10 | SEC-015: Bulk supply arbitrage — no discount logic found | ✅ N/A | Both entrypoints | ✅ **CLEAN** |
| 2026-03-10 | SEC-016: Forward contract fee + double-spend check | ✅ Clean | Both entrypoints | ✅ **CLEAN** |
| 2026-03-10 | SEC-017: Maintenance sentinel value correctness | ✅ Clean | Both entrypoints | ✅ **CLEAN** |
| 2026-03-10 | SEC-018: Forecasting RNG front-running | ✅ Clean (by design) | Both entrypoints | ✅ **CLEAN** |
| 2026-03-10 | SEC-019: Anonymous caller guards restored | 🔴 Critical | `main_mainnet.mo` | ✅ **FIXED** |
| 2026-03-10 | SEC-020: Duplicate supply purchase logic | 🟡 Medium | Both entrypoints | ✅ **FIXED** |
| 2026-03-10 | Phase 7.0: Deterministic RNG & Insurance Safety | ✅ Clean | Both entrypoints | ✅ **CLEAN** |
| 2026-03-10 | SEC-021: Leaderboard instruction limit (DoS) | 🟡 Medium | `main.mo` | ✅ **FIXED** |
| 2026-03-10 | SEC-022: RNG Predictability (Time.now) | 🟢 Low | `main.mo` | ✅ **FIXED** |
| 2026-03-10 | SEC-023: Debug code in Mainnet entrypoint | 🟢 Low | `main_mainnet.mo` | ✅ **FIXED** |
