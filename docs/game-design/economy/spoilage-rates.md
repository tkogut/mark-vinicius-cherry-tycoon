# Spoilage Rates

> **What was removed and why (ECON-05, 2026-09-16):** this document used to describe
> `GameLogic.calculateSpoilageRate` (`backend/game_logic.mo`, formerly lines 46-65),
> which returned a flat 100% / 80% / 20% by infrastructure. That function had **zero
> call sites** anywhere in the codebase — it was dead code, and the numbers below
> were never applied to a single player's inventory. The function has now been
> deleted outright. If you find the 100%/80%/20% table repeated elsewhere (git
> history, another doc), it describes code that never ran; treat it as fiction, not
> as a prior version of this system. The formula below — `StorageLogic.calculateSpoilage`
> — is, and always was, the only spoilage system that actually executes.

## The live formula

Source: `backend/storage_logic.mo:9`.

```motoko
// FinalSpoilage% = (baseRate * 100) / handlingQuality
public func calculateSpoilage(baseRate: Nat, handlingQuality: Nat) : Nat {
  if (handlingQuality == 0) {
    return baseRate; // Fallback to avoid div by zero
  };
  return (baseRate * 100) / handlingQuality;
};
```

- `baseRate` and `handlingQuality` are both `Nat` percentages (e.g. `15` means 15%,
  `100` means neutral handling quality).
- `handlingQuality == 0` short-circuits and returns `baseRate` unchanged — this guard
  exists purely to avoid a division-by-zero trap; in practice `handlingQuality` never
  reaches 0 through the normal labor-hiring path (see below), so this branch is a
  defensive fallback, not a reachable game state today.
- The division is **Motoko `Nat` division, which floors** (truncates toward zero,
  never rounds). `(15 * 100) / 70 = 1500 / 70 = 21.428...`, which floors to `21`, not
  `21.4` or `21.43`. Every worked example below carries this truncation through.

The result of `calculateSpoilage` is then applied to inventory inline in
`backend/main.mo:1515`:

```motoko
spoiledCherries := (farm.inventory.cherries * spoilageRate) / 100;
```

(Again `Nat` division, floors.) This is the only place spoilage is subtracted from
`farm.inventory.cherries` anywhere in the backend.

## When spoilage runs

**Only at the transition out of Autumn — not every season.** Source:
`backend/main.mo:1502-1515`, inside `_advanceSeasonInternal`, guarded by:

```motoko
if (farm.currentSeason == #Autumn) {
  // ... spoilage runs here ...
};
```

`_advanceSeasonInternal` is invoked from `advancePhase()` exactly once per season
boundary, when the next phase's season differs from `farm.currentSeason`
(`main.mo:1691-1696`). The phase→season mapping means this guard is only true on the
single call that moves the farm from the `#Storage` phase (season `#Autumn`) to the
`#CutAndPrune` phase (season `#Winter`) — i.e. spoilage represents produce rotting
over the winter after the Autumn harvest/storage window closes. Spring→Summer and
Summer→Autumn transitions run the same season-advance code path but skip the
spoilage block entirely because the guard is false. There is no per-season spoilage
in Spring, Summer, or Winter itself — only the one Autumn-exit event per year.

## Base rate by infrastructure

Source: `backend/main.mo:1508-1511`.

| Infrastructure present | Base rate |
|---|---|
| None | 15% |
| Warehouse (only, or with base rate not already ≤ 5) | 8% |
| Cold Storage | 2% |

The selection loop:

```motoko
var baseRate : Nat = 15; // default 15%
for (infra in farm.infrastructure.vals()) {
  if (infra.infraType == #ColdStorage) { baseRate := 2 }
  else if (infra.infraType == #Warehouse and baseRate > 5) { baseRate := 8 };
};
```

**Cold Storage always wins over Warehouse, regardless of array order.** This is
because the `#ColdStorage` branch assigns `baseRate := 2` unconditionally on every
match, while the `#Warehouse` branch only fires while `baseRate > 5` is still true.
If Cold Storage is encountered anywhere in the loop — before or after Warehouse —
`baseRate` ends at `2`; a later Warehouse entry cannot raise it back to `8` because
`2 > 5` is false. If Warehouse is encountered with no Cold Storage anywhere in the
array, `baseRate` ends at `8`. With neither, it stays at the default `15`. This
priority behavior is the one thing the old, now-deleted doc got right — just about
the wrong function; it is preserved here because it still describes real behavior.

## Organic stock (ECON-12)

`inventory.organicCherries` is spoiled by the same `spoilageRate` as `inventory.cherries`
(`spoiledOrganic = organicCherries * spoilageRate / 100`, same floor division). It used to be
skipped by the block entirely, which gave an organic grower the 40% price premium and
free storage. Observed on a local replica (no storage, Emergency labour, rate 21%):
100 000 kg conventional -> 79 000 and 50 000 kg organic -> 39 500 entering Winter.

## Handling quality

Source: `backend/hiring_logic.mo:47-55`, `getHandlingQuality(labor: ?LaborType)`.
This is the full, exhaustive range — there is no case this function can return
outside these four values plus the `null` default:

| `hiredLabor` | `handlingQuality` |
|---|---|
| `#Village` | 80 (penalty) |
| `#Standard` | 100 (neutral) |
| `#City` | 120 (bonus) |
| `#Emergency` | 70 (severe penalty) |
| `null` (unhired) | 70 (severe penalty — same as Emergency) |

Higher `handlingQuality` divides the base rate down, so better labor reduces
spoilage. An unhired farm is treated as harshly as an Emergency hire.

## Worked examples

All examples use a 12,400 kg inventory (the value used for live-replica
verification in this repo — see the ECON-05 execution commit). Each row shows
`spoilageRate = (baseRate * 100) / handlingQuality` (floored), then
`spoiled = (12,400 * spoilageRate) / 100` (floored), then the resulting inventory.

| Storage tier | `baseRate` | `hiredLabor` | `handlingQuality` | `spoilageRate` | Spoiled (kg) | Final cherries |
|---|---|---|---|---|---|---|
| None | 15 | `null` (unhired) | 70 | `1500/70` → 21 | `12400*21/100` → 2604 | 9,796 |
| None | 15 | `#Standard` | 100 | `1500/100` → 15 | `12400*15/100` → 1860 | 10,540 |
| Warehouse | 8 | `#Standard` | 100 | `800/100` → 8 | `12400*8/100` → 992 | 11,408 |
| Cold Storage | 2 | `#Standard` | 100 | `200/100` → 2 | `12400*2/100` → 248 | 12,152 |
| Cold Storage | 2 | `#City` | 120 | `200/120` → 1 | `12400*1/100` → 124 | 12,276 |

The first row (no storage, unhired labor, 12,400 → 9,796 kg) was observed directly
against a live replica during ECON-05's implementation: `dfx deploy backend`, a
fresh player with no infrastructure and no hired labor, `debugSetInventory(12400,
0)`, then `advancePhase` driven through the Autumn→Winter boundary. The remaining
rows are re-derived from the same formula and cited sources, not independently
replica-verified, per this doc's "re-derive rather than trust" convention — anyone
doubting a row should recompute it from `backend/storage_logic.mo:9` and
`backend/hiring_logic.mo:47-55` rather than trust the table.

## Sources

- `backend/storage_logic.mo:9` — `StorageLogic.calculateSpoilage`, the formula.
- `backend/storage_logic.mo:17-23` — `StorageLogic.applySpoilage`. Note: this
  function is **not** called by `main.mo`; the Autumn-transition code computes the
  same arithmetic inline instead (`main.mo:1515`). Out of scope for ECON-05 (see
  `.planning/phases/03-core-economic-lever-fixes/deferred-items.md`).
- `backend/main.mo:1502-1515` — the only call site, inside `_advanceSeasonInternal`.
- `backend/main.mo:1691-1696` — how `advancePhase()` decides when to invoke
  `_advanceSeasonInternal`, establishing the Autumn-only trigger.
- `backend/hiring_logic.mo:47-55` — `HiringLogic.getHandlingQuality`.
