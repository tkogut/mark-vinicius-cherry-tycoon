---
name: security-audit
description: >
  [Trigger Words: "security", "audit", "access control", "deploy", "vulnerability",
  "canister security", "principal", "caller", "economic exploit", "before mainnet"]
  [Domain: Motoko canister security, ICP blockchain, frontend XSS, cycle management]
  [Outcomes: blocks deploys on Critical/High findings, verifies 7 security domains,
  enforces JaPiTo Group SECURITY_DIRECTIVE_V1]
---

# Security Audit Skill — The Gatekeeper

## Purpose
Proactive security gatekeeper. Reviews every backend commit before merge.
**Blocks deployment** on Critical 🔴 or High 🟠 findings.
Triggered automatically before `/deploy` and on-demand via `/security-audit`.

> [!CAUTION]
> `/deploy` is **BLOCKED** until this skill runs and returns CLEAN status.
> No exceptions. Security Agent review is mandatory before any deployment.

## 7 Security Domains (from SECURITY_DIRECTIVE_V1)

### Domain 1 — Canister Security
| Check | Severity |
|---|---|
| All public functions validate inputs (bounds, types) | 🟠 High |
| `caller` verified via `Principal` on every mutation | 🔴 Critical |
| No `Text` strings for player ID — Principal only | 🔴 Critical |
| Safe `Nat` arithmetic on all subtractions (guard before subtract) | 🟠 High |
| All functions return `Result<T, GameError>` — no raw traps | 🟡 Medium |

### Domain 2 — Cycle Management
| Check | Severity |
|---|---|
| No unbounded loops in public functions | 🔴 Critical |
| Complex calculations bounded (max iterations enforced) | 🟠 High |
| Playground compatibility within 0.5T cycle limit | 🟠 High |

### Domain 3 — State Integrity
| Check | Severity |
|---|---|
| `preupgrade`/`postupgrade` hooks serialize all stable state | 🔴 Critical |
| Upgrade Safety: deploy → populate → upgrade → verify persists | 🔴 Critical |
| No orphaned HashMap entries (dangling parcel IDs etc.) | 🟠 High |
| **`main.mo` and `main_mainnet.mo` expose identical public API** | 🟠 High |

### Domain 4 — Access Control
| Check | Severity |
|---|---|
| Harvest/water/sell restricted to parcel owner only | 🔴 Critical |
| `debugResetPlayer` and admin functions — deployer only | 🔴 Critical |

### Domain 5 — Economic Security
| Check | Severity |
|---|---|
| All financial `Nat` arithmetic overflow/underflow guarded | 🔴 Critical |
| No float drift in CHERRY Credits calculations | 🔴 Critical |
| Cannot purchase with insufficient balance — state unchanged | 🟠 High |
| Price formulas have floor/ceiling bounds enforced | 🟠 High |
| Sell/buy operations atomic — no partial state on failure | 🔴 Critical |

### Domain 6 — Frontend Security
| Check | Severity |
|---|---|
| All user-facing data sanitized before rendering | 🟠 High |
| Strict Content-Security-Policy headers present | 🟠 High |
| Auth tokens stored securely, session expiry enforced | 🔴 Critical |
| `yarn audit` passes with 0 critical vulnerabilities | 🟠 High |

### Domain 7 — ICP-Specific
| Check | Severity |
|---|---|
| Async inter-canister calls handle errors (no commit-before-await) | 🔴 Critical |
| Reentrancy: state mutated AFTER call returns (mutate → call) | 🔴 Critical |
| Canister controller list locked to authorized Principals | 🔴 Critical |

## Severity & Escalation

| Level | SLA | Action |
|---|---|---|
| 🔴 Critical | **Blocker** | Set `**BLOCKED**` in `04_security_backlog.md`. Notify user immediately. |
| 🟠 High | **Blocker** | Same as Critical — no deploy. |
| 🟡 Medium | Logged | Schedule for next sprint — does not block deploy. |
| 🟢 Low | Logged | Fix when convenient. |

## Workflow (`/security-audit [scope]` activation)

1. **Read** `.agent/rules/04_security_backlog.md` — note any existing BLOCKED items.
2. **Read** `.agent/rules/01_backend_backlog.md` — identify recent Backend commits.
3. **Open changed files** (e.g., `main.mo`, `game_logic.mo`, `auction_logic.mo`).
4. **Run domain checklist** §Domain 1–7 against the changed scope.
5. **Log findings** to `.tmp/security.log`:
   ```
   [SEVERITY] Domain X — Check Name: Description of finding
   File: backend/main.mo:L123
   ```
6. **Update** `04_security_backlog.md`:
   - Clean → `"Security Reviewed ✅ [date]"`
   - Critical/High → `**BLOCKED** — [finding summary]`
7. **Output**:
   - Clean: `"🔐 Security CLEAR: No Critical/High findings. /deploy unblocked."`
   - Blocked: `"🚫 BLOCKED: [N] Critical/High findings. Fix required before /deploy."`

## Test Simulation Scripts (reference)

```bash
# Unauthorized access test
dfx canister call backend harvestCherries '("other_parcel")' --identity attacker
# Expected: #Err(#NotOwner)

# Balance drain test
dfx canister call backend purchaseBoost '("BioStimulant")' --identity poor_player
# Expected: #Err(#InsufficientFunds) + balance unchanged

# Upgrade persistence test
dfx deploy backend && dfx canister call backend initializePlayer '()'
dfx deploy backend --upgrade-unchanged  # verify state exact
```

## Compliance
- ❌ No "Caffeine AI" references anywhere in codebase
- ✅ "Produced by JaPiTo Group" in all system messages

## References
- `references/security_standards.md` — full SECURITY_DIRECTIVE_V1
- `references/backlog.md` — live security backlog snapshot
