# PROMPT FOR ANTIGRAVITY MANAGER AGENT
## Project Continuation: Mark Vinicius Cherry Tycoon

**Date**: February 7, 2026, 16:00 CET  
**Previous Platform**: Caffeine AI (Draft 38)  
**Source**: https://caffeine.ai/chat/019c3412-1a4b-724c-afcf-e8856b8a3db5

---

## PROJECT OVERVIEW

You are taking over the development of **Mark Vinicius Cherry Tycoon**, a mobile-first farming/sports management tycoon game built on the Internet Computer Protocol (ICP). The project is currently at **Draft 38** after intensive backend debugging sessions.

### Core Concept:
- **Genre**: Farming simulation + Sports management tycoon
- **Platform**: Internet Computer (ICP blockchain)
- **Tech Stack**: 
  - Backend: Motoko (ICP canister)
  - Frontend: React 18 + TypeScript + Tailwind CSS + Shadcn/ui
  - State Management: React Query
  - Build Tool: Vite

### Game Pillars:
1. Cherry farm management (planting, watering, harvesting)
2. Organic certification system
3. Market dynamics and trading
4. Sports team management (player recruitment, matches)
5. Geographic expansion across Polish regions
6. Web3 integration (NFTs, tokenomics)

---

## CURRENT STATUS (Draft 38)

### ✅ Successfully Implemented:

#### Player Management:
```motoko
initializePlayer(playerId: Text, playerName: Text) : async Result<Text, Text>
getPlayerFarm() : async Result<PlayerFarm, Text>
loadRandomPlayerFarm() : async Result<Text, Text>
createRandomPlayerFarm(caller: Principal) : PlayerFarm
```

#### Parcel Management:
```motoko
assignParcelToPlayer(parcelId: Text, playerId: Text) : async Result<Text, Text>
  // Assigns parcel to player
  // Checks permissions (owner or admin)
  // Updates ownerId in PlayerFarm structure
```

#### Trading:
```motoko
sellCherries(_quantity: Nat, _saleType: Text) : async Result<Nat, Text>
```

#### Progression:
```motoko
advanceSeason(_weatherEvent: ?Text) : async Result<Text, Text>
upgradeInfrastructure(_parcelId: Text, _infraType: Text) : async Result<Text, Text>
```

### Data Types:

**CherryParcel**:
```motoko
{
  id: Text;
  ownerId: Text;  // ADDED IN DRAFT 34
  soilType: Text;
  pH: Float;
  fertility: Nat;
  size: Float;
  plantedTrees: Nat;
  treeAge: Nat;
  isOrganic: Bool;
  organicConversionSeason: Nat;
  organicCertified: Bool;
  lastHarvest: Nat;
}
```

**PlayerFarm**:
```motoko
{
  owner: Principal;
  parcels: [CherryParcel];
  infrastructure: [Infrastructure];
  inventory: Inventory;
  statistics: Statistics;
  level: Nat;
  experience: Nat;
}
```

---

## PROBLEMS WITH CAFFEINE AI

### Why We're Migrating:

1. **Inaccurate Bug Fixes**
   - Draft 36-37: Failed to fix `.toText()` bug despite clear instructions
   - Required 3 iterations (Draft 36→37→38) to fix simple type error
   - Root cause: playerId parameter was `Principal` instead of `Text`

2. **Poor Error Analysis**
   - Focused on symptoms (`.toText()` call) instead of cause (wrong parameter type)
   - No proactive type checking

3. **Slow Iteration Cycle**
   - Each build: 3-5 minutes
   - Total time Draft 30-38: ~40-50 minutes
   - Inefficient for iterative debugging

4. **No Local Testing**
   - Cannot test locally with dfx
   - Cannot write unit tests
   - Limited debugging capabilities

---

## YOUR MISSION

### Immediate Goals (Week 1):

1. **Code Migration & Setup**
   ```bash
   # Install ICP SDK
   sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
   
   # Create project structure
   dfx new cherry_tycoon --type=motoko
   cd cherry_tycoon
   
   # Start local ICP replica
   dfx start --background
   ```

2. **Export from Caffeine**
   - Download complete Draft 38 source code
   - Extract main.mo (~1200 lines)
   - Save GDD and specification
   - Document project_state.json

3. **Verify Draft 38 Implementation**
   - Test all public functions
   - Verify `assignParcelToPlayer` works correctly
   - Check type safety (playerId should be Text, not Principal)
   - Confirm access control works

4. **Add Missing Core Functions** (Priority 1):
   ```motoko
   // Farming operations
   harvestCherries(parcelId: Text) : async Result<Nat, Text>
   plantTrees(parcelId: Text, quantity: Nat) : async Result<Text, Text>
   waterParcel(parcelId: Text) : async Result<Text, Text>
   fertilizeParcel(parcelId: Text, fertilizerType: Text) : async Result<Text, Text>
   
   // Economic system
   buyParcel(parcelId: Text, price: Nat) : async Result<Text, Text>
   getCashBalance() : async Nat
   getInventory() : async Inventory
   
   // Statistics
   getStatistics() : async Statistics
   addExperience(amount: Nat) : async Result<Text, Text>
   ```

5. **Implement Stable Storage**
   - Add stable variables for data persistence
   - Implement preupgrade/postupgrade hooks
   - Test canister upgrade without data loss

### Mid-Term Goals (Week 2-3):

6. **Frontend MVP Development**
   - Set up React + TypeScript + Vite project
   - Implement Internet Identity authentication
   - Create dashboard UI (cash, inventory, level display)
   - Build farm grid view with parcels
   - Implement parcel management panel
   - Add toast notifications
   - Connect to backend canister using agent-js

7. **Core Gameplay Loop**
   ```typescript
   // Daily actions
   - Click on parcel → view details
   - Water button → call waterParcel()
   - Harvest button → call harvestCherries()
   - Sell button → call sellCherries()
   
   // Weekly progression
   - Season advancement
   - Organic certification progress
   - Market price fluctuations
   ```

8. **State Management**
   - Use React Query for server state
   - Implement optimistic updates
   - Add loading/error states
   - Cache player data efficiently

### Long-Term Goals (Week 4-6):

9. **Advanced Systems**
   - Weather system (sunny, rainy, frost, heatwave)
   - Season cycle (spring, summer, autumn, winter)
   - Market dynamics (dynamic pricing)
   - Polish regions map (Lubelskie, Mazowieckie, etc.)

10. **Sports Management**
    - Team creation and management
    - Player recruitment system
    - Match scheduling and simulation
    - Budget management

11. **Web3 Features**
    - NFT integration for parcels
    - Rare cherry varieties as NFTs
    - Token economics (CHERRY token?)
    - Trading marketplace

---

## DEVELOPMENT PRINCIPLES

### Code Quality:
- ✅ Write type-safe Motoko code
- ✅ Add comprehensive error handling
- ✅ Implement proper access control
- ✅ Use Result types for all operations
- ✅ Write unit tests for critical functions

### Testing Strategy:
```bash
# Local testing
dfx deploy --network local
dfx canister call backend initializePlayer '("player1", "Jan Kowalski")'
dfx canister call backend getPlayerFarm '()'

# Integration tests
# Write tests in TypeScript using @dfinity/agent
```

### Git Workflow:
- Main branch: production-ready code
- Develop branch: active development
- Feature branches: feature/* (e.g., feature/weather-system)
- Commit messages: Conventional Commits format

### Documentation:
- Update README.md with setup instructions
- Document all public functions in code
- Maintain CHANGELOG.md
- Keep GDD up to date

---

## SUCCESS CRITERIA

### Week 1 (Stabilization):
- [ ] Local environment set up with dfx
- [ ] Draft 38 code migrated and tested
- [ ] 5 missing core functions implemented
- [ ] Stable storage working
- [ ] Unit tests for key functions

### Week 2-3 (MVP):
- [ ] Frontend dashboard operational
- [ ] Player can login with Internet Identity
- [ ] Basic farm management works (plant, water, harvest)
- [ ] Selling cherries works
- [ ] Cash and inventory updates correctly

### Week 4-6 (Advanced Features):
- [ ] Weather/season system operational
- [ ] Market dynamics implemented
- [ ] At least 3 Polish regions available
- [ ] Basic sports management functional

---

## TECHNICAL CONSTRAINTS

### ICP Limitations:
- Canister cycle costs for storage and computation
- 2GB storage limit per canister
- Query calls are free, update calls cost cycles
- Async/await patterns required for inter-canister calls

### Performance Targets:
- Query response time: <100ms
- Update call response: <2s
- Frontend initial load: <3s
- Smooth 60fps animations

---

## DELIVERABLES

### By End of Week 1:
1. Working local ICP environment
2. Migrated and tested Draft 38 code
3. 5 new core functions implemented
4. Test suite with 80%+ coverage
5. Updated documentation

### By End of Week 3:
1. Playable MVP deployed to IC mainnet
2. Basic UI/UX for farm management
3. Working game loop (daily actions)
4. Internet Identity authentication

### By End of Week 6:
1. Full-featured game with advanced systems
2. Polish regions map
3. Weather and seasons
4. Market dynamics
5. Basic sports management

---

## COMMUNICATION

### Status Updates:
- Daily: Brief progress summary
- Weekly: Comprehensive status report
- Blockers: Report immediately

### Documentation:
- Code comments in English
- Git commits in English
- User-facing text in Polish

### Questions:
If you need clarification on:
- Game mechanics → refer to GDD
- Technical decisions → ask me
- Priority conflicts → discuss trade-offs

---

## RESOURCES

### Essential Links:
- Caffeine Project: https://caffeine.ai/chat/019c3412-1a4b-724c-afcf-e8856b8a3db5
- ICP Documentation: https://internetcomputer.org/docs/current/home
- Motoko Language Guide: https://internetcomputer.org/docs/current/motoko/main/motoko
- dfx CLI Reference: https://internetcomputer.org/docs/current/references/cli-reference/

### Code Examples:
- ICP Sample Projects: https://github.com/dfinity/examples
- Motoko Base Library: https://github.com/dfinity/motoko-base

---

## FINAL NOTES

**Priority**: Speed and code quality over perfection. We need a working MVP in 3 weeks.

**Approach**: 
1. Verify and stabilize existing code first
2. Add missing core features
3. Build simple but functional frontend
4. Iterate based on testing

**Communication**: Keep me updated daily. If you're blocked, tell me immediately. If you find better approaches, propose them.

**Success Metric**: Playable game where a user can create a farm, plant cherries, harvest them, and sell them for profit. Everything else is secondary.

---

**Ready to start? Begin with migrating the code from Caffeine and setting up the local development environment.**