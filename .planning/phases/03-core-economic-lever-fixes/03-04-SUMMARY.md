---
phase: 03-core-economic-lever-fixes
plan: 04
subsystem: api
tags: [motoko, auctions, economy, stable-state, vitest, transcription-test]

# Dependency graph
requires:
  - phase: 03-core-economic-lever-fixes (plan 03)
    provides: "AuctionLogic.resolveContract computing runnerUpVolumeKg/runnerUpTricklePLN on AuctionResult, and the AI-direction credit branch in _performGlobalAuctionResolution whose result.runnerUpTricklePLN this plan reuses without recomputation"
provides:
  - "PlayerFarm.reputation gains a flat +5 on an Imperial Contract win (ECON-04), matching the AI-winner branch's literal prestige += 5, capped at 100, composing loss-then-gain"
  - "A new stable var stableRunnerUpCredits : [(Text, Text, Nat)] side-table (backend/main.mo) carrying a player runner-up's trickle credit from global auction resolution to their own resolveSeasonAuctions payout"
  - "ECON-03 is now complete in both directions: AI (plan 03-03) and player (this plan)"
  - "auctionTrickle.test.ts gains two new describe blocks: ECON-04 player reputation credit (6 cases) and ECON-03 player runner-up direction (5 cases)"
affects: [03-06 (fertilizer type persistence decision — this plan's checkpoint/option-B pattern is the precedent to reuse or deliberately diverge from)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Side-table stable var for cross-call-boundary credit persistence, following the repo's own stableClubOwnership precedent (Phase 2): additive, no existing record shape changed, no Candid change, no dfx generate. Consumed-on-read via filter-reassign in the same write as the sibling stable var it accompanies, so a credit can never be paid twice."
    - "Transcription oracle (ref* functions + Motoko quoted inline) extended for a two-write persistence mechanism (append then filter-consume), not just a pure formula — same house style as economyParity.test.ts and auctionTrickle.test.ts's existing ECON-03/ECON-04 blocks."

key-files:
  created: []
  modified:
    - backend/main.mo
    - frontend/src/__tests__/auctionTrickle.test.ts

key-decisions:
  - "Checkpoint (blocking, user decision): option-b — a new stable var side-table (stableRunnerUpCredits) — selected over option-a (add optional fields to the existing, stable, Candid-visible AuctionContract record) and option-c (re-read the caller's farm after the global resolution pass, changing resolveSeasonAuctions's read ordering). Rationale: follows the repo's own already-shipped stableClubOwnership pattern; touches no existing persisted record shape; requires no dfx generate / no Candid change; the reversibility of a pure-addition stable var is far better than reversing a field added to a record already on a live canister."
  - "The winner/runner identity guard (a bidder cannot be paid both the win and its own trickle) is enforced entirely upstream in AuctionLogic.resolveContract (plan 03-03) — runnerUpId is nulled on a bidderId collision before this plan's code ever runs, so no second identity check was added in main.mo. Verified by a dedicated transcription test using a corrupted two-bid list sharing one bidderId."
  - "The credit is consumed by filtering stableRunnerUpCredits down to entries NOT matching the caller's principal text, written in the same block as the existing stableAuctionContracts := finalContracts; write — all persisted writes for one resolveSeasonAuctions call land together, mirroring the plan's explicit instruction."
  - "The reputation gain (ECON-04) and runner-up trickle (ECON-03 player direction) are surfaced to the player via two new message suffixes (' Rep +N pts.' / ' Trickle +N PLN.') composed in the same order as the existing resolutionSummary, rather than silently applied with no user-visible confirmation."

requirements-completed: [ECON-03, ECON-04]

coverage:
  - id: D1
    description: "A player who wins an Imperial Contract gains +5 reputation, capped at 100, composing correctly with same-season shortfall losses (loss applied first, gain second, cap on the combined result)"
    requirement: "ECON-04"
    verification:
      - kind: unit
        ref: "frontend/src/__tests__/auctionTrickle.test.ts#ECON-04: player reputation credit"
        status: pass
      - kind: integration
        ref: "dfx canister call backend resolveSeasonAuctions — live replica, player econ04_win, reputation 50 -> 100 across repeated wins (Task 1 commit d405a1c)"
        status: pass
    human_judgment: false
  - id: D2
    description: "A player runner-up in an Imperial Contract is credited the identical trickle payout formula an AI runner-up receives, exactly once, via a new stableRunnerUpCredits side-table (checkpoint option B)"
    requirement: "ECON-03"
    verification:
      - kind: unit
        ref: "frontend/src/__tests__/auctionTrickle.test.ts#ECON-03: player runner-up direction (stableRunnerUpCredits, option B)"
        status: pass
      - kind: integration
        ref: "dfx canister call backend resolveSeasonAuctions — live replica, player econ04_win as runner-up on imp_S22_0, cash 130_214 -> 148_214 (+18_000), second call rejected/no-op — see Verification section below"
        status: pass
    human_judgment: false
  - id: D3
    description: "The canister upgrade carrying the new stable var succeeds over a canister already holding player data, and that data reads back intact"
    requirement: "ECON-03"
    verification:
      - kind: integration
        ref: "dfx deploy backend (upgrade over the Task-1 canister) — farm cash/reputation/inventory/seasonNumber read back identical before and after — see Verification section below"
        status: pass
    human_judgment: false
  - id: D4
    description: "Persistence mechanism choice (option B) and its rationale recorded for plan 03-06's structurally identical decision"
    human_judgment: true
    rationale: "This is a process/traceability claim (did the SUMMARY record the choice clearly enough for a future plan to start from it), not something a test asserts — see key-decisions above and Decisions Made below."

duration: ~35min
completed: 2026-09-17
status: complete
---

# Phase 3 Plan 04: Player Prestige & Runner-Up Credits (ECON-03/ECON-04) Summary

**Player-side contract-resolution credits are now symmetric with the AI side: a flat +5 reputation on an Imperial Contract win (capped at 100, D-06), and the player-runner-up trickle paid through a new `stableRunnerUpCredits` stable-var side-table selected at a blocking checkpoint over changing `AuctionContract`'s persisted shape.**

## Performance

- **Duration:** ~35 min (continuation session; Task 1 was completed and committed in a prior session)
- **Completed:** 2026-09-17
- **Tasks:** 2 (1 tracer + checkpoint, 1 TDD-style implementation task)
- **Files modified:** 2 (`backend/main.mo`, `frontend/src/__tests__/auctionTrickle.test.ts`)

## Accomplishments

- **Task 1 (ECON-04, prior session, commit `d405a1c`):** `resolveSeasonAuctions` gained a `reputationGain` accumulator, `+= 5` per Imperial win, applied after the existing shortfall-loss floor and before a `Nat.min(100, ...)` ceiling — never rescaled to AI's separate 0-1000 `prestige` field (D-06). Verified on a live replica: reputation 50 -> 55 -> ... -> capped at 100 across repeated wins.
- **Checkpoint (blocking, this session):** user selected **option-b** — a new `stable var stableRunnerUpCredits : [(Text, Text, Nat)]` — over option-a (add fields to `Types.AuctionContract`, a stable/Candid-visible record) and option-c (re-read the caller's farm mid-method). Recorded in full in Decisions Made below.
- **Task 2 (ECON-03, player direction):** `_performGlobalAuctionResolution`'s existing runner-up branch — previously a documented no-op (`case null {}; // Player runner-up handled in plan 03-04`) — now appends `(contractId, runnerUpPrincipalText, tricklePLN)` to the new side-table whenever the runner-up isn't found in `aiCompetitors` (i.e. is a player), reusing `result.runnerUpTricklePLN` from plan 03-03's formula without recomputing it. `resolveSeasonAuctions` gained a new step 1b that pays every entry matching the caller's own principal text into `cashDelta`, then filters those entries out of the side-table in the same block that already persists `stableAuctionContracts` — consumed exactly once.
- Both credits are now surfaced to the player in the resolution message (`" Rep +5 pts."` / `" Trickle +18000 PLN."`), alongside the existing per-contract lines.
- `auctionTrickle.test.ts` gained two new `describe` blocks pinning both directions: `ECON-04: player reputation credit` (6 cases, including the 98->100 cap and loss-then-gain composition) and `ECON-03: player runner-up direction (stableRunnerUpCredits, option B)` (5 cases: identical-formula credit, no-credit-under-2-bidders, exactly-once payout, winner-never-also-paid-own-trickle via the upstream identity guard, and one-caller-cannot-drain-another's-credit). File total: 18/18 green (up from 7).

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end "winning a contract moves the player's standing" (ECON-04)** - `d405a1c` (feat) — completed and committed in the prior session.
2. **Task 2: Pay the player runner-up via `stableRunnerUpCredits` (ECON-03, player direction)** - `7d7cca5` (feat)

_No separate plan-metadata commit yet — this SUMMARY/STATE update is committed as the final-commit step below._

## Files Created/Modified

- `backend/main.mo` - `reputationGain` accumulator + `Nat.min(100, ...)` ceiling (Task 1, prior session); new `stable var stableRunnerUpCredits`, the credit-append branch in `_performGlobalAuctionResolution`, the pay-and-consume step 1b + filter-reassign in `resolveSeasonAuctions`, and the two new message suffixes (Task 2, this session)
- `frontend/src/__tests__/auctionTrickle.test.ts` - `ECON-04: player reputation credit` describe block (Task 1, prior session); `ECON-03: player runner-up direction (stableRunnerUpCredits, option B)` describe block + updated file header (Task 2, this session)

## Decisions Made

- **Checkpoint decision: option-b (new stable var side-table), user's explicit call.** Context: `resolveSeasonAuctions` reads the caller's farm into a local snapshot *before* calling `_performGlobalAuctionResolution` and writes that snapshot back afterwards, so a credit written during the global pass onto the caller's own farm record would be silently overwritten — the credit has to live somewhere the caller's own loop reads *after* the snapshot, not inside the farm record itself.
  - **Option A (add `runnerUpPlayerId`/`runnerUpTricklePLN` fields to `Types.AuctionContract`)** was rejected: `AuctionContract` is both a `stable var` element type and Candid-visible, so it would have required a persisted-record-shape change on a live canister (exactly what CLAUDE.md's Ask-First rule on stable state exists to gate) plus `dfx generate` and a committed `frontend/src/declarations/` update.
  - **Option C (re-read the farm after the global pass, credit immediately)** was rejected: it changes the transaction/read-ordering shape of an existing live method for what should be a pure bugfix, and was explicitly not recommended by the planner.
  - **Option B (this plan's choice)** follows the repo's own shipped precedent — `stable var stableClubOwnership : [(Text, Text, Nat)]` from Phase 2 (SPORTS-01/02/03) — which the codebase already documents as "additive... existing farms upgrade with an empty ownership list... which is correct." A brand-new stable var takes its initializer on upgrade; no existing record shape changes; no Candid surface changes; no `dfx generate` needed. Trade-off accepted: contract-related state now lives in two places (`stableAuctionContracts` + `stableRunnerUpCredits`), and once-only semantics are enforced explicitly (filter-reassign) rather than riding `AuctionContract`'s own `#Fulfilled` transition.
  - **Precedent for plan 03-06:** the fertilizer-type persistence decision in 03-06 is structurally identical (new variant/state vs. a side-table). This SUMMARY is 03-06's starting reference — read the trade-off above before re-litigating it from scratch.
- **No second identity guard added in `main.mo`.** The "a winner is never also paid its own runner-up trickle" requirement is already fully satisfied by `AuctionLogic.resolveContract`'s existing guard (plan 03-03): `runnerUpId` is nulled outright when the runner-up's `bidderId` equals the winner's, so the credit-append branch in `_performGlobalAuctionResolution` is simply never reached for that case. Verified by a dedicated unit test using a corrupted two-bid list where both bids share one `bidderId`.
- **Payout amount is never recomputed.** Both the AI direction (plan 03-03) and the player direction (this plan) read `result.runnerUpTricklePLN` from the same `AuctionLogic.resolveContract` call — one formula, two consumers.

## Deviations from Plan

None — plan executed exactly as written, including the checkpoint resolution supplied by the user (option-b) and the mandatory upgrade-over-real-data proof.

## Issues Encountered

None. The replica scenario required driving the pre-existing "econ04_win" farm through several season transitions (Storage season 19 -> Market season 22) to reach a fresh set of Imperial Contracts with live AI bids to construct a genuine two-bidder runner-up scenario; this was mechanical (`advancePhase` repeated calls) and not a blocker.

## User Setup Required

None - no external service configuration required.

## Verification

- `./validate.sh backend`: Track A (`backend/main.mo`) — clean, exit 0, both before and after Task 2. Track B (`backend/main_mainnet.mo`) — error set unchanged (`duplicate field name activeInsurance` @261, contract type errors @1591-1593); `git diff backend/main_mainnet.mo` empty.
- **Upgrade proof (mandatory):** `dfx deploy backend` reported "Upgrading code for canister backend, with canister ID bkyz2-fmaaa-aaaaa-qaaaq-cai" (not a reinstall) against the canister left running from Task 1, which already held player "econ04_win"'s data (cash 135_714, reputation 100, cherries 28_580, organicCherries 84_000, seasonNumber 19, one resolved contract). `getPlayerFarm` read back identical on every field checked before and after the upgrade.
- **Player-runner-up trickle proof:** advanced the same farm through Storage(19) -> CutAndPrune -> Maintenance -> Planning -> Hiring/Procurement -> Investment -> Growth -> Harvest(22) -> Market(22) to reach `imp_S22_0` (Export, 15_000kg required, base 8 PLN/kg) with live AI bids Marek (offer 6, score 4350) and Hans (offer 7, score 2297). Submitted a player bid of offer 6 (reputation 100 -> prestige sum 200, score 3400) via `submitAuctionBid`, landing strictly between the two AI scores. Advanced to Storage(23); `resolveSeasonAuctions` returned `"Trickle +18000 PLN. | 🥈 Runner-up trickle imp_S22_0 (18000 PLN)"` — exactly `3_000 kg (15_000 * 20/100) * 6 PLN/kg (player's own offer)`. Cash moved `130_214 -> 148_214` (+18_000 exactly).
- **Once-only proof:** a second `resolveSeasonAuctions` call in the same season was rejected by the pre-existing SEC-028 guard (`Err(InvalidOperation "Auctions already resolved for season 23")`); cash unchanged at `148_214` on the follow-up `getPlayerFarm` read.
- **Once-only mechanism confirmed by code read:** `grep -c 'callerText' backend/main.mo` shows the runner-up match (line ~3361) and the filter-reassign (line ~3422) both keyed on `Principal.toText(caller)` computed inside the method — never a client-supplied identifier — and the filter-reassign sits in the same block as `stableAuctionContracts := finalContracts;`.
- `cd frontend && npx vitest run src/__tests__/auctionTrickle.test.ts`: 18/18 green (7 pre-existing ECON-03-AI-direction + 6 ECON-04 + 5 new ECON-03-player-direction).
- `cd frontend && npm test`: 449 passed, 3 skipped (452 total — up from 438/3 pre-plan).
- `./validate.sh fast`: green (0 lint errors, 182 warnings — ratchet ceiling unchanged).
- Under Option A only (not applicable here): `candidContract.test.ts` unaffected; `git status frontend/src/declarations/` clean — confirms no Candid surface changed, as expected for Option B.

## Next Phase Readiness

- **ECON-03 is now COMPLETE in both directions** — AI (plan 03-03) and player (this plan). **ECON-04 is COMPLETE.** Both marked in `.planning/REQUIREMENTS.md`.
- `stableRunnerUpCredits` is new persisted state; any future plan touching `resolveSeasonAuctions` or `_performGlobalAuctionResolution` should be aware of this side-table and its filter-reassign consumption pattern.
- Plan 03-06's fertilizer-type persistence decision has a direct, documented precedent to weigh against in this SUMMARY's Decisions Made section — read it before re-deriving the trade-off from scratch.
- No blockers for subsequent Phase 3 plans.

---
*Phase: 03-core-economic-lever-fixes*
*Completed: 2026-09-17*
