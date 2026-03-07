# Motoko Standards: Environment Segregation

## Track A: Local & ICP Playground
- **Source of Truth**: `dfx 0.24.3`
- **File**: `backend/main.mo`
- **Syntax**: Uses standard `actor` (Traditional) for build stability.
- **Goal**: Rapid deployment and testing on Playground replica.

## Track B: ICP Mainnet
- **Source of Truth**: `dfx 0.30.x+`
- **File**: `backend/main_mainnet.mo`
- **Syntax**: MUST use standard `actor`.
- **Goal**: High-stability production environment.

## Isolation Rule
**NEVER** copy-paste actor declarations between these two tracks. They are architecturally distinct and incompatible at the compiler level.

---
**Handshake Verified**: Environment segregation and version-syntax mapping enforced.
