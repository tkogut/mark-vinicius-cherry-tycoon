# External Integrations

**Analysis Date:** 2026-07-29

## APIs & External Services
No third-party REST/GraphQL APIs, payment processors, or SaaS SDKs were found in `frontend/src` or `backend/` (no `fetch(`/`axios` calls to external hosts, no Stripe/analytics/CRM SDKs). The only outbound network integration is DFINITY's Internet Identity canister, pulled at build time from `https://github.com/dfinity/internet-identity/releases/latest/download/internet_identity.did` and `.../internet_identity_dev.wasm.gz` (declared in root `dfx.json` under the `internet_identity` custom canister). All gameplay logic (`backend/game_logic.mo`, `market_logic.mo`, `auction_logic.mo`, `event_logic.mo`, `hiring_logic.mo`, `competitor_logic.mo`, `risk_logic.mo`, `analytics_logic.mo`, `leaderboard_logic.mo`) runs inside the Motoko canister itself rather than calling external services.

## Data Storage
**Databases:** No traditional database. This project is an Internet Computer canister application — the Motoko backend actor (`backend/main.mo`, actor `CherryTycoon`) uses Enhanced Orthogonal Persistence plus explicit `stable var` state (e.g. `stablePlayerFarms`, `stableSaturation`, `stableGlobalSeason`, `stableUserRoles`, `stableAdminAssigned`, `stableTopPlayersCache`, `stableAICompetitors`, `stableSpotPrice`) with `preupgrade`/`postupgrade`-style hooks to serialize in-memory `HashMap`s to stable arrays across canister upgrades. There is also a `backend/main_mainnet.mo` variant used specifically for the mainnet deployment target (`backend_mainnet` canister). No SQL/NoSQL engine, ORM, or migration tooling is present.
**File Storage:** None detected — no S3/GCS/Azure Blob SDKs or usage. The `frontend` canister itself is a static asset canister (`dfx.json` canister type `assets`, source `frontend/dist`) serving the built SPA directly from the IC.
**Caching:** No server-side/Redis-style cache. Client-side, `localStorage`/`indexedDB` usage was found in `frontend/src/i18n.ts` (language persistence), `frontend/src/contexts/AudioContext.tsx` (audio/mute settings), and `frontend/src/hooks/useGuestFarm.ts` (guest/offline farm state). On the backend, `stableTopPlayersCache` in `backend/main.mo` acts as an in-canister leaderboard cache.

## Authentication & Identity
**Auth Provider:** Internet Identity (DFINITY's canister-based identity provider). `frontend/src/context/AuthContext.tsx` wraps `@dfinity/auth-client`'s `AuthClient`, calling `client.login({ identityProvider: ... })` with `http://127.0.0.1:4943?canisterId=<VITE_INTERNET_IDENTITY_CANISTER_ID>` for local development and `https://identity.ic0.app` for production. Notably, the code contains an **auto-login bypass for non-`ic` networks**: when a user isn't authenticated and `VITE_DFX_NETWORK !== 'ic'`, it generates an ephemeral `Ed25519KeyIdentity` session identity and treats the user as authenticated without going through Internet Identity — this only applies to local/playground networks, not mainnet, but is worth flagging for review. `frontend/src/api/actor.ts` builds the authenticated `HttpAgent`/`Actor` (via `@dfinity/agent`) and also contains a hardcoded `OFFICIAL_BACKEND_CANISTER_ID` fallback (`"6mce5-laaaa-aaaab-qacsq-cai"`) used when env-provided canister IDs are missing.

## Monitoring & Observability
**Error Tracking:** Not detected. No Sentry, Datadog, LogRocket, or similar error-tracking SDK found in `frontend/package.json` or source.
**Logs:** No centralized/structured logging service integrated. Frontend relies on `console.log`/`console.warn`/`console.error` (heavily used in `AuthContext.tsx` and `actor.ts` for auth/actor-creation diagnostics). Backend relies on Motoko's `Debug` module (imported in `backend/main.mo`) for canister-side debug logging, and CI (`deploy-playground.yml`) uploads `.tmp/*.log`, `frontend/npm-debug.log`, and `*.log` as build artifacts on failure.

## CI/CD & Deployment
**Hosting:** Internet Computer — both a "playground" (ephemeral/free tier, `--network playground`) and mainnet (`--network ic`) target, deployed via `dfx deploy`.
**CI Pipeline:** Two GitHub Actions workflows:
- `.github/workflows/deploy-playground.yml` — triggers on push to `master` or manual dispatch; sets up Node 20 and DFX `0.24.3` (`aviate-labs/setup-dfx@v0.3.2`), optionally imports a deploy identity from a PEM secret, deploys the `backend` canister to `--network playground`, exports its canister ID into `VITE_BACKEND_CANISTER_ID`, builds the frontend (`npm ci && npm run build`) with that ID and `VITE_DFX_NETWORK=playground`, then deploys the `frontend` assets canister; uploads logs as artifacts on failure.
- `.github/workflows/deploy-mainnet.yml` — manual `workflow_dispatch` only, gated behind a typed `"deploy"` confirmation input; sets up Node 20 and DFX `0.30.2` (`dfinity/setup-dfx@main`), imports the same deploy identity secret, deploys `backend_mainnet` to `--network ic`, builds the frontend with `VITE_DFX_NETWORK=ic`, then deploys the `frontend` assets canister to mainnet. No automated test/lint gate runs in either pipeline before deployment.

## Environment Configuration
**Required env vars:**
- `VITE_DFX_NETWORK` (frontend network selector: `local` / `playground` / `ic`)
- `VITE_BACKEND_CANISTER_ID`
- `VITE_BACKEND_MAINNET_CANISTER_ID`
- `VITE_INTERNET_IDENTITY_CANISTER_ID`
- `CANISTER_ID_<NAME>` / `VITE_<NAME>_CANISTER_ID` (generic fallback pattern generated in `frontend/vite.config.ts` for canisters `backend`, `backend_mainnet`, `internet_identity`)
- `DFX_NETWORK` (used by `frontend/vite.config.ts` and CI to pick the canister_ids.json path)
- `DFX_IDENTITY_PEM` (GitHub Actions secret, deploy identity PEM — used in both workflows)

Two frontend env files exist — `frontend/.env.production` and `frontend/.env.playground` — noted for existence only; contents were not read per data-handling policy.

**Secrets location:** `DFX_IDENTITY_PEM` is stored as a GitHub Actions repository secret (referenced as `${{ secrets.DFX_IDENTITY_PEM }}` in both `.github/workflows/deploy-playground.yml` and `.github/workflows/deploy-mainnet.yml`) and written locally in the CI runner to `~/.config/dfx/identity/deploy/identity.pem` at deploy time. No other secret stores (Vault, AWS Secrets Manager, etc.) were found.

## Webhooks & Callbacks
**Incoming:** Not detected — no webhook receiver endpoints (the backend is a Motoko canister exposing only IC method calls, not HTTP webhook routes).
**Outgoing:** Not detected — no outbound webhook/callback dispatch found in frontend or backend source.

---
*Integration audit: 2026-07-29*
