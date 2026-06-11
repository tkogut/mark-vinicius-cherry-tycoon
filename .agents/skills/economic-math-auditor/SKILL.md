---
name: economic-math-auditor
description: >
  [Trigger Words: "formula", "price", "yield", "spoilage", "auction math", "economy",
  "cost scaling", "market formula", "quality score", "flood factor", "bid score"]
  [Domain: game_logic.mo, math_consistency.md, market simulation, auction system]
  [Outcomes: prevents formula drift, verifies all economic constants against Single Source of Truth]
---

# Economic Math Auditor Skill

🎯 **Purpose**: 
Single gatekeeper for all mathematical formulas in the game economy. Prevents formula drift and verifies all economic constants against the Single Source of Truth.

🛠️ **Implementation Logic**:
- **Source of Truth**: `references/math_consistency.md`.
- **Constraint**: Agents MUST run this audit before committing any price, yield, cost, or auction logic change.
- **Formulas**: Yield (compounding), Spoilage (ColdStorage 0.20), Pricing (Quality-based), Auctions (Bid Scores).

🗣️ **Usage Rule**:
Activate via `/audit-economy`. 
Handshake: `"Formula verified: [Formula Name] matches math_consistency.md. No logic-drift detected."`

## Workflow:

1. **Read Canonical**: Review `references/math_consistency.md`.
2. **Audit Logic**: Open `game_logic.mo` or `auction_logic.mo` and compare implementations.
3. **Verify Parity**: Check `main.mo` and `main_mainnet.mo` carry identical cost constants.
4. **Halt on Delta**: If a mismatch is found, block and report to User immediately.

## References
- `references/math_consistency.md` — Canonical formula document
