// Mark Vinicius Cherry Tycoon - Main Backend Canister
// Complete game implementation based on GDD specifications

import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Float "mo:base/Float";

import Types "types";
import GameLogic "game_logic";
import WeatherLogic "weather_logic";
import CompetitorLogic "competitor_logic";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

persistent actor CherryTycoon {
  
  
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
  transient let accessControlState = AccessControl.initState();

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

  // Player farms storage
  private transient var playerFarms = HashMap.HashMap<Principal, PlayerFarm>(
    10,
    Principal.equal,
    Principal.hash
  );

  // Global game state
  private transient var globalSeasonNumber : Nat = 1;
  private transient var baseRetailPrice : Nat = 15; // PLN per kg
  private transient var baseWholesalePrice : Nat = 10; // PLN per kg

  // Stable storage for upgrades
  private var stablePlayerFarms : [(Principal, PlayerFarm)] = [];
  private var stableSaturation : [(Text, (Nat, Int))] = [];
  private var stableGlobalSeason : Nat = 1;
  private var stableUserRoles : [(Principal, AccessControl.UserRole)] = [];
  private var stableAdminAssigned : Bool = false;

  system func preupgrade() {
    stablePlayerFarms := Iter.toArray(playerFarms.entries());
    stableSaturation := Iter.toArray(regionalMarketSaturation.entries());
    stableGlobalSeason := globalSeasonNumber;
    stableUserRoles := Iter.toArray(accessControlState.userRoles.entries());
    stableAdminAssigned := accessControlState.adminAssigned;
  };

  system func postupgrade() {
    playerFarms := HashMap.fromIter<Principal, PlayerFarm>(
      stablePlayerFarms.vals(),
      10,
      Principal.equal,
      Principal.hash
    );
    stablePlayerFarms := [];

    regionalMarketSaturation := HashMap.fromIter<Text, (Nat, Int)>(
      stableSaturation.vals(),
      16,
      Text.equal,
      Text.hash
    );
    stableSaturation := [];

    globalSeasonNumber := stableGlobalSeason;

    accessControlState.adminAssigned := stableAdminAssigned;
    accessControlState.userRoles := HashMap.fromIter<Principal, AccessControl.UserRole>(
      stableUserRoles.vals(),
      10,
      Principal.equal,
      Principal.hash
    );
    stableUserRoles := [];
  };

  // Market Saturation (Phase 4)
  // Map: RegionName -> (TotalKilogramsSold, LastUpdateTimestamp)
  private transient var regionalMarketSaturation = HashMap.HashMap<Text, (Nat, Int)>(
    16, Text.equal, Text.hash
  );

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

    // Check if player already exists
    switch (playerFarms.get(caller)) {
      case (?_) { return #Err(#AlreadyExists("Player already initialized")) };
      case null {};
    };

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
      cash = 50000; // Starting cash: 50,000 PLN
      level = 1;
      experience = 0;
      reputation = 50;
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

        let (laborType, upfrontCost) : (Types.LaborType, Nat) = switch (laborChoice) {
          case ("Village") { (#Village, 500) };
          case ("Standard") { (#Standard, 1500) };
          case ("City") { (#City, 3000) };
          case (_) { return #Err(#InvalidOperation("Invalid labor type. Choose 'Village', 'Standard', or 'City'")) };
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
            level = farm.level;
            experience = farm.experience;
            parcelCount = farm.parcels.size();
            totalTrees = trees;
            inventory = farm.inventory;
            currentSeason = farm.currentSeason;
            currentPhase = farm.currentPhase;
            weather = farm.weather;
            seasonNumber = farm.seasonNumber;
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
    let _ = playerFarms.delete(caller);
    #Ok("Player reset successfully")
  };

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
              case (?w) { GameLogic.applyWeatherImpact(baseHarvestedAmount, w.weather, w.severity) };
            };

            // Phase 5.7: Apply Labor Yield Multiplier (Int math to avoid Float module errors)
            let harvestedAmount : Nat = switch (farm.hiredLabor) {
              case (?#Village) { Int.abs((weatherAdjustedAmount * 9) / 10) };
              case (?#Standard) { Int.abs(weatherAdjustedAmount) };
              case (?#City) { Int.abs((weatherAdjustedAmount * 11) / 10) };
              case (?#Emergency) { Int.abs((weatherAdjustedAmount * 8) / 10) };
              case null { Int.abs(weatherAdjustedAmount) }; // Shouldn't happen due to advancePhase auto-assignment, fallback to 1.0x
            };

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
            let laborCostPerKg : Nat = switch (farm.hiredLabor) {
              case (?#Village) { 1 };
              case (?#Standard) { 2 };
              case (?#City) { 3 };
              case (?#Emergency) { 4 };
              case null { 2 }; // fallback
            };
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
        
        // Phase 5.7: Phase gate — watering allowed in Spring and Summer to combat early droughts
        if (farm.currentSeason != #Spring and farm.currentSeason != #Summer) {
          return #Err(#SeasonalRestriction("Watering only allowed in Spring or Summer. Current Season: " # debug_show(farm.currentSeason)));
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
    let totalCosts = fixedCosts + variableCosts;

    if (farm.cash < totalCosts) {
      return #Err(#InsufficientFunds { required = totalCosts; available = farm.cash });
    };

    // Advance season logic handled by parameters

    // Spoilage Logic (Phase 4)
    // Check for Cold Storage / Warehouse to prevent rotting in Winter
    var spoiledCherries : Nat = 0;
    
    // Use Iter to check for infrastructure presence
    // We use variables because we need to iterate once
    var hasColdStorage = false;
    var hasWarehouse = false;
    
    for (infra in farm.infrastructure.vals()) {
       switch (infra.infraType) {
         case (#ColdStorage) { hasColdStorage := true };
         case (#Warehouse) { hasWarehouse := true };
         case (_) {};
       };
    };

    if (farm.currentSeason == #Autumn) {
       if (not hasColdStorage and not hasWarehouse) {
          // 100% spoilage without any storage
          spoiledCherries := farm.inventory.cherries;
       } else if (hasWarehouse and not hasColdStorage) {
          // 80% spoilage with just basic warehouse
          spoiledCherries := (farm.inventory.cherries * 80) / 100;
       } else {
          // 20% spoilage with Cold Storage
          spoiledCherries := (farm.inventory.cherries * 20) / 100;
       };
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

    // Weather Logic (only triggers when entering Growth phase)
    let newWeather = if (nextPhase == #Growth) {
        let entropy = Int.abs(Time.now());
        WeatherLogic.generateWeatherEvent(nextSeason, entropy)
    } else {
        null
    };

    let updatedFarm = {
      farm with
      currentSeason = nextSeason;
      currentPhase = nextPhase;
      weather = newWeather;
      hiredLabor = null; // Phase 5.7: Reset labor for new season
      seasonNumber = farm.seasonNumber + 1;
      cash = Int.abs((farm.cash : Int) - (totalCosts : Int));
      parcels = updatedParcels;
      inventory = updatedInventory;
      statistics = updatedStats;
    };

    playerFarms.put(caller, updatedFarm);

    #Ok("Advanced to Season " # debug_show(nextSeason) # " (Year " # Nat.toText((farm.seasonNumber + 1)/4) # ")")
  };

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

            if (nextSeason != farm.currentSeason) {
                return await _advanceSeasonInternal(farm, caller, nextPhase, nextSeason);
            };

            // Weather Logic (only triggers when entering Growth phase)
            let newWeather = if (nextPhase == #Growth) {
                let entropy = Int.abs(Time.now());
                WeatherLogic.generateWeatherEvent(nextSeason, entropy)
            } else {
                farm.weather // Persist existing weather event until end of season
            };

            let finalFarm = {
                updatedFarm with
                currentPhase = nextPhase;
                currentSeason = nextSeason;
                weather = newWeather;
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
                " | AI Harvest Results: Marek=" # Nat.toText(_marekKg) # "kg, Kasia=" # Nat.toText(_kasiaKg) # "kg, Hans=" # Nat.toText(_hansKg) # "kg"
            } else { "" };
            
            #Ok("Advanced to phase: " # debug_show(nextPhase) # weatherMsg # aiText)
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

  // Get leaderboard: player farms + AI estimates, sorted by total revenue
  // SEC: bounded — iterates playerFarms (real players) + 3 fixed AI entries
  public query func getLeaderboard() : async [{ 
    name: Text; 
    totalRevenue: Nat; 
    profit: Int; 
    efficiency: Float; 
    isAI: Bool; 
    reputation: Nat;
    rank: Nat 
  }] {
    var entries = Buffer.Buffer<{ 
      name: Text; 
      totalRevenue: Nat; 
      profit: Int; 
      efficiency: Float; 
      isAI: Bool; 
      reputation: Nat 
    }>(10);

    // 1. Add real player farms
    for ((_, farm) in playerFarms.entries()) {
      let revenue = farm.statistics.totalRevenue;
      let costs = farm.statistics.totalCosts;
      
      // Calculate profit: revenue - costs (using Int subtraction)
      let profit : Int = (revenue : Int) - (costs : Int);
      
      // Calculate efficiency: Profit / Total Hectares
      var totalArea = 0.0;
      for (p in farm.parcels.vals()) {
        totalArea += p.size;
      };
      
      let efficiency = if (totalArea > 0.0) {
        Float.fromInt(profit) / totalArea
      } else {
        0.0
      };

      entries.add({
        name = farm.playerName;
        totalRevenue = revenue;
        profit = profit;
        efficiency = efficiency;
        isAI = false;
        reputation = farm.reputation;
      });
    };

    // 2. Add AI competitors with estimated metrics
    let competitors = CompetitorLogic.getCompetitorSummaries();
    for (ai in competitors.vals()) {
      // Estimate revenue: Capacity * 70% sold * baseline wholesale price (12 PLN/kg)
      let estimatedRevenue = (ai.baseCapacity * 70 / 100) * 12;
      
      // Estimate Profit: Assumed 40% margin
      // Note: (Nat * Nat) / Nat -> Nat. Then cast to Int.
      let estimatedProfit : Int = ((estimatedRevenue * 40) / 100) : Int;
      
      // Efficiency: Profit / Total Area
      let efficiency = if (ai.totalArea > 0.0) {
        Float.fromInt(estimatedProfit) / ai.totalArea
      } else {
        0.0
      };

      entries.add({
        name = ai.name;
        totalRevenue = estimatedRevenue;
        profit = estimatedProfit;
        efficiency = efficiency;
        isAI = true;
        reputation = ai.reputation;
      });
    };

    // 3. Sort descending by Profit (primary metric for ranking)
    let arr = Buffer.toArray(entries);
    let sorted = Array.sort(arr, func(
      a: { name: Text; totalRevenue: Nat; profit: Int; efficiency: Float; isAI: Bool; reputation: Nat }, 
      b: { name: Text; totalRevenue: Nat; profit: Int; efficiency: Float; isAI: Bool; reputation: Nat }
    ) : { #less; #equal; #greater } {
      if (a.profit > b.profit) { #less }
      else if (a.profit < b.profit) { #greater }
      else { #equal }
    });
    
    // 4. Assign Ranks
    // Note: Explicit return type annotation on lambda to avoid M0098 Unit error
    let ranked = Array.tabulate(sorted.size(), func(i: Nat) : { 
      name: Text; 
      totalRevenue: Nat; 
      profit: Int; 
      efficiency: Float; 
      isAI: Bool; 
      reputation: Nat;
      rank: Nat 
    } {
      let entry = sorted[i];
      {
        name = entry.name;
        totalRevenue = entry.totalRevenue;
        profit = entry.profit;
        efficiency = entry.efficiency;
        isAI = entry.isAI;
        reputation = entry.reputation;
        rank = i + 1;
      }
    });

    ranked
  };

  // ============================================================================
  // SPORTS CENTER (Phase 6 Stubs)
  // ============================================================================

  public shared query({ caller = _ }) func getAvailableFootballClubs() : async GameResult<[Types.FootballClub], GameError> {
    #Ok([])
  };

  public shared({ caller }) func buyClubShares(_clubId: Text, _amount: Nat) : async GameResult<Text, GameError> {
    if (Principal.isAnonymous(caller)) { return #Err(#Unauthorized("Anonymous callers not allowed")) };
    #Err(#InvalidOperation("Sports Center feature coming soon!"))
  };

}
