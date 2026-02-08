# MASTER PLAN: Mark Vinicius Cherry Tycoon [COORDINATOR]

> **Current Status**: **CRITICAL: Phase 2.5 - Integration Verification**
> **Current Focus**: Debugging core farming loop. All Phase 3 work paused.
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
- [ ] **End-to-End Testing**: User can plant, water, and harvest successfully
- [ ] **Error Handling**: All errors properly surfaced to UI

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

### Phase 3: Advanced Features (PAUSED)
- [/] **Weather System**: Seasons, events.
- [ ] **Market Dynamics**: Fluctuating prices.
- [ ] **Sports Management**: Team creation, recruitment.
- [ ] **Web3**: NFT integration.

## Active Directives (Delegate Tasks)

| Domain | Assigned To | Current Directive File | Status |
| :--- | :--- | :--- | :--- |
| **Backend** | Backend Agent | `directives/01_backend_backlog.md` | **ACTIVE** - Verifying core functions work via CLI. |
| **Frontend** | Frontend Agent | `directives/02_frontend_backlog.md` | **ACTIVE** - Debugging actor initialization and mutations. |
| **QA** | QA Agent | `directives/03_qa_checklist.md` | **ACTIVE** - Running integration tests and documenting issues. |

## Inter-Agent Communication
- **Coordinator**: Monitor this file. Update roadmap. Assign tasks to domain backlogs.
- **Backend Agent**: Check `01_backend_backlog.md`. Execute tasks. Report blocker to Coordinator.
- **Frontend Agent**: Check `02_frontend_backlog.md`. Execute tasks.
- **QA Agent**: Check `03_qa_checklist.md`. Run tests. Report failures to Coordinator.
