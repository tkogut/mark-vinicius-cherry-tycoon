---
phase: 9
slug: ux-ui-deep-overhaul
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-09-18
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (`frontend/vitest.config.ts`, `frontend/vitest.setup.ts`) + Playwright for e2e (`frontend/playwright.config.ts`) |
| **Config file** | `frontend/vitest.config.ts` |
| **Quick run command** | `cd frontend && npx vitest run src/__tests__/<file>.test.tsx` |
| **Full suite command** | `cd frontend && npm test` |
| **Estimated runtime** | ~15s quick (`./validate.sh fast`), ~60s full (`./validate.sh full`) |

---

## Sampling Rate

- **After every task commit:** `npx vitest run <changed test file>` (frontend); `./validate.sh backend` when `game_logic.mo` changes (UX-05)
- **After every plan wave:** `./validate.sh fast` (unit + lint + typecheck); `./validate.sh full` before any commit touching `.tsx` rendering, per CLAUDE.md
- **Phase gate:** `./validate.sh full` green, plus a live-replica check for UX-05's backend wholesale-price formula (compiling is not proof, per CLAUDE.md)
- **Max feedback latency:** ~15s (quick), ~60s (full)

---

## Per-Task Verification Map

Task IDs are not yet assigned — this phase has not been planned (no fresh PLAN.md for the remaining scope yet; `09-01-PLAN.md` on disk is the historical, already-executed UX-06 tree-canopy plan from Aug 2026). Rows below are per-requirement and will be refined to real Task IDs once `/gsd-plan-phase 9` produces plans.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | UX-02 | — | God-rays/pollen overlay always renders, intensity scales with Golden Harvester level, degrades on low FPS/mobile | unit | `npx vitest run src/__tests__/imperialOrchardLighting.test.tsx` | ❌ Wave 0 | ⬜ pending |
| TBD | TBD | TBD | UX-03 | — | No passive circular gauge remains outside `BidModal.tsx`'s legitimate input use; Bar Meter/Metric Badge grammar used consistently | unit (ratchet) | `npx vitest run src/__tests__/uiConventions.test.ts` | ✅ existing, extend | ⬜ pending |
| TBD | TBD | TBD | UX-04 | V4 Access Control (guest read path) | Guest mode shows an explicit sign-in state, never an infinite skeleton or a fabricated `0 PLN` | unit | `npx vitest run src/__tests__/runningCosts.test.tsx` | ❌ Wave 0 | ⬜ pending |
| TBD | TBD | TBD | UX-05 | V5 Input Validation (formula correctness) | `#ProcessingFacility` ownership yields exactly +15% wholesale price, order-independent, backend + Sell modal preview agree | unit (parity) | `npx vitest run src/__tests__/economyParity.test.ts` | ✅ existing, extend | ⬜ pending |
| TBD | TBD | TBD | UX-05 | — | Live replica: owned Processing Plant changes `sellCherries` wholesale payout by exactly 15% | manual/live-replica | `dfx deploy backend` + manual call, values in commit message | ❌ N/A — manual | ⬜ pending |
| TBD | TBD | TBD | UX-06/UX-09 | — | Building renders in correct fixed N/NE slot on purchase, correct season sprite, correct z-order vs. trees, click opens Action Dock not a modal | e2e | `npm run test:e2e` (new spec in `e2e/orchard.spec.ts`) | ❌ Wave 0 | ⬜ pending |
| TBD | TBD | TBD | UX-08 | — | Owned machine only animates/renders during its mapped `SeasonPhase`(s) | unit | new `src/__tests__/orchardAutomationConfig.test.ts` | ❌ Wave 0 | ⬜ pending |
| TBD | TBD | TBD | D-11 (MainDashboard dead controls) | — | "Market Auction" button navigates for real; STEAM PRESSURE shows real data or is removed | unit/e2e | extend `uiConventions.test.ts` or new component test | ❌ Wave 0 | ⬜ pending |
| TBD | TBD | TBD | D-12 (BidModal fake gauges) | — | The three `EmeraldGauge` instances in `BidModal.tsx` reflect real auction data, not hardcoded 85/40/95 | unit | new/extended `BidModal` component test | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/imperialOrchardLighting.test.tsx` — UX-02 (overlay presence, intensity scaling, mobile/low-FPS reduction)
- [ ] `src/__tests__/runningCosts.test.tsx` — UX-04 (guest/sign-in/loading/error/data branches), following `competitorsPanel.test.tsx`'s `createAuthWrapper` pattern
- [ ] `src/__tests__/orchardAutomationConfig.test.ts` — UX-08 (machine × phase truth table)
- [ ] `e2e/orchard.spec.ts` additions — UX-06/UX-09 (building slot rendering, seasonal swap, z-order, click-to-Action-Dock)
- [ ] Extend `src/__tests__/uiConventions.test.ts` — UX-03 grammar ratchet + D-11's dead-control fix
- [ ] Extend `src/__tests__/economyParity.test.ts` — UX-05 formula parity
- [ ] New/extended `BidModal` component test — D-12's fake-gauge fix

*Framework install: none needed — Vitest/Playwright already configured and passing (`QUAL-01`/`QUAL-03`).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Owned Processing Plant raises wholesale payout by exactly 15% | UX-05 | Backend behavior on a live replica per CLAUDE.md — "Verify backend behaviour on a live replica, not by compiling" | `dfx deploy backend`, own a Processing Plant, call `sellCherries` (wholesale) before/after, compare payout |
| God-rays/pollen overlay visually reads as "always on, intensity scales with Golden Harvester" | UX-02 | Visual/atmosphere judgment, not a pure logic assertion | Load the orchard at each Golden Harvester level (0-3), confirm visible intensity difference and no perceptible frame drop on a throttled/mobile profile |
| Building appears visually correct in its N/NE slot (not overlapping trees/paths, correct season sprite) | UX-06/UX-09 | Visual correctness of isometric placement | Purchase each building type on a live/dev build, screenshot at each season |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
