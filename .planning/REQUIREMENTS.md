# Requirements: Mark Vinicius Cherry Tycoon

**Defined:** 2026-07-29
**Updated:** 2026-07-29 after GDD v3 (reconciling the code audit with the original `Mark_Vinicius_V1.md` concept — see `docs/game-design/GDD-ONE-PAGER.md`)
**Core Value:** Two pillars, one empire — a player can run the farm loop end-to-end (plant, tend, harvest, sell, compete in auctions and Cherry Festival) AND grow a football-club investment, with no dead levers, silently-broken features, or unexplained mechanics blocking either thread.

## v1 Requirements

Requirements for reaching V1-parity playability. Each maps to a roadmap phase.

### Leaderboard (LEAD)

- [x] **LEAD-01**: Player can view a ranked list of top players (pulls from existing `topPlayersCache`) — was already implemented (`RankingsPanel.tsx`) before Phase 1 started
- [x] **LEAD-02**: Player can see their own current rank and prestige score — "Your Standing" card added (Phase 1), covers players outside the visible cached top-N via `getPlayerRank`
- [x] **LEAD-03**: Leaderboard UI is usable on mobile (48x48px touch targets, no clipped columns) — responsive stacking added (Phase 1)

### Auth Correctness (AUTH)

- [x] **AUTH-01**: `isAuthenticated` is set only after `backendActor` is ready in ALL code paths, including `initTestMode()` — fixed 2026-07-29, `frontend/src/context/AuthContext.tsx:150`
- [ ] **AUTH-02**: Atomic Auth invariant still violated on the **restored-session** init path. When `client.isAuthenticated()` is already true, `AuthContext.tsx` calls `setIsAuthenticated(true)` unconditionally, so a failed `createBackendActor()` leaves `isAuthenticated === true` with `backendActor === null` — the state the invariant forbids. AUTH-01 fixed `initTestMode()` and the auto-login path guards with `if (actor)`; this branch never got the same guard. Found 2026-08-06 while rewriting the auth test suite; **flagged, not silently fixed** (production auth change is outside the approved test-infrastructure scope, per CLAUDE.md). A guard test already exists, marked `it.fails()` in `src/__tests__/useAuth.test.tsx` — when the fix lands, that test starts failing, which is the signal to drop the `.fails` marker.

### Football Clubs (SPORTS) — promoted from v2 to v1, core pillar per GDD v3

- [ ] **SPORTS-01**: `getAvailableFootballClubs()` returns real, seeded club data (currently hardcoded to always return an empty list, `main.mo:3325-3327`)
- [ ] **SPORTS-02**: `buyClubShares()` performs a real purchase (ownership%, cash deduction) instead of always returning "Sports Center feature coming soon!" (`main.mo:3329-3332`)
- [ ] **SPORTS-03**: `SportsCenter.tsx` (already fully built) displays real clubs and supports a real purchase flow end-to-end

### Core Economic Lever Fixes (ECON)

- [ ] **ECON-01**: Fertilizer type selection produces a measurably different outcome (currently `_fertilizerType` is accepted and ignored, `main.mo:858`)
- [ ] **ECON-02**: Season affects sale price (currently hardcoded `seasonMultiplier = 1.0`, `main.mo:2808-2819`)
- [ ] **ECON-03**: Auction runner-up receives the trickle-down amount (already computed in `AuctionResult.runnerUpId`, never read in `main.mo`)
- [ ] **ECON-04**: Player gains prestige on winning an Imperial Contract, matching the +5 AI competitors already receive (`main.mo:3166`)
- [ ] **ECON-05**: Only one spoilage system exists in code (delete dead `GameLogic.calculateSpoilageRate`, keep real `StorageLogic.calculateSpoilage`, document what actually runs)
- [ ] **ECON-06**: `CompetitorsPanel.tsx` reads the real `productionCapacity` field (not the nonexistent `baseCapacity`) and drops the hardcoded "+4.2%" market-trend tile
- [ ] **ECON-07**: AI archetype names (Marek/Kasia/Hans) are consistent across code (`#Traditionalist`/`#Innovator`/`#Businessman`), UI display names, and docs — pick one canonical scheme

### Weather UI Consolidation (WEATHER) — narrowed after audit found most of this already built

- [ ] **WEATHER-01**: A dedicated `useWeather()` hook exists (logic currently inline in `App.tsx`)
- [ ] **WEATHER-02**: `WeatherOverlay.tsx` no longer checks for the nonexistent `"Storm"` weather type; visual layer matches actual weather state (`WeatherEffects.tsx` already covers all 8 states correctly)
- [ ] **WEATHER-03**: A persistent weather indicator exists in the UI chrome (today it's one-shot-modal-only)

### Regional Geography Rebuild (GEO) — scoped for full Poland scalability per GDD v3 Pillar 2

**Correction (2026-07-30):** GEO-01 was originally written as if the province→county→commune data model needed to be created. It doesn't — confirmed in `backend/types.mo:12-44`: `Province` (16-variant enum, real voivodeships), `CommuneType` (`#Urban`/`#Rural`/`#Mixed`, i.e. miejska/wiejska/miejsko-wiejska per `Mark_Vinicius_V1.md` §4.1), and `Region {province, county, commune, communeType, population, marketSize, laborCostMultiplier}` all already exist, and `marketSize`/`laborCostMultiplier` already feed real formulas (`game_logic.mo:153`, `game_logic.mo:265`). The real gap is that every parcel is hardcoded to the same values (`#Opolskie`/`#Mixed`/0.8/1.0 — confirmed at `main.mo:238-244,1448,2386-2393,2471-2478` and mirrored in `main_mainnet.mo`), and `game_logic.mo:124-130`'s county-bonus switch matches on `parcel.region.county: Text` directly — a second, redundant string-based mechanism disconnected from the enum-based `Region`. GEO-01 rescoped below accordingly.

- [ ] **GEO-01 (rescoped)**: Populate `Region` with real variety across parcels (not every parcel hardcoded to Opolskie/Mixed/0.8/1.0) — variety tied to `CommuneType`: Rural communes get a larger buildable parcel grid, Urban/Mixed get a smaller grid but higher `marketSize` (decision locked 2026-07-30) — and consolidate the two redundant county mechanisms (the enum-based `Region.county` vs. `game_logic.mo`'s direct string switch) into one canonical source
- [ ] **GEO-02**: New parcels get real, varied soil type/pH/fertility instead of the current constant-optimal stub (`getRandomSoilType()`/`getRandomPH()`/`getRandomFertility()`, `main.mo:2345-2357`)
- [ ] **GEO-03**: The existing regional county-bonus system (`game_logic.mo:124-130`) is actually reachable (currently unreachable — `county` is hardcoded `"TBD"` on the standard purchase path, `main.mo:2388`)
- [ ] **GEO-05**: Wire `CherryParcel.plantedTrees` into the yield formula via a density ceiling (`effectiveTrees = min(plantedTrees, maxDensityPerHa * size)`, blended into the existing multiplicative formula) — confirmed disconnected today (`calculateYieldPotential`, `game_logic.mo:100-134`, uses `parcel.size` only; tree count is cost/cosmetic-only). Decision locked 2026-07-30: yes, wire it in.
- [ ] **GEO-06 (new)**: Revert base yield from the `25 tons/ha` testing placeholder (`game_logic.mo:104`, commented "Boosted for testing") to `Mark_Vinicius_V1.md` §1's stated `8-12 tons/ha` range. Decision locked 2026-07-30 — this was an untracked placeholder, not an intentional balance choice.

**GEO-04 moved out of this phase** — see Phase 5.1 below (the map-zoom UI was decided 2026-07-30 to be large/greenfield enough to warrant its own phase rather than bundling with the backend/data fixes above).

### Geography Map-Zoom UI (GEO-MAP) — split into its own phase 2026-07-30, depends on Phase 5 landing first

- [ ] **GEO-04**: Map-zoom UI hierarchy (gmina → powiat → województwo), three nested levels using the same isometric Canvas 2D technique as sketch 001 (gmina view = parcel grid, powiat view = grid of gmina tiles, województwo view = grid of powiat tiles) — confirmed greenfield, no existing frontend component for this at all
- [ ] **GEO-MAP-01**: Gmina tiles in the powiat view visually differ by `CommuneType` (Rural = more open green/tree iconography, Urban = denser building iconography, per `docs/game-design/lore/game-lore.md` visual language)
- [ ] **GEO-MAP-02**: Simple zoom-out/breadcrumb navigation between the three levels (standard city-builder pattern, no novel interaction needed)

### Cherry Festival (FESTIVAL) — new feature per GDD v3, was part of original concept, never built

- [ ] **FESTIVAL-01**: A designed Cherry Festival mechanic exists (spec written — currently only a one-paragraph mention in `Mark_Vinicius_V1.md` §2, zero code anywhere)
- [ ] **FESTIVAL-02**: Backend scoring/reward logic is implemented and testable
- [ ] **FESTIVAL-03**: Frontend surfaces festival standing/notifications to the player

### Crop Insurance (INSURANCE)

- [ ] **INSURANCE-01**: Exactly one crop-insurance backend implementation remains (currently two divergent, fully-functional ones: `buyInsurance()` and `purchaseCropInsurance()`)
- [ ] **INSURANCE-02**: Player can browse and purchase a policy from a real UI (currently zero frontend references to either backend function)

### Onboarding & Phase-System Teaching (ONBOARD)

- [ ] **ONBOARD-01**: The onboarding modal is reachable (or intentionally redesigned) on every network — currently silently auto-bypassed off-mainnet before the player ever sees it
- [ ] **ONBOARD-02**: A first-time player has some in-game explanation of the 10-phase yearly cycle beyond a one-line caption

### Quality Infrastructure (QUAL)

- [x] **QUAL-01**: `npm test` runs the Vitest suite — added `test` / `test:watch` / `test:integration` / `typecheck` scripts; wired the already-installed `@testing-library/jest-dom` via a new `vitest.setup.ts` (`setupFiles` was `[]`); rewrote `useAuth.test.tsx` (its assertions had gone stale against AuthProvider's auto-login bypass, so a `QueryClientProvider` wrapper alone was not enough — see `src/test-utils/providers.tsx`); moved `backend_integration.test.ts` to opt-in L3. Suite went 5 failed + 1 erroring file → **26 passed, 3 skipped, 0 failed**. Done 2026-08-06.
- [x] **QUAL-02**: ESLint config exists — `frontend/.eslintrc.cjs` (legacy format on purpose: ESLint 8.57 only honours flat config behind `ESLINT_USE_FLAT_CONFIG`, and the existing script's `--ext` flag is rejected by flat config). Before this, `npm run lint` did not run at all. Fixed 12 real findings while standing it up (7 × `prefer-const`, 5 × dead `@ts-ignore` that suppressed nothing). Done 2026-08-06. *Prettier deliberately not added — no formatting config existed to codify, and adding one would churn every file; out of scope.*
- [ ] **QUAL-03**: Playwright is either wired into a real e2e test or removed from dependencies (currently installed but unused) — Phase 10, Etap 4
- [ ] **QUAL-04**: Pay down the lint debt captured by the `--max-warnings` ratchet. Baseline at 2026-08-06 is **185 warnings** (96 `no-explicit-any`, 71 `no-unused-vars`, 10 `react-refresh/only-export-components`, 9 `react-hooks/exhaustive-deps`). Errors are already 0 and must stay 0. The ceiling in `package.json` may only ever be **lowered** — never raise it to make lint pass. The 9 `exhaustive-deps` warnings are the highest-risk subset (stale-closure bugs in the interval/animation-driven orchard components) and should be triaged first.
- [ ] **QUAL-05**: Enforce TS↔Motoko economic-formula parity automatically. `frontend/src/lib/gameLogic.ts` re-implements the yield modifiers that `backend/game_logic.mo` computes, and `frontend/src/config/gameBalanceConstants.ts` says *"Keep in sync with … backend/game_logic.mo"* — today that sync is guaranteed by a code comment and nothing else. Phase 10, Etap 1 (oracle fixture generated from the canister + Vitest parity assertion).
- [ ] **QUAL-06**: Candid drift guard — a CI step that runs `dfx generate` and fails if the committed `frontend/src/declarations/` differ, plus a static test asserting every backend method called from hooks still exists in `backend.did.d.ts`. This is the exact class of rot that broke ≥2 of the 23 `execution/tests/*.sh` scripts (calls to `getLeaderboard` / `advanceSeason`, both removed). Phase 10, Etap 2.

### UX/UI Deep Overhaul (UX) — scoped 2026-07-29 via live Playground screenshot audit, see `docs/game-design/UX-AUDIT-2026-07-29.md`

- [ ] **UX-01**: Fix the shared sidebar header layout bug (title wrap + version badge overlap) — cross-cutting, confirmed on every screen in the audit; fix before redesigning individual screens
- [ ] **UX-02**: Redesign the orchard/farm dashboard view to match the "tactile diorama" lore promise (visual density, God Rays/Golden Hour lighting cues) — currently the sparsest, least-finished screen
- [ ] **UX-03**: Establish one consistent visual idiom for stat/diagnostic displays (currently mixes circular gauges, bar meters, and plain text blocks with no shared grammar)
- [ ] **UX-04**: Resolve the two never-resolving placeholder boxes in the dashboard sidebar
- [ ] **UX-05**: Reconcile the "Processing Plant" marketplace card against the `SIM-04` deferral decision (functional partial-implementation vs. decorative dead lever) — new finding from the audit, not yet resolved
- [ ] **UX-06 (new)**: Implement sketch 001's winning direction (Variant A, "Geometric Brass" — isometric Canvas 2D procedural trees, Neo-Steampunk palette, seasonal cycle, path lanes, buildable border zone) in the real orchard component, replacing the CSS-blur canopy
- [ ] **UX-07 (new)**: Port the existing `WorkerNPC` system (`ImperialOrchard.tsx:579`, `hasHelper`-gated second NPC) to the isometric grid — reuse the hire-state gating and seasonal hooks, re-anchor positions via `isoToScreen()`, walk along the new path network instead of the old sector grid
- [ ] **UX-08 (new)**: Add procedural machine visuals (tractor/shaker) — greenfield, same Canvas 2D technique as trees, visible only when the player owns the corresponding infrastructure level and during the phase it would plausibly operate

## v2 Requirements

Deferred to future release per GDD v3's "Future / Not Now" section. Tracked but not in current roadmap.

### Map Expansion (MAP)

- **MAP-01**: Unlock provinces beyond Opole (`Mark_Vinicius_V1.md` §4, Phase 3)

### Multiplayer & ICP Tokenomics (CHAIN)

- **CHAIN-01**: Real multiplayer accounts / shared market at scale (`Mark_Vinicius_V1.md` §9, Phase 4)
- **CHAIN-02**: ICP payments, NFT land/club shares, DAO region-unlock voting (`Mark_Vinicius_V1.md` §9)

### Deeper Simulation (SIM)

- **SIM-01**: Seed/variety breeding, crop diversification (apples, plums) (`Mark_Vinicius_V1.md` §6)
- **SIM-02**: Beneficial-species ecosystem bonuses (`Mark_Vinicius_V1.md` §6)
- **SIM-03**: Sabotage mechanics (`Mark_Vinicius_V1.md` §6)
- **SIM-04**: Processing facilities — juices/jams/liqueurs (`Mark_Vinicius_V1.md` §1.1.4)
- **SIM-05**: Full Eco/Organic mode detail — explicit conversion period, certification cost tiers, random inspections (`Mark_Vinicius_V1.md` §5; current implementation has only a simplified real organic bonus)

### Backend Migration (EOP)

- **EOP-01**: Migrate `backend/main_mainnet.mo` to actual Enhanced Orthogonal Persistence syntax (`persistent actor` / `transient`) — currently still classic `actor`/`stable var` despite docs claiming otherwise

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time multiplayer chat | Not part of the core tycoon/auction loop |
| Native mobile app | Web-first PWA per `docs/game-design/ui/mobile-standard.md`; native app not planned |
| Rewriting dual-entrypoint (Track A/B) into a single track | Hard architectural constraint from ICP Playground identity-binding behavior, not revisitable |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LEAD-01 | Phase 1 | Complete |
| LEAD-02 | Phase 1 | Complete |
| LEAD-03 | Phase 1 | Complete |
| AUTH-01 | Phase 1.1 | Complete |
| SPORTS-01 | Phase 2 | Pending |
| SPORTS-02 | Phase 2 | Pending |
| SPORTS-03 | Phase 2 | Pending |
| ECON-01 | Phase 3 | Pending |
| ECON-02 | Phase 3 | Pending |
| ECON-03 | Phase 3 | Pending |
| ECON-04 | Phase 3 | Pending |
| ECON-05 | Phase 3 | Pending |
| ECON-06 | Phase 3 | Pending |
| ECON-07 | Phase 3 | Pending |
| WEATHER-01 | Phase 4 | Pending |
| WEATHER-02 | Phase 4 | Pending |
| WEATHER-03 | Phase 4 | Pending |
| GEO-01 | Phase 5 | Pending |
| GEO-02 | Phase 5 | Pending |
| GEO-03 | Phase 5 | Pending |
| GEO-05 | Phase 5 | Pending |
| GEO-06 | Phase 5 | Pending |
| GEO-04 | Phase 5.1 | Pending |
| GEO-MAP-01 | Phase 5.1 | Pending |
| GEO-MAP-02 | Phase 5.1 | Pending |
| FESTIVAL-01 | Phase 6 | Pending |
| FESTIVAL-02 | Phase 6 | Pending |
| FESTIVAL-03 | Phase 6 | Pending |
| INSURANCE-01 | Phase 7 | Pending |
| INSURANCE-02 | Phase 7 | Pending |
| ONBOARD-01 | Phase 8 | Pending |
| ONBOARD-02 | Phase 8 | Pending |
| UX-01 | Phase 9 | Pending |
| UX-02 | Phase 9 | Pending |
| UX-03 | Phase 9 | Pending |
| UX-04 | Phase 9 | Pending |
| UX-05 | Phase 9 | Pending |
| UX-06 | Phase 9 | Pending |
| UX-07 | Phase 9 | Pending |
| UX-08 | Phase 9 | Pending |
| QUAL-01 | Phase 10 | Complete |
| QUAL-02 | Phase 10 | Complete |
| QUAL-03 | Phase 10 | Pending |
| QUAL-04 | Phase 10 | Pending |
| QUAL-05 | Phase 10 | Pending |
| QUAL-06 | Phase 10 | Pending |
| AUTH-02 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 47 total (6 complete, 41 pending)
- Mapped to phases: 47
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-29*
*Last updated: 2026-07-29 after GDD v3 reconciliation with `Mark_Vinicius_V1.md`*
