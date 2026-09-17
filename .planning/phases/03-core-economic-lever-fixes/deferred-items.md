# Deferred Items — Phase 3

Out-of-scope discoveries found while executing phase plans. Logged, not fixed,
per the executor's scope boundary (only auto-fix issues directly caused by
the current task's changes).

## From 03-02 (ECON-05: spoilage system consolidation)

- **`StorageLogic.applySpoilage` is itself dead code — zero call sites.**
  Found while reading `backend/storage_logic.mo` to rewrite
  `docs/game-design/economy/spoilage-rates.md`. `backend/main.mo`'s Autumn
  transition computes spoilage inline
  (`spoiledCherries := (farm.inventory.cherries * spoilageRate) / 100;`,
  `main.mo:1515`) rather than calling `StorageLogic.applySpoilage(amount,
  spoilageRate)`, even though the two expressions compute the same thing
  minus one difference: `applySpoilage` clamps to 0 when
  `spoiledAmount >= amount`, but `main.mo`'s inline version has no such
  guard (relies on `spoiledCherries` never exceeding a realistic ~21-30%
  of inventory, since `handlingQuality` floors near 70-120 and `baseRate`
  tops out at 15). Not fixed here: ECON-05's scope is specifically
  `GameLogic.calculateSpoilageRate` (confirmed dead, confirmed deleted);
  `applySpoilage` is a different function with a different name, doesn't
  match the "one implementation" ratchet's `calculateSpoilage`-prefix
  scan (03-02 Task 3), and removing/wiring it is a judgment call about
  whether `main.mo` should call it instead of duplicating its logic —
  out of scope for a plan whose `<prohibitions>` explicitly forbid
  modifying `StorageLogic.calculateSpoilage`'s sibling. Worth a future
  small cleanup plan (either wire `main.mo` to call `applySpoilage`, or
  delete `applySpoilage` as a second piece of dead code — mirrors the
  exact shape of ECON-05 itself).

## From 03-05 (ECON-02: season sale price multiplier)

- **`backend/game_logic.mo` is a single module shared by both `main.mo`
  and `main_mainnet.mo`, not a per-track file.** Discovered while adding
  the `seasonMultiplier` trailing parameter to `calculateRetailPrice`/
  `calculateWholesalePrice`: both actors `import GameLogic "game_logic"`
  from the same file. Changing a shared pure function's arity therefore
  adds new type errors to Track B's own untouched call sites
  (`main_mainnet.mo:1180` and `:1194`, both `[M0096]` arity mismatches)
  even though `main_mainnet.mo` itself is never edited and `git diff
  backend/main_mainnet.mo` stays empty. Not a regression in the sense of
  newly-broken working code (Track B has not compiled since before this
  phase, per EOP-01, and no CI job builds it), but it means the previous
  belief that Track A changes to `game_logic.mo` could leave Track B's
  error *set* literally unchanged was wrong. `./validate.sh backend`'s
  `motoko()` gate only fails on Track A errors so this does not fail the
  gate. Folds into EOP-01: whoever eventually fixes Track B's compile
  errors will need `main_mainnet.mo`'s `calculateRetailPrice`/
  `calculateWholesalePrice` call sites updated to pass a season
  multiplier too (or Track B needs its own copy of `game_logic.mo`,
  which is a bigger architectural call outside this phase's scope).

- **`SellModal.tsx`'s inline price preview is missing the `saturationMult`
  term entirely** (pre-existing, not introduced by this plan). The real
  backend formula is `basePrice * marketSize * qualityBonus *
  organicPremium * saturationMult * seasonMultiplier * marketMult`; the
  modal's hand-rolled preview has never included a `saturationMult`
  factor, so the preview and the actual payout will diverge whenever a
  region's accumulated sale volume has pushed saturation below 1.0 (the
  `getSaturationMultiplier` decay in `main.mo`). Discovered while doing
  Task 3's mandated preview-vs-payout replica check: predicted (via the
  modal's own JS formula, hand-evaluated against real farm state) ~13.23
  PLN/kg; actual credited ~13.278 PLN/kg for the same 1000 kg retail sale
  in Spring — a small (~0.36%) but real and explainable gap. The modal
  also derives `avgQuality` from the raw `parcel.quality` field rather
  than recomputing `GameLogic.calculateQualityScore(p, infrastructure)`,
  and hand-rolls its own season-demand/AI-supply table (duplicating
  `competitor_logic.mo`'s `getSeasonDemand`/`simulateAITurn` rather than
  reading them) — both pre-existing and both out of this task's scope
  per 03-05-PLAN.md's explicit instruction to leave the rest of the
  inline formula as-is. Recorded here as the more precise version of that
  plan-mandated flag; a future cleanup plan should refactor
  `SellModal.tsx`'s entire preview to call the real `gameLogic.ts`
  formula functions once they exist, rather than patch this duplicate
  again term-by-term.

- **e2e/Playwright environment gap (update to 03-01's note): partial
  progress, not resolved.** 03-01-SUMMARY.md recorded that this machine
  had no Playwright browser cache at all. This session ran `npx
  playwright install chromium`, which did fetch the previously-missing
  `chromium_headless_shell-1223` binary — but launching it now fails one
  level deeper: `error while loading shared libraries: libnspr4.so:
  cannot open shared object file`. That is an OS-level package gap
  (Ubuntu 22.04, needs `libnspr4`/`libnss3` and friends via `sudo apt
  install` or `npx playwright install-deps`), requiring elevated
  privileges this task does not exercise without an explicit request.
  All 38 e2e specs still fail, for this new, more specific reason;
  `./validate.sh full`'s unit/lint/typecheck/build/declarations gates
  all pass. Still out of scope for ECON-02 (none of the failing specs
  touch any file this plan changed) — flagged here so the next plan that
  needs e2e green knows exactly which one command (`playwright
  install-deps`, run with sufficient privileges) is missing, rather than
  re-diagnosing from "Executable doesn't exist" again.
