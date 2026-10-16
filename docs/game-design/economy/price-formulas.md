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

Applying `SyntheticIntensive` to an organic parcel is permitted and does
**not** change `isOrganic` — fertilizer type and organic certification are
independent axes (D-02); the fertilize path never reads, writes, or branches
on `isOrganic`.

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
