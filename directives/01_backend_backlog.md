# BACKEND AGENT: Mark Vinicius Cherry Tycoon [BACKEND]

> **Current Directive**: **Stable & Verified** (Core logic and bug fixes complete)
> **Constraint**: **WSL Terminal Required** - Use Windows path for files, but User executes `dfx` commands in WSL terminal manually.
> **Last Updated**: 2026-02-08

## Backlog

### Urgent (Priority 1)
- [x] **Verify `assignParcelToPlayer`**: Implemented in `main.mo` (L834). `playerId` is correctly handled as `Text`. Verified via WSL tests.
- [x] **Verify Type Errors**: Verified consistency in `main.mo` (all use `#Ok`/`#Err`).

### 🐞 Bug Fixes (Found by QA)
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
- [/] **Structured Error Handling**: Refactor `main.mo` to return `Result<T, GameError>` instead of `Result<T, Text>` for better UI error mapping.
- [ ] **Market Data API**: Implement `getMarketPrices()` query to provide the dashboard with current price levels.
- [ ] **Farm Overview Helper**: Implement a summary query that returns condensed data for the `Sidebar` and `InventoryBar`.

## Agent Instructions
1.  Read `main.mo` and identify implementation gaps.
2.  Implement one function at a time.
3.  Formulate `dfx` commands for the user to run in WSL.
4.  Update this file (mark as `[x]`) upon completion.
5.  Notify Coordinator (`00_master_plan.md`) if blocked.
