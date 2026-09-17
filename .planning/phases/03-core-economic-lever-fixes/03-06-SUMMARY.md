---
phase: 03-core-economic-lever-fixes
plan: 06
subsystem: api
tags: [motoko, economy, stable-state, vitest, transcription-test, fertilizer]

# Dependency graph
requires:
  - phase: 03-core-economic-lever-fixes (plan 05)
    provides: "Season sale multiplier wired into calculateRetailPrice/calculateWholesalePrice — this plan's Task 1 sits in the same yield/price formula neighborhood in game_logic.mo"
  - phase: 03-core-economic-lever-fixes (plan 04)
    provides: "The stable-var side-table persistence pattern (stableRunnerUpCredits) and its checkpoint precedent, reused directly here as stableParcelFertilizerTypes"
provides:
  - "backend/game_logic.mo :: getFertilizerTypeModifier(Text) : Float — SyntheticIntensive -> 1.05, everything else -> 1.0 (ECON-01, D-01)"
  - "calculateYieldPotential gains a trailing fertilizerTypeMod: Float parameter, appended at the end of the multiplicative chain, after countyMod"
  - "backend/main.mo :: fertilizeParcel validates fertilizerType against the closed set {OrganicCompatible, SyntheticStandard, SyntheticIntensive} before any state read/write, and persists the applied type in a new stable var stableParcelFertilizerTypes : [(Text, Text)] side-table (checkpoint option B)"
  - "frontend/src/lib/gameLogic.ts :: FERTILIZER_TYPES (exported wire-string tuple) and getFertilizerTypeModifier(string): number mirror, plus the same trailing fertilizerTypeMod parameter on calculateYieldBreakdown (default 1.0)"
  - "economyParity.test.ts gains describe('economy parity: fertilizer type (ECON-01)') — modifier-by-type table, the 1.05 ratio inside the full product, an unfertilized-parcel regression case, a type x county x organic composition matrix, and a wire-string-agreement ratchet against backend/main.mo's guard"
affects: [03-07 (the fertilizer-type picker consumes FERTILIZER_TYPES and must send exactly one of the three wire strings; the wire-string-agreement ratchet in this plan is its drift guard)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Side-table stable var for cross-call-boundary state (fertilize now, harvest later), following this repo's stableClubOwnership (Phase 2) and stableRunnerUpCredits (plan 03-04) precedent: additive, no existing record shape changed, no Candid change, no dfx generate. Upsert (replace-not-append) on write, keyed by parcel id."
    - "A pure formula function (calculateYieldPotential) stays pure by taking the already-looked-up modifier as a trailing Float parameter, rather than reaching into actor state itself — the actor (main.mo) does the lookup and conversion at each of its two call sites (harvest: real lookup; cost estimator: 1.0 baseline)."
    - "Parity-matrix extension: cross a new formula term against the *existing* terms it composes with (county, organic) rather than only pinning it in isolation, plus a file-scanning ratchet (readFileSync on backend/main.mo) so a downstream picker's wire strings can't silently drift from the backend's closed set."

key-files:
  created: []
  modified:
    - backend/game_logic.mo
    - backend/main.mo
    - frontend/src/lib/gameLogic.ts
    - frontend/src/__tests__/economyParity.test.ts
    - docs/game-design/economy/price-formulas.md
    - docs/game-design/economy/math-consistency.md

key-decisions:
  - "Checkpoint (blocking, user decision): option-b — a new stable var side-table (stableParcelFertilizerTypes) — selected over option-a (add an optional field to the existing, stable, Candid-visible CherryParcel record) and option-c (fold the effect into parcel.fertility at fertilize time, persisting nothing new, which D-01 already rejected). This matches plan 03-04's choice for the structurally identical runner-up-credit decision, and for the same reasons: no persisted-record-shape change on a live canister, no dfx generate, no Candid churn. Divergence from 03-04's pattern: this plan's pure formula function (calculateYieldPotential) gained a new trailing parameter rather than reading the side-table itself, since it has no actor-state access — 03-04's equivalent logic lived directly in main.mo, so no such split was needed there."
  - "The three wire strings (OrganicCompatible, SyntheticStandard, SyntheticIntensive) are defined as literals in exactly two places — the Motoko switch/guard and the TS FERTILIZER_TYPES tuple — never re-typed at a third site. The parity suite's wire-string-agreement test reads backend/main.mo off disk to keep the TS side honest against the Motoko side."
  - "parcel.isOrganic is not read, written, or branched on anywhere in the fertilize or harvest-lookup path (D-02) — verified by grep (no new isOrganic occurrence inside fertilizeParcel) and by the parity matrix proving SyntheticIntensive composes identically with organic and non-organic parcels."
  - "The mandatory live-replica upgrade proof surfaced a real ordering bug in this session's own workflow, not in the code: the first round of fertilizer-comparison calls ran against the pre-upgrade canister (before `dfx deploy backend` had been re-run for this plan's Motoko changes), so `fertilizeParcel`'s old dead-lever behavior was observed and momentarily looked like a fresh defect. Redone after the upgrade, the effect was measured at exactly 1.05x, matching the parity suite. See Verification below for the full trace, kept here rather than smoothed over per CLAUDE.md's 'never report tests pass as evidence' and LESSONS.md's verification rules."

requirements-completed: [ECON-01]

coverage:
  - id: D1
    description: "Synthetic-Intensive raises yield potential ~5% (measured exactly 1.05x) versus Synthetic-Standard/Organic-Compatible/unfertilized, both in the parity suite and on a live replica"
    requirement: "ECON-01"
    verification:
      - kind: unit
        ref: "frontend/src/__tests__/economyParity.test.ts#economy parity: fertilizer type (ECON-01) — 164/164 green, including the type x county x organic composition matrix"
        status: pass
      - kind: integration
        ref: "dfx canister call backend harvestCherries — two fresh, structurally identical parcels, clean (Sunny) weather: SyntheticStandard 8_640 kg, SyntheticIntensive 9_072 kg, ratio exactly 1.05"
        status: pass
    human_judgment: false
  - id: D2
    description: "fertilizerType is validated server-side against the closed set before any state read/write; junk and wrong-case inputs are rejected with nothing mutated"
    requirement: "ECON-01"
    verification:
      - kind: integration
        ref: "dfx canister call backend fertilizeParcel with 'MagicDust' and 'syntheticintensive' — both rejected with InvalidOperation naming the three accepted values; getInventory confirmed fertilizers count unchanged by either rejected call"
        status: pass
    human_judgment: false
  - id: D3
    description: "The canister upgrade carrying the new stable var succeeds over a canister already holding player data, and that data reads back intact"
    requirement: "ECON-01"
    verification:
      - kind: integration
        ref: "dfx deploy backend reported 'Upgrading code for canister backend' (not a reinstall); pre-existing farm econ04_win (cash 199_526, reputation 100, cherries 12_048, organicCherries 84_000, seasonNumber 25) read back identical on every field checked before and after"
        status: pass
    human_judgment: false
  - id: D4
    description: "parcel.isOrganic is never touched by the fertilize path (D-02)"
    requirement: "ECON-01"
    verification:
      - kind: unit
        ref: "grep -n 'isOrganic' backend/main.mo shows no new occurrence inside fertilizeParcel; economyParity.test.ts's composition matrix proves the SyntheticIntensive effect is identical for organic and non-organic parcels"
        status: pass
    human_judgment: false
  - id: D5
    description: "Persistence mechanism choice (option B) and its rationale recorded, and whether it matches plan 03-04's, for a future reader"
    human_judgment: true
    rationale: "Process/traceability claim — see key-decisions above and Decisions Made below, not something a test asserts."

duration: ~2h (including live-replica investigation of the pre-upgrade/post-upgrade discrepancy)
completed: 2026-09-17
status: complete
---

# Phase 3 Plan 06: Fertilizer-Type Yield Effect (ECON-01) Summary

**`fertilizeParcel`'s dead `fertilizerType` parameter now does something real: validated against a closed set, persisted per parcel in a new stable-var side-table (checkpoint option B, matching plan 03-04's precedent), and multiplied into the yield formula — Synthetic-Intensive measured at exactly 1.05x on a live replica, matching the parity suite.**

## Performance

- **Duration:** ~2h (continuation session; most of the time was live-replica verification, including diagnosing and correcting a self-inflicted "tested before deploying the upgrade" ordering mistake — see Issues Encountered)
- **Completed:** 2026-09-17
- **Tasks:** 2 (1 tracer + checkpoint resolution, 1 docs/parity-matrix task)
- **Files modified:** 6 (`backend/game_logic.mo`, `backend/main.mo`, `frontend/src/lib/gameLogic.ts`, `frontend/src/__tests__/economyParity.test.ts`, `docs/game-design/economy/price-formulas.md`, `docs/game-design/economy/math-consistency.md`)

## Accomplishments

- **Checkpoint (blocking, resolved by user before this session): option-b** — a new `stable var stableParcelFertilizerTypes : [(Text, Text)]` side-table, keyed by parcel id — over option-a (add a field to the stable/Candid `CherryParcel` record) and option-c (fold the effect into `fertility`, which D-01 already rejected). Matches plan 03-04's choice for the structurally identical persistence problem.
- **Task 1 (tracer):** `GameLogic.getFertilizerTypeModifier` added (SyntheticIntensive → 1.05, everything else → 1.0); `calculateYieldPotential` gained a trailing `fertilizerTypeMod: Float` parameter, appended last in the product after `countyMod`. `fertilizeParcel`'s `_fertilizerType` parameter un-shadowed and validated against the closed set `{OrganicCompatible, SyntheticStandard, SyntheticIntensive}` before any state is read or written (same shape as `purchaseSupplies`), with the stale "future enhancement" TODO removed. On success the type is upserted into the new side-table; `parcel.isOrganic` is never read, written, or branched on. The harvest call site looks up the persisted type and passes the resulting modifier through; the cost-estimator call site (the formula's only other caller) passes a `1.0` baseline. Mirrored in the same commit: `frontend/src/lib/gameLogic.ts` gained `FERTILIZER_TYPES` (the three wire strings, for plan 03-07's picker) and `getFertilizerTypeModifier`, and `calculateYieldBreakdown` gained the same trailing parameter (default 1.0, so every existing call site is unchanged). `economyParity.test.ts` gained the `describe('economy parity: fertilizer type (ECON-01)')` block: 155/155 green (up from 148).
- **Live-replica proof (Task 1, mandatory):** `dfx deploy backend` upgraded the existing canister (not a reinstall) holding player `econ04_win`'s real data, which read back identical on every field checked. Two fresh, structurally identical starter parcels (same soil/pH/fertility/size/treeAge/county, no infrastructure) were fertilized with Synthetic-Standard and Synthetic-Intensive respectively and harvested under clean (no weather event) conditions: **8_640 kg vs 9_072 kg — a ratio of exactly 1.05**, matching D-01 and the parity suite bit-for-bit. Junk type `"MagicDust"` and wrong-case `"syntheticintensive"` were both rejected with the closed-set error message, and `getInventory` confirmed neither rejected call decremented the fertilizer count.
- **Task 2:** `docs/game-design/economy/price-formulas.md` and `math-consistency.md` updated with the fertilizer-type term, its three wire strings and multipliers, its 1.0 default for an unfertilized parcel, where it's persisted, and an explicit statement that it doesn't touch `isOrganic` — all cited to `backend/game_logic.mo` and `backend/main.mo` line numbers. `economyParity.test.ts`'s ECON-01 block extended into a type-by-county-by-organic composition matrix (8 cases: 4 counties x 2 organic states, each proving the exact 1.05x ratio holds) plus a wire-string-agreement ratchet that reads `backend/main.mo` off disk and asserts every `FERTILIZER_TYPES` export appears in `fertilizeParcel`'s guard. File: 164/164 green (up from 155).
- Both break-it checks performed and quoted in the commit bodies: bumping the TS `SyntheticIntensive` value to 1.10 failed the parity suite by name; renaming a `FERTILIZER_TYPES` entry failed the wire-string-agreement test.

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end "Synthetic-Intensive grows more cherries" — validate, persist, multiply, harvest (ECON-01)** - `84affbe` (feat)
2. **Task 2: Document the taxonomy and close the parity matrix** - `d05bd0e` (docs)

## Files Created/Modified

- `backend/game_logic.mo` - `getFertilizerTypeModifier`, trailing `fertilizerTypeMod` parameter on `calculateYieldPotential`, `1.0` baseline at the cost-estimator call site
- `backend/main.mo` - new `stable var stableParcelFertilizerTypes`, `_parcelFertilizerType`/`_recordParcelFertilizerType` helpers, closed-set guard + upsert in `fertilizeParcel`, lookup + modifier pass-through at the harvest call site
- `frontend/src/lib/gameLogic.ts` - `FERTILIZER_TYPES`, `getFertilizerTypeModifier`, trailing `fertilizerTypeMod` parameter on `calculateYieldBreakdown` and the `YieldBreakdown` interface
- `frontend/src/__tests__/economyParity.test.ts` - `describe('economy parity: fertilizer type (ECON-01)')` (Task 1) extended with a composition matrix and a wire-string-agreement ratchet (Task 2)
- `docs/game-design/economy/price-formulas.md`, `docs/game-design/economy/math-consistency.md` - fertilizer-type term documented, cited to source line numbers

## Decisions Made

- **Checkpoint decision: option-b (new stable var side-table), user's explicit call, matching plan 03-04.** `CherryParcel` is both a `stable var` element type and Candid-visible via `getPlayerFarm`, so adding a field (option A) would have required a persisted-record-shape change on a live canister plus `dfx generate` and a committed `frontend/src/declarations/` update — exactly what CLAUDE.md's Ask-First rule on stable state exists to gate. Option C (fold the effect into `fertility` at fertilize time) was rejected because D-01 explicitly chose the yield-formula multiplier over the fertility-bump approach and recorded that as the deliberately larger, costlier choice — reopening it here would have silently reversed a decision already made. Option B follows this repo's own shipped precedent (`stableClubOwnership`, Phase 2; `stableRunnerUpCredits`, plan 03-04): a brand-new `stable var` is additive, existing canisters upgrade with an empty list, no existing record shape changes, no Candid surface changes, no `dfx generate`.
- **Divergence from 03-04's exact shape (noted, not a re-litigation):** 03-04's equivalent logic (paying a runner-up credit) lived entirely inside `main.mo`, so it could read the side-table directly wherever needed. This plan's core formula (`calculateYieldPotential`) lives in `game_logic.mo` and is a pure function with no actor-state access, so it could not read `stableParcelFertilizerTypes` itself. Resolved by adding a trailing `fertilizerTypeMod: Float` parameter: `main.mo` does the side-table lookup and the `getFertilizerTypeModifier` conversion, then passes the resulting number in. This keeps the pure module pure and mirrors cleanly (the TS side takes the same kind of trailing numeric parameter, not a fertilizer-type string).
- **The three wire strings are defined once per side, not thrice.** The Motoko guard and switch statement are the single source of truth on the backend; `FERTILIZER_TYPES` is the single source of truth on the frontend. The wire-string-agreement ratchet (Task 2) is the mechanism that keeps them equal without a human re-checking by eye — it reads `backend/main.mo` off disk rather than trusting a comment.
- **`parcel.isOrganic` untouched by design (D-02).** Confirmed by grep (`grep -n 'isOrganic' backend/main.mo` shows no new occurrence inside `fertilizeParcel`) and by the Task 2 composition matrix, which proves the 1.05x ratio holds identically whether `isOrganic` is `true` or `false`.

## Deviations from Plan

None from the plan's instructions — Option B was implemented exactly as specified in the plan's `<action>` block, including the trailing-parameter approach the plan itself anticipated ("`calculateYieldPotential` must gain a `fertilizerTypeMod: Float` parameter... which means updating its other call site... and threading the value from `main.mo`'s harvest path").

One deviation from the plan's suggested live-replica *procedure*, not its intent: the plan's example dialogue assumed reusing two parcels on an *existing* farm. The only pre-existing farm with real data (`econ04_win`) has a single parcel, so "two structurally comparable parcels" were constructed instead as two **fresh** starter parcels (`initializePlayer`'s deterministic starter-parcel template: same soil/pH/fertility/size/treeAge/county) under two throwaway local dfx identities, fertilized and harvested in the same season. This satisfies the plan's actual requirement (a controlled, structurally identical pair) without touching or risking the pre-existing farm's data, which was reserved solely for the upgrade-survives-data proof as the plan specifies.

## Issues Encountered

- **Self-inflicted ordering mistake during verification, corrected within this session.** The first round of fertilizer-comparison calls (initialize → fertilize → advance to Harvest → harvest) was run against the **pre-upgrade** canister — `dfx deploy backend` for this plan's Motoko changes had not yet been executed. Since `fertilizeParcel` accepted `fertilizerType` but ignored it before this plan (the exact dead lever this plan fixes), the harvested kg matched the *old*, inert behavior (a 6_040 kg result that reverse-computed to `fertilizerTypeMod = 1.0`, not `1.05`), which briefly looked like a fresh regression. Diagnosed by reverse-computing the exact expected kg under both the old and new formula from the observed weather severity and comparing — the old-behavior number matched exactly, confirming the canister was stale rather than the code being wrong. Resolved by running the mandatory `dfx deploy backend` upgrade (confirmed via the "Upgrading code for canister backend" message and the intact `econ04_win` read-back), then redoing the comparison with fresh identities against the upgraded canister, which produced the clean 8_640 kg / 9_072 kg / 1.05x result quoted above. No code change resulted from this — it was purely a verification-sequencing mistake, reported here in full rather than omitted, per CLAUDE.md and LESSONS.md's verification rules.
- Weather events are randomly rolled (35% Sunny chance in Summer) during the Growth-phase season transition; several fertilizer-comparison attempts landed under Heatwave/Drought/PestOutbreak rolls before two farms landed a clean (Sunny) pair. The weather-affected attempts were not discarded as noise — each was reverse-computed against the known weather-impact formula and confirmed consistent with the expected `fertilizerTypeMod`, which is what first surfaced the pre-upgrade/post-upgrade discrepancy above.

## User Setup Required

None — no external service configuration required. (Several throwaway local dfx test identities were created during verification; their seed phrases were only ever shown in local tool output, never written to any committed file.)

## Verification

- `./validate.sh backend`: Track A (`backend/main.mo`) clean, exit 0, both after Task 1 and Task 2. Track B (`backend/main_mainnet.mo`) — `git diff` empty (untouched, confirmed by grep). `game_logic.mo` is shared by both tracks (established in plan 03-05); the new `calculateYieldPotential` parameter adds one new compile error at Track B's line-542 call site (missing argument), while the previous line-1592 error in the same set disappears — 5 errors before, 5 errors after, redistributed rather than net-increased, within the already-broken, CI-excluded EOP-01 set.
- **Upgrade proof (mandatory):** `dfx deploy backend` reported "Upgrading code for canister backend, with canister ID bkyz2-fmaaa-aaaaa-qaaaq-cai" (not a reinstall) against the canister already holding player `econ04_win`'s data (cash 199_526, reputation 100, cherries 12_048, organicCherries 84_000, seasonNumber 25). `getPlayerFarm` read back identical on every field checked before and after.
- **Fertilizer-effect proof (clean pair):** two fresh starter parcels (`initializePlayer`'s deterministic template: SandyClay, pH 6.5, fertility 0.7 → 0.8 after one fertilize, size 0.5 ha, treeAge 5, county Opole, no infrastructure), harvested under Sunny/no-event weather: `SyntheticStandard` → **8_640 kg**, `SyntheticIntensive` → **9_072 kg**. `9_072 / 8_640 = 1.05` exactly.
- **Rejection proof:** `fertilizeParcel(_, "MagicDust")` and `fertilizeParcel(_, "syntheticintensive")` both returned `Err(InvalidOperation("Invalid fertilizer type. Must be 'OrganicCompatible', 'SyntheticStandard', or 'SyntheticIntensive'"))`; `getInventory` confirmed `fertilizers` was unaffected by either rejected call (9 remaining — 10 minus the one legitimate fertilize, minus 0 for the two rejections).
- `cd frontend && npx vitest run src/__tests__/economyParity.test.ts`: 155/155 green after Task 1, 164/164 green after Task 2 (composition matrix + wire-string-agreement ratchet added).
- `cd frontend && npm test`: 479 passed, 3 skipped (482 total — up from 452 pre-plan).
- `./validate.sh fast`: green (0 lint errors, 182 warnings — ratchet ceiling unchanged) after both tasks.
- Break-it checks: TS `SyntheticIntensive` bumped to 1.10 → 2 named test failures (`toBeCloseTo(1.05...)` assertions), reverted, green again. `FERTILIZER_TYPES`'s third entry renamed → wire-string-agreement test failed (`expected false to be true`), reverted, green again. Both quoted in the respective task commits.

## Next Phase Readiness

- **ECON-01 is now COMPLETE** — validated, persisted, and applied at harvest, proven on a live replica including the mandatory upgrade-over-real-data check. Marked in `.planning/REQUIREMENTS.md`.
- **Plan 03-07 (the fertilizer-type picker) can now proceed directly against `FERTILIZER_TYPES`** exported from `frontend/src/lib/gameLogic.ts` — the wire-string-agreement ratchet in `economyParity.test.ts` will fail loudly if the picker's values ever drift from the backend's closed set.
- `stableParcelFertilizerTypes` is new persisted state; any future plan touching `fertilizeParcel`, the harvest path, or `calculateYieldPotential`'s call sites should be aware of this side-table and its upsert-by-parcel-id pattern.
- No blockers for subsequent Phase 3 plans. `main_mainnet.mo`'s EOP-01 error set continues to shift shape (not grow net) as shared-module changes land in `game_logic.mo` — this is now established precedent from both plan 03-05 and this plan, not a new concern.

---
*Phase: 03-core-economic-lever-fixes*
*Completed: 2026-09-17*

## Self-Check: PASSED
- FOUND: `.planning/phases/03-core-economic-lever-fixes/03-06-SUMMARY.md`
- FOUND: commit `84affbe` (Task 1)
- FOUND: commit `d05bd0e` (Task 2)
