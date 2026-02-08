# BACKEND AGENT: Mark Vinicius Cherry Tycoon [BACKEND]

> **Current Directive**: **Phase 2.5 - Core Function Verification**
> **Constraint**: **WSL Terminal Required** - Use Windows path for files, but User executes `dfx` commands in WSL terminal manually.
> **Last Updated**: 2026-02-08

## Backlog

### 🔍 Phase 2.5: Integration Verification (CRITICAL)
- [ ] **Test `getPlayerFarm()`**: Verify it returns valid farm state for new and existing players
- [ ] **Test `plantTrees()`**: Call via `dfx canister call` with valid parcel ID
- [ ] **Test `waterParcel()`**: Verify water level increases
- [ ] **Test `harvestCherries()`**: Verify cherries are added to inventory
- [ ] **Test `sellCherries()`**: Verify cash increases
- [ ] **Add Debug Logging**: Add console output to each function for easier debugging
- [ ] **Document Parcel IDs**: Ensure parcel IDs are stable and documented for frontend use
- [x] **Verify `assignParcelToPlayer`**: Implemented in `main.mo` (L834). `playerId` is correctly handled as `Text`. Verified via WSL tests.
- [x] **Verify Type Errors**: Verified consistency in `main.mo` (all use `#Ok`/`#Err`).

### 🐞 Bug Fixes (Found by QA & Frontend)
- [x] **[FIXED] Seasonal Harvest Restriction**: Added Summer-only harvest check to `harvestCherries()`. Returns `#SeasonalRestriction` error for Spring/Autumn/Winter. Verified via `test_seasonal_harvest.sh`.
- [x] **[FIXED] JSON-RPC Serialization Error**: Changed `PlayerFarm.lastActive` from `Time.Time` (Int) to `Nat` to fix BigInt serialization issues in JavaScript. Verified via `debug_serialization.sh`.
- [x] **[FIXED] Parcel ID Mismatch in Operations**: Refactored logic to use `findParcelIndex` AND updated `e2e_backend.sh` script to use dynamic IDs (Fixes "Parcel not found" false positives).
- [x] **[FIXED] Redundant Lookup Logic**: Unified all lookups to use the `findParcelIndex` helper.
- [x] **[FIXED] `sellCherries` logic**: Now uses average quality across all parcels.
- [x] **Implement `harvestCherries(parcelId: Text)`**: Verified and fixed lookup.
- [x] **Implement `plantTrees(parcelId: Text, quantity: Nat)`**: Verified and fixed lookup.
- [x] **Implement `waterParcel(parcelId: Text)`**: Verified and fixed lookup.
- [x] **Implement `fertilizeParcel(parcelId: Text, type: Text)`**: Verified and fixed lookup.

### Next Steps (Priority 2)
- [x] **Implement `buyParcel(parcelId: Text, price: Nat)`**: Implemented in `main.mo` (L787).
- [x] **Implement `sellCherries(quantity: Nat, type: Text)`**: Enhanced with average quality logic.
- [x] **Implement Stable Storage**: Use `preupgrade` and `postupgrade` hooks to persist `playerMap`, `parcelMap`. Verified.

### Phase 2: Integration & Frontend Support (Current)
- [x] **Structured Error Handling**: Refactor `main.mo` to return `Result<T, GameError>` instead of `Result<T, Text>` for better UI error mapping. (Complete)
- [x] **Market Data API**: Implement `getMarketPrices()` query to provide the dashboard with current price levels.
- [x] **Farm Overview Helper**: Implement a summary query that returns condensed data for the `Sidebar` and `InventoryBar`.

## Agent Instructions
1.  Read `main.mo` and identify implementation gaps.
2.  Implement one function at a time.
3.  Formulate `dfx` commands for the user to run in WSL.
4.  Update this file (mark as `[x]`) upon completion.
5.  Notify Coordinator (`00_master_plan.md`) if blocked.
