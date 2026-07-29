# Mark Vinicius Cherry Tycoon

## What This Is

A browser-based farming/tycoon simulation deployed on the Internet Computer (ICP): players run a cherry orchard in a "Neo-Steampunk" reimagining of rural Poland (Opole/Namysłów/Głubczyce), compete for wholesale contracts against AI rivals in a shared auction pool, and climb a global leaderboard. Backend is Motoko canisters (dual-entrypoint: local/playground vs. mainnet); frontend is React/Vite/TypeScript with Internet Identity auth.

## Core Value

A player can log in, run a season end-to-end (plant, tend, harvest, sell, compete in auctions), and see their standing — with no missing UI surface or auth bug blocking that loop.

## Requirements

### Validated

<!-- Shipped and confirmed working per .planning/codebase/ map and historical roadmap. -->

- ✓ Core farming loop: planting, irrigation, fertilizing, harvest, spoilage — `backend/game_logic.mo`, `backend/storage_logic.mo`
- ✓ Economy: pricing formulas, market dynamics — `backend/market_logic.mo`, `docs/game-design/economy/`
- ✓ Competitive Pool: auctions, bids, Flood Factor, AI archetypes (Marek/Kasia/Hans) — `backend/auction_logic.mo`, `backend/competitor_logic.mo`
- ✓ Living World: weather/event backend systems, crop insurance — `backend/event_logic.mo` (frontend surface still missing — see Active)
- ✓ Leaderboards & Prestige Scoring backend (`topPlayersCache`) — `backend/leaderboard_logic.mo` (frontend surface still missing — see Active)
- ✓ Auction Dashboard + Imperial Contract Bid Modal (Phase 8.1/9.0) — `frontend/src/components/`
- ✓ Cinematic "Golden Harvester" upgrade — `frontend/src/components/farm/GoldenHarvesterView.tsx`
- ✓ Internet Identity authentication — `frontend/src/context/AuthContext.tsx`

### Active

<!-- Current scope: reach a genuinely playable release. -->

- [ ] Enhanced Leaderboard & Rankings UI (legacy Phase 6.1 — backend ready, frontend missing)
- [ ] Weather & Event UI integration (legacy Phase 7.0 — backend ready, frontend missing)
- [ ] Fix Atomic Auth violation in `initTestMode()` (`frontend/src/context/AuthContext.tsx:150` sets `isAuthenticated(true)` before `backendActor` is ready — confirmed by codebase mapping, contradicts the documented invariant)
- [ ] Wire up missing quality infrastructure: no `npm test` script, no ESLint/Prettier config despite scripts/deps existing, Playwright installed but unused (see `.planning/codebase/TESTING.md`, `CONVENTIONS.md`)

### Out of Scope

- Sports Patron / IV Liga Opolska (legacy Phase 10.0) — deferred in the pre-existing roadmap; large new subsystem (16 football clubs, TPI calc), not required for the core cherry-tycoon loop to be playable.
- Rewriting the dual-entrypoint (Track A/B) architecture into a single track — architectural constraint from the ICP Playground identity-binding limitation, not revisitable within this workflow.
- Migrating `backend/main_mainnet.mo` to actual Enhanced Orthogonal Persistence syntax right now — real drift exists (still classic `actor`/`stable var` despite docs claiming EOP), but this is a deliberate, separately-scoped backend migration, not bundled into the UI-completion push. Tracked as a known gap, not silently fixed.

## Context

- This project was previously developed under an IDE-specific multi-model agent framework ("Antigravity" / "AGENTS-OS Swarm", Gemini+Claude role-play). That tooling layer was fully removed on 2026-07-29 and replaced with GSD Core (native Claude Code subagents/hooks/slash commands), branched from `feature/antigravity-v2` (not `master`, which was stale) as `feature/gsd-migration`.
- Real game design/economy/security/ops docs previously nested inside agent "skill" folders were recovered and relocated to `docs/game-design/`, `docs/security/`, `docs/ops/`, `docs/qa/`, `docs/archive/` during that migration — see git history on `feature/gsd-migration` for the exact move.
- Full codebase map lives in `.planning/codebase/` (STACK, INTEGRATIONS, ARCHITECTURE, STRUCTURE, CONVENTIONS, TESTING, CONCERNS — generated 2026-07-29).
- Known architectural drift: `backend/main.mo` (Track A) runs dfx 0.24.3 locally/playground; CI mainnet deploy assumes a newer dfx generation — see `.planning/codebase/STACK.md` for the exact mismatch.

## Constraints

- **Tech stack**: Motoko (dual entrypoint) + React/Vite/TypeScript frontend, deployed via `dfx` to ICP (local, Playground, mainnet).
- **Compatibility**: Never share actor declarations or persistence keywords between `backend/main.mo` and `backend/main_mainnet.mo` — confirmed hard boundary in `docs/game-design/backend/track-separation.md`.
- **Security**: No secrets/credentials/PII in committed files or agent-readable context (org ISO 27001 policy). `.claude/settings.local.json` already denies `Read(.env)`/`Read(.env.*)`/`Read(.secrets)`.
- **CI**: `deploy-mainnet.yml` (manual, `DFX_IDENTITY_PEM` secret) and `deploy-playground.yml` (auto on push to `master`) must keep working unchanged through this migration.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Remove Antigravity/AGENTS-OS tooling, adopt GSD Core | Multi-model role-play via text convention doesn't map to Claude Code's actual subagent/hook mechanism; `before_model_call` hook was already non-functional (not a real Claude Code event) | ✓ Good — GSD Core hooks confirmed using real Claude Code events (SessionStart/PreToolUse/PostToolUse/etc.) |
| Branch `feature/gsd-migration` off `feature/antigravity-v2`, not `master` | `master` was strictly behind — 25 real game commits existed only on `feature/antigravity-v2` | ✓ Good — verified via `git log --oneline feature/antigravity-v2..master` (empty) before branching |
| Use `general-purpose` subagents instead of the installed `gsd-codebase-mapper` type for codebase mapping | This session's Agent tool registry didn't pick up newly-installed `.claude/agents/*.md` types mid-session; GSD Core's own workflow documents this exact fallback ("perform mapping sequentially in-context") | ⚠️ Revisit — re-verify `gsd-codebase-mapper` is available as a native type in a fresh session before relying on it for future phases |

---
*Last updated: 2026-07-29 after GSD Core onboarding (initial brownfield setup)*
