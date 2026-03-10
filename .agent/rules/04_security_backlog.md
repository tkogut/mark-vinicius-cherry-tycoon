# SECURITY AGENT: Mark Vinicius Cherry Tycoon [SECURITY]

> **Current Directive**: **Phase 8.0 Monitoring (Competitive Pool) — ACTIVE.** Auction engine shipped. Pending formal SEC review of `auction_logic.mo`.
> **LIVING WORLD Status**: **Security Reviewed ✅**. (See [Archive](file:///home/tkogut/projects/mark-vinicius-cherry-tycoon/.agent/rules/04_security_backlog_archive.md))
> **Constraint**: **WSL Terminal Required** — Redirect output: `COMMAND 2>&1 | tee .tmp/security.log`.
> **Architecture**: **Dual Entrypoint** — Both `main.mo` and `main_mainnet.mo` must be audited.
> **Last Updated**: 2026-03-10

## 🟢 Deployment Status: **UNBLOCKED** — Security Validation Complete ✅

> **Handshake Verified**: Dual-Entrypoint and Math-Consistency checked via `.agent/skills/`.

## Active Backlog

### 🔴 Phase 8.0: Competitive Pool Security Reviews (ACTIVE — PRIORITY 1)
> **Backend Agent shipped `auction_logic.mo` on 2026-03-10. Formal audit required.**

- [x] **SEC-028: Infinite Reward/Penalty Injection**: **FIXED** — Added `lastAuctionResolutionSeason` per-player flag.
- [x] **SEC-029: Global State Wipeout**: **FIXED** — `advancePhase` appends to `stableAuctionContracts` with historical pruning.
- [x] **SEC-030: Resolution Engine instruction limit trap**: **FIXED** — Improved filtering and season-scoping.
- [x] **SEC-031: Market Saturation Mechanic Integration**: **FIXED** — `applyFloodFactor` integrated into resolution engine.
- [ ] **SEC-024: Bid Attractiveness Manipulation** — `calculateBidAttractiveness` uses raw `farm.reputation` as prestige proxy.
- [ ] **SEC-025: Flood Factor Price Oracle Abuse** — Verify minimum inventory requirement prevents price crashing.
- [ ] **SEC-026: Pre-Season Shortfall Oracle Manipulation** — Check for price crashing before default.
- [ ] **SEC-027: `stableAuctionContracts` Injection** — Verify no path allows self-awarded contracts.

### 🟡 Ongoing & Cleanup
- [ ] **SEC-010**: Add `assignParcelToPlayer` self-assignment check.
- [ ] **SEC-012**: Consider removing `owner` Principal from public query responses.
- [ ] **SEC-014**: Change `sellCherries` `saleType: Text` → `SaleType` variant.
- [ ] **Dependency Audit**: Waiting for `npm audit` in WSL.
- [ ] **Frontend Security Sweep**: XSS audit on all user-rendered data.

### 🟣 Phase 10.0: Sports Patron (DEFERRED)
- [ ] **Sports Patron Logic Review**: Audit `patron_logic.mo` for TPI manipulation.
- [ ] **Async Round Sync Review**: Ensure matchday timing logic is robust.

## Active Severity Log

| Date | Finding | Severity | File | Status |
|:---|:---|:---:|:---|:---|
| 2026-03-10 | SEC-028: Infinite Reward/Penalty loop | 🔴 Critical | Both | ✅ **FIXED** |
| 2026-03-10 | SEC-029: Global State Wipeout in advancePhase | 🔴 Critical | Both | ✅ **FIXED** |
| 2026-03-10 | SEC-030: Instruction Limit Trap (Resolution) | 🟠 High | Both | ✅ **FIXED** |
| 2026-03-10 | SEC-031: Flood Factor integration missing | 🟡 Medium | Both | ✅ **FIXED** |
| 2026-02-17 | SEC-010: `assignParcelToPlayer` no self-check | 🟡 Medium | Both | Logged |
| 2026-02-17 | SEC-012: Principal exposed in query response | 🟡 Medium | Both | Logged |
| 2026-03-10 | Phase 6.1: Leaderboard Assembly DoS Risk | 🟢 Low | Both | Logged |

## Agent Instructions
1. Read `.agent/rules/SECURITY_DIRECTIVE_V1.md` for policy.
2. Audit **both** `main.mo` and `main_mainnet.mo` — verify parity.
3. If Critical/High found → Mark as `**BLOCKED**` and alert User.
4. If clean → Mark commit as "Security Reviewed ✅".
5. **Never approve deployment with open Critical/High findings.**
