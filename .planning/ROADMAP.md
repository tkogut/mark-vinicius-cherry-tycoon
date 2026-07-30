# Roadmap: Mark Vinicius Cherry Tycoon

## Milestones

- ✅ **v1.0–v12.0 Core Game** — legacy Phases 1–12 (shipped, pre-GSD Core)
- 🚧 **Playable Release — V1 Parity** — Phase 1–10 (in progress, restructured 2026-07-29 after GDD v3)

## Phases

<details>
<summary>✅ v1.0–v12.0 Core Game (legacy Phases 1–12) — SHIPPED (pre-2026-07-29, pre-GSD Core)</summary>

Built under the previous (Antigravity/AGENTS-OS) tooling, before this repo adopted GSD Core. Full historical detail lived in `.agents/specs/ANTIGRAVITY.md`, since removed; summary preserved here.

- Phase 1–4: Core logic, MVP integration, economy, infrastructure, multiplayer prep.
- Phase 5.7: Mechanics deepening (Bulk Supply, Phase Watering, Machine Decay).
- Phase 5.9: Security hardening (SEC-019, SEC-020) — see `docs/security/security-backlog.md`.
- Phase 6.1 (backend): Global Leaderboards & Prestige Scoring — `topPlayersCache` active. (Frontend UI carried forward as Phase 1 below.)
- Phase 7.0 (backend): The Living World (Event system, Weather, Crop Insurance). (Frontend UI carried forward as Phases 4/7 below.)
- Phase 8.0: The Competitive Pool (`auction_logic.mo`, Bids, Flood Factor, Base AI Archetypes).
- Phase 8.1/9.0: Imperial Contract Bid Modal, refined gauge system, Auction Dashboard.
- Phase 11.0: Advanced AI Market Competitors — Marek/Kasia/Hans (naming to be canonicalized, see Phase 3).
- Cinematic Upgrade "The Golden Harvester": `golden_harvester_level` scaling, God Rays/Golden Hour lighting, `GoldenPollen` particles.
- Phase 10.0 Sports Patron (IV Liga Opolska): built on both ends, backend deliberately stubbed to empty/error — restored as a core pillar in Phase 2 below (see GDD v3, `docs/game-design/GDD-ONE-PAGER.md`).

</details>

### 🚧 Playable Release — V1 Parity (In Progress)

**Milestone Goal**: originally scoped as "close two frontend gaps + one auth bug." Restructured 2026-07-29 after (1) a full code-verified gameplay audit and (2) rediscovering the original concept doc `Mark_Vinicius_V1.md`, which showed football clubs were meant as an equal core pillar (not a side stub) and Cherry Festival was part of the original rivalry design (not scope creep). Per GDD v3: **finish Phase 2 (football clubs) properly, correct the broken/dead levers found across Phase 0–1, then extend toward the fuller original vision** (scalable geography, Cherry Festival, insurance, onboarding) before a dedicated UX/UI overhaul and quality-infrastructure pass.

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
- [x] 01.1-01: Fix ordering in `frontend/src/context/AuthContext.tsx:150` (`initTestMode()`) — `.planning/phases/01.1-atomic-auth-fix/01.1-01-PLAN.md`

#### Phase 2: Football Clubs — Restore the Core Pillar
**Goal**: Sports Patron stops being a permanently-empty dead end. Both frontend (`SportsCenter.tsx`) and backend types already exist — the backend just needs to stop hardcoding empty/error responses.
**Depends on**: Nothing (both ends already built)
**Requirements**: SPORTS-01, SPORTS-02, SPORTS-03
**Success Criteria** (what must be TRUE):
  1. `getAvailableFootballClubs()` returns real, seeded club data instead of a hardcoded empty list
  2. `buyClubShares()` performs a real purchase (ownership%, cash deduction) instead of always returning "coming soon"
  3. `SportsCenter.tsx` displays real clubs and supports a real purchase flow end-to-end
**Plans**: TBD

Plans:
- [ ] 02-01: TBD (created by `/gsd-plan-phase 2`)

#### Phase 3: Core Economic Lever Fixes
**Goal**: Close the "dead lever" findings from the 2026-07-29 audit — small, mostly independent fixes bundled into one phase.
**Depends on**: Nothing (independent of Phase 2)
**Requirements**: ECON-01, ECON-02, ECON-03, ECON-04, ECON-05, ECON-06, ECON-07
**Success Criteria** (what must be TRUE):
  1. Fertilizer type selection produces a measurably different outcome
  2. Season affects sale price
  3. Auction runner-up receives the (already-computed) trickle-down amount
  4. Player gains prestige on winning an Imperial Contract, matching AI competitors
  5. Only one spoilage system exists in code, and it matches what's documented
  6. `CompetitorsPanel` reads real fields, no fabricated numbers
  7. AI archetype names (Marek/Kasia/Hans) are consistent across code, UI, and docs
**Plans**: TBD

Plans:
- [ ] 03-01: TBD (created by `/gsd-plan-phase 3`)

#### Phase 4: Weather UI Consolidation
**Goal**: Narrower than originally scoped — `WeatherEffects.tsx`/`WeatherEventModal.tsx` already cover all 8 real weather states; fix the dead/buggy `WeatherOverlay.tsx` layer and add a persistent indicator.
**Depends on**: Nothing, independent
**Requirements**: WEATHER-01, WEATHER-02, WEATHER-03
**Success Criteria** (what must be TRUE):
  1. A dedicated `useWeather()` hook exists (logic extracted out of `App.tsx`)
  2. `WeatherOverlay.tsx` no longer checks for the nonexistent `"Storm"` type; its visual layer matches actual weather state
  3. A persistent (not one-shot-modal-only) weather indicator exists in the UI chrome
**Plans**: TBD

Plans:
- [ ] 04-01: TBD (created by `/gsd-plan-phase 4`)

#### Phase 5: Regional Geography Rebuild
**Goal**: Corrected 2026-07-30 — the province→county→commune data model (`Province`/`CommuneType`/`Region` in `backend/types.mo`) already exists and already feeds real pricing/labor formulas; this phase is about populating it with real variety, consolidating a redundant duplicate mechanism, wiring tree count into yield, and building the (currently nonexistent) gmina→powiat→województwo map-zoom UI — not designing the data model from scratch.
**Depends on**: Nothing, but benefits from being planned after Phase 3 (shares `game_logic.mo` yield-formula surface)
**Requirements**: GEO-01, GEO-02, GEO-03, GEO-04, GEO-05
**Success Criteria** (what must be TRUE):
  1. Parcels/regions show real variety (province/communeType/marketSize/laborCostMultiplier), not every parcel hardcoded to the same values
  2. Only one county-bonus mechanism exists (the redundant string-based switch in `game_logic.mo` and the enum-based `Region.county` are consolidated)
  3. New parcels get real, varied soil type/pH/fertility instead of the current constant-optimal stub
  4. The county-bonus system is actually reachable (no more literal `"TBD"` county)
  5. A player can navigate gmina → powiat → województwo map views (new UI, reusing the isometric Canvas 2D technique from sketch 001)
  6. `plantedTrees` measurably affects yield, not just cost
**Plans**: TBD — needs a Discuss sub-phase given the design decisions in `.planning/sketches/geography-design-notes.md` (tree-per-parcel density, commune-size-by-type, map-zoom navigation) still need explicit sign-off

Plans:
- [ ] 05-01: TBD (created by `/gsd-plan-phase 5`)

#### Phase 6: Cherry Festival
**Goal**: Design and build the Cherry Festival competitive event — part of the original rivalry design (`Mark_Vinicius_V1.md` §2), not previously built at all.
**Depends on**: Phase 3 (shares auction/rivalry scoring concepts)
**Requirements**: FESTIVAL-01, FESTIVAL-02, FESTIVAL-03
**Success Criteria** (what must be TRUE):
  1. A designed Cherry Festival mechanic exists (spec written, not just a name)
  2. Backend scoring/reward logic is implemented and testable
  3. Frontend surfaces festival standing/notifications to the player
**Plans**: TBD — needs a design spike first (no prior spec exists beyond the one-paragraph original mention)

Plans:
- [ ] 06-01: TBD (created by `/gsd-plan-phase 6`)

#### Phase 7: Crop Insurance UI
**Goal**: Two divergent, fully-functional backend implementations exist; neither is reachable from the frontend. Pick one, delete the other, build the missing UI.
**Depends on**: Nothing, independent
**Requirements**: INSURANCE-01, INSURANCE-02
**Success Criteria** (what must be TRUE):
  1. Exactly one crop-insurance backend implementation remains
  2. Player can browse and purchase a policy from a real UI, not just via `dfx canister call`
**Plans**: TBD

Plans:
- [ ] 07-01: TBD (created by `/gsd-plan-phase 7`)

#### Phase 8: Onboarding & Phase-System Teaching
**Goal**: Close the single biggest UX gap found in the player-journey audit — onboarding is dead off-mainnet, and the 10-phase yearly cycle (the game's most structurally important mechanic) is taught nowhere.
**Depends on**: Nothing, independent
**Requirements**: ONBOARD-01, ONBOARD-02
**Success Criteria** (what must be TRUE):
  1. The onboarding modal is reachable (or intentionally redesigned) on every network, not silently bypassed
  2. A first-time player has some in-game explanation of the phase system beyond a one-line caption
**Plans**: TBD

Plans:
- [ ] 08-01: TBD (created by `/gsd-plan-phase 8`)

#### Phase 9: UX/UI Deep Overhaul
**Goal**: Per GDD v3 Pillar 6 and V1's own UI/UX priorities (§13) — current layout matches neither. Scoped 2026-07-29 via a live Playground deploy + screenshot audit (`docs/game-design/UX-AUDIT-2026-07-29.md`), turning the earlier vague "current layout is weak" concern into concrete, visually-confirmed findings.
**Depends on**: `ECON-06` and `ONBOARD-01` (Phase 3/8) should land before or during work on the Neighbors/onboarding screens specifically — otherwise the redesign faithfully re-skins live bugs (confirmed in the audit: `NaN%` market share, wrong player name shown). `SPORTS-01/02/03` (Phase 2) should land before redesigning Sports Center, which is currently a styled empty shell.
**Requirements**: UX-01, UX-02, UX-03, UX-04, UX-05
**Success Criteria** (what must be TRUE):
  1. The shared sidebar header no longer overlaps/wraps on any screen
  2. The orchard/farm dashboard view visually matches the "tactile diorama" lore promise, using Rankings/Imperial Pool (already reference-quality per the audit) as the style bar to hit
  3. Stat/diagnostic displays share one consistent visual idiom across screens
  4. No placeholder UI elements are left permanently unresolved
  5. The "Processing Plant" marketplace card's status (real partial feature vs. dead lever) is resolved, not left ambiguous
**Plans**: TBD — ready for a normal `/gsd-plan-phase 9` now that scoping is done

Plans:
- [ ] 09-01: TBD (created by `/gsd-plan-phase 9`)

#### Phase 10: Quality Infrastructure
**Goal**: Close the tooling gaps found during codebase mapping so future phases have working lint/test signal instead of silent gaps.
**Depends on**: Nothing (independent, lowest urgency — doesn't block gameplay)
**Requirements**: QUAL-01, QUAL-02, QUAL-03
**Success Criteria** (what must be TRUE):
  1. `npm test` runs the Vitest suite and exits non-zero on failure
  2. `npm run lint` runs against a real ESLint config (not a no-op)
  3. Playwright is either running at least one real e2e test in CI, or removed from `frontend/package.json`
**Plans**: TBD

Plans:
- [ ] 10-01: TBD (created by `/gsd-plan-phase 10`)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 1.1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10. Phases 2–8 are largely independent of each other and can be reordered/parallelized if useful; Phase 9 (UX overhaul) is intentionally sequenced late so it redesigns stable functionality; Phase 10 (quality infra) has no gameplay dependency and can move anywhere.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|-----------------|--------|-----------|
| 1. Enhanced Leaderboard & Rankings UI | Playable Release — V1 Parity | 1/1 | Complete | 2026-07-29 |
| 1.1. Atomic Auth Fix | Playable Release — V1 Parity | 1/1 | Complete | 2026-07-29 |
| 2. Football Clubs — Restore the Core Pillar | Playable Release — V1 Parity | 0/TBD | Not started | - |
| 3. Core Economic Lever Fixes | Playable Release — V1 Parity | 0/TBD | Not started | - |
| 4. Weather UI Consolidation | Playable Release — V1 Parity | 0/TBD | Not started | - |
| 5. Regional Geography Rebuild | Playable Release — V1 Parity | 0/TBD | Not started | - |
| 6. Cherry Festival | Playable Release — V1 Parity | 0/TBD | Not started | - |
| 7. Crop Insurance UI | Playable Release — V1 Parity | 0/TBD | Not started | - |
| 8. Onboarding & Phase-System Teaching | Playable Release — V1 Parity | 0/TBD | Not started | - |
| 9. UX/UI Deep Overhaul | Playable Release — V1 Parity | 0/TBD | Scoped, not started | - |
| 10. Quality Infrastructure | Playable Release — V1 Parity | 0/TBD | Not started | - |
