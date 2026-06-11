---
name: code-reviewer
description: Auditor logic for PR and local changes. Standard v5.0.
trigger_words: ["review code", "review pr", "check changes"]
---

# 🔍 Code Reviewer (Ultra+)

🎯 **Purpose**
Techniczny audyt poprawności, bezpieczeństwa i standardów projektu.

🛠️ **Implementation Logic**
1. **Target**: \`gh pr checkout <ID>\` (Remote) lub \`git diff --staged\` (Local).
2. **Preflight**: Wymuś \`npm run preflight\` przed analizą.
3. **Analiza**: Wykryj błędy krytyczne, luki bezpieczeństwa i brak testów.

🗣️ **Usage Rule**
Zwróć raport w formacie:
- **Critical**: Błędy blokujące.
- **Improvement**: Sugestie optymalizacji.
- **Verdict**: [Approve / Request Changes].
