---
name: dual-entrypoint-sync
description: >
  [Trigger Words: "sync", "parity", "main.mo", "main_mainnet.mo", "dual-write",
  "both files", "mirror", "entrypoint", "check-dual"]
  [Domain: Motoko dual entrypoint, math parity, Track A, Track B, backend sync]
  [Outcomes: verifies mathematical identity and API surface between both entrypoints,
  prevents Track A/B drift]
---

# Dual-Entrypoint Sync Skill

🎯 **Purpose**: 
Verify that `main.mo` (Track A) and `main_mainnet.mo` (Track B) maintain mathematical identity and API parity. Prevents Track A/B drift.

🛠️ **Implementation Logic**:
- **Identity**: All cost constants, formulas, and rates MUST be identical.
- **Parity**: Every public function exposed in one MUST be in both.
- **Discount**: No playground discounts (testing acceleration via starting liquidity only).

🗣️ **Usage Rule**:
Activate via `/check-dual`. 
Handshake: `"Handshake Verified: Dual-Entrypoint checked. Parity confirmed."`

## Workflow:

1. **Compare Entrypoints**: Open `main.mo` and `main_mainnet.mo`.
2. **List Functions**: Diff the function lists for query/update.
3. **Audit Constants**: Compare shared constants (costs, rates).
4. **Output Handshake**: Report parity or divergences clearly to User.

## References
- `../../motoko-backend/references/track_separation.md` — Track separation matrix
- `../../economic-math-auditor/references/math_consistency.md` — Cost constants
