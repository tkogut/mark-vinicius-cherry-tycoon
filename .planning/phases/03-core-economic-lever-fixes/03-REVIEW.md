---
phase: 03-core-economic-lever-fixes
reviewed: 2026-09-17T00:00:00Z
depth: standard
files_reviewed: 27
files_reviewed_list:
  - backend/auction_logic.mo
  - backend/game_logic.mo
  - backend/main.mo
  - backend/types.mo
  - docs/game-design/CURRENT-STATE-2026-07-29.md
  - docs/game-design/economy/math-consistency.md
  - docs/game-design/economy/price-formulas.md
  - docs/game-design/economy/spoilage-rates.md
  - frontend/e2e/orchard.spec.ts
  - frontend/e2e/parcelCard.spec.ts
  - frontend/parcel-card-harness.html
  - frontend/src/App.tsx
  - frontend/src/__tests__/auctionTrickle.test.ts
  - frontend/src/__tests__/backendHygiene.test.ts
  - frontend/src/__tests__/competitorsPanel.test.tsx
  - frontend/src/__tests__/economyParity.test.ts
  - frontend/src/__tests__/fertilizerPicker.test.tsx
  - frontend/src/__tests__/uiConventions.test.ts
  - frontend/src/components/farm/FertilizerTypeMenu.tsx
  - frontend/src/components/farm/ImperialOrchard.tsx
  - frontend/src/components/farm/ParcelCard.tsx
  - frontend/src/components/farm/modals/SellModal.tsx
  - frontend/src/components/social/CompetitorsPanel.tsx
  - frontend/src/dev/orchardHarness.tsx
  - frontend/src/dev/parcelCardHarness.tsx
  - frontend/src/lib/fertilizerTypes.ts
  - frontend/src/lib/gameLogic.ts
  - frontend/src/lib/gddTemplate.ts
findings:
  critical: 2
  warning: 3
  info: 1
  total: 6
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-09-17T00:00:00Z
**Depth:** standard
**Files Reviewed:** 27 (28 listed; `gddTemplate.ts` scanned for narrative-content risk only, see note under Info)
**Status:** issues_found

## Summary

The fertilizer-type picker (ECON-01, plans 03-06/03-07) is well built: the wire
strings are centralized in one constant, validated server-side before any
state mutation, covered by a large `economyParity.test.ts` transcription
suite, and the frontend picker (ParcelCard + ImperialOrchard's shared
`FertilizerTypeMenu`) has jsdom, component, and real-browser (Playwright)
coverage of the exact behaviors D-01/D-02 specify. The MAINT-01/02 wear-and-repair
system and its TS mirror are also solid — same transcription-test discipline,
Nat arithmetic guarded correctly throughout.

However, two BLOCKER-level defects were found in the auction/Pre-Season-Future
path in `backend/main.mo`, both reachable through normal gameplay (a player
who legitimately commits to more than one Pre-Season Future in a season, or
who calls `commitPreSeasonFuture` with a `volumeKg` smaller than the contract's
`requiredVolumeKg`). Both let a player systematically underpay relative to the
economic design the auction system is meant to enforce — exactly the class of
defect this review was asked to look for ("Nat underflow/overflow safety... in
main.mo, auction_logic.mo"). Neither is a Nat-trap risk (no crash), but both
are silent economic-correctness bugs.

A separate, lower-severity but well-evidenced issue: `docs/game-design/economy/price-formulas.md`
and `math-consistency.md` — both explicitly declared "Single Source of Truth"
for economy formulas in their own header text, and both edited during this
phase (commit `d05bd0e`, plan 03-06) to add the fertilizer-type rows — still
state three Phase 8.0 auction constants that do not match
`backend/auction_logic.mo`, a mismatch that was already flagged by name in
`docs/game-design/CURRENT-STATE-2026-07-29.md` before this phase started and
was not corrected when these exact files were touched.

## Critical Issues

### CR-01: `resolveSeasonAuctions` double-counts a player's inventory across multiple committed Pre-Season Futures

**File:** `backend/main.mo:3446-3491`
**Issue:**

`totalDelivered` is computed **once**, before the `Array.map` that resolves
every one of the caller's `#Awarded` Pre-Season Future contracts for the
season:

```motoko
let totalDelivered = remCherries + remOrganic; // Available after Imperial contracts

let finalContracts = Array.map<Types.AuctionContract, Types.AuctionContract>(
  stableAuctionContracts,
  func(c) {
    switch (c.committedByPlayer) {
      case (?(pid)) {
        if (pid == callerText and c.isPreSeason and c.status == #Awarded) {
          let shortfallResult = AuctionLogic.resolvePreSeasonShortfall(
            c, totalDelivered, stableSpotPrice, farm.cash, farm.reputation, farm.reputation
          );
          ...
          let deliveredKg = if (totalDelivered >= c.requiredVolumeKg) c.requiredVolumeKg else totalDelivered;
          if (remCherries >= deliveredKg) { remCherries -= deliveredKg; } else { ... };
```

`remCherries`/`remOrganic` *are* correctly decremented contract-by-contract as
the map runs, but the value fed into `resolvePreSeasonShortfall` for **every**
contract is the same pre-loop `totalDelivered` snapshot — it is never
refreshed to `remCherries + remOrganic` between iterations. A player is free
to commit to more than one Pre-Season Future per season (`advancePhase`
generates one Export + one Bio + one Industrial PSF every season, and nothing
in `commitPreSeasonFuture` limits how many a single player commits to).

Concretely: a player commits to Export (10,000 kg required) and Industrial
(20,000 kg required), then delivers only 12,000 kg total.
`totalDelivered = 12,000` for both contracts:
- Export: `12,000 >= 10,000` → shortfall **0** (correct in isolation).
- Industrial: `12,000 >= 20,000` is false → shortfall computed as `20,000 - 12,000 = 8,000`.

But only 2,000 kg of the 12,000 kg pool was actually left after the Export
contract's 10,000 kg was deducted — the true combined shortfall is
`(10,000 + 20,000) - 12,000 = 18,000 kg`, not `0 + 8,000 = 8,000 kg`. The
player evades roughly 10,000 kg of buyback/default penalty by holding more
than one PSF in the same season, purely because the shortfall check for each
contract re-reads the undepleted pre-loop total instead of the actual
remaining stock at that point in the iteration.

**Fix:** Track a running "still available" quantity that both the shortfall
check and the deduction read from, e.g. fold instead of `Array.map`, or thread
an accumulator:

```motoko
var remainingForPSF = totalDelivered;
let finalContracts = Array.map<Types.AuctionContract, Types.AuctionContract>(
  stableAuctionContracts,
  func(c) {
    ...
    if (pid == callerText and c.isPreSeason and c.status == #Awarded) {
      let shortfallResult = AuctionLogic.resolvePreSeasonShortfall(
        c, remainingForPSF, stableSpotPrice, farm.cash, farm.reputation, farm.reputation
      );
      let deliveredKg = if (remainingForPSF >= c.requiredVolumeKg) c.requiredVolumeKg else remainingForPSF;
      remainingForPSF := if (remainingForPSF >= deliveredKg) remainingForPSF - deliveredKg else 0;
      ...
```
(and drop `deliveredKg`'s current re-derivation from the stale `totalDelivered`).

---

### CR-02: `commitPreSeasonFuture`'s commitment fee is computed from a caller-supplied `volumeKg` that is disconnected from the contract's actual delivery obligation

**File:** `backend/main.mo:3131-3205`
**Issue:**

```motoko
public shared({ caller }) func commitPreSeasonFuture(
    contractId  : Text,
    volumeKg    : Nat
) : async GameResult<Text, GameError> {
    ...
    if (volumeKg == 0) { return #Err(...) };
    ... // find `contract` by contractId
    let lockedPrice : Nat = AuctionLogic.calcLockedPrice(contract.basePricePLN);
    let fee : Nat = AuctionLogic.calcCommitmentFee(lockedPrice, volumeKg);
    if (farm.cash < fee) { return #Err(...) };
    // contract updated to #Awarded, committedByPlayer, lockedPricePLN, winnerBidPLN
    // — contract.requiredVolumeKg is NEVER changed and volumeKg is never stored anywhere
```

`volumeKg` is used **only** to compute the 10% commitment fee
(`AuctionLogic.calcCommitmentFee(lockedPricePLN, requiredVolumeKg)`, per
`auction_logic.mo:99-101`). It is never written to the contract, never
compared against `contract.requiredVolumeKg`, and never persisted anywhere —
the delivery obligation the player is later held to in
`resolvePreSeasonShortfall` is always `contract.requiredVolumeKg` (the fixed
10,000/5,000/20,000 kg baked in at contract generation), completely
independent of what the caller passed as `volumeKg`.

A caller can therefore call `commitPreSeasonFuture(contractId, 1)` and pay a
fee of `(lockedPrice * 1 * 10) / 100`, which truncates to 0 for every
realistic `lockedPrice` (5–17 PLN/kg) — a **free** lock-in of the discounted
price and full contract terms, while the actual shortfall/default exposure at
resolution time is still computed against the full `requiredVolumeKg`. This
is exploitable by any direct canister call (the frontend's `useAuction.ts`
happens to pass the real required volume today, but the canister itself does
not enforce it, and the frontend is not a trust boundary).

**Fix:** Either drop the `volumeKg` parameter and always fee off
`contract.requiredVolumeKg`, or validate it:

```motoko
if (volumeKg != contract.requiredVolumeKg) {
  return #Err(#InvalidOperation("volumeKg must equal the contract's required volume of " # Nat.toText(contract.requiredVolumeKg) # " kg"));
};
let fee : Nat = AuctionLogic.calcCommitmentFee(lockedPrice, contract.requiredVolumeKg);
```

## Warnings

### WR-01: ParcelCard's yield display never reflects the fertilizer type actually applied to the parcel

**File:** `frontend/src/components/farm/ParcelCard.tsx:69`
**Issue:** `calculateYieldBreakdown(parcel, infrastructure, weather, labor)` is
called with no fifth argument, so `fertilizerTypeMod` silently defaults to
`1.0` (`frontend/src/lib/gameLogic.ts:300`). There is no way for it to be
anything else today: the fertilizer type actually applied to a parcel lives
only in the backend's `stableParcelFertilizerTypes` side-table
(`backend/main.mo:101`), and no public query exposes it — `CherryParcel`
itself carries no such field by design (per the plan 03-06 comment in
`game_logic.mo:87`).

The result: once a player fertilizes a parcel with `SyntheticIntensive`, the
backend's next harvest yields ~4.76% more than the "Potential"/"Adjusted
Yield" numbers ParcelCard shows in its tooltip and card body — the exact
failure mode CLAUDE.md calls out ("The mirror is load-bearing: the UI quotes
these numbers to the player"). This isn't a parity-test gap (the TS/Motoko
formula transcription is correct and `economyParity.test.ts` proves it) — it's
a missing data path from backend state to the display component that plan
03-07 introduced the picker for without also exposing what was picked.
**Fix:** add a query (e.g. `getParcelFertilizerType(parcelId)` or bulk-return
it on `getPlayerFarm`/`getParcelDetails`) so the frontend can pass the real
modifier into `calculateYieldBreakdown`, or at minimum surface a UI note that
the displayed yield excludes any active fertilizer bonus.

### WR-02: Economy "Single Source of Truth" docs still contradict `auction_logic.mo` on three constants, in files this exact phase edited

**File:** `docs/game-design/economy/price-formulas.md:64-74`, `docs/game-design/economy/math-consistency.md:119-166`
**Issue:** Both files' Phase 8.0 Auction Formulas sections state:

| Constant | Docs say | `backend/auction_logic.mo` actually is |
|---|---|---|
| Prestige weight base | `1000 + prestige` | `1500 + prestige` (`auction_logic.mo:236`, comment: "Audit: 1.5x weight") |
| Commitment fee | `5%` of locked value | `10%` (`COMMITMENT_FEE_NUM = 10`, `auction_logic.mo:37`) |
| Default penalty | `150%` of undelivered value | `200%` (`DEFAULT_PENALTY_NUM = 200`, `auction_logic.mo:45`) |

This exact discrepancy was already identified and named in
`docs/game-design/CURRENT-STATE-2026-07-29.md:61,67` before this phase began
("note: code comment claims 5%, actual constant is 10%" / "but doc/type
comments claim 150%, another doc-vs-code mismatch to fix in the rewrite").
Commit `d05bd0e` ("docs(03-06): fertilizer-type taxonomy in economy docs +
parity matrix") edited both of these exact files during this phase to add the
new fertilizer-type rows, but did not correct the pre-existing, already-known
wrong numbers sitting a few lines away in the same files.

Both files' own header text declares them authoritative ("Ten plik to Single
Source of Truth... Jeśli ... i ten plik są sprzeczne, **ten plik wygrywa**" —
price-formulas.md line 2-3), which means a future change made to "match the
doc" would silently regress the code back to the pre-audit values. Per
CLAUDE.md, economy balance constants are also "Ask First" — a stale SSOT doc
is exactly the artifact a balance discussion would consult.
**Fix:** Update both tables to `1500`/`10%`/`200%`, or if those were
deliberately reverted since the audit, update `auction_logic.mo`'s comments
and confirm with the user which side is correct (this is an "Ask First" balance
number per CLAUDE.md, not something to silently pick one side of).

### WR-03: `App.tsx` lazy-imports `FarmGrid` but never renders it

**File:** `frontend/src/App.tsx:9`
**Issue:** `const FarmGrid = React.lazy(() => import("@/components/farm/FarmGrid")...)` is declared but `<FarmGrid` does not appear anywhere else in `App.tsx`, and no other file renders it either (`ImperialOrchard`, imported and rendered at `App.tsx:790`, is the farm view actually shown). This is dead code: an unused lazy-loaded chunk reference that will never be requested, left over from before `ImperialOrchard` replaced the grid-based farm view.
**Fix:** Remove the unused import, or if `FarmGrid` is meant to be reachable from some other UI path, wire it in and note why both views coexist.

## Info

### IN-01: Leftover `console.log`/`console.error` placeholders in `handleBuyParcel`

**File:** `frontend/src/App.tsx:271,280`
**Issue:** `handleBuyParcel` logs `"Buying new parcel..."` and any error to the console, with a `// TODO: Get parcel ID and price from UI/modal` a few lines above — pre-existing placeholder scaffolding, not introduced by this phase's plans, but visible in a file under review.
**Fix:** Track as a follow-up (or add to `.planning/REQUIREMENTS.md` per CLAUDE.md's "never paper over a known defect you happen to touch" rule) rather than leaving silent scaffolding in a production handler.

---

_Reviewed: 2026-09-17T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
