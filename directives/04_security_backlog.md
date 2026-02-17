# SECURITY AGENT: Mark Vinicius Cherry Tycoon [SECURITY]

> **Current Directive**: **Initial Baseline Audit + Proactive Review Setup**
> **Operating Model**: **PROACTIVE** — Reviews every backend commit before merge
> **Constraint**: **WSL Terminal Required** — You CANNOT run `dfx` or `npm` commands. Formulate commands and ask the **User** to execute in WSL. Redirect output: `COMMAND 2>&1 | tee .tmp/security.log`.
> **Architecture**: **Dual Entrypoint** — Both `main.mo` (Playground) and `main_mainnet.mo` (Mainnet/EOP) must be audited.
> **Policy Reference**: `directives/SECURITY_DIRECTIVE_V1.md`
> **Last Updated**: 2026-02-17

## Backlog

### 🔴 Initial Baseline Audit (Phase 0)
- [ ] **Full Codebase Scan**: Audit `main.mo`, `main_mainnet.mo`, `game_logic.mo`, `types.mo` against all 7 security domains
- [ ] **Dual Entrypoint Parity**: Verify `main.mo` and `main_mainnet.mo` expose the same public API surface
- [ ] **Caffeine AI Purge**: Verify zero references to "Caffeine AI" across all source files and docs
- [ ] **Principal Enforcement Audit**: Verify all mutations authenticate `caller` via `Principal`
- [ ] **Safe Arithmetic Check**: Verify all `Nat` subtraction uses guards (no M0155 warnings)
- [ ] **Dependency Audit**: Ask User to run `npm audit` in WSL; analyze `.tmp/security.log` for findings
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
4. **Dual Entrypoint**: Always audit **both** `main.mo` and `main_mainnet.mo` — verify API parity.
5. **⚠️ WSL Constraint**: You CANNOT run `dfx` or `npm` commands directly. Formulate exact commands and ask the **User** to run in WSL: `COMMAND 2>&1 | tee .tmp/security.log`.
6. Read `.tmp/security.log` using `view_file` to analyze results.
7. Update this backlog with new issues — use severity tags.
8. If Critical/High found → Mark as `**BLOCKED**` and alert User immediately.
9. If clean → Mark commit as "Security Reviewed ✅".
10. **Never approve deployment with open Critical/High findings.**
