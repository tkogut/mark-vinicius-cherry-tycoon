# Phase 6.1: Global Leaderboards & Prestige Scoring [BLUEPRINT]

**Target Agent:** Backend Agent (BART)
**Objective:** Implement the backend mechanics for the Global Leaderboards inside `leaderboard_logic.mo`.

## 1. Core Mechanics
The Leaderboard will track players and AI competitors based on a calculated **Prestige Score**.
The Prestige Score is driven by:
- Lifetime Revenue (Cherry Sales + Forward Contracts)
- Infrastructure Levels (Farm Value)
- Organic Certification Status (Multiplier)
- Completed Seasons

## 2. API Integrity & Constraints
- **Dual-Entrypoint:** The logic must be instituted in BOTH `main.mo` and `main_mainnet.mo`.
- **Immutable Constraint:** The `initializePlayer` signature MUST remain `(text, text)`. Do not alter its parameters.
- **Math Stability:** Strict integer precision only. No floating-point math.

## 3. Required Data Structures (`types.mo`)
Define the necessary types for a `LeaderboardEntry`:
```motoko
public type PrestigeScore = Nat;

public type LeaderboardEntry = {
    id: Principal;
    name: Text;
    isAI: Bool;
    prestige: PrestigeScore;
    seasonsCompleted: Nat;
    totalRevenue: Nat;
};
```

## 4. Required Public Functions (`main.mo` and `main_mainnet.mo`)
1. `public query func getGlobalLeaderboard() : async [Types.LeaderboardEntry]`
   - Returns the top 100 entries sorted descending by `PrestigeScore`.
2. `public query func getPlayerRank(playerId: Principal) : async ?Nat`
   - Returns the 1-indexed rank of a specific player.

## 5. Execution Steps for Backend Agent
1. Create `leaderboard_logic.mo` in the backend directory.
2. Implement the `calculatePrestige` pure function.
3. Update `advanceSeasonInternal` in the main actors to trigger a ledger/leaderboard recalculation.
4. Ensure the returned Leaderboard array merges both AI Competitors (from `ai_logic.mo`) and human players (`playerFarms`).
