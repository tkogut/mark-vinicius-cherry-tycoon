// Mark Vinicius Cherry Tycoon - AI Competitor Logic
// Phase 5.2: AI Competitor Archetypes + Shared Market Supply
// Producer: JaPiTo Group
//
// This is a PURE module — no actor, no stable storage, no caller-auth needed.
// All AI decisions are deterministic (LCG seed-based) to keep cycle costs minimal.
// Three archetypes: Marek (Głubczyce), Kasia (Namysłów), Hans (Opole)

import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Types "types";

module {

  // ============================================================================
  // TYPES
  // ============================================================================

  public type AICompetitorSummary = {
    id: Text;
    name: Text;
    personality: Types.AIPersonality;
    county: Text;
    totalArea: Float;         // hectares
    baseCapacity: Nat;        // kg per season potential
    reputation: Nat;          // 0-100
    preferredSaleType: Text;  // "retail" | "wholesale"
    isOrganic: Bool;
  };

  // ============================================================================
  // DETERMINISTIC RANDOM HELPER (LCG — same pattern as weather_logic.mo)
  // a=1664525, c=1013904223, m=2^32
  // SEC: No unbounded loops. Pure arithmetic, no Nat underflow.
  // ============================================================================

  private let LCG_A : Nat = 1664525;
  private let LCG_C : Nat = 1013904223;
  private let LCG_M : Nat = 4294967296; // 2^32

  private func lcgNext(seed: Nat) : (Nat, Float) {
    let newSeed = (LCG_A * seed + LCG_C) % LCG_M;
    let frac = Float.fromInt(newSeed) / Float.fromInt(LCG_M); // [0.0, 1.0)
    (newSeed, frac)
  };

  // ============================================================================
  // AI ARCHETYPE DEFINITIONS
  // ============================================================================
  //
  // Marek "The Traditionalist" — Głubczyce, GL_02
  //   Mass producer, conventional farming, low risk, crashes wholesale volume.
  //   Hectares: 15 ha | Base: 45,000 kg | 90% wholesale
  //
  // Kasia "The Eco-Visionary" — Namysłów, NM_01
  //   100% organic, retail prestige, premium pricing, lower raw volume.
  //   Hectares: 8 ha  | Base: 18,000 kg | 80% retail
  //
  // Hans "The Aggressor" — Opole, OP_CITY
  //   High-tech scaler, outbids export contracts, dominant wholesale presence.
  //   Hectares: 22 ha | Base: 70,000 kg | 95% wholesale

  private let MAREK_SEED : Nat = 42;    // stable deterministic id-seed
  private let KASIA_SEED  : Nat = 137;
  private let HANS_SEED   : Nat = 999;

  public let AI_MAREK : AICompetitorSummary = {
    id                = "ai_marek_GL02";
    name              = "Marek \"The Traditionalist\"";
    personality       = #Traditionalist;
    county            = "Głubczyce (GL-02)";
    totalArea         = 15.0;
    baseCapacity      = 45_000;
    reputation        = 60;
    preferredSaleType = "wholesale";
    isOrganic         = false;
  };

  public let AI_KASIA : AICompetitorSummary = {
    id                = "ai_kasia_NM01";
    name              = "Kasia \"The Eco-Visionary\"";
    personality       = #Innovator;
    county            = "Namysłów (NM-01)";
    totalArea         = 8.0;
    baseCapacity      = 18_000;
    reputation        = 85;
    preferredSaleType = "retail";
    isOrganic         = true;
  };

  public let AI_HANS : AICompetitorSummary = {
    id                = "ai_hans_OPCITY";
    name              = "Hans \"The Aggressor\"";
    personality       = #Businessman;
    county            = "Opole (OP-CITY)";
    totalArea         = 22.0;
    baseCapacity      = 70_000;
    reputation        = 72;
    preferredSaleType = "wholesale";
    isOrganic         = false;
  };

  // ============================================================================
  // PUBLIC: GET ALL AI COMPETITORS (SUMMARIES)
  // Returns lightweight summary for frontend display and leaderboard.
  // No auth required — public market information.
  // ============================================================================

  public func getCompetitorSummaries() : [AICompetitorSummary] {
    [AI_MAREK, AI_KASIA, AI_HANS]
  };

  // ============================================================================
  // PUBLIC: SIMULATE AI TURN
  // Returns kg produced + sold this season for a given AI archetype.
  // Deterministic: same (idSeed, season, entropy) always returns same result.
  //
  // Yield formula:
  //   base = competitor.baseCapacity
  //   roll = lcg(entropy XOR-mix idSeed) → [0.0, 1.0)
  //   yieldFactor = 0.65 + roll * 0.70   → [0.65, 1.35)
  //   production  = base * yieldFactor    (clamped to [0.60*base, 1.30*base])
  //
  // Season modifiers (like a real farm):
  //   Spring  → 0 production (growth only)
  //   Summer  → +15% (peak harvest season for cherry farms)
  //   Autumn  → -20% (late harvest, lower quality)
  //   Winter  →  0 production (dormant)
  //
  // SEC: All math uses Nat. No subtraction without guard. Bounded (3 LCG calls max).
  // ============================================================================

  public func simulateAITurn(
    idSeed   : Nat,
    capacity : Nat,
    season   : Types.Season,
    entropy  : Nat
  ) : Nat {

    // Season gate — only Summer produces (cherry-specific)
    let seasonMultiplier : Float = switch (season) {
      case (#Spring) { 0.0 };  // No cherry production in spring
      case (#Summer) { 1.15 }; // Peak season
      case (#Autumn) { 0.80 }; // Late season, partial
      case (#Winter) { 0.0 };  // Dormant
    };

    // Short-circuit to 0 for non-producing seasons
    if (seasonMultiplier == 0.0) return 0;

    // Mix entropy with idSeed to give each AI a different roll
    let mixedSeed = (entropy + idSeed * 31) % LCG_M;
    let (_, roll) = lcgNext(mixedSeed);

    // yieldFactor ∈ [0.65, 1.35)
    let yieldFactor = 0.65 + roll * 0.70;

    // Apply season multiplier
    let effectiveFactor = yieldFactor * seasonMultiplier;

    // Clamp to [0.60, 1.30] * capacity
    let minFactor = 0.60;
    let maxFactor = 1.30;
    let clampedFactor = if (effectiveFactor < minFactor) { minFactor }
                        else if (effectiveFactor > maxFactor) { maxFactor }
                        else { effectiveFactor };

    // Convert to Nat — safe: Float.toInt truncates, Int.abs handles sign
    let raw = Float.toInt(Float.fromInt(capacity) * clampedFactor);
    Int.abs(raw)
  };

  // ============================================================================
  // PUBLIC: GET AI TOTAL SUPPLY
  // Aggregate kg across all 3 AI competitors for a given season + entropy.
  // Used by sellCherries to weight the shared market price formula.
  // SEC: Bounded to exactly 3 iterations (no loop over unknown collection).
  // ============================================================================

  public func getAITotalSupply(season: Types.Season, entropy: Nat) : Nat {
    let marekKg = simulateAITurn(MAREK_SEED, AI_MAREK.baseCapacity, season, entropy);
    let kasiaKg = simulateAITurn(KASIA_SEED, AI_KASIA.baseCapacity, season, entropy);
    let hansKg  = simulateAITurn(HANS_SEED,  AI_HANS.baseCapacity,  season, entropy);
    marekKg + kasiaKg + hansKg
  };

  // ============================================================================
  // PUBLIC: COMPUTE SHARED MARKET PRICE MULTIPLIER
  // Implements the GDD Phase 5.2 formula:
  //   Price = Base * (Demand / (PlayerSupply + AISupply + GlobalBaseline))
  //
  // Returns a Float multiplier in [PRICE_FLOOR_MULT, 1.0] applied to base price.
  //
  // Parameters:
  //   playerSupplyKg — quantity the current player is selling
  //   aiTotalKg      — total AI production this season
  //   seasonDemand   — baseline demand estimate (kg) — varies by season
  //
  // SEC: price floor = 0.50x enforced per SECURITY_DIRECTIVE_V1 §2.5
  //      (Market Manipulation Guard — prevents price going to zero).
  // ============================================================================

  let PRICE_FLOOR_MULT : Float  = 0.50;
  let GLOBAL_BASELINE_KG : Nat  = 20_000; // baseline market volume always present

  public func computeMarketMultiplier(
    playerSupplyKg : Nat,
    aiTotalKg      : Nat,
    seasonDemand   : Nat
  ) : Float {
    let totalSupply = playerSupplyKg + aiTotalKg + GLOBAL_BASELINE_KG;
    let raw = Float.fromInt(seasonDemand) / Float.fromInt(totalSupply);

    // Cap at 1.0 (no price inflation above base), floor at 0.50
    let capped = if (raw > 1.0) { 1.0 } else { raw };
    if (capped < PRICE_FLOOR_MULT) { PRICE_FLOOR_MULT } else { capped }
  };

  // ============================================================================
  // PUBLIC: GET SEASON DEMAND ESTIMATE
  // Simple lookup — higher demand in Summer (cherry season) and before Winter.
  // Used as the numerator in computeMarketMultiplier.
  // ============================================================================

  public func getSeasonDemand(season: Types.Season) : Nat {
    switch (season) {
      case (#Spring) { 30_000 };  // Pre-season, moderate demand
      case (#Summer) { 80_000 };  // Peak cherry demand
      case (#Autumn) { 50_000 };  // Post-harvest, preserves demand
      case (#Winter) { 20_000 };  // Low demand, dormant market
    }
  };

};
