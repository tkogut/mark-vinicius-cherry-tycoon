---
description: Cross-check game_logic.mo against math_consistency.md.
---

# /audit-economy Workflow

## 🎯 Purpose
To ensure that all mathematical models implemented in the backend actor (`game_logic.mo` / `main.mo`) strictly match the "Single Source of Truth" defined in `.agent/rules/math_consistency.md`.

## 🛠️ Execution Steps

1. **Formula Audit**:
   - Verify Compounding Yield: Check if `1.05^Level` is used for infrastructure modifiers.
   - Verify Spoilage Rates: Confirm 80% (Warehouse) and 20% (ColdStorage) constants.
   - Verify Quality Scoring: Ensure `+3.0` (ColdStorage) and `-2.0` (Shaker) bonuses are set correctly.

2. **Market Check**:
   - Verify Retail Bonus: `1.0 + (quality / 100 * 0.3)`.
   - Verify Wholesale Bonus: `1.0 + (quality / 100 * 0.1)`.

3. **Safe Arithmetic Audit**:
   - Check for naked subtractions on `Nat` types.
   - Verify usage of `Int.abs` or explicit guard conditions for subtraction.

## 🗣️ Outcome
Report any "Logic-Drift" found. If formulas deviate from the math rule, the agent MUST revert the code or update the rule with user approval.
