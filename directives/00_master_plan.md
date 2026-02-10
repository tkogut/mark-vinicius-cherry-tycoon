# MASTER PLAN: Mark Vinicius Cherry Tycoon [COORDINATOR]

> **Current Status**: **Phase 2.5 - Integration Verification**
> **Current Focus**: Phase 5 - Sports Management & Advanced Features. Phase 4 Backend Complete.
> **Last Updated**: 2026-02-08

## High-Level Roadmap

### Phase 1: Stabilization (Week 1)
- [x] **Setup**: Local environment with dfx and Motoko.
- [x] **Migration**: Moved code from Caffeine AI.
- [x] **Backend Fixes**: Type errors fixed, `assignParcelToPlayer` implemented.
- [x] **Core Logic**: `harvestCherries`, `plantTrees`, etc. implemented and bug fixes verified.
- [x] **Economy**: `buyParcel`, `sellCherries` implemented.
- [x] **Persistence**: Stable storage verified.

### Phase 2.5: Integration Verification (ACTIVE - CRITICAL)
- [ ] **Backend Verification**: Test all functions via `dfx canister call`
- [x] **Frontend Debugging**: Fixed JSON-RPC serialization error (Time.Time → Nat)
- [/] **End-to-End Testing**: Verify plant/water/harvest loop with new fixes
- [ ] **Error Handling**: Verify error toasts for seasonal restrictions
- [ ] **Code Cleanup**: Remove temporary debug logs once stable

### Phase 3: Surface the Simulation (Next)
- [ ] **Frontend**: Display Soil Type, pH, and Fertility on Parcel Cards
- [x] **Backend**: Ensure `getPlayerFarm` returns all parcel attributes
- [ ] **UI**: Add tooltips explaining yield modifiers

### Phase 4: Economy & Infrastructure [DONE]
- [x] GDD-compliant infrastructure types & costs
- [x] Labor efficiency and quality modifiers
- [x] Seasonal spoilage and storage protection
- [x] Organic certification lifecycle & premiums
- [x] **Server-Side Economy Logic**: Move volume penalty and saturation logic to backend (Multiplayer Prep)
- [ ] **Infrastructure**: Implement Shop UI for Irrigation/Greenhouses


### Phase 2: MVP Development (Complete)
- [x] **Auth Layer**: Implement `useAuth` hook with `@dfinity/auth-client`.
- [x] **Canister Integration**: Connect UI to backend canister.
- [x] **Core Dashboard Components**:
    - [x] `Sidebar`: Navigation and User Level.
    - [x] `FarmGrid`: 3x3 grid display of `CherryParcel`s.
    - [x] `InventoryBar`: Cash and harvested fruit.
- [x] **Action Modals**:
    - [x] "Planted Trees" status.
    - [x] "Water / Fertilize" buttons with loading states.
    - [x] `State Management`: Implement React Query for optimistic updates on farm state.

### Phase 5: Advanced Features (Paused)
- [ ] **Weather System**: Visuals and logic
- [ ] **Sports Management**: Team creation
- [ ] **Web3**: NFT integration

## Active Directives (Delegate Tasks)

| Domain | Assigned To | Current Directive File | Status |
| :--- | :--- | :--- | :--- |
| **Backend** | Backend Agent | `directives/01_backend_backlog.md` | **ACTIVE** - Starting Phase 4: Market Saturation. |
| **Frontend** | Frontend Agent | `directives/02_frontend_backlog.md` | **ACTIVE** - Debugging actor initialization and mutations. |
| **QA** | QA Agent | `directives/03_qa_checklist.md` | **ACTIVE** - Running integration tests and documenting issues. |

## Inter-Agent Communication
- **Coordinator**: Monitor this file. Update roadmap. Assign tasks to domain backlogs.
- **Backend Agent**: Check `01_backend_backlog.md`. Execute tasks. Report blocker to Coordinator.
- **Frontend Agent**: Check `02_frontend_backlog.md`. Execute tasks.
- **QA Agent**: Check `03_qa_checklist.md`. Run tests. Report failures to Coordinator.
