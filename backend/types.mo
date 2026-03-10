// Mark Vinicius Cherry Tycoon - Type Definitions
// All game data structures based on GDD specifications

import Principal "mo:base/Principal";
import Time "mo:base/Time";

module {
  // ============================================================================
  // GEOGRAPHIC TYPES (GDD Section 4)
  // ============================================================================

  public type Province = {
    #Opolskie;
    #Lubelskie;
    #Mazowieckie;
    #Slaskie;
    #Dolnoslaskie;
    #Wielkopolskie;
    #Malopolskie;
    #Lodzkie;
    #Kujawsko_Pomorskie;
    #Pomorskie;
    #Zachodniopomorskie;
    #Warminsko_Mazurskie;
    #Podlaskie;
    #Lubuskie;
    #Swietokrzyskie;
    #Podkarpackie;
  };

  public type CommuneType = {
    #Urban;      // miejska - higher wages, higher productivity, larger market
    #Rural;      // wiejska - lower wages, lower productivity, smaller market
    #Mixed;      // miejsko-wiejska
  };

  public type Region = {
    province: Province;
    county: Text;
    commune: Text;
    communeType: CommuneType;
    population: Nat;
    marketSize: Float;        // 0.0-1.0 multiplier for retail prices
    laborCostMultiplier: Float; // 0.7-1.3 based on urban/rural
  };

  // ============================================================================
  // SOIL AND PARCEL TYPES (GDD Section 1)
  // ============================================================================

  public type SoilType = {
    #SandyClay;    // piaszczysto-gliniasta - optimal for cherries (1.0x yield)
    #Clay;         // gliniasta (0.9x yield)
    #Sandy;        // piaszczysta (0.85x yield)
    #Waterlogged;  // podmokla - worst (0.6x yield)
  };

  public type CherryParcel = {
    id: Text;
    ownerId: Text;
    region: Region;
    
    // Soil properties (GDD Section 1)
    soilType: SoilType;
    pH: Float;              // 5.5-7.5, optimal 6.0-7.0
    fertility: Float;       // 0.0-1.0 humus content
    permeability: Float;    // 0.0-1.0
    humidity: Float;        // 0.0-1.0, high >0.8 increases disease risk
    
    // Parcel details
    size: Float;            // in hectares (minimum 0.5 ha)
    plantedTrees: Nat;
    treeAge: Nat;           // years
    
    // Organic certification (GDD Section 5)
    isOrganic: Bool;
    organicConversionSeason: Nat;  // season when conversion started
    organicCertified: Bool;        // true after 2 seasons
    
    // State
    lastHarvest: Nat;       // season number
    quality: Nat;           // 0-100 Orchard Quality Score (JS)
    waterLevel: Float;      // 0.0-1.0
    lastFertilized: Nat;    // season number
  };

  // ============================================================================
  // INFRASTRUCTURE TYPES (GDD Section 1.2)
  // ============================================================================

  public type InfrastructureType = {
    #SocialFacilities;   // +worker morale, +productivity
    #Warehouse;          // ability to store and time market
    #ColdStorage;        // reduces losses, stabilizes quality
    #Tractor;            // reduces labor dependency
    #GoldenHarvester;    // cinematic massive upgrade (1.05^Level yield)
    #Shaker;             // mechanical harvesting
    #Sprayer;            // lower disease risk, higher quality
    #ProcessingFacility; // juices, jams, liqueurs
  };

  public type Infrastructure = {
    infraType: InfrastructureType;
    level: Nat;          // 1-5, higher = better bonuses
    purchasedSeason: Nat;
    maintenanceCost: Nat; // per season
  };

  // ============================================================================
  // INVENTORY AND ECONOMY (GDD Section 1.1, 1.2)
  // ============================================================================

  public type Inventory = {
    cherries: Nat;           // Regular cherries (kg)
    organicCherries: Nat;    // Certified organic cherries (kg)
    fertilizers: Nat;        // units
    pesticides: Nat;         // units (0 if organic)
    organicTreatments: Nat;  // natural treatments for organic farms
  };

  public type ParcelEconomics = {
    parcelId: Text;
    province: Province;
    revenue: Nat;
    costs: Nat;
    yield: Nat; // kg
    netProfit: Int;
  };

  public type SeasonReport = {
    seasonNumber: Nat;
    seasonName: Season;
    
    // Income Breakdown
    retailRevenue: Nat;
    wholesaleRevenue: Nat;
    otherRevenue: Nat;
    
    // Cost Breakdown
    maintenanceCosts: Nat;
    operationalCosts: Nat; // watering, fertilizing, seeds
    laborCosts: Nat;
    certificationCosts: Nat;
    infrastructureCosts: Nat;
    parcelCosts: Nat;
    
    // Volume Breakdown
    retailVolume: Nat;
    wholesaleVolume: Nat;
    
    // Detailed Breakdown
    parcelData: [ParcelEconomics];
    
    // Summary
    totalRevenue: Nat;
    totalCosts: Nat;
    totalHarvested: Nat;
    netProfit: Int;
  };

  public type YearlyReport = {
    year: Nat; // Derived from (seasonNumber-1)/4 + 1
    totalRevenue: Nat;
    totalCosts: Nat;
    netProfit: Int;
    totalHarvested: Nat;
    
    // Revenue Breakdown
    retailRevenue: Nat;
    wholesaleRevenue: Nat;
    otherRevenue: Nat;
    retailVolume: Nat;
    wholesaleVolume: Nat;

    // Cost Breakdown
    maintenanceCosts: Nat;
    operationalCosts: Nat;
    laborCosts: Nat;
    certificationCosts: Nat;
    infrastructureCosts: Nat;
    parcelCosts: Nat;

    seasonalBreakdown: [SeasonReport]; // The 4 seasons of this year
    bestPerformingParcelId: ?Text;
    bestPerformingProvince: ?Province;
  };

  public type Statistics = {
    totalHarvested: Nat;     // lifetime kg
    totalSold: Nat;          // lifetime kg
    totalRevenue: Nat;       // lifetime PLN
    totalCosts: Nat;         // lifetime PLN
    seasonsPlayed: Nat;
    bestYearlyProfit: Nat;
    averageYieldPerHa: Float;
    seasonalReports: [SeasonReport];
    yearlyReports: [YearlyReport];
  };

  // ============================================================================
  // PLAYER FARM (GDD Section 1)
  // ============================================================================

  public type PlayerFarm = {
    owner: Principal;
    playerId: Text;
    playerName: Text;
    
    // Economy
    cash: Nat;               // PLN
    
    // Progression
    level: Nat;
    experience: Nat;
    reputation: Nat;         // 0-100, affects contracts and club deals
    
    // Assets
    parcels: [CherryParcel];
    infrastructure: [Infrastructure];
    inventory: Inventory;
    statistics: Statistics;
    
    // Game state
    currentSeason: Season;
    currentPhase: SeasonPhase;
    weather: ?WeatherEvent; // [NEW] Active weather event
    seasonNumber: Nat;
    lastActive: Nat;  // Timestamp in nanoseconds (converted from Time.Time)
    hiredLabor: ?LaborType;  // [NEW] Selected labor contract for the season
    inputMarket: InputMarket; // [NEW] Current seasonal prices for supplies
    
    // Sports Center (Phase 6)
    ownedClubs: [Text]; // IDs of owned FootballClubs
  };

  // ============================================================================
  // WEATHER AND SEASONS (GDD Section 6)
  // ============================================================================

  public type Season = {
    #Spring;   // planting, growth starts
    #Summer;   // growth, harvest preparation
    #Autumn;   // maintenance season, cut and prune trees
    #Winter;   // dormant, planning, infrastructure
  };

  public type LaborType = {
    #Village;   // Upfront: 500, Harvest: 1/kg, Yield: 0.9x
    #Standard;  // Upfront: 1500, Harvest: 2/kg, Yield: 1.0x
    #City;      // Upfront: 3000, Harvest: 3/kg, Yield: 1.1x
    #Emergency; // Upfront: 0, Harvest: 4/kg, Yield: 0.8x (Penalty)
  };

  public type SeasonPhase = {
    #Hiring;       // Hire labor, set wages (Spring)
    #Procurement;  // Buy fertilizers, pesticides, seeds (Spring)
    #Investment;   // Plant trees, upgrade infrastructure (Spring)
    #Growth;       // Water, fertilize, weather events (Summer)
    #Harvest;      // Harvest cherries (Summer)
    #Market;       // Sell cherries (Autumn)
    #Storage;      // Process inventory, storage costs (Autumn)
    #CutAndPrune;  // Maintain quality, tree pruning (Winter)
    #Maintenance;  // Machine repair, fixed costs (Winter)
    #Planning;     // Financial review, AI simulation for next year (Winter)
  };

  public type Weather = {
    #Sunny;      // normal growth
    #Rainy;      // +water, +disease risk
    #Frost;      // damage to flowers/young fruit
    #Drought;    // -water, stress
    #Heatwave;   // stress, +water needs
  };

  public type WeatherEvent = {
    weather: Weather;
    severity: Float;  // 0.0-1.0
    season: Nat;
    impact: Text;     // description of what happened
  };

  // ============================================================================
  // MARKET AND TRADING (GDD Section 1.1, 2)
  // ============================================================================

  public type SaleType = {
    #Retail;      // local markets, higher price, manual labor
    #Wholesale;   // distribution centers, lower price, guaranteed volume
    #Processing;  // own processing facility, highest margin
  };

  public type MarketPrice = {
    retailBasePrice: Nat;      // PLN per kg
    wholesaleBasePrice: Nat;   // PLN per kg
    demandMultiplier: Float;   // based on total supply
    seasonMultiplier: Float;   // seasonal variation
    qualityBonus: Float;       // 0.0-0.3 based on quality score
    organicPremium: Float;     // +0.3-0.5 for certified organic
  };

  public type InputMarket = {
    fertilizerPrice: Nat;
    pesticidePrice: Nat;
    organicTreatmentPrice: Nat;
    year: Nat;
  };

  public type Transaction = {
    season: Nat;
    saleType: SaleType;
    quantity: Nat;
    pricePerKg: Nat;
    totalRevenue: Nat;
    timestamp: Time.Time;
  };

  // ============================================================================
  // SPORTS MANAGEMENT (GDD Section 3)
  // ============================================================================

  public type FootballClub = {
    id: Text;
    name: Text;
    region: Region;
    league: League;
    
    // Ownership
    ownerId: ?Text;          // player who owns it
    ownershipPercent: Nat;   // 0-100
    marketValue: Nat;        // PLN
    
    // Performance
    leaguePosition: Nat;
    stadiumCapacity: Nat;
    stadiumQuality: Nat;     // 0-100
    
    // Economy
    ticketRevenue: Nat;      // per season
    tvRights: Nat;           // per season
    playerWages: Nat;        // per season
    
    // Squad
    squadSize: Nat;
    squadValue: Nat;
    youthDevelopment: Nat;   // 0-100 investment level
  };

  public type League = {
    #TopLiga;    // Ekstraklasa equivalent
    #Liga1;
    #Liga2;
    #Liga3;
  };

  // ============================================================================
  // AI COMPETITORS (GDD Section 2)
  // ============================================================================

  public type AIPersonality = {
    #Traditionalist;  // conservative, slow growth, low risk
    #Innovator;       // aggressive organic, high risk/reward
    #Businessman;     // profit-focused, wholesale contracts
  };

  public type AICompetitor = {
    id: Text;
    name: Text;
    personality: AIPersonality;
    totalArea: Float;            // hectares
    productionCapacity: Nat;     // kg per season (base capacity)
    reputation: Nat;             // 0-100
    county: Text;                // e.g. "Głubczyce (GL-02)"
    isOrganic: Bool;             // true if farm is organically certified
    preferredSaleType: Text;     // "retail" | "wholesale"
    lastSeasonProduction: Nat;   // kg simulated last season (0 before first simulation)
  };

  // ============================================================================
  // GAME RESULTS AND ERRORS
  // ============================================================================

  public type Result<T, E> = {
    #Ok: T;
    #Err: E;
  };

  public type GameError = {
    #NotFound: Text;
    #Unauthorized: Text;
    #InsufficientFunds: { required: Nat; available: Nat };
    #BankruptcyRisk: { estimatedCostUntilHarvest: Nat; available: Nat };
    #InvalidOperation: Text;
    #SeasonalRestriction: Text;
    #AlreadyExists: Text;
  };
  public type FarmOverview = {
    playerId: Text;
    playerName: Text;
    cash: Nat;
    level: Nat;
    experience: Nat;
    parcelCount: Nat;
    totalTrees: Nat;
    inventory: Inventory;
    currentSeason: Season;
    currentPhase: SeasonPhase;
    weather: ?WeatherEvent; // [NEW] Active weather event
    seasonNumber: Nat;
    ownedClubs: [Text]; // [NEW] Phase 6 prep
  };

  // ============================================================================
  // PHASE 5.7: NEW MECHANIC RETURN TYPES
  // ============================================================================

  // Result type for negotiateForwardContract
  public type ForwardContractResult = {
    buyerName: Text;
    lockedQuantityKg: Nat;
    pricePerKg: Nat;
    totalRevenue: Nat;
    commitmentFeePaid: Nat;
    saleCategory: Text; // "wholesale" or "retail"
  };

  // Result type for purchaseMarketForecast
  public type ForecastReport = {
    targetSeason: Text;           // e.g. "Summer (Season 5)"
    weatherWarning: Text;         // Plain-text risk description
    priceRangeMin: Nat;           // PLN/kg lower bound for retail
    priceRangeMax: Nat;           // PLN/kg upper bound for retail
    wholesaleRangeMin: Nat;
    wholesaleRangeMax: Nat;
    confidence: Text;             // "Low" | "Medium" | "High"
    forecastCost: Nat;            // Always 2000 PLN
  };
}
