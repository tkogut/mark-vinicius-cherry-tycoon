---
description: Run standardized frontend build & verify tests in WSL.
---

1.  **Check Environment**:
    - Ensure you are in `/home/tkogut/projects/mark-vinicius-cherry-tycoon-1/`.
    - **CRITICAL**: Check if `node_modules` exists in `frontend/`.
    - If missing, warn the user: "Native Node.js (Linux version) is required. Install via `nvm install --lts` in WSL first."

2.  **Run Build Verification**:
    - Ask the user to run the build command in their WSL terminal:
      ```bash
      cd frontend && npm install && npm run build 2>&1 | tee ../.tmp/frontend_build.log
      ```
    - Explain that this verifies:
        - TypeScript compilation
        - Vite build process
        - Asset generation

3.  **Analyze Results**:
    - Use `view_file .tmp/frontend_build.log` to read the output.
    - Check for "Build complete" or error messages.
    - Report the results to the user.

4.  **Log Issues**:
    - If build fails, add the specific error details to `directives/02_frontend_backlog.md` under a `### 🐞 Build Issues` section.
