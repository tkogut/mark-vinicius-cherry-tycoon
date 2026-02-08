// Mark Vinicius Cherry Tycoon - Main Backend Canister
// Complete game implementation based on GDD specifications

import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Random "mo:base/Random";
import Blob "mo:base/Blob";
import Result "mo:base/Result";

import Types "types";
import GameLogic "game_logic";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

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
  type Result<T, E> = Types.Result<T, E>;
  type GameError = Types.GameError;

  // Authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Player farms storage
  private var playerFarms = HashMap.HashMap<Principal, PlayerFarm>(
    10,
    Principal.equal,
    Principal.hash
  );

  // Global game state
  private stable var globalSeasonNumber : Nat = 1;
  private stable var baseRetailPrice : Nat = 15; // PLN per kg
  private stable var baseWholesalePrice : Nat = 10; // PLN per kg
  private stable var totalMarketSupply : Nat = 0; // affects prices

  // Stable storage for upgrades
  private stable var stablePlayerFarms : [(Principal, PlayerFarm)] = [];

  system func preupgrade() {
    stablePlayerFarms := Iter.toArray(playerFarms.entries());
  };

  system func postupgrade() {
    playerFarms := HashMap.fromIter<Principal, PlayerFarm>(
      stablePlayerFarms.vals(),
      10,
      Principal.equal,
      Principal.hash
    );
    stablePlayerFarms := [];
  };

  // ============================================================================
  // PLAYER MANAGEMENT
  // ============================================================================

  // Initialize a new player
  public shared({ caller }) func initializePlayer(
    playerId: Text,
    playerName: Text
  ) : async Result<Text, Text> {
    
    // Check if player already exists
    switch (playerFarms.get(caller)) {
      case (?_) { return #Err("Player already initialized") };
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
        bestSeasonProfit = 0;
        averageYieldPerHa = 0.0;
      };
      currentSeason = #Spring;
      seasonNumber = 1;
      lastActive = Time.now();
    };

    playerFarms.put(caller, newFarm);
    #Ok("Player " # playerName # " initialized successfully with starter farm")
  };

  // Get player's farm
  public shared query({ caller }) func getPlayerFarm() : async Result<PlayerFarm, Text> {
    switch (playerFarms.get(caller)) {
      case (?farm) { #Ok(farm) };
      case null { #Err("Player not found. Please initialize first.") };
    }
  };

  // Get player statistics
  public shared query({ caller }) func getPlayerStats() : async Result<Statistics, Text> {
    switch (playerFarms.get(caller)) {
      case (?farm) { #Ok(farm.statistics) };
      case null { #Err("Player not found") };
    }
  };

  // ============================================================================
  // PARCEL OPERATIONS
  // ============================================================================

  // Harvest cherries from a parcel
  public shared({ caller }) func harvestCherries(parcelId: Text) : async Result<Nat, Text> {
    switch (playerFarms.get(caller)) {
      case null { return #Err("Player not found") };
      case (?farm) {
        
        // Find the parcel
        let parcelIndex = Array.indexOf<CherryParcel>(
          { id = parcelId; ownerId = ""; region = farm.parcels[0].region; soilType = #SandyClay; pH = 0.0; fertility = 0.0; permeability = 0.0; humidity = 0.0; size = 0.0; plantedTrees = 0; treeAge = 0; isOrganic = false; organicConversionSeason = 0; organicCertified = false; lastHarvest = 0; quality = 0; waterLevel = 0.0; lastFertilized = 0 },
          farm.parcels,
          func(a: CherryParcel, b: CherryParcel) : Bool { a.id == b.id }
        );

        switch (parcelIndex) {
          case null { return #Err("Parcel not found") };
          case (?index) {
            let parcel = farm.parcels[index];
            
            // Check if trees are planted
            if (parcel.plantedTrees == 0) {
              return #Err("No trees planted on this parcel");
            };
            
            // Check if already harvested this season
            if (parcel.lastHarvest == farm.seasonNumber) {
              return #Err("Parcel already harvested this season");
            };

            // Calculate yield (returns null if trees are dead)
            let harvestedAmountOpt = GameLogic.calculateYieldPotential(
              parcel,
              farm.infrastructure
            );

            let harvestedAmount = switch (harvestedAmountOpt) {
              case null { return #Err("Trees are too old (>40 years) and have died. Please replant.") };
              case (?amount) { amount };
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

            let updatedStats = {
              farm.statistics with
              totalHarvested = farm.statistics.totalHarvested + harvestedAmount;
            };

            // Add experience
            let xpGain = GameLogic.calculateExperienceGain("harvest", harvestedAmount);
            let newXp = farm.experience + xpGain;
            let newLevel = GameLogic.getLevelFromExperience(newXp);

            let updatedFarm = {
              farm with
              parcels = updatedParcels;
              inventory = updatedInventory;
              statistics = updatedStats;
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
  public shared({ caller }) func waterParcel(parcelId: Text) : async Result<Text, Text> {
    switch (playerFarms.get(caller)) {
      case null { return #Err("Player not found") };
      case (?farm) {
        
        let parcelIndex = Array.indexOf<CherryParcel>(
          { id = parcelId; ownerId = ""; region = farm.parcels[0].region; soilType = #SandyClay; pH = 0.0; fertility = 0.0; permeability = 0.0; humidity = 0.0; size = 0.0; plantedTrees = 0; treeAge = 0; isOrganic = false; organicConversionSeason = 0; organicCertified = false; lastHarvest = 0; quality = 0; waterLevel = 0.0; lastFertilized = 0 },
          farm.parcels,
          func(a: CherryParcel, b: CherryParcel) : Bool { a.id == b.id }
        );

        switch (parcelIndex) {
          case null { return #Err("Parcel not found") };
          case (?index) {
            let parcel = farm.parcels[index];
            
            // Cost of watering
            let waterCost = 200; // PLN
            if (farm.cash < waterCost) {
              return #Err("Insufficient funds");
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

            let updatedFarm = {
              farm with
              parcels = updatedParcels;
              cash = farm.cash - waterCost;
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
    fertilizerType: Text
  ) : async Result<Text, Text> {
    switch (playerFarms.get(caller)) {
      case null { return #Err("Player not found") };
      case (?farm) {
        
        // Check if has fertilizers
        if (farm.inventory.fertilizers == 0) {
          return #Err("No fertilizers in inventory");
        };

        let parcelIndex = Array.indexOf<CherryParcel>(
          { id = parcelId; ownerId = ""; region = farm.parcels[0].region; soilType = #SandyClay; pH = 0.0; fertility = 0.0; permeability = 0.0; humidity = 0.0; size = 0.0; plantedTrees = 0; treeAge = 0; isOrganic = false; organicConversionSeason = 0; organicCertified = false; lastHarvest = 0; quality = 0; waterLevel = 0.0; lastFertilized = 0 },
          farm.parcels,
          func(a: CherryParcel, b: CherryParcel) : Bool { a.id == b.id }
        );

        switch (parcelIndex) {
          case null { return #Err("Parcel not found") };
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
              fertilizers = farm.inventory.fertilizers - 1;
            };

            let updatedFarm = {
              farm with
              parcels = updatedParcels;
              inventory = updatedInventory;
            };

            playerFarms.put(caller, updatedFarm);
            #Ok("Parcel fertilized successfully")
          };
        };
      };
    }
  };

  // Plant trees on a parcel
  public shared({ caller }) func plantTrees(
    parcelId: Text,
    quantity: Nat
  ) : async Result<Text, Text> {
    switch (playerFarms.get(caller)) {
      case null { return #Err("Player not found") };
      case (?farm) {
        
        let costPerTree = 50; // PLN
        let totalCost = quantity * costPerTree;
        
        if (farm.cash < totalCost) {
          return #Err("Insufficient funds");
        };

        let parcelIndex = Array.indexOf<CherryParcel>(
          { id = parcelId; ownerId = ""; region = farm.parcels[0].region; soilType = #SandyClay; pH = 0.0; fertility = 0.0; permeability = 0.0; humidity = 0.0; size = 0.0; plantedTrees = 0; treeAge = 0; isOrganic = false; organicConversionSeason = 0; organicCertified = false; lastHarvest = 0; quality = 0; waterLevel = 0.0; lastFertilized = 0 },
          farm.parcels,
          func(a: CherryParcel, b: CherryParcel) : Bool { a.id == b.id }
        );

        switch (parcelIndex) {
          case null { return #Err("Parcel not found") };
          case (?index) {
            let parcel = farm.parcels[index];
            
            // Check tree density limit: 400 trees per hectare (from Caffeine)
            let maxTrees = Int.abs(Float.toInt(parcel.size * 400.0));
            let currentTrees = parcel.plantedTrees;
            
            if (currentTrees + quantity > maxTrees) {
              return #Err("Exceeds maximum tree density (400 trees per hectare). Max: " # Nat.toText(maxTrees) # ", Current: " # Nat.toText(currentTrees));
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

            let updatedFarm = {
              farm with
              parcels = updatedParcels;
              cash = farm.cash - totalCost;
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
  ) : async Result<Nat, Text> {
    switch (playerFarms.get(caller)) {
      case null { return #Err("Player not found") };
      case (?farm) {
        
        if (farm.inventory.cherries < quantity) {
          return #Err("Insufficient cherries in inventory");
        };

        // Calculate price based on sale type
        let pricePerKg = if (saleType == "retail") {
          let avgQuality = if (farm.parcels.size() > 0) {
            GameLogic.calculateQualityScore(farm.parcels[0], farm.infrastructure)
          } else { 50 };
          
          GameLogic.calculateRetailPrice(
            baseRetailPrice,
            0.8, // market size
            avgQuality,
            false // TODO: check if any parcels are organic
          )
        } else {
          GameLogic.calculateWholesalePrice(
            baseWholesalePrice,
            quantity,
            60 // average quality
          )
        };

        let revenue = quantity * pricePerKg;

        // Update inventory and statistics
        let updatedInventory = {
          farm.inventory with
          cherries = farm.inventory.cherries - quantity;
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

        let updatedFarm = {
          farm with
          inventory = updatedInventory;
          statistics = updatedStats;
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
  public shared query({ caller }) func getCashBalance() : async Result<Nat, Text> {
    switch (playerFarms.get(caller)) {
      case (?farm) { #Ok(farm.cash) };
      case null { #Err("Player not found") };
    }
  };

  // Get inventory
  public shared query({ caller }) func getInventory() : async Result<Inventory, Text> {
    switch (playerFarms.get(caller)) {
      case (?farm) { #Ok(farm.inventory) };
      case null { #Err("Player not found") };
    }
  };

  // ============================================================================
  // GAME PROGRESSION
  // ============================================================================

  // Advance to next season
  public shared({ caller }) func advanceSeason(
    weatherEvent: ?Text
  ) : async Result<Text, Text> {
    switch (playerFarms.get(caller)) {
      case null { return #Err("Player not found") };
      case (?farm) {
        
        // Calculate costs for the season
        let fixedCosts = GameLogic.calculateFixedCosts(farm.infrastructure);
        let variableCosts = GameLogic.calculateVariableCosts(
          farm.parcels,
          farm.parcels[0].region,
          false // TODO: check if has organic parcels
        );
        let totalCosts = fixedCosts + variableCosts;

        if (farm.cash < totalCosts) {
          return #Err("Insufficient funds to cover seasonal costs");
        };

        // Age trees by 1 year every 4 seasons
        let shouldAgeTrees = (farm.seasonNumber + 1) % 4 == 0;
        
        let updatedParcels = Array.map<CherryParcel, CherryParcel>(
          farm.parcels,
          func(parcel: CherryParcel) : CherryParcel {
            {
              parcel with
              treeAge = if (shouldAgeTrees) { parcel.treeAge + 1 } else { parcel.treeAge };
              waterLevel = parcel.waterLevel * 0.7; // water depletes
            }
          }
        );

        // Advance season
        let nextSeason = switch (farm.currentSeason) {
          case (#Spring) { #Summer };
          case (#Summer) { #Autumn };
          case (#Autumn) { #Winter };
          case (#Winter) { #Spring };
        };

        let updatedStats = {
          farm.statistics with
          totalCosts = farm.statistics.totalCosts + totalCosts;
          seasonsPlayed = farm.statistics.seasonsPlayed + 1;
        };

        let updatedFarm = {
          farm with
          currentSeason = nextSeason;
          seasonNumber = farm.seasonNumber + 1;
          cash = farm.cash - totalCosts;
          parcels = updatedParcels;
          statistics = updatedStats;
        };

        playerFarms.put(caller, updatedFarm);
        #Ok("Advanced to " # debug_show(nextSeason) # " (Season " # Nat.toText(farm.seasonNumber + 1) # ")")
      };
    }
  };

  // Upgrade infrastructure
  public shared({ caller }) func upgradeInfrastructure(
    infraType: Text
  ) : async Result<Text, Text> {
    switch (playerFarms.get(caller)) {
      case null { return #Err("Player not found") };
      case (?farm) {
        
        let cost = 10000; // Base cost for infrastructure
        
        if (farm.cash < cost) {
          return #Err("Insufficient funds");
        };

        // Create new infrastructure
        let newInfra : Infrastructure = {
          infraType = #Warehouse; // TODO: parse infraType string
          level = 1;
          purchasedSeason = farm.seasonNumber;
          maintenanceCost = 500;
        };

        let updatedInfrastructure = Array.append<Infrastructure>(
          farm.infrastructure,
          [newInfra]
        );

        // Add experience
        let xpGain = GameLogic.calculateExperienceGain("upgrade", 1);
        let newXp = farm.experience + xpGain;
        let newLevel = GameLogic.getLevelFromExperience(newXp);

        let updatedFarm = {
          farm with
          infrastructure = updatedInfrastructure;
          cash = farm.cash - cost;
          experience = newXp;
          level = newLevel;
        };

        playerFarms.put(caller, updatedFarm);
        #Ok("Infrastructure upgraded successfully")
      };
    }
  };

  // ============================================================================
  // PARCEL PURCHASE (from Caffeine AI)
  // ============================================================================

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
  ) : async Result<Text, Text> {
    
    switch (playerFarms.get(caller)) {
      case null { return #Err("Player not found") };
      case (?farm) {
        
        // Calculate cost: 60,000 PLN per hectare (from Caffeine)
        let cost = Int.abs(Float.toInt(size * 60000.0));
        
        if (farm.cash < cost) {
          return #Err("Insufficient funds. Need " # Nat.toText(cost) # " PLN");
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
        
        let updatedFarm = {
          farm with
          parcels = updatedParcels;
          cash = farm.cash - cost;
        };
        
        playerFarms.put(caller, updatedFarm);
        #Ok(parcelId)
      };
    }
  };

  // Start organic conversion (from Caffeine AI)
  public shared({ caller }) func startOrganicConversion(
    parcelId: Text
  ) : async Result<Text, Text> {
    
    switch (playerFarms.get(caller)) {
      case null { return #Err("Player not found") };
      case (?farm) {
        
        let (parcelOpt, indexOpt) = findParcelIndex(farm.parcels, parcelId);
        
        switch (parcelOpt, indexOpt) {
          case (null, _) { return #Err("Parcel not found") };
          case (?parcel, ?index) {
            
            if (parcel.isOrganic) {
              return #Err("Parcel is already in organic conversion");
            };
            
            let updatedParcel = {
              parcel with
              isOrganic = true;
              organicConversionSeason = farm.seasonNumber;
            };
            
            let updatedParcels = Array.tabulate<CherryParcel>(
              farm.parcels.size(),
              func(i: Nat) : CherryParcel {
                if (i == index) { updatedParcel } else { farm.parcels[i] }
              }
            );
            
            let updatedFarm = {
              farm with
              parcels = updatedParcels;
            };
            
            playerFarms.put(caller, updatedFarm);
            #Ok("Organic conversion started. Certification will be granted after 2 seasons.")
          };
          case (?_, null) { return #Err("Parcel not found") };
        };
      };
    }
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
}
