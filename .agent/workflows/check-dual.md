---
description: Deep-audit of main.mo vs main_mainnet.mo consistency.
---

# /check-dual Workflow

## 🎯 Purpose
To verify that all public actor methods and logic changes in `backend/main.mo` are synchronized with `backend/main_mainnet.mo`, enforcing the Dual-Entrypoint Directive.

## 🛠️ Execution Steps

1. **Comparison Check**:
   - Compare function signatures for `calculateSpoilageRate`, `upgradeInfrastructure`, and `advancePhase`.
   - Verify that all public `query` and `update` methods are mirrored 1:1.

2. **Constant Verification**:
   - Confirm **Playground (main.mo)** uses the 10% "Playground Discount" (e.g., 10,000 PLN).
   - Confirm **Mainnet (main_mainnet.mo)** uses 100% GDD-standard costs (e.g., 100,000 PLN).

3. **Report Findings**:
   - List any missing functions in either file.
   - List any discrepancies in logic or scaling constants.

## 🗣️ Outcome
If the files are out of sync, the agent MUST flag the "Architecture: Dual Entrypoint" directive as **VIOLATED** and block any deployment tasks.
