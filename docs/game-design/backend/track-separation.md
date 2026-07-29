# Motoko Standards: Environment Segregation

See `.agent/docs/INFRASTRUCTURE.md` for the full deployment stack details. 

## Track A: Local & Playground (CURRENT)
- **Source of Truth**: `dfx 0.24.3`
- **File**: `backend/main.mo`
- **Actor Syntax**: MUST use standard `actor` and `stable var` (Traditional Motoko paradigm).
- **Purpose**: Rapid iteration, browser bridge testing, and deployment to the local/playground replica.

## Track B: Mainnet (FUTURE ROADMAP)
- **Source of Truth**: `dfx 0.30.x+` (or `dfx 3.0`)
- **File**: `backend/main_mainnet.mo`
- **Actor Syntax**: MUST use `persistent actor` and `transient` state (Enhanced Orthogonal Persistence - EOP).
- **Purpose**: Stable production deployments on the Internet Computer Mainnet.

## Isolation Rule
**NEVER** copy-paste actor declarations or persistence logic between these two tracks. They are architecturally distinct and optimized for different replica environments and compiler versions.

---
**Handshake Verified**: Environment segregation and version-syntax mapping enforced.
