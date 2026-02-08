# FRONTEND AGENT: Mark Vinicius Cherry Tycoon [FRONTEND]

> **Current Directive**: **MVP Development - Dashboard & Actions**
> **Constraint**: **WSL Terminal Required** - For `dfx generate` and environment management.
> **Last Updated**: 2026-02-08

## Backlog

### 🚀 Phase 2: MVP Development (Active)
- [x] **Auth Layer**: Implement `useAuth` hook with `@dfinity/auth-client`.
- [x] **Canister Integration**: 
    - [x] Run `dfx generate` (User) and copy declarations.
    - [x] Create `actor.ts` service.
- [/] **Core Dashboard Components**:
    - [/] `Sidebar`: Navigation and User Level.
    - [ ] `FarmGrid`: 3x3 grid display of `CherryParcel`s.
    - [ ] `InventoryBar`: Cash and harvested fruit.
- [ ] **Action Modals**:
    - [ ] "Planted Trees" status.
    - [ ] "Water / Fertilize" buttons with loading states.
- [ ] **State Management**: Implement React Query for optimistic updates on farm state.

### ✅ Completed Tasks
- [x] **Create Project**: `npm create vite@latest frontend -- --template react-ts`.
- [x] **Install Dependencies**: `shadcn/ui`, `tailwindcss`, `@dfinity/agent`, `@dfinity/auth-client`.
- [x] **Configure Tailind**: Setup `tailwind.config.js`.
- [x] **Dashboard Layout**: Basic grid layout for Farm Overview.

## Agent Instructions
1.  Read `directives/00_master_plan.md` to understand the goal.
2.  Implement UI components one by one.
3.  **WSL Workflow**: If you need declarations or canister calls:
    - Formulate the `dfx` command for the User.
    - Instruct them to use `| tee .tmp/frontend.log`.
    - Read the log yourself using `view_file`.
4.  Update this file upon completion.
5.  Notify Coordinator if blocked by backend.
