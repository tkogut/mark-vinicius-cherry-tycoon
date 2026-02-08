// Mark Vinicius Cherry Tycoon - Game Logic and Formulas
// All calculations based on GDD specifications

import Float "mo:base/Float";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Types "types";

module {
  type CherryParcel = Types.CherryParcel;
  type SoilType = Types.SoilType;
  type Infrastructure = Types.Infrastructure;
  type InfrastructureType = Types.InfrastructureType;
  type MarketPrice = Types.MarketPrice;
  type Region = Types.Region;
  type CommuneType = Types.CommuneType;

  // ============================================================================
  // YIELD CALCULATION (GDD Section 1 - Yield Potential Formula)
  // ============================================================================

  // Tree age modifier (from Caffeine AI - realistic progression)
  public func getTreeAgeModifier(treeAge: Nat) : ?Float {
    if (treeAge == 0) { ?0.0 }        // Newly planted - no harvest
    else if (treeAge == 1) { ?0.33 }  // Year 1 - 33% yield
    else if (treeAge == 2) { ?0.66 }  // Year 2 - 66% yield
    else if (treeAge >= 3 and treeAge <= 40) { ?1.0 }  // Peak production
    else if (treeAge > 40) { null }   // Trees too old - dead
    else { ?1.0 }
  };

  // Base yield per hectare by tree age
  private func getBaseYield(treeAge: Nat) : Float {
    if (treeAge < 3) { 2.0 }      // young trees
    else if (treeAge < 7) { 8.0 }  // growing
    else if (treeAge < 15) { 12.0 } // peak production
    else if (treeAge < 25) { 10.0 } // mature
    else { 6.0 }                    // old trees
  };

  // Soil type modifier
  private func getSoilModifier(soilType: SoilType) : Float {
    switch (soilType) {
      case (#SandyClay) { 1.0 };    // optimal
      case (#Clay) { 0.9 };
      case (#Sandy) { 0.85 };
      case (#Waterlogged) { 0.6 };  // worst
    }
  };

  // pH modifier (optimal 6.0-7.0)
  private func getPhModifier(pH: Float) : Float {
    if (pH >= 6.0 and pH <= 7.0) { 1.0 }
    else if (pH >= 5.5 and pH < 6.0) { 0.9 }
    else if (pH > 7.0 and pH <= 7.5) { 0.9 }
    else { 0.7 } // very poor pH
  };

  // Infrastructure modifier
  private func getInfrastructureModifier(infrastructure: [Infrastructure]) : Float {
    var modifier : Float = 1.0;
    
    for (infra in infrastructure.vals()) {
      switch (infra.infraType) {
        case (#Tractor) { modifier += 0.05 * Float.fromInt(infra.level) };
        case (#Shaker) { modifier += 0.08 * Float.fromInt(infra.level) };
        case (#Sprayer) { modifier += 0.03 * Float.fromInt(infra.level) };
        case (#ColdStorage) { modifier += 0.02 * Float.fromInt(infra.level) };
        case (_) { /* other infrastructure doesn't affect yield */ };
      };
    };
    
    modifier
  };

  // Main yield calculation: PP = Base × Soil × pH × Fertility × Infrastructure × TreeAge
  // Returns null if trees are too old (>40 years)
  public func calculateYieldPotential(
    parcel: CherryParcel,
    infrastructure: [Infrastructure]
  ) : ?Nat {
    // Check tree age first
    let ageModifier = switch (getTreeAgeModifier(parcel.treeAge)) {
      case null { return null };  // Trees dead (>40 years)
      case (?mod) { mod };
    };
    
    let baseYield = getBaseYield(parcel.treeAge);
    let soilMod = getSoilModifier(parcel.soilType);
    let phMod = getPhModifier(parcel.pH);
    let fertilityMod = parcel.fertility;
    let infraMod = getInfrastructureModifier(infrastructure);
    
    // Water level impact
    let waterMod = if (parcel.waterLevel < 0.3) { 0.7 }
                   else if (parcel.waterLevel > 0.8) { 0.85 }
                   else { 1.0 };
    
    // Organic penalty (GDD Section 5: -15% to -25%)
    let organicMod = if (parcel.isOrganic) { 0.8 } else { 1.0 };
    
    let totalYield = baseYield * soilMod * phMod * fertilityMod * infraMod * waterMod * organicMod * ageModifier;
    let yieldPerHa = totalYield * parcel.size;
    
    ?Int.abs(Float.toInt(yieldPerHa * 1000.0)) // convert tons to kg
  };

  // ============================================================================
  // PRICE CALCULATION (GDD Section 1.1)
  // ============================================================================

  // Retail price: Base × MarketSize × Quality × Organic
  public func calculateRetailPrice(
    basePrice: Nat,
    marketSize: Float,
    quality: Nat,
    isOrganic: Bool
  ) : Nat {
    let qualityBonus = 1.0 + (Float.fromInt(quality) / 100.0 * 0.3); // up to +30%
    let organicPremium = if (isOrganic) { 1.4 } else { 1.0 }; // +40% for organic
    
    let finalPrice = Float.fromInt(basePrice) * marketSize * qualityBonus * organicPremium;
    Int.abs(Float.toInt(finalPrice))
  };

  // Wholesale price: Base × 0.7 × VolumeDiscount
  public func calculateWholesalePrice(
    basePrice: Nat,
    quantity: Nat,
    quality: Nat
  ) : Nat {
    let wholesaleMultiplier = 0.7;
    
    // Volume discount: larger quantities get slightly better price
    let volumeBonus = if (quantity > 10000) { 1.05 }
                      else if (quantity > 5000) { 1.02 }
                      else { 1.0 };
    
    // Small quality bonus for wholesale
    let qualityBonus = 1.0 + (Float.fromInt(quality) / 100.0 * 0.1); // up to +10%
    
    let finalPrice = Float.fromInt(basePrice) * wholesaleMultiplier * volumeBonus * qualityBonus;
    Int.abs(Float.toInt(finalPrice))
  };

  // ============================================================================
  // COST CALCULATION (GDD Section 1.2)
  // ============================================================================

  // Fixed costs per season
  public func calculateFixedCosts(infrastructure: [Infrastructure]) : Nat {
    var total : Nat = 0;
    
    // Base administration cost
    total += 5000; // PLN per season
    
    // Infrastructure maintenance
    for (infra in infrastructure.vals()) {
      total += infra.maintenanceCost;
    };
    
    total
  };

  // Variable costs: fertilizers, fuel, labor
  public func calculateVariableCosts(
    parcels: [CherryParcel],
    region: Region,
    hasOrganic: Bool
  ) : Nat {
    var total : Nat = 0;
    var totalArea : Float = 0.0;
    
    for (parcel in parcels.vals()) {
      totalArea += parcel.size;
      
      // Fertilizer costs
      if (parcel.isOrganic) {
        total += Int.abs(Float.toInt(parcel.size * 3000.0)); // organic fertilizers more expensive
      } else {
        total += Int.abs(Float.toInt(parcel.size * 1500.0)); // conventional
      };
      
      // Plant protection
      if (parcel.isOrganic) {
        total += Int.abs(Float.toInt(parcel.size * 2000.0)); // natural treatments
      } else {
        total += Int.abs(Float.toInt(parcel.size * 1000.0)); // pesticides
      };
    };
    
    // Labor costs (varies by region)
    let laborCost = Int.abs(Float.toInt(totalArea * 8000.0 * region.laborCostMultiplier));
    total += laborCost;
    
    // Fuel costs
    total += Int.abs(Float.toInt(totalArea * 500.0));
    
    // Organic certification (GDD Section 5)
    if (hasOrganic) {
      if (totalArea < 5.0) { total += 1500 }
      else if (totalArea < 20.0) { total += 1800 }
      else if (totalArea < 50.0) { total += 2090 }
      else { total += 2500 };
    };
    
    total
  };

  // ============================================================================
  // QUALITY CALCULATION (Orchard Quality Score 0-100)
  // ============================================================================

  public func calculateQualityScore(
    parcel: CherryParcel,
    infrastructure: [Infrastructure]
  ) : Nat {
    var score : Float = 50.0; // base
    
    // Soil quality
    score += getSoilModifier(parcel.soilType) * 10.0;
    score += getPhModifier(parcel.pH) * 10.0;
    score += parcel.fertility * 10.0;
    
    // Water management
    if (parcel.waterLevel >= 0.4 and parcel.waterLevel <= 0.7) {
      score += 10.0;
    };
    
    // Infrastructure bonuses
    var hasSpray = false;
    var hasColdStorage = false;
    
    for (infra in infrastructure.vals()) {
      switch (infra.infraType) {
        case (#Sprayer) { hasSpray := true; score += 5.0 * Float.fromInt(infra.level) };
        case (#ColdStorage) { hasColdStorage := true; score += 3.0 * Float.fromInt(infra.level) };
        case (_) {};
      };
    };
    
    // Tree age (peak at 7-15 years)
    if (parcel.treeAge >= 7 and parcel.treeAge <= 15) {
      score += 10.0;
    };
    
    // Cap at 100
    let finalScore = if (score > 100.0) { 100.0 } else { score };
    Int.abs(Float.toInt(finalScore))
  };

  // ============================================================================
  // ORGANIC CONVERSION (GDD Section 5)
  // ============================================================================

  public func canCertifyOrganic(
    parcel: CherryParcel,
    currentSeason: Nat
  ) : Bool {
    if (not parcel.isOrganic) { return false };
    if (parcel.organicCertified) { return true };
    
    // Need 2 seasons of conversion
    let seasonsSinceConversion = (currentSeason : Int) - (parcel.organicConversionSeason : Int);
    seasonsSinceConversion >= 2
  };

  // ============================================================================
  // WEATHER IMPACT
  // ============================================================================

  public func applyWeatherImpact(
    baseYield: Nat,
    weather: Types.Weather,
    severity: Float
  ) : Nat {
    let impact = switch (weather) {
      case (#Sunny) { 1.0 };
      case (#Rainy) { 0.95 - (severity * 0.1) }; // slight reduction
      case (#Frost) { 0.6 - (severity * 0.3) };  // major damage
      case (#Drought) { 0.7 - (severity * 0.2) };
      case (#Heatwave) { 0.8 - (severity * 0.15) };
    };
    
    Int.abs(Float.toInt(Float.fromInt(baseYield) * impact))
  };

  // ============================================================================
  // EXPERIENCE AND LEVELING
  // ============================================================================

  public func calculateExperienceGain(
    action: Text,
    quantity: Nat
  ) : Nat {
    switch (action) {
      case ("harvest") { quantity / 100 }; // 1 XP per 100kg
      case ("plant") { quantity * 2 };     // 2 XP per tree
      case ("sell") { quantity / 1000 };   // 1 XP per 1000 PLN
      case ("upgrade") { 50 };             // 50 XP per upgrade
      case (_) { 0 };
    }
  };

  public func getLevelFromExperience(xp: Nat) : Nat {
    // Level = sqrt(XP / 100)
    var level : Nat = 1;
    var threshold : Nat = 100;
    
    while (xp >= threshold and level < 100) {
      level += 1;
      threshold := level * level * 100;
    };
    
    level
  };
}
