---
phase: 03-core-economic-lever-fixes
plan: 03
subsystem: api
tags: [motoko, auctions, economy, vitest, transcription-test]

# Dependency graph
requires:
  - phase: 03-core-economic-lever-fixes (plan 01/02)
    provides: economyParity.test.ts transcription-oracle pattern reused here for auctionTrickle.test.ts
provides:
  - "resolveContract computes and returns a real runner-up trickle (volume + PLN payout) instead of leaving the reserved constants unused"
  - "AuctionResult.runnerUpVolumeKg / runnerUpTricklePLN — new module-internal fields, not Candid, not stable"
  - "_performGlobalAuctionResolution credits an AI runner-up's totalRevenue/inventoryKg symmetrically with the existing AI-winner branch"
  - "auctionTrickle.test.ts pins the trickle formula and its zero/one/two/four-bidder + non-multiple-of-5 boundary cases"
affects: [03-04 (player-as-runner-up direction, deferred here)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Transcription oracle (ref* functions + Motoko quoted inline) reused for pre-resolution auction math with no UI mirror, per 03-RESEARCH.md's Architectural Responsibility Map"

key-files:
  created:
    - frontend/src/__tests__/auctionTrickle.test.ts
  modified:
    - backend/auction_logic.mo
    - backend/types.mo
    - backend/main.mo

key-decisions:
  - "Trickle volume floors first, then payout is derived from the floored volume (not a single combined product), so 'N kg at P PLN/kg' always reconciles with the returned payout — costs at most 1kg of precision, documented inline so a future reader doesn't 'fix' it."
  - "Runner-up sharing the winner's bidderId (corrupted bid list) is guarded explicitly in resolveContract — both trickle fields become 0/null rather than assuming the linear scan cannot produce that identity collision."
  - "Runner-up inventory deduction mirrors the winner branch's existing quirk of crediting revenue regardless of held stock, for symmetry between the two branches rather than independently re-deciding it here."
  - "No gameLogic.ts mirror added — ECON-03 has no frontend tier per 03-RESEARCH.md's Architectural Responsibility Map; auctionTrickle.test.ts documents this as deliberate in its file header."

requirements-completed: []  # ECON-03 is PARTIALLY delivered (AI direction only) — not marked complete; see below.

coverage:
  - id: D1
    description: "resolveContract computes runner-up trickle volume/payout from the previously-unused 20/100 constants, returned on AuctionResult; winner's revenue formula unchanged"
    requirement: "ECON-03"
    verification:
      - kind: unit
        ref: "frontend/src/__tests__/auctionTrickle.test.ts#ECON-03: auction runner-up trickle boundary cases"
        status: pass
      - kind: integration
        ref: "dfx canister call backend resolveSeasonAuctions — live replica, season 6 Imperial contracts, see Verification section below"
        status: pass
    human_judgment: false
  - id: D2
    description: "AI runner-up is credited the trickle in _performGlobalAuctionResolution; a second resolveSeasonAuctions call does not move the figure again (T-03-03-04)"
    requirement: "ECON-03"
    verification:
      - kind: integration
        ref: "dfx canister call backend resolveSeasonAuctions (2x) + getCompetitorsDetail before/after — see commit 338a9a3"
        status: pass
    human_judgment: false
  - id: D3
    description: "Player-as-runner-up direction is explicitly deferred to plan 03-04, not silently dropped"
    human_judgment: true
    rationale: "This is a scope/process claim (did the SUMMARY state the deferral, and does 03-04 exist to pick it up), not something a test asserts — a human/reviewer confirms the traceability."

duration: ~20min
completed: 2026-09-16
status: complete
---

# Phase 3 Plan 03: AI Auction Runner-Up Trickle (ECON-03, AI direction) Summary

**`resolveContract` now computes and returns a real 20%-of-volume runner-up trickle at the runner-up's own offer price, credited to an AI second-place bidder in `_performGlobalAuctionResolution`; the player-as-runner-up direction is deferred to plan 03-04.**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-09-16
- **Tasks:** 2 (1 tracer, 1 TDD-style test task)
- **Files modified:** 4 (3 backend `.mo`, 1 new frontend test)

## Accomplishments

- `AuctionLogic.resolveContract` computes the runner-up trickle volume (`requiredVolumeKg × 20 / 100`, floored) and payout (`volume × runner-up's own offerPricePLN`, derived from the floored volume so the two figures always reconcile), guarding the case where the runner-up's `bidderId` equals the winner's.
- Reserved constants `RUNNER_UP_TRICKLE_NUM`/`RUNNER_UP_TRICKLE_DEN` are un-parked (underscore dropped) — genuinely referenced for the first time since they were written.
- `AuctionResult` gains `runnerUpVolumeKg`/`runnerUpTricklePLN` (additive `Nat` fields; confirmed by grep to be absent from `frontend/src/declarations/`, i.e. not part of the Candid surface, so no `dfx generate` was needed).
- `_performGlobalAuctionResolution` gets a sibling branch to the existing AI-winner `switch`: on a hit in `aiCompetitors` for `result.runnerUpId`, credits `totalRevenue` and deducts `min(inventoryKg, runnerUpVolumeKg)` using the same `if (a >= b) a - b else 0` guard already used for the winner (no bare `Nat` subtraction). On a miss (the runner-up is the player, not an AI), the branch is a documented no-op deferring to plan 03-04.
- Verified end-to-end on a live replica: advanced an existing player ("AgentTest") through Growth → Harvest → Market → Storage to generate season-6 Imperial contracts with real AI bids, then called `resolveSeasonAuctions`. Observed exactly the hand-computed figures (below), including a second `resolveSeasonAuctions` call rejected as already-resolved with the runner-up's figures unchanged (T-03-03-04).
- `frontend/src/__tests__/auctionTrickle.test.ts` pins the formula and six boundary behaviors (zero/one/two/four bidders, non-multiple-of-5 flooring, winner-revenue-unchanged) via a transcription oracle in the `economyParity.test.ts` house style, with an explicit Nat-safety (no negative/NaN) assertion.

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end "second place gets paid" — one path, the AI runner-up** - `338a9a3` (feat)
2. **Task 2: Transcription test pinning the trickle formula and its bidder-count boundaries** - `121b1cf` (test)

_No separate plan-metadata commit yet — this SUMMARY/STATE update is committed as the final-commit step below._

## Files Created/Modified

- `backend/auction_logic.mo` - `resolveContract` computes and returns the runner-up trickle; reserved constants un-parked
- `backend/types.mo` - `AuctionResult` gains `runnerUpVolumeKg : Nat`, `runnerUpTricklePLN : Nat`
- `backend/main.mo` - `_performGlobalAuctionResolution` gains the AI-runner-up credit branch, symmetric with the existing AI-winner branch
- `frontend/src/__tests__/auctionTrickle.test.ts` - new transcription test file (7 tests: 5 `it.each` boundary cases + winner-unchanged + Nat-safety)

## Decisions Made

- **Volume floors before the payout is computed** (not a single combined product) so a caller displaying "N kg at P PLN/kg" always sees a total that adds up — costs at most 1kg of precision. Documented inline in `auction_logic.mo` per the plan's explicit instruction, to stop a future reader from "fixing" it.
- **Identity guard is explicit**, not assumed impossible: if the runner-up's `bidderId` equals the winner's (a corrupted bid list), both trickle fields are 0/null rather than double-crediting one bidder.
- **The runner-up credit mirrors the winner branch's existing quirk** of crediting revenue regardless of whether the bidder actually held the stock (`inventoryKg` can go to 0 while `totalRevenue` still rises by the full figure). This was flagged rather than silently matched or silently diverged from, per the plan's explicit instruction — it is a pre-existing characteristic of the winner path, now symmetric across both.
- **No `gameLogic.ts` mirror was added.** `03-RESEARCH.md`'s Architectural Responsibility Map places ECON-03 in the backend tier with no frontend/UI tier — no UI surfaces pre-resolution auction math, so there is nothing on the TS side for `gameLogic.ts` to mirror. `auctionTrickle.test.ts` states this explicitly in its header so the absence reads as deliberate.
- **Track B (`backend/main_mainnet.mo`) intentionally left untouched** — EOP-01, unverifiable. Confirmed by empty `git diff backend/main_mainnet.mo` and byte-identical `moc --check` error output before and after this plan's changes.

## Deviations from Plan

None — plan executed exactly as written. One judgment call is worth recording explicitly (not a deviation from what was built, but from a literal reading of a verification instruction):

**Task 2's "prove the test works" instruction, re-scoped to what a decoupled transcription test can actually prove:**
- **Found during:** Task 2's break-it check.
- **Issue:** The plan's literal instruction was "change the numerator constant in `backend/auction_logic.mo` from 20 to 25, re-run the [vitest] test, confirm it fails." `auctionTrickle.test.ts` is a pure transcription oracle with no live-canister call (documented in its own header, same limitation `economyParity.test.ts` already carries) — there is no code path from the `.mo` file into this Vitest run, so editing the backend constant alone cannot move this test, by construction.
- **Resolution:** Performed the equivalent break-it exercise on the test file's own transcribed `RUNNER_UP_TRICKLE_NUM` constant (the value that stands in for the backend constant inside the oracle): raised 20 → 25, re-ran, observed 3 of 7 cases fail by name with expected-vs-actual payloads (`runnerUpVolumeKg`: 3000→3750, 2000→2500, 3→4), then restored to 20 and confirmed 7/7 green again. This proves the test's hardcoded expectations are not vacuously true, which is what the instruction was actually verifying.
- **Files modified:** none beyond the test file itself (edited and reverted within the same task, before the commit).
- **Verification:** Failure output and restoration quoted in commit `121b1cf`.
- **Committed in:** `121b1cf` (Task 2 commit body documents both the attempted literal reading and the reasoning for the substitution).

## Issues Encountered

None beyond the break-it re-scoping documented above.

## User Setup Required

None - no external service configuration required.

## Verification

- `./validate.sh backend`: Track A (`backend/main.mo`) — clean, exit 0. Track B (`backend/main_mainnet.mo`) — error set quoted before (`git stash` + `moc --check`) and after this plan's changes: byte-for-byte identical (`duplicate field name activeInsurance` @261.7; type errors @1591.60-1593.74; `baseCapacity` @2720.24 — confirmed via `diff` returning no output).
- Live replica (`dfx deploy backend`, existing canister, player "AgentTest"): advanced Growth→Harvest→Market→Storage to generate season-6 Imperial contracts (`imp_S6_0` Export 15,000kg, `imp_S6_1` Bio 6,000kg single-bidder, `imp_S6_2` Industrial 25,000kg) with real AI bids (Marek, Kasia, Hans), then `resolveSeasonAuctions`:
  - Marek (winner, `imp_S6_0` + `imp_S6_2`): `totalRevenue` 110,000 → 210,000, `inventoryKg` 67,750 → 27,750 (winner formula provably unchanged).
  - Hans (runner-up on both contracts he lost): `totalRevenue` 0 → 31,000 (21,000 + 10,000), `inventoryKg` 98,772 → 90,772 (3,000 + 5,000 deducted).
  - Kasia (winner, `imp_S6_1`, single bidder — no runner-up exists): `totalRevenue` 66,000 → 138,000, unaffected by the new branch.
  - Second `resolveSeasonAuctions` call: `Err(InvalidOperation "Auctions already resolved for season 7")`; `getCompetitorsDetail` confirmed no figure moved again (T-03-03-04).
- `cd frontend && npx vitest run src/__tests__/auctionTrickle.test.ts`: 7/7 green.
- `cd frontend && npm test`: 438 passed, 3 skipped (441 total — up from 434 pre-plan).
- `./validate.sh fast`: green (0 lint errors, 182 warnings — ratchet ceiling unchanged).
- `git diff backend/main_mainnet.mo`: empty.

## Next Phase Readiness

- **ECON-03 is only PARTIALLY delivered.** The AI-as-runner-up direction is real and replica-verified. The player-as-runner-up direction is explicitly out of scope here (per this plan's own prohibitions: no `stable var`/persisted-record-shape change was permitted in this plan) and is deferred to **plan 03-04**, which sits behind a decision gate for the player-side persistence change. Do not mark ECON-03 complete in REQUIREMENTS.md until 03-04 lands.
- `AuctionResult.runnerUpVolumeKg`/`runnerUpTricklePLN` are available for 03-04 to read from the same `resolveContract` call site — no further backend plumbing needed on the pure-module side for the player direction; only the persisted-player-state write path in `main.mo`'s `resolveSeasonAuctions`/player-facing branch needs it.
- No blockers for 03-04.

---
*Phase: 03-core-economic-lever-fixes*
*Completed: 2026-09-16*
