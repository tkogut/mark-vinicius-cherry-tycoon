# Mark Vinicius Cherry Tycoon – Complete Game Design Document for ICP/Caffeine.ai

Created by **JaPiTo**

---

## Short Pitch

Mark Vinicius Cherry Tycoon is a blockchain-powered farming and football-management tycoon game on the Internet Computer, where you build cherry orchards across Poland, master realistic agricultural economics, and reinvest your profits into local football clubs to dominate regional leagues.

## Game Overview

In Mark Vinicius Cherry Tycoon, you start as a small cherry grower in Opole Province and gradually expand your orchards, infrastructure, and workforce while reacting to weather, pests, fluctuating markets, and competition. Each season you decide how to plant, harvest, store, and sell your cherries in retail or wholesale, and whether to go fully organic for higher prices but lower yields and certification costs. As your farm empire grows, you can buy stakes in local football clubs, upgrade stadiums, trade players, and turn your agricultural success into sporting dominance in a simplified Polish league system, all running on ICP with a mobile-first, browser-based interface.

---

## Executive Summary

**Core Loop:** Buy land → Optimize yields → Sell strategically → Reinvest in farms & football clubs → Compete on shared markets.

**MVP Scope:** Single-player in Opole Province with AI competition. Future: Full Poland map, multiplayer, ICP payments.

**Tech Stack:** Motoko canisters + React/Tailwind frontend (100% mobile responsive).

---

## 1. Core Game: Cherry Orchard Economics

### Phase 1: Location Selection (0.5 ha parcels)

Each parcel (minimum 0.5 ha) has unique parameters. Initially only Opole Province is playable, but the data structure supports all of Poland.

**Parcel Attributes:**

- **Soil Type:**
  - `piaszczysto-gliniasta` (sandy-clay) – optimal for cherries
  - `gliniasta` (clay)
  - `piaszczysta` (sandy)
  - `podmokla` (waterlogged) – worst for cherries
  - Each type has a yield modifier.

- **Soil pH:**
  - Range: 5.5–7.5
  - Optimum: 6.0–7.0 (slightly acidic to neutral)
  - Deviations lower yield and increase fertilizer costs.

- **Permeability:**
  - Scale: 0.0–1.0
  - Affects disease risk and weather event impact.

- **Humidity:**
  - Scale: 0.0–1.0
  - High humidity (>0.8) increases risk of fungal diseases and reduces yield.

- **Fertility (Humus content):**
  - Scale: 0.0–1.0
  - Multiplier for base yield per ha.

- **Labor Distance:**
  - `wioska` (village): cheaper seasonal labor, higher productivity from hardworking locals, but smaller local retail market.
  - `miasto` (city): more expensive labor, lower seasonal productivity, but larger retail market and higher prices.

**Yield Potential (PP) Formula:**

```
PP = Base_Yield_ha × Soil_Modifier × pH_Modifier × Fertility_Modifier × Infrastructure_Modifier
```

- `Base_Yield_ha` = 8–12 tons per ha (depends on cherry variety)

---

### 1.1. What Affects Profits (Revenue)

**Season Cycle:**
- One season = one turn (can be simplified to 4 quarterly turns initially).

**Revenue Sources:**

1. **Retail Sales (local markets):**
   - Price depends on:
     - Size of agglomeration (village < mixed < city)
     - Random demand fluctuations
     - Fruit quality (Quality Score)
   - Formula:
     ```
     Price_kg = Base_Price × Market_Size × Quality_Bonus × Eco_Premium
     ```
   - Higher margin but requires more manual labor (labor cost + fuel).

2. **Wholesale Sales (hurtownie/distribution centers):**
   - Lower price per kg but guaranteed volume.
   - Formula:
     ```
     Price_kg = Base_Price × 0.7 × Volume_Discount
     ```
   - High minimum volume requirements (encourages scaling).
   - Less sensitive to quality.

3. **Quality Bonuses:**
   - Higher quality (good infrastructure, fertilization, sprays, no diseases) = higher retail price and small wholesale bonus.
   - Introduce **Orchard Quality Score (JS):** 0–100 scale, affects price.

4. **Processing (later game phase):**
   - Build small processing facility (juices, jams, liqueurs without brand names).
   - Higher margin but requires CAPEX investment + fixed operating costs.

---

### 1.2. Cost Structure

Costs are divided into **fixed**, **variable**, and **investment (CAPEX)**.

#### Fixed Costs (per season):

- **Infrastructure maintenance:** warehouses, cold storage, social facilities.
- **Equipment maintenance:** tractors, sprayers, shakers.
- **Land and building tax.**
- **Minimum administration cost** (e.g., bookkeeping, basic management).

#### Variable Costs:

- **Fertilizers and plant protection products:**
  - Scaled by area and cultivation intensity.

- **Fuel:**
  - Distance to market/wholesaler + equipment operation.

- **Permanent labor:**
  - Monthly wages per worker.

- **Seasonal labor:**
  - **Village workers:** lower wages, **lower productivity**.
  - **City workers:** higher wages, **higher productivity**.

- **Losses/diseases:**
  - Random event increasing spray costs or reducing yield if player didn't invest in prevention.

#### Investment Costs (CAPEX – unlocks new modifiers):

**Infrastructure expansion:**

- **Social facilities:**
  - +worker morale → higher productivity / lower turnover.

- **Warehouses:**
  - Ability to store fruit and sell later (timing the market).

- **Cold storage:**
  - Reduces post-harvest losses, stabilizes quality.

**Heavy equipment:**

- **Better tractors and shakers:**
  - Less dependency on manual labor, more yield collected before spoilage.

- **Sprayers:**
  - Lower disease risk, higher quality.

---

### 1.3. Game Loop / Player KPIs

**Key Metrics:**

- **Gross margin per ha.**
- **Net profit per season.**
- **Labor productivity (kg/labor-hour).**
- **Orchard Quality Score (JS): 0–100.**
- **Producer reputation** (affects better wholesale/club contracts in the future).

**Game Loop:**

1. **Pre-season:**
   - Choose investments and hiring.

2. **Growth simulation:**
   - Tree growth and random events (weather, diseases).

3. **Sales decision:**
   - Retail vs wholesale, timing of sale.

4. **Financial result:**
   - Update reputation and unlock new options (e.g., first entry into football clubs).

---

## 2. Competition and Rivalry

**Initial competition:** AI-controlled farms, later real players (multiplayer on ICP).

### Elements of Competition:

#### Shared Market:

- Wholesale and retail prices in Opole Province depend on **total cherry supply from all players/AI**.
- High collective harvest → price drop; others' crop failures → player can earn more.

#### Rankings:

- **Farm value ranking.**
- **Season profit ranking.**
- **Efficiency ranking (profit per ha).**

#### Contracts:

- **Limited wholesale contracts** with large distributors.
- Players/AI compete with offers (volume, delivery date, quality).
- **Auction mechanics:** best parameters (quality/volume, delivery stability) lock the contract for several seasons.

#### Competitive Events:

- **"Cherry Festival"** in selected gmina:
  - Special rewards for players who deliver the most high-quality fruit that season.

---

## 3. Football Clubs Investment Module

The game adds a **meta-layer**: player as orchard owner-investor who eventually enters Polish football club ownership.

### 3.1. Football Structure

Inspired by real Polish league pyramid (Ekstraklasa, I Liga, II Liga, etc.), but simplified in-game:

- **Top Liga** (equivalent to Ekstraklasa).
- **Liga 1.**
- **Liga 2** (and lower levels added later).

**MVP:**
- One region: **Opole Province** – local clubs in L2/L3.
- Future: all of Poland (clubs assigned to communies/counties).

### 3.2. Club Investment Mechanics

Similar to tycoon/football manager lite:

**Buying Club Shares:**

- **Minority stake (10–49%):** limited control.
- **Majority stake (50–100%):** full control.

**Club Revenue Sources:**

- **Ticket sales:**
  - Depends on stadium capacity, sporting results, and town size.

- **Player sales:**
  - Simple transfer market model.

- **TV rights and league position bonuses:**
  - Higher league = higher income.

**Club Costs:**

- **Player and staff wages.**
- **Stadium maintenance and upgrades.**
- **Match logistics** (away travel – initially as simple % of budget).

**Player Decisions:**

- **Transfer budget.**
- **Stadium expansion** (capacity, quality) – affects ticket revenue and club reputation.
- **Youth development policy vs buying ready players.**

**Connection to Orchards:**

- **Diversification:** profits from orchards can be reinvested in clubs.
- **Clubs as assets:** club market value grows with success and infrastructure; player can sell shares for profit.

---

## 4. Geographic Layer: Poland Map / Opole Region

**Target:** division into Provinces, counties, communees (single:Province, count, commune ; initially only Opole Province is playable. Sin

### 4.1. Data Structure

- **Level 1: Poland**
  - 16 Provinces (enum type in world model).

- **Level 2: counties**
  - For Opole, load all counties; rest can be placeholders.

- **Level 3: communees**
  - Attributes:
    - Type: `miejska` (urban) / `wiejska` (rural) / `miejsko-wiejska` (mixed)
    - Population
    - "Labor force" indicator
    - "Fruit demand" indicator
    - Football region

**MVP Approach:**

- Full Poland data model exists, but UI allows clicking only Opole Province (rest "locked – coming soon").
- All economic mechanics (prices, demand, competition) calculated at Province level (simplification at start).

---

## 5. Eco (Organic) Farming Mode

Eco mode can be enabled per parcel/farm and introduces a separate economic profile.

### Conversion:

- **2 seasons conversion period** (from conventional to certified organic).

### Benefits:

- **Price premium:**
  - +30–50% on retail and wholesale for certified organic cherries.

- **Eco reputation:**
  - Bonus to contracts with football clubs (they sponsor "green" orchards) and rankings.

- **Lower disease susceptibility in some cases** (no chemicals = natural resistance, but higher random risk overall).

### Drawbacks/Costs:

- **Lower yields:**
  - Approximately -15–25% yield per ha (no intensive fertilization).

- **No chemical sprays:**
  - Only natural treatments allowed (more expensive, less effective; higher risk of losses).

- **Certification costs (yearly):**

| Area        | Annual Cost (PLN net) |
|-------------|-----------------------|
| <5 ha       | 1300–1600            |
| 5–20 ha     | 1800                 |
| 20–50 ha    | 2090                 |
| >50 ha      | Individual pricing   |

- **Random inspections:**
  - Event: random inspector visit; failure can temporarily remove eco status.

**Loop:** choose eco mode → invest in certification → higher margin but higher seasonal risk. Integration with infrastructure (eco-warehouses without chemical contamination).

---

## 6. Advanced Features (Missing from Typical Tycoons)

### Weather and Risk Events:

- **Real-time weather:** drought, spring frost, heavy rain (affects yield, insurance costs).
- **Pests/diseases:** insect invasions, fungi – events destroying 20–100% of yield without monitoring investment.
- **Winter season:** no yields, warehouse heating costs; decisions about diversification (greenhouses?).

### Farm Development:

- **Seed selection:** breed your own cherry varieties (better resistance/quality after 3–5 seasons).
- **Crop diversification:** apples, plums (lower cherry yield = less concentration risk).
- **Ecosystem:** attract beneficial birds/insects (eco bonus, cost of hedgerows).

### Competition and Endgame:

- **Sabotage:** discrete options (e.g., rumors lowering rival's reputation, costs your reputation).
- **Insurance:** buy crop insurance policies (annual premium, payout on weather events).
- **Endgame:** farm/club mergers, ICP marketplace (sell assets to other players).

### ICP-Specific:

- **Cross-game assets:** export cherries to other ICP games (as a resource).
- **DAO governance:** players vote on new Provinces to unlock (ICP stake voting).

---

## 7. Languages and Localization

The game supports **multiple languages from the start:**
- **English, Polish, German** (+ later: Ukrainian, French, Italian, Spanish).

**Mechanics:**

- Language stored per user profile (on-chain in ICP).
- Simple key/value JSON localization:
  ```json
  {
    "farm.yieldPerHa": {
      "en": "Yield per ha",
      "pl": "Plon z ha",
      "de": "Ertrag pro ha"
    }
  }
  ```
- Automatic browser language detection + manual language switcher (flag icons).
- UI ready for future RTL languages (Arabic, Hebrew).

**Impact:** increases retention of international players, prepares for ICP marketplace.

---

## 8. Frontend & Mobile Responsiveness

**Frontend stack:** React + Tailwind CSS, optimized mobile-first, web app integrating with ICP canisters.

### Breakpoints:

- **Mobile (320px+):**
  - Fullscreen map.
  - Bottom navigation bar: **Farm | Market | Clubs | Ranking**.

- **Tablet (768px+):**
  - 2-column layout (map + panel).

- **Desktop (1024px+):**
  - Map sidebar + multi-panel dashboard.

### Mobile Interactions:

- **Touch-friendly buttons** (min 48px touch target).
- **Swipe** between farms/seasons.
- **Pinch-to-zoom** on map.
- **Optimized for 60fps** on mid-range Android phones.

### Key Components:

- **Interactive Poland map** (SVG/Leaflet, touch-friendly).
- **Farm dashboard** (KPI cards, swipe navigation).
- **Market screen** (real-time prices, buy/sell modals).
- **Club management** (squad view, stadium 3D preview).
- **Season simulator** (fast-forward, event popups).

---

## 9. ICP Integration and Tokenomics

### Canisters (On-Chain Storage):

- **world:** geographic and global market data.
- **farms:** player farms, parcels, infrastructure.
- **clubs:** football clubs, players, stadiums.
- **market:** prices, contracts, auctions.
- **ranking:** leaderboards and achievements.

### Future Payments (ICP):

- **Premium access:**
  - More parcels, unlocked Provinces (0.1 ICP/month).

- **Cosmetic upgrades:**
  - Skins for farms and stadiums.

- **Event entry fees:**
  - Tournament participation (0.5 ICP).

### GameFi Extensions:

- **NFTs representing club shares and land parcels.**
- **Tradable assets** between players (via ICP dapps).
- **Yield-bearing farm tokens** (stake for passive income).

### Authentication:

- **Internet Identity** (mobile biometric login).
- **Anonymous mode** (limited features).

---

## 10. Game Loop (One Season = 1 Turn)

### Week 1-10: Preparation
- Hire staff, buy supplies, maintenance.

### Week 11-20: Growth
- Weather events, disease risks, spray decisions.

### Week 21-25: Harvest
- Labor allocation, machinery usage, quality decisions.

### Week 26-30: Sales
- Market analysis, storage vs immediate sell, contract bids.

### Week 31-52: Off-season
- Infrastructure upgrades, player transfers, club investments.

---

## 11. Implementation Roadmap (Iterative)

### Phase 0 – Simple Single-Player in Opole

- **One player farm** in selected gmina of Opole Province.
- **Yield model (PP), costs, retail/wholesale sales**, no competition.
- **No football clubs**, only orchard economics.

### Phase 1 – AI Competition + Rankings

- **Several AI farmers** operating in the same Province.
- **Shared market:** price depends on total supply.
- **Global rankings** (farm value, profit, efficiency).

### Phase 2 – Football Clubs Locally

- **Add several clubs in Opole Province**, fictional but realistically distributed across gminas.
- **Simple regional league**, club investment, basic revenue/cost model.

### Phase 3 – Map Expansion

- **Unlock neighboring Provinces** (e.g., Silesia, Lower Silesia).
- **More clubs**, simple league pyramid for all of Poland.

### Phase 4 – Multiplayer and ICP

- **Player accounts on-chain** (Internet Identity / web3 login).
- **Shared market for many players.**
- **Club tournaments between players**, ICP rewards, GameFi element (carefully, regulatory compliance).

---

## 12. Metrics and Progression

### Farm KPIs:

- **Yield per ha (tons).**
- **Net profit margin (%).**
- **Labor productivity (kg/hour).**
- **Orchard Quality Score (JS): 0–100.**
- **Eco certification status.**

### Club KPIs:

- **League position.**
- **Revenue per match.**
- **Squad market value.**
- **Stadium utilization rate.**

### Player KPIs:

- **Seasons played.**
- **Total net worth (farms + clubs).**
- **Efficiency score (profit/ha).**

### Progression:

- **Unlock new regions, clubs, and mechanics** based on total net worth and achievements.

---

## 13. UI/UX Priorities

1. **Intuitive onboarding** (3-click to first farm).
2. **Mobile-first** (60fps on mid-range phones).
3. **Clear feedback** (every action shows profit impact).
4. **Progress visibility** (unlock roadmap, next goals).
5. **Social proof** (top player farms visible).

---

## 14. Goal for Caffeine.ai

Use this document as the **single source of truth** for:

- Generating **Motoko/Rust canister data models**.
- Designing **React/Tailwind components**.
- Implementing **season simulation logic**.
- Defining **APIs between frontend and canisters**.
- Planning **future ICP/tokenomics extensions**.

This design creates **deep strategic gameplay** with **realistic Polish agricultural economics** while being **fun, accessible, and blockchain-native**.

**Next Step:** Generate Motoko canister skeletons for farms, clubs, market, and world canisters with this exact specification.
