---
name: os-publish-knowledge
description: Publish engineering knowledge notes from .agents/specs/knowledge to Obsidian Second Brain (raw/notes) with ISO 27001 secret scan and automatic INGEST scaffolding into wiki/sources/, index.md, and log.md.
trigger: /os-publish-knowledge
trigger_words: ["publish knowledge", "os-publish-knowledge", "ingest knowledge", "publikuj wiedze", "zrob ingest", "ingest sejf"]
---

# 📦 Skill: `os-publish-knowledge` (ISO 27001 & INGEST Scaffolding)

Skill odpowiedzialny za bezpieczną publikację notatek wiedzy inżynieryjnej (`.md`) z katalogu `.agents/specs/knowledge/` projektu do osobistego Sejfu Obsidian (`sejf_tk`), wraz z automatycznym scaffoldingiem procedury **INGEST** (zgodnie ze wzorcem Karpathy LLM Wiki).

---

## 🛡️ Zasady Bezpieczeństwa (ISO 27001)

1. **Skaner Sekretów i PII**:
   - Blokuje transfer plików zawierających: klucze API (`sk-`, `AKIA`), tokeny JWT, klucze prywatne, hasła, adresy e-mail spoza domen MIW Group, numery PESEL i IBAN.
   - W przypadku wykrycia wrażliwych danych raport podaje **tylko nazwę reguły**, nigdy wartość sekretu.
2. **Ochrona przed Nadpisaniem**:
   - Identyczny plik (SHA-256): pomijany (`IDENTICAL_CONTENT`).
   - Różna treść przy istniejącej nazwie: zgłasza konflikt (`TARGET_EXISTS_WITH_DIFFERENT_CONTENT`), brak nadpisania.
3. **Fail-Closed & Zero Full-Disk Probing**:
   - Ścieżka docelowa vaulta pochodzi z: parametru CLI `--dest`, zmiennej `OBSIDIAN_VAULT_PATH` lub domyślnej `/mnt/c/Users/tkogut/Documents/sejf_tk/raw/notes`.
   - Brak skanowania całego dysku.

---

## 🚀 Użycie z Terminala (CLI)

W katalogu dowolnego projektu:

> **Źródło:** domyślnie `.agents/specs/knowledge/`. Projekty bez tego katalogu (np. gra z digestami w `docs/second-brain/digests`) wskazują go przez `--source <katalog>`.

### 1. Podgląd bezpieczny (Dry-Run)
```bash
os-publish-knowledge
```
Sprawdza sekrety, porównuje sumy kontrolne i wyświetla raport bez modyfikowania plików.

### 2. Publikacja do `raw/notes` (Zapis)
```bash
os-publish-knowledge --apply
```
Kopiuje notatki do `<vault>/raw/notes/` ze statusem `status: new`.

### 3. Pełny cykl: Publikacja + Automatyczny Scaffolding INGEST (tylko sesja redaktora wiki)

> **Agenci projektów NIE używają `--ingest`.** Zapisuje on w `index.md`, `log.md` i `wiki/sources/` vaulta, gdzie obowiązuje zasada jednego pisarza (vault `AGENTS.md` pkt 8–9). INGEST wykonuje sesja redaktora wiki (Claude Code / Claude Desktop w vaulcie) w porozumieniu z właścicielem. Poniższa opcja jest dla tej sesji albo na wyraźne polecenie właściciela.

```bash
os-publish-knowledge --apply --ingest
```
Wykonuje publikację oraz natychmiastowy scaffolding INGEST w vaulcie:
- Tworzy stronę źródłową `wiki/sources/src-<slug>.md` (ze strukturą: Podsumowanie, Szczegóły, Sprzeczności, Powiązania, Źródła),
- Rejestruje źródło w `index.md` pod sekcją `## Źródła (sources)`,
- Dopisuje wpis do dziennika `log.md` (`## [YYYY-MM-DD] ingest | <Tytuł>`),
- Oznacza notatkę w `raw/notes/` jako `status: processed`.

---

## 🤖 Instrukcja dla Agenta AI (Claude / Antigravity / Gemini)

Gdy użytkownik prosi o:
- „Opublikuj notatki wiedzy z projektu”,
- „Wykonaj transfer wiedzy do sejfu”,
- „Zrób ingest wiedzy” (opublikuj notatki przez `--apply`; sam INGEST do wiki wykona sesja redaktora, patrz niżej),

Wykonaj następujące kroki:

1. **Uruchom weryfikację Dry-Run** (z `--source <katalog>`, jeśli projekt nie ma `.agents/specs/knowledge/`):
   ```bash
   os-publish-knowledge
   ```
2. **Sprawdź raport**:
   - Jeśli `🛑 Zablokowano: > 0` lub `⚠️ Konflikty: > 0` – **ZATRZYMAJ SIĘ**. Zgłoś użytkownikowi pliki do oczyszczenia (podaj tylko typ reguły, zero sekretów).
3. **Zastosuj zmiany (`--apply`, bez `--ingest`)**:
   ```bash
   os-publish-knowledge --apply
   ```
   Nie używaj `--ingest` ani nie edytuj ręcznie `index.md`, `log.md`, `wiki/` w vaulcie. Nie wykonuj w vaulcie komend git i nie twórz tam symlinków.
4. **Zgłoś wynik** właścicielowi: nazwy opublikowanych plików, wynik skanera i informację, że INGEST do wiki czeka na sesję redaktora.
5. **Dekompozycja pojęciowa (opcjonalny krok semantyczny LLM; tylko sesja redaktora wiki po INGEST)**:
   - Przejrzyj utworzoną stronę `wiki/sources/src-<slug>.md`.
   - Jeśli notatka definiuje nowe kluczowe pojęcia biznesowe lub techniczne, utwórz dedykowane strony w `wiki/concepts/<pojęcie>.md` (min. 2 powiązania, wikilinki) i zaktualizuj `index.md`.
