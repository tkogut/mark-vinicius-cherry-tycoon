# Mark Vinicius Cherry Tycoon

## What This Is

A browser-based tycoon simulation deployed on the Internet Computer (ICP), with two equal pillars per the original concept (`Mark_Vinicius_V1.md`, rediscovered and reconciled 2026-07-29 as GDD v3 — `docs/game-design/GDD-ONE-PAGER.md`): players run a cherry orchard in a "Neo-Steampunk" reimagining of rural Poland (Opole/Namysłów/Głubczyce), compete for wholesale contracts and Cherry Festival standing against AI rivals, climb a global leaderboard, AND reinvest farm profits into football club ownership in a regional league. Backend is Motoko canisters (dual-entrypoint: local/playground vs. mainnet); frontend is React/Vite/TypeScript with Internet Identity auth.

## Core Value

Two pillars, one empire — a player can run the farm loop end-to-end (plant, tend, harvest, sell, compete in auctions and Cherry Festival) AND grow a football-club investment, with no dead levers, silently-broken features, or unexplained mechanics blocking either thread.

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
- ✓ Enhanced Leaderboard & Rankings UI (Phase 1, 2026-07-29) — own-rank surfacing via `getPlayerRank`, mobile-responsive rows
- ✓ Atomic Auth invariant enforced in all code paths incl. `initTestMode()` (Phase 1.1, 2026-07-29)

### Active

<!-- Current scope per GDD v3: restore football clubs as a core pillar, fix broken/dead levers, extend toward the fuller original vision. See .planning/ROADMAP.md Phases 2-10. -->

- [ ] Football Clubs — restore as core pillar (Phase 2): unstick `getAvailableFootballClubs()`/`buyClubShares()` backend stubs, both ends already built
- [ ] Core economic lever fixes (Phase 3): fertilizer type, season→price, auction runner-up trickle, player contract-win prestige, spoilage consolidation, `CompetitorsPanel` bug, AI naming
- [ ] Weather UI consolidation (Phase 4): most already built, fix dead `WeatherOverlay.tsx` + add persistent indicator
- [ ] Regional geography rebuild (Phase 5): scalable Poland data model per V1, fix always-optimal parcel stub
- [ ] Cherry Festival (Phase 6): design + build — was part of the original concept, never built at all
- [ ] Crop Insurance UI (Phase 7): two working backends, zero frontend — pick one, build UI
- [ ] Onboarding & phase-system teaching (Phase 8): biggest UX gap found in player-journey audit
- [ ] UX/UI deep overhaul (Phase 9, needs scoping): current layout matches neither the lore aesthetic nor V1's own UI priorities
- [ ] Quality infrastructure (Phase 10): no `npm test` script, no ESLint/Prettier config, Playwright unused, `useAuth.test.tsx` broken (missing `QueryClientProvider`)
- [ ] Re-verify `execution/tests/*.sh` against the current backend API one script at a time — `test_rankings.sh` and `e2e_backend.sh` confirmed calling removed methods (`getLeaderboard`, `advanceSeason`); 11/21 scripts have CRLF line endings

### Out of Scope

- Rewriting the dual-entrypoint (Track A/B) architecture into a single track — architectural constraint from the ICP Playground identity-binding limitation, not revisitable within this workflow.
- Migrating `backend/main_mainnet.mo` to actual Enhanced Orthogonal Persistence syntax right now — real drift exists (still classic `actor`/`stable var` despite docs claiming EOP), but this is a deliberate, separately-scoped backend migration, not bundled into this milestone. Tracked as `EOP-01` (v2 requirement).
- Map expansion beyond Opole, multiplayer/ICP tokenomics/NFT/DAO, seed breeding, crop diversification, sabotage, processing facilities, full Eco-mode certification detail — all explicitly deferred per GDD v3's "Future / Not Now" section (`docs/game-design/GDD-ONE-PAGER.md`), tracked as v2 requirements (MAP/CHAIN/SIM categories in `.planning/REQUIREMENTS.md`), not silently dropped.

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
| Rewrote GDD from a code-audit-only v2 to v3 after rediscovering `Mark_Vinicius_V1.md` | A code-only audit had wrongly concluded football clubs were a side stub (Cut/finish-as-bonus) and Cherry Festival was scope creep (Cut) — the original concept doc showed both were part of the day-one dual-pillar design | ✓ Good — triage against original intent, not just against what got built, going forward |
| Cherry Festival: design+build now, not Cut | Confirmed part of the original rivalry design (`Mark_Vinicius_V1.md` §2), not a later addition | — Pending (Phase 6, needs design spike first) |
| Sports Patron: restore as core pillar, not "finish as bonus" | V1 Short Pitch names football clubs as half the game's identity; both frontend and backend already built | — Pending (Phase 2) |
| Regional geography: design for full Poland scalability now, not just fix Opole | V1 §4 specifies the full data model up front with progressive region unlocks; a bigger-Opole-only patch would repeat the original narrowing mistake | — Pending (Phase 5) |

---
*Last updated: 2026-07-29 after GDD v3 (reconciling the code audit with `Mark_Vinicius_V1.md`)*
