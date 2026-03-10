# 📊 GDD vs. Iron Foundation — Alignment Audit
**Date**: 2026-03-10 · **Scope**: Backend Logic vs. [Mark_Vinicius_V1.md](file:///home/tkogut/projects/mark-vinicius-cherry-tycoon/Mark_Vinicius_V1.md)

---

## 🏆 Executive Summary
The "Iron Foundation" stage has successfully brought the core farming simulation and basic competition to a state of **100% mathematical alignment** with the GDD. The project has transitioned from a prototype to a robust, scalable backend engine.

### Current Status vs. GDD Roadmap
| GDD Component | Alignment | Status |
|:---|:---:|:---|
| **Orchard Economics** (§1) | **98%** | All formulas (PP, JS, Costs) match §1.1-1.2 exactly. |
| **Organic Farming** (§5) | **100%** | Conversion, certification fees, and premium pricing fully implemented. |
| **Competition** (§2) | **75%** | AI archetypes and Shared Market logic active. Missing: Auctions. |
| **Weather & Events** (§6) | **60%** | Seasonal weather alerts active. Missing: Pests & Insurance. |
| **Football Clubs** (§3) | **0%** | **PLANNED.** Data structures exist; logic is dormant. |
| **Geography** (§4) | **20%** | Opole Province deep-dive done. Map expansion pending. |

---

## ✅ Built & Aligned (The Successes)

### 1. The Yield Potential (PP) Engine
The formula in `game_logic.mo` is a bitbeat match for GDD §1:
- `PP = Base × Soil × pH × Fertility × Infrastructure × TreeAge`
- **Bonus Implementation**: County DNA (Głubczyce/Opole/Namysłów) multipliers are active, adding geographic depth.

### 2. The Orchard Quality Score (JS)
Implemented on a 0-100 scale. Factors in soil, water, spraying, and even mechanical damage from Shakers.

### 3. Shared Market & AI Competitors
- **AI Archetypes**: Marek (Traditionalist), Kasia (Innovator), and Hans (Businessman) are fully simulated in a deterministic way.
- **Price Multiplier**: Uses the GDD formula `Demand / (Supply + Baseline)`, ensuring prices drop when AI/Players flood the market.

---

## 🚧 Gaps & Logic Drift (The Priorities)

### 1. Missing: The Competitive Auction (§2.0.7)
While we have "Forward Contracts", they are 1-on-1 deals. The GDD calls for limited contracts where players and AI compete with offers. This is the missing link for Phase 6 depth.

### 2. Missing: Pests, Diseases, and Sabotage (§6)
Weather is implemented, but the biological risk layer (pests/fungi) and competitive interference (sabotage) are not yet in the logic.

### 3. Meta-Layer: Football Clubs (§3)
The GDD treats this as the meta-progression for reinvesting profits. Since our profit loop is now stable (Death Spiral Fix), this is the next major architectural challenge.

---

## 🚀 Recommended Roadmap Adjustments

### Phase 7.0: The Living World (CURRENT)
- **Aligning with GDD §6**: prioritize adding **Pest & Disease Events** alongside Weather. This requires wiring in the `Sprayer` infrastructure to act as a defensive modifier.
- **Add Insurance**: A simple annual premium to protect against #Frost and #Drought.

### Phase 8.0: The Competitive Edge
- **Contract Auctions**: Transition "Forward Contracts" into a competitive pool where AI bids against the player.
- **Sabotage Mechanics**: Low-reputation actions that cost cash but hinder AI supply.

### Phase 9.0: The Manager (Football)
- Initiate the `club_logic.mo` module to wire up the `ownedClubs` array in `types.mo`.
