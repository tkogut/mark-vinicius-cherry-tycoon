# Deployment Flow: CI/CD Governance

## CI/CD Lockdown
- **File**: `.github/workflows/deploy-playground.yml`
- **Tooling**: It is **strictly FORBIDDEN** to change `dfx-version` to `0.30.2`.
- **Constraint**: It **MUST** remain `0.24.3` to maintain compatibility with the current Playground replica and the `persistent actor` syntax.

## Pre-flight Check
Before any deployment or push:
1. Verify the `dfx` version in the workflow file.
2. Ensure the Motoko syntax in the target entrypoint matches the required version:
   - `persistent actor` for `0.24.3` (Track A)
   - `actor` for `0.30.x+` (Track B)
