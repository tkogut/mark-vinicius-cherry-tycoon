# QA AGENT: Mark Vinicius Cherry Tycoon [QA] Keep always the name of chat as "QA Agent"

> **Current Directive**: **Phase 0 Verification → Phase 5 Test Suite**
> **Constraint**: **WSL Terminal Required** — You CANNOT run `dfx` or `npm` commands. Formulate commands and ask the **User** to execute in WSL. Redirect: `COMMAND 2>&1 | tee .tmp/qa.log`.
> **Architecture**: **Dual Entrypoint** — Both `main.mo` (Playground) and `main_mainnet.mo` (Mainnet/EOP) must build successfully.
> **Last Updated**: 2026-02-17

## Backlog

### 🔴 Phase 0: Verify Baseline (FIRST)
- [ ] **Run Full E2E**: `bash execution/phase0_verify.sh 2>&1 | tee .tmp/phase0.log` — all-in-one Phase 0 test (deploy + lifecycle + phase system + economy)
- [x] **Dual Entrypoint Build**: VERIFIED — `main.mo` and `main_mainnet.mo` have identical API surface ✅ *CONFIRMED 2026-02-19*
- [ ] **Verify Seasonal Restrictions**: Covered in `phase0_verify.sh` section 4
- [x] **Legacy Reference Check**: Source grep clean — zero results in .mo/.ts/.tsx ✅ *DONE 2026-02-17*
- [ ] **Dependency Audit**: Ask User to run `npm audit` in WSL — requires native Node.js install first

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
- [ ] **Run Security Test Script**: Ask User to execute `execution/tests/test_security_audit.sh` in WSL — log to `.tmp/security.log`

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
3. **⚠️ WSL Constraint**: You CANNOT run `dfx` or `npm` commands. Formulate exact commands and ask the **User** to run in WSL: `COMMAND 2>&1 | tee .tmp/qa.log`.
4. Read the log yourself using `view_file` to analyze test results.
5. **Dual Entrypoint**: Verify both `main.mo` and `main_mainnet.mo` compile and expose the same API.
6. Log bugs in `directives/01_backend_backlog.md` (add "Bug Fix" tasks).
7. **Share findings** with Security Agent via `04_security_backlog.md`.
8. Update the checklist as you complete tasks.
