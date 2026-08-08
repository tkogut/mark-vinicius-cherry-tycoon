// leaderboard_logic.mo — Phase 6.1: Prestige Score Engine
// Producer: JaPiTo Group
// Pure calculation module. No state. No imports required beyond base types.
// All math is strict integer precision (zero floating-point).

module {

  // ---------------------------------------------------------------------------
  // calculatePrestige
  // ---------------------------------------------------------------------------
  // Computes a player's or AI competitor's prestige score using integer math only.
  //
  // Formula:
  //   basePrestige = (totalRevenue / 100) + (infraLevelTotal * 10) + (seasonsCompleted * 50)
  //   organicBonus = basePrestige * 20 / 100  (+ 20% if any parcel is organically certified)
  //   finalPrestige = basePrestige + organicBonus
  //
  // Weights rationale:
  //   Revenue  — primary driver; scaled /100 to keep prestige human-readable (not astronomically large)
  //   Infra    — rewards long-term capital investment over pure revenue chasing
  //   Seasons  — rewards longevity / survival (+50 per season survived)
  //   Organic  — +20% multiplier, aligns with Kasia archetype premium and organic certification

  public func calculatePrestige(
    totalRevenue: Nat,
    infraLevelTotal: Nat,
    seasonsCompleted: Nat,
    isOrganic: Bool
  ) : Nat {
    let basePrestige : Nat =
      (totalRevenue / 100) +
      (infraLevelTotal * 10) +
      (seasonsCompleted * 50);

    if (isOrganic) {
      // +20% organic bonus — integer safe: multiply first, then divide
      let bonus = (basePrestige * 20) / 100;
      basePrestige + bonus
    } else {
      basePrestige
    }
  };

  // ---------------------------------------------------------------------------
  // sort (descending by prestige)
  // ---------------------------------------------------------------------------
  // Returns a comparison function suitable for Array.sort to order entries
  // from highest to lowest prestige. Motoko Array.sort is stable.

  public func compareDesc(a: { prestige: Nat }, b: { prestige: Nat }) : { #less; #equal; #greater } {
    if (a.prestige > b.prestige)      { #less    }  // "less" → a comes first
    else if (a.prestige < b.prestige) { #greater }  // "greater" → b comes first
    else                              { #equal   }
  };

}
