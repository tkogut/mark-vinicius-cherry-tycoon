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

#### Phase 2: Football Clubs — Restore the Core Pillar ✅ (success criteria met 2026-08-07)
**Goal**: Sports Patron stops being a permanently-empty dead end. Both frontend (`SportsCenter.tsx`) and backend types already exist — the backend just needs to stop hardcoding empty/error responses.
**Depends on**: Nothing (both ends already built)
**Requirements**: SPORTS-01, SPORTS-02, SPORTS-03
**Success Criteria** (what must be TRUE):
  1. `getAvailableFootballClubs()` returns real, seeded club data instead of a hardcoded empty list
  2. `buyClubShares()` performs a real purchase (ownership%, cash deduction) instead of always returning "coming soon"
  3. `SportsCenter.tsx` displays real clubs and supports a real purchase flow end-to-end
**Plans**: 1 plan, scope agreed with the user before coding.

**Status (2026-08-07): all 3 success criteria met.** Scope was a deliberate vertical slice — the spec (`docs/game-design/economy/gdd-sports-patron.md`) opens with "should remain paused until Manager decides to implement it" and describes far more than these criteria (three patron tiers with orchard effects, Team Power Index match simulation, the Autumn/Spring league cycle synced to the 10 phases, Local Reputation feeding prestige, event archetypes). The user chose the slice: real clubs, real purchases, real UI — nothing simulated.

Two premises in this phase's own description turned out to be wrong, both found by reading before coding:
  - "the backend just needs to stop hardcoding empty/error responses" — there was also **nowhere to put clubs**. No stable state, no `patron_logic.mo`. Solved by keeping the catalogue as code in a new pure `backend/sports_logic.mo` and persisting only ownership, which let `getAvailableFootballClubs` stay a `query`.
  - "`SportsCenter.tsx` (already fully built)" — built, but against a contract that never existed: it read `c.price` and `c.sharesAvailable`, which are not fields of `Types.FootballClub`, so both rendered `0`, and printed the `Region` record as a string. Same defect class as ECON-06.

Verified on a live replica across every path: purchase (5% of LZS Lubrza for 6 000, cash 50 000 → 44 000), top-up (25% more for 30 000 → 14 000, `ownedClubs` deduplicated), over-100% rejection, insufficient funds, unknown club, zero stake, and — with a second dfx identity — "another patron already backs this club" plus a rival successfully claiming a different club. No Candid change: `FootballClub` was already in the generated interface, so `declarations/` stayed clean.

**Deliberately left open, each now a tracked requirement rather than a silent gap**: `SPORTS-04` (the `#Liga3`/`#Liga4` variant is misnamed by four tiers; a Candid rename, mitigated by correct display labels), `SPORTS-05` (patron tiers and their orchard impact — the part that makes a club a *pillar* rather than an asset; touches economy formulas), `SPORTS-06` (league simulation, TPI, reputation → prestige; its own phase). The UI states out loud that a stake does not yet affect the orchard.

Plans:
- [x] 02-01: Sports Patron vertical slice — `sports_logic.mo` catalogue + ownership overlay, real `buyClubShares` with typed rejections, `SportsCenter.tsx` rewired to the real Candid type, share-price mirror + 8 parity tests

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
**Goal**: Corrected 2026-07-30 — the province→county→commune data model (`Province`/`CommuneType`/`Region` in `backend/types.mo`) already exists and already feeds real pricing/labor formulas; this phase is about populating it with real variety, consolidating a redundant duplicate mechanism, wiring tree count into yield, and fixing the base-yield placeholder — not designing the data model from scratch, and not the map-zoom UI (split into Phase 5.1).
**Depends on**: Nothing, but benefits from being planned after Phase 3 (shares `game_logic.mo` yield-formula surface)
**Requirements**: GEO-01, GEO-02, GEO-03, GEO-05, GEO-06
**Success Criteria** (what must be TRUE):
  1. Parcels/regions show real variety (province/communeType/marketSize/laborCostMultiplier), not every parcel hardcoded to the same values — commune grid size tied to `CommuneType` (Rural = larger buildable grid, Urban/Mixed = smaller grid + higher `marketSize`)
  2. Only one county-bonus mechanism exists (the redundant string-based switch in `game_logic.mo` and the enum-based `Region.county` are consolidated)
  3. New parcels get real, varied soil type/pH/fertility instead of the current constant-optimal stub
  4. The county-bonus system is actually reachable (no more literal `"TBD"` county)
  5. `plantedTrees` measurably affects yield via a density ceiling, not just cost
  6. Base yield reverted from the `25 tons/ha` testing placeholder to `Mark_Vinicius_V1.md`'s `8-12 tons/ha` range
**Plans**: TBD

Plans:
- [ ] 05-01: TBD (created by `/gsd-plan-phase 5`)

#### Phase 5.1: Geography Map-Zoom UI (INSERTED)
**Goal**: Build the gmina→powiat→województwo map-zoom navigation — confirmed greenfield (no existing frontend component), split out from Phase 5 on 2026-07-30 because it's a large, genuinely new UI surface, not a backend/data fix.
**Depends on**: Phase 5 (needs real region variety to be meaningful — zooming out to identical hardcoded communes would be pointless) and Phase 9 (reuses sketch 001's isometric Canvas 2D technique, so ideally lands after that's implemented as real UI)
**Requirements**: GEO-04, GEO-MAP-01, GEO-MAP-02
**Success Criteria** (what must be TRUE):
  1. Player can zoom from their own parcel grid (gmina) out to a powiat view (grid of gmina tiles) and further out to a województwo view (grid of powiat tiles)
  2. Gmina tiles in the powiat view visually differ by `CommuneType` (Rural vs. Urban iconography)
  3. Navigation between the three levels uses a simple, standard zoom-out/breadcrumb pattern
**Plans**: TBD

Plans:
- [ ] 05.1-01: TBD (created by `/gsd-plan-phase 5.1`)

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

#### Phase 9: UX/UI Deep Overhaul 🟡 (partially delivered out of plan — see Status)
**Goal**: Per GDD v3 Pillar 6 and V1's own UI/UX priorities (§13) — current layout matches neither. Scoped 2026-07-29 via a live Playground deploy + screenshot audit (`docs/game-design/UX-AUDIT-2026-07-29.md`), turning the earlier vague "current layout is weak" concern into concrete, visually-confirmed findings.
**Depends on**: `ECON-06` and `ONBOARD-01` (Phase 3/8) should land before or during work on the Neighbors/onboarding screens specifically — otherwise the redesign faithfully re-skins live bugs (confirmed in the audit: `NaN%` market share, wrong player name shown). `SPORTS-01/02/03` (Phase 2) should land before redesigning Sports Center, which is currently a styled empty shell.
**Requirements**: UX-01, UX-02, UX-03, UX-04, UX-05, UX-06, UX-07, UX-08
**Success Criteria** (what must be TRUE):
  1. The shared sidebar header no longer overlaps/wraps on any screen
  2. The orchard/farm dashboard view visually matches the "tactile diorama" lore promise — implemented as sketch 001's winning direction (Variant A, "Geometric Brass": isometric Canvas 2D procedural trees, seasonal cycle, path lanes, buildable border zone), replacing the CSS-blur canopy
  3. Stat/diagnostic displays share one consistent visual idiom across screens
  4. No placeholder UI elements are left permanently unresolved
  5. The "Processing Plant" marketplace card's status (real partial feature vs. dead lever) is resolved, not left ambiguous
  6. The existing `WorkerNPC` hire-gated system is ported to the isometric grid, walking the new path network
  7. Procedural machine visuals (tractor/shaker) appear when the player owns the corresponding infrastructure
**Plans**: partially executed OUT OF PLAN — see the status block below before planning the remainder.

**Status (recorded 2026-08-07, retroactively):** criteria 6 and 7 are met and criterion 2 is *mostly* met, delivered ad hoc across ~25 commits between 2026-07-30 and 2026-08-03 in response to live Playground screenshots rather than through `/gsd-plan-phase 9`. This row read "not started" the whole time. Recording it now, with the gaps named rather than rounded up:

  - ✅ **Criterion 6** (UX-07, `WorkerNPC` on the isometric grid) — done. `hasHelper` hire-gating preserved, both NPCs walk the path lattice, and two distinct canvas worker variants ship (the user chose to keep both proposals from sketch 002 rather than pick one).
  - ✅ **Criterion 7** (UX-08, procedural machines) — **ownership gating done, phase gating NOT done.** Four machines (Modern Tractor, Precision Sprayer, Mechanical Shaker, Branch Pruner) render from `orchardAutomationConfig` in `App.tsx:171`, each flag driven by `getInfraLevel(...) > 0`, and they move along the path lattice with animated wheels/booms. But UX-08 also said "during the phase it would plausibly operate" — there is no `currentPhase` check anywhere in the machine path, so an owned Shaker drives around in Winter. Remaining work, not a delivered criterion.
  - 🟡 **Criterion 2** (UX-06, the "tactile diorama") — the CSS-blur canopy is gone, replaced by sketch 001's Geometric Brass direction: isometric Canvas 2D procedural trees, Neo-Steampunk palette, seasonal cycle, diamond-tiled parcels, a path *lattice* on tile boundaries (the original spec said lanes through tile centres — corrected during implementation after the user reported paths on the wrong diagonal), and inter-sector bridges. **The "buildable border zone" from the spec was never built** — no building appears in the orchard at all; the raster building sprites live only in the Marketplace.
  - ⬜ **Criteria 1, 3, 4, 5** (UX-01..UX-05) — untouched. The sidebar header bug, the stat-display idiom, the two permanent placeholder boxes, and the Processing Plant card are all still open, and they are the part of Phase 9 that came from the 2026-07-29 screenshot audit.
  - ➕ **Out of scope, shipped anyway**: real raster building sprites (4 seasons x Cold Storage L1/L2, Warehouse L1/L2, Processing Plant, Social Facilities) wired into the Marketplace with level tiers. This was a deliberate reversal of UX-06's "zero image assets, all procedural" principle, taken after the user judged the procedural palette "przerażająco mdła" and I explained the ceiling of Canvas 2D for building-scale art. Recorded as UX-09 so the reversal is a decision on the record, not an undocumented drift.

**Remaining for Phase 9**: UX-01, UX-02 (residual), UX-03, UX-04, UX-05, UX-06 (border zone), UX-08 (phase gating), UX-09 (place the building sprites in the orchard). Worth a real `/gsd-plan-phase 9` — the ad-hoc route worked for the orchard because the user was reviewing screenshots each round, which is not how the sidebar/stat-idiom work should go.

Plans:
- [x] 09-00: UX-06/07/08 delivered ad hoc from live screenshot review — `9be8318` (Geometric Brass canvas) → `4c3a111` (worker/machine ground-margin), plus `f804c72` (Branch Pruner end-to-end) and `f61ad9e` (Marketplace building sprites). ~25 commits, no plan file.
- [ ] 09-01: TBD (created by `/gsd-plan-phase 9`) — the remainder listed above

#### Phase 10: Quality Infrastructure ✅ (success criteria met 2026-08-06)
**Goal**: Close the tooling gaps found during codebase mapping so future phases have working lint/test signal instead of silent gaps.
**Depends on**: Nothing (independent — doesn't block gameplay). Ran ahead of Phases 2–9 by user choice.
**Requirements**: QUAL-01 ✅, QUAL-02 ✅, QUAL-03 ✅ (original scope) — plus QUAL-05 ✅, QUAL-06 ✅, QUAL-07 ✅, QUAL-08 ✅ discovered during execution
**Success Criteria** (what must be TRUE):
  1. ✅ `npm test` runs the Vitest suite and exits non-zero on failure — 324 passed / 3 skipped / 0 failed (was 5 failed + 1 erroring file)
  2. ✅ `npm run lint` runs against a real ESLint config (not a no-op) — it did not run *at all* before: ESLint had no config file and exited with "couldn't find a configuration file"
  3. ✅ Playwright is running real e2e tests in CI — 38 specs, `test-e2e.yml`

**What was actually built** (4 sequenced stages, one commit each):

| Stage | Delivered | Commit |
|---|---|---|
| 0 — Foundation | `.eslintrc.cjs`, `test`/`test:watch`/`test:integration`/`typecheck` scripts, `vitest.setup.ts` (jest-dom was installed but never registered), provider wrappers, `useAuth.test.tsx` rewritten, live-replica test moved to opt-in L3 | `e201e8e` |
| 1 — Unit + parity | `economyParity.test.ts` (transcription of `calculateYieldPotential` + 47-case vector), `gameLogic.test.ts`, `phaseGateParity.test.ts` | `3894c99` |
| 2 — Contract guard | `candidContract.test.ts` (method list read from the generated `idlFactory` at runtime), `dfx generate` drift step in CI, `test-unit.yml` | `f3e367c` |
| 3 — Backend triage | PocketIC spike (**rejected**, see `.planning/spikes/001-pocketic-for-backend-tests.md`), `legacyShellScripts.test.ts` ratchet, CRLF normalization, `.gitattributes` | `00fe339` |
| 4 — E2E | `playwright.config.ts`, 38 specs on the dev harnesses, `test-e2e.yml`, tsconfig widened to type-check the test infrastructure | `4ddaab4` |

**Test pyramid now in place**: L1 unit → L1b TS↔Motoko parity → L2 Candid contract → L3 live-replica (opt-in) → L4 Playwright E2E. Three CI workflows (`test-unit.yml`, `test-backend-logic.yml`, `test-e2e.yml`); `deploy-playground.yml`/`deploy-mainnet.yml` untouched throughout, as required by CLAUDE.md.

**Bugs found and fixed** (none of which had any test cover before):
  - Frontend yield mirror was missing the **county bonus** and **Golden Harvester** entirely, and multiplied in a different order than Motoko → the UI **under-reported yield by 19%** on a realistic loadout (43,537 kg shown vs 53,743 kg paid out)
  - UI enabled Marketplace purchases during `Maintenance`, which the canister rejects (`upgradeInfrastructure` requires `#Investment`) — a live button whose click always failed
  - 5 `@ts-ignore` directives that suppressed nothing (surfaced by converting to `@ts-expect-error`), 7 × `prefer-const`
  - 10 of 23 legacy shell scripts had CRLF and died under `bash` on Linux before their first API call — a failure hidden behind the dead-method problem

**Bugs found and deliberately FLAGGED, not fixed** (outside test-infrastructure scope, per CLAUDE.md): `AUTH-02` (Atomic Auth still violated on the restored-session path; guard test exists marked `it.fails()`), `ECON-PARITY-01` (Motoko's infra modifier mixes `+=`/`*=` so the multiplier depends on array order), `MAINT-01` (the `Maintenance` phase has no player action wired — `inspectAndRepair` is never called), `GEO-07` (two parcel-purchase methods coexist).

**Follow-ups still open**: QUAL-04 (pay down the 185-warning lint ratchet), QUAL-09 (port the 11 healthy shell scripts), QUAL-10 (full-journey E2E against an ephemeral replica).

Plans:
- [x] 10-00: Architecture + sequencing decided from a measured audit rather than the docs' assumptions (see the four stage commits above)
- [x] 10-01: Stage 0 — test/lint foundation — `e201e8e`
- [x] 10-02: Stage 1 — unit + economy parity — `3894c99`
- [x] 10-03: Stage 2 — Candid contract guard + fast CI gate — `f3e367c`
- [x] 10-04: Stage 3 — PocketIC spike + legacy shell triage — `00fe339`
- [x] 10-05: Stage 4 — Playwright E2E — `4ddaab4`

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 1.1 → 2 → 3 → 4 → 5 → 5.1 → 6 → 7 → 8 → 9 → 10. Phases 2–8 are largely independent of each other and can be reordered/parallelized if useful, except 5.1 which depends on 5 (and ideally 9); Phase 9 (UX overhaul) is intentionally sequenced late so it redesigns stable functionality; Phase 10 (quality infra) has no gameplay dependency and can move anywhere.

**Deviation from that order (2026-08-06):** Phase 10 was executed early, at the user's request, before Phases 2–9. This turned out well beyond its own goal: the parity and contract layers it built immediately found real defects in Phase 3's and Phase 5's territory (the missing county-bonus/Golden-Harvester yield terms, the two rival parcel-purchase methods) that a gameplay-first order would have shipped first and discovered later. Phases 3 and 5 now start with automated parity enforcement already guarding the formulas they are about to change. Also note Phase 9's UX-06 work (sketch 001/002 → `ImperialOrchard.tsx`, `orchardMachines.ts`, Marketplace building sprites) was largely delivered ad hoc during the same stretch of sessions and is **not** yet reflected in this table's Phase 9 row.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|-----------------|--------|-----------|
| 1. Enhanced Leaderboard & Rankings UI | Playable Release — V1 Parity | 1/1 | Complete | 2026-07-29 |
| 1.1. Atomic Auth Fix | Playable Release — V1 Parity | 1/1 | Complete | 2026-07-29 |
| 2. Football Clubs — Restore the Core Pillar | Playable Release — V1 Parity | 0/TBD | Not started | - |
| 3. Core Economic Lever Fixes | Playable Release — V1 Parity | 0/TBD | Not started | - |
| 4. Weather UI Consolidation | Playable Release — V1 Parity | 0/TBD | Not started | - |
| 5. Regional Geography Rebuild | Playable Release — V1 Parity | 0/TBD | Not started | - |
| 5.1. Geography Map-Zoom UI | Playable Release — V1 Parity | 0/TBD | Not started | - |
| 6. Cherry Festival | Playable Release — V1 Parity | 0/TBD | Not started | - |
| 7. Crop Insurance UI | Playable Release — V1 Parity | 0/TBD | Not started | - |
| 8. Onboarding & Phase-System Teaching | Playable Release — V1 Parity | 0/TBD | Not started | - |
| 9. UX/UI Deep Overhaul | Playable Release — V1 Parity | 0/TBD | Scoped (incl. sketch 001 winner), not started | - |
| 10. Quality Infrastructure | Playable Release — V1 Parity | 5/5 | Complete (success criteria met; QUAL-04/09/10 spun out as follow-ups) | 2026-08-06 |
