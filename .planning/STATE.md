---
gsd_state_version: '1.0'
status: planning
progress:
  total_phases: 10
  completed_phases: 3
  total_plans: 7
  completed_plans: 7
  percent: 30
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-29)

**Core value:** Two pillars, one empire — a player can run the farm loop end-to-end (plant, tend, harvest, sell, compete in auctions and Cherry Festival) AND grow a football-club investment, with no dead levers, silently-broken features, or unexplained mechanics blocking either thread.
**Current focus:** Phase 2 — Football Clubs — Restore the Core Pillar (Phase 10 quality infrastructure landed 2026-08-06 and now guards the formulas Phases 3 and 5 will change)

## Current Position

Phase: 2 of 10 (Football Clubs — Restore the Core Pillar)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-08-07 — MAINT-01 fixed (real infrastructure wear + repair, Maintenance phase no longer dead) and AUTH-02 fixed (Atomic Auth guard on the restored-session path); lint ceiling tightened 185 -> 183. Before that: Phase 10 (Quality Infrastructure) executed out of order, in 4 sequenced stages. All 3 original success criteria met. Full test pyramid in place: 324 unit tests + 38 Playwright E2E specs, 3 CI workflows, TS↔Motoko economy parity enforcement, Candid drift guard.

Progress: [███░░░░░░░] 30%

## Performance Metrics

**Velocity:**
- Total plans completed: 7 (Phase 1: 1, Phase 1.1: 1, Phase 10: 5)
- Average duration: not tracked (work ran as a continuous session, not discrete timed plans)
- Total execution time: not tracked

**By Phase:**

| Phase | Plans | Status |
|-------|-------|--------|
| 1. Enhanced Leaderboard & Rankings UI | 1/1 | Complete 2026-07-29 |
| 1.1. Atomic Auth Fix | 1/1 | Complete 2026-07-29 |
| 10. Quality Infrastructure | 5/5 | Complete 2026-08-06 |

**Recent Trend:**
- Phase 10 delivered 5 stages in one session, each independently verified and committed
- Trend: infrastructure work is now unblocking gameplay work rather than trailing it

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Migration: Removed Antigravity/AGENTS-OS tooling, adopted GSD Core, on branch `feature/gsd-migration` (off `feature/antigravity-v2`, not stale `master`).
- Tooling gap: This session's Agent tool did not recognize the newly-installed `gsd-codebase-mapper` subagent type — codebase mapping was done via `general-purpose` subagents following the same focus/template split. Re-verify native `gsd-codebase-mapper` availability in a fresh session.
- GDD v3: rediscovered `Mark_Vinicius_V1.md` (original concept doc) after a code-only audit (`docs/game-design/CURRENT-STATE-2026-07-29.md`) had wrongly triaged football clubs as a side stub and Cherry Festival as scope creep. Both restored as in-scope per the original dual-pillar design (`docs/game-design/GDD-ONE-PAGER.md`). Roadmap Phases 2-10 rewritten accordingly.
- **Visual direction (2026-07-30/08-03):** Sketch 001 winner "Geometric Brass" (procedural Canvas 2D isometric trees) ported into `ImperialOrchard.tsx`; sketch 002 machines + both worker variants ported into `orchardMachines.ts`. Buildings then deliberately **split off from the procedural approach** onto real illustrated raster sprites (`frontend/public/assets/buildings/`, 4 seasons × 6 sets incl. l1/l2 tiers) — Canvas 2D vector drawing has a hard quality ceiling the mood-board reference does not share, and buildings are a small fixed catalog that needs no per-instance variety. Sketch 003 (building palette) remains unresolved/superseded by that decision.
- **Test architecture (2026-08-06):** four-layer pyramid with the TS↔Motoko parity oracle as the centrepiece, not an afterthought. Lint debt handled with a `--max-warnings` **ratchet** (errors 0 forever, warnings capped — 185 at introduction, 183 since 2026-08-07; the ceiling may only go down) rather than silencing rules. PocketIC evaluated and **rejected** — see `.planning/spikes/001-pocketic-for-backend-tests.md`.
- **Phase order deviation (2026-08-06):** Phase 10 ran before Phases 2–9. Justified in hindsight: its parity/contract layers found real defects inside Phase 3 and Phase 5 territory before those phases started.

### Pending Todos

- QUAL-04: pay down the lint ratchet (ceiling now **183**, lowered from 185 while fixing AUTH-02). Triage the 9 `react-hooks/exhaustive-deps` warnings first — highest risk (stale-closure bugs in the interval-driven orchard components). Never raise the ceiling to make lint pass.
- QUAL-09: port the 11 "healthy" legacy shell scripts to Vitest against an ephemeral dfx replica, then delete the originals and shrink `KNOWN_BROKEN` in `legacyShellScripts.test.ts`.
- QUAL-10: full-journey E2E against an ephemeral local replica (the layer the harness specs deliberately exclude). Needs a deterministic way to neutralise the random weather-event modal.
- QUAL-05b: close the parity loop against a live canister — needs a `debugCalculateYield` query, since `calculateYieldPotential` is internal.
- Phase 9 bookkeeping: UX-06 (and much of UX-07/08) was delivered ad hoc across the 2026-07-30..08-04 sessions but the roadmap's Phase 9 row still reads "not started". Reconcile before planning Phase 9 properly.

### Blockers/Concerns

**Flagged defects, deliberately not fixed (all outside the scope they were found in):**
- `ECON-PARITY-01`: `getInfrastructureModifier` in `game_logic.mo` folds `+=` (Tractor/Shaker/Sprayer/ColdStorage) and `*=` (GoldenHarvester) in one pass over the array, so the multiplier **depends on array order** (GH→Tractor 1.2525 vs Tractor→GH 1.2679). Changing it moves real payouts — an economy-balance decision. The frontend mirror reproduces the quirk faithfully so UI and payout agree while it stands.
- `MAINT-02`: repair costs 500/level while max wear equals 100% of spec upkeep, so servicing never pays back for assets whose spec upkeep is under 500/level (Sprayer 240, Warehouse 250, ColdStorage 400, Pruner 360, SocialFacilities 150). The UI says so honestly, but the mechanic is inert for cheap assets. Economy-balance decision (scale repair to wear, or raise the cap).
- `GEO-07`: two parcel-purchase methods coexist — `buyParcel` (used) and `purchaseParcel` (never called, and the one `lib/gddTemplate.ts` documents).

**Backend / infrastructure:**
- `backend/main_mainnet.mo` does not compile — pre-existing type errors (`AIStrategyState`, contracts, `baseCapacity`) unrelated to any recent change; this is the EOP-01 drift. **No test workflow may build Track B until EOP-01 is closed**, or it will be permanently red. Verified 2026-08-03 with a temporary local canister.
- dfx version mismatch noted between local/playground (0.24.3) and what CI's mainnet deploy assumes — see `.planning/codebase/STACK.md`, not yet turned into a phase.
- 108 of 697 tracked text files still have CRLF in HEAD. `.gitattributes` (added 2026-08-06) normalizes them as each is next staged — a trickle, not a mass rewrite, but expect inflated diff line counts on first touch of an affected file.

**Resolved since the last STATE update** (kept briefly for continuity):
- ~~No `npm test` script, no ESLint config, unused Playwright~~ → all three done (QUAL-01/02/03). Note the ESLint situation was *worse* than recorded: there was no config file at all, so `npm run lint` errored out rather than being a no-op.
- ~~`useAuth.test.tsx` fails 5/6~~ → rewritten, 14 passing. A `QueryClientProvider` wrapper alone was insufficient: the assertions had also gone stale against `AuthProvider`'s auto-login bypass.
- ~~`execution/tests/*.sh` (21 scripts) drifted~~ → measured properly: **23** scripts, **12** call removed methods (`advanceSeason` ×9, `getLeaderboard` ×2, `debugSetHansStorage` ×2) and **10** had CRLF. All CRLF fixed; the broken set is now pinned by a ratchet test so it cannot grow.
- ~~UX/UI overhaul scoped but not started~~ → partially delivered (see Pending Todos, Phase 9 bookkeeping).
- ~~`MAINT-01` Maintenance phase has no player action~~ → **fixed 2026-08-07**, but the premise was false: `inspectAndRepair` was a broken lever, not an unwired working method. It advertised "Degradation prevented." while no degradation existed, and really overwrote `maintenanceCost` with `level * 100` — a field that IS charged every season, so it was a permanent upkeep exploit (Shaker L1 1200 → 100). Now backed by real wear (`degradeMaintenance`, +10%/season, capped at 2x spec) with repair resetting to spec, wired to a UI card that states the actual numbers. Verified on a live replica.
- ~~`AUTH-02` Atomic Auth violated on the restored-session path~~ → **fixed 2026-08-07**. Guard added; the `it.fails()` placeholder replaced by symmetric assertions across all three entry paths plus a `{network} × {alreadyAuthenticated}` matrix test. Verified by reverting the guard (2 tests fail, naming the combination). Severity was latent, not live: `createBackendActor` never actually returns null today.

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Backend | EOP migration for `main_mainnet.mo` | Deferred (v2, EOP-01) — now also blocks Track B in CI | 2026-07-29 |
| Testing | PocketIC / `@dfinity/pic` for canister tests | Deferred — hard version incompatibility, see spike 001 | 2026-08-06 |
| Feature | Map expansion beyond Opole | Deferred (v2, MAP-01) | 2026-07-29, GDD v3 |
| Feature | Multiplayer / ICP tokenomics / NFT / DAO | Deferred (v2, CHAIN-01/02) | 2026-07-29, GDD v3 |
| Feature | Seed breeding, crop diversification, sabotage, processing, full Eco-mode detail | Deferred (v2, SIM-01..05) | 2026-07-29, GDD v3 |

Note: Sports Patron is **no longer deferred** — promoted to active Phase 2 per GDD v3.

## Session Continuity

Last session: 2026-08-07
Stopped at: Phase 10 (Quality Infrastructure) complete against its success criteria — 4 stages, 5 commits (`e201e8e`, `3894c99`, `f3e367c`, `00fe339`, `4ddaab4`), all on `feature/gsd-migration`. Gates verified green: 324 unit tests / 3 skipped / 0 failed, 38 Playwright specs, lint 0 errors, typecheck, build. Nothing pushed to `master`.

Next step options:
- `/gsd-plan-phase 2` (Football Clubs) — the intended next gameplay phase
- Phase 3 (Economic Levers) — now the best-guarded area: `economyParity.test.ts` will catch formula drift the moment it happens
- Reconcile Phase 9 bookkeeping (UX-06 already largely shipped) before planning it
- Clear the remaining flagged defects above (`GEO-07` folds naturally into Phase 5; `ECON-PARITY-01` and `MAINT-02` need economy-balance decisions, not code fixes)

Resume file: None
