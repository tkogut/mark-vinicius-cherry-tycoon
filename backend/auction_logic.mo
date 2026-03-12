// Mark Vinicius Cherry Tycoon — Auction Logic
// Phase 8.0: The Competitive Pool — Imperial Contracts & Market Rivalry
// Producer: JaPiTo Group
//
// PURE MODULE — no actor, no stable storage, no caller-auth.
// All auth guards (isAnonymous) are enforced in main.mo / main_mainnet.mo at call-site.
//
// Sub-systems:
//   A) Pre-Season Futures: Lock-in price with 5-10% Security Discount
//   B) Post-Harvest Imperial Contracts: Closed-bid auction (V_bid formula)
//   C) Shortfall Resolution: Market Buyback (Spot×1.25) or Financial Default (150%)
//   D) AI Archetype Bidding: Marek (undercutter), Kasia (bio), Hans (trap)
//   E) Market Saturation (Flood Factor): SpotPrice -= 0.1% per uncontracted kg
//
// MATH POLICY:
//   NO floats. All ratios use scaled integers (×1000 or ×100).
//   All Nat subtractions guarded with if-checks or Int.abs.
//   V_bid = (P_base - P_offer) × (1000 + Prestige) × QualityMult / 100

import Nat    "mo:base/Nat";
import Int    "mo:base/Int";
import Text   "mo:base/Text";
import Array  "mo:base/Array";
import Types  "types";

module {

  // ============================================================================
  // CONSTANTS
  // ============================================================================

  // Pre-Season security discount: 7% (93/100 of basePricePLN)
  private let PRE_SEASON_DISCOUNT_NUM : Nat = 93;
  private let PRE_SEASON_DISCOUNT_DEN : Nat = 100;

  // Commitment fee for Pre-Season Future: 10% of (lockedPrice × requiredVolume) (Audit recommendation)
  private let COMMITMENT_FEE_NUM : Nat = 10;
  private let COMMITMENT_FEE_DEN : Nat = 100;

  // Buyback premium for shortfall: Spot × 1.25 (= × 125 / 100)
  private let BUYBACK_PREMIUM_NUM : Nat = 125;
  private let BUYBACK_PREMIUM_DEN : Nat = 100;

  // Default penalty: 200% of undelivered value (Audit recommendation)
  private let DEFAULT_PENALTY_NUM : Nat = 200;
  private let DEFAULT_PENALTY_DEN : Nat = 100;

  // Prestige / Reputation hit per default event: 10% reduction (floor = 0)
  private let PRESTIGE_PENALTY_PCT : Nat = 10;

  // Market Saturation (Flood Factor): SpotPrice falls 0.1% per uncontracted kg
  // Represented as: newSpot = spot × (1000 - floodUnits) / 1000
  // floodUnits capped at 900 to preserve a 10% price floor.
  private let FLOOD_DENOM : Nat = 1000;
  private let FLOOD_FLOOR_UNITS : Nat = 900; // cap: max 90% degradation

  // Partial volume trickle-down: runner-up gets 20% of remaining volume (reserved for future full trickle impl)
  private let _RUNNER_UP_TRICKLE_NUM : Nat = 20;
  private let _RUNNER_UP_TRICKLE_DEN : Nat = 100;

  // Industrial contract: price-insensitive — basePricePLN set at flat 3 PLN/kg
  private let INDUSTRIAL_BASE_PRICE : Nat = 3;

  // Default spot price used for shortfall if no market price passed in
  private let DEFAULT_SPOT_PLN : Nat = 5;

  // ============================================================================
  // DETERMINISTIC RANDOM HELPER (LCG — same pattern as competitor_logic.mo)
  // a=1664525, c=1013904223, m=2^32
  // SEC: Pure arithmetic. No unbounded loops. No Nat underflow.
  // ============================================================================

  private let LCG_A : Nat = 1664525;
  private let LCG_C : Nat = 1013904223;
  private let LCG_M : Nat = 4294967296; // 2^32

  private func lcgNext(seed: Nat) : (Nat, Nat) {
    let newSeed = (LCG_A * seed + LCG_C) % LCG_M;
    // Return (newSeed, r) where r ∈ [0, 999] — a 0-999 integer rand value
    let r = newSeed % 1000;
    (newSeed, r)
  };

  // ============================================================================
  // A) PRE-SEASON FUTURES
  // ============================================================================

  // Calculate the locked-in price for a Pre-Season Future.
  // lockedPricePLN = basePricePLN × PRE_SEASON_DISCOUNT_NUM / PRE_SEASON_DISCOUNT_DEN
  // Example: basePricePLN=7 → locked=7×93/100=6 (truncated)
  // SEC: Pure Nat division — no underflow possible.
  public func calcLockedPrice(basePricePLN: Nat) : Nat {
    (basePricePLN * PRE_SEASON_DISCOUNT_NUM) / PRE_SEASON_DISCOUNT_DEN
  };

  // Calculate the commitment fee (5% of total locked-in contract value).
  // fee = lockedPrice × requiredVolumeKg × 5 / 100
  // SEC: Pure Nat multiplication; large but within Nat128 bounds for typical values.
  public func calcCommitmentFee(lockedPricePLN: Nat, requiredVolumeKg: Nat) : Nat {
    (lockedPricePLN * requiredVolumeKg * COMMITMENT_FEE_NUM) / COMMITMENT_FEE_DEN
  };

  // Build a Pre-Season Future contract ready for #Planning phase commitment.
  // Returns the AuctionContract template — actual commitment recorded in main.mo.
  public func buildPreSeasonContract(
    idx      : Nat,
    season   : Nat,
    category : Types.ContractCategory
  ) : Types.AuctionContract {
    let basePrice : Nat = switch (category) {
      case (#Export)     { 6 };   // 6 PLN/kg baseline
      case (#Bio)        { 9 };   // 9 PLN/kg — organic premium
      case (#Industrial) { INDUSTRIAL_BASE_PRICE }; // 3 PLN/kg flat
    };
    let required : Nat = switch (category) {
      case (#Export)     { 10_000 };
      case (#Bio)        { 5_000  };
      case (#Industrial) { 20_000 };
    };
    let locked = calcLockedPrice(basePrice);
    {
      id               = "psf_S" # Nat.toText(season) # "_" # Nat.toText(idx);
      category         = category;
      requiredVolumeKg = required;
      basePricePLN     = basePrice;
      status           = #Open;
      winnerPlayerId   = null;
      winnerBidPLN     = null;
      awardedSeason    = null;
      isPreSeason      = true;
      lockedPricePLN   = ?locked;
      committedByPlayer= null;
      shortfallKg      = null;
    }
  };

  // ============================================================================
  // B) POST-HARVEST IMPERIAL CONTRACT GENERATION
  // ============================================================================

  // Generate 3–5 Imperial Contracts for a given harvest season.
  // Always: 1 Export, 1 Bio, 1–3 Industrial (count driven by entropy).
  // SEC: Array.tabulate bounded to max 5. No loops over unknown size.
  public func generateImperialContracts(season: Nat, entropy: Nat) : [Types.AuctionContract] {
    // Determine Industrial count: 1–3 based on entropy
    let (_, r0) = lcgNext(entropy);
    let industrialCount : Nat = 1 + (r0 % 3); // 1, 2, or 3

    // Build the 3 base contracts (Export, Bio, 1st Industrial)
    let export1 = buildPostHarvestContract(0, season, #Export, entropy);
    let bio1    = buildPostHarvestContract(1, season, #Bio, entropy + 1);
    let ind1    = buildPostHarvestContract(2, season, #Industrial, entropy + 2);

    // Optional 2nd Industrial
    let ind2Opt : [Types.AuctionContract] = if (industrialCount >= 2) {
      [buildPostHarvestContract(3, season, #Industrial, entropy + 3)]
    } else { [] };

    // Optional 3rd Industrial
    let ind3Opt : [Types.AuctionContract] = if (industrialCount >= 3) {
      [buildPostHarvestContract(4, season, #Industrial, entropy + 4)]
    } else { [] };

    Array.flatten([[export1, bio1, ind1], ind2Opt, ind3Opt])
  };

  // Build a single Post-Harvest Imperial Contract.
  // basePricePLN scales slightly by season number (simulate market cycles — integer only).
  private func buildPostHarvestContract(
    idx      : Nat,
    season   : Nat,
    category : Types.ContractCategory,
    entropy  : Nat
  ) : Types.AuctionContract {
    // Season cycle premium: every 4 seasons adds 1 PLN (capped to avoid runaway)
    let cycleBonus : Nat = (season / 4) % 5; // 0–4 PLN extra
    let (_, r) = lcgNext(entropy + idx);

    let basePrice : Nat = switch (category) {
      case (#Export)     { 7 + cycleBonus + (r % 2) }; // 7–13 PLN/kg range
      case (#Bio)        { 10 + cycleBonus + (r % 3) }; // 10–17 PLN/kg range
      case (#Industrial) { 
        // Industrial: 3 PLN average, fluctuates ±1 PLN
        let fluctuation = (r % 3); // 0, 1, 2
        if (fluctuation == 0) INDUSTRIAL_BASE_PRICE - 1 // 2 PLN
        else if (fluctuation == 2) INDUSTRIAL_BASE_PRICE + 1 // 4 PLN
        else INDUSTRIAL_BASE_PRICE // 3 PLN
      };
    };
    let required : Nat = switch (category) {
      case (#Export)     { 15_000 };
      case (#Bio)        { 6_000  };
      case (#Industrial) { 25_000 };
    };
    {
      id               = "imp_S" # Nat.toText(season) # "_" # Nat.toText(idx);
      category         = category;
      requiredVolumeKg = required;
      basePricePLN     = basePrice;
      status           = #Open;
      winnerPlayerId   = null;
      winnerBidPLN     = null;
      awardedSeason    = null;
      isPreSeason      = false;
      lockedPricePLN   = null;
      committedByPlayer= null;
      shortfallKg      = null;
    }
  };

  // ============================================================================
  // C) CORE V_bid FORMULA — calculateBidAttractiveness
  // ============================================================================
  //
  // GDD formula: V_bid = (P_base - P_offer) × (1 + Prestige/1000) × QualityBonus
  //
  // Scaled integer implementation (×1000 precision):
  //   margin          = pBase - pOffer        (Nat; guarded: returns 0 if pOffer > pBase)
  //   prestigeFactor  = 1000 + prestige       (represents (1 + prestige/1000) × 1000)
  //   qualityMult     = 120 for organic Bio; 100 otherwise
  //   score           = margin × prestigeFactor × qualityMult / 100
  //
  // Higher score = MORE attractive to the Imperial Buyer.
  // SEC: Single guard on pOffer > pBase. No Nat underflow. No floats. No loops.
  public func calculateBidAttractiveness(
    pBase        : Nat,
    pOffer       : Nat,
    prestige     : Nat,
    isOrganic    : Bool,
    isBioContract: Bool
  ) : Nat {
    // Guard: invalid bid (offer exceeds base) → score 0
    if (pOffer > pBase) return 0;

    let margin         : Nat = pBase - pOffer;   // Safe: guarded above
    let prestigeFactor : Nat = 1500 + prestige;  // Audit: 1.5x weight (base 1500 instead of 1000)
    let qualityMult    : Nat = if (isOrganic and isBioContract) 120 else 100;

    // The /100 cancels the qualityMult denominator (×120/100 = 1.2x, ×100/100 = 1.0x)
    (margin * prestigeFactor * qualityMult) / 100
  };

  // ============================================================================
  // D) AI ARCHETYPE BIDDING BEHAVIOR
  // ============================================================================
  //
  // Each archetype follows GDD logic:
  //   Marek:  Aggressive undercutter. Bids 15-25% below base (drops margin to win volume).
  //           Skips Pre-Season risk. Reputation=60. Not organic → no Bio contracts.
  //   Kasia:  Bio specialist. Only bids Bio contracts at ~5% below base.
  //           Pre-Season committed on Organic. Reputation=85. Organic=true.
  //   Hans:   Trap logic. Only bids when holding 120% of required volume.
  //           Prices at base minus 5%. Waits for defaults. Reputation=72.

  // Returns a Bid for Marek on the given contract, or null if archetype skips it.
  // SEC: All calculations Nat. No Float. lcgNext bounded (1 call).
  public func getMarekBid(contract: Types.AuctionContract, entropy: Nat, season: Nat) : ?Types.Bid {
    // Marek skips Bio contracts (not organic) and Pre-Season Futures
    switch (contract.category) {
      case (#Bio) return null;
      case (_) {};
    };
    if (contract.isPreSeason) return null;

    let (_, r) = lcgNext(entropy + 42);
    // Undercutting: offer between 75-85% of base (i.e., 15-25% discount)
    // r ∈ [0,999] → discount ∈ [15,25] (scaled: 750–850 of 1000)
    let discount10 : Nat = 15 + (r % 11); // 15..25
    let offerPrice : Nat = (contract.basePricePLN * (100 - discount10)) / 100;
    let safeOffer  : Nat = if (offerPrice == 0) 1 else offerPrice;

    ?{
      contractId        = contract.id;
      bidderId          = "ai_marek_GL02";
      isAI              = true;
      offerPricePLN     = safeOffer;
      volumeCommittedKg = contract.requiredVolumeKg;
      isOrganic         = false;
      globalPrestige    = 60;
      localReputation   = 60;
      submittedSeason   = season;
    }
  };

  // Returns a Bid for Kasia — Bio specialist. Only bids Bio contracts.
  public func getKasiaBid(contract: Types.AuctionContract, _entropy: Nat, season: Nat) : ?Types.Bid {
    // Kasia ONLY bids Bio contracts
    switch (contract.category) {
      case (#Bio) {};
      case (_) return null;
    };
    if (contract.isPreSeason) return null;

    // Offer at 95% of base (5% below) to protect premium positioning
    let offerPrice : Nat = (contract.basePricePLN * 95) / 100;
    let safeOffer  : Nat = if (offerPrice == 0) 1 else offerPrice;

    ?{
      contractId        = contract.id;
      bidderId          = "ai_kasia_NM01";
      isAI              = true;
      offerPricePLN     = safeOffer;
      volumeCommittedKg = contract.requiredVolumeKg;
      isOrganic         = true;    // Kasia is always organic → QualityBonus in Bio
      globalPrestige    = 85;
      localReputation   = 85;
      submittedSeason   = season;
    }
  };

  // Returns a Bid for Hans — only bids when he holds 120% of required volume.
  // hansStorageKg simulates his inventory (passed from caller; stable state in main.mo).
  public func getHansBid(
    contract      : Types.AuctionContract,
    _entropy      : Nat,
    season        : Nat,
    hansStorageKg : Nat
  ) : ?Types.Bid {
    // Hans skips Bio (not organic) and Pre-Season Futures
    switch (contract.category) {
      case (#Bio) return null;
      case (_) {};
    };
    if (contract.isPreSeason) return null;

    // Trap logic: only enter if holding 120% of required volume
    let threshold120 : Nat = (contract.requiredVolumeKg * 120) / 100;
    if (hansStorageKg < threshold120) return null;

    // Hans bids at base minus 5% — confident, not desperate
    let offerPrice : Nat = (contract.basePricePLN * 95) / 100;
    let safeOffer  : Nat = if (offerPrice == 0) 1 else offerPrice;

    ?{
      contractId        = contract.id;
      bidderId          = "ai_hans_OPCITY";
      isAI              = true;
      offerPricePLN     = safeOffer;
      volumeCommittedKg = hansStorageKg; // Hans bids his full excess
      isOrganic         = false;
      globalPrestige    = 72;
      localReputation   = 72;
      submittedSeason   = season;
    }
  };

  // ============================================================================
  // E) CLOSED-BID AUCTION RESOLUTION
  // ============================================================================
  //
  // Algorithm:
  //   1. Score every bid using calculateBidAttractiveness
  //   2. Sort — highest score wins (Winner-Take-All for required volume)
  //   3. Runner-up gets trickle: 20% of remaining volume at their offer price
  //   4. Return AuctionResult for each contract
  //
  // SEC: Array bounded by bids.size() — at most 4 bids (player + 3 AI) per contract.
  //      No unbounded iteration. No Nat underflow.

  public type ScoredBid = {
    bid   : Types.Bid;
    score : Nat;
  };

  // Resolve a single contract against an array of bids.
  // isBioContract is derived from contract.category internally.
  public func resolveContract(
    contract : Types.AuctionContract,
    bids     : [Types.Bid]
  ) : Types.AuctionResult {

    let isBio : Bool = switch (contract.category) {
      case (#Bio) true;
      case (_)    false;
    };

    // Score all bids
    let scored : [ScoredBid] = Array.map<Types.Bid, ScoredBid>(bids, func(b) {
      let s = calculateBidAttractiveness(
        contract.basePricePLN,
        b.offerPricePLN,
        b.globalPrestige + b.localReputation,
        b.isOrganic,
        isBio
      );
      { bid = b; score = s }
    });

    // Find winner (highest score) — linear scan, bounded by bids.size()
    // SEC: No sort import needed — O(n) scan, n ≤ 4.
    var winnerOpt  : ?ScoredBid = null;
    var runnerOpt  : ?ScoredBid = null;

    for (sb in scored.vals()) {
      switch (winnerOpt) {
        case (null) {
          winnerOpt := ?sb;
        };
        case (?curr) {
          if (sb.score > curr.score) {
            runnerOpt  := ?curr;
            winnerOpt  := ?sb;
          } else {
            switch (runnerOpt) {
              case (null) { runnerOpt := ?sb };
              case (?r)   {
                if (sb.score > r.score) { runnerOpt := ?sb };
              };
            };
          };
        };
      };
    };

    switch (winnerOpt) {
      case (null) {
        // No valid bids
        {
          contractId    = contract.id;
          winnerId      = null;
          winnerScore   = 0;
          winnerPricePLN= null;
          revenueEarned = 0;
          runnerUpId    = null;
        }
      };
      case (?winner) {
        // Winner earns: offerPrice × requiredVolume
        let winRevenue = winner.bid.offerPricePLN * contract.requiredVolumeKg;

        // Runner-up trickle: 20% of required volume at runner's price
        let runnerUpId : ?Text = switch (runnerOpt) {
          case (null) null;
          case (?r)   ?(r.bid.bidderId);
        };

        {
          contractId     = contract.id;
          winnerId       = ?(winner.bid.bidderId);
          winnerScore    = winner.score;
          winnerPricePLN = ?(winner.bid.offerPricePLN);
          revenueEarned  = winRevenue;
          runnerUpId     = runnerUpId;
        }
      };
    }
  };

  // ============================================================================
  // F) SHORTFALL RESOLUTION — Pre-Season Future Penalties
  // ============================================================================
  //
  // Called at Phase #Storage when Pre-Season Future volumes are reconciled.
  //
  // Step 1: Market Buyback (Automatic)
  //   buybackCost = shortfallKg × spotPrice × 125 / 100
  //   If player cash ≥ buybackCost → deduct cash, contract = #Fulfilled
  //
  // Step 2: Financial Default Penalty
  //   If player cash < buybackCost:
  //   penalty = shortfallKg × lockedPrice × 150 / 100
  //   cashDeducted = min(playerCash, penalty) — remainder is "debt" (cash goes negative in Int)
  //   prestige/reputation hit: -10% of current prestige/reputation
  //
  // SEC: All Nat arithmetic. Int.abs used where needed.
  //      Explicit guard on each subtraction.

  public func resolvePreSeasonShortfall(
    contract         : Types.AuctionContract,
    deliveredKg      : Nat,
    spotPricePLN     : Nat,
    playerCash       : Nat,
    playerPrestige   : Nat,
    _playerReputation: Nat
  ) : Types.ShortfallResult {

    let required = contract.requiredVolumeKg;

    // No shortfall if delivered ≥ required
    if (deliveredKg >= required) {
      return {
        contractId    = contract.id;
        shortfallKg   = 0;
        buybackCost   = 0;
        defaultPenalty= 0;
        prestigeLost  = 0;
        cashDeducted  = 0;
        isDefault     = false;
      };
    };

    let shortfall : Nat = required - deliveredKg; // Safe: required > deliveredKg

    // Step 1: Compute Market Buyback cost at Spot × 1.25
    let safeSpot    : Nat = if (spotPricePLN == 0) DEFAULT_SPOT_PLN else spotPricePLN;
    let buybackCost : Nat = (shortfall * safeSpot * BUYBACK_PREMIUM_NUM) / BUYBACK_PREMIUM_DEN;

    // Step 2: Can player afford the buyback?
    if (playerCash >= buybackCost) {
      // Buyback succeeds — no default
      {
        contractId    = contract.id;
        shortfallKg   = shortfall;
        buybackCost   = buybackCost;
        defaultPenalty= 0;
        prestigeLost  = 0;
        cashDeducted  = buybackCost;
        isDefault     = false;
      }
    } else {
      // Step 3: Financial Default — player cannot afford buyback
      // Use lockedPrice for default penalty base; fall back to basePricePLN
      let penaltyBase : Nat = switch (contract.lockedPricePLN) {
        case (?lp) lp;
        case (null) contract.basePricePLN;
      };
      let defaultPenalty : Nat = (shortfall * penaltyBase * DEFAULT_PENALTY_NUM) / DEFAULT_PENALTY_DEN;

      // Prestige / Reputation hit: -10% (floor 0)
      let prestigeLost : Nat = (playerPrestige * PRESTIGE_PENALTY_PCT) / 100;

      // Cash deducted: whatever cash the player has (debt handled in main.mo as Int)
      let cashDeducted : Nat = playerCash; // Take everything; main.mo records the remainder as debt

      {
        contractId    = contract.id;
        shortfallKg   = shortfall;
        buybackCost   = buybackCost;
        defaultPenalty= defaultPenalty;
        prestigeLost  = prestigeLost;
        cashDeducted  = cashDeducted;
        isDefault     = true;
      }
    }
  };

  // ============================================================================
  // G) MARKET SATURATION — Flood Factor
  // ============================================================================
  //
  // GDD: Every unit sold outside of a contract reduces SpotPrice by 0.1% per unit.
  // Formula: newSpot = spotPrice × (1000 - floodUnits) / 1000
  //   where floodUnits = min(uncontractedKg / UNIT_DIVISOR, FLOOD_FLOOR_UNITS)
  //
  // UNIT_DIVISOR = 100 (every 100 kg = 1 flood unit = 0.1% price drop)
  // This avoids integer explosion for large volumes.
  //
  // SEC: flood units capped at 900 → price floor = spotPrice × 100 / 1000 = 10% of original.
  //      All Nat. No subtraction without guard.

  private let UNIT_DIVISOR : Nat = 100; // 100 kg = 1 flood unit

  public func applyFloodFactor(spotPricePLN: Nat, uncontractedKg: Nat) : Nat {
    let rawFloodUnits = uncontractedKg / UNIT_DIVISOR;
    let floodUnits = if (rawFloodUnits > FLOOD_FLOOR_UNITS) FLOOD_FLOOR_UNITS else rawFloodUnits;

    // newSpot = spot × (FLOOD_DENOM - floodUnits) / FLOOD_DENOM
    // Guard: floodUnits ≤ FLOOD_FLOOR_UNITS < FLOOD_DENOM → subtraction is always safe.
    // Use Int arithmetic to eliminate M0155 trap warning, then cast back to Nat.
    let remainder   : Int = (FLOOD_DENOM : Int) - (floodUnits : Int);
    let numerator   : Nat = spotPricePLN * Int.abs(remainder);
    let newSpot     : Nat = numerator / FLOOD_DENOM;

    // Absolute floor: 1 PLN/kg minimum
    if (newSpot == 0) 1 else newSpot
  };

  // ============================================================================
  // H) QUERY HELPERS
  // ============================================================================

  // Returns true if a contract is a Bio contract (Bio category)
  public func isBioContract(c: Types.AuctionContract) : Bool {
    switch (c.category) { case (#Bio) true; case (_) false }
  };

  // Returns a human-readable label for contract category
  public func categoryLabel(cat: Types.ContractCategory) : Text {
    switch (cat) {
      case (#Export)     "Export";
      case (#Bio)        "Bio-Organic";
      case (#Industrial) "Industrial";
    }
  };

  // Returns a human-readable label for contract status
  public func statusLabel(s: Types.ContractStatus) : Text {
    switch (s) {
      case (#Open)      "Open";
      case (#Awarded)   "Awarded";
      case (#Fulfilled) "Fulfilled";
      case (#Defaulted) "Defaulted";
    }
  };

};
