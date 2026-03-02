---
description: Run standardized backend verification tests in WSL.
---

1.  **Check Environment**:
    - Ensure you are in `/home/tkogut/projects/mark-vinicius-cherry-tycoon-1/`.
    - Check if `execution/phase0_verify.sh` exists.

2.  **Run Verification**:
    - Ask the user to run the verification script in their WSL terminal:
      ```bash
      bash execution/phase0_verify.sh 2>&1 | tee .tmp/backend_test.log
      ```
    - Explain that this script handles:
        - `dfx deploy backend`
        - Core function tests
        - Seasonal restrictions
        - Phase system verification
        - Market economy checks

3.  **Analyze Results**:
    - Use `view_file .tmp/backend_test.log` to read the output.
    - Check for "✅ PASS" and "❌ FAIL" indicators.
    - Report the results to the user (e.g., "All 22 tests passed", or "Test failed at step X").

4.  **Log Issues**:
    - If any tests fail, add the specific error details to `directives/01_backend_backlog.md` under a `### 🐞 Bug Fixes` section.
