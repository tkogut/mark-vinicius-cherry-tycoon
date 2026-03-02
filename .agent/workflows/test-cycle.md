---
description: Ask the QA Agent to execute tests relevant to the current Master Plan phase.
---

1. Read `directives/00_master_plan.md`, `directives/01_backend_backlog.md`, and `directives/02_frontend_backlog.md` to identify the **Current Focus**.
2. Read `directives/03_qa_checklist.md` to see available test scripts.
3. Read `directives/04_security_backlog.md` to check if security tests should also run.
4. Formulate a plan to verify the active components:
   - Phase 0: Run E2E baseline + security audit
   - Phase 5.1: Run weather + sub-phase tests
   - Phase 5.2: Run AI competitor tests
   - Phase 5.3: Visual inspection (manual)
   - Phase 5.4: Run rankings tests
5. Propose the exact `dfx` or `npm test` commands to run.
6. If no specific tests exist for the current phase, propose creating a new test script.