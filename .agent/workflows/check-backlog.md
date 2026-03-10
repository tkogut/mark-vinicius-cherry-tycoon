---
description: Read your role-specific backlog file and report current tasks.
---

1. Identify your role (Backend, Frontend, QA, or Security).
2. Read your specific backlog file:
   - Backend: `.agent/rules/01_backend_backlog.md`, `.agent/rules/02_frontend_backlog.md`, `.agent/rules/00_master_plan.md`
   - Frontend: `.agent/rules/02_frontend_backlog.md`, `.agent/rules/01_backend_backlog.md`, `.agent/rules/00_master_plan.md`
   - QA: `.agent/rules/03_qa_checklist.md`, `.agent/rules/00_master_plan.md`
   - Security: `.agent/rules/04_security_backlog.md`, `.agent/rules/SECURITY_DIRECTIVE_V1.md`, `.agent/rules/01_backend_backlog.md`
3. Summarize:
   - Current directive/phase
   - Tasks marked as `[/]` (in-progress)
   - Next task marked as `[ ]` (pending)
4. Ask the user if you should proceed with the current task or if they have other priorities.