---
name: economic-math-auditor
description: >
  [Trigger Words: "formula", "price", "yield", "spoilage", "auction math", "economy",
  "cost scaling", "market formula", "quality score", "flood factor", "bid score"]
  [Domain: game_logic.mo, math_consistency.md, market simulation, auction system]
  [Outcomes: prevents formula drift, verifies all economic constants against Single Source of Truth]
---

# Economic Math Auditor Skill

## Purpose
Single gatekeeper for all mathematical formulas in the game economy.
Agents MUST run this audit before committing any price, yield, cost, or auction logic change.

## Single Source of Truth
→ `references/math_consistency.md`

**Rule**: NEVER invent new scaling vectors or formulas without updating `math_consistency.md` first.

## Validated Formula Index

### Yield
```
Yield (kg) = Base × Soil × pH × Fertility × Infrastructure × Water × Organic × TreeAge
```
- Infrastructure scaling: compounding `1.05^Level` (NOT linear additive)
- County multipliers: Głubczyce ×1.10, Opole ×1.08, Namysłów ×1.05

### Spoilage
| Infrastructure | Rate | Command |
|---|---|---|
| None | 100% | — |
| Warehouse | 80% | `calculateSpoilageRate` returns `0.80` |
| Cold Storage | 20% | `calculateSpoilageRate` returns `0.20` |

### Quality Score (0–100, capped)
```
quality = 50 + soil_bonus + ph_bonus + fertility_bonus + water_bonus + tree_age_bonus
          + infrastructure_bonus
```
Infrastructure quality: Sprayer +5.0/lvl, ColdStorage +3.0/lvl, Shaker −2.0/lvl.

### Pricing
- **Retail**: `price_mult = 1.0 + (quality_score / 100 × 0.3)` → max +30%
- **Wholesale**: `price_mult = 1.0 + (quality_score / 100 × 0.1)` → max +10%

### Phase 8.0 — Auction Formulas
```
V_bid score  = (margin × (1000 + prestige) × qualityMult) / 100
               qualityMult: 120 (organic+Bio), 100 (others)
Flood Factor = newSpot = spotPrice × (1000 - min(uncontractedKg/100, 900)) / 1000
Future discount   = lockedPrice = basePrice × 93 / 100
Buyback premium   = buybackCost = shortfallKg × spotPrice × 125 / 100
Default penalty   = shortfallKg × lockedPrice × 150 / 100
```

### Safe Arithmetic Policy
- **Types**: `Nat` for all non-negative balances. NEVER use `Float` in `auction_logic.mo`.
- **Underflow protection**: Guard all subtractions: `if (a < b) return #Err(...)`

## Workflow (`/audit-economy` activation)

1. Read `references/math_consistency.md` (the canonical document).
2. Open the modified target file (e.g., `game_logic.mo`, `auction_logic.mo`).
3. For each formula touched, compare implementation against the index above.
4. Check `main.mo` and `main_mainnet.mo` have **identical** cost constants (no discounts).
5. Verify quality_score infrastructure bonuses propagate correctly into price formulas.
6. If all match, output:
   > `"Formula verified: [Formula Name] matches math_consistency.md. No logic-drift detected."`
7. If mismatch found: halt and report the delta to the user.

## References
- `references/math_consistency.md` — canonical formula document
- `references/gdd_analysis.md` — Game Design Document full analysis
- `references/gdd_competitive_pool.md` — Phase 8.0 auction GDD
- `references/gdd_sports_patron.md` — Phase 8.0 patron GDD
- `references/gdd_alignment_report.md` — GDD vs implementation alignment report
