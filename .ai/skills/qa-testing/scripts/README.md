# scripts/ — QA Test Scripts

> **Canonical location**: All test scripts live in `execution/` and `execution/tests/` in project root.
> This README is an index — do not duplicate scripts here.

## Main Scripts

| Script | Location | Purpose |
|---|---|---|
| `test_all_phases.sh` | `execution/test_all_phases.sh` | Full regression across all phases |
| `phase0_verify.sh` | `execution/phase0_verify.sh` | Phase 0 baseline: deploy + lifecycle + economy |
| `test_selling.sh` | `execution/test_selling.sh` | Market sell flows |
| `test_phases.sh` | `execution/test_phases.sh` | Phase progression tests |

## Phase-Specific Scripts (`execution/tests/`)

| Script | Phase | Last Known Status |
|---|---|---|
| `test_phase8_auctions.sh` | Phase 8.0 — Auction System | ✅ 9/9 PASS (2026-03-10) |
| `test_phase5_6.sh` | Phase 5.6 — Turn System | ✅ PASS |
| `test_phase5_7.sh` | Phase 5.7 — Economy Mechanics | ✅ PASS |
| `test_security_audit.sh` | Security Validation | Coordinate with Security Agent |

## Execution Pattern (WSL Required)

```bash
# Backend test
bash execution/test_all_phases.sh 2>&1 | tee .tmp/qa.log

# Read results
cat .tmp/qa.log | grep -E "PASS|FAIL|ERROR"
```

## Result Format
After run, agent reads `.tmp/qa.log` with `view_file` and:
- FAILs → logged to `.agent/rules/01_backend_backlog.md`
- Security finds → forwarded to `.agent/rules/04_security_backlog.md`
