# Examples

Representative code patterns from this codebase, for GSD Core's Plan phase (and anyone else) to imitate — not aspirational, not invented, copied from real files. See `.planning/codebase/CONVENTIONS.md` and `TESTING.md` for the full analysis these excerpts summarize.

- `motoko-pure-logic-module.mo` — pure, stateless calculation module pattern (from `backend/leaderboard_logic.mo`). Use this shape for new game-logic modules: no imports beyond base types, integer-only math with rationale comments, a `compare*` helper for `Array.sort`.
- `react-query-hook.ts` — data-fetching hook pattern (from `frontend/src/hooks/useMarketPrices.ts`). Use this shape for new canister-backed hooks: `@tanstack/react-query`, a named `*_KEY` query key export, `enabled: !!backendActor` gating, defensive `'Ok' in result` / `'Err' in result` unwrapping of Motoko `Result` responses.
- `vitest-hook-test.tsx` — hook unit test pattern (from `frontend/src/__tests__/useAuth.test.tsx`). Use this shape for new hook tests: `vi.mock` the whole `@/api/actor` module, `renderHook` wrapped in the real provider, `waitFor` for async state settling.
