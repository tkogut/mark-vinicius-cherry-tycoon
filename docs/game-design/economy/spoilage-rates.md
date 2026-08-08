# Spoilage Rates

> **Rewritten 2026-08-08 (ECON-05).** This file used to document a
> 100%/80%/20% table and instruct that `GameLogic.calculateSpoilageRate` "MUST
> return the values from this table". That function was **never called from
> anywhere** — the documented system was fiction, and the system that actually
> ran was documented nowhere. The dead function is deleted; what follows is
> what the code does.

## What actually runs

Spoilage is applied in `_advanceSeasonInternal` (`backend/main.mo`) to
`inventory.cherries`, and it fires **once per year, not once per season**: the
whole block is guarded by `if (farm.currentSeason == #Autumn)`, so it only
happens on the Autumn → Winter transition (the `Storage` → `CutAndPrune` phase
step). Cherries held through Spring, Summer or Autumn do not rot at all.

Verified on a live replica 2026-08-08: 100 000 kg survived the Spring→Summer
and Summer→Autumn transitions untouched, then dropped to 79 000 kg entering
Winter — a single 21% event, matching `15 * 100 / 70` for no storage and
unhired labour.

Two inputs:

**1. Base rate — best storage the player owns.** Cold Storage wins over a
Warehouse; owning both is the same as owning Cold Storage.

| Storage owned | Base rate |
|---|---|
| None | 15% |
| Warehouse | 8% |
| Cold Storage | 2% |

**2. Handling quality — the labour contract** (`HiringLogic.getHandlingQuality`).
Note that it *divides*, so a value above 100 reduces spoilage and below 100
increases it:

| Labour | Quality |
|---|---|
| City | 120 |
| Standard | 100 |
| Village | 80 |
| Emergency | 70 |
| **None hired** | **70** — unhired is treated as the worst case, not as neutral |

**Formula** (`StorageLogic.calculateSpoilage`, integer arithmetic throughout):

```
spoilagePercent = baseRate * 100 / handlingQuality
spoiledKg       = cherries * spoilagePercent / 100
```

`handlingQuality == 0` returns `baseRate` unchanged, guarding the division.

### Worked range

Integer division throughout, so these are exact:

| Storage | Labour | Loss entering Winter |
|---|---|---|
| None | Emergency / unhired (70) | 21% |
| None | Standard (100) | 15% |
| None | City (120) | 12% |
| Warehouse | Standard (100) | 8% |
| Cold Storage | Emergency (70) | 2% |
| Cold Storage | City (120) | 1% |

Storage dominates, labour trims. The worst case loses about a fifth of stored
cherries once a year — not everything, as the old 100% table claimed.

The base-rate loop is written so Cold Storage wins over a Warehouse regardless
of the order `infrastructure` happens to be in (the Warehouse branch is guarded
by `baseRate > 5`). Worth stating explicitly because the *yield* multiplier in
the same codebase is order-dependent — see `ECON-PARITY-01`.

### Not modelled

Time in storage, cherry variety, organic vs conventional, and weather have
**no** effect on spoilage. `inventory.organicCherries` is not touched by the
spoilage block at all — only `cherries` rots. Rate depends solely on the two
inputs above, and only once a year.

## Upgrade Cost Scaling

| Asset | Formula |
|---|---|
| Golden Harvester | `baseCost × 1.15^Level` (COMPOUNDING) |
| Warehouse | `25,000 PLN` (flat) |
| Cold Storage | `40,000 PLN` (flat) |
| Tractor | `30,000 PLN` (flat) |
| Shaker | `60,000 PLN` (flat) |
| Maintenance | see below — this row used to read "1%/season (Warehouse only)", which has been wrong since MAINT-01 |

**Maintenance (corrected 2026-08-08, MAINT-01/02).** Every asset pays annual
upkeep, not just the Warehouse: machinery 2% of purchase price, buildings 1%
(`GameLogic.getMaintenancePercentage`). Upkeep then **drifts upward** by 10% of
spec per season transition, capped at 200% of spec, until the player runs
`inspectAndRepair` during the `Maintenance` phase — which costs half the
accumulated wear and resets upkeep to spec.

## Weather Impact on Water Level

| Weather | Water Depletion | Expected Level After Turn |
|---|---|---|
| Sunny | Normal (-10%) | 70–80% |
| Hot/Dry | High (-25%) | 50–60% |
| Heatwave | Critical (-40%) | 30–40% |
| Rainy | Replenished (+20%) | 90–100% |
| Drought | Severe (-50%) | 20–30% |

**Optimal Water Level**: `75%–85%`. Below 50% triggers quality penalty.
