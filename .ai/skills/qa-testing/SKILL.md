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

## Purpose
Automate regression testing and QA checklist verification after every significant
logic change. Results feed into the Security Agent and the master plan.

> [!IMPORTANT]
> **WSL Constraint**: Agent formulates commands — User runs them in WSL.
> Always redirect: `COMMAND 2>&1 | tee .tmp/qa.log`

## Test Suite Map

| Script | Phase | Status |
|---|---|---|
| `execution/phase0_verify.sh` | Phase 0 — Full lifecycle baseline | Runnable |
| `execution/tests/test_phase8_auctions.sh` | Phase 8.0 — Auction system | ✅ 9/9 PASS |
| `execution/tests/test_phase5_6.sh` | Phase 5.6 — Turn system | ✅ PASS |
| `execution/tests/test_phase5_7.sh` | Phase 5.7 — Economy mechanics | ✅ PASS |
| `execution/test_all_phases.sh` | All phases — full regression | Runnable |
| `execution/test_selling.sh` | Market sell flows | Runnable |
| `execution/tests/test_security_audit.sh` | Security validation | Coordinate with Security Agent |

## QA Checklist Reference
→ `references/checklist.md` (live state of `03_qa_checklist.md`)

**Active Phase**: Phase 8.0 Competitive Pool + Phase 8.1 Frontend.

**Pending (Priority 1)**:
- Full Pre-Season Future lifecycle integration test
- Closed-bid auction win — revenue credited + contract #Fulfilled
- AI archetype gate tests (Hans/Kasia/Marek behavior)
- Flood Factor degradation test

## Dual-Entrypoint Verification Requirement
Every QA run MUST verify both `main.mo` and `main_mainnet.mo` compile:
```bash
dfx build 2>&1 | tee .tmp/build_check.log
```
Both actors must appear in output without errors.

## Math Consistency Cross-Check
After any economy test, verify formulas against `.ai/skills/economic-math-auditor/references/math_consistency.md`:
- Spoilage rates: ColdStorage `0.20`, Warehouse `0.80`
- Upgrade cost scaling: `1.15^Level` confirmed
- Bid score: `(margin × (1000 + prestige) × qualityMult) / 100`

## Workflow (`/qa-test [scope]` activation)

### Full Regression
```bash
# 1. Backend: full phase suite
bash execution/test_all_phases.sh 2>&1 | tee .tmp/qa.log

# 2. Phase 0 baseline
bash execution/phase0_verify.sh 2>&1 | tee .tmp/phase0.log

# 3. Phase 8 auctions (priority)
bash execution/tests/test_phase8_auctions.sh 2>&1 | tee .tmp/phase8.log
```

### Frontend QA (`/qa-test frontend`)
```bash
# Build check
cd frontend && yarn build 2>&1 | tee ../.tmp/frontend_build.log

# Dependency audit
cd frontend && yarn audit 2>&1 | tee ../.tmp/yarn_audit.log
# Expected: 0 critical vulnerabilities

# Mobile emulation: use browser-connectivity skill → CDP port 9222
# Verify in roostertk profile at 375px width
```

### After Each Run
1. Read `.tmp/qa.log` using `view_file` — identify FAIL lines.
2. Log bugs to `.agent/rules/01_backend_backlog.md` under `### 🐞 Bug Fixes`.
3. Share security-relevant findings with Security Agent via `04_security_backlog.md`.
4. Update `03_qa_checklist.md` — change `[ ]` → `[x]` for passing tests.
5. Output summary:
   > `"QA Run complete: [N] PASS / [M] FAIL. [Issues] logged to backend backlog."`

## Scripts Reference
→ `scripts/README.md` — index of all test scripts in `execution/tests/`

## References
- `references/checklist.md` — live QA checklist (03_qa_checklist.md)
- `.ai/skills/economic-math-auditor/references/math_consistency.md` — formula cross-check
- `.ai/skills/security-audit/SKILL.md` — forward security findings here
