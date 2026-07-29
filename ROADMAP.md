# Mark Vinicius Cherry Tycoon — Roadmap

> **Current Status**: Phase 12.0 (Cinematic Upgrade) complete. Two frontend items remain open before the game is fully playable end-to-end.
> **Environment**: WSL (Ubuntu), `dfx 0.24.3` + Motoko 0.30.2 (EOP).
> **Dual-Entrypoint**: `backend/main.mo` (Playground/local) / `backend/main_mainnet.mo` (Mainnet) — never share actor declarations or persistence keywords between the two.

## History

### Phase 1–8.0 (COMPLETE)
- Phase 1–4: Core logic, MVP integration, economy, infrastructure, multiplayer prep.
- Phase 5.7: Mechanics deepening (Bulk Supply, Phase Watering, Machine Decay).
- Phase 5.9: Security hardening (SEC-019, SEC-020).
- Phase 6.1: Global Leaderboards & Prestige Scoring — backend done, `topPlayersCache` active.
- Phase 7.0: The Living World (Event system, Weather, Crop Insurance) — backend done.
- Phase 8.0: The Competitive Pool (`auction_logic.mo`, Bids, Flood Factor, Base AI Archetypes).

### Phase 9.0: Frontend Implementation (PROD-READY, local)
- [x] Phase 8.1 — Imperial Contract Bid Modal + refined gauge system.
- [x] Phase 9.0 — Auction Dashboard core implementation.
- [ ] **Phase 7.0 — Weather & Event UI integration.** Backend systems exist; frontend surface not yet built.
- [ ] **Phase 6.1 — Enhanced Leaderboard & Rankings UI.** Backend (`topPlayersCache`) ready; frontend surface not yet built.

### Phase 11.0: Advanced AI Market Competitors (COMPLETE)
Specialized AI archetypes in the competitive pool:
- The Aggressive (Marek) — high-volatility Imperial Contracts, aggressive step-ups.
- The Eco (Kasia) — low-risk, high-quality organic bundles, methodical increments.
- The Tactician (Hans) — adaptive response, diversified portfolio.
- Backend: dynamic strategy updates in `auction_logic.mo` / `game_logic.mo`.
- Frontend: visual variants in `AIBidderCard.tsx` per strategy.

### Phase 10.0: Sports Patron (IV Liga Opolska) — DEFERRED
16 regional teams (Odra II, Namysłów, Nysa, etc.) from Opole province; `FootballClub` HashMap seeding, TPI (Team Power Index) calc, `SportsCenter.tsx` UI. Not scheduled.

### Cinematic Upgrade: "The Golden Harvester" (COMPLETE)
`golden_harvester_level` tracking, safe cost deductions, `(1.05^Level)` multiplier; `GoldenHarvesterView.tsx` with God Rays, Golden Hour lighting, `GoldenPollen` particles, haptic feedback.

## Next Up (GSD Core phase queue)

1. **Phase 6.1 — Enhanced Leaderboard & Rankings UI** (pilot for the new Discuss→Plan→Execute→Verify→Ship workflow — frontend-only, backend already complete).
2. **Phase 7.0 — Weather & Event UI integration** (second cycle, once the workflow is proven on #1).

## Known invariant to enforce

**Atomic Auth**: `isAuthenticated` must be set only after `backendActor` is ready — do not reorder this in auth flow changes.
