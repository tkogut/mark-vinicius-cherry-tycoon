import Types "types";
import Int "mo:base/Int";

module MarketLogic {

  // CurrentPrice = (BasePrice * (100 + (Year * 5)) * (100 + RandomFluctuation)) / 10000
  // Base Prices: Fertilizer (50 PLN), Pesticide (120 PLN), Organic (200 PLN).
  // Inflation: +5% per year. Fluctuation: ±20%

  private func calculatePrice(basePrice: Nat, year: Nat, randomSeed: Nat) : Nat {
    // Generate a pseudo-random fluctuation between -20 and +20 based on seed
    // randomSeed modulo 41 gives 0 to 40. Subtract 20 to get -20 to +20.
    let randMod = randomSeed % 41;
    let fluctuationInt = (randMod : Int) - (20 : Int);
    
    let yearFactor = 100 + (year * 5);
    let fluctuationFactor = (100 : Int) + fluctuationInt;
    
    let priceInt = ((basePrice : Int) * (yearFactor : Int) * fluctuationFactor) / 10000;
    
    if (priceInt < 1) {
      return 1;
    };
    return Int.abs(priceInt);
  };

  public func generateInputPrices(year: Nat, randomSeed: Nat) : Types.InputMarket {
    return {
      year = year;
      // Offset the seed slightly for different inputs so prices don't fluctuate identically
      fertilizerPrice = calculatePrice(50, year, randomSeed);
      pesticidePrice = calculatePrice(120, year, randomSeed + 7);
      organicTreatmentPrice = calculatePrice(200, year, randomSeed + 13);
    };
  };

};
