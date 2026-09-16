---
phase: 03-core-economic-lever-fixes
plan: 02
subsystem: api
tags: [motoko, backend, docs, vitest, ratchet-test]

# Dependency graph
requires:
  - phase: 03-core-economic-lever-fixes (plan 01)
    provides: CompetitorsPanel real-field wiring, AI archetype naming convergence
provides:
  - "Single spoilage implementation (StorageLogic.calculateSpoilage), GameLogic.calculateSpoilageRate deleted"
  - "docs/game-design/economy/spoilage-rates.md rewritten against the live formula, with cited file:line sources"
  - "backendHygiene.test.ts ratchet pinning 'exactly one calculateSpoilage* declaration exists, in storage_logic.mo'"
affects: [economy-docs, backend-hygiene-tests]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "backend/*.mo hygiene ratchet: recursive filesystem walk + comment-stripping, same shape as legacyShellScripts.test.ts, applied to Motoko source instead of shell scripts"

key-files:
  created:
    - frontend/src/__tests__/backendHygiene.test.ts
    - .planning/phases/03-core-economic-lever-fixes/deferred-items.md
  modified:
    - backend/game_logic.mo
    - docs/game-design/economy/spoilage-rates.md
    - docs/game-design/economy/math-consistency.md
    - docs/game-design/CURRENT-STATE-2026-07-29.md

key-decisions:
  - "Deleted GameLogic.calculateSpoilageRate outright (not commented out, not underscore-renamed) after confirming zero call sites via grep across backend/, frontend/, docs/, execution/."
  - "Left StorageLogic.calculateSpoilage and StorageLogic.applySpoilage untouched — applySpoilage is itself dead code (main.mo duplicates its logic inline instead of calling it) but fixing that is out of scope for ECON-05 and logged to deferred-items.md instead."
  - "Added one-line correction pointers to math-consistency.md and CURRENT-STATE-2026-07-29.md (both repeat the dead 100/80/20 table) rather than rewriting either file wholesale, per the plan's explicit scope boundary."
  - "backendHygiene.test.ts excludes backend/main_mainnet.mo from its scan with an inline EOP-01 comment, matching CLAUDE.md's Track-B-is-unverifiable rule."

requirements-completed: [ECON-05]

coverage:
  - id: D1
    description: "GameLogic.calculateSpoilageRate deleted; StorageLogic.calculateSpoilage remains the sole implementation, backend deploys clean and observed spoilage behavior matches the formula on a live replica"
    requirement: "ECON-05"
    verification:
      - kind: unit
        ref: "frontend/src/__tests__/backendHygiene.test.ts#exactly one calculateSpoilage* declaration exists, and it lives in storage_logic.mo"
        status: pass
      - kind: other
        ref: "dfx deploy backend; debugSetInventory(12400,0); advancePhase x7 to Autumn->Winter boundary; getInventory read back (12,400 -> 9,796 kg, matching calculateSpoilage(15,70)=21% exactly)"
        status: pass
    human_judgment: false
  - id: D2
    description: "docs/game-design/economy/spoilage-rates.md rewritten to describe the live formula (Autumn-only trigger, Cold-Storage-beats-Warehouse priority, handling-quality divisor), every number cited to file:line"
    requirement: "ECON-05"
    verification:
      - kind: other
        ref: "grep -q storage_logic.mo && grep -q Autumn docs/game-design/economy/spoilage-rates.md; grep -rn '100%\\s*spoilage|80%\\s*spoilage' returns zero lines outside the removal note"
        status: pass
    human_judgment: false
  - id: D3
    description: "Ratchet test pins 'exactly one spoilage implementation' and is proven to fail both ways it can break (dead identifier reintroduced; second declaration added)"
    requirement: "ECON-05"
    verification:
      - kind: unit
        ref: "frontend/src/__tests__/backendHygiene.test.ts (3/3 pass); break-it failures quoted in commit 89d055e"
        status: pass
    human_judgment: false

duration: 27min
completed: 2026-09-16
status: complete
---

# Phase 3 Plan 02: Spoilage System Consolidation Summary

**Deleted the dead `GameLogic.calculateSpoilageRate` (zero call sites), rewrote `spoilage-rates.md` against the formula that actually runs (`StorageLogic.calculateSpoilage`, Autumn-only, Cold-Storage-priority, handling-quality-divided), and added a ratchet test proving exactly one spoilage implementation exists.**

## Performance

- **Duration:** 27 min
- **Started:** 2026-09-16T22:28:00Z (approx.)
- **Completed:** 2026-09-16T22:55:34Z
- **Tasks:** 3/3 completed
- **Files modified:** 6 (1 backend, 3 docs, 1 new test file, 1 new deferred-items log)

## Accomplishments

- `GameLogic.calculateSpoilageRate` — dead code with a fictional 100%/80%/20% return table and zero real callers — is gone from `backend/game_logic.mo`. `StorageLogic.calculateSpoilage` is now unambiguously the only spoilage system, verified untouched (`git diff backend/storage_logic.mo` empty).
- Verified on a live replica, not just by compiling: fresh player, no infrastructure, no hired labor, inventory forced to 12,400 kg, driven through `advancePhase` to the Storage(Autumn)→CutAndPrune(Winter) boundary. Observed `cherries 12_400 -> 9_796`, which matches `StorageLogic.calculateSpoilage(15, 70) = 21%` exactly (`(12400*21)/100 = 2604` spoiled).
- `docs/game-design/economy/spoilage-rates.md` fully rewritten: live formula, Nat-division-floors behavior, Autumn-only trigger stated plainly, Cold-Storage-beats-Warehouse priority rule (preserved from the old doc, now attached to the right function), full `getHandlingQuality` range, five worked examples across all storage/labor tiers, and a "what was removed and why" note.
- Two other docs (`math-consistency.md`, `CURRENT-STATE-2026-07-29.md`) that repeated the same dead 100/80/20 table got a one-line correction pointer each, not a rewrite — kept in scope per the plan's explicit boundary.
- New ratchet `frontend/src/__tests__/backendHygiene.test.ts` (3 tests) walks `backend/**/*.mo` (excluding `main_mainnet.mo`, EOP-01), strips comments, and asserts (1) the dead identifier never reappears and (2) exactly one `calculateSpoilage*` declaration exists anywhere, and it's in `storage_logic.mo`. Both assertions proven to actually catch a regression by deliberately breaking each, observing the failure, then reverting.

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete the dead function, prove the backend still runs** - `53801dd` (fix)
2. **Task 2: Rewrite spoilage-rates.md against the live formula** - `d228f68` (docs)
3. **Task 3: Ratchet "exactly one spoilage implementation"** - `89d055e` (test)

_Note: Task 3 (`tdd="true"`) followed the plan's explicit "break it to prove it works" verification pattern rather than a classic RED→GREEN cycle — the underlying fix (deletion) was already committed in Task 1, so there was no failing-then-passing feature to build; instead both ways the ratchet can break were deliberately reproduced and reverted before the single commit, matching this codebase's existing ratchet-test convention (`legacyShellScripts.test.ts`)._

## Files Created/Modified

- `backend/game_logic.mo` - deleted the dead `calculateSpoilageRate` function and its preceding comment (22 lines removed)
- `docs/game-design/economy/spoilage-rates.md` - full rewrite describing `StorageLogic.calculateSpoilage`
- `docs/game-design/economy/math-consistency.md` - one-line correction pointer above its own stale spoilage table
- `docs/game-design/CURRENT-STATE-2026-07-29.md` - one-line "Resolved (ECON-05)" pointer appended to its historical audit entry
- `frontend/src/__tests__/backendHygiene.test.ts` - new ratchet test (3 assertions/tests)
- `.planning/phases/03-core-economic-lever-fixes/deferred-items.md` - new log, one out-of-scope discovery (see below)

## Decisions Made

- Deleted the dead function outright rather than deprecating it — confirmed zero call sites first via `grep -rn "calculateSpoilageRate" backend/ frontend/ docs/ execution/`, which found only the function's own declaration plus documentation prose.
- Did not touch `StorageLogic.applySpoilage`, even though it is also dead code (see Issues Encountered) — out of scope for ECON-05, which names only `GameLogic.calculateSpoilageRate`, and the plan's `<prohibitions>` forbid modifying `calculateSpoilage`'s module sibling.
- Added correction pointers instead of rewriting `math-consistency.md` and `CURRENT-STATE-2026-07-29.md` wholesale, per the plan's `<action>` instructions for Task 2 ("do not rewrite those files wholesale — out of scope").
- Excluded `backend/main_mainnet.mo` from the new ratchet's file walk with an inline EOP-01 comment, matching the same reasoning `validate.sh`'s `motoko()` gate already uses for Track B.

## Deviations from Plan

None — plan executed exactly as written. The `deferred-items.md` entry below is a discovery, not a fix, and no code beyond the plan's stated scope was changed.

## Issues Encountered

- While reading `backend/storage_logic.mo` for the doc rewrite, found that `StorageLogic.applySpoilage` (the function immediately below `calculateSpoilage` in the same file) has zero call sites — `backend/main.mo`'s Autumn-transition code computes the identical arithmetic inline (`main.mo:1515`) instead of calling it. This is a second, smaller instance of exactly the pattern ECON-05 fixes, but for a different, unnamed function outside this plan's stated scope. Logged to `.planning/phases/03-core-economic-lever-fixes/deferred-items.md` rather than fixed, per the executor's scope boundary (only auto-fix issues directly caused by the current task's changes) and the plan's own prohibition on modifying `calculateSpoilage`'s sibling.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ECON-05 fully closed: one spoilage implementation, accurate docs, a ratchet that will fail loudly (naming the offending file) if a second implementation or the dead name ever reappears.
- `backendHygiene.test.ts` establishes a reusable shape (recursive `.mo` walk + comment-stripping + EOP-01 exclusion) that later phases can extend for other "exactly one implementation" invariants without re-deriving the pattern.
- `deferred-items.md` now exists as a phase-scoped log for future out-of-scope discoveries — worth checking before closing out Phase 3.
- No blockers for the remaining Phase 3 plans (03-03 through 03-07); this plan touched only `game_logic.mo`, docs, and a new test file, none of which any other Phase 3 plan depends on per 03-RESEARCH.md's architecture map.

---
*Phase: 03-core-economic-lever-fixes*
*Completed: 2026-09-16*

## Self-Check: PASSED

All created/modified files found on disk; all three task commit hashes (53801dd, d228f68, 89d055e) found in git log.
