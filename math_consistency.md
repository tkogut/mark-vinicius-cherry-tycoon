# Math Consistency: Storage & Quality Systems

This document is the **single source of truth** for all storage, quality, and pricing formulas. Frontend and backend implementations must match these definitions exactly.

## 1. Storage & Spoilage Logic
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

## 2. Quality Score (Orchard Quality Score, 0–100)

### Base Formula
```
quality_score = base
  + soil_bonus
  + ph_bonus
  + fertility_bonus
  + water_bonus
  + infrastructure_bonus
  + tree_age_bonus
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

### Soil Modifier Table

| Soil Type | Modifier |
| :--- | :--- |
| #SandyClay | 1.0 |
| #Clay | 0.9 |
| #Sandy | 0.85 |
| #Waterlogged | 0.6 |

### pH Modifier Table

| pH Range | Modifier |
| :--- | :--- |
| 6.0 – 7.0 | 1.0 |
| 5.5 – 6.0 | 0.9 |
| 7.0 – 7.5 | 0.9 |
| Outside above | 0.7 |

### Infrastructure Quality Impacts

| Infrastructure | Effect per Level | Notes |
| :--- | :--- | :--- |
| **#Sprayer** | +5.0 quality pts | Disease prevention, better fruit |
| **#ColdStorage** | +3.0 quality pts | Preserves post-harvest quality |
| **#Shaker** | −2.0 quality pts | Mechanical damage to fruit |

---

## 3. Quality → Price Impact Formulas

Quality directly impacts market prices through quality bonuses.

### Retail Price Multiplier
```
quality_bonus = 1.0 + (quality_score / 100 × 0.3)
```
*Max Bonus: +30% at 100 Quality.*

### Wholesale Price Multiplier
```
wholesale_quality_bonus = 1.0 + (quality_score / 100 × 0.1)
```
*Max Bonus: +10% at 100 Quality.*

---

## 4. Market Pricing Formulas
Prices are dynamic, influenced by regional saturation and AI competition.

### Retail Price
```
price = base_retail_price × market_size × quality_bonus × organic_premium × saturation_multiplier × market_multiplier
```

### Wholesale Price
```
price = base_wholesale_price × 0.7 × volume_bonus × wholesale_quality_bonus × saturation_multiplier × market_multiplier
```

### Parameter Reference

| Parameter | Value |
| :--- | :--- |
| `organic_premium` | 1.4 (organic), 1.0 (conventional) |
| `volume_bonus` | 1.05 (>10k kg), 1.02 (>5k kg), 1.0 (else) |
| `saturation_multiplier` | 0.5 – 1.0 (based on regional supply) |
| `market_multiplier` | 0.5 – 1.0 (based on AI competitor supply) |
