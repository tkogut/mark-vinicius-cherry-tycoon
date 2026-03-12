// Mark Vinicius Cherry Tycoon - Risk Management Logic
// Phase 7.0: Insurance Systems
// Producer: JaPiTo Group

import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Types "types";

module {

  // Annual premium for insurance policies
  // GDD §6: All-in covers all catastrophic events but cost 10% of total assets (simplified to fixed fee here)
  public func getPremium(policyType: Types.InsuranceType) : Nat {
    switch (policyType) {
      case (#Frost) { 2000 };
      case (#Drought) { 1500 };
      case (#Flood) { 3000 };
      case (#Pest) { 2500 };
      case (#AllIn) { 10_000 };
    }
  };

  // Payout calculation based on event type and severity
  public func calculatePayout(event: Types.WeatherEvent, policy: Types.InsurancePolicy) : Nat {
    if (policy.activeUntilSeason < event.season) return 0;
    
    let isCovered = switch (policy.category) {
      case (#AllIn) { true };
      case (#Frost) { event.weather == #Frost };
      case (#Drought) { event.weather == #Drought };
      case (#Flood) { event.weather == #Flood };
      case (#Pest) { event.weather == #PestOutbreak };
    };

    if (not isCovered) return 0;

    // Payout is scaled by severity (0.0 - 1.0)
    // base payout for catastrophic events is 50,000 PLN (GDD §6 estimate)
    let maxPayout = policy.payout;
    let computedPayout = Float.toInt(Float.fromInt(maxPayout) * event.severity);
    Int.abs(computedPayout)
  };

  public func generatePolicy(policyType: Types.InsuranceType, currentSeason: Nat) : Types.InsurancePolicy {
    let basePayout = switch (policyType) {
      case (#AllIn) { 100_000 };
      case (_) { 50_000 };
    };

    {
      id = "policy_" # debug_show(policyType) # "_" # Nat.toText(currentSeason);
      category = policyType;
      premium = getPremium(policyType);
      payout = basePayout;
      activeUntilSeason = currentSeason + 4; // Covers 1 Year
    }
  };

};
