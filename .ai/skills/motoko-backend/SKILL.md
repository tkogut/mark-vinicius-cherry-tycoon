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

## Purpose
Enforce strict environment segregation between the two active Motoko deployment tracks.
Every backend change MUST pass through this skill's compliance checklist.

## Segregation Matrix

| | Track A — Local/Playground | Track B — Mainnet |
|---|---|---|
| **Status** | ✅ ACTIVE | 🗓️ FUTURE ROADMAP |
| **dfx Version** | `0.24.3` | `0.30.x+` |
| **Source File** | `backend/main.mo` | `backend/main_mainnet.mo` |
| **Actor Keyword** | `actor { ... }` | `persistent actor { }` |
| **State Variables** | `stable var` | `transient` |
| **Paradigm** | Traditional Motoko | Enhanced Orthogonal Persistence (EOP) |
| **Deploy Targets** | Local replica, ICP Playground, GitHub Actions | ICP Mainnet |

## Isolation Rule

> [!CAUTION]
> **KATEGORYCZNY ZAKAZ**: NEVER copy actor declarations, `stable var`, or `persistent`/`transient`
> keywords between `main.mo` and `main_mainnet.mo`.
> The two files are architecturally distinct. Cross-contamination causes silent deployment failures.

## Compliance Checklist (run before every backend commit)

- [ ] New logic added to shared module files (e.g., `game_logic.mo`, `auction_logic.mo`, `types.mo`)
- [ ] Public functions exposed in **both** `main.mo` AND `main_mainnet.mo`
- [ ] `main.mo` uses `actor { }` + `stable var` syntax only
- [ ] `main_mainnet.mo` uses `persistent actor { }` + `transient` syntax only
- [ ] Math constants are **identical** in both files (no playground discounts)
- [ ] Safe arithmetic used: no naked `Nat` subtraction without guards

## Workflow (`/motoko` activation)

1. Identify which file(s) need modification.
2. Confirm the target track (A or B) from the file path.
3. Apply only the syntax rules for that track (see Matrix above).
4. After writing, run the dual-entrypoint-sync skill: trigger `/check-dual`.
5. Verify economic formulas: trigger `/audit-economy` if math was touched.
6. Output handshake: `"Handshake Verified: Dual-Entrypoint and Math-Consistency checked."`

## References
- Track separation rules: `references/track_separation.md`
- Infrastructure spec: `references/infrastructure.md`
- Math constants: `../.ai/skills/economic-math-auditor/references/math_consistency.md`
