# Technology Stack

**Analysis Date:** 2026-07-29

## Languages
**Primary:** TypeScript (frontend, `frontend/tsconfig.json`, target `ESNext`, `strict: true`) and Motoko (backend canister logic, `backend/*.mo`).
**Secondary:** JavaScript (`backend/testCosts.js`, generated Candid bindings in `frontend/src/declarations/*.js` and `backend/frontend/src/declarations/*.js`), JSON/config (`dfx.json`, `frontend/package.json`).

## Runtime
**Environment:** Internet Computer (ICP) replica for the Motoko backend canister, defined in root `dfx.json` (canisters: `backend`, `frontend` assets canister, `internet_identity`). DFX version pinned to `0.24.3` in `.dfxversion` (root) and used in CI via `aviate-labs/setup-dfx@v0.3.2` (`.github/workflows/deploy-playground.yml`); mainnet workflow uses a newer `dfx-version: '0.30.2'` via `dfinity/setup-dfx@main` (`.github/workflows/deploy-mainnet.yml`) — note the version mismatch between playground and mainnet deploy pipelines. Frontend runs in the browser (Vite dev server / static assets canister); Node.js `20` is used in CI (`actions/setup-node@v4`) for building the frontend.
**Package Manager:** npm, scoped to `frontend/` (`frontend/package.json`, `frontend/package-lock.json`; CI uses `npm ci`). A near-empty root `package-lock.json` (112 bytes) also exists at the repo root but there is no root `package.json`, so npm tooling is effectively frontend-only.

## Frameworks
**Core:** React 18 (`react` ^18.2.0, `react-dom` ^18.2.0) with Vite 5 (`frontend/vite.config.ts`) as the build/dev server, TypeScript 5.3, Tailwind CSS 3.4 (`frontend/tailwind.config.js`) with `tailwindcss-animate`, Radix UI primitives (`@radix-ui/react-*`) for accessible components, `class-variance-authority` + `clsx` + `tailwind-merge` for styling composition (shadcn/ui-style pattern), `framer-motion` for animation, `react-i18next` / `i18next` (+ `i18next-browser-languagedetector`) for localization, `@tanstack/react-query` ^5.90 for async/server-state management, `howler` for audio, `jimp` for image processing.
**Testing:** Vitest 4 (`frontend/vitest.config.ts`) with `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, and `jsdom` for unit/component tests; Playwright (`@playwright/test`) for end-to-end browser tests.
**Build/Dev:** Vite 5 + `@vitejs/plugin-react`; `tsc` runs as a pre-build type-check step (`"build": "tsc && vite build"` in `frontend/package.json`); ESLint 8 (`@typescript-eslint/eslint-plugin`/`parser`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) for linting — no committed `.eslintrc*` file was found in `frontend/`, so lint config location/rules should be confirmed; PostCSS + Autoprefixer for CSS processing.

## Key Dependencies
**Critical:** `@dfinity/agent`, `@dfinity/auth-client`, `@dfinity/identity`, `@dfinity/principal` (all ^3.4.3) — the ICP JS SDK used for actor creation, Internet Identity auth, and canister calls (`frontend/src/api/actor.ts`, `frontend/src/context/AuthContext.tsx`). Backend Motoko modules under `backend/` (`main.mo`, `game_logic.mo`, `market_logic.mo`, `auction_logic.mo`, `event_logic.mo`, `hiring_logic.mo`, `competitor_logic.mo`, `risk_logic.mo`, `storage_logic.mo`, `analytics_logic.mo`, `leaderboard_logic.mo`, `types.mo`) plus `backend/authorization/access-control.mo` and `backend/authorization/MixinAuthorization.mo` for role-based access control.
**Infrastructure:** `dfx` CLI (DFINITY SDK) for canister build/deploy; `internet_identity` canister (custom canister type in `dfx.json`, pulled from DFINITY's GitHub releases, with a `remote.ic` mainnet ID `rdmx6-jaaaa-aaaaa-aaadq-cai`) for authentication; GitHub Actions (`actions/checkout`, `actions/setup-node`, `aviate-labs/setup-dfx`, `dfinity/setup-dfx`, `actions/upload-artifact`) for CI/CD.

## Configuration
**Environment:** Vite env vars consumed via `import.meta.env.*` in frontend source: `VITE_DFX_NETWORK`, `VITE_BACKEND_CANISTER_ID`, `VITE_BACKEND_MAINNET_CANISTER_ID`, `VITE_INTERNET_IDENTITY_CANISTER_ID` (found via grep of `frontend/src`). Two env files exist at `frontend/.env.production` and `frontend/.env.playground` (contents not read, per policy — existence only noted). `frontend/vite.config.ts` also derives canister IDs from `.dfx/local/canister_ids.json`, `.dfx/playground/canister_ids.json`, or root `canister_ids.json` depending on `DFX_NETWORK`/`VITE_DFX_NETWORK`, with fallback to `CANISTER_ID_<NAME>` / `VITE_<NAME>_CANISTER_ID` process env vars.
**Build:** `dfx.json` (root) defines three canisters (`backend` Motoko, `frontend` assets from `frontend/dist`, `internet_identity` custom); Motoko declarations are generated into `frontend/src/declarations` (js/ts/did bindings). `frontend/tsconfig.json` + `frontend/tsconfig.node.json` (project references) configure TypeScript compilation; `frontend/vite.config.ts` injects canister IDs as build-time `define` constants and proxies `/api` to `http://127.0.0.1:8000` (local replica) in dev.

## Platform Requirements
**Development:** Node.js 20 (matches CI `actions/setup-node@v4` `node-version: '20'`; no `.nvmrc` found at repo root), npm, DFX 0.24.3 (`.dfxversion`) with a local ICP replica (`dfx.json` `networks.local` bound to `127.0.0.1:8000`), a Motoko compiler (bundled with dfx — no separate `moc` version pin found).
**Production:** Internet Computer mainnet (`--network ic`) hosting both the Motoko backend canister (`backend_mainnet` per `backend/main_mainnet.mo` and the mainnet workflow) and a `frontend` assets canister serving the Vite production build (`frontend/dist`); mainnet deploys use DFX `0.30.2` (via `dfinity/setup-dfx@main`) versus `0.24.3` used for playground/local — this discrepancy is worth reconciling. Internet Identity is used for production auth, falling back to `https://identity.ic0.app`.

---
*Stack analysis: 2026-07-29*
