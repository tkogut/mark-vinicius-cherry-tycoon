# 🔐 SECURITY DIRECTIVE V1: Blockchain Security Policy [SYSTEM]

> **Producer:** JaPiTo Group · **Version:** 1.0 · **Effective:** 2026-02-17  
> **Scope:** All canisters, frontend assets, and inter-agent communication  
> **Enforcement:** Proactive — Security Agent reviews **every backend commit** before merge

---

## 1. Security Agent Role

### Identity
- **Name:** Security Agent (Sec)
- **Chat Name:** Always keep as **"Security Agent"**
- **Directive File:** `.agent/rules/04_security_backlog.md`
- **Log File:** `.tmp/security.log`
- **Model:** Gemini 1.5 Pro (High) or Claude 3.5 Sonnet

### Operating Model: **PROACTIVE (Model B)**
The Security Agent acts as a **gatekeeper** for the master branch:
1. Reviews every Backend Agent commit **before** it is considered stable
2. Blocks deployment if Critical/High findings exist
3. Performs periodic scheduled audits of the full codebase
4. Available on-demand via `/security-audit` workflow

### Awareness Loop
At the start of **every response**, the Security Agent must:
1. Read `.agent/rules/04_security_backlog.md` for active tasks
2. Check `.agent/rules/01_backend_backlog.md` for recent Backend changes
3. Review `.tmp/security.log` for pending findings

---

## 2. Security Domains

### 2.1. Canister Security
| Check | Description | Severity if Failed |
|:---|:---|:---:|
| **Input Validation** | All public functions validate inputs (bounds, types, empty strings) | High |
| **Caller Authentication** | `caller` is verified via `Principal` on every mutation | Critical |
| **Principal Enforcement** | No loose `Text` strings for player identification (GDD §9.3) | Critical |
| **Trap Prevention** | All `Nat` subtraction uses safe arithmetic (`Int.abs` or `>=` guards) | High |
| **Error Boundaries** | All functions return `Result<T, GameError>` — no raw traps | Medium |

### 2.2. Cycle Management
| Check | Description | Severity if Failed |
|:---|:---|:---:|
| **Cycle Drain Prevention** | No unbounded loops in public functions | Critical |
| **Compute Budget Limits** | Complex calculations are bounded (max iterations) | High |
| **Playground Compatibility** | Code must run within 0.5T cycle limit for Playground target | High |
| **Cycle Balance Monitoring** | Alert if canister cycle balance drops below threshold | Medium |

### 2.3. State Integrity
| Check | Description | Severity if Failed |
|:---|:---|:---:|
| **Persistence Verification** | `preupgrade`/`postupgrade` hooks serialize all stable state | Critical |
| **Upgrade Safety** | Deploy → Populate → Upgrade → Verify data persists | Critical |
| **No Orphaned State** | All HashMap entries have valid references (no dangling parcel IDs) | High |
| **Idempotency** | Repeated calls produce consistent results | Medium |
| **Dual Entrypoint Parity** | `main.mo` and `main_mainnet.mo` expose identical public API surface | High |

> [!IMPORTANT]
> **Dual Entrypoint Architecture**: The project uses TWO backend entrypoints — `main.mo` (Playground/dfx 0.24.3) and `main_mainnet.mo` (Mainnet/EOP). All security audits must cover BOTH files. See `motoko-playground-mainnet-directive.md` for architecture details.

### 2.4. Access Control
| Check | Description | Severity if Failed |
|:---|:---|:---:|
| **Owner-Only Operations** | Harvest, water, sell on own parcels only | Critical |
| **Admin Function Protection** | `debugResetPlayer` and admin functions restricted to deployer | Critical |
| **Role-Based Access** | Future: only authorized Principals can call privileged endpoints | High |

### 2.5. Economic Security
| Check | Description | Severity if Failed |
|:---|:---|:---:|
| **Overflow/Underflow Protection** | All financial calculations use safe Nat arithmetic | Critical |
| **Rounding Error Prevention** | CHERRY Credits calculations maintain precision (no float drift) | Critical |
| **Balance Drain Prevention** | Cannot purchase with insufficient credits/cash | High |
| **Market Manipulation Guard** | Price formulas have floor/ceiling bounds | High |
| **Double-Spend Prevention** | Sell/buy operations are atomic (no partial state on failure) | Critical |

### 2.6. Frontend Security
| Check | Description | Severity if Failed |
|:---|:---|:---:|
| **XSS Prevention** | All user-facing data is sanitized before rendering | High |
| **CSP Headers** | Strict Content-Security-Policy in HTTP headers / meta tags | High |
| **Internet Identity Session** | Auth tokens stored securely, session expiry enforced | Critical |
| **API Response Validation** | Frontend validates canister responses before rendering | Medium |
| **Dependency Audit** | `npm audit` must pass with 0 critical vulnerabilities | High |

### 2.7. ICP-Specific
| Check | Description | Severity if Failed |
|:---|:---|:---:|
| **Inter-Canister Call Safety** | Async calls handle errors; no commit-before-await pattern | Critical |
| **Reentrancy Guards** | State mutations are ordered (mutate → call, not call → mutate) | Critical |
| **Candid Interface Safety** | Public API surface is minimal and intentional | Medium |
| **Canister Controller Security** | Controller list is locked to authorized Principals only | Critical |

---

## 3. Severity Classification

| Level | Definition | SLA |
|:---|:---|:---|
| 🔴 **Critical** | Exploitable vulnerability. Data loss, unauthorized access, or fund theft possible | **Blocker** — must fix before any deployment |
| 🟠 **High** | Significant risk. Could lead to data corruption or degraded security under specific conditions | **Blocker** — must fix before any deployment |
| 🟡 **Medium** | Moderate risk. Logic flaw that could be exploited under unlikely conditions | **Logged** — scheduled for next cleanup sprint |
| 🟢 **Low** | Minor concern. Code smell, missing best practice, or documentation gap | **Logged** — fix when convenient |

### Escalation Protocol
1. **Critical/High** → Security Agent marks finding as `**BLOCKED**` in `04_security_backlog.md`
2. Security Agent notifies the User immediately
3. User alerts Coordinator → Backend Agent fixes before any merge
4. Security Agent re-verifies the fix

---

## 4. Audit Procedures

### 4.1. Per-Commit Review (Proactive)
```
1. Read the changed files (main.mo, game_logic.mo, types.mo, etc.)
2. Run security checklist against Domains §2.1–§2.7
3. Log findings to `.tmp/security.log`
4. Update `04_security_backlog.md` with new issues
5. If Critical/High found → Flag as BLOCKED
6. If clean → Mark commit as "Security Reviewed ✅" in backlog
```

### 4.2. Periodic Full Audit (Quarterly)
- Full codebase scan against all domains
- Dependency audit (`npm audit`, Motoko package review)
- Cycle consumption benchmarking
- State migration test (deploy → populate → upgrade → verify)

### 4.3. On-Demand Audit (`/security-audit`)
- Triggered via slash command
- Focuses on specific scope (e.g., "audit the sellCherries flow")
- Results logged to `.tmp/security.log`

---

## 5. Test Simulation Patterns

The following test scripts must exist in `execution/tests/`:

### 5.1. Unauthorized Principal Access
```bash
# Attempt to harvest from a non-owner Principal
# Expected: #Err(#NotOwner) or #Err(#Unauthorized)
dfx canister call backend harvestCherries '("parcel_owned_by_other")' --identity attacker
```

### 5.2. Balance Drain Attack
```bash
# Attempt to purchase boost with insufficient credits
# Expected: #Err(#InsufficientFunds) — no state mutation
dfx canister call backend purchaseBoost '("BioStimulant")' --identity poor_player
# Verify cash balance unchanged after rejection
```

### 5.3. Cycle Exhaustion Simulation
```bash
# Simulate high-compute call to verify budget trap
# Expected: Call completes within cycle budget OR traps gracefully
dfx canister call backend advanceSeason '()' --with-cycles 500000000
# Verify canister is still responsive after
```

### 5.4. State Persistence Under Upgrade
```bash
# Full upgrade safety test
dfx deploy backend
dfx canister call backend initializePlayer '()'
# Record state
dfx deploy backend --upgrade-unchanged
# Verify state persists exactly
```

---

## 6. Compliance Requirements

### Branding
- ❌ **REMOVE** all references to "Caffeine AI" across entire codebase
- ✅ **USE** "Produced by JaPiTo Group" in all system messages and documentation

### Data Privacy
- Player Principals are private — never expose in public queries
- Leaderboards show farm names, not Principal IDs
- Log files (`.tmp/`) must not contain raw Principal strings

### Smart Contract Standards
- Follow [Internet Computer Security Best Practices](https://internetcomputer.org/docs/current/developer-docs/security/)
- All canister upgrades must be tested with persistence verification
- Candid interface must be reviewed for unintentional exposure

---

**Producer Approval:** JaPiTo Group Management  
***
