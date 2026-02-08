# MASTER PLAN: Mark Vinicius Cherry Tycoon [COORDINATOR]

> **Current Status**: **Active: Phase 2 MVP Development**
> **Current Focus**: Internet Identity & Dashboard Integration.
> **Last Updated**: 2026-02-08

## High-Level Roadmap

### Phase 1: Stabilization (Week 1)
- [x] **Setup**: Local environment with dfx and Motoko.
- [x] **Migration**: Moved code from Caffeine AI.
- [x] **Backend Fixes**: Type errors fixed, `assignParcelToPlayer` implemented.
- [x] **Core Logic**: `harvestCherries`, `plantTrees`, etc. implemented and bug fixes verified.
- [x] **Economy**: `buyParcel`, `sellCherries` implemented.
- [x] **Persistence**: Stable storage verified.

### 🚀 Phase 2: MVP Development (Active)
- [ ] **Auth Layer**: Implement `useAuth` hook with `@dfinity/auth-client`.
- [ ] **Canister Integration**:
    - [ ] Run `dfx generate` (User) and copy declarations.
    - [ ] Create `actor.ts` service.
- [ ] **Core Dashboard Components**:
    - [ ] `Sidebar`: Navigation and User Level.
    - [ ] `FarmGrid`: 3x3 grid display of `CherryParcel`s.
    - [ ] `InventoryBar`: Cash and harvested fruit.
- [ ] **Action Modals**:
    - [ ] "Planted Trees" status.
    - [ ] "Water / Fertilize" buttons with loading states.
- [ ] **State Management**: Implement React Query for optimistic updates on farm state.

### Phase 3: Advanced Features (Week 4-6)
- [ ] **Weather System**: Seasons, events.
- [ ] **Market Dynamics**: Fluctuating prices.
- [ ] **Sports Management**: Team creation, recruitment.
- [ ] **Web3**: NFT integration.

## Active Directives (Delegate Tasks)

| Domain | Assigned To | Current Directive File | Status |
| :--- | :--- | :--- | :--- |
| **Backend** | Backend Agent | `directives/01_backend_backlog.md` | **IDLE** - All core logic and bug fixes completed. |
| **Frontend** | Frontend Agent | `directives/02_frontend_backlog.md` | **ACTIVE** - Dashboard & Auth implementation done. Proceeding to backend integration. |
| **QA** | QA Agent | `directives/03_qa_checklist.md` | **ACTIVE** - Found lookup bug. Verifying core systems. |

## Inter-Agent Communication
- **Coordinator**: Monitor this file. Update roadmap. Assign tasks to domain backlogs.
- **Backend Agent**: Check `01_backend_backlog.md`. Execute tasks. Report blocker to Coordinator.
- **Frontend Agent**: Check `02_frontend_backlog.md`. Execute tasks.
- **QA Agent**: Check `03_qa_checklist.md`. Run tests. Report failures to Coordinator.
