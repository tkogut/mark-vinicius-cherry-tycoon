# FRONTEND AGENT: Mark Vinicius Cherry Tycoon [FRONTEND]  
> **Current Directive**: **Phase 3.5 - Simulation Actionability & Economy UX**
> **Constraint**: **WSL Terminal Required** - For `dfx generate` and environment management.
> **Last Updated**: 2026-02-14

## Backlog

### 🎯 Phase 3.5: Simulation Actionability (High Priority)
- [x] **Yield Modifier Tooltips**:
  - Update `ParcelCard.tsx` or `ParcelDetailsPanel.tsx`.
  - Add tooltips to "Expected Yield" showing internal modifiers.
  - Formula: `Base (25t) * Soil Type Mod * pH Mod * Fertility * Age Mod`.
  - Example: "Sandy Soil: x0.85 Modifier applied."
- [ ] **Yield Comparison View**:
  - Visual indicator of how close the parcel is to its "Peak Production" (Age 7-25).

### 📈 Phase 4.1: Economy & Price Feedback
- [ ] **Market Saturation Visuals**:
  - In `SellModal.tsx`, show a "Saturation Warning" if volume exceeds current region demand.
  - Display the "Volume Penalty" impact on the final price before the user confirms the sale.
- [ ] **Historical Price Graph**:
  - (Optional) Simple line chart showing last 4 seasons of wholesale vs retail prices.

### 📱 Phase 3a: PWA Final Polish
- [x] **Foundation**: Add viewport meta tag & audit CSS
- [x] **Manifest**: Create `manifest.json` & Service Worker
- [ ] **Weather-Based UI Themes**:
  - Change dashboard background colors/effects based on `farm.currentSeason`.
  - Spring: Light Green/Emerald. Summer: Golden/Rose. Autumn: Amber/Orange. Winter: Soft Blue/Indigo.

### ✅ Completed Tasks (Audit Verified)
- [x] **Core Dashboard**: Responsive grid layout (1, 2, or 3 columns).
- [x] **Simulation Depth**: `ParcelDetailsPanel` surfacing pH, Soil, Humidity.
- [x] **Infrastructure Shop**: `Marketplace` supporting Buildings and Machinery.
- [x] **Risk Management**: Survival budget and bankruptcy alerts.
- [x] **PWA Foundation**: Basic manifest and icons.

## Agent Instructions
1.  Read `directives/00_master_plan.md` to see the global roadmap.
2.  Focus on **Yield Modifier Tooltips** as the first task.
3.  **WSL Workflow**: If you need new declarations or log checking:
    - Formulate the `dfx` command for the User.
    - Instruct them to use `| tee .tmp/frontend.log`.
    - Read the log yourself using `view_file`.
4.  Update this file upon completion.
