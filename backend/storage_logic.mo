import Types "types";

module StorageLogic {

  // Decay Formula: FinalSpoilage = (BaseRate * 100) / handlingQuality
  // Higher quality labor directly slows down fruit spoilage.

  // calculateSpoilage expects baseRate as a percentage integer (e.g. 15 for 15%)
  public func calculateSpoilage(baseRate: Nat, handlingQuality: Nat) : Nat {
    if (handlingQuality == 0) {
      return baseRate; // Fallback to avoid div by zero
    };
    return (baseRate * 100) / handlingQuality;
  };
  
  // Applies spoilage to an inventory quantity
  public func applySpoilage(amount: Nat, spoilageRate: Nat) : Nat {
    let spoiledAmount = (amount * spoilageRate) / 100;
    if (spoiledAmount >= amount) {
      return 0;
    };
    return amount - spoiledAmount;
  };

};
