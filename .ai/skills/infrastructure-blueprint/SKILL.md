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

🎯 **Purpose**: 
Maintain a strict link between Motoko backend infrastructure types and React UI tooltips. Ensures players always see accurate economic data with zero UI/backend drift.

🛠️ **Implementation Logic**:
- **Source of Truth**: `references/INFRASTRUCTURE.md` and `economic-math-auditor/references/math_consistency.md`.
- **Logic**: COMPOUNDING cost scaling (`1.15^Level`) enforced.
- **Priority**: Cold Storage over Warehouse.

🗣️ **Usage Rule**:
Activate via `/infrastructure [asset]`. 
Handshake: `"I have applied [Asset Name] stats (Cost: [X], Spoilage: [Y]). Verified against math_consistency.md."`

## Workflow:

1. **Identify Asset**: Read blueprint from `references/INFRASTRUCTURE.md`.
2. **Audit Logic**: Cross-reference against `math_consistency.md`.
3. **Backend Update**: Update `game_logic.mo` spoilage/cost functions if changed.
4. **UI Update**: Update `InvestmentsDashboard.tsx` tooltips to match 1:1.
5. **Sync Check**: Trigger `/check-dual` for both actors.

## References
- `references/INFRASTRUCTURE.md` — Blueprint table and cost constants
- `../../economic-math-auditor/references/math_consistency.md` — formula cross-check
- `assets/cost_tables.md` — Spoilage rate reference
