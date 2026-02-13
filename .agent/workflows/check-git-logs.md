---
description: Fetch and analyze the latest GitHub Actions workflow logs.
---
1. Check if the `gh` CLI is installed by running `gh --version`.
2. If `gh` is installed:
   - Run `gh run view --log > .tmp/github-workflow.log` to fetch the latest logs.
   - Use `view_file` to read `.tmp/github-workflow.log`.
3. If `gh` is NOT installed:
   - Notify the user that they need to install `gh` for automatic log fetching, or manually paste the logs into `.tmp/github-workflow.log`.
   - Wait for the user to confirm they have updated the file.
   - Use `view_file` to read `.tmp/github-workflow.log`.
4. Analyze any errors or output found in the file.
5. Report your findings to the user.