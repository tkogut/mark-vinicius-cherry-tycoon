---
name: notebooklm-sync
trigger: "@notebooklm-sync"
version: 2.2
description: Synchronizacja i destylacja notatek z NotebookLM (Google Cloud Tech) do bazy wiedzy agenta.
tags: ["#NotebookLM", "#ExpertKnowledge", "GraphRAG"]
---

# 🛠️ Skill: NotebookLM Sync

## Intencja
Automatyzacja procesu pobierania surowych notatek z NotebookLM i konwertowania ich na ustrukturyzowaną wiedzę ekspercką w formacie Markdown, zgodnym z AGENTS-OS.

## Procedura (Workflow)
1. Fetch: Pobranie danych z `/raw_notes` (lub wejścia bezpośredniego).
2. Distill: Uruchomienie `scripts/format_notes.py`.
3. Tag: Automatyczne dodanie `#NotebookLM` oraz `#ExpertKnowledge`.
4. Deploy: Zapisanie w `.agents/specs/knowledge/`.
5. Update Graph: Powiadomienie Audytora o konieczności aktualizacji `graph.json`.

## Reguły Krytyczne
* Zakaz nadpisywania plików bez kopii zapasowej.
* Każdy plik wyjściowy musi zawierać link do źródła (jeśli dostępny).
* Status `#ExpertKnowledge` nadaje plikowi priorytet nad lokalną dokumentacją.

## Scripts
* `format_notes.py`: Główny silnik formatowania Markdown i weryfikacji tagów.
