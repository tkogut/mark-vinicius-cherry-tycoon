# SECURITY AGENT: Mark Vinicius Cherry Tycoon [SECURITY]

> **Current Directive**: **Initial Baseline Audit + Proactive Review Setup**
> **Operating Model**: **PROACTIVE** — Reviews every backend commit before merge
> **Policy Reference**: `directives/SECURITY_DIRECTIVE_V1.md`
> **Last Updated**: 2026-02-17

## Backlog

### 🔴 Initial Baseline Audit (Phase 0)
- [ ] **Full Codebase Scan**: Audit `main.mo`, `game_logic.mo`, `types.mo` against all 7 security domains
- [ ] **Caffeine AI Purge**: Verify zero references to "Caffeine AI" across all source files and docs
- [ ] **Principal Enforcement Audit**: Verify all mutations authenticate `caller` via `Principal`
- [ ] **Safe Arithmetic Check**: Verify all `Nat` subtraction uses guards (no M0155 warnings)
- [ ] **Dependency Audit**: Run `npm audit` on frontend; report Critical/High findings
- [ ] **CSP Headers**: Verify Content-Security-Policy is configured in frontend build

### 🟠 Proactive Gatekeeper Setup
- [ ] **Review Process**: Establish commit review checklist (per §4.1 of SECURITY_DIRECTIVE_V1)
- [ ] **Test Scripts**: Create `execution/tests/test_security_audit.sh` with 4 simulation patterns:
  - Unauthorized Principal access
  - Balance Drain attack
  - Cycle Exhaustion simulation
  - State Persistence under upgrade
- [ ] **Log Infrastructure**: Set up `.tmp/security.log` format and rotation

### 🟡 Phase 5 Security Reviews (Upcoming)
- [ ] **Weather Logic Review**: Audit `weather_logic.mo` for unbounded loops and cycle safety
- [ ] **AI Logic Review**: Audit `ai_logic.mo` for market manipulation vectors
- [ ] **Economic Security**: Verify CHERRY Credits math has overflow/underflow protection
- [ ] **Shared Market Formula**: Verify price formula has floor/ceiling bounds
- [ ] **Monetization Logic**: Audit boost/expansion purchase flows for double-spend

### 🟢 Ongoing
- [ ] **Frontend Security Sweep**: XSS audit on all user-rendered data
- [ ] **Internet Identity Session**: Verify token storage, expiry, and logout cleanup
- [ ] **API Surface Review**: Verify Candid interface exposes only intentional endpoints

## Severity Log

| Date | Finding | Severity | File | Status |
|:---|:---|:---:|:---|:---|
| — | — | — | — | — |

## Agent Instructions
1. Read `directives/SECURITY_DIRECTIVE_V1.md` for full policy details.
2. At every turn, check `directives/01_backend_backlog.md` for new Backend changes.
3. Run security checklist against all 7 domains (§2.1–§2.7).
4. Log findings to `.tmp/security.log`.
5. Update this backlog with new issues — use severity tags.
6. If Critical/High found → Mark as `**BLOCKED**` and alert User immediately.
7. If clean → Mark commit as "Security Reviewed ✅".
8. **Never approve deployment with open Critical/High findings.**
