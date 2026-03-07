# Deployment Flow: CI/CD Lockdown Rules

## Playground Lockdown
In `.github/workflows/deploy-playground.yml`, it is **strictly FORBIDDEN** to change the `dfx-version` to `0.30.2`. It MUST remain `0.24.3` to support the specific EOP requirements of the current Playground replica.

## Pre-flight Check
Before any deployment push, the coordinator/agent MUST verify:
1. `dfx-version` in the workflow is `0.24.3`.
2. `backend/main.mo` uses the `persistent actor` keyword.
3. No cross-track actor declarations have been leaked.

## Self-Healing Protocol
If a deployment fails due to syntax errors, the agent MUST use `DFX_MOTOKO_PATH` or compiler flags to bridge the gap without changing the base `dfx` version.

---
**Handshake Verified**: CI/CD Lockdown and Pre-flight checks institutionalized.
