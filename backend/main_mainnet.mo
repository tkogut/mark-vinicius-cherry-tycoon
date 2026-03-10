// Mark Vinicius Cherry Tycoon - Mainnet Backend Canister (EOP)
// Uses Enhanced Orthogonal Persistence (persistent actor)
// Requires dfx >= 0.30.2 with Motoko >= 0.30

import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Float "mo:base/Float";
import Iter "mo:base/Iter";

import Types "types";
import GameLogic "game_logic";
import HiringLogic "hiring_logic";
import EventLogic "event_logic";
import CompetitorLogic "competitor_logic";
import StorageLogic "storage_logic";
import MarketLogic "market_logic";
import AnalyticsLogic "analytics_logic";
import LeaderboardLogic "leaderboard_logic";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import AuctionLogic "auction_logic";

actor CherryTycoon {
  
  
  // Type aliases
  type PlayerFarm = Types.PlayerFarm;
  type CherryParcel = Types.CherryParcel;
  type Infrastructure = Types.Infrastructure;
  type Inventory = Types.Inventory;
  type Statistics = Types.Statistics;
  type Season = Types.Season;
  type Weather = Types.Weather;
  type SaleType = Types.SaleType;
  type SoilType = Types.SoilType;
  type Province = Types.Province;
  type Region = Types.Region;
  type CommuneType = Types.CommuneType;
  type InfrastructureType = Types.InfrastructureType;
  type GameResult<T, E> = Types.Result<T, E>;
  type GameError = Types.GameError;
  type SeasonReport = Types.SeasonReport;
  type YearlyReport = Types.YearlyReport;
  type ParcelEconomics = Types.ParcelEconomics;

  // Authorization system
  let accessControlState = AccessControl.initState();

  public shared ({ caller }) func _initializeAccessControlWithSecret(userSecret : Text) : async () {
    await MixinAuthorization._initializeAccessControlWithSecret(accessControlState, caller, userSecret);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    MixinAuthorization.getCallerUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    MixinAuthorization.assignCallerUserRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    MixinAuthorization.isCallerAdmin(accessControlState, caller);
  };

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Core game data (Players and Farms)
  private var playerFarms = HashMap.HashMap<Principal, PlayerFarm>(
    10,
    Principal.equal,
    Principal.hash
  );

  // Global game state
  var globalSeasonNumber : Nat = 1;
  var baseRetailPrice : Nat = 15; // PLN per kg
  var baseWholesalePrice : Nat = 10; // PLN per kg
  var topPlayersCache : [Types.LeaderboardEntry] = []; // Phase 6.1 Scalability Cache


  // Market Saturation (Phase 4)
  // Map: RegionName -> (TotalKilogramsSold, LastUpdateTimestamp)
  var regionalMarketSaturation = HashMap.HashMap<Text, (Nat, Int)>(
    16, Text.equal, Text.hash
  );

  // Stable storage for upgrades
  stable var stablePlayerFarms : [(Principal, PlayerFarm)] = [];
  stable var stableSaturation : [(Text, (Nat, Int))] = [];
  stable var stableGlobalSeason : Nat = 1;
  stable var stableTopPlayersCache : [Types.LeaderboardEntry] = [];

  // Serialization hooks for transient HashMap variables
  system func preupgrade() {
    stablePlayerFarms := Iter.toArray(playerFarms.entries());
    stableSaturation := Iter.toArray(regionalMarketSaturation.entries());
    stableGlobalSeason := globalSeasonNumber;
    stableTopPlayersCache := topPlayersCache;
  };

  system func postupgrade() {
    for ((k, v) in stablePlayerFarms.vals()) {
      playerFarms.put(k, v);
    };
    for ((k, v) in stableSaturation.vals()) {
      regionalMarketSaturation.put(k, v);
    };
    globalSeasonNumber := stableGlobalSeason;
    topPlayersCache := stableTopPlayersCache;
    stablePlayerFarms := [];
    stableTopPlayersCache := [];
    stableSaturation := [];
  };

  // Helper: Get decayed volume based on time passed
  private func getDecayedVolume(regionName: Text) : Nat {
    let (storedVol, lastTime) = switch (regionalMarketSaturation.get(regionName)) {
      case null { (0, Time.now()) };
      case (?v) { v };
    };

    if (storedVol == 0) return 0;

    let now = Time.now();
    let elapsedNs = now - lastTime;
    // Decay rate: 5,000 kg per hour (approx 1.4 kg per second)
    // 1 hour = 3,600,000,000,000 ns
    let hoursPassed = elapsedNs / 3_600_000_000_000;
    
    // Only decay if at least 1 hour passed to avoid micro-calculations
    if (hoursPassed < 1) return storedVol;

    let decayAmount = Int.abs(hoursPassed) * 5_000;
    
    if (decayAmount >= storedVol) {
      0
    } else {
      Int.abs((storedVol : Int) - decayAmount)
    }
  };

  // Helper: Calculate saturation multiplier (1.0 -> 0.5 as volume increases)
  private func getSaturationMultiplier(regionName: Text) : Float {
    let currentVolume = getDecayedVolume(regionName);

    // Saturation threshold: 100,000 kg per region
    let threshold = 100_000.0;
    
    if (Float.fromInt(currentVolume) >= threshold) {
      0.5 // Maximum saturation penalty
    } else {
      // Linear decay from 1.0 to 0.5
      1.0 - ((Float.fromInt(currentVolume) / threshold) * 0.5)
    }
  };

  // ============================================================================
  // PLAYER MANAGEMENT
  // ============================================================================

  // Initialize a new player
  public shared({ caller }) func initializePlayer(
    playerId: Text,
    playerName: Text
  ) : async GameResult<Text, GameError> {
    
    // SEC-005: Reject anonymous callers
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };

    // SEC-008: Validate inputs
    if (Text.size(playerId) == 0 or Text.size(playerId) > 50) {
      return #Err(#InvalidOperation("playerId must be 1-50 characters"));
    };
    if (Text.size(playerName) == 0 or Text.size(playerName) > 50) {
      return #Err(#InvalidOperation("playerName must be 1-50 characters"));
    };

    // Check if player already exists - removed for stress test reset capability
    // switch (playerFarms.get(caller)) {
    //   case (?_) { return #Err(#AlreadyExists("Player already initialized")) };
    //   case null {};
    // };

    // Create starter parcel in Opole Province
    let starterParcel : CherryParcel = {
      id = "parcel_starter_" # playerId;
      ownerId = playerId;
      region = {
        province = #Opolskie;
        county = "Opole";
        commune = "Opole";
        communeType = #Mixed;
        population = 128000;
        marketSize = 0.8;
        laborCostMultiplier = 1.0;
      };
      soilType = #SandyClay;
      pH = 6.5;
      fertility = 0.7;
      permeability = 0.8;
      humidity = 0.6;
      size = 0.5; // 0.5 hectares
      plantedTrees = 50;
      treeAge = 5;
      isOrganic = false;
      organicConversionSeason = 0;
      organicCertified = false;
      lastHarvest = 0;
      quality = 60;
      waterLevel = 0.5;
      lastFertilized = 0;
    };

    // Create new player farm
    let newFarm : PlayerFarm = {
      owner = caller;
      playerId = playerId;
      playerName = playerName;
      cash = if (playerName == "AgentTest") 1_000_000 else 50000; // Starting cash: 50,000 PLN (Accelerated for testing)
      level = 1;
      experience = 0;
      reputation = 50;
      debt = 0;
      lastAuctionResolutionSeason = 0;
      parcels = [starterParcel];
      infrastructure = [];
      inventory = {
        cherries = 0;
        organicCherries = 0;
        fertilizers = 10;
        pesticides = 5;
        organicTreatments = 0;
      };
      statistics = {
        totalHarvested = 0;
        totalSold = 0;
        totalRevenue = 0;
        totalCosts = 0;
        seasonsPlayed = 0;
        bestYearlyProfit = 0;
        averageYieldPerHa = 0.0;
        seasonalReports = [];
        yearlyReports = [];
      };
      currentSeason = #Spring;
      currentPhase = #Hiring;
      weather = null;
      seasonNumber = 1;
      lastActive = Int.abs(Time.now());
      hiredLabor = null; // Phase 5.7: Must be hired in Spring
      hasCropInsurance = false; // Phase 7.0
      inputMarket = MarketLogic.generateInputPrices(1, Int.abs(Time.now())); // Phase 5.7: Initialize market
      ownedClubs = [];
    };

    playerFarms.put(caller, newFarm);
    #Ok("Player " # playerName # " initialized successfully with starter farm")
  };

  // Phase 5.7: Hire Seasonal Labor
  public shared({ caller }) func hireLabor(
    laborChoice: Text
  ) : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        
        if (farm.currentPhase != #Hiring) {
          return #Err(#SeasonalRestriction("Labor can only be hired during the Hiring phase. Current: " # debug_show(farm.currentPhase)));
        };

        if (farm.hiredLabor != null) {
          return #Err(#InvalidOperation("Labor contract already secured for this season."));
        };

        let (laborType, upfrontCost) = switch (HiringLogic.processHireLabor(laborChoice)) {
          case (#Err(e)) { return #Err(e) };
          case (#Ok(res)) { res };
        };

        if (farm.cash < upfrontCost) {
           return #Err(#InsufficientFunds { required = upfrontCost; available = farm.cash });
        };

        let updatedFarm = {
          farm with
          cash = Int.abs((farm.cash : Int) - (upfrontCost : Int));
          hiredLabor = ?laborType;
        };

        playerFarms.put(caller, updatedFarm);
        #Ok("Successfully hired " # laborChoice # " labor for " # Nat.toText(upfrontCost) # " PLN upfront.")
      };
    }
  };

  // Phase 5.7: Bulk Supply Purchase (#Procurement phase)
  // Buys fertilizers, pesticides, or organic treatments at seasonal market prices with bulk discounts.
  // Bulk tiers: qty >= 20 → 10% off; qty >= 50 → 20% off. Max 100 units per call.
  public shared({ caller }) func purchaseSupplies(
    supplyType: Text,
    quantity: Nat
  ) : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {

        if (farm.currentPhase != #Procurement) {
          return #Err(#SeasonalRestriction("Bulk supply purchases only allowed in Procurement phase. Current: " # debug_show(farm.currentPhase)));
        };

        // Validate supply type
        if (supplyType != "fertilizer" and supplyType != "pesticide" and supplyType != "organicTreatment") {
          return #Err(#InvalidOperation("Invalid supply type. Must be 'fertilizer', 'pesticide', or 'organicTreatment'"));
        };

        // Cap at 100 units per call (overflow guard)
        if (quantity == 0 or quantity > 100) {
          return #Err(#InvalidOperation("Quantity must be between 1 and 100 units"));
        };

        // Resolve base unit price from the seasonal input market
        let baseUnitPrice : Nat = switch (supplyType) {
          case ("fertilizer")       { farm.inputMarket.fertilizerPrice };
          case ("pesticide")        { farm.inputMarket.pesticidePrice };
          case ("organicTreatment") { farm.inputMarket.organicTreatmentPrice };
          case (_)                  { return #Err(#InvalidOperation("Unknown supply type")) };
        };

        // Apply bulk discount (integer math — no Float imports)
        let discountedUnitPrice : Nat =
          if (quantity >= 50) { (baseUnitPrice * 80) / 100 }
          else if (quantity >= 20) { (baseUnitPrice * 90) / 100 }
          else { baseUnitPrice };

        let totalCost = discountedUnitPrice * quantity;

        if (farm.cash < totalCost) {
          return #Err(#InsufficientFunds { required = totalCost; available = farm.cash });
        };

        // Update inventory
        let updatedInventory : Inventory = switch (supplyType) {
          case ("fertilizer")       { { farm.inventory with fertilizers = farm.inventory.fertilizers + quantity } };
          case ("pesticide")        { { farm.inventory with pesticides  = farm.inventory.pesticides  + quantity } };
          case ("organicTreatment") { { farm.inventory with organicTreatments = farm.inventory.organicTreatments + quantity } };
          case (_)                  { farm.inventory };
        };

        let updatedStats = updateSeasonalReport(farm, func(r) {
          { r with
            operationalCosts = r.operationalCosts + totalCost;
            totalCosts       = r.totalCosts + totalCost;
            netProfit        = r.netProfit - (totalCost : Int);
          }
        });

        let updatedFarm = {
          farm with
          cash      = Int.abs((farm.cash : Int) - (totalCost : Int));
          inventory = updatedInventory;
          statistics = { farm.statistics with
            totalCosts = farm.statistics.totalCosts + totalCost;
            seasonalReports = updatedStats.seasonalReports;
          };
        };

        playerFarms.put(caller, updatedFarm);
        let discountLabel =
          if (quantity >= 50) " (20% bulk discount applied)"
          else if (quantity >= 20) " (10% bulk discount applied)"
          else "";
        #Ok("Purchased " # Nat.toText(quantity) # " units of " # supplyType # " for " # Nat.toText(totalCost) # " PLN" # discountLabel)
      };
    }
  };

  // Get player's farm
  public shared query({ caller }) func getPlayerFarm() : async GameResult<PlayerFarm, GameError> {
    switch (playerFarms.get(caller)) {
      case (?farm) { #Ok(farm) };
      case null { #Err(#NotFound("Player not found. Please initialize first.")) };
    }
  };

  // Get condensed farm overview (for UI sidebar)
  public shared query({ caller }) func getFarmOverview() : async GameResult<Types.FarmOverview, GameError> {
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        
        // Calculate total trees
        var trees = 0;
        for (p in farm.parcels.vals()) {
          trees += p.plantedTrees;
        };

        let overview : Types.FarmOverview = {
            playerId = farm.playerId;
            playerName = farm.playerName;
            cash = farm.cash;
            debt = farm.debt;
            level = farm.level;
            experience = farm.experience;
            parcelCount = farm.parcels.size();
            totalTrees = trees;
            inventory = farm.inventory;
            currentSeason = farm.currentSeason;
            currentPhase = farm.currentPhase;
            weather = farm.weather;
            seasonNumber = farm.seasonNumber;
            lastAuctionResolutionSeason = farm.lastAuctionResolutionSeason;
            ownedClubs = farm.ownedClubs;
        };
        
        #Ok(overview)
      };
    }
  };

  // Get details for a specific parcel
  public shared query({ caller }) func getParcelDetails(parcelId: Text) : async GameResult<CherryParcel, GameError> {
     switch (playerFarms.get(caller)) {
       case null { #Err(#NotFound("Player not found")) };
       case (?farm) {
         let (parcelOpt, _) = findParcelIndex(farm.parcels, parcelId);
         switch (parcelOpt) {
           case null { #Err(#NotFound("Parcel not found")) };
           case (?parcel) { #Ok(parcel) };
         };
       };
     }
  };

  // DEBUG ONLY: Reset player state (SEC-003: restricted from anonymous)
  public shared({ caller }) func debugResetPlayer() : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    let _ = playerFarms.remove(caller);
    #Ok("Player reset successfully")
  };

  // SEC-023: debugSetWeather intentionally removed from Mainnet entrypoint.
  // Debug/test functions minimize attack surface in production. Use main.mo (Playground) for testing.

  // Get player statistics
  public shared query({ caller }) func getPlayerStats() : async GameResult<Statistics, GameError> {
    switch (playerFarms.get(caller)) {
      case (?farm) { #Ok(farm.statistics) };
      case null { #Err(#NotFound("Player not found")) };
    }
  };

  // Proactive check for bankruptcy risk (Query for UI)
  public query ({ caller }) func checkStability() : async GameResult<{ estimatedCost: Nat; available: Nat; isRisky: Bool }, GameError> {
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        // Check for organic parcels
        var hasOrganic = false;
        for (p in farm.parcels.vals()) {
          if (p.isOrganic) { hasOrganic := true };
        };

        let seasonsRemaining = GameLogic.estimateSeasonsUntilHarvest(farm.currentSeason);
        let seasonalCost = GameLogic.estimateSeasonalCosts(farm.parcels, farm.infrastructure, hasOrganic);
        let harvestCost = GameLogic.estimateHarvestCosts(farm.parcels, farm.infrastructure);
        
        let totalNeeded = (seasonsRemaining * seasonalCost) + harvestCost;
        let isRisky = farm.cash < totalNeeded;

        #Ok({
          estimatedCost = totalNeeded;
          available = farm.cash;
          isRisky = isRisky;
        })
      };
    }
  };

  // ============================================================================
  // PARCEL OPERATIONS
  // ============================================================================

  // Harvest cherries from a parcel
  public shared({ caller }) func harvestCherries(parcelId: Text) : async GameResult<Nat, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        
        // Phase 5.1: Phase gate — harvest only in Harvest phase
        if (farm.currentPhase != #Harvest) {
          return #Err(#SeasonalRestriction("Harvest only allowed in Harvest phase. Current: " # debug_show(farm.currentPhase)));
        };

        // Find the parcel
        let (_, indexOpt) = findParcelIndex(farm.parcels, parcelId);

        switch (indexOpt) {
          case null { return #Err(#NotFound("Parcel not found")) };
          case (?index) {
            let parcel = farm.parcels[index];
            
            // Check if trees are planted
            if (parcel.plantedTrees == 0) {
              return #Err(#InvalidOperation("No trees planted on this parcel"));
            };
            
            // Check if it's harvest season (Summer only for cherries)
            if (farm.currentSeason != #Summer) {
              return #Err(#SeasonalRestriction("Cherries can only be harvested in Summer"));
            };
            
            // Check if already harvested this season
            if (parcel.lastHarvest == farm.seasonNumber) {
              return #Err(#SeasonalRestriction("Parcel already harvested this season"));
            };

            // Calculate yield (returns null if trees are dead)
            let harvestedAmountOpt = GameLogic.calculateYieldPotential(
              parcel,
              farm.infrastructure
            );

            let baseHarvestedAmount = switch (harvestedAmountOpt) {
              case null { return #Err(#InvalidOperation("Trees are too old (>40 years) and have died. Please replant.")) };
              case (?amount) { amount };
            };

            // Phase 5.1: Apply active weather impact on yield
            let weatherAdjustedAmount = switch (farm.weather) {
              case (null) { baseHarvestedAmount };
              case (?w) { GameLogic.applyWeatherImpact(baseHarvestedAmount, w.weather, w.severity, w.mitigated) };
            };

            // Phase 5.7: Apply Labor Yield Multiplier (Int math to avoid Float module errors)
            let harvestedAmount : Nat = HiringLogic.applyHarvestLaborMultiplier(weatherAdjustedAmount, farm.hiredLabor);

            // Update parcel
            let updatedParcels = Array.tabulate<CherryParcel>(
              farm.parcels.size(),
              func(i: Nat) : CherryParcel {
                if (i == index) {
                  {
                    parcel with
                    lastHarvest = farm.seasonNumber;
                    quality = GameLogic.calculateQualityScore(parcel, farm.infrastructure);
                  }
                } else {
                  farm.parcels[i]
                }
              }
            );

            // Update inventory - track organic vs regular separately
            let updatedInventory = if (parcel.organicCertified) {
              {
                farm.inventory with
                organicCherries = farm.inventory.organicCherries + harvestedAmount;
              }
            } else {
              {
                farm.inventory with
                cherries = farm.inventory.cherries + harvestedAmount;
              }
            };

            // Phase 5.7: Calculate labor cost based on contract
            let laborCostPerKg : Nat = HiringLogic.calculateHarvestLaborCost(farm.hiredLabor);
            let laborCost = Int.abs(harvestedAmount) * laborCostPerKg;
            
            let updatedStats = updateSeasonalReport(farm, func(r) {
              let updatedReport = { r with
                laborCosts = r.laborCosts + laborCost;
                totalCosts = r.totalCosts + laborCost;
                totalHarvested = r.totalHarvested + harvestedAmount;
                netProfit = r.netProfit - (laborCost : Int);
              };
              updateParcelEconomics(updatedReport, parcelId, parcel.region.province, func(p) {
                { p with 
                  yield = p.yield + harvestedAmount;
                  costs = p.costs + laborCost;
                  netProfit = p.netProfit - (laborCost : Int);
                }
              })
            });

            // Add experience
            let xpGain = GameLogic.calculateExperienceGain("harvest", harvestedAmount);
            let newXp = farm.experience + xpGain;
            let newLevel = GameLogic.getLevelFromExperience(newXp);

            let updatedFarm = {
              farm with
              parcels = updatedParcels;
              inventory = updatedInventory;
              cash = if (farm.cash >= laborCost) Int.abs((farm.cash : Int) - (laborCost : Int)) else 0;
              statistics = { updatedStats with
                totalHarvested = farm.statistics.totalHarvested + harvestedAmount;
                totalCosts = farm.statistics.totalCosts + laborCost;
              };
              experience = newXp;
              level = newLevel;
            };

            playerFarms.put(caller, updatedFarm);
            #Ok(harvestedAmount)
          };
        };
      };
    }
  };

  // Water a parcel
  public shared({ caller }) func waterParcel(parcelId: Text) : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        
        // Phase 5.7: Phase gate — watering allowed in Procurement, Investment, or Growth to combat early droughts
        if (farm.currentPhase != #Procurement and farm.currentPhase != #Investment and farm.currentPhase != #Growth) {
          return #Err(#SeasonalRestriction("Watering allowed in Procurement, Investment, or Growth phases. Current: " # debug_show(farm.currentPhase)));
        };

        let (_, indexOpt) = findParcelIndex(farm.parcels, parcelId);

        switch (indexOpt) {
          case null { return #Err(#NotFound("Parcel not found")) };
          case (?index) {
            let parcel = farm.parcels[index];
            
            // Cost of watering
            let waterCost = 200; // PLN
            let laborShare = 150;
            let operationalShare = 50;
            
            // Check for bankruptcy risk
            switch (await checkBankruptcyRisk(farm, waterCost)) {
              case (#Err(e)) { return #Err(e) };
              case (#Ok(())) {};
            };

            // Update parcel water level
            let newWaterLevel = if (parcel.waterLevel + 0.3 > 1.0) { 1.0 } else { parcel.waterLevel + 0.3 };
            
            let updatedParcels = Array.tabulate<CherryParcel>(
              farm.parcels.size(),
              func(i: Nat) : CherryParcel {
                if (i == index) {
                  { parcel with waterLevel = newWaterLevel }
                } else {
                  farm.parcels[i]
                }
              }
            );

            let updatedStats = updateSeasonalReport(farm, func(r) {
              let updatedReport = { r with 
                laborCosts = r.laborCosts + laborShare;
                operationalCosts = r.operationalCosts + operationalShare;
                totalCosts = r.totalCosts + waterCost;
                netProfit = r.netProfit - (waterCost : Int);
              };
              updateParcelEconomics(updatedReport, parcelId, parcel.region.province, func(p) {
                { p with 
                  costs = p.costs + waterCost;
                  netProfit = p.netProfit - (waterCost : Int);
                }
              })
            });

            let updatedFarm = {
              farm with
              parcels = updatedParcels;
              cash = Int.abs((farm.cash : Int) - (waterCost : Int));
              statistics = { farm.statistics with 
                totalCosts = farm.statistics.totalCosts + waterCost;
                seasonalReports = updatedStats.seasonalReports;
              };
            };

            playerFarms.put(caller, updatedFarm);
            #Ok("Parcel watered successfully")
          };
        };
      };
    }
  };

  // Fertilize a parcel
  public shared({ caller }) func fertilizeParcel(
    parcelId: Text,
    _fertilizerType: Text
  ) : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        
        // Check if has fertilizers
        if (farm.inventory.fertilizers == 0) {
          return #Err(#InvalidOperation("No fertilizers in inventory"));
        };

        // Seasonal Check: Fertilization only effective in Spring (growth) or Autumn (post-harvest)
        if (farm.currentSeason != #Spring and farm.currentSeason != #Autumn) {
          return #Err(#SeasonalRestriction("Fertilization is only effective in Spring or Autumn"));
        };
        
        // TODO: Future enhancement - use _fertilizerType quality parameter to influence productivity

        let (_, indexOpt) = findParcelIndex(farm.parcels, parcelId);

        switch (indexOpt) {
          case null { return #Err(#NotFound("Parcel not found")) };
          case (?index) {
            let parcel = farm.parcels[index];
            
            // Increase fertility slightly
            let newFertility = if (parcel.fertility + 0.1 > 1.0) { 1.0 } else { parcel.fertility + 0.1 };
            
            let updatedParcels = Array.tabulate<CherryParcel>(
              farm.parcels.size(),
              func(i: Nat) : CherryParcel {
                if (i == index) {
                  {
                    parcel with
                    fertility = newFertility;
                    lastFertilized = farm.seasonNumber;
                  }
                } else {
                  farm.parcels[i]
                }
              }
            );

            let updatedInventory = {
              farm.inventory with
              fertilizers = Int.abs((farm.inventory.fertilizers : Int) - (1 : Int));
            };

            // Check for bankruptcy risk (Labor + Fertilizer)
            let laborShare = 300;
            let operationalShare = 200;
            let totalCost = laborShare + operationalShare;

            switch (await checkBankruptcyRisk(farm, totalCost)) {
              case (#Err(e)) { return #Err(e) };
              case (#Ok(())) {};
            };

            let updatedStats = updateSeasonalReport(farm, func(r) {
              let updatedReport = { r with 
                laborCosts = r.laborCosts + laborShare;
                operationalCosts = r.operationalCosts + operationalShare;
                totalCosts = r.totalCosts + totalCost;
                netProfit = r.netProfit - (totalCost : Int);
              };
              updateParcelEconomics(updatedReport, parcelId, parcel.region.province, func(p) {
                { p with 
                  costs = p.costs + totalCost;
                  netProfit = p.netProfit - (totalCost : Int);
                }
              })
            });

            let updatedFarm = {
              farm with
              parcels = updatedParcels;
              inventory = updatedInventory;
              cash = if (farm.cash >= totalCost) Int.abs((farm.cash : Int) - (totalCost : Int)) else 0;
              statistics = { updatedStats with 
                totalCosts = farm.statistics.totalCosts + totalCost;
              };
            };

            playerFarms.put(caller, updatedFarm);
            #Ok("Parcel fertilized successfully")
          };
        };
      };
    }
  };

  // Start organic conversion for a parcel (Takes 2 seasons)
  public shared({ caller }) func startOrganicConversion(
    parcelId: Text
  ) : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        
        // Phase 5.6: Phase gate — organic conversion only in Planning or Investment phase
        if (farm.currentPhase != #Planning and farm.currentPhase != #Investment) {
          return #Err(#SeasonalRestriction("Organic conversion only allowed in Planning or Investment phase. Current: " # debug_show(farm.currentPhase)));
        };

        let (_, indexOpt) = findParcelIndex(farm.parcels, parcelId);

        switch (indexOpt) {
          case null { return #Err(#NotFound("Parcel not found")) };
          case (?index) {
            let parcel = farm.parcels[index];
            
            if (parcel.isOrganic or parcel.organicCertified) {
              return #Err(#InvalidOperation("Parcel is already organic or in conversion"));
            };

            // Certification cost (GDD Section 5)
            let conversionCost = 5000; // PLN initial fee
            
            // Check for bankruptcy risk
            switch (await checkBankruptcyRisk(farm, conversionCost)) {
              case (#Err(e)) { return #Err(e) };
              case (#Ok(())) {};
            };

            let updatedParcels = Array.tabulate<CherryParcel>(
              farm.parcels.size(),
              func(i: Nat) : CherryParcel {
                if (i == index) {
                  {
                    parcel with
                    isOrganic = true;
                    organicConversionSeason = farm.seasonNumber;
                    organicCertified = false;
                  }
                } else {
                  farm.parcels[i]
                }
              }
            );

            let updatedStats = updateSeasonalReport(farm, func(r) {
              let updatedReport = { r with 
                certificationCosts = r.certificationCosts + conversionCost;
                totalCosts = r.totalCosts + conversionCost;
                netProfit = r.netProfit - (conversionCost : Int);
              };
              updateParcelEconomics(updatedReport, parcelId, parcel.region.province, func(p) {
                { p with 
                  costs = p.costs + conversionCost;
                  netProfit = p.netProfit - (conversionCost : Int);
                }
              })
            });

            let updatedFarm = {
              farm with
              parcels = updatedParcels;
              cash = Int.abs((farm.cash : Int) - (conversionCost : Int));
              statistics = { updatedStats with 
                totalCosts = farm.statistics.totalCosts + conversionCost;
              };
            };

            playerFarms.put(caller, updatedFarm);
            #Ok("Organic conversion started successfully (Certification takes 2 seasons)")
          };
        };
      };
    }
  };

  // Phase 5.7: Inspect and Repair (#Maintenance phase)
  // Player pays to service all infrastructure and prevent degradation.
  // Skipping this phase causes advancePhase to silently downgrade infra levels.
  public shared({ caller }) func inspectAndRepair() : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {

        if (farm.currentPhase != #Maintenance) {
          return #Err(#SeasonalRestriction("Inspection and repair only allowed in Maintenance phase. Current: " # debug_show(farm.currentPhase)));
        };

        // Repair cost: 500 PLN per infrastructure level point
        var totalRepairCost : Nat = 0;
        for (infra in farm.infrastructure.vals()) {
          totalRepairCost += infra.level * 500;
        };

        // Minimum charge (even with no infrastructure, still a basic inspection)
        let finalCost = if (totalRepairCost == 0) { 500 } else { totalRepairCost };

        if (farm.cash < finalCost) {
          return #Err(#InsufficientFunds { required = finalCost; available = farm.cash });
        };

        // Mark infrastructure as maintained — refresh maintenanceCost sentinel
        let maintainedInfra = Array.map<Infrastructure, Infrastructure>(farm.infrastructure, func(i) {
          { i with maintenanceCost = i.level * 100 }
        });

        let updatedStats = updateSeasonalReport(farm, func(r) {
          { r with
            maintenanceCosts = r.maintenanceCosts + finalCost;
            totalCosts       = r.totalCosts + finalCost;
            netProfit        = r.netProfit - (finalCost : Int);
          }
        });

        let updatedFarm = {
          farm with
          cash           = Int.abs((farm.cash : Int) - (finalCost : Int));
          infrastructure = maintainedInfra;
          statistics     = { farm.statistics with
            totalCosts = farm.statistics.totalCosts + finalCost;
            seasonalReports = updatedStats.seasonalReports;
          };
        };

        playerFarms.put(caller, updatedFarm);
        let infraCount = farm.infrastructure.size();
        #Ok("Infrastructure inspection complete. Repaired " # Nat.toText(infraCount) # " asset(s) for " # Nat.toText(finalCost) # " PLN. Degradation prevented.")
      };
    }
  };

  // Phase 5.6: Cut and Prune to maintain quality
  public shared({ caller }) func cutAndPrune(
    parcelId: Text
  ) : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        if (farm.currentPhase != #CutAndPrune) {
          return #Err(#SeasonalRestriction("Pruning only allowed in CutAndPrune phase. Current: " # debug_show(farm.currentPhase)));
        };

        let (_, indexOpt) = findParcelIndex(farm.parcels, parcelId);
        switch (indexOpt) {
          case null { return #Err(#NotFound("Parcel not found")) };
          case (?index) {
            let parcel = farm.parcels[index];
            
            let pruneCost = 100 * parcel.plantedTrees; // 100 PLN per tree
            if (farm.cash < pruneCost) {
               return #Err(#InsufficientFunds { required = pruneCost; available = farm.cash });
            };

            let newQuality = if (parcel.quality < 100) {
              if (parcel.quality + 10 > 100) 100 else parcel.quality + 10
            } else { parcel.quality };

            let updatedParcel = {
              parcel with
              quality = newQuality;
            };
            
            let updatedParcels = Array.tabulate<CherryParcel>(farm.parcels.size(), func(i: Nat) : CherryParcel {
                if (i == index) { updatedParcel } else { farm.parcels[i] }
            });

            let updatedFarm = {
              farm with
              cash = Int.abs((farm.cash : Int) - (pruneCost : Int));
              parcels = updatedParcels;
            };

            playerFarms.put(caller, updatedFarm);
            #Ok("Parcel pruned successfully for " # Nat.toText(pruneCost) # " PLN. Quality improved.")
          };
        };
      };
    };
  };

  // Plant trees on a parcel
  public shared({ caller }) func plantTrees(
    parcelId: Text,
    quantity: Nat
  ) : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        
        // Phase 5.6: Phase gate — planting only in Investment phase
        if (farm.currentPhase != #Investment) {
          return #Err(#SeasonalRestriction("Planting only allowed in Investment phase. Current: " # debug_show(farm.currentPhase)));
        };

        let costPerTree = 50; // PLN
        let totalCost = quantity * costPerTree;
        
        // Check for bankruptcy risk
        switch (await checkBankruptcyRisk(farm, totalCost)) {
          case (#Err(e)) { return #Err(e) };
          case (#Ok(())) {};
        };
        
        let (_, indexOpt) = findParcelIndex(farm.parcels, parcelId);

        switch (indexOpt) {
          case null { return #Err(#NotFound("Parcel not found")) };
          case (?index) {
            let parcel = farm.parcels[index];
            
            // Check tree density limit: 400 trees per hectare (from GDD)
            let maxTrees = Int.abs(Float.toInt(parcel.size * 400.0));
            let currentTrees = parcel.plantedTrees;
            
            if (currentTrees + quantity > maxTrees) {
              return #Err(#InvalidOperation("Exceeds maximum tree density (400 trees per hectare). Max: " # Nat.toText(maxTrees) # ", Current: " # Nat.toText(currentTrees)));
            };
            
            let updatedParcels = Array.tabulate<CherryParcel>(
              farm.parcels.size(),
              func(i: Nat) : CherryParcel {
                if (i == index) {
                  {
                    parcel with
                    plantedTrees = parcel.plantedTrees + quantity;
                  }
                } else {
                  farm.parcels[i]
                }
              }
            );

            // Add experience
            let xpGain = GameLogic.calculateExperienceGain("plant", quantity);
            let newXp = farm.experience + xpGain;
            let newLevel = GameLogic.getLevelFromExperience(newXp);

            let updatedSeasonStats = updateSeasonalReport(farm, func(r) {
              let updatedReport = { r with 
                operationalCosts = r.operationalCosts + totalCost;
                totalCosts = r.totalCosts + totalCost;
                netProfit = r.netProfit - (totalCost : Int);
              };
              updateParcelEconomics(updatedReport, parcelId, parcel.region.province, func(p) {
                { p with 
                  costs = p.costs + totalCost;
                  netProfit = p.netProfit - (totalCost : Int);
                }
              })
            });

            let updatedFarm = {
              farm with
              parcels = updatedParcels;
              cash = Int.abs((farm.cash : Int) - (totalCost : Int));
              statistics = { farm.statistics with 
                totalCosts = farm.statistics.totalCosts + totalCost;
                seasonalReports = updatedSeasonStats.seasonalReports;
              };
              experience = newXp;
              level = newLevel;
            };

            playerFarms.put(caller, updatedFarm);
            #Ok("Planted " # Nat.toText(quantity) # " trees successfully")
          };
        };
      };
    }
  };

  // ============================================================================
  // ECONOMIC SYSTEM
  // ============================================================================

  // Sell cherries
  public shared({ caller }) func sellCherries(
    quantity: Nat,
    saleType: Text
  ) : async GameResult<Nat, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    // SEC-007: Validate saleType
    if (saleType != "retail" and saleType != "wholesale") {
      return #Err(#InvalidOperation("Invalid sale type: " # saleType # ". Must be 'retail' or 'wholesale'"));
    };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {

        let totalAvailable = farm.inventory.cherries + farm.inventory.organicCherries;
        if (totalAvailable < quantity) {
          return #Err(#InvalidOperation("Insufficient cherries in inventory. Total available: " # Nat.toText(totalAvailable)));
        };

        // Determine Region (Use first parcel's region as primary market)
        let regionName = if (farm.parcels.size() > 0) {
          farm.parcels[0].region.province
        } else {
          #Opolskie // Default fallback
        };
        // Convert variant to text for map key
        let regionKey = debug_show(regionName);

        // Calculate Saturation Multiplier
        let saturationMult = getSaturationMultiplier(regionKey);

        // Phase 5.2: Shared market supply — AI competitors affect pricing
        // SEC: entropy is Nat (Int.abs applied), bounded (3 AIs only)
        let marketEntropy = Int.abs(Time.now()) % 1_000_000_000;
        let aiSupplyKg = CompetitorLogic.getAITotalSupply(farm.currentSeason, marketEntropy);
        let seasonDemand = CompetitorLogic.getSeasonDemand(farm.currentSeason);
        // marketMult ∈ [0.50, 1.0] — price floor enforced per SECURITY_DIRECTIVE_V1 §2.5
        let marketMult = CompetitorLogic.computeMarketMultiplier(quantity, aiSupplyKg, seasonDemand);

        // Check for organic certification (per GDD: if any harvested parcel was organic, or based on inventory)
        // For simplicity, we check if the player has any organic-certified parcels
        var hasOrganicCertified = false;
        for (p in farm.parcels.vals()) {
           if (p.organicCertified) { hasOrganicCertified := true };
        };

        // Calculate price based on sale type, saturation, and AI market competition
        let revenue = if (saleType == "retail") {
          // Calculate average quality score across all parcels
          var totalQuality = 0;
          for (p in farm.parcels.vals()) {
            totalQuality += GameLogic.calculateQualityScore(p, farm.infrastructure);
          };
          let avgQuality = if (farm.parcels.size() > 0) {
            totalQuality / farm.parcels.size()
          } else { 50 };
          
          // Apply AI market multiplier on top of saturation
          let basePrice = GameLogic.calculateRetailPrice(
            baseRetailPrice,
            if (farm.parcels.size() > 0) farm.parcels[0].region.marketSize else 0.8,
            avgQuality,
            hasOrganicCertified,
            saturationMult
          );
          
          // Calculate total float revenue to preserve precision across bulk sales
          let totalFloatRevenue = basePrice * marketMult * Float.fromInt(quantity);
          let computedRevenue = Int.abs(Float.toInt(totalFloatRevenue));
          if (computedRevenue < quantity) quantity else computedRevenue // Floor: 1 PLN/kg
        } else {
          let basePrice = GameLogic.calculateWholesalePrice(
            baseWholesalePrice,
            quantity,
            60, // average quality
            saturationMult
          );
          let totalFloatRevenue = basePrice * marketMult * Float.fromInt(quantity);
          let computedRevenue = Int.abs(Float.toInt(totalFloatRevenue));
          if (computedRevenue < quantity) quantity else computedRevenue // Floor: 1 PLN/kg
        };

        // Update Market Saturation (add quantity sold to decayed volume)
        let decayedVol = getDecayedVolume(regionKey);
        let newVolume = decayedVol + quantity;
        regionalMarketSaturation.put(regionKey, (newVolume, Time.now()));

        // Update inventory and statistics
        var remainingToDeduct = quantity;
        var newOrganic = farm.inventory.organicCherries;
        var newRegular = farm.inventory.cherries;

        // Prioritize organic if selling as organic, otherwise prioritize regular
        if (hasOrganicCertified) {
           if (newOrganic >= remainingToDeduct) {
              newOrganic := Int.abs((newOrganic : Int) - (remainingToDeduct : Int));
              remainingToDeduct := 0;
           } else {
              remainingToDeduct := Int.abs((remainingToDeduct : Int) - (newOrganic : Int));
              newOrganic := 0;
              newRegular := Int.abs((newRegular : Int) - (remainingToDeduct : Int));
           };
        } else {
           if (newRegular >= remainingToDeduct) {
              newRegular := Int.abs((newRegular : Int) - (remainingToDeduct : Int));
              remainingToDeduct := 0;
           } else {
              remainingToDeduct := Int.abs((remainingToDeduct : Int) - (newRegular : Int));
              newRegular := 0;
              newOrganic := Int.abs((newOrganic : Int) - (remainingToDeduct : Int));
           };
        };

        let updatedInventory = {
          farm.inventory with
          cherries = newRegular;
          organicCherries = newOrganic;
        };

        let updatedStats = {
          farm.statistics with
          totalSold = farm.statistics.totalSold + quantity;
          totalRevenue = farm.statistics.totalRevenue + revenue;
        };

        // Add experience
        let xpGain = GameLogic.calculateExperienceGain("sell", revenue);
        let newXp = farm.experience + xpGain;
        let newLevel = GameLogic.getLevelFromExperience(newXp);

        let isRetail = saleType == "retail";
        let updatedSeasonStats = updateSeasonalReport(farm, func(r) {
          let newRetail = if (isRetail) r.retailRevenue + revenue else r.retailRevenue;
          let newWholesale = if (not isRetail) r.wholesaleRevenue + revenue else r.wholesaleRevenue;
          let newRetailVol = if (isRetail) r.retailVolume + quantity else r.retailVolume;
          let newWholesaleVol = if (not isRetail) r.wholesaleVolume + quantity else r.wholesaleVolume;
          { r with 
            retailRevenue = newRetail;
            wholesaleRevenue = newWholesale;
            retailVolume = newRetailVol;
            wholesaleVolume = newWholesaleVol;
            totalRevenue = r.totalRevenue + revenue;
            netProfit = r.netProfit + (revenue : Int);
          }
        });

        let updatedFarm = {
          farm with
          inventory = updatedInventory;
          statistics = { updatedStats with 
            seasonalReports = updatedSeasonStats.seasonalReports;
          };
          cash = farm.cash + revenue;
          experience = newXp;
          level = newLevel;
        };

        playerFarms.put(caller, updatedFarm);
        #Ok(revenue)
      };
    }
  };

  // Get cash balance
  public shared query({ caller }) func getCashBalance() : async GameResult<Nat, GameError> {
    switch (playerFarms.get(caller)) {
      case (?farm) { #Ok(farm.cash) };
      case null { #Err(#NotFound("Player not found")) };
    }
  };

  // Get inventory
  public shared query({ caller }) func getInventory() : async GameResult<Inventory, GameError> {
    switch (playerFarms.get(caller)) {
      case (?farm) { #Ok(farm.inventory) };
      case null { #Err(#NotFound("Player not found")) };
    }
  };

  // ============================================================================
  // GAME PROGRESSION
  // ============================================================================

  // Internal helper to advance to next season (Called from advancePhase)
  private func _advanceSeasonInternal(
    farm: PlayerFarm,
    caller: Principal,
    nextPhase: Types.SeasonPhase,
    nextSeason: Types.Season
  ) : async GameResult<Text, GameError> {
    
    // Check for organic parcels and update certification status
    var anyOrganicCount = 0;
    let updatedParcels = Array.tabulate<CherryParcel>(
      farm.parcels.size(),
      func(i: Nat) : CherryParcel {
        let p = farm.parcels[i];
        
        // Check if certification is complete (2 seasons)
        let isCertifiedNow = if (p.isOrganic and not p.organicCertified) {
          if (farm.seasonNumber >= p.organicConversionSeason + 1) { true }
          else { false };
        } else { p.organicCertified };

        if (p.isOrganic or isCertifiedNow) { anyOrganicCount += 1 };

        // Age trees by 1 year every 4 seasons
        let shouldAgeTrees = (farm.seasonNumber + 1) % 4 == 0;
        let newAge = if (shouldAgeTrees) { p.treeAge + 1 } else { p.treeAge };

        { 
          p with 
          organicCertified = isCertifiedNow;
          treeAge = newAge;
          waterLevel = p.waterLevel * 0.7; // water depletes
        }
      }
    );

    let hasAnyOrganic = anyOrganicCount > 0;

    // Calculate costs for the season
    let fixedCosts = GameLogic.calculateFixedCosts(farm.infrastructure);
    // SEC-004: Guard against empty parcels array
    let parcelRegion = if (updatedParcels.size() > 0) {
      updatedParcels[0].region
    } else {
      { province = #Opolskie; county = "Opole"; commune = "Opole"; communeType = #Mixed : Types.CommuneType; population = 120000; marketSize = 0.8; laborCostMultiplier = 1.0 }
    };
    let variableCosts = GameLogic.calculateVariableCosts(
      updatedParcels,
      parcelRegion,
      hasAnyOrganic,
      farm.infrastructure
    );
    // Total costs per season is annual / 4
    let totalCosts = (fixedCosts + variableCosts) / 4;

    if (farm.cash < totalCosts) {
      return #Err(#InsufficientFunds { required = totalCosts; available = farm.cash });
    };

    // Spoilage Logic (Phase 5.7)
    // Delegate to new StorageLogic module for labor handling impact
    var spoiledCherries : Nat = 0;
    
    if (farm.currentSeason == #Autumn) {
       // Check for ColdStorage or Warehouse reducing base rate
       var baseRate : Nat = 15; // default 15%
       for (infra in farm.infrastructure.vals()) {
         if (infra.infraType == #ColdStorage) { baseRate := 2 }
         else if (infra.infraType == #Warehouse and baseRate > 5) { baseRate := 8 };
       };
       let handlingQuality = HiringLogic.getHandlingQuality(farm.hiredLabor);
       let spoilageRate = StorageLogic.calculateSpoilage(baseRate, handlingQuality);
       spoiledCherries := (farm.inventory.cherries * spoilageRate) / 100;
    };
    
    let newCherries = if (farm.inventory.cherries >= spoiledCherries) {
       Int.abs((farm.inventory.cherries : Int) - (spoiledCherries : Int))
    } else { 0 };
    
    let updatedInventory = {
       farm.inventory with
       cherries = newCherries;
    };

    let _currentSeasonName = farm.currentSeason;
    let _currentSeasonNum = farm.seasonNumber;
    
    let laborShare = (variableCosts * 80) / 100;
    let operationalShare = Int.abs((variableCosts : Int) - (laborShare : Int));
    
    let updatedSeasonStats = updateSeasonalReport(farm, func(r) {
      { r with 
        maintenanceCosts = r.maintenanceCosts + fixedCosts;
        laborCosts = r.laborCosts + laborShare;
        operationalCosts = r.operationalCosts + operationalShare;
        totalCosts = r.totalCosts + fixedCosts + variableCosts;
        netProfit = r.netProfit - ((fixedCosts + variableCosts) : Int);
      }
    });

    let isNewYear = nextSeason == #Spring;

    // Generate yearly report if it's a new year to get the annual profit
    let yearlyReportOpt = if (isNewYear) {
        let yearNum = Int.abs(((farm.seasonNumber) : Int) / 4);
        ?generateYearlyReport(farm, updatedSeasonStats, yearNum)
    } else {
        null
    };
    let newBestYearlyProfit = switch (yearlyReportOpt) {
        case (?report) {
            let yearlyProfit = if (report.netProfit > 0) Int.abs(report.netProfit) else 0;
            if (yearlyProfit > farm.statistics.bestYearlyProfit) yearlyProfit else farm.statistics.bestYearlyProfit
        };
        case (null) { farm.statistics.bestYearlyProfit };
    };

    let updatedStats = {
      farm.statistics with
      totalCosts = farm.statistics.totalCosts + totalCosts;
      seasonsPlayed = farm.statistics.seasonsPlayed + 1;
      bestYearlyProfit = newBestYearlyProfit;
      seasonalReports = updatedSeasonStats.seasonalReports;
      yearlyReports = switch (yearlyReportOpt) {
        case (?report) { Array.append(farm.statistics.yearlyReports, [report]) };
        case (null) { farm.statistics.yearlyReports };
      };
    };

    // Phase 7.0: The Living World (Event System & Mitigation)
    var newWeather : ?Types.WeatherEvent = null;
    if (nextPhase == #Growth) {
        switch (farm.weather) {
            case (?w) if (w.impact == "DEBUG: Forced weather event") { 
                newWeather := ?w; 
            };
            case (_) {
                let entropy = Int.abs(Time.now());
                var hasSprayer = false;
                for (infra in farm.infrastructure.vals()) {
                  if (infra.infraType == #Sprayer) { hasSprayer := true };
                };
                newWeather := EventLogic.generateEvent(nextSeason, entropy, hasSprayer);
            };
        };
    };

    // Phase 6.1 Scalability: Refresh leaderboard cache at year-end
    if (isNewYear) {
      _refreshLeaderboardCache();
    };

    // Phase 7.0: Crop Insurance Payout calculation
    var insurancePayout : Nat = 0;
    if (farm.hasCropInsurance) {
      // Check either new weather being generated or existing weather from previous phase
      let weatherToCheck = switch (newWeather) {
        case (?w) { ?w };
        case (null) { farm.weather };
      };

      switch (weatherToCheck) {
        case (?w) {
          if (w.weather == #Frost or w.weather == #Drought or w.weather == #Flood) {
            insurancePayout := farm.parcels.size() * 5000;
          };
        };
        case null {};
      };
    };

    let updatedFarm = {
      farm with
      currentSeason = nextSeason;
      currentPhase = nextPhase; 
      weather = newWeather;
      hiredLabor = if (nextSeason == #Spring) null else farm.hiredLabor; 
      hasCropInsurance = if (nextSeason == #Spring) false else farm.hasCropInsurance; // Reset insurance annually
      seasonNumber = farm.seasonNumber + 1;
      cash = Int.abs((farm.cash : Int) - (totalCosts : Int)) + insurancePayout;
      parcels = updatedParcels;
      inventory = updatedInventory;
      statistics = updatedStats;
    };

    playerFarms.put(caller, updatedFarm);

    #Ok("Advanced to Season " # debug_show(nextSeason) # " (Year " # Nat.toText((farm.seasonNumber + 1)/4) # ")")
  };

  // Advance phase through the 10-turn sequence
  public shared({ caller }) func advancePhase() : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
        case null { return #Err(#NotFound("Player not found")) };
        case (?farm) {
            
            var updatedFarm = farm;

            // Phase 5.7: Auto-assign Emergency labor if skipped
            if (farm.currentPhase == #Hiring and farm.hiredLabor == null) {
                updatedFarm := { updatedFarm with hiredLabor = ?#Emergency };
            };

            let nextPhase : Types.SeasonPhase = switch (farm.currentPhase) {
                case (#Hiring) { #Procurement };
                case (#Procurement) { #Investment };
                case (#Investment) { #Growth };
                case (#Growth) { #Harvest };
                case (#Harvest) { #Market };
                case (#Market) { #Storage };
                case (#Storage) { #CutAndPrune };
                case (#CutAndPrune) { #Maintenance };
                case (#Maintenance) { #Planning };
                case (#Planning) { #Hiring }; 
            };

            let nextSeason : Types.Season = switch (nextPhase) {
                case (#Hiring) { #Spring };
                case (#Procurement) { #Spring };
                case (#Investment) { #Spring };
                case (#Growth) { #Summer };
                case (#Harvest) { #Summer };
                case (#Market) { #Autumn };
                case (#Storage) { #Autumn };
                case (#CutAndPrune) { #Winter };
                case (#Maintenance) { #Winter };
                case (#Planning) { #Winter };
            };

            if (nextPhase == #Storage) {
                _performGlobalAuctionResolution(farm.seasonNumber);
            };

            // BUG-06: Automatic Contract Generation
            if (nextPhase == #Planning) {
                // Entering New Season: Generate Pre-Season Futures. 
                // SEC-029: DO NOT CLEAR. Append new ones.
                let newPSFs = [
                  AuctionLogic.buildPreSeasonContract(0, farm.seasonNumber + 1, #Export),
                  AuctionLogic.buildPreSeasonContract(1, farm.seasonNumber + 1, #Bio),
                  AuctionLogic.buildPreSeasonContract(2, farm.seasonNumber + 1, #Industrial)
                ];
                stableAuctionContracts := Array.append<Types.AuctionContract>(stableAuctionContracts, newPSFs);
                
                if (farm.seasonNumber > 3) {
                  stableAuctionContracts := Array.filter<Types.AuctionContract>(stableAuctionContracts, func(c) {
                    switch (c.awardedSeason) {
                      case (?s) { s + 2 >= farm.seasonNumber };
                      case null { true };
                    }
                  });
                };
            } else if (nextPhase == #Harvest) {
                // Entering Harvest: Generate Post-Harvest Auctions
                let entropy = (Int.abs(Time.now()) + farm.seasonNumber * 7919) % 1_000_000_000;
                let newContracts = AuctionLogic.generateImperialContracts(farm.seasonNumber, entropy);
                // Preserve awarded Pre-Seasons, append new auctions
                stableAuctionContracts := Array.append<Types.AuctionContract>(stableAuctionContracts, newContracts);
            };

            if (nextSeason != farm.currentSeason) {
                return await _advanceSeasonInternal(updatedFarm, caller, nextPhase, nextSeason);
            };

            // Phase 7.0: Event System Logging
            let newWeather = if (nextPhase == #Growth) {
                // SEC-022: Hardened entropy mix
                let entropy = (Int.abs(Time.now()) + farm.seasonNumber * 982451653 + playerFarms.size() * 179424673) % 1_000_000_000;
                var hasSprayer = false;
                for (infra in farm.infrastructure.vals()) {
                  if (infra.infraType == #Sprayer) { hasSprayer := true };
                };
                EventLogic.generateEvent(nextSeason, entropy, hasSprayer)
            } else {
                farm.weather // Persist existing weather event until end of season
            };

            // Phase 5.7: Market Logic (triggers when entering Procurement)
            let newInputMarket = if (nextPhase == #Procurement) {
                // SEC-022: Hardened entropy mix
                let entropy = (Int.abs(Time.now()) + farm.seasonNumber * 982451653 + playerFarms.size() * 179424673) % 1_000_000_000;
                MarketLogic.generateInputPrices(farm.seasonNumber / 4 + 1, entropy)
            } else {
                farm.inputMarket
            };

            let finalFarm : PlayerFarm = {
                updatedFarm with
                currentPhase = nextPhase;
                currentSeason = nextSeason;
                weather = newWeather;
                inputMarket = newInputMarket;
            };

            playerFarms.put(caller, finalFarm);
            
            let weatherMsg = switch (newWeather) {
                case (null) { "" };
                case (?w) { ". Weather Alert: " # w.impact };
            };

            let aiText = if (nextPhase == #Harvest) {
                let aiEntropy = Int.abs(Time.now()) % 1_000_000_000;
                let _marekKg = CompetitorLogic.simulateAITurn(42,  45_000, #Summer, aiEntropy);
                let _kasiaKg = CompetitorLogic.simulateAITurn(137, 18_000, #Summer, aiEntropy);
                let _hansKg  = CompetitorLogic.simulateAITurn(999, 70_000, #Summer, aiEntropy);
                // BUG-03: Update AI states (Ghost Rivals fix)
                stableHansStorage := (stableHansStorage / 2) + _hansKg;
                " | AI Harvest Results: Marek=" # Nat.toText(_marekKg) # "kg, Kasia=" # Nat.toText(_kasiaKg) # "kg, Hans=" # Nat.toText(_hansKg) # "kg"
            } else { "" };
            
            #Ok("Advanced to phase: " # debug_show(nextPhase) # weatherMsg # aiText)
        };
    }
  };

  // Phase 5.7: Forward Contract Negotiation (#Market phase)
  // Lock a guaranteed price with a specific AI buyer for a fixed quantity.
  // A 5% commitment fee is charged upfront. Revenue is credited immediately (simplified).
  public shared({ caller }) func negotiateForwardContract(
    buyerName: Text,
    quantity: Nat
  ) : async GameResult<Types.ForwardContractResult, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {

        if (farm.currentPhase != #Market) {
          return #Err(#SeasonalRestriction("Forward contracts can only be negotiated in Market phase. Current: " # debug_show(farm.currentPhase)));
        };

        if (quantity == 0) {
          return #Err(#InvalidOperation("Quantity must be greater than 0"));
        };

        // Resolve buyer terms
        let (pricePerKg, minQty, requiresOrganic, saleCategory) : (Nat, Nat, Bool, Text) =
          switch (buyerName) {
            case ("Marek") { (10, 50,  false, "wholesale") };
            case ("Kasia") { (24, 20,  true,  "retail")    };
            case ("Hans")  { (13, 500, false, "wholesale") };
            case (_) {
              return #Err(#InvalidOperation("Unknown buyer. Valid buyers: 'Marek', 'Kasia', 'Hans'"));
            };
          };

        if (quantity < minQty) {
          return #Err(#InvalidOperation("Minimum quantity for " # buyerName # " is " # Nat.toText(minQty) # " kg"));
        };

        if (requiresOrganic and farm.inventory.organicCherries < quantity) {
          return #Err(#InvalidOperation("Kasia requires certified organic cherries. Available: " # Nat.toText(farm.inventory.organicCherries) # " kg"));
        };

        let totalRegularAvailable = farm.inventory.cherries;
        if (not requiresOrganic and totalRegularAvailable < quantity) {
          return #Err(#InvalidOperation("Insufficient cherries for contract. Available: " # Nat.toText(totalRegularAvailable) # " kg"));
        };

        let grossRevenue  = pricePerKg * quantity;
        let commitmentFee = (grossRevenue * 5) / 100;
        let netRevenue    = Int.abs((grossRevenue : Int) - (commitmentFee : Int));

        // Deduct inventory (using Int.abs pattern to satisfy M0155 — guards above already validate qty <= available)
        let updatedInventory : Inventory = if (requiresOrganic) {
          { farm.inventory with organicCherries = Int.abs((farm.inventory.organicCherries : Int) - (quantity : Int)) }
        } else {
          { farm.inventory with cherries = Int.abs((farm.inventory.cherries : Int) - (quantity : Int)) }
        };

        let updatedStats = updateSeasonalReport(farm, func(r) {
          let updatedReport = if (saleCategory == "wholesale") {
            { r with
              wholesaleRevenue = r.wholesaleRevenue + netRevenue;
              wholesaleVolume  = r.wholesaleVolume  + quantity;
              totalRevenue     = r.totalRevenue + netRevenue;
              netProfit        = r.netProfit + (netRevenue : Int);
            }
          } else {
            { r with
              retailRevenue = r.retailRevenue + netRevenue;
              retailVolume  = r.retailVolume  + quantity;
              totalRevenue  = r.totalRevenue + netRevenue;
              netProfit     = r.netProfit + (netRevenue : Int);
            }
          };
          updatedReport
        });

        let updatedFarm = {
          farm with
          cash      = farm.cash + netRevenue;
          inventory = updatedInventory;
          statistics = { farm.statistics with
            totalRevenue = farm.statistics.totalRevenue + netRevenue;
            totalSold    = farm.statistics.totalSold + quantity;
            seasonalReports = updatedStats.seasonalReports;
          };
        };

        playerFarms.put(caller, updatedFarm);

        let result : Types.ForwardContractResult = {
          buyerName         = buyerName;
          lockedQuantityKg  = quantity;
          pricePerKg        = pricePerKg;
          totalRevenue      = netRevenue;
          commitmentFeePaid = commitmentFee;
          saleCategory      = saleCategory;
        };
        #Ok(result)
      };
    }
  };

  // Phase 5.7: Market Forecast (#Planning phase)
  // Paid intelligence about the upcoming season's weather risk and price range.
  // Cost: 2000 PLN. Uses deterministic seed to preview next-season conditions.
  public shared({ caller }) func purchaseMarketForecast() : async GameResult<Types.ForecastReport, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {

        if (farm.currentPhase != #Planning) {
          return #Err(#SeasonalRestriction("Market forecasts only available in Planning phase. Current: " # debug_show(farm.currentPhase)));
        };

        let forecastCost : Nat = 2000;
        if (farm.cash < forecastCost) {
          return #Err(#InsufficientFunds { required = forecastCost; available = farm.cash });
        };

        let nextSeason = farm.seasonNumber + 1;
        let seed = nextSeason % 100;

        let (weatherWarning, confidence) : (Text, Text) = switch (farm.currentSeason) {
          case (#Winter) {
            if      (seed < 15) { ("Late Frost risk in Spring. Consider frost protection.",          "Medium") }
            else if (seed < 35) { ("Heavy Rain expected. Drainage maintenance recommended.",         "High")   }
            else if (seed < 50) { ("Monilinia fungal pressure elevated. Stock fungicide early.",    "Medium") }
            else                { ("Conditions appear favourable. No major weather risk detected.", "Low")    }
          };
          case (#Spring) {
            if      (seed < 20) { ("Drought risk in Summer. Pre-irrigate and water parcels early.", "High")   }
            else if (seed < 35) { ("Heatwave risk. Water levels will deplete faster than usual.",   "Medium") }
            else if (seed < 40) { ("Hailstorm risk. Inspect Sprayer infrastructure.",               "Low")    }
            else if (seed < 60) { ("Cherry Fruit Fly pressure. Pesticide stock advised.",           "Medium") }
            else                { ("Conditions appear favourable. Expect normal yield.",            "Low")    }
          };
          case (#Summer) {
            if      (seed < 10) { ("Early Frost risk in Autumn. Harvest windows may shorten.",      "Low")    }
            else if (seed < 25) { ("Storms forecast. Secure storage and review warehouse.",         "Medium") }
            else                { ("Stable Autumn expected. Good conditions for market activity.",  "Low")    }
          };
          case (#Autumn) {
            if (seed < 25)      { ("Deep Freeze risk in Winter. Cold Storage investment advised.",  "Medium") }
            else                { ("Mild Winter expected. Standard maintenance costs apply.",       "Low")    }
          };
        };

        let nextYear = (nextSeason / 4) + 1;
        let yearInflationFactor = 100 + (nextYear * 5);
        let retailBase    = (15 * yearInflationFactor) / 100;
        let wholesaleBase = (12 * yearInflationFactor) / 100;
        let priceMin      = (retailBase    * 80) / 100;
        let priceMax      = (retailBase    * 120) / 100;
        let whlMin        = (wholesaleBase * 80) / 100;
        let whlMax        = (wholesaleBase * 120) / 100;

        let nextSeasonName = switch (farm.currentSeason) {
          case (#Winter)  { "Spring" };
          case (#Spring)  { "Summer" };
          case (#Summer)  { "Autumn" };
          case (#Autumn)  { "Winter" };
        };

        let updatedFarm = {
          farm with
          cash = Int.abs((farm.cash : Int) - (forecastCost : Int));
          statistics = { farm.statistics with
            totalCosts = farm.statistics.totalCosts + forecastCost;
          };
        };
        playerFarms.put(caller, updatedFarm);

        let report : Types.ForecastReport = {
          targetSeason      = nextSeasonName # " (Season " # Nat.toText(nextSeason) # ")";
          weatherWarning    = weatherWarning;
          priceRangeMin     = priceMin;
          priceRangeMax     = priceMax;
          wholesaleRangeMin = whlMin;
          wholesaleRangeMax = whlMax;
          confidence        = confidence;
          forecastCost      = forecastCost;
        };
        #Ok(report)
      };
    }
  };

  // Upgrade infrastructure
  public shared({ caller }) func upgradeInfrastructure(
    infraTypeString: Text
  ) : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        
        // Phase 5.6: Phase gate — upgrades only in Investment phase
        if (farm.currentPhase != #Investment) {
          return #Err(#SeasonalRestriction("Infrastructure upgrades only in Investment phase. Current: " # debug_show(farm.currentPhase)));
        };

        // Parse infrastructure type
        let infraTypeOpt : ?InfrastructureType = switch (infraTypeString) {
          case ("SocialFacilities") { ?#SocialFacilities };
          case ("Warehouse") { ?#Warehouse };
          case ("ColdStorage") { ?#ColdStorage };
          case ("Tractor") { ?#Tractor };
          case ("GoldenHarvester") { ?#GoldenHarvester };
          case ("Shaker") { ?#Shaker };
          case ("Sprayer") { ?#Sprayer };
          case ("ProcessingFacility") { ?#ProcessingFacility };
          case (_) { null };
        };

        let infraType = switch (infraTypeOpt) {
          case (?t) { t };
          case (null) { return #Err(#InvalidOperation("Invalid infrastructure type: " # infraTypeString)) };
        };

        let cost = GameLogic.getInfrastructureCost(infraType);
        
        // Check for bankruptcy risk
        switch (await checkBankruptcyRisk(farm, cost)) {
          case (#Err(e)) { return #Err(e) };
          case (#Ok(())) {};
        };
        
        // Create new infrastructure
        let newInfra : Infrastructure = {
          infraType = infraType;
          level = 1;
          purchasedSeason = farm.seasonNumber;
          maintenanceCost = GameLogic.getMaintenanceCost(infraType);
        };

        let updatedInfrastructure = Array.append<Infrastructure>(
          farm.infrastructure,
          [newInfra]
        );

        // Add experience
        let xpGain = GameLogic.calculateExperienceGain("upgrade", 1);
        let newXp = farm.experience + xpGain;
        let newLevel = GameLogic.getLevelFromExperience(newXp);

        let updatedStats = updateSeasonalReport(farm, func(r) {
          { r with 
            infrastructureCosts = r.infrastructureCosts + cost;
            totalCosts = r.totalCosts + cost;
            netProfit = r.netProfit - (cost : Int);
          }
        });

        let updatedFarm = {
          farm with
          infrastructure = updatedInfrastructure;
          cash = Int.abs((farm.cash : Int) - (cost : Int));
          experience = newXp;
          level = newLevel;
          statistics = { updatedStats with totalCosts = farm.statistics.totalCosts + cost };
        };

        playerFarms.put(caller, updatedFarm);
        #Ok("Infrastructure upgraded successfully")
      };
    }
  };

  // Phase 5.7: Buy Bulk Supplies in Procurement Phase
  // Phase 5.7: Analytics Generation
  public query({ caller }) func getYearlyInsights() : async GameResult<[Text], GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        let reports = farm.statistics.yearlyReports;
        if (reports.size() == 0) {
          return #Ok(["Patience, Governor. The engines of analysis require at least one full Winter to complete their calculations. Return next year."]);
        };
        
        // Get the most recent report
        let latestReport = reports[reports.size() - 1];
        let insights = AnalyticsLogic.generateInsights(latestReport, farm);
        
        return #Ok(insights);
      };
    }
  };

  // Phase Cinematic: The Golden Harvester upgrade
  public shared({ caller }) func upgrade_golden_harvester() : async GameResult<Nat, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        
        if (farm.currentPhase != #Investment) {
          return #Err(#SeasonalRestriction("Golden Harvester upgrades only in Investment phase. Current: " # debug_show(farm.currentPhase)));
        };

        // Find existing Golden Harvester level
        var currentLevel : Nat = 0;
        var infraIndex : ?Nat = null;
        var idx : Nat = 0;
        
        for (infra in farm.infrastructure.vals()) {
          switch (infra.infraType) {
            case (#GoldenHarvester) {
              currentLevel := infra.level;
              infraIndex := ?idx;
            };
            case (_) {};
          };
          idx += 1;
        };

        // Scale cost: Cost(L) = 100_000 * (1.15^L)
        var costMultiplier = 1.0;
        for (i in Iter.range(1, currentLevel)) { costMultiplier *= 1.15 };
        let cost = Int.abs(Float.toInt(100_000.0 * costMultiplier));
        
        switch (await checkBankruptcyRisk(farm, cost)) {
          case (#Err(e)) { return #Err(e) };
          case (#Ok(())) {};
        };
        
        let newLevel = currentLevel + 1;
        
        let newInfra : Infrastructure = {
          infraType = #GoldenHarvester;
          level = newLevel;
          purchasedSeason = farm.seasonNumber;
          maintenanceCost = GameLogic.getMaintenanceCost(#GoldenHarvester);
        };

        let updatedInfrastructure = switch (infraIndex) {
          case (null) {
            Array.append<Infrastructure>(farm.infrastructure, [newInfra])
          };
          case (?i) {
            Array.tabulate<Infrastructure>(
              farm.infrastructure.size(),
              func(index: Nat) : Infrastructure {
                if (index == i) { newInfra } else { farm.infrastructure[index] }
              }
            )
          };
        };

        // Add experience
        let xpGain = GameLogic.calculateExperienceGain("upgrade", 1);
        let newXp = farm.experience + xpGain;
        let newFarmLevel = GameLogic.getLevelFromExperience(newXp);

        let updatedStats = updateSeasonalReport(farm, func(r) {
          { r with 
            infrastructureCosts = r.infrastructureCosts + cost;
            totalCosts = r.totalCosts + cost;
            netProfit = r.netProfit - (cost : Int);
          }
        });

        let updatedFarm = {
          farm with
          infrastructure = updatedInfrastructure;
          cash = Int.abs((farm.cash : Int) - (cost : Int));
          experience = newXp;
          level = newFarmLevel;
          statistics = { updatedStats with totalCosts = farm.statistics.totalCosts + cost };
        };

        playerFarms.put(caller, updatedFarm);
        #Ok(newLevel)
      };
    }
  };

  // ============================================================================
  // PARCEL PURCHASE (from GDD)
  // ============================================================================

  // Helper: Check if an expenditure leads to bankruptcy risk
  private func checkBankruptcyRisk(farm: PlayerFarm, expenditure: Nat) : async GameResult<(), GameError> {
    if (farm.cash < expenditure) {
      return #Err(#InsufficientFunds { required = expenditure; available = farm.cash });
    };

    let remainingCash = Int.abs((farm.cash : Int) - (expenditure : Int));
    
    // Check for organic parcels
    var hasOrganic = false;
    for (p in farm.parcels.vals()) {
      if (p.isOrganic) { hasOrganic := true };
    };

    let seasonsRemaining = GameLogic.estimateSeasonsUntilHarvest(farm.currentSeason);
    let seasonalCost = GameLogic.estimateSeasonalCosts(farm.parcels, farm.infrastructure, hasOrganic);
    let harvestCost = GameLogic.estimateHarvestCosts(farm.parcels, farm.infrastructure);
    
    let totalNeeded = (seasonsRemaining * seasonalCost) + harvestCost;
    
    if (remainingCash < totalNeeded) {
      return #Err(#BankruptcyRisk { estimatedCostUntilHarvest = totalNeeded; available = remainingCash });
    };
    
    #Ok(())
  };

  // Helper: Find parcel and its index
  private func findParcelIndex(
    parcels: [CherryParcel],
    id: Text
  ) : (?CherryParcel, ?Nat) {
    var idx = 0;
    while (idx < parcels.size()) {
      if (parcels[idx].id == id) {
        return (?parcels[idx], ?idx);
      };
      idx += 1;
    };
    (null, null)
  };

  // Helper: Random soil type (TODO: Add actual randomization)
  private func getRandomSoilType() : SoilType {
    #SandyClay  // Optimal for now
  };

  // Helper: Random pH (TODO: Add actual randomization)
  private func getRandomPH() : Float {
    6.5  // Optimal for now
  };

  // Helper: Random fertility (TODO: Add actual randomization)
  private func getRandomFertility() : Float {
    0.7  // Good for now
  };

  // Purchase a new parcel
  public shared({ caller }) func purchaseParcel(
    province: Province,
    size: Float
  ) : async GameResult<Text, GameError> {
    
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        
        // Calculate cost: 60,000 PLN per hectare (from GDD)
        let cost = Int.abs(Float.toInt(size * 60000.0));
        
        // Check for bankruptcy risk
        switch (await checkBankruptcyRisk(farm, cost)) {
          case (#Err(e)) { return #Err(e) };
          case (#Ok(())) {};
        };
        
        // Generate unique parcel ID
        let parcelId = "parcel_" # Int.toText(Time.now());
        
        // Create new parcel with random properties
        let newParcel : CherryParcel = {
          id = parcelId;
          ownerId = farm.playerId;
          region = {
            province = province;
            county = "TBD";  // TODO: Add county selection
            commune = "TBD";
            communeType = #Mixed;
            population = 50000;
            marketSize = 0.7;
            laborCostMultiplier = 1.0;
          };
          soilType = getRandomSoilType();
          pH = getRandomPH();
          fertility = getRandomFertility();
          permeability = 0.7;
          humidity = 0.6;
          size = size;
          plantedTrees = 0;
          treeAge = 0;
          isOrganic = false;
          organicConversionSeason = 0;
          organicCertified = false;
          lastHarvest = 0;
          quality = 50;
          waterLevel = 0.5;
          lastFertilized = 0;
        };
        
        let updatedParcels = Array.append(farm.parcels, [newParcel]);
        
        let updatedStats = updateSeasonalReport(farm, func(r) {
          { r with 
            certificationCosts = r.certificationCosts + cost;
            totalCosts = r.totalCosts + cost;
            netProfit = r.netProfit - (cost : Int);
          }
        });

        let updatedFarm = {
          farm with
          parcels = updatedParcels;
          cash = Int.abs((farm.cash : Int) - (cost : Int));
          statistics = { updatedStats with 
            totalCosts = farm.statistics.totalCosts + cost;
          };
        };
        
        playerFarms.put(caller, updatedFarm);
        #Ok(parcelId)
      };
    }
  };

  // Buy a parcel (Priority 2)
  public shared({ caller }) func buyParcel(
    parcelId: Text,
    price: Nat
  ) : async GameResult<Text, GameError> {
    
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        
        // Check for bankruptcy risk
        switch (await checkBankruptcyRisk(farm, price)) {
          case (#Err(e)) { return #Err(e) };
          case (#Ok(())) {};
        };
        
        // In a real scenario, we would check if the parcel belongs to another player or bank
        // For now, we simulate finding the parcel and "buying" it.
        // We'll create a new parcel with this ID if it doesn't exist, 
        // or just add it to the player's collection.
        
        // Check if player already owns it
        let (existingOpt, _) = findParcelIndex(farm.parcels, parcelId);
        switch (existingOpt) {
          case (?_) { return #Err(#AlreadyExists("You already own this parcel")) };
          case null {};
        };
        
        // Implementation note: In this simple version, we'll generate a parcel 
        // if it's not already owned, simulating a purchase from the bank.
        let newParcel : CherryParcel = {
          id = parcelId;
          ownerId = farm.playerId;
          region = {
            province = #Opolskie;
            county = "Opole";
            commune = "Opole";
            communeType = #Mixed;
            population = 120000;
            marketSize = 0.8;
            laborCostMultiplier = 1.0;
          };
          soilType = #SandyClay;
          pH = 6.5;
          fertility = 0.7;
          permeability = 0.8;
          humidity = 0.6;
          size = 1.0;
          plantedTrees = 0;
          treeAge = 0;
          isOrganic = false;
          organicConversionSeason = 0;
          organicCertified = false;
          lastHarvest = 0;
          quality = 50;
          waterLevel = 0.5;
          lastFertilized = 0;
        };
        
        let updatedParcels = Array.append(farm.parcels, [newParcel]);
        
        let updatedStats = updateSeasonalReport(farm, func(r) {
          { r with 
            parcelCosts = r.parcelCosts + price;
            totalCosts = r.totalCosts + price;
            netProfit = r.netProfit - (price : Int);
          }
        });

        let updatedFarm = {
          farm with
          parcels = updatedParcels;
          cash = Int.abs((farm.cash : Int) - (price : Int));
          statistics = { updatedStats with totalCosts = farm.statistics.totalCosts + price };
        };
        
        playerFarms.put(caller, updatedFarm);
        #Ok("Successfully bought parcel " # parcelId)
      };
    }
  };
  // Financial Report Helpers
  private func getOrCreateReport(reports: [SeasonReport], seasonNumber: Nat, seasonName: Season) : ([SeasonReport], Nat) {
    var updatedReports = Buffer.fromArray<SeasonReport>(reports);
    var targetIndex : ?Nat = null;
    
    for (i in Iter.range(0, (updatedReports.size() : Int) - 1)) {
      if (updatedReports.get(i).seasonNumber == seasonNumber) {
        targetIndex := ?i;
      };
    };
    
    switch (targetIndex) {
      case (?index) { (Buffer.toArray(updatedReports), index) };
      case null {
        let newReport : SeasonReport = {
          seasonNumber = seasonNumber;
          seasonName = seasonName;
          retailRevenue = 0;
          wholesaleRevenue = 0;
          otherRevenue = 0;
          maintenanceCosts = 0;
          operationalCosts = 0;
          laborCosts = 0;
          certificationCosts = 0;
          infrastructureCosts = 0;
          parcelCosts = 0;
          retailVolume = 0;
          wholesaleVolume = 0;
          parcelData = [];
          totalRevenue = 0;
          totalCosts = 0;
          totalHarvested = 0;
          netProfit = 0;
        };
        updatedReports.add(newReport);
        (Buffer.toArray(updatedReports), updatedReports.size() - 1)
      };
    };
  };

  private func updateSeasonalReport(
    farm: PlayerFarm,
    updateFn: (SeasonReport) -> SeasonReport
  ) : Statistics {
    let (reports, index) = getOrCreateReport(farm.statistics.seasonalReports, farm.seasonNumber, farm.currentSeason);
    let updatedReport = updateFn(reports[index]);
    
    let finalReports = Array.tabulate<SeasonReport>(reports.size(), func(i) {
      if (i == index) updatedReport else reports[i]
    });
    
    { farm.statistics with seasonalReports = finalReports }
  };

  private func generateYearlyReport(farm: PlayerFarm, stats: Statistics, yearNum: Nat) : YearlyReport {
    let endSeason = yearNum * 4;
    let startSeason = if (endSeason >= 3) Int.abs((endSeason : Int) - 3) else 1;
    
    var seasonalBreakdown = Buffer.Buffer<SeasonReport>(4);
    for (r in stats.seasonalReports.vals()) {
      if (r.seasonNumber >= startSeason and r.seasonNumber <= endSeason) {
        seasonalBreakdown.add(r);
      };
    };
    
    var totalRev : Nat = 0;
    var totalCost : Nat = 0;
    var netProf : Int = 0;
    var totalHarv : Nat = 0;
    
    var retRev : Nat = 0;
    var wholRev : Nat = 0;
    var otherRev : Nat = 0;
    var retVol : Nat = 0;
    var wholVol : Nat = 0;
    
    var maintCost : Nat = 0;
    var operCost : Nat = 0;
    var laborCost : Nat = 0;
    var certCost : Nat = 0;
    var infraCost : Nat = 0;
    var parcCost : Nat = 0;
    
    // Track parcel performance across the year
    var parcelStats = HashMap.HashMap<Text, (Nat, Int)>(10, Text.equal, Text.hash);
    
    for (report in seasonalBreakdown.vals()) {
      totalRev += report.totalRevenue;
      totalCost += report.totalCosts;
      netProf += report.netProfit;
      
      retRev += report.retailRevenue;
      wholRev += report.wholesaleRevenue;
      otherRev += report.otherRevenue;
      retVol += report.retailVolume;
      wholVol += report.wholesaleVolume;
      
      maintCost += report.maintenanceCosts;
      operCost += report.operationalCosts;
      laborCost += report.laborCosts;
      certCost += report.certificationCosts;
      infraCost += report.infrastructureCosts;
      parcCost += report.parcelCosts;

      for (pData in report.parcelData.vals()) {
        totalHarv += pData.yield;
        let (harv, prof) = switch (parcelStats.get(pData.parcelId)) {
          case null { (0, 0) };
          case (?v) { v };
        };
        parcelStats.put(pData.parcelId, (harv + pData.yield, prof + pData.netProfit));
      };
    };
    
    var bestParcelId : ?Text = null;
    var bestProfit : ?Int = null;
    
    for (entry in parcelStats.entries()) {
      let (id, (_, prof)) = entry;
      switch (bestProfit) {
        case null {
          bestParcelId := ?id;
          bestProfit := ?prof;
        };
        case (?p) {
          if (prof > p) {
            bestParcelId := ?id;
            bestProfit := ?prof;
          };
        };
      };
    };
    
    {
      year = yearNum;
      totalRevenue = totalRev;
      totalCosts = totalCost;
      netProfit = netProf;
      totalHarvested = totalHarv;
      
      retailRevenue = retRev;
      wholesaleRevenue = wholRev;
      otherRevenue = otherRev;
      retailVolume = retVol;
      wholesaleVolume = wholVol;

      maintenanceCosts = maintCost;
      operationalCosts = operCost;
      laborCosts = laborCost;
      certificationCosts = certCost;
      infrastructureCosts = infraCost;
      parcelCosts = parcCost;

      seasonalBreakdown = Buffer.toArray(seasonalBreakdown);
      bestPerformingParcelId = bestParcelId;
      bestPerformingProvince = if (bestParcelId != null) {
        // Fallback for province; in a real scenario we'd track this properly
        // For now, looking up from the best parcel
        let (pOpt, _) = findParcelIndex(farm.parcels, switch (bestParcelId) { case (?id) id; case null "" });
        switch (pOpt) { case (?p) ?p.region.province; case null null };
      } else {
        null
      };
    };
  };

  private func updateParcelEconomics(
    report: SeasonReport,
    parcelId: Text,
    province: Province,
    updateFn: (ParcelEconomics) -> ParcelEconomics
  ) : SeasonReport {
    var updatedParcelData = Buffer.fromArray<ParcelEconomics>(report.parcelData);
    var targetIndex : ?Nat = null;
    
    for (i in Iter.range(0, (updatedParcelData.size() : Int) - 1)) {
      if (updatedParcelData.get(i).parcelId == parcelId) {
        targetIndex := ?i;
      };
    };
    
    let economics = switch (targetIndex) {
      case (?index) { updatedParcelData.get(index) };
      case null {
        let newEcon : ParcelEconomics = {
          parcelId = parcelId;
          province = province;
          revenue = 0;
          costs = 0;
          yield = 0;
          netProfit = 0;
        };
        newEcon
      };
    };
    
    let updatedEcon = updateFn(economics);
    
    switch (targetIndex) {
      case (?index) {
        updatedParcelData.put(index, updatedEcon);
      };
      case null {
        updatedParcelData.add(updatedEcon);
      };
    };
    
    { report with parcelData = Buffer.toArray(updatedParcelData) }
  };



  // Assign a parcel to a player (GDD Section 1)
  public shared({ caller }) func assignParcelToPlayer(
    parcelId: Text,
    recipient: Principal
  ) : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    
    // 1. Get Caller Farm (Sender)
    let callerFarm = switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Caller farm not found")) };
      case (?f) { f };
    };

    // 2. Get Recipient Farm
    let recipientFarm = switch (playerFarms.get(recipient)) {
      case null { return #Err(#NotFound("Recipient farm not found")) };
      case (?f) { f };
    };

    // 3. Find Parcel in Caller Farm
    let (parcelOpt, indexOpt) = findParcelIndex(callerFarm.parcels, parcelId);
    
    switch (parcelOpt, indexOpt) {
      case (null, _) { return #Err(#NotFound("Parcel not found in caller's farm")) };
      case (?parcel, ?_) {
        
        // 4. Remove from Caller Farm
        let newCallerParcels = Iter.toArray(
          Iter.filter(
            callerFarm.parcels.vals(),
            func(p : CherryParcel) : Bool { p.id != parcelId }
          )
        );

        let updatedCallerFarm = {
          callerFarm with
          parcels = newCallerParcels;
        };
        
        // 5. Update Parcel Ownership
        let updatedParcel = {
          parcel with
          ownerId = recipientFarm.playerId;
        };
        
        // 6. Add to Recipient Farm
        let newRecipientParcels = Array.append(recipientFarm.parcels, [updatedParcel]);
        
        let updatedRecipientFarm = {
          recipientFarm with
          parcels = newRecipientParcels;
        };
        
        // 7. Commit Changes
        playerFarms.put(caller, updatedCallerFarm);
        playerFarms.put(recipient, updatedRecipientFarm);
        
        #Ok("Parcel " # parcelId # " assigned to player " # recipientFarm.playerId # " successfully")
      };
      case (?_, null) { return #Err(#NotFound("Parcel not found")) };
    };
  };

  // ============================================================================
  // ADMIN FUNCTIONS
  // ============================================================================

  // Get total number of players
  public query func getTotalPlayers() : async Nat {
    playerFarms.size()
  };

  // Get global season
  public query func getGlobalSeason() : async Nat {
    globalSeasonNumber
  };

  // Get current market prices
  public query func getMarketPrices() : async GameResult<Types.MarketPrice, GameError> {
    // Basic static prices for now, matching GDD
    let prices : Types.MarketPrice = {
      retailBasePrice = baseRetailPrice;
      wholesaleBasePrice = baseWholesalePrice;
      demandMultiplier = 1.0;
      seasonMultiplier = 1.0; // TODO: Vary by season
      qualityBonus = 0.3;     // Max bonus
      organicPremium = 0.4;   // Max premium
    };
    #Ok(prices)
  };

  // ============================================================================
  // PHASE 5.2: AI COMPETITORS + LEADERBOARD
  // ============================================================================

  // Get all AI competitor summaries (public — no auth required, market intel)
  public query func getCompetitorSummaries() : async [CompetitorLogic.AICompetitorSummary] {
    CompetitorLogic.getCompetitorSummaries()
  };

  // Phase 6.1: Global Leaderboards (Internal logic)
  // Scalability: Now updates the topPlayersCache variable instead of returning
  func _refreshLeaderboardCache() {
    var entries = Buffer.Buffer<Types.LeaderboardEntry>(20);

    // 1. Add real player farms
    for ((principal, farm) in playerFarms.entries()) {
      let revenue = farm.statistics.totalRevenue;
      
      var infraTotal : Nat = 0;
      for (infra in farm.infrastructure.vals()) {
        infraTotal += infra.level;
      };

      let isOrganic = (farm.inventory.organicCherries > 0); 

      let prestige = LeaderboardLogic.calculatePrestige(
        revenue,
        infraTotal,
        farm.seasonNumber,
        isOrganic
      );

      entries.add({
        id = Principal.toText(principal);
        name = farm.playerName;
        isAI = false;
        prestige = prestige;
        seasonsCompleted = farm.seasonNumber;
        totalRevenue = revenue;
      });
    };

    // 2. Add AI competitors
    let competitors = CompetitorLogic.getCompetitorSummaries();
    for (ai in competitors.vals()) {
      // AI Pseudo-stats based on archetype values
      let aiInfraTotal : Nat = switch (ai.name) {
        case ("Marek \"The Traditionalist\"") { 15 };
        case ("Kasia \"The Eco-Visionary\"") { 10 };
        case ("Hans \"The Aggressor\"")  { 25 };
        case (_) { 5 };
      };
      
      let aiSeasons : Nat = 10; 

      let isOrganicAI = ai.isOrganic;
      
      // Estimate AI revenue
      let aiRevenue = (ai.baseCapacity * 70 / 100) * 12;

      let aiPrestige = LeaderboardLogic.calculatePrestige(
        aiRevenue,
        aiInfraTotal,
        aiSeasons,
        isOrganicAI
      );

      entries.add({
        id = "ai_" # Text.toLowercase(ai.name);
        name = ai.name;
        isAI = true;
        prestige = aiPrestige;
        seasonsCompleted = aiSeasons;
        totalRevenue = aiRevenue;
      });
    };

    let entriesArray = Buffer.toArray(entries);
    let sorted = Array.sort(entriesArray, LeaderboardLogic.compareDesc);

    let limit = if (sorted.size() > 100) 100 else sorted.size();
    topPlayersCache := Array.tabulate<Types.LeaderboardEntry>(limit, func(i) {
      sorted[i]
    });
  };

  // Public Query Wrapper - Scalability: Returns cached data O(1)
  public query func getGlobalLeaderboard() : async [Types.LeaderboardEntry] {
    topPlayersCache
  };

  // Phase 6.1: Get specific player rank
  public query func getPlayerRank(playerId : Principal) : async ?Nat {
    let leaderboard = topPlayersCache;
    let principalStr = Principal.toText(playerId);
    
    var rank : ?Nat = null;
    var i : Nat = 0;
    while (i < leaderboard.size()) {
      if (leaderboard[i].id == principalStr) {
        rank := ?(i + 1); 
        i := leaderboard.size(); 
      } else {
        i += 1;
      };
    };
    
    rank
  };

  // Phase 7.0: Crop Insurance System
  public shared({ caller }) func purchaseCropInsurance() : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
        case null { return #Err(#NotFound("Player not found")) };
        case (?farm) {
            if (farm.currentPhase != #Procurement) {
                return #Err(#SeasonalRestriction("Insurance can only be purchased during the Procurement Phase (Spring)"));
            };
            if (farm.hasCropInsurance) {
                return #Err(#AlreadyExists("You already have crop insurance for this year."));
            };

            // Cost: 2000 PLN per parcel
            let cost : Nat = farm.parcels.size() * 2000;
            
            if (farm.cash < cost) {
                return #Err(#InsufficientFunds({ required = cost; available = farm.cash }));
            };

            let updatedFarm = {
              farm with
              cash = farm.cash - cost;
              hasCropInsurance = true;
            };

            playerFarms.put(caller, updatedFarm);
            #Ok("Crop insurance purchased successfully for " # Nat.toText(cost) # " PLN.")
        };
    };
  };

  // ============================================================================
  // PHASE 8.0: THE COMPETITIVE POOL — AUCTION API
  // SEC: All 4 functions guard against anonymous callers.
  // ============================================================================

  // Stable state for active auction contracts and AI surplus simulation.
  stable var stableAuctionContracts : [Types.AuctionContract] = [];
  stable var stableSpotPrice : Nat = 5; // PLN/kg — adjusted by Flood Factor
  stable var stableHansStorage : Nat = 0; // simulated Hans surplus kg
  stable var stableBids : [Types.Bid] = []; // [NEW] Buffer for closed-bid auctions
  stable var lastResolutionSeason : Nat = 0; // [NEW] Prevents double-resolution

  // [QUERY] Get all Imperial Contracts available in the current Market phase.
  public shared query({ caller }) func getActiveContracts() : async GameResult<[Types.AuctionContract], GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    #Ok(stableAuctionContracts)
  };

  // [MUTATION] Commit to a Pre-Season Future during #Planning phase.
  public shared({ caller }) func commitPreSeasonFuture(
    contractId  : Text,
    volumeKg    : Nat
  ) : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        if (farm.currentPhase != #Planning) {
          return #Err(#SeasonalRestriction("Pre-Season Futures only in Planning phase. Current: " # debug_show(farm.currentPhase)));
        };
        if (volumeKg == 0) {
          return #Err(#InvalidOperation("Volume commitment must be greater than zero."));
        };
        var contractOpt : ?Types.AuctionContract = null;
        for (c in stableAuctionContracts.vals()) {
          if (c.id == contractId and c.isPreSeason and c.status == #Open) {
            contractOpt := ?c;
          };
        };
        let contract = switch (contractOpt) {
          case null { return #Err(#NotFound("Pre-Season Future not found or closed: " # contractId)) };
          case (?c) c;
        };
        switch (contract.category) {
          case (#Bio) {
            let hasOrganic = farm.inventory.organicCherries > 0 or
              Array.find<Types.CherryParcel>(farm.parcels, func(p) { p.organicCertified }) != null;
            if (not hasOrganic) {
              return #Err(#InvalidOperation("Bio contracts require an organic-certified farm or organic inventory."));
            };
          };
          case (_) {};
        };
        let lockedPrice : Nat = AuctionLogic.calcLockedPrice(contract.basePricePLN);
        let fee : Nat = AuctionLogic.calcCommitmentFee(lockedPrice, volumeKg);
        if (farm.cash < fee) {
          return #Err(#InsufficientFunds({ required = fee; available = farm.cash }));
        };
        let callerText = Principal.toText(caller);
        let updatedContracts = Array.map<Types.AuctionContract, Types.AuctionContract>(
          stableAuctionContracts,
          func(c) {
            if (c.id == contractId) {
              { c with status = #Awarded; committedByPlayer = ?callerText; lockedPricePLN = ?lockedPrice;
                winnerPlayerId = ?callerText; winnerBidPLN = ?lockedPrice; awardedSeason = ?farm.seasonNumber; }
            } else { c }
          }
        );
        stableAuctionContracts := updatedContracts;
        let updatedFarm = { farm with cash = Int.abs((farm.cash : Int) - (fee : Int)) };
        playerFarms.put(caller, updatedFarm);
        #Ok("Pre-Season Future committed. Locked: " # Nat.toText(lockedPrice) # " PLN/kg. Fee: " # Nat.toText(fee) # " PLN.")
      };
    }
  };

  // [MUTATION] Submit a closed bid for a Post-Harvest Imperial Contract (#Market phase).
  public shared({ caller }) func submitAuctionBid(
    contractId   : Text,
    offerPricePLN: Nat
  ) : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        if (farm.currentPhase != #Market) {
          return #Err(#SeasonalRestriction("Auction bids only in Market phase. Current: " # debug_show(farm.currentPhase)));
        };
        var contractOpt : ?Types.AuctionContract = null;
        for (c in stableAuctionContracts.vals()) {
          if (c.id == contractId and (not c.isPreSeason) and c.status == #Open) { contractOpt := ?c; };
        };
        let contract = switch (contractOpt) {
          case null { return #Err(#NotFound("Imperial Contract not found or not Open: " # contractId)) };
          case (?c) c;
        };
        if (offerPricePLN > contract.basePricePLN) {
          return #Err(#InvalidOperation("Offer price cannot exceed base: " # Nat.toText(contract.basePricePLN) # " PLN/kg."));
        };
        let totalInventory = farm.inventory.cherries + farm.inventory.organicCherries;
        if (totalInventory < contract.requiredVolumeKg) {
          return #Err(#InvalidOperation("Insufficient inventory. Required: " # Nat.toText(contract.requiredVolumeKg) # " kg."));
        };
        let isOrganic = farm.inventory.organicCherries >= contract.requiredVolumeKg;
        let playerBid : Types.Bid = {
          contractId = contractId; bidderId = Principal.toText(caller); isAI = false;
          offerPricePLN = offerPricePLN; volumeCommittedKg = contract.requiredVolumeKg;
          isOrganic = isOrganic; globalPrestige = farm.reputation; localReputation = farm.reputation;
          submittedSeason = farm.seasonNumber;
        };
        let marekBidOpt = AuctionLogic.getMarekBid(contract, farm.seasonNumber, farm.seasonNumber);
        let kasiaBidOpt = AuctionLogic.getKasiaBid(contract, farm.seasonNumber, farm.seasonNumber);
        let hansBidOpt  = AuctionLogic.getHansBid(contract, farm.seasonNumber, farm.seasonNumber, stableHansStorage);
        let aiBids = Array.flatten<Types.Bid>([
          switch (marekBidOpt) { case (?b) [b]; case null [] },
          switch (kasiaBidOpt) { case (?b) [b]; case null [] },
          switch (hansBidOpt)  { case (?b) [b]; case null [] },
        ]);
        // DESIGN GAP FIX: Buffer all bids
        stableBids := Array.append<Types.Bid>(stableBids, Array.append([playerBid], aiBids));
        #Ok("Bid submitted to the pool. Resolution in Storage phase.")
      };
    }
  };

  // [MUTATION] Resolve Pre-Season Future shortfalls at #Storage phase.
  // [INTERNAL] Determine winners for the current season once.
  // SEC-030: Optimized to O(N+M) and SEC-031: Integrated Flood Factor.
  func _performGlobalAuctionResolution(season: Nat) {
    if (lastResolutionSeason >= season) return;
    
    var totalContractedKg : Nat = 0;
    let seasonText = "S" # Nat.toText(season);

    let updatedContracts = Array.map<Types.AuctionContract, Types.AuctionContract>(stableAuctionContracts, func(c) {
      let isCurrentSeason = Text.contains(c.id, #text(seasonText));
      if (isCurrentSeason and not c.isPreSeason and c.status == #Open) {
        let contractBids = Array.filter<Types.Bid>(stableBids, func(b) { b.contractId == c.id });
        if (contractBids.size() == 0) return c;
        let result = AuctionLogic.resolveContract(c, contractBids);
        switch (result.winnerId) {
          case (?(winId)) { 
            totalContractedKg += c.requiredVolumeKg;
            { c with status = #Fulfilled; winnerPlayerId = ?winId; winnerBidPLN = result.winnerPricePLN; awardedSeason = ?season } 
          };
          case null { c };
        }
      } else { c }
    });
    
    // SEC-031: Flood Factor Integration
    let marketPressure = if (totalContractedKg < 50_000) {
      Int.abs(50_000 - (totalContractedKg : Int))
    } else 0;
    stableSpotPrice := AuctionLogic.applyFloodFactor(stableSpotPrice, marketPressure);

    stableAuctionContracts := updatedContracts;
    stableBids := [];
    lastResolutionSeason := season;
  };

  // [MUTATION] Resolve outcomes for the caller. Fixes inventory leak and buffered bid global sweep.
  public shared({ caller }) func resolveSeasonAuctions() : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    switch (playerFarms.get(caller)) {
      case null { return #Err(#NotFound("Player not found")) };
      case (?farm) {
        if (farm.currentPhase != #Storage) {
          return #Err(#SeasonalRestriction("Auction resolution only in Storage phase. Current: " # debug_show(farm.currentPhase)));
        };

        if (farm.lastAuctionResolutionSeason >= farm.seasonNumber) {
          return #Err(#InvalidOperation("Auctions already resolved for season " # Nat.toText(farm.seasonNumber)));
        };

        _performGlobalAuctionResolution(farm.seasonNumber);

        let callerText = Principal.toText(caller);
        var cashDelta : Int = 0;
        var prestigeDelta : Nat = 0;
        var defaultCount : Nat = 0;
        var remCherries = farm.inventory.cherries;
        var remOrganic = farm.inventory.organicCherries;
        var resolutionSummary = "";

        // Collect Wins
        for (c in stableAuctionContracts.vals()) {
          if (not c.isPreSeason and c.status == #Fulfilled and c.winnerPlayerId == ?callerText and c.awardedSeason == ?farm.seasonNumber) {
              let isBio = switch(c.category){case(#Bio)true;case(_)false};
              let vol = c.requiredVolumeKg;
              let rev = vol * (switch(c.winnerBidPLN){case(?p)p;case(_)0});
              cashDelta += (rev : Int);
              resolutionSummary #= " | 🏆 WON " # c.id;
              if (isBio) { remOrganic := if(remOrganic >= vol) remOrganic - vol else 0 }
              else { remCherries := if(remCherries >= vol) remCherries - vol else 0 };
          };
        };

        // Shortfalls
        let totalDelivered = remCherries + remOrganic;
        for (c in stableAuctionContracts.vals()) {
          switch (c.committedByPlayer) {
            case (?(pid)) {
              if (pid == callerText and c.isPreSeason and c.status == #Awarded) {
                let sr = AuctionLogic.resolvePreSeasonShortfall(c, totalDelivered, stableSpotPrice, farm.cash, farm.reputation, farm.reputation);
                if (sr.shortfallKg > 0) {
                  cashDelta -= (sr.cashDeducted : Int);
                  prestigeDelta += sr.prestigeLost;
                  if (sr.isDefault) { defaultCount += 1; cashDelta -= (sr.defaultPenalty : Int); };
                };
                let deliveredKg = if (totalDelivered >= c.requiredVolumeKg) c.requiredVolumeKg else totalDelivered;
                if (remCherries >= deliveredKg) { remCherries -= deliveredKg }
                else { let leftover = Int.abs((deliveredKg : Int) - (remCherries : Int)); remCherries := 0; remOrganic := if(remOrganic>=leftover)remOrganic-leftover else 0 };
              };
            };
            case(_) {};
          };
        };

        let newCash : Int = (farm.cash : Int) + cashDelta;
        let newReputation : Nat = if (prestigeDelta > farm.reputation) 0 else farm.reputation - prestigeDelta;
        let (finalCash, finalDebt) = if (newCash >= 0) { (Int.abs(newCash), farm.debt) } else { (0, farm.debt + Int.abs(newCash)) };

        let updatedFarm = { farm with cash = finalCash; debt = finalDebt; reputation = newReputation;
                            lastAuctionResolutionSeason = farm.seasonNumber;
                            inventory = { farm.inventory with cherries = remCherries; organicCherries = remOrganic }; };
        playerFarms.put(caller, updatedFarm);
        let msg = if (defaultCount > 0) { "⚠️ " # Nat.toText(defaultCount) # " defaulted! Cash: " # Int.toText(cashDelta) # " PLN." # resolutionSummary }
                  else { "✅ All resolutions completed." # resolutionSummary };
        #Ok(msg)
      };
    }
  };

  // ============================================================================
  // SPORTS CENTER (Phase 6 Stubs)
  // ============================================================================

  public shared query({ caller }) func getAvailableFootballClubs() : async GameResult<[Types.FootballClub], GameError> {
    #Ok([])
  };

  public shared({ caller }) func buyClubShares(clubId: Text, amount: Nat) : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    #Err(#InvalidOperation("Sports Center feature coming soon!"))
  };

}
