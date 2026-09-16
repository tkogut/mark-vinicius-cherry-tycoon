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
