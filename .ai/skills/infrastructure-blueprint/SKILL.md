---
name: infrastructure-blueprint
description: >
  [Trigger Words: "build", "upgrade", "warehouse", "cold storage", "infrastructure cost",
  "tractor", "shaker", "harvester", "sprayer", "spoilage rate", "investment"]
  [Domain: game_logic.mo, InvestmentsDashboard.tsx, farm infrastructure, backend-frontend parity]
  [Outcomes: enforces 1:1 parity between Motoko backend types and React UI tooltips,
  validates cost constants against math_consistency.md]
---

# Infrastructure Blueprint Skill

## Purpose
Maintain a strict link between Motoko backend infrastructure types
and the React UI (`InvestmentsDashboard.tsx`) tooltips.
Players must always see accurate economic data — no UI/backend drift allowed.

## Validated Blueprints (Single Source of Truth)

| Asset | Cost (PLN) | Spoilage | Quality Impact | Maintenance |
|---|---|---|---|---|
| **Warehouse** | 25,000 | 80% | — | 1%/season |
| **Cold Storage** | 40,000 | 20% | +3.0 quality pts/lvl | — |
| **Tractor** | 30,000 | — | — | −15% labor cost |
| **Shaker** | 60,000 | — | −2.0 quality pts/lvl | −30% labor cost |
| **Sprayer** | *(see math_consistency.md)* | — | +5.0 quality pts/lvl | — |
| **Golden Harvester** | Base × `1.15^Level` | — | Yield × `1.05^Level` | — |

## Implementation Rules

1. **Spoilage function**: `calculateSpoilageRate` must return exactly:
   - `0.20` for `#ColdStorage`
   - `0.80` for `#Warehouse`

2. **Tooltip parity**: `InvestmentsDashboard.tsx` tooltip content must match backend values 1:1.

3. **Cost scaling**: Golden Harvester upgrade cost MUST use `1.15^Level` compounding — NOT linear.

4. **Cold Storage priority**: When both Warehouse and Cold Storage are present, Cold Storage takes priority.

## Workflow (`/infrastructure [asset]` activation)

1. Identify the asset: read its blueprint from the table above.
2. Cross-reference against `references/math_consistency.md` for the latest validated values.
3. Update `game_logic.mo` → `calculateSpoilageRate` function if spoilage changed.
4. Update `InvestmentsDashboard.tsx` tooltip content to reflect new values.
5. Trigger `/check-dual` — verify both `main.mo` and `main_mainnet.mo` reflect the change.
6. Output confirmation:
   > `"I have applied [Asset Name] stats (Cost: [X], Spoilage: [Y]). Verified against math_consistency.md."`

## References
- `../.ai/skills/economic-math-auditor/references/math_consistency.md` — cost/spoilage constants
- `frontend/src/components/InvestmentsDashboard.tsx` — UI implementation target
- `backend/game_logic.mo` — calculateSpoilageRate implementation target
