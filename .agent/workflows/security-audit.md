---
description: Trigger a security audit of specified scope against the blockchain security policy.
---

1. Read `.agent/rules/SECURITY_DIRECTIVE_V1.md` for the full security policy.
2. Read `.agent/rules/04_security_backlog.md` for current findings and status.
3. Read `.agent/rules/01_backend_backlog.md` to identify recent Backend changes.
4. Determine the audit scope:
   - **Full Audit**: Scan all backend files (`main.mo`, `game_logic.mo`, `types.mo`, etc.)
   - **Targeted Audit**: Focus on specific files or functions (if specified by user)
5. Run the security checklist against all 7 domains (§2.1–§2.7 of SECURITY_DIRECTIVE_V1):
   - Canister Security, Cycle Management, State Integrity, Access Control
   - Economic Security, Frontend Security, ICP-Specific
6. Log all findings to `.tmp/security.log` with severity tags.
7. Update `.agent/rules/04_security_backlog.md` with new issues.
8. If **Critical/High** found → Mark as `**BLOCKED**` and alert User immediately.
9. If clean → Report "Security Reviewed ✅".
