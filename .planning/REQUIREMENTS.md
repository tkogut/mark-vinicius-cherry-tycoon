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

- [ ] **GEO-01**: A scalable province→county→commune data model exists (even if only Opole is populated/unlocked at launch), per `Mark_Vinicius_V1.md` §4
- [ ] **GEO-02**: New parcels get real, varied soil type/pH/fertility instead of the current constant-optimal stub (`getRandomSoilType()`/`getRandomPH()`/`getRandomFertility()`, `main.mo:2345-2357`)
- [ ] **GEO-03**: The existing regional county-bonus system (`game_logic.mo:124-130`) is actually reachable (currently unreachable — `county` is hardcoded `"TBD"` on the standard purchase path, `main.mo:2388`)

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

- [ ] **QUAL-01**: `npm test` runs the Vitest suite (script currently missing despite Vitest being configured); also fix `useAuth.test.tsx`'s missing `QueryClientProvider` wrapper (5/6 tests currently fail)
- [ ] **QUAL-02**: ESLint/Prettier config exists and matches the already-present `lint` script and devDependencies
- [ ] **QUAL-03**: Playwright is either wired into a real e2e test or removed from dependencies (currently installed but unused)

## v2 Requirements

Deferred to future release per GDD v3's "Future / Not Now" section. Tracked but not in current roadmap.

### UX/UI Deep Overhaul (UX) — placeholder, needs its own Discuss/scoping phase before real requirements can be written

- **UX-01**: TBD — current layout doesn't match the Neo-Steampunk Cherry lore aesthetic (`docs/game-design/lore/game-lore.md`) nor `Mark_Vinicius_V1.md` §13's UI priorities (3-click onboarding, mobile-first 60fps, visible feedback, progress visibility, social proof)

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
| FESTIVAL-01 | Phase 6 | Pending |
| FESTIVAL-02 | Phase 6 | Pending |
| FESTIVAL-03 | Phase 6 | Pending |
| INSURANCE-01 | Phase 7 | Pending |
| INSURANCE-02 | Phase 7 | Pending |
| ONBOARD-01 | Phase 8 | Pending |
| ONBOARD-02 | Phase 8 | Pending |
| UX-01 | Phase 9 | Needs scoping |
| QUAL-01 | Phase 10 | Pending |
| QUAL-02 | Phase 10 | Pending |
| QUAL-03 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 30 total (4 complete, 26 pending)
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-29*
*Last updated: 2026-07-29 after GDD v3 reconciliation with `Mark_Vinicius_V1.md`*
