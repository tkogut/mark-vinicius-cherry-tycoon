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
- [x] **AUTH-02**: Atomic Auth invariant on the **restored-session** init path. Fixed 2026-08-07. `AuthContext.tsx` called `setIsAuthenticated(true)` unconditionally when `client.isAuthenticated()` was already true, so a falsy `createBackendActor()` would leave `isAuthenticated === true` with `backendActor === null`. Every other branch (`login()`, `initTestMode()`, the auto-login bypass) already guarded with `if (actor)`; this was the last one without it. Now guarded identically.
  - **Honest severity**: latent, not a live crash. `createBackendActor` currently either returns an actor or throws — it never returns null — and a throw is caught by the outer `.catch()`, which leaves the flag false. It matters because every sibling branch already anticipates a falsy actor, so a refactor making the function return null on failure (a natural change) would have broken only the unguarded branch. Defence in depth, plus consistency.
  - The `it.fails()` placeholder is gone. `src/__tests__/useAuth.test.tsx` now asserts the invariant **symmetrically across all three entry paths** (restored session, auto-login, `login()`) plus a matrix test over `{network} × {alreadyAuthenticated}` that states the invariant directly — so a future refactor cannot reopen the hole in one branch while the others stay guarded, which is exactly how AUTH-02 survived AUTH-01.
  - **Verified by reverting**: with the guard removed, 2 of the new tests fail and name the offending combination (`network=ic, alreadyAuthenticated=true`); with it restored, 14/14 pass.

### Football Clubs (SPORTS) — promoted from v2 to v1, core pillar per GDD v3

- [x] **SPORTS-01**: `getAvailableFootballClubs()` returns real club data. Done 2026-08-07. Eight clubs in the lower Opolskie pyramid (4 Klasa Okręgowa, 4 Klasa A) authored in a new pure module `backend/sports_logic.mo`. **The catalogue is code, not a `stable var`** — a club's identity is static game data like `getInfrastructureCost`'s price table, and keeping it in code lets the endpoint stay a `query` (a query cannot mutate, so it could never lazily seed stable state) and lets an upgrade retune clubs without a migration. Only ownership is persisted, in `stableClubOwnership : [(clubId, ownerId, percent)]` — additive, so existing farms upgrade with every club unclaimed, which is correct. Valuations set against the orchard economy: Klasa A 120–180k (1% = 1.2–1.8k), Klasa Okręgowa 240–420k (1% = 2.4–4.2k), against a 50k starting balance, so a token stake is an early-game decision and control is a mid-game one.
- [x] **SPORTS-02**: `buyClubShares()` performs a real purchase. Done 2026-08-07. Deducts cash, records `ownershipPercent`, appends to `PlayerFarm.ownedClubs` (deduplicated), and books the cost into the seasonal report. Validation lives in `SportsLogic.validatePurchase` as a typed rejection variant so `main.mo` reads as a sequence of decisions: unknown club, stake outside 1–100, club already claimed by another patron, more requested than unclaimed, cannot afford. **Ownership is single-patron** — `Types.FootballClub` carries one `ownerId`/`ownershipPercent` and the GDD frames the player as *the* benefactor of a village club, so a club is unclaimed or belongs to exactly one patron holding 1–100%. There is no player-to-player share market. Not phase-gated: the GDD ties transfers to the winter break, but that belongs with the league cycle (SPORTS-06) — a phase restriction with no league behind it would be arbitrary.
- [x] **SPORTS-03**: `SportsCenter.tsx` displays real clubs and supports a real purchase flow. Done 2026-08-07. **"Already fully built" was false** — the component mapped `c.price` and `c.sharesAvailable`, neither of which exists on `Types.FootballClub` (the real fields are `marketValue` and `ownershipPercent`), so both rendered as `0`; and it printed `c.region` as a string when it is a `Region` record. Same defect class as ECON-06's `baseCapacity`: a screen wired to a contract the backend never had. Now reads the real Candid type, shows club value / table position / stadium / claimed %, formats the region as `commune, pow. county`, surfaces the canister's own rejection reason in the toast instead of a generic failure, distinguishes "another patron backs this club" from "fully owned", and states plainly that a stake does not yet change orchard performance. Guest mode gets an explicit "sign in" state rather than an empty grid that would read as "there are no clubs".
- [ ] **SPORTS-04**: `Types.League` spells the two tiers `#Liga3`/`#Liga4`, which in the real Polish pyramid means III/IV liga — four tiers above the Klasa Okręgowa / Klasa A that `gdd-sports-patron.md` actually specifies, and the roadmap's legacy row calls it "IV Liga Opolska", so the name is wrong in three places. Renaming the variant is a Candid contract change, hence flagged rather than folded into SPORTS-01/02/03. Mitigated meanwhile: `LEAGUE_LABELS` in `gameLogic.ts` displays the correct Polish names, pinned by a parity test, so the player is never shown the wrong league.
- [ ] **SPORTS-05**: Patron tiers and their orchard impact — Kit Sponsor (−2% labour cost), Mecenas (+5% negotiation power), Właściciel (Patron Contracts), per `gdd-sports-patron.md` §3. This is what turns a club from an asset you own into the second *pillar*: today owning one costs cash and changes nothing on the farm, which the UI says out loud. Deliberately out of the agreed slice because it touches `calculateVariableCosts` and sale pricing, i.e. economy formulas — needs the `gameLogic.ts` mirror plus parity cases, and the tier thresholds are balance numbers (Ask First).
- [ ] **SPORTS-06**: League simulation — Team Power Index match outcomes, the Autumn/Spring cycle synced to the 10 phases (autumn round in `#Market`/`#Storage`, transfer window in `#Planning`, finale in `#Harvest`), promotion/relegation, Local Reputation folded into `PrestigeScore` at ×1.5, and the event archetypes. `leaguePosition` is currently authored and static — it is displayed as the table position, which is true, but nothing advances it. A dedicated phase, not a slice.

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
- [x] **QUAL-03**: Playwright wired into real E2E tests. Done 2026-08-06 (Phase 10, Etap 4). `playwright.config.ts` + **38 specs** across `e2e/orchard.spec.ts` and `e2e/marketplace.spec.ts`, run by `npm run test:e2e` and by the new `test-e2e.yml` workflow (PR + nightly at an off-the-hour minute; chromium only, since the assertions are on canvas pixel data and computed z-index and are engine-independent).
  - **Scope decision: the specs drive the dev harnesses, not the full app.** The harnesses mount the real components with mocked props and no auth/canister, so runs are deterministic. Driving the full app was tried repeatedly by hand during the UX work and was flaky for reasons unrelated to the code under test — a random "Severe Drought" weather modal intercepts clicks, and test-player init against Playground intermittently fails. Those are real gameplay behaviours, so full-journey coverage is split out as QUAL-10 rather than made everyone's flake.
  - Locks in fixes that previously had **no automated cover at all**: the QUAL-07 phase gate (purchases disabled in `Maintenance` and 6 other phases, enabled in `Investment`) proven in a browser; seasonal sprite swap incl. a `naturalWidth > 0` check so a 404 cannot pass as "src is right"; the l1→l2 art-tier switch; deterministic tree placement across reloads; winter drawing a full canopy (asserted on actual canvas pixels in the upper half, per the sketch-001 rev-7 decision); worker movement over time; and the bridge topology — asserted as **exactly 4** bridges for 4 sectors, which discriminates between the old consecutive-index implementation (3) and a naive fully-connected one (6).
  - `tsconfig.json` `include` widened to `src`, `e2e`, `playwright.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, so `npm run typecheck` / `npm run build` now type-check the whole test infrastructure instead of only `src` — previously a type error in a spec would have gone unnoticed, since Playwright transpiles without checking. Verified `tsc --noEmit` still exits 0.
  - Run artifacts (`test-results/`, `playwright-report/`, `blob-report/`) added to `.gitignore`.
- [ ] **QUAL-10**: Full-journey E2E against an ephemeral local replica (init player → plant → advance phases → harvest → sell), the layer the harness specs deliberately exclude. Needs a deterministic way to neutralise the random weather-event modal and a reliable player reset (`debugResetPlayer` exists). Should reuse the ephemeral-replica pattern from `test-backend-logic.yml` rather than pointing at Playground.
- [ ] **QUAL-04**: Pay down the lint debt captured by the `--max-warnings` ratchet. Baseline **183 warnings** as of 2026-08-07 — lowered from the original 185 by removing three avoidable `any`s from the auth tests while fixing AUTH-02 (93 `no-explicit-any`, 71 `no-unused-vars`, 10 `react-refresh/only-export-components`, 9 `react-hooks/exhaustive-deps`). Errors are already 0 and must stay 0. The ceiling in `package.json` may only ever be **lowered** — never raise it to make lint pass. The 9 `exhaustive-deps` warnings are the highest-risk subset (stale-closure bugs in the interval/animation-driven orchard components) and should be triaged first.
- [x] **QUAL-05**: Enforce TS↔Motoko economic-formula parity automatically. Done 2026-08-06 (Phase 10, Etap 1). Added `src/__tests__/economyParity.test.ts` (line-by-line transcription of `calculateYieldPotential` + 47-case vector), `gameLogic.test.ts` (weather/labour mirrors) and `phaseGateParity.test.ts`. The suite **found three real divergences, all now closed**:
  1. **County bonus missing in the frontend.** `game_logic.mo` multiplies yield by a county modifier (Głubczyce 1.10 / Opole 1.08 / Namysłów 1.05, Phase 5.1 "Opole DNA"); `gameLogic.ts` had no county term at all.
  2. **Golden Harvester ignored by the frontend.** The backend applies it *multiplicatively* (1.05^level); the TS mirror's switch had no `GoldenHarvester` case, so the game's flagship upgrade contributed nothing to the displayed estimate.
  3. **Multiplication order.** Motoko computes `(tons × size) × 1000`; the mirror did `(tons × 1000) × size`. f64 multiplication is not associative, and the backend truncates via `Float.toInt`, so the two could land either side of an integer boundary.
  Combined player-visible impact, measured on a realistic loadout (Głubczyce, clay, organic, 2.5 ha, full kit incl. Golden Harvester L3): the UI **under-reported yield by 19%** — 43,537 kg shown vs 53,743 kg actually paid out.
- [ ] **QUAL-05b**: Close the parity loop against a *live* canister. `motokoReferenceYield()` in `economyParity.test.ts` is a hand-maintained transcription: it catches frontend drift immediately but cannot detect a change made on the Motoko side. A real oracle needs a `debugCalculateYield` query, because `GameLogic.calculateYieldPotential` is internal (only reachable via `main.mo`'s harvest path) — there is no method to generate a fixture from. Adding it is additive and has 7 existing `debug*` precedents, but it widens the canister's public interface, so it was deliberately left out of the test-infrastructure step.
- [ ] **ECON-PARITY-01**: `getInfrastructureModifier` in `backend/game_logic.mo` folds additive terms (`modifier += …` for Tractor/Shaker/Sprayer/ColdStorage) and one multiplicative term (`modifier *= 1.05^level` for GoldenHarvester) in a single pass over the infrastructure array. Mixing `+=` and `*=` makes the result **depend on the array order** — the same equipment yields a different multiplier depending on purchase order (e.g. GH-then-Tractor gives 1.1025+0.15 = 1.2525, Tractor-then-GH gives 1.15×1.1025 = 1.2679). Found 2026-08-06; **flagged, not fixed** — changing it alters real payouts, which is an economy-balance decision, not a test fix. The frontend mirror reproduces the quirk faithfully (and a test pins that order-sensitivity) so the UI and the payout agree while it stands.
- [x] **QUAL-07**: Phase-gate parity between the UI's `PHASE_ACTION_GATING` and the backend's `#SeasonalRestriction` guards. Done 2026-08-06 via `src/__tests__/phaseGateParity.test.ts`, which asserts the UI is **never more permissive** than `main.mo` (that direction produces an enabled button whose click fails) and enumerates the 12 places where it is deliberately stricter as UI guidance. **Found and fixed one real bug:** the UI enabled Marketplace purchases during the `Maintenance` phase, but `upgradeInfrastructure` (`main.mo:2118`) requires `#Investment` — so the PURCHASE button was live and the click failed with `#SeasonalRestriction`. Marketplace.tsx's own tooltip already read *"Purchases restricted to Investment phase"*, so the gating table contradicted both the canister and the UI's own copy. Also verified that `sellCherries` / `fertilizeParcel` / `buyParcel` have **no** backend phase guard, so the UI's permissiveness there is consistent.
- [x] **QUAL-06**: Candid drift guard. Done 2026-08-06 (Phase 10, Etap 2), in two halves that catch drift from either direction:
  - **Runtime contract test** (`src/__tests__/candidContract.test.ts`): reads the method list out of the generated `idlFactory` at runtime (not a hand-maintained list, which would be one more thing that can drift) and scans application source for every `backendActor.X(...)` call site, asserting each exists in the Candid interface. Also pins that `getLeaderboard` and `advanceSeason` — the two methods that rotted the shell suite — stay absent, and that six hot read paths remain `query` (promoting one to an update call would silently add consensus latency to every render using it).
  - **CI drift step** (in `test-backend-logic.yml`): runs `dfx generate backend` and fails on any diff in the committed `frontend/src/declarations/`.
  - **Both halves verified by deliberately injecting drift**, not just by passing: renaming `getGlobalSeason` in `main.mo` made the CI guard report a 3-file diff; renaming `getPlayerFarm` made the runtime test fail with a message naming the offending caller (`hooks/useFarm.ts`). Repo restored afterwards and re-verified clean.
- [x] **QUAL-08**: Triage the 23 `execution/tests/*.sh` scripts. Done 2026-08-06 (Phase 10, Etap 3). Measured rather than estimated — **the suite had two independent breakages**:
  - **12 of 23 scripts (52%) call methods the backend no longer declares**: `advanceSeason` (9 scripts), `getLeaderboard` (2), `debugSetHansStorage` (2). Far worse than the "at least two" previously recorded.
  - **10 of 23 had CRLF line endings**, so they died under `bash` on a Linux runner *before* their first `dfx canister call` — a failure completely hidden behind the dead-method problem. (An earlier scan of mine reported zero, because Python's text-mode reader silently translates `\r\n`; the JS scanner reads faithfully and caught my own mistake.) All 10 normalized — verified mechanically as line-endings-only (1271 insertions = 1271 deletions, content byte-identical after stripping `\r`), and `bash -n` now parses scripts that previously could not run at all.
  - **Decision: pin the damage rather than delete or mass-migrate.** `src/__tests__/legacyShellScripts.test.ts` snapshots the broken set and checks method names against the generated Candid interface. A script that gains a call to a dead method fails the test; fixing or deleting one requires shrinking the snapshot. Same ratchet idea as the lint ceiling. Deleting the 12 would have discarded 12 encoded scenarios (phase gates, weather, auctions, organic workflow) that are worth porting; "fixing" all 23 is a migration, not a test-infrastructure step.
  - `.gitattributes` added (`*.sh text eol=lf` and friends) so a Windows checkout cannot reintroduce the CRLF failure.
  - **11 scripts call only existing methods** and are the porting candidates. Note "healthy" means the method names resolve — *not* that the scripts pass; their assertions are untyped Candid string-matching and were never re-verified.
- [ ] **QUAL-09**: Port the 11 healthy legacy scripts to Vitest tests against an ephemeral dfx replica (the `backend_integration.test.ts` pattern: opt-in via `RUN_INTEGRATION`, typed actor, real assertions), then delete the originals and shrink `KNOWN_BROKEN`. PocketIC was evaluated for this and rejected for now — see `.planning/spikes/001-pocketic-for-backend-tests.md`.
- [x] **MAINT-01**: The `Maintenance` phase now has a real player action. Done 2026-08-07. **The premise was false**: `inspectAndRepair` was not "a working method the frontend forgot to call" — investigating before wiring it found the method was a broken lever:
  - It returned *"Degradation prevented."* while **no degradation existed anywhere in the backend** — `advancePhase` never touched infrastructure, nothing ever lowered a level, and the only reads of `maintenanceCost` were cost summations.
  - Its real effect was undocumented and sometimes harmful: it overwrote `maintenanceCost` with the arbitrary `level * 100`, and that field IS summed by `calculateFixedCosts` and charged every season (`_advanceSeasonInternal`, `(fixed + variable) / 4`). So a Shaker L1 went 1200 → 100 (a permanent 92% upkeep discount — effectively an exploit) while a Warehouse L3 went 250 → 300 (an increase), and per-type 1%/2% pricing was flattened.
  - **User chose to make the advertised behaviour real** rather than wire the broken lever or leave the phase dead.
  - Implemented: `GameLogic.degradeMaintenance` (upkeep drifts +10% of spec per season transition, min 1, clamped to 200% of spec), applied in `_advanceSeasonInternal` **after** the season's costs are charged; `inspectAndRepair` now resets upkeep to the canonical `getMaintenanceCost(infraType)` and reports the real before → after numbers instead of the old false claim. New `GameLogic.getRepairCost` shared with the frontend mirror.
  - Frontend: `inspectAndRepair` mutation in `useFarm` (plus a no-op guest mock), a `'repair'` action gated to `Maintenance` only, and the passive banner replaced by an actionable card showing current vs spec upkeep, accumulated wear, repair cost, and an honest verdict on whether repairing pays back.
  - **Verified on a live replica**, not just compiled: wear 240 → 264 → 288 → 312 (only on season transitions, never on plain phase advances), repair charged exactly 500 and reset 312 → 240, cash 33_677 → 33_177. The 200% cap was pinned in the parity suite instead, since reaching it on the replica needed ~10 more transitions and risked the `InsufficientFunds` guard.
  - Track B (`main_mainnet.mo`) received **only** the one-line `level * 100` → canonical value fix; the wear logic was deliberately not copied because that file does not compile (EOP-01), making any edit there unverifiable. Noted in-file for the EOP-01 reconciliation.
- [x] **MAINT-02**: Repair pricing rebalanced so servicing is never a strictly losing move. Done 2026-08-07. Surfaced by MAINT-01's numbers, then re-derived properly, which changed the verdict:
  - The flat `500 per level point` fee did not scale with what a repair is actually worth, and what it is worth is bounded by the spec value. A phase cycle is one year and contains 4 season transitions, so wear accrues at 40% of spec/year and hits the 200% cap after 2.5 years; `Maintenance` comes round once per year; `maintenanceCost` is annual. So the best achievable policy (service every year) is worth about **0.8x spec per year** versus never servicing — and no more, because wear restarts immediately after a repair.
  - **Correction to the figure first recorded here**: the initial note said only assets under 500/level upkeep could never pay back, leaving Tractor (600) on the viable side. Under the model above the break-even is 0.8x spec > 500, i.e. spec > 625, so **Tractor was negative too**. Six of the eight priced types were unrepairable: SocialFacilities 150, Sprayer 240, Warehouse 250, Pruner 360, ColdStorage 400, Tractor 600. Only Shaker (1200) and ProcessingFacility (1000) ever justified a service. Pinned as a test so the list is re-derived rather than trusted if the spec table changes.
  - **Fix**: `getRepairCost` now charges **half the accumulated wear**, summed over the assets that have any — `max(1, excess / 2)` per asset. This makes the trade scale-invariant: identical for a Sprayer and a Processing Plant, and always in the player's favour once anything has worn. Repair cost is now independent of `level`, which was never what a repair was worth.
  - Assets already at spec are skipped and cost nothing, so the old 500 "minimum inspection" charge for a no-op is gone — that fee for nothing was half of why the mechanic was dead. `inspectAndRepair` returns an explicit free no-op instead. Below-spec assets left behind by the pre-MAINT-01 `level * 100` bug are also skipped: the player is not charged to have a discount taken away, and `degradeMaintenance` is monotonic so those climb back through spec on their own.
  - **Verified on a live replica**: Sprayer bought at spec 240, three season transitions to `Maintenance` → 312; repair charged exactly 36 (= (312-240)/2), cash 33_677 → 33_641, upkeep reset to 240; an immediate second call returned the free no-op and left cash untouched.
  - Track B (`main_mainnet.mo`) deliberately keeps the flat fee, and **not** for the usual "unverifiable file" reason — mirroring would be actively wrong. The new formula prices accumulated wear, which only exists because Track A applies `degradeMaintenance`; Track B has no wear, so every asset always sits at spec and `inspectAndRepair` would become a permanent free no-op. Wear must land there first, as part of EOP-01.

- [ ] **GEO-07**: Two parcel-purchase methods coexist in the Candid interface — `buyParcel(text, nat)` (used by the frontend) and `purchaseParcel(Province, float64)` (never called; the geography-aware signature, and the one `lib/gddTemplate.ts` documents). Decide which is authoritative and retire the other, ideally alongside the Phase 5 geography rebuild.

### UX/UI Deep Overhaul (UX) — scoped 2026-07-29 via live Playground screenshot audit, see `docs/game-design/UX-AUDIT-2026-07-29.md`

- [x] **UX-01**: Shared sidebar header layout bug. Done 2026-08-07, after the Playground deploy showed it on all 8 screenshots — it really was on every screen. Two independent causes: (1) the logo area was `h-16`, a fixed 64px box holding a `text-lg` title that cannot fit one line in a 256px rail plus a subtitle, so it wrapped and overflowed onto the first nav item — and worse in `de`/`es`, where the title is longer; now `min-h-16` with `min-w-0` so it grows with its content. (2) The `v3.8` build badge was `fixed top-4 left-4 z-[9999]`, i.e. exactly on top of the logo, covering the second line of the wrapped title; moved to bottom-right, the one corner nothing else occupies. Both pinned by `uiConventions.test.ts`.
- [ ] **UX-02**: Redesign the orchard/farm dashboard view to match the "tactile diorama" lore promise (visual density, God Rays/Golden Hour lighting cues) — currently the sparsest, least-finished screen
- [ ] **UX-03**: Establish one consistent visual idiom for stat/diagnostic displays (currently mixes circular gauges, bar meters, and plain text blocks with no shared grammar)
- [ ] **UX-04**: Resolve the two never-resolving placeholder boxes in the dashboard sidebar
- [ ] **UX-05**: Reconcile the "Processing Plant" marketplace card against the `SIM-04` deferral decision (functional partial-implementation vs. decorative dead lever) — new finding from the audit, not yet resolved
- [~] **UX-06 (new)**: Implement sketch 001's winning direction (Variant A, "Geometric Brass" — isometric Canvas 2D procedural trees, Neo-Steampunk palette, seasonal cycle, path lanes, buildable border zone) in the real orchard component, replacing the CSS-blur canopy. **Mostly done 2026-07-30..2026-08-03**, ad hoc from live Playground screenshots rather than a phase plan (`9be8318`..`4c3a111`). Delivered: the CSS-blur canopy is gone, `drawGeometricBrassTree` renders each tree to one canvas with a seeded PRNG, parcels are diamond-tiled, seasons cycle, and NPCs/machines walk a path **lattice**. Two spec corrections found by implementing it: path lanes belong on tile *boundaries*, not through tile centres, and a same-row seam runs bottom-vertex→right-vertex (the wrong diagonal shipped twice before the user caught it on a live deploy). **Not done: the buildable border zone.** No building renders in the orchard at all — the building sprites went to the Marketplace instead (see UX-09). That residue keeps this requirement open.
- [x] **UX-07 (new)**: Port the existing `WorkerNPC` system (`ImperialOrchard.tsx:579`, `hasHelper`-gated second NPC) to the isometric grid — reuse the hire-state gating and seasonal hooks, re-anchor positions via `isoToScreen()`, walk along the new path network instead of the old sector grid. Done 2026-08-02/03. `hasHelper` gating preserved, both NPCs are canvas-rendered with animated contralateral limbs, and **both** worker variants from sketch 002 ship (Sturdy Facet + Dynamic Stride) — the user chose to keep both proposals rather than pick one. Three real bugs surfaced only from live play and are worth remembering: z-order needed a continuous projected `y` rather than `(row+col)` buckets (workers vanished inside canopies), the elliptical trunk-base ring hid them entirely, and the sketch canvas' ground margin had to be compensated (`WORKER_Y_OFFSET`) or they walked beside the path instead of on it.
- [~] **UX-08 (new)**: Add procedural machine visuals (tractor/shaker) — greenfield, same Canvas 2D technique as trees, visible only when the player owns the corresponding infrastructure level and during the phase it would plausibly operate. **Ownership half done, phase half not.** Four machines ship, not two — Modern Tractor, Precision Sprayer, Mechanical Shaker and a wheeled Branch Pruner, named to match the in-app Marketplace terminology at the user's instruction (`orchardMachines.ts`, `b32034f`/`b44b6ec`). Each is gated on `getInfraLevel(...) > 0` via `orchardAutomationConfig` (`App.tsx:171`) and moves along the path lattice with animated wheels, booms and clamps. **There is no `currentPhase` check on any machine**, so an owned Shaker drives around in Winter — the second half of this requirement is simply absent, not deferred by decision.
- [ ] **UX-09 (new, 2026-08-07)**: Place the raster building sprites in the orchard, closing UX-06's buildable border zone. Records a **deliberate reversal**: UX-06 committed to "zero image assets, everything procedural", and buildings now use real PNG sprites instead (`frontend/public/assets/buildings/`, 24 files — 4 seasons x Cold Storage L1/L2, Warehouse L1/L2, Processing Plant, Social Facilities, extracted from user-supplied AI art via `scipy.ndimage` connected-component labeling after hand-tuned bounding boxes cut the artwork). Taken after the user judged the procedural palette "przerażająco mdła" and rejected sketch 003's Canvas 2D attempts, and after I stated plainly that faceted Canvas 2D has a ceiling for building-scale art that more iterations would not lift. Shipped in the **Marketplace only** (`f61ad9e`) with level tiers; the orchard still shows no buildings. The reversal is settled — what is open is placement.
- [x] **UX-10 (new, 2026-08-07)**: Emoji were used as UI icons in 30 places across 7 components and render as **tofu boxes (▯) wherever no emoji font is installed**. Found on the Playground deploy, where the orchard readout read `▯ 50 trees`, `▯ Opole, Opole, Opolskie`, `▯ Fertility 70%`, plus `SEASON 1 ▯ Spring` and the silo's `▯ ▯` zoom buttons. Invisible locally — every dev machine has an emoji font; a bare headless Chromium and many Linux clients do not. All 30 replaced with `lucide-react` SVGs, which is already the app's icon system, so this also removed a second parallel icon vocabulary. Enforced by `uiConventions.test.ts` (verified by re-inserting an emoji).
- [x] **UX-11 (new, 2026-08-07)**: Money was rendered with a literal `$` in 13 places (`$50,000` in the HUD cash tile, Marketplace costs and upkeep, Financial Report revenue/costs/net P&L, Sell and Planting modals, price chart) while the backend, the game's setting and the neighbouring labels all use PLN — one Planting modal line managed `${...} PLN`, both at once. Fixed to `{value} PLN` throughout. Enforced by `uiConventions.test.ts`, which found 7 instances my own grep had missed.

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
| SPORTS-01 | Phase 2 | Complete |
| SPORTS-02 | Phase 2 | Complete |
| SPORTS-03 | Phase 2 | Complete |
| SPORTS-04 | Phase 2 | Pending (Candid rename) |
| SPORTS-05 | Backlog (economy) | Pending |
| SPORTS-06 | Own phase | Pending |
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
| UX-01 | Phase 9 | Complete |
| UX-02 | Phase 9 | Pending |
| UX-03 | Phase 9 | Pending |
| UX-04 | Phase 9 | Pending |
| UX-05 | Phase 9 | Pending |
| UX-06 | Phase 9 | Partial (border zone open) |
| UX-07 | Phase 9 | Complete |
| UX-08 | Phase 9 | Partial (phase gating open) |
| UX-09 | Phase 9 | Pending |
| UX-10 | Phase 9 | Complete |
| UX-11 | Phase 9 | Complete |
| QUAL-01 | Phase 10 | Complete |
| QUAL-02 | Phase 10 | Complete |
| QUAL-03 | Phase 10 | Complete |
| QUAL-04 | Phase 10 | Pending |
| QUAL-05 | Phase 10 | Complete |
| QUAL-05b | Phase 10 | Pending |
| QUAL-06 | Phase 10 | Complete |
| QUAL-07 | Phase 10 | Complete |
| QUAL-08 | Phase 10 | Complete |
| QUAL-09 | Phase 10 | Pending |
| QUAL-10 | Phase 10 | Pending |
| AUTH-02 | Phase 10 | Complete |
| MAINT-01 | Phase 10 | Complete |
| MAINT-02 | Phase 10 | Complete |
| GEO-07 | Phase 5 | Pending |
| ECON-PARITY-01 | Backlog (economy balance) | Pending |

**Coverage:**
- v1 requirements: 62 total (21 complete, 2 partial, 39 pending)
- Mapped to phases: 62
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-29*
*Last updated: 2026-07-29 after GDD v3 reconciliation with `Mark_Vinicius_V1.md`*
