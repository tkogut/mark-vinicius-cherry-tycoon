# 🎮 GDD vs. Implementation — Gap Analysis & Next Steps

> **Date**: 2026-02-16 · **Scope**: Full codebase audit against [Mark_Vinicius_V1.md](file:///c:/Users/tkogut/.gemini/antigravity/projects/mark-vinicius-cherry-tycoon/Mark_Vinicius_V1.md)

---

## Overall Progress Summary

| GDD Section | Coverage | Status |
|:---|:---:|:---|
| 1. Cherry Orchard Economics | **85%** | Core loop works; costs, yield, quality, organic all in |
| 2. Competition & Rivalry | **5%** | Types exist; no AI farms, no shared market, no rankings |
| 3. Football Clubs | **0%** | Types defined only; no logic, no UI |
| 4. Geographic Layer | **15%** | Opole-only; Province enum exists; no map UI |
| 5. Eco/Organic Farming | **70%** | Conversion, certification, premium pricing done; no inspections |
| 6. Advanced Features | **10%** | Weather types exist; no events, pests, insurance, sabotage |
| 7. Languages / i18n | **0%** | Not started |
| 8. Frontend & Mobile | **60%** | Dashboard, modals, PWA manifest; no map, clubs, ranking views |
| 9. ICP Integration | **40%** | Auth (II) works; no multi-canister, no tokens, no NFTs |
| 10. Game Loop (Season) | **70%** | advanceSeason works; no weekly sub-turns, no off-season phase |
| 11. Implementation Roadmap | **~Phase 1 done** | GDD Phase 0 complete; Phase 1 (AI competition) not started |
| 12. Metrics & Progression | **50%** | Farm KPIs tracked; no club KPIs, no unlock roadmap |
| 13. UI/UX Priorities | **40%** | Onboarding exists; no progress roadmap, no social proof |
| 14. Implementation Goals | **30%** | Single canister; no multi-canister architecture |

---

## What's Built (✅ Done)

### Backend ([main.mo](file:///c:/Users/tkogut/.gemini/antigravity/projects/mark-vinicius-cherry-tycoon/backend/main.mo) — 1709 lines)
- **Player Management**: `initializePlayer`, `getPlayerFarm`, `getFarmOverview`, `getPlayerStats`, `checkStability`
- **Parcel Ops**: `harvestCherries`, `waterParcel`, `fertilizeParcel`, `plantTrees`, `startOrganicConversion`
- **Economy**: `sellCherries` (retail/wholesale with quality & saturation), `getCashBalance`, `purchaseParcel`, `buyParcel`
- **Progression**: `advanceSeason` (costs, spoilage, tree aging, organic cert), `upgradeInfrastructure`
- **Persistence**: `preupgrade`/`postupgrade` hooks for stable storage
- **Market Saturation**: Time-based decay of regional sales volumes

### Game Logic ([game_logic.mo](file:///c:/Users/tkogut/.gemini/antigravity/projects/mark-vinicius-cherry-tycoon/backend/game_logic.mo) — 408 lines)
- Yield formula: `Base × Soil × pH × Fertility × Infrastructure × Water × Organic × TreeAge`
- Retail & wholesale pricing with quality bonuses, organic premiums, saturation multipliers
- Fixed/variable cost calculations with infrastructure effects (tractor/shaker reduce labor)
- Quality Score 0–100, organic conversion logic, weather impact on yields, XP & leveling

### Type System ([types.mo](file:///c:/Users/tkogut/.gemini/antigravity/projects/mark-vinicius-cherry-tycoon/backend/types.mo) — 370 lines)
- Full geographic model (16 provinces, counties, communes)
- Infrastructure types with GDD-compliant CAPEX costs
- Football club types, AI competitor types (future-ready but unused)
- Season reports, yearly reports, parcel economics breakdowns

### Frontend
- **[App.tsx](file:///c:/Users/tkogut/.gemini/antigravity/projects/mark-vinicius-cherry-tycoon/frontend/src/App.tsx)**: Main dashboard with sidebar, farm grid, sell/plant actions
- **[ParcelCard.tsx](file:///c:/Users/tkogut/.gemini/antigravity/projects/mark-vinicius-cherry-tycoon/frontend/src/components/farm/ParcelCard.tsx)** (19KB): Rich parcel display with yield tooltips
- **[ParcelDetailsPanel.tsx](file:///c:/Users/tkogut/.gemini/antigravity/projects/mark-vinicius-cherry-tycoon/frontend/src/components/farm/ParcelDetailsPanel.tsx)**: pH, soil, humidity, fertility details
- **[Marketplace.tsx](file:///c:/Users/tkogut/.gemini/antigravity/projects/mark-vinicius-cherry-tycoon/frontend/src/components/farm/Marketplace.tsx)**: Infrastructure shop (buildings + machinery)
- **[SellModal.tsx](file:///c:/Users/tkogut/.gemini/antigravity/projects/mark-vinicius-cherry-tycoon/frontend/src/components/farm/modals/SellModal.tsx)** (18KB): Retail/wholesale with dynamic pricing breakdown
- **[FinancialReportModal.tsx](file:///c:/Users/tkogut/.gemini/antigravity/projects/mark-vinicius-cherry-tycoon/frontend/src/components/farm/modals/FinancialReportModal.tsx)** (24KB): Season & yearly reports
- **[OnboardingModal.tsx](file:///c:/Users/tkogut/.gemini/antigravity/projects/mark-vinicius-cherry-tycoon/frontend/src/components/farm/modals/OnboardingModal.tsx)**: New player registration
- **PWA**: manifest.json, service worker, install prompt
- **Auth**: Internet Identity via `@dfinity/auth-client`

---

## What's Missing — Prioritized Next Steps

### 🔴 Priority 1: Complete the Core Loop (GDD Sections 1.3, 10)

These are the gaps that prevent the game from being a **complete single-player MVP**.

| # | Gap | GDD Reference | Effort |
|---|:----|:---|:---:|
| 1a | **Season Sub-Phases** – Currently one button advances season. GDD describes 4 sub-phases: Preparation → Growth → Harvest → Sales → Off-season. Each should present different decisions. | §10 | Medium |
| 1b | **Pre-Season Planning UI** – Choose hiring, buy supplies, set strategy before growth starts. | §1.3, §10 | Medium |
| 1c | **Off-Season Actions** – Infrastructure upgrades, planning for next year. Currently upgrades happen any time. | §10 | Low |
| 1d | **Financial Result End-Screen** – Season summary showing net profit, XP gained, reputation change, and "what to focus on next." | §1.3 | Low |

### 🟠 Priority 2: Weather & Risk Events (GDD Section 6)

The game feels static without random events. This is the biggest engagement gap.

| # | Gap | GDD Reference | Effort |
|---|:----|:---|:---:|
| 2a | **Weather Event System** – Backend: generate random events (frost, drought, heatwave, rain) each season based on probability. Frontend: event popup with impact summary. | §6 | High |
| 2b | **Pest & Disease Events** – Random insect/fungi events that destroy yield % unless player invested in sprayers/treatments. | §6 | Medium |
| 2c | **Weather-Based UI Themes** – Change dashboard colors per season (already in frontend backlog). | Frontend backlog | Low |

### 🟡 Priority 3: Competition & Rankings (GDD Section 2)

Required for replayability and the "shared market" feel.

| # | Gap | GDD Reference | Effort |
|---|:----|:---|:---:|
| 3a | **AI Competitor Farms** – Create 3-5 AI farms (types defined in `types.mo`). They make simplified decisions each season, affecting shared market prices. | §2 | High |
| 3b | **Market Price Impact from Total Supply** – Currently saturation is per-player only. Should factor in AI + all players' total supply. | §2 | Medium |
| 3c | **Rankings Display** – Farm value, profit/season, efficiency (profit/ha). Backend already tracks stats; needs leaderboard query + UI. | §2 | Medium |
| 3d | **Wholesale Contracts (Auction)** – Limited contracts that players/AI compete for with offers. | §2 | High |

### 🟢 Priority 4: Geographic Expansion (GDD Section 4)

| # | Gap | GDD Reference | Effort |
|---|:----|:---|:---:|
| 4a | **Interactive Poland Map** – SVG/Leaflet map showing provinces. Only Opole clickable, rest "locked – coming soon." | §4, §8 | High |
| 4b | **Province-Level Economics** – Prices, demand, labor cost actually vary by province (data structure exists, not wired up). | §4.1 | Medium |
| 4c | **Commune Details** – Urban/rural labor type affects costs and market size (partially in `Region` type). | §4.1 | Low |

### 🔵 Priority 5: Football Clubs (GDD Section 3)

This is the "meta-layer" — should only come after the farming loop is mature.

| # | Gap | GDD Reference | Effort |
|---|:----|:---|:---:|
| 5a | **Club Investment Backend** – Buy/sell stakes, set budgets, manage transfers. | §3.2 | Very High |
| 5b | **League Simulation** – Simplified match engine, season results, promotion/relegation. | §3.1 | Very High |
| 5c | **Club Management UI** – Squad view, stadium upgrades, ticket revenue display. | §8 | High |
| 5d | **Farm-to-Club Cash Flow** – Reinvest orchard profits into club shares. | §3.2 | Medium |

### ⚪ Priority 6: Polish & Long-Term Features

| # | Gap | GDD Reference | Effort |
|---|:----|:---|:---:|
| 6a | **Localization (i18n)** – EN/PL/DE with key-value JSON, browser detection, flag switcher. | §7 | Medium |
| 6b | **Processing Facility** – Build jams/juices factory for higher margins (later-game). | §1.1 | Medium |
| 6c | **Seed Selection / Crop Diversification** – Breed varieties, grow apples/plums. | §6 | High |
| 6d | **Insurance System** – Buy crop insurance, payout on weather events. | §6 | Low |
| 6e | **NFT Integration** – Parcels & club shares as NFTs on ICP. | §9 | Very High |
| 6f | **Multi-Canister Architecture** – Split into world/farms/clubs/market/ranking canisters. | §9 | Very High |
| 6g | **DAO Governance** – Player voting to unlock provinces. | §9 | Very High |

---

## Recommended Next Phase: "Phase 5 — Living World"

Based on the gaps above, I recommend the following as the **immediate next development phase** to bring the game from "functional prototype" to "engaging MVP":

```mermaid
graph TD
    A[Phase 5: Living World] --> B[5.1 Weather Events]
    A --> C[5.2 Season Sub-Phases]
    A --> D[5.3 AI Competitors]
    A --> E[5.4 Rankings]
    
    B --> F[Backend: Event generation + impact]
    B --> G[Frontend: Event popup + weather UI themes]
    
    C --> H[Backend: Phase-gated actions]
    C --> I[Frontend: Phase indicator + action menus]
    
    D --> J[Backend: AI decision engine]
    D --> K[Shared market price model]
    
    E --> L[Backend: Leaderboard queries]
    E --> M[Frontend: Rankings panel]
```

### Phase 5.1 — Weather & Events (est. 3–5 days)
1. Add `generateWeatherEvent()` to `game_logic.mo` using season-based probability tables
2. Integrate into `advanceSeason()` — apply yield impact, show event name
3. Add pest/disease events with prevention check (sprayer infrastructure)
4. Frontend: event popup modal, seasonal background color themes

### Phase 5.2 — Season Sub-Phases (est. 2–3 days)
1. Add `SeasonPhase` type: `#Preparation | #Growth | #Harvest | #Sales | #OffSeason`
2. Gate actions by phase (e.g., can only harvest in `#Harvest`, only upgrade in `#OffSeason`)
3. Frontend: phase indicator in header, contextual action buttons

### Phase 5.3 — AI Competitors (est. 5–7 days)
1. Implement `AIFarm` state and `simulateAITurn()` in a new `ai_logic.mo` module
2. 3 AI personalities: Traditionalist (low risk), Innovator (organic), Businessman (wholesale)
3. AI sells into shared market → affects saturation for all players
4. Display AI farm summaries in a "Competitors" tab

### Phase 5.4 — Rankings & End-of-Season Summary (est. 2–3 days)
1. Add `getLeaderboard()` query returning top farms by profit, value, efficiency
2. End-of-season results screen with KPIs, comparison vs. AI, next goals
3. Frontend: Rankings panel accessible from navigation

> [!IMPORTANT]
> **Football Clubs (GDD Section 3)** should remain paused until Phase 5 is stable. The farming core loop needs weather, competition, and progression depth before adding the club meta-layer.

---

## Current Backlog Items Still Open

From [frontend backlog](file:///c:/Users/tkogut/.gemini/antigravity/projects/mark-vinicius-cherry-tycoon/directives/02_frontend_backlog.md):
- [ ] Yield Comparison View (peak production indicator)
- [ ] Market Saturation Visuals (volume penalty display)
- [ ] Historical Price Graph (optional)
- [ ] Weather-Based UI Themes

From [master plan](file:///c:/Users/tkogut/.gemini/antigravity/projects/mark-vinicius-cherry-tycoon/directives/00_master_plan.md):
- [ ] Backend verification of all functions via `dfx canister call`
- [ ] Error handling for seasonal restrictions (toast testing)
- [ ] Code cleanup (remove debug logs)
- [ ] Infrastructure Shop UI (partially done via Marketplace)

> [!TIP]
> The **Marketplace.tsx** component already implements the infrastructure shop, so the "Infrastructure Shop UI" item in the master plan can likely be marked as done after a quick verification pass.
