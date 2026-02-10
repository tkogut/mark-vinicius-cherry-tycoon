# FRONTEND AGENT: Mark Vinicius Cherry Tycoon [FRONTEND]  
> **Current Directive**: **Phase 2.5 - Polish & Phase 3 - UI Depth**
> **Constraint**: **WSL Terminal Required** - For `dfx generate` and environment management.
> **Last Updated**: 2026-02-08

## Backlog

### 🔍 Phase 2.5: Integration Debugging (CRITICAL)
- [x] **Verify Actor Initialization**: Add console logs to `AuthContext` to confirm `backendActor` is created
- [x] **Add Mutation Logging**: Log all inputs/outputs in `useFarm.ts` mutations
- [x] **Create Debugging Guide**: Document how to use browser console for debugging
- [/] **Test in Browser Console**: Manually trigger mutations and capture errors
- [x] **Verify Environment**: Check `.env` has correct canister ID
- [x] **Test Login Flow**: Ensure user can login and `getPlayerFarm()` returns data
- [x] **Document Errors**: Report any runtime errors to Backend Agent
  - **RESOLVED**: JSON-RPC error (-32603) fixed by Backend Agent (changed `Time.Time` to `Nat`)
  - Backend redeployed, serialization verified, frontend integration working
- [x] **Fix Missing Dependencies**:
  - Found errors for `@radix-ui/react-tabs` and `@radix-ui/react-slider`
  - Installed missing packages to fix build errors
- [x] **Auth Layer**: Implement `useAuth` hook with `@dfinity/auth-client`.
- [x] **Canister Integration**: 
    - [x] Run `dfx generate` (User) and copy declarations.
    - [x] Create `actor.ts` service.
- [x] **Core Dashboard Components**:
    - [x] `Sidebar`: Navigation and User Level.
    - [x] `FarmGrid`: 3x3 grid display of `CherryParcel`s.
    - [x] `InventoryBar`: Cash and harvested fruit.
- [x] **Action Modals**:
    - [x] "Planted Trees" status.
    - [x] "Water / Fertilize" buttons with loading states.
    - [x] `PlantingModal` for new parcels.
- [x] **State Management**: Implement React Query for optimistic updates on farm state.

### 🔧 Backend Requests
- [x] **Seasonal Harvest Restriction**: ✅ COMPLETE - Backend now enforces Summer-only harvest
  - `harvestCherries()` checks `currentSeason != #Summer`
  - Returns `#SeasonalRestriction` error: "Cherries can only be harvested in Summer"
  - Verified working in all seasons (Spring, Summer, Autumn, Winter)

### 🎨 UI Enhancements (NEW)
- [x] **Disable Harvest Button Outside Summer**: Improve UX by disabling harvest button when not in Summer
  - Check `farm.currentSeason` in UI
  - Disable harvest button if `currentSeason !== 'Summer'`
  - Visual indicator: Gray out button or show season badge
  - **Rationale**: Better UX than showing error toast after click
- [ ] **Disable Fertilize Button Outside Spring/Autumn**: Improve UX by disabling fertilize button
  - Check `farm.currentSeason`
  - Disable fertilize button if `currentSeason !== 'Spring'` AND `currentSeason !== 'Autumn'`
  - Tooltip: "Effective in Spring & Autumn"

### 🔗 Backend Integration
- [x] **Integrate `getFarmOverview`**:
  - Implemented `useFarmOverview` hook for lightweight updates.
  - Type: `FarmOverview` (defined in types.mo).
- [x] **Integrate `getMarketPrices`**:
  - Implemented `useMarketPrices` hook.
  - Created `SellModal` with Wholesale/Retail options.
  - Integrated into main App workflow.

### 📊 Phase 3: Surface the Simulation (Next)
- [ ] **Parcel Card Update**: Show Soil Type, pH, and Fertility values
- [ ] **Yield Tooltip**: Hover over "Expected Yield" to see checking modifiers (e.g. "Sandy Soil: x0.85")
- [ ] **Season Modifier**: Show how current season affects growth/yield

### 💰 Phase 4: Economy & Infrastructure (Future)
- [x] **Split Sales**: Create dedicated "Wholesale" and "Retail" UIs (Prototype in Frontend)
- [ ] **Migrate Pricing Logic**: Move volume/saturation calculations to Backend for Multiplayer security
- [ ] **Shop UI**: Create interface for buying Irrigation/Greenhouses
- [x] **Disable Fertilize Button Outside Spring/Autumn**: ✅ COMPLETE - Improved UX
  - Checks `farm.currentSeason`
  - Disables fertilize button if `currentSeason !== 'Spring'` AND `currentSeason !== 'Autumn'`
  - Tooltip: "Effective in Spring & Autumn"
  - **Implementation**: Added `fertilize` mutation, updated `ParcelCard` with button and logic

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
