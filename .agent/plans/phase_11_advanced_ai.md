# Phase 11.0: Advanced AI Market Competitors

**Status**: PLANNING 🤖
**Date**: 2026-03-16
**Objective**: Enhance the competitive pool (Phase 8.0) by introducing specialized AI archetypes with distinct bidding behaviors and economic strategies.

## AI Archetypes

### 1. ⚔️ The Aggressive (The Raider)
- **Philosophy**: Win at any cost to maintain market dominance.
- **Bidding Logic**: 
    - Priority: High-volatility Imperial Contracts.
    - Bid Increment: Aggressive step-ups (+15-25% over current lead).
    - Threshold: Will spend up to 95% of current liquidity if lead is challenged.
- **Visual Vibe**: High-frequency steam bursts, red/brass glow on dashboard.

### 2. 🛡️ The Eco (The Specialist)
- **Philosophy**: Efficiency and long-term sustainability.
- **Bidding Logic**:
    - Priority: Low-risk, high-quality organic bundles.
    - Bid Increment: Methodical, minimal necessary increments (+2-5%).
    - Threshold: Strict ROI calculation; will drop out if bid exceeds 60% of projected profit.
- **Visual Vibe**: Subtle green/emerald backlighting, steady mahogany texture.

### 3. ⚖️ The Balanced (The Tactician)
- **Philosophy**: Adaptive response to player and market pressure.
- **Bidding Logic**:
    - Priority: Diversified portfolio.
    - Bid Increment: Dynamic based on time remaining (slow start, fast finish).
    - Threshold: Variable 70-80% of liquidity.
- **Visual Vibe**: Balanced blue/gold highlights, gear-rotation animations.

## Proposed Changes

### [Backend] [auction_logic.mo]
- [ ] Refactor `_performAIBidding` to support Archetype-based strategies.
- [ ] Implement `getStrategyForArchetype` logic.
- [ ] Add `Archetype` enum to `types.mo`.

### [Frontend] [AIBidderCard.tsx]
- [ ] Implement visual variants based on the AI archetype.
- [ ] Add unique animations for each archetype's bid action.

## Verification Plan

### Automated Tests
- [ ] Script a 24-hour auction simulation with all 3 archetypes.
- [ ] Verify that "The Eco" archetype never over-bids its profit threshold.
- [ ] Verify "The Aggressive" triggers "Shortfall Logic" frequently.

### Manual Verification
- [ ] Visual audit of archetype-specific card state changes via CDP bridge.
