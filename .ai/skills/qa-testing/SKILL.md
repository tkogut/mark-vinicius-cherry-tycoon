---
name: qa-testing
description: >
  [Trigger Words: "test", "qa", "regression", "test suite", "verify", "checklist",
  "test backend", "test frontend", "phase test", "e2e", "verify changes", "qa-test"]
  [Domain: dfx canister calls, bash test scripts, React/Vite frontend, 03_qa_checklist.md]
  [Outcomes: runs regression suite, verifies math_consistency, checks dual-entrypoint parity,
  logs results to .tmp/qa.log, reports to Security Agent]
---

# QA Testing Skill

🎯 **Purpose**: 
Automate regression testing and QA checklist verification. Feeds results to Security Agent and Master Plan to block unstable releases.

🛠️ **Implementation Logic**:
- **Baseline**: `scripts/phase0_verify.sh`.
- **Checklist**: `references/03_qa_checklist.md`.
- **Constraint**: Formulate bash commands for User execution in WSL.

🗣️ **Usage Rule**:
Activate via `/qa-test [scope]`. 
Handshake: `"QA Run complete: [N] PASS / [M] FAIL. [Issues] logged to backend backlog."`

## Workflow:

1. **Identify Scope**: Choose full regression or specific phase test from `scripts/`.
2. **Execute (WSL)**: `bash .ai/skills/qa-testing/scripts/[test].sh 2>&1 | tee .tmp/qa.log`.
3. **Verify Parity**: Run `dfx build` to ensure both actors compiled.
4. **Formula Check**: Cross-check results with `math_consistency.md`.
5. **Report**: Log bugs to `01_backend_backlog.md` and share findings with Security.

## Scripts
- `scripts/` — Full suite of 21 test scripts migrated from `execution/tests/`.

## References
- `references/03_qa_checklist.md` — Live QA checklist
- `../../economic-math-auditor/references/math_consistency.md` — Formula cross-check
