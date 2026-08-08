# Price & Yield Formulas — AntiGravity Economy
> **Rule**: Ten plik to `Single Source of Truth`. NIGDY nie twórz nowych wzorów bez aktualizacji tego pliku.
> Jeśli `economic-math-auditor/references/math_consistency.md` i ten plik są sprzeczne, **ten plik wygrywa**.

## Yield Formula

```
Yield (kg) = Base × Soil × pH × Fertility × Infrastructure × Water × Organic × TreeAge
```

| Multiplier | Factor |
|---|---|
| Infrastructure | Compounding `1.05^Level` (NOT linear) |
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
