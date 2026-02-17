# SECURITY AGENT: Mark Vinicius Cherry Tycoon [SECURITY]

> **Current Directive**: **Initial Baseline Audit — COMPLETED. Findings logged.**
> **Operating Model**: **PROACTIVE** — Reviews every backend commit before merge
> **Constraint**: **WSL Terminal Required** — You CANNOT run `dfx` or `npm` commands. Formulate commands and ask the **User** to execute in WSL. Redirect output: `COMMAND 2>&1 | tee .tmp/security.log`.
> **Architecture**: **Dual Entrypoint** — Both `main.mo` (Playground) and `main_mainnet.mo` (Mainnet/EOP) must be audited.
> **Policy Reference**: `directives/SECURITY_DIRECTIVE_V1.md`
> **Last Updated**: 2026-02-17

## ✅ Deployment Status: **UNBLOCKED** (pending build verification)

> All Critical + High findings fixed. User must verify build before deployment.

## Backlog

### 🔴 Initial Baseline Audit — Findings (BLOCKER)
- [x] **Full Codebase Scan**: Audited `main.mo`, `main_mainnet.mo`, `game_logic.mo`, `types.mo`, `authorization/` against all 7 security domains
- [x] **Dual Entrypoint Parity**: Verified — API surface matches ✅, but state management differs critically
- [x] **Legacy Purge**: Scanned — **CLEAN** — all source/doc references purged ✅ *2026-02-17*
- [x] **Principal Enforcement Audit**: Verified — all mutations use `caller` via `Principal`, but anonymous principal NOT rejected
- [x] **Safe Arithmetic Check**: Verified — Nat subtraction uses `Int.abs()` guards throughout
- [ ] **Dependency Audit**: ⏳ Waiting for User to run `npm audit` in WSL
- [ ] **CSP Headers**: Not yet audited (frontend scope)

### 🔴 Critical Fixes Required (BLOCKER — Backend Agent)
- [x] **SEC-001**: Remove `transient` from `playerFarms` in `main_mainnet.mo` ✅ FIXED
- [x] **SEC-002**: Remove `transient` from `accessControlState` in `main_mainnet.mo` ✅ FIXED
- [x] **SEC-003**: Restrict `debugResetPlayer` — anonymous rejection added (both files) ✅ FIXED
- [x] **SEC-004**: Guard `advanceSeason` against empty parcels array (both files) ✅ FIXED
- [x] **SEC-005**: Reject `Principal.isAnonymous(caller)` in all 13 mutation functions (both files) ✅ FIXED

### 🟠 High Fixes — RESOLVED ✅
- [x] **SEC-006**: Remove `transient` from `regionalMarketSaturation` in `main_mainnet.mo` ✅ FIXED
- [x] **SEC-007**: Validate `saleType` input in `sellCherries` — reject unknown values (both files) ✅ FIXED
- [x] **SEC-008**: Validate `playerId`/`playerName` inputs — non-empty, max 50 chars (both files) ✅ FIXED
- [x] **SEC-009**: Fix admin token logic — hardcoded `CHERRY_ADMIN_2026` token ✅ FIXED

### 🟡 Medium (Logged — Cleanup Sprint)
- [ ] **SEC-010**: Add `assignParcelToPlayer` self-assignment check
- [x] **SEC-011**: Purge ALL legacy references from source code and docs ✅ *DONE 2026-02-17*
- [ ] **SEC-012**: Consider removing `owner` Principal from public query responses

### 🟢 Low (Logged — Fix When Convenient)
- [x] **SEC-013**: Delete `old_main.mo` (dead code with legacy types) ✅ *DONE 2026-02-17*
- [ ] **SEC-014**: Change `sellCherries` `saleType: Text` → `SaleType` variant

### 🟠 Proactive Gatekeeper Setup
- [x] **Review Process**: Commit review checklist established per §4.1
- [x] **Test Scripts**: `execution/tests/test_security_audit.sh` exists with 4 simulation patterns
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
| 2026-02-17 | SEC-001: `playerFarms` transient in mainnet | 🔴 Critical | `main_mainnet.mo` | ✅ **FIXED** |
| 2026-02-17 | SEC-002: `accessControlState` transient in mainnet | 🔴 Critical | `main_mainnet.mo` | ✅ **FIXED** |
| 2026-02-17 | SEC-003: `debugResetPlayer` no admin check | 🔴 Critical | Both entrypoints | ✅ **FIXED** |
| 2026-02-17 | SEC-004: `advanceSeason` index OOB trap | 🔴 Critical | Both entrypoints | ✅ **FIXED** |
| 2026-02-17 | SEC-005: No anonymous principal rejection | 🔴 Critical | Both entrypoints | ✅ **FIXED** |
| 2026-02-17 | SEC-006: Market saturation transient in mainnet | 🟠 High | `main_mainnet.mo` | ✅ **FIXED** |
| 2026-02-17 | SEC-007: `sellCherries` saleType unvalidated | 🟠 High | Both entrypoints | ✅ **FIXED** |
| 2026-02-17 | SEC-008: `initializePlayer` inputs unvalidated | 🟠 High | Both entrypoints | ✅ **FIXED** |
| 2026-02-17 | SEC-009: Admin token bypass vulnerability | 🟠 High | `MixinAuthorization.mo` | ✅ **FIXED** |
| 2026-02-17 | SEC-010: `assignParcelToPlayer` no self-check | 🟡 Medium | Both entrypoints | Logged |
| 2026-02-17 | SEC-011: 50+ Caffeine AI references remain | 🟡 Medium | Multiple files | Logged |
| 2026-02-17 | SEC-012: Principal exposed in query response | 🟡 Medium | Both entrypoints | Logged |
| 2026-02-17 | SEC-013: `old_main.mo` dead code | 🟢 Low | `old_main.mo` | Logged |
| 2026-02-17 | SEC-014: `saleType` should be variant | 🟢 Low | Both entrypoints | Logged |

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
