---
name: skill-creator
description: >
  [Trigger Words: "skill-creator", "new-skill", "create skill", "anatomy",
  "Concise is Key", "v2.2 standard", "skill development"]
  [Domain: Meta-Programming, System Orchestration, Skill Anatomy, standard v2.2]
  [Outcomes: standardized skill folders, validated metadata, efficient context usage]
---

# 🛠️ Skill Creator

🎯 **Purpose**
Definiowanie i egzekwowanie standardów dla modularnych umiejętności (Skills) w ekosystemie AntiGravity. Zapewnia, że każda kompetencja jest samowystarczalna, zwięzła i łatwa do orkiestracji przez system.

🛠️ **Implementation Logic**

1. **Zasada "Concise is Key"**
   Kontekst AI jest zasobem rzadkim. Skille muszą dostarczać tylko wiedzę specjalistyczną. Unikaj lania wody – używaj technicznego, bezpośredniego języka.

2. **Anatomy of a Skill (v2.2)**
   - `skill-name/SKILL.md` (Instrukcje + YAML)
   - `skill-name/scripts/` (Kod wykonywalny)
   - `skill-name/references/` (Dokumentacja)
   - `skill-name/assets/` (Zasoby binarne)

3. **Required Metadata**
   - `name`: Unikalna nazwa folderu.
   - `description`: Precyzyjne słowa kluczowe (Triggers).

🗣️ **Usage Rule**
Wywołaj `skill-creator`, gdy:
- Projektujesz nową funkcjonalność requiring a separate workflow.
- Aktualizujesz istniejący moduł.
- Przeprowadzasz audyt struktury `.agents/skills/`.

## Workflow

1. **Identify**: Określ, czy nowa wiedza wymaga osobnego skilla.
2. **Initialize**: Stwórz strukturę katalogów i plik `SKILL.md` z metadanymi.
3. **Draft Instructions**: Napisz sekcje Purpose, Logic, Usage Rule i Workflow.
4. **Populate Resources**: Umieść skrypty w `scripts/` i dokumentację w `references/`.
5. **Validate**: Sprawdź zgodność z zasadą "Concise is Key".
6. **Test**: Zweryfikuj, czy Agent poprawnie ładuje zasoby.

Standard AntiGravity v2.2 | Efficiency through Modularity.