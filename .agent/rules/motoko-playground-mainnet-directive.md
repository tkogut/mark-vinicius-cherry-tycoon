# Motoko Standards: Environment Segregation

## Track A: Local & Playground
- **Source of Truth**: `dfx 0.24.3`
- **File**: `backend/main.mo`
- **Actor Syntax**: MUST use `persistent actor` (Enhanced Orthogonal Persistence - EOP).
- **Purpose**: Rapid iteration and testing on the Playground replica.

## Track B: Mainnet
- **Source of Truth**: `dfx 0.30.x+`
- **File**: `backend/main_mainnet.mo`
- **Actor Syntax**: MUST use `standard actor` (Traditional Motoko paradigm).
- **Purpose**: Stable production deployments on the Internet Computer Mainnet.

## Isolation Rule
**NEVER** copy-paste actor declarations or persistence logic between these two tracks. They are architecturally distinct and optimized for different replica environments.
