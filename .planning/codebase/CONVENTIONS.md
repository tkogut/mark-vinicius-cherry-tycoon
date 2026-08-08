# Codebase Conventions — Mark Vinicius Cherry Tycoon

Analysis date: 2026-07-29
Scope: `frontend/` (Vite + React + TypeScript) and `backend/` (Motoko, dfx/ICP canister)

This document describes conventions as they actually exist in the codebase today (not aspirational
rules). Use it as ground truth for planning/refactoring work.

## 1. Tooling: linting, formatting, tsconfig

- **No ESLint config file exists anywhere in the repo.** `frontend/package.json` has a `lint` script
  (`eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0`) and the ESLint
  devDependencies are installed (`eslint@^8.56.0`, `@typescript-eslint/*@^6.19.0`,
  `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`), but there is no `.eslintrc*` or
  `eslint.config.*` anywhere under `frontend/` or the repo root. Running `npm run lint` in
  `frontend/` will fail or fall back to defaults. **Finding for planning agents: this is a gap —
  any task touching lint/CI should first decide whether to add a config or drop the script.**
- **No Prettier config exists** (`.prettierrc*` absent, no `prettier` in devDependencies). Formatting
  is whatever each author's editor produced — expect inconsistency (see indentation note below).
- `frontend/tsconfig.json`: `strict: true`, `target: ESNext`, `jsx: react-jsx`,
  `moduleResolution: Node`, path alias `@/*` → `./src/*` (used pervasively, e.g.
  `import { useAuth } from '@/hooks/useAuth'`). `noEmit: true` — building is `tsc && vite build`
  (type-check then bundle), see `frontend/package.json` `build` script.
- Indentation is inconsistent between files: most `frontend/src` files use 4 spaces
  (e.g. `frontend/src/hooks/useFarm.ts`, `frontend/src/context/AuthContext.tsx`), but some
  (e.g. `frontend/src/lib/utils.ts`) use 2 spaces. New code should default to **4 spaces** to match
  the majority of hooks/context/component code.
- Motoko backend files (`backend/*.mo`) consistently use **2-space indentation**.

## 2. Naming patterns

### TypeScript / React (`frontend/src`)
- **Components**: PascalCase file name = component name, one component per file, e.g.
  `frontend/src/components/farm/ParcelCard.tsx`, `frontend/src/components/farm/MainDashboard.tsx`,
  `frontend/src/components/LoginButton.tsx`. Primitive/shadcn-style UI atoms under
  `frontend/src/components/ui/` are lowercase-kebab (`button.tsx`, `dropdown-menu.tsx`,
  `scroll-area.tsx`) — this mirrors shadcn/ui convention and differs deliberately from the
  PascalCase feature components.
- **Hooks**: `useXxx.ts` (or `.tsx` if it returns JSX/providers), always exporting a `useXxx`
  function — `frontend/src/hooks/useFarm.ts`, `useFarmOverview.ts`, `useAuction.ts`,
  `useMediaQuery.ts`, `useGuestFarm.ts`. Hooks live flat under `frontend/src/hooks/`, no
  subfolders.
- **Contexts**: PascalCase `XxxContext.tsx` exporting `XxxContext`, `XxxProvider`, and (in the same
  or a paired hook file) a `useXxx()` accessor — see `frontend/src/context/AuthContext.tsx`
  (`AuthContext`, `AuthProvider`) paired with `frontend/src/hooks/useAuth.ts`. Note the
  inconsistent folder naming: `frontend/src/context/` (singular, has `AuthContext.tsx`) vs.
  `frontend/src/contexts/` (plural, has `AudioContext.tsx`) — both exist side by side; be aware
  when adding a new context which one you're extending.
- **Types/interfaces**: PascalCase (`AuthContextType`, `GameError`, `_SERVICE` — the latter is
  dfx-generated Candid binding naming, not house style). Generated Candid bindings live under
  `frontend/src/declarations/` (do not hand-edit).
- **Functions/variables**: camelCase throughout (`createBackendActor`, `getErrorMessage`,
  `plantMutation`, `backendActor`). Constants that are effectively global config use
  SCREAMING_SNAKE_CASE, e.g. `OFFICIAL_BACKEND_CANISTER_ID` in `frontend/src/api/actor.ts`,
  `FARM_QUERY_KEY` in `frontend/src/hooks/useFarm.ts`.
- **Query keys**: exported array constants, e.g. `export const FARM_QUERY_KEY = ['farm'];` in
  `frontend/src/hooks/useFarm.ts`, referenced by both the query and by
  `queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEY })` in mutation `onSuccess` callbacks.

### Motoko (`backend/*.mo`)
- **Modules**: one `.mo` file per logical domain, named `snake_case` with a `_logic` suffix for
  business-logic modules: `game_logic.mo`, `market_logic.mo`, `auction_logic.mo`, `event_logic.mo`,
  `hiring_logic.mo`, `risk_logic.mo`, `storage_logic.mo`, `competitor_logic.mo`,
  `analytics_logic.mo`, `leaderboard_logic.mo`. Non-logic shared modules use plain snake_case:
  `types.mo`, `main.mo`, `main_mainnet.mo`. Sub-namespaced modules live in subfolders, e.g.
  `backend/authorization/access-control.mo` and `backend/authorization/MixinAuthorization.mo`
  (inconsistent kebab-case vs PascalCase filenames within the same folder — no fixed rule here).
- **Types**: PascalCase (`CherryParcel`, `Region`, `SoilType`, `GameError`, `FarmOverview`,
  `ForwardContractResult`). Variant tags use `#PascalCase` (`#SandyClay`, `#Urban`, `#NotFound`).
- **Functions**: camelCase (`getTreeAgeModifier`, `calculateSpoilageRate`, `initializePlayer`,
  `hireLabor`). Public API surface is `public func` / `public shared` / `public shared query`;
  internal helpers are `private func` (see `private func getSoilModifier` in
  `backend/game_logic.mo`).
- **Local type aliases at top of module**: modules re-export short aliases for `Types.X`, e.g. in
  `backend/game_logic.mo`:
  ```motoko
  type CherryParcel = Types.CherryParcel;
  type SoilType = Types.SoilType;
  ```
  Follow this pattern instead of writing `Types.CherryParcel` everywhere inside a module.
- **Dual entrypoint naming**: `backend/main.mo` (Playground/local) and `backend/main_mainnet.mo`
  (mainnet/EOP) must expose an **identical public API surface** — this is a hard project
  invariant, tracked manually (see `docs/qa/qa-checklist.md`, "Dual Entrypoint Build"). Any change
  to one must be mirrored in the other.

## 3. Import organization

TS/React files consistently order imports:
1. External packages (`react`, `@dfinity/*`, `@tanstack/react-query`)
2. Internal absolute imports via `@/` alias (`@/hooks/useAuth`, `@/api/actor`,
   `@/declarations/backend.did`)
3. Relative imports only inside `declarations`/`api`-adjacent low-level files (e.g.
   `frontend/src/api/actor.ts` uses `"../declarations/backend.did.js"` rather than the alias,
   inconsistently with the rest of the codebase — new code should prefer the `@/` alias per
   `tsconfig.json`'s `paths`).

Example (`frontend/src/hooks/useFarm.ts`):
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { GameError } from '@/declarations/backend.did';
import { useAudio } from '@/contexts/AudioContext';
import { SOUNDS } from '@/config/sounds';
```

Motoko modules (`backend/*.mo`) import stdlib first, then local modules, always with an explicit
alias:
```motoko
import Float "mo:base/Float";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Types "types";
```

## 4. Error handling patterns

### Motoko backend
- All fallible public functions return `Types.Result<T, E>` (aliased as `GameResult<T, E>` in
  `backend/main.mo`), defined in `backend/types.mo`:
  ```motoko
  public type Result<T, E> = {
    #Ok: T;
    #Err: E;
  };

  public type GameError = {
    #NotFound: Text;
    #Unauthorized: Text;
    #InsufficientFunds: { required: Nat; available: Nat };
    #BankruptcyRisk: { estimatedCostUntilHarvest: Nat; available: Nat };
    #InvalidOperation: Text;
    #SeasonalRestriction: Text;
    #AlreadyExists: Text;
  };
  ```
- Guard clauses at the top of every mutating `shared` function reject anonymous callers early and
  return immediately, e.g. `backend/main.mo`:
  ```motoko
  public shared({ caller }) func hireLabor(...) : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller_key)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) { ... }
    };
  };
  ```
- Nested `Result` propagation is done via `switch` on inner calls, re-wrapping the error:
  ```motoko
  switch (someHelper(...)) {
    case (#Err(e)) { return #Err(e) };
    case (#Ok(res)) { res };
  };
  ```
- No exceptions/traps are used for expected error conditions — only `Result`/`#Err`. `Debug.print`
  is used sparingly for admin/debug functions (`backend/authorization/access-control.mo`).

### TypeScript / React frontend
- **No React error boundaries exist in the codebase** (`grep -rn "ErrorBoundary" frontend/src`
  returns nothing). Error handling is done entirely at the data-fetching layer via React Query.
- Each domain hook defines a local `getErrorMessage(error: GameError): string` translator that
  pattern-matches the Candid variant and throws a plain `Error` with a human-readable message,
  which React Query then surfaces via its `error` state / `onError`. Example,
  `frontend/src/hooks/useFarm.ts`:
  ```ts
  const getErrorMessage = (error: GameError): string => {
      if ('NotFound' in error) return `Not Found: ${error.NotFound}`;
      if ('InvalidOperation' in error) return `Invalid Operation: ${error.InvalidOperation}`;
      if ('BankruptcyRisk' in error) return `Financial Risk: You need at least $${...}`;
      ...
      return 'Unknown Game Error';
  };
  ```
  and inside the query/mutation function:
  ```ts
  const result = await backendActor.getPlayerFarm();
  if ('Err' in result) {
      console.error('[useFarm] getPlayerFarm failed:', result.Err);
      throw new Error(getErrorMessage(result.Err));
  }
  ```
- User-facing error surfacing goes through the `useToast` hook
  (`frontend/src/components/ui/use-toast`), invoked from mutation `onError`/`onSuccess` callbacks —
  follow this pattern for any new mutation rather than inventing new toast/alert mechanisms.
- Network/auth failures in `frontend/src/api/actor.ts` and `frontend/src/context/AuthContext.tsx`
  use plain `try/catch` with `console.warn`/`console.error` plus a graceful fallback (e.g.
  `agent.fetchRootKey().catch(err => { console.warn(...); console.error(err); })`) rather than
  re-throwing, since root-key fetch failure is non-fatal in local dev.

## 5. Logging

- Logging is **`console.log`/`console.warn`/`console.error` only** — no logging library.
- Convention: prefix every log line with a bracketed module/hook tag, e.g. `[useFarm]`,
  `[AuthContext]`, `[actor.ts]`:
  ```ts
  console.log('[useFarm] Fetching farm state...');
  console.warn('[useFarm] No backend actor available');
  console.error('[useFarm] getPlayerFarm failed:', result.Err);
  ```
- Logging is currently very verbose in hooks (full state dumps on every fetch, e.g.
  `console.log('[useFarm] Full farm object:', result.Ok);` in `frontend/src/hooks/useFarm.ts`) —
  treat this as debug-era instrumentation, not a pattern to imitate uncritically for new
  production code; consider gating behind a debug flag if adding new call sites.
- Backend Motoko logging uses `Debug.print` very sparingly, mostly for admin bootstrap flows in
  `backend/authorization/access-control.mo`. Most backend "logging" instead happens via the shell
  integration tests writing to `.tmp/*.log` (see TESTING.md).
- Never log secrets, API keys, JWTs, or PII — none currently appear in logging call sites reviewed
  (canister IDs are public, not secrets).

## 6. Comment conventions

- Motoko files open with a two-line banner comment naming the project and the section's purpose,
  e.g. `backend/types.mo`:
  ```motoko
  // Mark Vinicius Cherry Tycoon - Type Definitions
  // All game data structures based on GDD specifications
  ```
- Section dividers use a fixed-width `=` banner referencing the Game Design Document (GDD) section
  number, e.g.:
  ```motoko
  // ============================================================================
  // YIELD CALCULATION (GDD Section 1 - Yield Potential Formula)
  // ============================================================================
  ```
  This GDD cross-referencing convention is used throughout `backend/types.mo` and
  `backend/game_logic.mo` — new backend types/logic should cite the relevant GDD section the same
  way (GDD source: `frontend/mark-vinicius-cherry-tycoon-gdd.md`).
- Inline comments on Motoko record fields document units/ranges directly after the field, e.g.
  ```motoko
  pH: Float;              // 5.5-7.5, optimal 6.0-7.0
  fertility: Float;       // 0.0-1.0 humus content
  ```
- `[NEW]`, `[TODO]`, `[FUTURE]` bracket-tags mark recently-added or planned fields/functions, e.g.
  `weather: ?WeatherEvent; // [NEW] Active weather event` in `backend/types.mo`, and
  `initTestMode: () => Promise<void>; // For development testing` in
  `frontend/src/context/AuthContext.tsx`.
- TS/React comments are sparser and mostly explain *why*, not *what* — especially around
  workarounds, e.g. `frontend/src/api/actor.ts`:
  ```ts
  // Hardcoded to break any "ID Ghost" loops from stale service-worker caches.
  // This resolves IC0537: "Canister has no wasm module" caused by stale `5vsfh` routing.
  ```

## 7. Function / module design patterns

- **Motoko**: pure calculation functions (yield, spoilage, price modifiers) live in `_logic.mo`
  modules and are kept side-effect-free, taking plain values and returning `Float`/`Nat`/`?Float`;
  state-mutating orchestration (HashMap lookups, `caller` checks, stable var mutation) is
  centralized in `backend/main.mo` (and mirrored in `backend/main_mainnet.mo`). When adding a new
  game mechanic: put the formula in the relevant `_logic.mo` module, and put the canister endpoint
  (auth guard + phase guard + state mutation + `Result` wrapping) in `main.mo`/`main_mainnet.mo`.
- Optional/nullable results use `?T` (e.g. `getTreeAgeModifier(treeAge: Nat) : ?Float`, returning
  `null` for "tree is dead" rather than an error — reserve `Result`/`GameError` for
  caller-actionable failures, and `?T` for "this value legitimately doesn't exist".
- Phase-gating is a recurring cross-cutting pattern: nearly every mutating endpoint in
  `backend/main.mo` checks `farm.currentPhase` against an allowed set before proceeding, returning
  `#Err(#SeasonalRestriction(...))` otherwise — replicate this check-first-then-act shape for new
  endpoints rather than checking phase inside the logic module.
- **React hooks**: one hook per domain wraps a React Query `useQuery` (read) plus one or more
  `useMutation`s (write), with a shared query key constant exported for cross-hook invalidation
  (`FARM_QUERY_KEY`). Mutations call `queryClient.invalidateQueries` and `toast(...)` in
  `onSuccess`, and throw translated `Error`s from `getErrorMessage` on `Err`. Follow this shape
  (`frontend/src/hooks/useFarm.ts`, `useFarmOverview.ts`, `useAuction.ts`) for any new backend
  endpoint integration rather than calling `backendActor` directly from components.
- **Components**: feature components (`frontend/src/components/farm/*`) consume hooks, not the
  actor directly; presentational primitives live in `frontend/src/components/ui/` following
  shadcn/ui conventions (`cva` variants, `cn()` helper from `frontend/src/lib/utils.ts` for
  conditional Tailwind classes).
