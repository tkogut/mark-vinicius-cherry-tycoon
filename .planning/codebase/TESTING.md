# Testing — Mark Vinicius Cherry Tycoon

Analysis date: 2026-07-29
Scope: `frontend/` (Vitest + Testing Library, Playwright installed but unused) and backend
integration testing via shell scripts in `execution/tests/*.sh` driven against a live `dfx`
replica.

## 1. Test frameworks actually configured

From `frontend/package.json`:
- **Vitest** `^4.0.18` — the only wired-up unit/integration test runner. Config:
  `frontend/vitest.config.ts`:
  ```ts
  export default defineConfig({
      test: {
          globals: true,
          environment: 'jsdom',
          setupFiles: [],
          include: ['src/__tests__/**/*.test.ts', 'src/__tests__/**/*.test.tsx'],
          alias: { '@': path.resolve(__dirname, './src') },
      },
  });
  ```
  Note `setupFiles: []` — there is no global test setup (no jest-dom matcher registration file),
  even though `@testing-library/jest-dom` is a devDependency. If a test needs `toBeInTheDocument()`
  etc. it must import `@testing-library/jest-dom` itself, or a setup file should be added.
- **@testing-library/react** `^16.3.2`, **@testing-library/user-event** `^14.6.1`,
  **@testing-library/jest-dom** `^6.9.1` — used for hook/component rendering (`renderHook`,
  `waitFor`).
- **@playwright/test** `^1.60.0` and **playwright** `^1.60.0` are devDependencies, but **no
  Playwright config file exists** (no `playwright.config.ts`) and **no `*.spec.ts` e2e test files
  exist under `frontend/`**. There is also no `test`/`test:e2e` script in `package.json` — only
  `dev`, `build`, `lint`, `preview`. **Finding: Playwright is installed but not yet wired up or
  used; do not assume browser e2e tests exist or run in CI.**
- **No `npm test` / `npm run test` script exists at all.** Vitest must currently be invoked directly
  via `npx vitest run` (or `npx vitest` for watch mode) from `frontend/`. Planning agents proposing
  a CI test step should add a `"test": "vitest run"` script rather than assuming one exists.
- No coverage tooling configured (`@vitest/coverage-v8`/`c8`/`istanbul` absent from
  devDependencies, no `coverage` key in `vitest.config.ts`) — **there is no enforced coverage
  threshold.**

## 2. How to actually run the frontend tests today

```bash
cd frontend
npx vitest run                 # run all *.test.ts / *.test.tsx once
npx vitest                     # watch mode
npx vitest run src/__tests__/useAuth.test.tsx   # single file
```
(There is no `npm run test` shortcut — add one if standardizing CI.)

## 3. Test file organization and naming

- All frontend tests live flat in **one directory**: `frontend/src/__tests__/`. There is no
  co-location with source files (i.e. no `Component.test.tsx` next to `Component.tsx`) — everything
  funnels through the single `__tests__` folder per the `include` glob in `vitest.config.ts`.
- Naming: `<subject>.test.ts` for logic/integration tests, `<hookName>.test.tsx` for React hook
  tests that need JSX (a wrapper component). Current files:
  - `frontend/src/__tests__/backend_integration.test.ts` — live-canister integration test (not a
    unit test; needs a running dfx replica, see below).
  - `frontend/src/__tests__/useAuth.test.tsx` — hook unit test with mocked dependencies.
- Only 2 test files exist in the frontend right now — test coverage is thin. Most components,
  other hooks (`useFarm`, `useFarmOverview`, `useMarketPrices`, `useAuction`, `useGuestFarm`), and
  all UI components are currently untested at the unit level.

## 4. Test types present

1. **Frontend unit/hook tests (Vitest + Testing Library)** — `useAuth.test.tsx` is the reference
   example: mocks `@dfinity/auth-client` and `@/api/actor` wholesale, renders the hook via
   `renderHook` wrapped in the real `AuthProvider`, and asserts on hook return values.
2. **Frontend "integration" test that is actually a live-network test** —
   `backend_integration.test.ts` does **not** mock anything; it opens a real `HttpAgent` against
   `http://127.0.0.1:8000`, calls `fetchRootKey()`, and calls real canister methods against a
   hardcoded canister id (`uxrrr-q7777-77774-qaaaq-cai`). **This test requires `dfx start` running
   locally with the backend canister deployed at that id — it will fail/hang in a plain `vitest run`
   with no replica present.** Treat it as an integration test that must be run against a live local
   replica, not part of a fast unit-test loop.
3. **Backend integration/E2E tests (shell scripts against `dfx`)** — the primary and most extensive
   test layer for game logic; see section 6.
4. **No component snapshot tests, no visual regression tests, no browser e2e tests** currently
   exist despite Playwright being installed.

## 5. Test structure and mocking patterns (from the two real files)

### Hook test pattern (`frontend/src/__tests__/useAuth.test.tsx`)
- Uses `vi.mock('@dfinity/auth-client')` to auto-mock the whole module, then casts
  `(AuthClient.create as any).mockResolvedValue(mockAuthClient)`.
- Uses `vi.mock('@/api/actor', () => ({ createBackendActor: vi.fn().mockResolvedValue({...}) }))`
  to stub the actor factory — the pattern for any test touching `createBackendActor` is to mock
  the whole `@/api/actor` module rather than mocking `HttpAgent`/`Actor` directly.
- `beforeEach(() => { vi.clearAllMocks(); ... })` rebuilds fresh mock objects (`mockIdentity`,
  `mockAuthClient`) every test — no shared mutable mock state across tests.
- Renders via `renderHook(() => useAuth(), { wrapper: ({children}) => <AuthProvider>{children}</AuthProvider> })`
  and asserts with `waitFor(() => expect(result.current.X).toBe(Y))` for async state settling.
- Explicitly tests the hook's guard-rail: calling `useAuth()` outside `AuthProvider` throws
  `'useAuth must be used within an AuthProvider'` — a pattern worth replicating for any other
  context-consumer hook.
- Testing library import path uses the `@/` alias consistently
  (`import { AuthProvider } from '@/context/AuthContext'`).

### Live-integration test pattern (`frontend/src/__tests__/backend_integration.test.ts`)
- `beforeAll` builds one shared `actor` for all tests in the `describe` block (not per-test) —
  appropriate here because it's hitting a real, stateful replica and tests are written to tolerate
  pre-existing state (see next point).
- Assertions are written defensively against a real Motoko `Result` variant, checking `'Ok' in
  result` vs branching on known acceptable error variants rather than assuming a clean-slate state:
  ```ts
  if ('Ok' in result) {
      expect(result.Ok).toBeDefined();
  } else {
      if ('AlreadyExists' in result.Err) {
          expect(result.Err.AlreadyExists).toMatch(/already initialized/i);
      } else {
          throw new Error('Unexpected error during initialization: ' + JSON.stringify(result.Err));
      }
  }
  ```
  This "accept #Ok or a known idempotency #Err" pattern is the standard shape for tests hitting a
  canister that isn't reset before every run — copy it for new live-integration tests rather than
  asserting only `#Ok`.

## 6. Backend integration tests: `execution/tests/*.sh`

This is the **primary test suite for game logic** in this project — far more extensive than the
Vitest layer. All scripts live flat in `execution/tests/` (21 scripts as of this analysis):
`debug_serialization.sh`, `e2e_backend.sh`, `manual_api_test.sh`, `test_ai_competitors.sh`,
`test_audit_reporting.sh`, `test_fertilization_fix.sh`, `test_infrastructure_gdd.sh`,
`test_organic_workflow.sh`, `test_phase5_6.sh`, `test_phase5_7.sh`, `test_phase5_8.sh`,
`test_phase8_ai.sh`, `test_phase8_auction_win.sh`, `test_phase8_auctions.sh`,
`test_phase8_flood.sh`, `test_phase8_integration.sh`, `test_phase8_stress.sh`,
`test_phase_gates.sh`, `test_rankings.sh`, `test_seasonal_harvest.sh`, `test_security_audit.sh`,
`test_weather.sh`, `verify_living_world.sh`.

### What they test
Each script drives one feature/phase of the game against a **live local `dfx` replica**, calling
the deployed `backend` canister directly via `dfx canister call` and asserting on the raw Candid
text response. Coverage areas: player lifecycle (init, reset), season/phase transitions, harvest
economics, labor hiring, market/auction system (pre-season futures, closed-bid auctions, AI
bidding archetypes), weather/disease/pest events and infrastructure mitigation, organic
certification workflow, AI competitor behavior (3 archetypes: Marek, Kasia, Hans), rankings/
leaderboard, multi-year economic stress/survival, and a security audit pass
(`test_security_audit.sh`).

### How they're structured and run (`execution/tests/e2e_backend.sh` is the canonical example)
- Plain `#!/bin/bash`, no test framework — assertions are done with string matching on
  `dfx canister call` stdout.
- Logs are always tee'd to a `.tmp/*.log` file for later review:
  ```bash
  mkdir -p .tmp
  LOG_FILE=".tmp/backend.log"
  exec > >(tee -a "$LOG_FILE") 2>&1
  ```
- A shared `check_ok` helper validates the presence of `Ok`/`variant { Ok` in the response and
  `exit 1`s immediately on failure, printing the raw response for debugging:
  ```bash
  check_ok() {
      if [[ "$1" == *"Ok"* ]]; then
          echo "✅ SUCCESS: $2"
      elif [[ "$1" == *"variant { Ok"* ]]; then
          echo "✅ SUCCESS: $2"
      else
          echo "❌ FAILED: $2"
          echo "Response: $1"
          exit 1
      fi
  }
  ```
- Scripts extract values out of Candid text output with `grep -o` / `sed` (no proper Candid
  parser), e.g. pulling a parcel id: `grep -o 'id = "[^"]*"' | head -1 | cut -d'"' -f2`. Fragile
  but is the established pattern — match it for new scripts rather than introducing a different
  parsing approach.
- Scripts assert both success paths and expected-failure paths (e.g. harvesting the same parcel
  twice should return `#SeasonalRestriction`, checked via substring match on the response).
- Test data is not isolated per run — scripts call `debugResetPlayer`/`debugClearMarket`/
  `debugClearBidsAndContracts` (see `backend/main.mo` debug endpoints) as an explicit "Test 0:
  Reset Player State" step before proceeding, since state persists across calls against the same
  running replica.
- Sequence pattern per script: reset state → initialize player → advance season/phase as needed →
  exercise the feature under test → assert on both the happy path and at least one guarded/rejected
  path.

### Running them
These are meant to be run manually against a running `dfx` replica, e.g.:
```bash
dfx start --background        # or dfx start --clean --background for a fresh replica
dfx deploy backend
bash execution/tests/e2e_backend.sh 2>&1 | tee .tmp/backend.log
bash execution/tests/test_weather.sh
bash execution/tests/test_phase8_auctions.sh
```
Per `docs/qa/qa-checklist.md`, there is also a `execution/phase0_verify.sh` referenced as an
"all-in-one Phase 0 test (deploy + lifecycle + phase system + economy)" — check for its existence
before relying on it; it was not found under `execution/tests/` at analysis time (only listed
scripts above exist there) and may live elsewhere or be aspirational.

### QA process context (`docs/qa/qa-checklist.md`)
- The QA process is agent-driven and tracked in `docs/qa/qa-checklist.md`, organized as a backlog
  of checkboxes per game phase (Phase 0 baseline, Phase 7 Living World, Phase 8 Competitive Pool,
  etc.), each referencing a specific `execution/tests/*.sh` script and its last verified date.
- Notable constraint documented there: the QA agent persona is explicitly barred from running
  `dfx`/`npm` directly ("WSL Terminal Required — you CANNOT run dfx or npm commands... ask the
  User to execute in WSL") — meaning historically these scripts were run by a human, with the
  agent only reading back `.tmp/*.log` output. A planning/automation agent wiring these into CI
  should account for this being new territory (no evidence they currently run in any CI pipeline).
- The checklist calls out a **dual-entrypoint invariant**: both `backend/main.mo` (Playground) and
  `backend/main_mainnet.mo` (mainnet) must build and expose an identical API surface — any new
  backend test should ideally be run against both, though the existing scripts appear to target
  the single `backend` canister defined in `dfx.json` (`main`: `backend/main.mo`) rather than both
  entrypoints explicitly.
- `[TODO]`/`[FUTURE]` entries in the checklist indicate planned-but-not-yet-written tests (e.g.
  full pre-season future lifecycle, post-harvest auction win, AI archetype gating, flood factor
  degradation, `test_patron_logic.sh` deferred until `patron_logic.mo` exists) — useful signal for
  what test debt exists when planning new backend features.

## 7. Coverage expectations

- **None are enforced.** No coverage tool is configured, no CI workflow was found requiring a
  coverage threshold, and the checklist model in `docs/qa/qa-checklist.md` is manual/checkbox-based
  rather than metric-based. Treat "passing the relevant `execution/tests/*.sh` script(s) end to
  end, plus updating `docs/qa/qa-checklist.md`" as the de facto acceptance bar for backend changes,
  and "add/extend a Vitest test in `frontend/src/__tests__/`" as the (currently thin) bar for
  frontend logic changes.
