---
name: pr-creator
description: Coordinator logic for PR creation and validation. Standard v5.0.
trigger_words: ["create pr", "submit pull request", "make pr"]
---

# 🌿 PR Creator (Ultra+)

🎯 **Purpose**
Walidacja stanu projektu i utworzenie PR na GitHubie.

🛠️ **Implementation Logic**
1. **Guardrail**: Zakaz bezpośredniej pracy na `main`/`master`.
2. **Branch Check**: Zweryfikuj aktualną gałąź (`git branch --show-current`).
3. **Quality Gate**: Wymuś testy lokalne (`npm run test` lub `pytest`).
4. **Command**:
   ```bash
   gh pr create --title "<type>: <short description>" --body "<summary of changes>"
   ```

🗣️ **Usage Rule**
Musi przestrzegać formatu Conventional Commits. Wymaga zgody użytkownika przed wywołaniem `gh pr create`.
