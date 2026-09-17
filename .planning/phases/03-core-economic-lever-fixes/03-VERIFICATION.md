---
phase: 03-core-economic-lever-fixes
verified: 2026-09-17T00:00:00Z
status: passed
score: 7/7 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 3: Core Economic Lever Fixes Verification Report

**Phase Goal:** Close the "dead lever" findings from the 2026-07-29 audit — small, mostly independent fixes bundled into one phase.
**Verified:** 2026-09-17
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth (roadmap success criterion) | Status | Evidence |
|---|---|---|---|
| 1 | Fertilizer type selection produces a measurably different outcome | ✓ VERIFIED | `backend/game_logic.mo:88` `getFertilizerTypeModifier` (`SyntheticIntensive` → 1.05, else 1.0), threaded as trailing `fertilizerTypeMod` into `calculateYieldPotential` (`game_logic.mo:143`). Type persisted per parcel in `stableParcelFertilizerTypes` side-table (`main.mo`), validated against a closed set before any state write. TS mirror in `gameLogic.ts` + 7-case parity block. Live-replica proof in commit `84affbe`: canister upgrade preserved existing farm data byte-for-byte; oracle-break exercise (bumped TS constant to 1.10) failed 2 named tests, confirmed, reverted. Picker wired end-to-end (`ParcelCard.tsx`, `ImperialOrchard.tsx` → `App.tsx handleParcelAction` → `fertilize.mutate`) with no hardcoded literal at any call site (commits `827abf2`, `a4849ce`). |
| 2 | Season affects sale price | ✓ VERIFIED | `backend/game_logic.mo:161` `getSeasonSaleMultiplier` (Spring 0.9/Summer 1.15/Autumn 1.0/Winter 0.75, D-03), threaded into both `calculateRetailPrice` and `calculateWholesalePrice`. `getMarketPrices` is now caller-aware and reports the real value (no hardcoded `1.0`); Candid-identical (`dfx generate` diff empty). TS mirror in `gameLogic.ts`, consumed by `SellModal.tsx`'s season row (no 4th independent reimplementation). Live-replica proof in commits `7a62de1`/`123dc27`: `getMarketPrices` read back 0.75 (Winter)/0.9 (Spring)/1.0 (anonymous fallback, no trap), matching D-03 exactly; retail/wholesale sale amounts differed measurably by season with the swing traced and reconciled against the pre-existing AI-dormancy market-multiplier interaction. |
| 3 | Auction runner-up receives the (already-computed) trickle-down amount | ✓ VERIFIED | `AuctionLogic.resolveContract` computes `runnerUpVolumeKg`/`runnerUpTricklePLN` (`auction_logic.mo:453-470`, previously unused reserved constants), returned on `AuctionResult` (`types.mo:555-557`). `_performGlobalAuctionResolution` credits an AI runner-up (`main.mo:3318-3340`, commit `338a9a3`) and a player runner-up via the `stableRunnerUpCredits` side-table consumed exactly once in `resolveSeasonAuctions` (`main.mo:3437,3497`, commit `7d7cca5`). Winner's `winRevenue` formula untouched (additive, per D-05). Live-replica proof: AI direction (Hans totalRevenue 0→31,000, figures matching hand-computed formula); player direction (upgrade-preserves-data proof + "Trickle +18000 PLN" observed on a real resolved contract, cash 130,214→148,214). |
| 4 | Player gains prestige on winning an Imperial Contract, matching AI competitors | ✓ VERIFIED | `main.mo:3392-3415` (`reputationGain += 5` in the player win loop), capped via `Nat.min(100, reputationAfterLoss + reputationGain)` composing loss-then-gain correctly (`main.mo:3510`, commit `d405a1c`). Live-replica proof: reputation 50→55 (single win), 55→70 (multi-win), cap-overshoot proven exactly at 100 (not 115) on a +20-point season. Transcription-oracle break-it exercise removed the cap and 2/13 tests failed by name. |
| 5 | Only one spoilage system exists in code, and it matches what's documented | ✓ VERIFIED | `GameLogic.calculateSpoilageRate` deleted outright (commit `53801dd`), confirmed zero occurrences outside comments/docs prose (`grep -rn "calculateSpoilageRate" backend/ frontend/src docs/`). `StorageLogic.calculateSpoilage` is the sole implementation, untouched. `docs/game-design/economy/spoilage-rates.md` rewritten against the live formula with file:line citations. `backendHygiene.test.ts` ratchets "exactly one `calculateSpoilage*` declaration" and is part of the green suite. Backend still type-checks (`./validate.sh backend` → Track A ok). |
| 6 | `CompetitorsPanel` reads real fields, no fabricated numbers | ✓ VERIFIED | `CompetitorsPanel.tsx:36,40` reads `comp.productionCapacity` (typed `AICompetitor`, no `any` cast anywhere in the file), a real field confirmed present in `backend/types.mo:403`, `competitor_logic.mo`, and the generated `backend.did.d.ts`. The `+4.2%` hardcoded Market Trend tile and the fabricated player market-share are gone; the player row explicitly renders `capacityKg: null` → an em-dash rather than inventing a figure. Regional Output tile sums real capacities. Pinned by `competitorsPanel.test.tsx`. |
| 7 | AI archetype names (Marek/Kasia/Hans) are consistent across code, UI, and docs | ✓ VERIFIED | `backend/competitor_logic.mo:72-109`: Marek/`#Traditionalist`, Kasia/`#Innovator`, Hans/`#Businessman` — canonical triad. `frontend/src/lib/gddTemplate.ts:320,348,377,398` uses the same three names with matching archetype labels; no superseded names (`Jan Kowalski`/`Anna Nowak`/`Piotr Wiśniewski`) found anywhere under `frontend/src`. Ratchet test in `uiConventions.test.ts` guards regression (forbidden-string list split at runtime so the test's own source doesn't self-trip). |

**Score:** 7/7 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `backend/game_logic.mo :: getFertilizerTypeModifier` | ECON-01 modifier fn | ✓ VERIFIED | Present, exact 1.05/1.0 split, exported and used |
| `backend/game_logic.mo :: getSeasonSaleMultiplier` | ECON-02 season fn | ✓ VERIFIED | Present, 4-way table, used in both price fns and `getMarketPrices` |
| `backend/auction_logic.mo` (resolveContract trickle fields) | ECON-03 | ✓ VERIFIED | `runnerUpVolumeKg`/`runnerUpTricklePLN` computed and returned |
| `backend/main.mo` (`reputationGain`, `stableRunnerUpCredits`) | ECON-03/04 | ✓ VERIFIED | Present, wired, live-replica proven |
| `backend/storage_logic.mo :: calculateSpoilage` (sole survivor) | ECON-05 | ✓ VERIFIED | `GameLogic.calculateSpoilageRate` deleted, ratchet test present |
| `frontend/src/components/social/CompetitorsPanel.tsx` | ECON-06 | ✓ VERIFIED | Typed `AICompetitor`, no `any`, no hardcoded tile |
| `backend/competitor_logic.mo` + `frontend/src/lib/gddTemplate.ts` | ECON-07 | ✓ VERIFIED | Single naming scheme, ratchet test present |
| `frontend/src/lib/fertilizerTypes.ts`, `FertilizerTypeMenu.tsx` | ECON-01 picker | ✓ VERIFIED | Present, substantive, wired to both fertilize entry points |
| `frontend/src/__tests__/{economyParity,auctionTrickle,competitorsPanel,backendHygiene,fertilizerPicker}.test.ts(x)` | test coverage | ✓ VERIFIED | All present, all green (see Behavioral Spot-Checks) |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `ParcelCard.tsx` / `ImperialOrchard.tsx` | `App.tsx handleParcelAction` | `onAction('fertilize', parcelId, fertilizerType)` | ✓ WIRED | Both entry points call through; no hardcoded literal remains at any call site |
| `App.tsx` | `useFarm.ts fertilize.mutate` | `fertilize.mutate({parcelId, fertilizerType})` | ✓ WIRED | Confirmed at `App.tsx:255` |
| `backend/game_logic.mo getFertilizerTypeModifier` | `frontend/src/lib/gameLogic.ts` (mirror) | parity test | ✓ WIRED | `economyParity.test.ts` fertilizer-type describe block, green |
| `GameLogic.getSeasonSaleMultiplier` | `main.mo sellCherries` (retail + wholesale) | direct call, both branches | ✓ WIRED | `main.mo:1385,1400` |
| `GameLogic.getSeasonSaleMultiplier` | `main.mo getMarketPrices.seasonMultiplier` | caller-aware query | ✓ WIRED | `main.mo:2926-2940` |
| `gameLogic.ts getSeasonSaleMultiplier` | `SellModal.tsx` season row | import, not re-typed | ✓ WIRED | `SellModal.tsx:13,93` |
| `AuctionLogic.resolveContract` | `main.mo _performGlobalAuctionResolution` | `result.runnerUpId/VolumeKg/TricklePLN` | ✓ WIRED | AI branch `main.mo:3318-3340`; player branch via `stableRunnerUpCredits` |
| `backend/competitor_logic.mo` archetype names | `frontend/src/lib/gddTemplate.ts` | static string match | ✓ WIRED | Ratchet test in `uiConventions.test.ts` |
| `useCompetitors()` | `CompetitorsPanel` row mapping | typed `AICompetitor[]` | ✓ WIRED | No `any`, confirmed field exists in Candid declarations |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Targeted phase test files (economyParity, auctionTrickle, competitorsPanel, backendHygiene, fertilizerPicker, uiConventions) | `npx vitest run <6 files>` | 210/210 passed | ✓ PASS |
| Full frontend suite | `npm test` | 490 passed, 3 skipped, 0 failed | ✓ PASS |
| Backend type-check (Track A) | `./validate.sh backend` | Track A: ok; Track B: known-broken (EOP-01, pre-existing, not phase-3-caused) | ✓ PASS |
| Lint | `npm run lint` | 0 errors, 182 warnings (within ratchet ceiling, not raised) | ✓ PASS |
| Typecheck | `npm run typecheck` | Clean, no errors | ✓ PASS |
| Track B (`main_mainnet.mo`) untouched by phase 3 | `git log -- backend/main_mainnet.mo` | Last touching commit predates phase 3 (MAINT-01/02) | ✓ PASS |
| Live-replica evidence (ECON-01/02/03/04) | commit messages `338a9a3`, `d405a1c`, `7d7cca5`, `7a62de1`, `123dc27`, `84affbe` | Concrete before/after numbers quoted, cross-checked against formula by hand, upgrade-preserves-data proven, oracle break-it exercises performed | ✓ PASS (documented evidence, consistent with code read) |

### Probe Execution

N/A — this project does not use `scripts/*/tests/probe-*.sh` style probes; none declared in any Phase 3 plan or found on disk. Skipped.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| ECON-01 | 03-06, 03-07 | Fertilizer type produces different outcome | ✓ SATISFIED | Backend formula + persistence + UI picker, replica-verified |
| ECON-02 | 03-05 | Season affects sale price | ✓ SATISFIED | Real 4-way multiplier wired into both price fns + `getMarketPrices` |
| ECON-03 | 03-03, 03-04 | Runner-up receives trickle | ✓ SATISFIED | Both AI and player directions credited, replica-verified |
| ECON-04 | 03-04 | Player prestige on contract win | ✓ SATISFIED | +5 flat, capped at 100, replica-verified |
| ECON-05 | 03-02 | One spoilage system | ✓ SATISFIED | Dead function deleted, doc rewritten, ratchet test |
| ECON-06 | 03-01 | CompetitorsPanel real fields | ✓ SATISFIED | Typed field, no fabricated numbers |
| ECON-07 | 03-01 | Archetype naming consistency | ✓ SATISFIED | Single scheme, ratchet test |

All 7 requirement IDs declared across the phase's 7 plans match REQUIREMENTS.md's Phase 3 assignment exactly (`ECON-01..07`, all rows marked "Complete"). No orphaned requirements found — REQUIREMENTS.md maps no additional Phase-3 ID that isn't claimed by a plan.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| `backend/main.mo` | 2504-2505 | `county = "TBD"` / `commune = "TBD"` | ℹ️ Info | Pre-existing (git blame: commit `63bb16f`, 2026-02-08 — 7 months before this phase), unrelated to ECON-01..07, in a file this phase also modified for other reasons. Already formally tracked as GEO-03/GEO-07 in REQUIREMENTS.md. Not introduced or newly discovered by Phase 3; not a debt-marker gate violation for this phase's own scope. |

No TBD/FIXME/XXX/TODO/placeholder/stub markers found in any of the 13 files this phase's plans directly created or modified for ECON-01..07 (`CompetitorsPanel.tsx`, `gddTemplate.ts`, `game_logic.mo`, `auction_logic.mo`, `types.mo`, `gameLogic.ts`, `SellModal.tsx`, `ParcelCard.tsx`, `ImperialOrchard.tsx`, `App.tsx`, `fertilizerTypes.ts`, `FertilizerTypeMenu.tsx`, and the new test files).

### Known Out-of-Scope Findings (not gating this phase)

Per the code review (`03-REVIEW.md`) and the explicit scope note accompanying this verification request, the following are real defects but are **not** part of ECON-01..07 and do not block Phase 3's goal achievement — they are logged as new backlog requirements in `REQUIREMENTS.md` (unmapped to a phase), consistent with CLAUDE.md's "never paper over a known defect" rule combined with not silently expanding this phase's scope:

- **ECON-08** — `resolveSeasonAuctions`'s Pre-Season Future shortfall check re-reads a stale pre-loop `totalDelivered` across multiple committed PSFs (main.mo:3446-3491). Pre-existing (confirmed via `git log -L`), not introduced by any Phase 3 plan, not related to ECON-01..07.
- **ECON-09** — `commitPreSeasonFuture`'s commitment fee is computed from an unvalidated caller-supplied `volumeKg` (main.mo:3131-3205). Pre-existing, same class.
- **ECON-10** — `ParcelCard.tsx`'s yield display calls `calculateYieldBreakdown` with no `fertilizerTypeMod` argument, so the UI's "Potential"/"Adjusted Yield" numbers under-report by ~4.76% for a Synthetic-Intensive-fertilized parcel. Confirmed by direct code read (`ParcelCard.tsx:69`, no 5th argument passed). Real, but the underlying ECON-01 backend formula is correct and replica-verified — this is a narrower "UI mirror completeness" gap than ECON-01's own roadmap success criterion ("Fertilizer type selection produces a measurably different outcome"), which is about the outcome existing and being real, not about every display surface reflecting it. Not a must-have of any Phase 3 plan (03-07's must-haves cover picker reachability and organic-warning behavior, not yield-display accuracy). Already logged as backlog ECON-10.
- **ECON-11** — Stale auction constants in the "Single Source of Truth" economy docs, an Ask-First balance-number question, already logged as backlog ECON-11.
- **QUAL-11** — Dead `FarmGrid`/`ParcelCard` render path in `App.tsx`, already logged as backlog QUAL-11, independently also noted in 03-07's own SUMMARY.

These do not appear in the `gaps` section below because none of them are must-haves of this phase's plans, and REQUIREMENTS.md already correctly reflects them as separate, unmapped, pending backlog items rather than folding them into Phase 3's "Complete" rows.

### Human Verification Required

None. All 7 truths are backed by static code evidence, a green automated test suite (490 tests), a clean backend type-check on the live track, and documented live-replica runs with concrete before/after numeric evidence in the commit history that is internally consistent with the formulas read directly from source.

### Gaps Summary

No gaps. All 7 roadmap success criteria for Phase 3 are verified against the actual codebase: each formula/fix exists, is substantive (not a stub), is wired end-to-end from backend through the TS mirror to the UI where applicable, and is covered by passing automated tests plus documented live-replica verification with real observed numbers. The five out-of-scope defects surfaced by this phase's own code review (ECON-08/09/10/11, QUAL-11) are correctly excluded from Phase 3's scope per the explicit instruction accompanying this verification and are already tracked as separate backlog requirements in REQUIREMENTS.md — they do not represent an unmet must-have of any of the 7 plans that made up this phase.

---

_Verified: 2026-09-17_
_Verifier: Claude (gsd-verifier)_
