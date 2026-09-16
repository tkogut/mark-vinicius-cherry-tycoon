---
phase: 3
slug: core-economic-lever-fixes
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-09-16
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.0.18 |
| **Config file** | `frontend/vitest.config.ts` (`include: ['src/__tests__/**/*.test.ts', 'src/__tests__/**/*.test.tsx']`) |
| **Quick run command** | `cd frontend && npx vitest run src/__tests__/economyParity.test.ts` |
| **Full suite command** | `cd frontend && npm test` (currently 388 tests / 8 files per CLAUDE.md) |
| **Estimated runtime** | ~15s quick (`./validate.sh fast`), ~60s full (`./validate.sh full`) |

---

## Sampling Rate

- **After every task commit:** Run `cd frontend && npx vitest run src/__tests__/economyParity.test.ts` plus `./validate.sh fast`
- **After every plan wave:** Run `./validate.sh full` (build + e2e + declaration drift) — mandatory before any commit touching `.tsx` per CLAUDE.md
- **Before `/gsd-verify-work`:** Full suite must be green (`npm test`, 388+ tests) + `./validate.sh backend` (moc type-check both tracks) + at least one live-replica verification per backend-touching requirement (ECON-01/02/03/04/05), with observed before/after values quoted in the commit message
- **Max feedback latency:** ~15s (quick), ~60s (full)

---

## Per-Task Verification Map

Task IDs are not yet assigned — this phase has not been planned (no PLAN.md exists). Rows below are per-requirement and will be refined to real Task IDs once `/gsd-plan-phase 3` produces plans.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | 0/1 | ECON-01 | V5 Input Validation | Fertilizer type validated against closed set server-side | unit (parity) | `npx vitest run src/__tests__/economyParity.test.ts` | ❌ Wave 0 | ⬜ pending |
| TBD | TBD | TBD | ECON-02 | Repudiation-adjacent (parity) | Season sale-price multiplier matches frontend mirror | unit (parity) + manual replica | `npx vitest run src/__tests__/economyParity.test.ts` | ❌ Wave 0 | ⬜ pending |
| TBD | TBD | TBD | ECON-03 | Tampering (Nat underflow) | Runner-up trickle payout computed and paid without underflow | unit + manual replica | new test for `AuctionLogic.resolveContract` | ❌ Wave 0 | ⬜ pending |
| TBD | TBD | TBD | ECON-04 | Tampering (Nat underflow) | Player prestige credited symmetrically to AI win bonus | manual replica (primary) | `dfx canister call ... resolveSeasonAuctions` before/after reputation | ❌ Wave 0 | ⬜ pending |
| TBD | TBD | TBD | ECON-05 | N/A | Dead `calculateSpoilageRate` removed, docs match live `calculateSpoilage` | static (grep/compile) | `grep -rn "calculateSpoilageRate" backend/ frontend/` → zero hits; `./validate.sh backend` | ❌ Wave 0 | ⬜ pending |
| TBD | TBD | TBD | ECON-06 | N/A | `CompetitorsPanel` reads `productionCapacity`, no `any` cast | unit (component/type) | `npx vitest run` (new component test) | ❌ Wave 0 | ⬜ pending |
| TBD | TBD | TBD | ECON-07 | N/A | One canonical archetype-name scheme across code/UI/docs | static (grep) + optional unit | `grep -rn "Jan Kowalski\|Anna Nowak\|Piotr Wiśniewski" frontend/src` → zero hits | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `economyParity.test.ts` — new `describe('economy parity: fertilizer type (ECON-01)', ...)` block once the type taxonomy/multiplier is locked (Ask First — balance decision)
- [ ] `economyParity.test.ts` — new `describe('economy parity: season sale price (ECON-02)', ...)` block once the multiplier table is locked (Ask First — balance decision)
- [ ] New test coverage for `AuctionLogic.resolveContract`'s runner-up trickle (ECON-03) — zero existing `__tests__` references to `AuctionLogic`/`resolveContract`
- [ ] New or extended component test for `CompetitorsPanel.tsx` (ECON-06) — no existing test file
- [ ] Extend a `uiConventions.test.ts`-style grep ratchet for archetype-name consistency (ECON-07) — optional, follows the project's established emoji/currency ratchet pattern

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Fertilizing with two different types produces different measured fertility/yield | ECON-01 | Backend behavior on a live replica per CLAUDE.md — "Verify backend behaviour on a live replica, not by compiling" | `dfx deploy backend` → `dfx canister call fertilizeParcel <parcelId> <typeA>` then `<typeB>` on comparable parcels, compare resulting fertility/yield |
| Selling identical inventory in two different seasons yields different revenue | ECON-02 | Same reason — season-dependent formula only observable end-to-end | `dfx canister call sellCherries ...` in two different `SeasonPhase` states, compare revenue |
| Runner-up in a multi-bidder contract receives the trickle-down payout | ECON-03 | Multi-actor auction outcome, not unit-testable without a live contract resolution | `dfx deploy backend`, set up a 2+-bidder Imperial Contract, resolve it, read runner-up's cash/inventory before/after |
| Player reputation increases on winning an Imperial Contract | ECON-04 | Same — full `resolveSeasonAuctions` path | `dfx canister call resolveSeasonAuctions`, read `farm.reputation` before/after a win |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
