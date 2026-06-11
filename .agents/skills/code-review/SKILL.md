---
name: code-review
description: >
  [Trigger Words: "code-review", "review", "refactor", "sprawdź kod", "czytelność",
  "anti-flat", "concise", "Motoko optimization", "Steampunk UI"]
  [Domain: Code Quality, Motoko, React, AntiGravity Design, Technical Debt]
  [Outcomes: REVIEW_PASSED status, elimination of technical debt, enforcement of "Concise is Key"]
---

# 🧐 Code Reviewer Skill

🎯 **Purpose**
Zapewnienie najwyższej jakości kodu poprzez eliminację długu technicznego, zbędnego gadulstwa w komentarzach oraz błędów w implementacji wzorców wizualnych.

🛠️ **Implementation Logic**
Podczas recenzji agent musi sprawdzić:
- **Frontend**: Czy użyto `.mechanical-hull`? Czy wskaźniki używają maskowania?
- **Backend**: Czy typy Candid są spójne? Czy zachowano segregację Track A/B?
- **General**: Czy kod jest zwięzły? Czy usunięto "placeholder logic"?

🗣️ **Usage Rule**
Wywołaj `/code-review` przed każdym commitem lub gdy chcesz, aby agent "spojrzał świeżym okiem" na skomplikowany moduł.

## Workflow

1. **Static Analysis**: Szybki przegląd diffa lub pliku.
2. **Standard Check**: Porównanie z `references/code_style_guide.md`.
3. **Refactor Suggestion**: Przedstawienie tabeli: "Obecny kod" vs "Wersja AntiGravity (Zwięzła)".
4. **Approval**: Nadanie statusu `REVIEW_PASSED`.

## References
- `references/code_style_guide.md` — Standardy AntiGravity
- `../../ui-factory/references/ui-consistency.md` — Visual standards
