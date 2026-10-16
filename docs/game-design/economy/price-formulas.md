# Price & Yield Formulas — AntiGravity Economy
> **Rule**: Ten plik to `Single Source of Truth`. NIGDY nie twórz nowych wzorów bez aktualizacji tego pliku.
> Jeśli `economic-math-auditor/references/math_consistency.md` i ten plik są sprzeczne, **ten plik wygrywa**.

## Yield Formula

```
Yield (kg) = Base × Soil × pH × Fertility × Infrastructure × Water × Organic × TreeAge × County × FertilizerType
```

| Multiplier | Factor |
|---|---|
| Infrastructure | Additive terms (Tractor +0.05, Shaker +0.08, Sprayer +0.03, ColdStorage +0.02 per level) are summed onto 1.0 first; Golden Harvester's compounding `1.05^Level` multiplies that sum last. Order-independent (ECON-PARITY-01) |
| Głubczyce county | ×1.10 |
| Opole county | ×1.08 |
| Namysłów county | ×1.05 |
| Fertilizer type (ECON-01, D-01, plan 03-06) | `OrganicCompatible` ×1.0, `SyntheticStandard` ×1.0, `SyntheticIntensive` ×1.05 |

### Fertilizer type (ECON-01, D-01)

Three canonical wire strings — exact, case-sensitive, no hyphenation on the
wire (hyphenated forms are display labels only, plan 03-07's picker):
`OrganicCompatible`, `SyntheticStandard`, `SyntheticIntensive`. Only
`SyntheticIntensive` carries a yield effect (+5%); the other two, and any
value that doesn't match one of the three, are yield-neutral (1.0) — this
includes a parcel that has never been fertilized. See
`backend/game_logic.mo:88` (`getFertilizerTypeModifier`) and
`backend/game_logic.mo:143` (the `fertilizerTypeMod` term, appended last in
the product, after `countyMod`).

The type applied to a parcel is validated server-side against the closed set
in `backend/main.mo`'s `fertilizeParcel` (`backend/main.mo:905`) before any
state is read or written, then persisted in a stable-var side-table —
`stable var stableParcelFertilizerTypes : [(Text, Text)]`
(`backend/main.mo:101`), keyed by parcel id — rather than as a new field on
`CherryParcel`. The harvest path (`backend/main.mo:678`) looks the type up
and converts it to a modifier via `getFertilizerTypeModifier`, defaulting to
1.0 for a parcel with no entry.

**Cost and rules (ECON-REBALANCE, 2026-10-16).** Every application consumes one
`inventory.fertilizers` unit whatever the type; the types differ in the cash
charged, so Intensive's +5% yield is paid for instead of free.

| Type | Labour | Operations | Total PLN | Yield | Allowed on |
|---|---|---|---|---|---|
| `SyntheticStandard` | 300 | 200 | 500 (the flat price before the rebalance) | x1.0 | conventional parcels |
| `SyntheticIntensive` | 480 | 320 | 800 (+300, +60%) | x1.05 | conventional parcels |
| `OrganicCompatible` | 390 | 260 | 650 | x1.0 | every parcel; the only type on organic ones |

- Synthetic types are refused on a parcel that is `isOrganic` or `organicCertified`
  (`Organic parcels accept only OrganicCompatible fertilizer`). This replaces D-02,
  which kept Synthetic-Intensive selectable on organic parcels with a warning.
- One application per parcel per season: a parcel whose `lastFertilized` equals the
  current `seasonNumber` is refused (`This parcel was already fertilized this season`).
- The fertilize path still does not change `isOrganic`; it only reads it to refuse.
- Source: `GameLogic.getFertilizerCost` / `isSyntheticFertilizer` in
  `backend/game_logic.mo`, mirrored by `FERTILIZER_COSTS` in `frontend/src/lib/gameLogic.ts`
  and pinned in `economyParity.test.ts`.

## Quality Score (0–100, capped at 100)

```
quality = 50 + soil_bonus + ph_bonus + fertility_bonus + water_bonus + tree_age_bonus + infra_bonus
```

| Infrastructure | Quality Impact |
|---|---|
| Sprayer | +5.0 pts/lvl |
| ColdStorage | +3.0 pts/lvl |
| Shaker | −2.0 pts/lvl |

## Pricing Multipliers

| Channel | Formula | Max |
|---|---|---|
| Retail | `1.0 + (quality/100 × 0.3)` | +30% |
| Wholesale | `1.0 + (quality/100 × 0.1)` | +10% |

## Phase 8.0 Auction Formulas

```
Bid Score   = (margin × (1000 + prestige) × qualityMult) / 100
              qualityMult = 120 (Bio/Organic), 100 (others)

Flood Factor = spotPrice × (1000 - min(uncontractedKg/100, 900)) / 1000
Future Price = basePrice × 93 / 100
Buyback      = shortfallKg × spotPrice × 125 / 100
Default Pen. = shortfallKg × lockedPrice × 150 / 100
```
