# 09-02 SUMMARY — ProcessingFacility +15% wholesale (UX-05, D-05)

Built 2026-11-20 on branch `feat/09-02-processing-facility-wholesale`, from `master` 7042242, on dfx 0.24.3 (moc 0.13.4). **Not merged; the owner merges.** The owner confirmed the +15% on 2026-11-20.

## What changed
- `backend/game_logic.mo`: `calculateWholesalePrice` gains a sixth parameter `hasProcessingFacility: Bool`, a trailing `processingBonus` (1.15 or 1.0) after `seasonMultiplier`.
- `backend/main.mo`: the sole call site derives the flag from the caller's own `farm.infrastructure` (`i.infraType == #ProcessingFacility`). It is not an argument of any `public shared` function; no Candid change (`declarations/` clean).
- `frontend/src/lib/gameLogic.ts`: new pure `calculateWholesalePrice`, same arguments and arithmetic. `SellModal.tsx` now calls it instead of inlining the formula.
- `frontend/src/__tests__/economyParity.test.ts`: `refWholesalePrice` takes the new parameter (explicit `false` at every old call site), plus a `UX-05` describe block (8 tests) including a 672-case grid (7 quantities x 4 qualities x 3 saturations x 4 seasons x 2 flag values) that compares the real `gameLogic.ts` function to the Motoko transcription.
- `docs/game-design/economy/math-consistency.md`: the wholesale formula line now carries `season_multiplier` and `processing_bonus`.
- `backend/main_mainnet.mo`: **not edited.**

## Live-replica proof (local replica, dfx 0.24.3, `AgentTest`, canister reinstalled before each sample)
Setup each time: `initializePlayer`, `advancePhase` x2 (Hiring -> Procurement -> Investment, Spring), optional `upgradeInfrastructure`, `debugClearMarket`, `debugSetInventory(1000, 0)`, `sellCherries(1000, "wholesale")`. Every setup call returned `Ok` (printed in the run; a refused purchase would have shown).

| Sample | Infrastructure | Payout (PLN) |
|---|---|---|
| 1 | none | 6,678 |
| 2 | `Warehouse` only | 6,678 |
| 3 | `ProcessingFacility` | **7,679** |

Ratio 3/1 = 1.1499. Arithmetic from the source: `10 x 0.7 x 1.06 x 0.9 x 1000 x 1.15 = 7,679.7`; the backend truncates (`Int.abs(Float.toInt(...))`), so 7,679. The plan's "about 7,680" was the untruncated figure. Sample 2 shows the flag keys on the right variant, not on "owns anything".

## Revert check on the SellModal mirror (plan acceptance)
With `SellModal`'s call to the shared function put back to the old inline arithmetic (no processing term) and everything else unchanged, the whole vitest suite still passed (15 files). **The parity oracle proves the formula function, not that the component uses it.** The live replica run compensates only for the backend, not for the preview. No test renders `SellModal` with a ProcessingFacility. Left as is; recorded.

## Gates
`./validate.sh full`: 556 unit tests passed (548 before), 61 e2e passed, lint 182 warnings and 0 errors (ceiling unchanged), build, declarations clean. `./validate.sh backend`: Track A clean.

## Flagged, not fixed
- `SellModal` passes the real average parcel quality into the wholesale preview; `main.mo` passes a hardcoded 60. The preview and the payout can differ (ECON-13). Changing it moves payouts, so it is a balance decision.
- The preview has no regional-saturation multiplier (it puts `marketMult` in that slot); the backend applies regional saturation and then `marketMult`. Already on record with ECON-13; not changed.
- Track B: the plan expected one more compile error. There is none: the call at `main_mainnet.mo:1194` already passed 4 of 5 arguments since ECON-02, and Track B shows 9 type errors on `master` and with the change. The same error now says 6 arguments are expected. Recorded under EOP-01.
- The retail formula text in `math-consistency.md` also lacks `season_multiplier` (ECON-02 never updated it). Not touched.

## Balance note (not a defect)
At the setup above the bonus paid 1,001 PLN more on 1,000 kg, about 1.0 PLN per kg. The 2026-10-23 review's payback estimate (100,000 PLN price, about 1,000 PLN upkeep a year, about 8-9k kg a year sold wholesale) gives roughly 12-14 game years at this rate; that annual volume is from the review, not measured here. The bonus does nothing for retail sellers. A different bonus size is the owner's decision.
