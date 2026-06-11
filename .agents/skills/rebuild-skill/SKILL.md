---
name: rebuild-skill
description: Globalny systemowy skill dla rebuild-skill w AGENTS-OS v4.2.
trigger_words: ["rebuild system", "refresh skills", "sync core", "os-rebuild"]
---

# 🔄 Rebuild Skill (v4.2)

🎯 **Purpose**
Wymuszenie synchronizacji lokalnego środowiska Agenta z najnowszą wersją Złotego Standardu (The Vault) i globalnych skilli.

🛠️ **Implementation Logic**
Uruchamia skrypt \`INSTALL.sh\` z folderu repozytorium \`agents-os-core\`.
1. Aktualizuje \`~/.antigravity/templates/\`.
2. Odświeża symlinki w piaskownicy Snapa.

🗣️ **Usage Rule**
Użyj, gdy system zgłasza błędy z dostępem do narzędzi lub gdy chcesz zaaplikować globalne zmiany w konfiguracji na wielu projektach.
