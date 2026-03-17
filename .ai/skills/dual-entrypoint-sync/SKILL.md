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

## Purpose
Verify that `main.mo` (Track A) and `main_mainnet.mo` (Track B) maintain:
1. **Mathematical identity** — all cost constants, formulas, and rates are identical.
2. **API parity** — every public function exposed in one is exposed in both.

## Core Principles

### No Playground Discounts
The previous 10% testing discount is **DEPRECATED**.
`100,000 PLN on Mainnet = 100,000 PLN on Playground`. Period.

### Testing Acceleration Strategy (approved)
To accelerate testing without touching business logic:
> Adjust **Starting Liquidity** (initial wallet balance) in test initialization — NOT item costs.

### Dual-Write Enforcement
Every logic update in any shared module (`game_logic.mo`, `auction_logic.mo`, `types.mo`, etc.)
MUST be reflected in **both** `main.mo` and `main_mainnet.mo`.

## Sync Checklist

- [ ] All new public functions exist in **both** `main.mo` and `main_mainnet.mo`
- [ ] `main.mo` uses `actor { }` + `stable var` (Track A syntax)
- [ ] `main_mainnet.mo` uses `persistent actor { }` + `transient` (Track B syntax)
- [ ] All cost constants are **numerically identical** in both files
- [ ] Spoilage rates match: `0.20` ColdStorage, `0.80` Warehouse — both files
- [ ] Upgrade cost scaling formula (`1.15^Level`) consistent in both files
- [ ] No `Float` imports in `auction_logic.mo` (Nat-only policy)

## Workflow (`/check-dual` activation)

1. Open `backend/main.mo` — list all public query and update functions.
2. Open `backend/main_mainnet.mo` — list all public query and update functions.
3. Diff the function lists. Report any functions missing from either file.
4. For each shared constant (costs, rates), compare values. Report any mismatch.
5. Verify actor syntax: `stable var` (A) vs `transient` (B) — confirm no cross-contamination.
6. Output:
   > `"Handshake Verified: Dual-Entrypoint checked. Parity confirmed / [N] divergences found."`

## References
- `../.ai/skills/motoko-backend/SKILL.md` — Track A/B segregation matrix
- `../.ai/skills/economic-math-auditor/references/math_consistency.md` — cost constants
- `.agent/rules/motoko-playground-mainnet-directive.md` — original directive
