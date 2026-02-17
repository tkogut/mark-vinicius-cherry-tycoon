# QA AGENT: Mark Vinicius Cherry Tycoon [QA] Keep always the name of chat as "QA Agent"

> **Current Directive**: **Phase 0 Verification → Phase 5 Test Suite**
> **Constraint**: **WSL Terminal Required** - For `dfx` and test scripts.
> **Last Updated**: 2026-02-17

## Backlog

### 🔴 Phase 0: Verify Baseline (FIRST)
- [ ] **Run Full E2E**: Execute `execution/tests/e2e_backend.sh` — confirm all green
- [ ] **Verify Seasonal Restrictions**: Test error returns for out-of-season actions
- [ ] **Caffeine AI Check**: Grep entire codebase for "Caffeine" / "caffeine" — must be zero results
- [ ] **Dependency Audit**: Run `npm audit` in frontend — report findings to Security Agent

### 🟠 Phase 5.1: Weather & Sub-Phase Tests
- [ ] **[NEW] `test_weather_system.sh`**:
  - Verify event generation across all 4 seasons
  - Verify infrastructure mitigation (Sprayer prevents pest damage)
  - Verify phase gating (cannot harvest during Growth, cannot plant during Harvest)
  - Verify Opole county multipliers apply correctly per region

### 🟡 Phase 5.2: AI Competitor Tests
- [ ] **[NEW] `test_ai_competitors.sh`**:
  - Verify AI farm initialization (3 archetypes: Marek, Kasia, Hans)
  - Verify seasonal AI decisions execute without errors
  - Verify shared market price impact (prices drop when AI floods supply)
  - Verify each archetype's personality-driven behavior

### 🟢 Phase 5.4: Rankings Tests
- [ ] **Verify `getLeaderboard()`**: Returns valid rankings with player + AI farms
- [ ] **Verify Sort Order**: Profit, Value, Efficiency sortable

### 🔵 Security Coordination
- [ ] **Coordinate with Security Agent**: Share test results from `.tmp/qa.log`
- [ ] **Run Security Test Script**: Execute `execution/tests/test_security_audit.sh` — log to `.tmp/security.log`

---

### ✅ Completed (Archive)

<details>
<summary>Previous Phases</summary>

- [x] Verify `assignParcelToPlayer`, `harvestCherries`, Persistence
- [x] `e2e_backend.sh` passing, `integration_tests.ts` passing, `useAuth.test.tsx` 6/6
</details>

## Agent Instructions
1. Monitor Backend Agent progress.
2. Create test scripts in `execution/tests/`.
3. Formulate `dfx` or script commands for the user to run in WSL.
4. Tell the user to redirect output: `| tee .tmp/qa.log`.
5. Read the log yourself using `view_file` to analyze test results.
6. Execute tests against local replica.
7. Log bugs in `directives/01_backend_backlog.md` (add "Bug Fix" tasks).
8. **Share findings** with Security Agent via `04_security_backlog.md`.
9. Update the checklist as you complete tasks.
