// Mark Vinicius Cherry Tycoon - Hiring Logic
// Encapsulates labor costs and harvest multipliers based on GDD parameters

import Types "types";
import Int "mo:base/Int";

module {
  type GameResult<T, E> = Types.Result<T, E>;
  type GameError = Types.GameError;
  type LaborType = Types.LaborType;

  // Process a hiring request to validate and get the labor type and upfront cost
  public func processHireLabor(laborChoice: Text) : GameResult<(LaborType, Nat), GameError> {
    switch (laborChoice) {
      case ("Village") { #Ok((#Village, 500)) };
      case ("Standard") { #Ok((#Standard, 1500)) };
      case ("City") { #Ok((#City, 3000)) };
      case (_) { #Err(#InvalidOperation("Invalid labor type. Choose 'Village', 'Standard', or 'City'")) };
    }
  };

  // Calculate the per-kg cost for harvest based on chosen labor
  public func calculateHarvestLaborCost(laborTypeOpt: ?LaborType) : Nat {
    switch (laborTypeOpt) {
      case (?#Village) { 1 };
      case (?#Standard) { 2 };
      case (?#City) { 3 };
      case (?#Emergency) { 4 };
      case null { 4 }; // Fallback to Emergency rate if missing
    }
  };

  // Calculate the yield multiplier for harvest based on chosen labor
  // Uses integer arithmetic to avoid Float incompatibilities
  public func applyHarvestLaborMultiplier(baseAmount: Nat, laborTypeOpt: ?LaborType) : Nat {
    switch (laborTypeOpt) {
      case (?#Village) { Int.abs((baseAmount * 9) / 10) };
      case (?#Standard) { Int.abs(baseAmount) };
      case (?#City) { Int.abs((baseAmount * 11) / 10) };
      case (?#Emergency) { Int.abs((baseAmount * 8) / 10) };
      case null { Int.abs((baseAmount * 8) / 10) }; // Fallback to Emergency penalty
    }
  };

  // Determine handling quality for storage logic based on the labor type
  // Higher value decreases spoilage: FinalSpoilage = (BaseRate * 100) / handlingQuality
  public func getHandlingQuality(labor: ?LaborType) : Nat {
    switch (labor) {
      case (?#Village) { 80 };       // Penalty
      case (?#Standard) { 100 };     // Neutral
      case (?#City) { 120 };         // Bonus
      case (?#Emergency) { 70 };     // Severe Penalty
      case (null) { 70 };            // Unhired defaults to severe penalty
    }
  };
}
