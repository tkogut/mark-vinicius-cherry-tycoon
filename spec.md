# Specification

## Summary
**Goal:** Expand the GDD template’s “Competition & Market Dynamics” section to more clearly define shared market pricing, AI rival behaviors, rankings, auction-based wholesale contracts, and the Cherry Festival event.

**Planned changes:**
- Update `frontend/src/lib/gddTemplate.ts` section with `id: 'competition-mechanics'` to add clearly labeled subsections/paragraphs for Shared Market Mechanics, AI Competitor Behavior Patterns, Ranking System, Auction-based Wholesale Contracts, and Cherry Festival mechanics.
- Define (at a high level) how combined player + AI supply affects retail/wholesale pricing in the shared market.
- Describe behavior patterns for the three AI rival personalities (Traditionalist, Innovator, Businessman), including decision priorities and reactions to prices/events.
- Define ranking metrics (Farm Value, Season Profit, Efficiency) and provide high-level calculation descriptions for each.
- Specify auction-based wholesale contract mechanics, including when auctions occur, what is bid on, winner selection logic, and resulting contract obligations/rewards (duration/fulfillment and effects on revenue/prices).
- Add explicit “Cherry Festival” event mechanics including timing, objectives, scoring, rewards, and at least one interaction with market prices and/or rankings, while keeping formatting compatible with existing GDD rendering and exports.

**User-visible outcome:** The GDD “Competition & Market Dynamics” section displays richer, clearly structured English content covering shared market pricing, AI rivals, rankings, auctions, and the Cherry Festival without breaking existing layout/markdown rendering.
