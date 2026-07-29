# Requirements: Mark Vinicius Cherry Tycoon

**Defined:** 2026-07-29
**Core Value:** A player can log in, run a season end-to-end (plant, tend, harvest, sell, compete in auctions), and see their standing — with no missing UI surface or auth bug blocking that loop.

## v1 Requirements

Requirements for reaching a genuinely playable release. Each maps to a roadmap phase.

### Leaderboard (LEAD)

- [x] **LEAD-01**: Player can view a ranked list of top players (pulls from existing `topPlayersCache`) — was already implemented (`RankingsPanel.tsx`) before Phase 1 started
- [x] **LEAD-02**: Player can see their own current rank and prestige score — "Your Standing" card added (Phase 1), covers players outside the visible cached top-N via `getPlayerRank`
- [x] **LEAD-03**: Leaderboard UI is usable on mobile (48x48px touch targets, no clipped columns) — responsive stacking added (Phase 1)

### Weather & Events (WEATHER)

- [ ] **WEATHER-01**: Player can see active weather effects on the orchard view
- [ ] **WEATHER-02**: Player is notified of active events (Crop Insurance windows, Cherry Festival) via UI
- [ ] **WEATHER-03**: Weather/event visuals integrate with the existing particle/VFX system (`frontend/src/components` particle patterns)

### Auth Correctness (AUTH)

- [ ] **AUTH-01**: `isAuthenticated` is set only after `backendActor` is ready in ALL code paths, including `initTestMode()` (currently violated at `frontend/src/context/AuthContext.tsx:150`)

### Quality Infrastructure (QUAL)

- [ ] **QUAL-01**: `npm test` runs the Vitest suite (script currently missing despite Vitest being configured)
- [ ] **QUAL-02**: ESLint/Prettier config exists and matches the already-present `lint` script and devDependencies
- [ ] **QUAL-03**: Playwright is either wired into a real e2e test or removed from dependencies (currently installed but unused)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Sports Patron (SPORTS)

- **SPORTS-01**: IV Liga Opolska club investment subsystem (16 regional teams, TPI calculation)
- **SPORTS-02**: `SportsCenter.tsx` UI with gauge-dials and regional reputation link

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
| AUTH-01 | Phase 1.1 | Pending |
| WEATHER-01 | Phase 2 | Pending |
| WEATHER-02 | Phase 2 | Pending |
| WEATHER-03 | Phase 2 | Pending |
| QUAL-01 | Phase 3 | Pending |
| QUAL-02 | Phase 3 | Pending |
| QUAL-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-29*
*Last updated: 2026-07-29 after initial GSD Core onboarding*
