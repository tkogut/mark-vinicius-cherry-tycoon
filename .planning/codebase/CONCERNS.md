# Codebase Concerns Map — Mark Vinicius Cherry Tycoon

**Analysis date**: 2026-07-29
**Scope**: Game codebase (`backend/`, `frontend/src/`). Excludes the Antigravity/AGENTS-OS tooling-layer migration itself.

---

## 1. Tech Debt

| Item | Location | Impact | Fix Approach |
|---|---|---|---|
| Unimplemented randomization stubs | `backend/main.mo:2344-2354` (mirrored `backend/main_mainnet.mo:2158-2168`) | Soil type, pH, and fertility are **not actually randomized** per `// TODO: Add actual randomization` comments — every new parcel likely gets identical/deterministic starting conditions, undermining the "geography matters" design pillar. | Implement a seeded PRNG (the codebase already has an LCG pattern used in `competitor_logic.mo`/AI turns) to vary these fields at parcel creation. |
| `county = "TBD"` placeholder | `backend/main.mo:2388`, `backend/main_mainnet.mo:2202` | New parcels/regions get a literal `"TBD"` county string — leaks a dev placeholder into player-facing or analytics data. | Wire actual county selection logic (per `docs/game-design/gameplay/parcel-geography.md`) before next parcel-related feature ships. |
| Season multiplier hardcoded to 1.0 | `backend/main.mo:2815`, `backend/main_mainnet.mo:2629` | `// TODO: Vary by season` — a documented economic lever (seasonal price/yield variation) is inert, so any GDD claims about seasonal price swings tied to this code path are currently false in-game. | Requires product decision on the intended curve before implementation; low urgency but should be tracked against `docs/game-design/economy/price-formulas.md`. |
| Fertilizer quality parameter unused | `backend/main.mo:858`, `backend/main_mainnet.mo:739` | `_fertilizerType` argument accepted but ignored (`// TODO: Future enhancement`) — the underscore prefix confirms it's dead input; players may believe fertilizer quality choice matters when it doesn't. | Either implement the multiplier or update UI copy/tooltips to stop implying it has an effect. |
| Leaderboard scalability guard leaves stale cache | `backend/main.mo:2831-2842` | `TODO SEC-021: Replace with pagination or WASM-level streaming for production scale.` Once `playerFarms.size() > 500`, `_refreshLeaderboardCache()` silently returns and `topPlayersCache` **freezes** at its last snapshot — new players/AI changes stop appearing on the leaderboard with no player-facing warning. | Known limitation (see Security section below) — implement pagination or incremental cache updates instead of full O(N) rebuild before player count approaches 500. |
| `App.tsx` incomplete wiring | `frontend/src/App.tsx:247` | `// TODO: Get parcel ID and price from UI/modal` — indicates a purchase/procurement flow that currently has a gap between the UI trigger and the actual call parameters. | Needs direct code inspection to confirm current behavior (may silently pass wrong/default values); recommend as a near-term fix-first item. |
| Very large monolithic files | `backend/main.mo` (3,334 lines), `backend/main_mainnet.mo` (3,039 lines), `frontend/src/lib/gddTemplate.ts` (2,012 lines), `frontend/src/components/farm/ImperialOrchard.tsx` (1,366 lines) | These are the top complexity hotspots in each tree. `main.mo`/`main_mainnet.mo` mix actor plumbing, business logic, and API surface in one file each — hard to review, hard to keep in sync (see Track A/B risk below). `ImperialOrchard.tsx` at 1,366 lines is by far the largest frontend component, a likely maintenance and re-render-performance hotspot. | Backend: continue extracting logic into `*_logic.mo` modules (already underway — `auction_logic.mo`, `game_logic.mo`, etc. exist) and shrink `main.mo`/`main_mainnet.mo` to thin API-dispatch layers. Frontend: split `ImperialOrchard.tsx` into subcomponents; consider whether `gddTemplate.ts` (a data/template file, not logic) belongs in `src/lib` at all or should be a static asset. |
| Legacy `.agent/` doc references still embedded in security backlog | `docs/security/security-backlog.md:4` references `file:///.../.agent/rules/04_security_backlog_archive.md` | Broken/stale cross-reference from the pre-GSD-Core tooling layer; the linked path likely no longer exists post-migration. | Update the citation to point at `docs/archive/backlogs/security-backlog-archive.md` (the actual archived file found in this repo). |

---

## 2. Known Bugs (from TODO/FIXME and backlog docs)

- No explicit `FIXME`/`HACK`/`XXX` markers found in `backend/` or `frontend/src/` — only `TODO` markers (listed above), which are debt/incompleteness rather than acknowledged bugs.
- **Prior-known, appear resolved**: `docs/archive/backlogs/backend-backlog.md` documents **BUG-06 "Ghost Marketplace"** under Phase 8.0, marked `✅ FULLY RESOLVED`. Not re-verified in this pass (archival doc only) — treat as resolved unless a regression is reported.
- **Prior-known, appear resolved**: SEC-019 (`isAnonymous` guard checks commented out in `main_mainnet.mo` — 23 guards) and SEC-020 (duplicate legacy `buySupplies` function) are both marked fixed in `docs/archive/backlogs/backend-backlog.md`. Worth a spot-check given the history of guard checks being disabled once before.

---

## 3. Security Considerations

Source: `docs/security/security-backlog.md` (live) and `docs/archive/backlogs/security-backlog-archive.md` (archived, not re-read in full — cited as prior history only).

**Status summary as of the live backlog's last update (2026-03-10/11)**:
- Phase 8.0 (Competitive Pool / `auction_logic.mo`) findings SEC-024 through SEC-033 are **all marked FIXED or VERIFIED** — includes critical items like infinite reward/penalty injection (SEC-028), global state wipeout in `advancePhase` (SEC-029), and an instruction-limit trap in the resolution engine (SEC-030/SEC-032).
- **Open items (not new findings — carried in the live backlog since 2026-02-17)**:
  - **SEC-010**: `assignParcelToPlayer` missing a self-assignment check. Still unchecked as of this analysis.
  - **SEC-012**: Player `owner` Principal exposed in public query responses — a minor privacy/deanonymization concern for an on-chain game (Principals are semi-pseudonymous but still consistently correlatable across queries).
  - **SEC-014**: `sellCherries` takes a raw `Text` for `saleType` instead of the `SaleType` variant — type-safety gap, allows malformed/unvalidated input to reach business logic.
  - **Dependency Audit**: `npm audit` explicitly noted as never having been run ("Waiting for `npm audit` in WSL").
  - **Frontend Security Sweep**: XSS audit on user-rendered data explicitly marked not done.
  - **Phase 6.1 Leaderboard Assembly DoS Risk**: logged at Low severity — this is the same `LEADERBOARD_MAX_PLAYERS = 500` guard covered under Tech Debt/Performance; the backlog already flags it, current code mitigates via "stale cache" behavior rather than a real fix.
- **Deferred, unaudited**: Phase 10.0 Sports Patron logic (`patron_logic.mo` — not yet created) is explicitly called out as needing a TPI-manipulation and async-round-sync review once built. Not a current risk since the module doesn't exist yet, but flag for when Phase 10.0 resumes.

**Recommendation**: Run `npm audit` and a dedicated frontend XSS pass before the next security review cycle — both are explicitly acknowledged gaps, not just my inference.

---

## 4. Performance Bottlenecks

- **Frontend bundle size**: A recent `npm run build` produced a main JS chunk of **1.24 MB (382 KB gzipped)**, over Vite's own >500 kB warning threshold. `frontend/package.json` shows no manual chunking/code-splitting configuration (`vite.config` not inspected in depth here, but no `build.rollupOptions.output.manualChunks` referenced in `package.json` scripts). Given the component count (65 files under `frontend/src/components/`) and heavy dependencies (`framer-motion`, `howler`, `jimp`, full i18next stack with 10 locale files), this is a straightforward candidate for route-based or feature-based code-splitting (e.g., lazy-load `AuctionDashboard`/`SportsCenter`/season components that aren't needed on first paint).
- **Leaderboard rebuild is O(N) full-scan, not incremental**: `_refreshLeaderboardCache()` in `backend/main.mo:2836-2893` iterates **all** `playerFarms` and **all** `aiCompetitors` on every refresh, then does a full `Array.sort`. It's guarded by a hard cutoff (`LEADERBOARD_MAX_PLAYERS = 500`, `backend/main.mo:2835`) that causes the cache to go stale rather than trap on the ICP instruction limit — a deliberate but explicitly-acknowledged stopgap (`TODO SEC-021`, same location). This is both a performance bottleneck and a scaling limit (see below) documented in the security backlog itself as "Phase 6.1: Leaderboard Assembly DoS Risk (Low)".
- **No other obvious N+1 or unbounded loops spotted** in the modules reviewed (`auction_logic.mo`, `game_logic.mo`, `competitor_logic.mo`) — the security backlog notes SEC-030/SEC-032 (resolution-engine instruction-limit traps) were already found and fixed with season-scoped filtering, suggesting the team has already hunted for this class of bug once in the auction path.

---

## 5. Fragile Areas

### Atomic Auth invariant — partially violated in code today
`ROADMAP.md:42-44` states the invariant: **"`isAuthenticated` must be set only after `backendActor` is ready — do not reorder this in auth flow changes."**

Reviewing `frontend/src/context/AuthContext.tsx`:
- The main init effect (lines 29-82) and `login()` (lines 84-117) **do** correctly order `setBackendActor(actor)` before `setIsAuthenticated(true)`.
- **However, `initTestMode()` (lines 135-175) violates the invariant directly**: `setIsAuthenticated(true)` is called at line 150, *before* `createBackendActor()` is even invoked (line 162) and well before `setBackendActor(actor)` (line 167). The comment at line 149 even says "Set authenticated immediately to provide UI feedback" — an intentional but invariant-breaking shortcut. If `createBackendActor` throws, the `catch` block does revert `isAuthenticated` to `false` (line 172), but there's a window where `isAuthenticated === true` and `backendActor === null`, which is exactly the state the invariant exists to prevent. Any consumer component that gates on `isAuthenticated` alone (rather than also checking `backendActor !== null`) could crash or make calls against a null actor during this window.
- **Fix approach**: Move `setIsAuthenticated(true)` in `initTestMode()` to after the actor is confirmed created (mirroring the pattern in `login()`), or explicitly gate all actor-consuming call sites on `backendActor !== null` in addition to `isAuthenticated`.
- Secondary fragility: the effect's final log line at `frontend/src/context/AuthContext.tsx:76` reads `backendActor` from stale closure state (it was just set via `setBackendActor` a few lines up but React state updates aren't synchronous) — cosmetic (log-only) but indicates a general pattern of not fully reasoning about React state timing in this file.

### Track A/B (`main.mo` / `main_mainnet.mo`) parity risk
- `ROADMAP.md:5` and `docs/game-design/backend/dual-entrypoint-sync-rules.md` both mandate strict 1:1 parity between `backend/main.mo` (Playground/local, dfx 0.24.3) and `backend/main_mainnet.mo` (Mainnet/EOP), with the explicit rule "never share actor declarations or persistence keywords between the two."
- **Observed drift**: the two files differ by **295 lines** (3,334 vs 3,039) and a raw `diff` between them produces essentially a full-file replacement (6,375 diff lines) rather than a small localized patch — meaning textual/structural divergence is high enough that line-by-line comparison tooling can't easily isolate the real differences. This is expected to some degree (Playground vs Mainnet-specific persistence keywords), but the size of the gap combined with process reliance on **manual mirroring by whichever agent/dev makes a change** (per `docs/archive/backlogs/backend-backlog.md:174-176`: "Read `main.mo` AND `main_mainnet.mo`... New public functions must be exposed in both") is inherently fragile — there is no automated parity check (e.g., a script diffing public function signatures) in the repo.
- **Fix approach**: Add a CI/pre-commit check that extracts and diffs the public function signature list from both files (even a simple grep-based extraction of `public shared`/`public query func` lines with names/arg types) to catch signature drift automatically, rather than relying on agent/developer discipline alone.
- Every TODO found in `main.mo` has an identical counterpart in `main_mainnet.mo` at a nearby-but-not-identical line number, confirming the debt items above are duplicated (and must be fixed twice) rather than shared via a common module — reinforcing the case for continuing the extraction into `*_logic.mo` shared modules already in progress.

---

## 6. Scaling Limits

- **`topPlayersCache` / `playerFarms` HashMap growth**: `backend/main.mo:158` (`playerFarms = HashMap.HashMap<Principal, PlayerFarm>(...)`) has no eviction or archival strategy — it is a stable-storage-backed, ever-growing collection of full `PlayerFarm` records (parcels, inventory, statistics, etc.) with no observed cap. Combined with the **hard 500-player leaderboard guard** (`LEADERBOARD_MAX_PLAYERS`, `backend/main.mo:2835`), the game has a known ceiling: past 500 total player farms, the global leaderboard stops updating (goes stale) even though `playerFarms` itself keeps growing unbounded. This is the single clearest scaling limit in the backend and is already self-documented via `TODO SEC-021`.
- **`regionalMarketSaturation`, `aiCompetitors` HashMaps** (`backend/main.mo:145,150`): both bounded by game design (fixed set of regions/AI archetypes), low risk.
- **Canister storage growth generally**: no archival/pruning strategy observed for historical player data (e.g., season reports) beyond what's noted for `stableAuctionContracts` ("historical pruning" per SEC-029 fix in the security backlog) — worth confirming whether `PlayerFarm.statistics`/season history arrays inside each farm record grow unbounded per season, which would compound the `playerFarms` growth problem per-player as well as across players. Not fully verified in this pass — recommend a follow-up read of `types.mo`'s `PlayerFarm`/`Statistics`/`SeasonReport` definitions to confirm whether per-player history is capped.

---

## 7. Dependencies at Risk

From `frontend/package.json`:
- **React 18.2.0** pinned while ecosystem has moved to React 19 — not urgent, but worth tracking since several `@radix-ui/*` and testing-library packages are on latest majors that assume React 18/19 compatibility ranges.
- **Vitest 4.0.18** paired with **Vite 5.0.12** — Vitest 4 nominally targets Vite 5+/6+; worth confirming this specific pairing is officially supported to avoid subtle test-runner bugs (not confirmed broken, just a version-skew flag).
- **`jimp` (^1.6.0)** — a full image-processing library as a runtime frontend dependency is unusual for a Vite/React SPA; if it's only used for a build-time or one-off asset task, it should move to `devDependencies` to shrink the shipped bundle (ties into the bundle-size concern above).
- **`@dfinity/*` packages pinned to ^3.4.3** across `agent`, `auth-client`, `identity`, `principal` — consistent versions is good; just confirm these track current IC SDK guidance since ICP tooling moves quickly and mismatched dfinity package versions across a project is a common source of actor/candid runtime errors.
- **ESLint 8.56.0 / `@typescript-eslint` 6.19.0** — both are now behind ESLint 9's flat-config generation; not broken, but will require a config migration whenever the team decides to upgrade lint tooling.
- No unusually abandoned or deprecated packages spotted otherwise; the dependency set is generally current for a 2026 project.

---

## 8. Missing Critical Features

Both are explicitly called out in `ROADMAP.md:17-21` as backend-complete, frontend-missing, and are the named "Next Up" queue items (`ROADMAP.md:37-40`):

1. **Phase 7.0 — Weather & Event UI integration**. Backend event/weather system (`backend/event_logic.mo`, weather logic in `game_logic.mo`/`main.mo`) is implemented and security-reviewed ("Phase 9.1: Weather/Water Correlation & Yield Transparency" cleared per `docs/security/security-backlog.md:56`), but the roadmap still lists the frontend surface as not built. Note: `frontend/src/components/season/WeatherEventModal.tsx`, `WeatherOverlay.tsx`, `WeatherEffects.tsx`, `SeasonalEffects.tsx` all exist and the archived `docs/archive/backlogs/frontend-backlog.md:14-25` marks a "Phase 5.1: Weather + Season Sub-Phases UI" as done — **this suggests the roadmap's "not yet built" framing may be stale, or refers to a distinct, more complete integration than what already exists.** Needs a direct comparison between current `ROADMAP.md` scope and the archived frontend backlog before treating this as a from-scratch build; likely a "finish/polish" task rather than greenfield.
2. **Phase 6.1 — Enhanced Leaderboard & Rankings UI**. Backend `topPlayersCache`/`getGlobalLeaderboard`/`getPlayerRank` are implemented (`backend/main.mo:2831-2905`). Similarly, `frontend/src/components/social/RankingsPanel.tsx` (237 lines) already exists and the archived frontend backlog (`docs/archive/backlogs/frontend-backlog.md:44-49`) marks "Phase 5.4: Rankings + Reports" as done. **Same caveat as above** — the roadmap's framing of this as still-missing should be reconciled against the existing `RankingsPanel.tsx` component before scoping it as a new GSD phase; it may be an enhancement/rework of an existing screen rather than net-new UI.

Both items are flagged in `ROADMAP.md` as the explicit pilot candidates for the new GSD Core Discuss→Plan→Execute→Verify→Ship workflow — recommend the first planning step for either include a "does this already partially exist" audit given the discrepancy noted above.

---

## 9. Test Coverage Gaps

- **Test files found**: only 2 — `frontend/src/__tests__/backend_integration.test.ts` and `frontend/src/__tests__/useAuth.test.tsx`.
- **Component count**: 65 `.tsx` files under `frontend/src/components/` (spanning `farm/`, `pools/`, `season/`, `social/`, `sports/`, `market/`, `layout/`, `ui/`, `effects/`) — **zero dedicated component tests** exist for any of them. Coverage is effectively limited to one auth-flow test and one backend-integration test.
- **Highest-risk untested surfaces**, given size/complexity and this document's other findings:
  - `frontend/src/components/farm/ImperialOrchard.tsx` (1,366 lines) — largest component, no tests.
  - `frontend/src/context/AuthContext.tsx` (182 lines) — has `useAuth.test.tsx` covering it, but given the `initTestMode` Atomic-Auth violation found above, it's worth confirming whether that specific function/code path is actually exercised by the existing test (a quick look suggests the test is likely scoped to the standard login/init flow, not the test-mode bypass — recommend adding a regression test for the invariant specifically).
  - `frontend/src/hooks/useFarm.ts` (578 lines) and `frontend/src/hooks/useGuestFarm.ts` (372 lines) — core data-fetching/state hooks with no visible test coverage, high blast radius if broken.
  - `frontend/src/components/farm/modals/*` (Sell, Financial Report, Planting, Onboarding, Shop, Farm Stats — 6 modal components, ~1,600 combined lines) — all untested; these are direct paths to backend mutation calls (money/inventory changes), making them a natural priority for integration tests given `backend_integration.test.ts` already establishes a pattern to extend.
- No backend (Motoko) unit test framework/files were located in this pass (`backend/` was only checked via `grep`/`wc`, not exhaustively listed) — recommend a follow-up check for a `backend/test/` or PocketIC-based test suite; the backlog docs reference "E2E tests" and "`dfx canister call`" verification passes but these read as manual verification runs, not an automated test suite committed to the repo.
- **Confirmed 2026-07-29 while wiring up `.github/workflows/test-backend-logic.yml`**: the `execution/tests/*.sh` suite has drifted from the current `backend/main.mo` API and is not just "manual, uncommitted-to-CI" as noted above — it's actively broken:
  - `test_rankings.sh:40` calls `dfx canister call backend getLeaderboard` — that method no longer exists; current method is `getGlobalLeaderboard`.
  - `e2e_backend.sh` calls `dfx canister call backend advanceSeason` — that method no longer exists either; season progression is no longer a manually-invoked update call on `main.mo` (reworked into the activity-based turn system per git history).
  - 11 of the 21 scripts in `execution/tests/` have CRLF line endings (Windows-edited), which breaks them outright under `bash` on Linux (`$'\r': command not found`, `ambiguous redirect`) before the API call is even reached — fixed only on `e2e_backend.sh` so far (the one script referenced by the new CI workflow), the other 10 are still CRLF and will fail identically if run as-is.
  - Practical implication: none of the 21 scripts should be assumed passing without re-verifying against the current API first. `test-backend-logic.yml` intentionally does NOT call into this suite — it runs a small, hand-verified inline smoke path (`debugResetPlayer` → `initializePlayer` → `getPlayerFarm` → `getGlobalLeaderboard` → `getGlobalSeason`) instead. Re-auditing and fixing the 21 scripts one at a time is real, separate backlog work — candidate for a dedicated phase, not a quick fix.
- **Confirmed during Phase 1 (2026-07-29)**: `useAuth.test.tsx` currently fails 5/6 tests (`No QueryClient set, use QueryClientProvider to set one`) — the test wraps only `<AuthProvider>`, but `AuthContext.tsx:27` calls `useQueryClient()` internally, so it needs a `<QueryClientProvider>` ancestor. Confirmed pre-existing (fails identically on the commit before Phase 1's changes, via `git stash`) — not a regression, but the existing auth test suite is currently broken, not just thin. Tracked under `QUAL-01` (Phase 3) rather than fixed inline, since it's a test-infra fix outside Phase 1's scope.

---

## Summary Priority Call-outs

1. **High priority**: `initTestMode()` Atomic Auth violation (`frontend/src/context/AuthContext.tsx:150`) — directly contradicts a documented invariant; dev/local-only blast radius but sets a bad precedent for future auth changes.
2. **High priority**: Frontend bundle size (1.24MB/382KB gzip) — user-facing load-time impact, straightforward code-splitting fix available.
3. **Medium priority**: SEC-010/SEC-012/SEC-014 open backlog items, `npm audit` never run, frontend XSS sweep never done — all explicitly acknowledged, none newly discovered here.
4. **Medium priority**: Reconcile `ROADMAP.md`'s "frontend missing" framing for Phase 7.0 and Phase 6.1 against already-existing components (`WeatherEventModal.tsx`, `RankingsPanel.tsx`) before scoping new GSD phases — risk of duplicate work if the gap is smaller than the roadmap implies.
5. **Medium priority**: Track A/B parity has no automated check — currently pure process/discipline dependent, with a large file divergent enough that manual diffing is impractical.
6. **Low priority (self-documented)**: Leaderboard scaling ceiling at 500 players (`SEC-021`) — already flagged in code and security backlog; needs a real fix (pagination) before player count risk becomes live.
7. **Low priority**: Test coverage is thin (2 test files vs. 65 components) — not a regression risk today but a growing liability as more UI phases ship.
