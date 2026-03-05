---
trigger: always_on
---

---
name: Dual Entrypoint Directive
description: Enforcement of the parallel deployment architecture for Playground and Mainnet.
---

# 🏗️ Dual Entrypoint Architecture Policy

## 1. The Mirror Rule
Every logic change in `backend/*.mo` MUST be implemented in:
1. `main.mo` (Target: ICP Playground and Locally | dfx 0.24.3)
2. `main_mainnet.mo` (Target: Production/EOP | dfx 0.24.3)

## 2. Environment Scaling Constants
When replicating code, adjust these specific values:
- **Playground (`main.mo`)**: Costs should be set to 10% of GDD values for rapid testing (e.g., 10,000 PLN).
- **Mainnet (`main_mainnet.mo`)**: Costs must be 100% of GDD values (e.g., 100,000 PLN).
- **Spoilage Rates**: Must remain identical (20% ColdStorage / 80% Warehouse) across both.

## 3. Verification Procedure
Before any `git push`, the agent MUST:
- Compare the `calculateSpoilageRate` function signatures in both files.
- Ensure all public actor methods are exposed symmetrically.
- Log the sync status in `task.md` as `DUAL_SYNC_COMPLETE`.