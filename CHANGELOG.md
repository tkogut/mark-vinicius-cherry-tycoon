# Changelog

All notable changes to Mark Vinicius Cherry Tycoon will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Backend Core (2026-02-07)

#### Type System (`backend/types.mo`)
- Complete type definitions for all game entities
- Geographic system (16 Polish provinces, counties, communes)
- Parcel system with soil properties (type, pH, fertility, permeability, humidity)
- Infrastructure types (social facilities, warehouse, cold storage, tractors, etc.)
- Economic types (inventory, statistics, transactions)
- Weather and season system
- Sports management types (football clubs, leagues)
- AI competitor personalities (Traditionalist, Innovator, Businessman)

#### Game Logic (`backend/game_logic.mo`)
- Yield calculation based on GDD formula: `Base × Soil × pH × Fertility × Infrastructure × Water × Organic`
- Retail pricing: `Base × MarketSize × Quality × Organic` (+40% organic premium)
- Wholesale pricing: `Base × 0.7 × VolumeDiscount`
- Fixed costs calculation (infrastructure maintenance, administration)
- Variable costs calculation (fertilizers, labor, fuel, organic certification)
- Quality score calculation (0-100 based on soil, water, infrastructure, tree age)
- Organic conversion mechanics (2-season requirement)
- Weather impact on yields
- Experience and leveling system

#### Main Canister (`backend/main.mo`)
- Player management:
  - `initializePlayer()` - Create new player with starter farm (0.5ha, 50 trees, 50,000 PLN)
  - `getPlayerFarm()` - Retrieve player farm data
  - `getPlayerStats()` - Get player statistics
- Parcel operations:
  - `harvestCherries()` - Harvest from parcel (calculates yield, updates inventory, adds XP)
  - `waterParcel()` - Increase water level (costs 200 PLN)
  - `fertilizeParcel()` - Increase fertility (uses fertilizer from inventory)
  - `plantTrees()` - Plant new trees (50 PLN per tree)
- Economic system:
  - `sellCherries()` - Sell cherries (retail or wholesale)
  - `getCashBalance()` - Get current cash
  - `getInventory()` - Get inventory (cherries, fertilizers, pesticides)
- Game progression:
  - `advanceSeason()` - Progress to next season (calculates costs, ages trees, depletes water)
  - `upgradeInfrastructure()` - Purchase infrastructure upgrades
- Stable storage for canister upgrades (preupgrade/postupgrade hooks)

### Added - Caffeine AI Integration (2026-02-07)

#### Enhanced Features from Original Caffeine Code
- **Tree Age Modifier** (`backend/game_logic.mo`):
  - Realistic 0-40 year tree lifecycle
  - Year 0: No harvest (newly planted)
  - Year 1-2: Reduced yield (33%, 66%)
  - Year 3-40: Peak production (100%)
  - Year 40+: Trees die (must replant)
- **Organic/Regular Cherry Separation** (`backend/types.mo`):
  - Separate inventory tracking for organic vs regular cherries
  - Proper pricing differentiation (+40% organic premium)
  - Harvest function updated to track certification status
- **Purchase Parcel** (`backend/main.mo`):
  - `purchaseParcel()` - Buy new land (60,000 PLN per hectare)
  - Dynamic parcel generation with random properties
  - Timestamp-based unique parcel IDs
- **Organic Conversion** (`backend/main.mo`):
  - `startOrganicConversion()` - Begin 2-season certification process
  - Tracks conversion progress per parcel
  - Automatic certification after 2 seasons
- **Tree Density Limits**:
  - Maximum 400 trees per hectare (realistic standard)
  - Validation in `plantTrees()` function
  - Prevents unrealistic over-planting
- **Helper Utilities**:
  - `findParcelIndex()` - Efficient parcel lookup
  - Random property generators (soil, pH, fertility)


#### Project Configuration
- `dfx.json` - ICP project configuration
- `test-backend.ps1` - Comprehensive PowerShell test script (20 tests: 10 original + 10 Caffeine features)
- `README.md` - Complete project documentation

### Technical Details

**Starting Conditions:**
- Cash: 50,000 PLN
- Parcel: 0.5 hectares in Opole Province
- Trees: 50 cherry trees (5 years old)
- Soil: Sandy-clay (optimal), pH 6.5, fertility 0.7
- Inventory: 10 fertilizers, 5 pesticides

**Game Balance:**
- Tree planting: 50 PLN per tree (max 400 per hectare)
- Parcel purchase: 60,000 PLN per hectare
- Watering: 200 PLN per action
- Infrastructure: 10,000 PLN base cost
- Seasonal costs: ~5,000-15,000 PLN depending on farm size
- Cherry prices: 10-15 PLN/kg (wholesale), 15-25 PLN/kg (retail)
- Organic premium: +40% price, -20% yield
- Tree lifecycle: 0-40 years (peak at 3-40, die after 40)

**Progression:**
- XP from harvesting: 1 XP per 100kg
- XP from planting: 2 XP per tree
- XP from selling: 1 XP per 1,000 PLN
- XP from upgrades: 50 XP per upgrade
- Level formula: sqrt(XP / 100)

### Changed
- Replaced placeholder GDD storage backend with complete game implementation
- Updated authorization system to use existing access control

### Removed
- Old `GameDesignPlan` and `GameDesignDocument` storage (moved to frontend-only)

## [0.0.0] - 2026-02-07

### Initial State
- Frontend structure with React + TypeScript + Tailwind
- Basic authorization system
- GDD editor interface (frontend)
- Project documentation (GDD, dev reports, specifications)

---

**Next Steps:**
1. Test backend locally with `test-backend.ps1`
2. Implement frontend game dashboard
3. Add Internet Identity authentication
4. Integrate frontend with backend canister
