---
description: Ask the QA Agent to execute tests relevant to the current Master Plan phase.
---

1. Read `.agent/rules/00_master_plan.md`, `.agent/rules/01_backend_backlog.md`, and `.agent/rules/02_frontend_backlog.md` to identify the **Current Focus**.
2. Read `.agent/rules/03_qa_checklist.md` to see available test scripts.
3. Read `.agent/rules/04_security_backlog.md` to check if security tests should also run.
4. Formulate a plan to verify the active components:
   - Phase 0: Run E2E baseline + security audit
   - Phase 5.1: Run weather + sub-phase tests
   - Phase 5.2: Run AI competitor tests
   - Phase 5.3: Visual inspection (manual)
   - Phase 5.4: Run rankings tests
5. Propose the exact `dfx` or `npm test` commands to run.
6. If no specific tests exist for the current phase, propose creating a new test script.