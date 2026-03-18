# Spoilage Rates — AntiGravity Economy
> **Rule**: `calculateSpoilageRate` w `game_logic.mo` MUSI zwracać wartości z tej tabeli.

## Infrastructure Spoilage Table

| Infrastructure | Spoilage Rate | `calculateSpoilageRate` Return Value |
|---|---|---|
| None | 100% | `1.00` |
| Warehouse | 80% | `0.80` |
| Cold Storage | 20% | `0.20` |

**Priority Rule**: Gdy `ColdStorage` i `Warehouse` są obecne jednocześnie → `ColdStorage` ma pierwszeństwo.

## Upgrade Cost Scaling

| Asset | Formula |
|---|---|
| Golden Harvester | `baseCost × 1.15^Level` (COMPOUNDING) |
| Warehouse | `25,000 PLN` (flat) |
| Cold Storage | `40,000 PLN` (flat) |
| Tractor | `30,000 PLN` (flat) |
| Shaker | `60,000 PLN` (flat) |
| Maintenance | `1%/season` (Warehouse only) |

## Weather Impact on Water Level

| Weather | Water Depletion | Expected Level After Turn |
|---|---|---|
| Sunny | Normal (-10%) | 70–80% |
| Hot/Dry | High (-25%) | 50–60% |
| Heatwave | Critical (-40%) | 30–40% |
| Rainy | Replenished (+20%) | 90–100% |
| Drought | Severe (-50%) | 20–30% |

**Optimal Water Level**: `75%–85%`. Below 50% triggers quality penalty.
