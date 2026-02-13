# QA AGENT: Mark Vinicius Cherry Tycoon [QA] Keep always the name of chat as "QA Agent"

> **Current Directive**: **Verify Backend Core Logic**
> **Constraint**: **WSL Terminal Required** - For `dfx` and test scripts.
> **Last Updated**: 2026-02-08

## Backlog

### Verification Tasks
- [x] **Verify `assignParcelToPlayer`**: Test with valid and invalid IDs. Ensure ownership changes. (Verified)
- [x] **Verify `harvestCherries`**:
    - [x] Test harvesting planted parcel (Verified: Passing in latest logs).
    - [x] Test harvesting empty parcel (Verified: Passing in latest logs).
- [x] **Verify Persistence**:
    - [x] Deploy canister -> Create data -> Upgrade canister (`dfx deploy --upgrade-unchanged`) -> Verify data persists. (Verified: Passing in latest logs).

### Test Scripts needed
- [x] Create `execution/tests/e2e_backend.sh` using `dfx canister call`. (Verified: Script passed)
- [x] Create `tests/integration_tests.ts` using `vitest` + `@dfinity/agent`.
    - [x] Fixed `GameError` type mismatch in declarations and test suite.
- [x] Verify `useAuth.test.tsx` React hook tests (6/6 passing).

## Agent Instructions
1.  Monitor Backend Agent progress.
2.  Create test scripts in `execution/tests/`.
3.  Formulate `dfx` or script commands for the user to run in WSL.
4.  Tell the user to redirect output: `| tee .tmp/qa.log`.
5.  Read the log yourself using `view_file` to analyze test results.
6.  Execute tests against local replica.
7.  Log bugs in `directives/01_backend_backlog.md` (add "Bug Fix" tasks).
8.  Update the checklist as you complete tasks.
