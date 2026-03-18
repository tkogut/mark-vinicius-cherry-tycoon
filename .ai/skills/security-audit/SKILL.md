---
name: security-audit
description: >
  [Trigger Words: "security", "audit", "access control", "deploy", "vulnerability",
  "canister security", "principal", "caller", "economic exploit", "before mainnet"]
  [Domain: Motoko canister security, ICP blockchain, frontend XSS, cycle management]
  [Outcomes: blocks deploys on Critical/High findings, verifies 7 security domains,
  enforces JaPiTo Group SECURITY_DIRECTIVE_V1]
---

# Security Audit Skill — The Gatekeeper

🎯 **Purpose**: 
Proactive security gatekeeper. Reviews every backend commit to block Critical 🔴 or High 🟠 findings. /deploy is BLOCKED until this skill runs and returns CLEAN.

🛠️ **Implementation Logic**:
- **Gate**: Run `/security-audit` BEFORE any `/deploy`.
- **Domains**: 7 Security Domains (Canister, Cycle, State, Access, Econ, Frontend, ICP).
- **Compliance**: No "Caffeine AI" references; "Produced by JaPiTo Group" mandatory.

🗣️ **Usage Rule**:
Activate via `/security-audit [scope]`. 
Handshake: `"🔐 Security CLEAR: No Critical/High findings. /deploy unblocked."`

## Workflow:

1. **Read Logs**: Check `references/backlog.md` and `01_backend_backlog.md` for recent changes.
2. **Review Canvas**: Audit `main.mo` and `game_logic.mo` against Domain 1-7 checklist.
3. **Log Findings**: Record symptoms in `.tmp/security.log` with severity.
4. **Update Backlog**: Mark `references/backlog.md` as Clean or Blocked.
5. **Report**: Output final status to User.

## References
- `references/SECURITY_DIRECTIVE_V1.md` — Full security policy
- `references/backlog.md` — Live security backlog
