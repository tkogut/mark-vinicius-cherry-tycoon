# Mark Vinicius Cherry Tycoon

Cherry-farming tycoon sim on the Internet Computer (ICP). Motoko backend (dual entrypoint) + React/Vite/TS frontend. Full context lives in `.planning/` (GSD Core) — read that first, this file is the fast orientation layer.

## Where the real context is

- **`.planning/PROJECT.md`** — what this is, core value, active/validated/out-of-scope requirements, key decisions.
- **`.planning/ROADMAP.md`** — current milestone, phases, success criteria.
- **`.planning/STATE.md`** — where we are right now (read this every session).
- **`.planning/codebase/`** — generated codebase map (STACK, ARCHITECTURE, STRUCTURE, CONVENTIONS, TESTING, CONCERNS, INTEGRATIONS). Read the relevant doc before touching a subsystem you haven't worked in this session.
- **`docs/game-design/`** — gameplay/economy/UI/backend specs (source of truth for game rules, e.g. `docs/game-design/economy/price-formulas.md`, `docs/game-design/backend/track-separation.md`).
- **`docs/security/`**, **`docs/qa/`**, **`docs/ops/`** — security backlog, QA checklist, deployment docs.

## Dual entrypoint — hard constraint

`backend/main.mo` (Track A: local/dfx Playground) and `backend/main_mainnet.mo` (Track B: mainnet) are architecturally separate. **Never copy actor declarations or persistence keywords (`stable var` vs `persistent actor`/`transient`) between them** — see `docs/game-design/backend/track-separation.md`. Known current gap: `main_mainnet.mo` has not actually been migrated to Enhanced Orthogonal Persistence syntax despite docs describing it that way (tracked as `EOP-01` in `.planning/REQUIREMENTS.md` v2, deliberately not silently fixed).

## Commands that actually work

```bash
# Frontend (run from frontend/)
npm run dev              # Vite dev server
npm run build             # tsc && vite build
npm run lint               # ESLint (config gap tracked as QUAL-02 — verify it's not a no-op)
npx vitest run             # unit tests (no `npm test` script yet — QUAL-01)
npx vitest run src/__tests__/useAuth.test.tsx   # single file

# Backend (run from repo root)
dfx start --background     # local replica
dfx deploy backend         # deploy Track A locally
bash execution/tests/e2e_backend.sh 2>&1 | tee .tmp/backend.log   # primary backend test suite
bash execution/tests/test_weather.sh
```

Backend testing is shell-script-driven against a live `dfx` replica (`execution/tests/*.sh`, 21 scripts) — this is the actual test suite for game logic, far more extensive than the two Vitest files. See `.planning/codebase/TESTING.md` for the full pattern (the `check_ok` helper, state-reset-before-test convention, Candid string-matching).

## Known correctness issue (do not silently work around)

`frontend/src/context/AuthContext.tsx:150` (`initTestMode()`) sets `isAuthenticated(true)` before `backendActor` is ready — violates the documented Atomic Auth invariant (`isAuthenticated` must be set only after `backendActor` is ready). Tracked as Phase 1.1 / `AUTH-01`. If you touch auth code and aren't fixing this specific bug, don't paper over it — flag it.

## Security

No secrets, credentials, tokens, or PII in anything committed or read into context. `.env`, `.env.*`, `.secrets` are already hook-denied (`.claude/settings.local.json`). `DFX_IDENTITY_PEM` lives only as a GitHub Actions secret, never in the repo.

## CI

`.github/workflows/deploy-playground.yml` (auto-deploy on push to `master`) and `deploy-mainnet.yml` (manual `workflow_dispatch`) must keep working unchanged — do not touch these without explicit reason.

## Examples

See `examples/` for representative code patterns (Motoko module shape, React hook shape, test shape) — read before writing new code in an unfamiliar area of this codebase, per `.planning/codebase/CONVENTIONS.md`.
