# Roadmap: Mark Vinicius Cherry Tycoon

## Milestones

- ✅ **v1.0–v12.0 Core Game** — legacy Phases 1–12 (shipped, pre-GSD Core)
- 🚧 **Playable Release** — Phase 1–3 (in progress, first GSD Core milestone)

## Phases

<details>
<summary>✅ v1.0–v12.0 Core Game (legacy Phases 1–12) — SHIPPED (pre-2026-07-29, pre-GSD Core)</summary>

Built under the previous (Antigravity/AGENTS-OS) tooling, before this repo adopted GSD Core. Full historical detail lived in `.agents/specs/ANTIGRAVITY.md`, since removed; summary preserved here.

- Phase 1–4: Core logic, MVP integration, economy, infrastructure, multiplayer prep.
- Phase 5.7: Mechanics deepening (Bulk Supply, Phase Watering, Machine Decay).
- Phase 5.9: Security hardening (SEC-019, SEC-020) — see `docs/security/security-backlog.md`.
- Phase 6.1 (backend): Global Leaderboards & Prestige Scoring — `topPlayersCache` active. (Frontend UI carried forward as Phase 1 below.)
- Phase 7.0 (backend): The Living World (Event system, Weather, Crop Insurance). (Frontend UI carried forward as Phase 2 below.)
- Phase 8.0: The Competitive Pool (`auction_logic.mo`, Bids, Flood Factor, Base AI Archetypes).
- Phase 8.1/9.0: Imperial Contract Bid Modal, refined gauge system, Auction Dashboard.
- Phase 11.0: Advanced AI Market Competitors — The Aggressive (Marek), The Eco (Kasia), The Tactician (Hans).
- Cinematic Upgrade "The Golden Harvester": `golden_harvester_level` scaling, God Rays/Golden Hour lighting, `GoldenPollen` particles.
- Phase 10.0 Sports Patron (IV Liga Opolska): DEFERRED, not built — see `.planning/REQUIREMENTS.md` v2.

</details>

### 🚧 Playable Release (In Progress)

**Milestone Goal:** Close the two known frontend gaps, fix the one confirmed correctness bug, and stop shipping on top of silently-broken quality tooling — so "playable end-to-end" is actually true, not just claimed.

#### Phase 1: Enhanced Leaderboard & Rankings UI
**Goal**: Player can view global rankings and their own standing; backend (`topPlayersCache`) already complete, this is frontend-only.
**Depends on**: Nothing (backend ready)
**Requirements**: LEAD-01, LEAD-02, LEAD-03
**Success Criteria** (what must be TRUE):
  1. Player can open a leaderboard view showing ranked players by prestige score
  2. Player can see their own current rank highlighted in that list
  3. Leaderboard is usable on a mobile viewport (48x48px touch targets, no horizontal scroll)
**Plans**: 1 plan (scope narrowed after Discuss — see plan file; `frontend/src/components/social/RankingsPanel.tsx` already existed and covered most of LEAD-01/02)

Plans:
- [x] 01-01: Add `useMyRank()` + "Your Standing" card (LEAD-02 for players outside the cached top-N) and responsive stacking for the ranking rows (LEAD-03) — `.planning/phases/01-enhanced-leaderboard-rankings-ui/01-01-PLAN.md`

#### Phase 1.1: Atomic Auth Fix (INSERTED)
**Goal**: Close a real correctness bug found during codebase mapping — `initTestMode()` violates the documented Atomic Auth invariant.
**Depends on**: Phase 1 (or can run independently — small, isolated fix)
**Requirements**: AUTH-01
**Success Criteria** (what must be TRUE):
  1. `isAuthenticated` is only ever set to `true` after `backendActor` is non-null, in every code path including test mode
  2. Existing auth-dependent flows (login, actor-gated queries) still work after the fix
**Plans**: 1 plan

Plans:
- [ ] 01.1-01: Fix ordering in `frontend/src/context/AuthContext.tsx:150` (`initTestMode()`)

#### Phase 2: Weather & Event UI Integration
**Goal**: Surface the existing weather/event backend systems (Living World, Crop Insurance) in the frontend.
**Depends on**: Nothing (backend ready), independent of Phase 1
**Requirements**: WEATHER-01, WEATHER-02, WEATHER-03
**Success Criteria** (what must be TRUE):
  1. Active weather effects are visible on the orchard view
  2. Player is notified in-UI when an event (Crop Insurance window, Cherry Festival) is active
  3. Weather/event visuals reuse the existing particle/VFX component patterns rather than introducing a new one
**Plans**: TBD

Plans:
- [ ] 02-01: TBD (created by `/gsd-plan-phase 2`)

#### Phase 3: Quality Infrastructure
**Goal**: Close the tooling gaps found during codebase mapping so future phases have working lint/test signal instead of silent gaps.
**Depends on**: Nothing (independent, can run in parallel with Phase 1/2)
**Requirements**: QUAL-01, QUAL-02, QUAL-03
**Success Criteria** (what must be TRUE):
  1. `npm test` runs the Vitest suite and exits non-zero on failure
  2. `npm run lint` runs against a real ESLint config (not a no-op)
  3. Playwright is either running at least one real e2e test in CI, or removed from `frontend/package.json`
**Plans**: TBD

Plans:
- [ ] 03-01: TBD (created by `/gsd-plan-phase 3`)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 1.1 → 2 → 3 (2 and 3 can run independently of 1/1.1 if useful)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|-----------------|--------|-----------|
| 1. Enhanced Leaderboard & Rankings UI | Playable Release | 1/1 | Complete | 2026-07-29 |
| 1.1. Atomic Auth Fix | Playable Release | 0/1 | Not started | - |
| 2. Weather & Event UI Integration | Playable Release | 0/TBD | Not started | - |
| 3. Quality Infrastructure | Playable Release | 0/TBD | Not started | - |
