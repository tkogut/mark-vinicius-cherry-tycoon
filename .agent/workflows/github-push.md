---
description: Commit all changes with a descriptive message and push to GitHub
---

1. Run `git status` to see what changes are pending.
2. Generate a concise, conventional commit message based on the changes (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
3. Propose and execute the following commands:
   ```bash
   git add .
   git commit -m "YOUR_GENERATED_MESSAGE"
   git push origin HEAD
   ```
4. Verify the push was successful.
