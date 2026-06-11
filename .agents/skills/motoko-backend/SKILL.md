---
name: motoko-backend
description: >
  [Trigger Words: "when writing backend", "when deploying", "actor declaration", "stable var",
  "persistent actor", "dfx deploy", "motoko", "canister", "ICP backend"]
  [Domain: Motoko, Internet Computer, dfx, canister deployment]
  [Outcomes: enforces Track A/B environment segregation, prevents actor paradigm mixing,
  guarantees correct syntax for each deployment target]
---

# Motoko Backend Skill

🎯 **Purpose**: 
Enforce strict environment segregation between Track A (Local/Playground) and Track B (Mainnet). Guarantees syntax compliance and prevents cross-contamination of actor paradigms.

🛠️ **Implementation Logic**:
- **Track A**: `actor { }` + `stable var`.
- **Track B**: `persistent actor { }` + `transient`.
- **Logic**: All shared logic MUST reside in separate modules (e.g., `game_logic.mo`).

🗣️ **Usage Rule**:
Activate via `/motoko`. 
Handshake: `"Handshake Verified: Dual-Entrypoint and Math-Consistency checked."`

## Workflow:

1. **Identify Target**: Check file path (`main.mo` vs `main_mainnet.mo`).
2. **Apply Syntax**: Use only the track-specific keywords (Matrix in `references/track_separation.md`).
3. **Sync Check**: Run `/check-dual` after every commit.
4. **Economy Audit**: Run `/audit-economy` if math was touched.
5. **Verify**: Ensure public functions exist in both entrypoints.

## References
- `references/track_separation.md` — Track separation rules
- `references/motoko-playground-mainnet-directive.md` — Playground EOP directive
- `references/agent_protocols.md` — Orchestration protocols
