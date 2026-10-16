# Price & Yield Formulas — AntiGravity Economy
> **Rule**: Ten plik to `Single Source of Truth`. NIGDY nie twórz nowych wzorów bez aktualizacji tego pliku.
> Jeśli `economic-math-auditor/references/math_consistency.md` i ten plik są sprzeczne, **ten plik wygrywa**.

## Yield Formula

```
Yield (kg) = Base × Soil × pH × Fertility × Infrastructure × Water × Organic × TreeAge
```

| Multiplier | Factor |
|---|---|
| Infrastructure | Additive terms (Tractor +0.05, Shaker +0.08, Sprayer +0.03, ColdStorage +0.02 per level) are summed onto 1.0 first; Golden Harvester's compounding `1.05^Level` multiplies that sum last. Order-independent (ECON-PARITY-01) |
| Głubczyce county | ×1.10 |
| Opole county | ×1.08 |
| Namysłów county | ×1.05 |

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

## Fertilizer Types (ECON-01)

Each application consumes one `inventory.fertilizers` unit whatever the type; the types differ in cash (labour + operations) and fertility gained. Fertility is a direct multiplier on yield (start 0.7, cap 1.0).

| Type | Fertility | Labour | Operations | Total PLN | Applications 0.70 -> 1.00 | Allowed on |
|---|---|---|---|---|---|---|
| `Basic` | +0.05 | 120 | 80 | 200 | 6 | conventional |
| `NPK` | +0.10 | 300 | 200 | 500 | 3 | conventional |
| `Premium` | +0.15 | 480 | 320 | 800 | 2 | conventional |
| `Organic` | +0.10 | 390 | 260 | 650 | 3 | every parcel; the only type on organic (`isOrganic` or `organicCertified`) parcels |

One application per parcel per season (`lastFertilized == seasonNumber` is refused). Applications at the cap are refused (tolerance 1e-9). Unknown type -> `Nieznany typ nawozu`.

## Seasonal Market Multiplier (ECON-02)

```
marketMult = clamp( seasonDemand / (playerKg + aiSupplyKg + 20 000), 0.50, 1.00 )
seasonDemand: Spring 30 000, Summer 80 000, Autumn 50 000, Winter 30 000
```

Applied in `sellCherries` on top of saturation, for both channels. AI supply is zero in Spring and Winter, so those seasons pay up to the 1.0 cap for small lots; in Summer and Autumn the three AIs supply roughly 80-173k kg and the multiplier sits at or near the 0.5 floor. `getMarketPrices().seasonMultiplier` reports this multiplier for a 10 000 kg lot in the caller's season, with AI entropy 0.
