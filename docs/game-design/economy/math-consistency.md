# Math-Consistency Rule

> **Scope**: All backend and frontend calculations related to the game's economy and simulation.
> **Purpose**: To guarantee that Mark Vinicius Cherry Tycoon remains a deterministic, mathematically sound simulation. Agents MUST NOT invent new scaling vectors or formulas without explicitly updating this rule first.

## 1. Yield Calculation Formula
**Formula**: `Yield (kg) = Base × Soil × pH × Fertility × Infrastructure × Water × Organic × TreeAge`
- **Base**: Standard production per hectare (e.g., 20,000 kg).
- **Modifiers**: All modifiers are multipliers (e.g., 1.1x for good pH, 0.8x for drought).
- **County Multipliers (Opole DNA)**:
  - Głubczyce: 1.10x
  - Opole: 1.08x
  - Namysłów: 1.05x
- **Infrastructure Scaling**: Upgrades (like the Golden Harvester) MUST use a compounding multiplier (e.g., `1.05^Level`) rather than a linear additive (`+0.02x`) to maintain ROI balance against exponential upgrade costs.

---

## 2. Storage & Spoilage Logic
Spoilage occurs at the transition from **#Autumn** to **#Winter**. The amount of cherries lost depends on the available infrastructure.

| Infrastructure | Spoilage Rate | Spoilage Armor (UI) |
| :--- | :--- | :--- |
| None | 100% | 0% |
| **Warehouse** | 80% | 20% |
| **Cold Storage** | 20% | 80% |

> Cold Storage takes priority when both are present.

### Formula
`spoiled_quantity = total_inventory × spoilage_rate`
`new_inventory = max(0, total_inventory - spoiled_quantity)`

---

## 3. Quality Score Systems (0–100)

### Base Formula
```
quality_score = base + soil_bonus + ph_bonus + fertility_bonus + water_bonus + infrastructure_bonus + tree_age_bonus
```
**Capped at 100.**

### Component Breakdown

| Component | Formula | Range |
| :--- | :--- | :--- |
| **Base** | `50.0` | 50 |
| **Soil Bonus** | `soilModifier(soilType) × 10` | 6–10 |
| **pH Bonus** | `phModifier(pH) × 10` | 7–10 |
| **Fertility Bonus** | `fertility × 10` | 0–10 |
| **Water Bonus** | `+10` if `0.4 ≤ waterLevel ≤ 0.7` | 0 or 10 |
| **Tree Age Bonus** | `+10` if `7 ≤ treeAge ≤ 15` | 0 or 10 |

### Specific Modifiers

**Soil Type**
- #SandyClay: 1.0
- #Clay: 0.9
- #Sandy: 0.85
- #Waterlogged: 0.6

**pH Range**
- 6.0 – 7.0: 1.0
- 5.5 – 6.0: 0.9
- 7.0 – 7.5: 0.9
- Outside above: 0.7

### Infrastructure Quality Impacts
- **#Sprayer**: +5.0 quality pts per level
- **#ColdStorage**: +3.0 quality pts per level
- **#Shaker**: −2.0 quality pts per level

---

## 4. Pricing & Market Formulas

### Quality → Price Multiplier
- **Retail**: `quality_bonus = 1.0 + (quality_score / 100 × 0.3)` *(Max +30%)*
- **Wholesale**: `wholesale_quality_bonus = 1.0 + (quality_score / 100 × 0.1)` *(Max +10%)*

### Final Market Pricing
**Retail Price**:
`price = base_retail_price × market_size × quality_bonus × organic_premium × saturation_multiplier × market_multiplier`

**Wholesale Price**:
`price = base_wholesale_price × 0.7 × volume_bonus × wholesale_quality_bonus × saturation_multiplier × market_multiplier`

### Shared Market Saturation logic
**Formula**: `Price = Clamped_Price * clamp(Demand / (Total_Supply), 0.5, 1.0)`
- **Total_Supply**: Combined volume of Player AND all AI Competitors.
- **Protection**: Price floor is 50% of the calculated base.

### Parameter Reference
- `organic_premium`: 1.4 (organic), 1.0 (conventional)
- `volume_bonus`: 1.05 (>10k kg), 1.02 (>5k kg), 1.0 (else)
- `saturation_multiplier`: 0.5 – 1.0 (regional supply)
- `market_multiplier`: 0.5 – 1.0 (AI competition)

---

## 5. Safe Arithmetic Policy
- **Motoko Types**: Use `Nat` for all non-negative balances.
- **Underflow Protection**: You MUST NOT perform naked subtraction (`a - b`) on `Nat` types if `b` could be greater than `a`.
- **Enforcement**: Always use `Int.abs` or explicit guard statements (`if (balance < cost) return #Err(...)`).
- **Rounding**: Keep financial calculation precision high; drop remainders only at the final assignment.

> [!WARNING]
> If a task requires modifying how money or yield is calculated, you MUST verify that the changes do not break the bounds defined in this document.

---

## 6. Phase 8.0 Auction System Formulas

### V_bid — Bid Attractiveness Score (Scaled Integer)

**GDD Formula**: $V_{bid} = (P_{base} - P_{offer}) \times (1 + \frac{Prestige}{1000}) \times QualityBonus$

**Motoko Implementation**: All values are `Nat`. No `Float`. Scaling factor: ×1000 for prestige, ×120/100 for organic Bio bonus.

```
margin         = P_base - P_offer          (guarded: if P_offer > P_base → score = 0)
prestigeFactor = 1000 + prestige           (prestige = globalPrestige + localReputation, range 0-200)
qualityMult    = 120 (organic Bio)         or 100 (all others)
score          = (margin × prestigeFactor × qualityMult) / 100
```

**Example**: base=7, offer=6, prestige=85, organic+Bio → score = (1 × 1085 × 120) / 100 = **1302**

### Flood Factor — Market Saturation

**GDD Rule**: Every unit sold outside of a contract reduces the Spot Price by 0.1% per unit.

**Motoko Implementation**:
```
UNIT_DIVISOR  = 100 kg per "flood unit"
floodUnits    = min(uncontractedKg / 100, 900)   (cap at 900 = 90% max degradation)
newSpotPrice  = spotPrice × (1000 - floodUnits) / 1000
floor         = 1 PLN/kg absolute minimum
```

### Pre-Season Future Discount
```
lockedPricePLN = basePricePLN × 93 / 100    (7% security discount)
commitmentFee  = lockedPrice × volumeKg × 5 / 100    (5% upfront)
```

### Shortfall: Market Buyback
```
buybackCost = shortfallKg × spotPrice × 125 / 100    (25% urgent premium)
```

### Shortfall: Financial Default Penalty
```
defaultPenalty = shortfallKg × lockedPricePLN × 150 / 100    (150% of undelivered value)
prestigeLost   = playerPrestige × 10 / 100                    (10% permanent prestige hit)
```

> [!IMPORTANT]
> All Phase 8.0 auction math uses **Nat only**. Every subtraction is guarded. No `Float` imports in `auction_logic.mo`.

