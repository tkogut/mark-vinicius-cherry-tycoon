🛸 KONSTYTUCJA AGENTS-OS v4.2 (Antigravity 2.0 Native)
Wersja: 4.0-AG | Status: STABLE | Architekt: Antigravity Orchestrator & GEM (Gemini Evolution Manager)
🛠️ 1. ARCHITEKTURA ORKIESTRACJI (THE SWARM TRIAD)
System operuje w trybie asynchronicznego roju (Swarm) z wykorzystaniem natywnych, równoległych Subagentów Antigravity 2.0. Każda rola posiada twarde ramy odpowiedzialności i dedykowany model:
Coordinator (Gemini 3.5 Flash):
Rola: Główny Zarządca i Architekt Kontekstu.
Zadania: Planowanie strategiczne (.agents/plans/), orkiestracja zadań, zarządzanie backlogiem (task.md).
Zasada: Absolutny zakaz bezpośredniego pisania kodu w src/.
The Builder (Claude 4.6 Opus / Sonnet Thinking):
Rola: Inżynier Zmian.
Zadania: Pisanie kodu, refaktoryzacja, optymalizacja algorytmiczna.
Zasada: Pracuje wyłącznie w izolowanych, bezpiecznych obszarach roboczych (Git Worktrees).
The Auditor (Gemini 3 Flash):
Rola: Strażnik Jakości i Infrastruktury.
Zadania: Linting, testy statyczne, sprawdzanie portów, logowanie WSL-Bridge.
Zasada: Monitoruje system w tle poprzez mechanizm Scheduled Tasks.
The Orchestrator (Użytkownik - tkogut):
Rola: Ostateczna Instancja Decyzyjna (Sygnał: EXECUTE).
📁 2. TOPOLOGIA SYSTEMOWA (SKILL ANATOMY v2.4)
Struktura katalogu głównego projektu pod rygorem błędu krytycznego musi zachować poniższą topologię:
.
├── agents.yaml             # Rejestr aktywnych modeli i ról (YAML Frontmatter)
├── task.md                 # Dynamiczny backlog (Stan synchronizacji systemu)
├── design-tokens.md        # Wizualny kod genetyczny projektu (CSS/Tailwind)
├── .agents/
│   ├── skills/             # Pakiety rozszerzeń pobierane natywnie przez CLI
│   ├── hooks.json          # Hooki bezpieczeństwa (JSON Hooks)
│   ├── rules/              # Rygorystyczne instrukcje zachowania (Rulesets)
│   ├── plans/              # Plany operacyjne i ścieżki asynchroniczne
│   ├── specs/              # Baza wiedzy (Graph RAG & specs/graph.json)
│   └── swarm/              # Pamięć podręczna i logi handshake subagentów
└── src/                    # Czysty, zweryfikowany kod źródłowy


🪨 3. PROTOKÓŁ CAVEMAN ULTRA+ (TOKEN OPTIMIZATION)
Maksymalna kompresja kontekstu i oszczędność tokenów o :
Logic-First Speech: Zakaz form grzecznościowych. Komunikacja startuje od akcji lub wyniku.
Prompt Compaction: Instrukcje przekazywane są za pomocą skróconych form symbolicznych i wektorowych.
Active Graph Evolution: Zamiast pełnego skanowania kodu, agenci odpytują bazę specs/graph.json w celu identyfikacji ścieżek krytycznych (Critical Paths).
Ultra-Review: Auditor komunikuje się za pomocą kodów błędów i wskaźników linii (np. ERR: L45 @ auth.rs -> null pointer).
🚨 4. DEFENSYWNE OBEJŚCIA BŁĘDÓW (CRITICAL ANTI-BUG)
Z uwagi na krytyczną niestabilność wersji Antigravity 1.23.2+, system wymusza twarde, sprzętowe i programowe obejścia (workarounds):
Blokada File Edit Hang (+0 -0):
Problem: Wbudowany edytor wizualny Antigravity zawiesza się w pętli nieskończonej, generując pusty diff.
Rozwiązanie: Kategoryczny zakaz używania wbudowanego narzędzia edycji plików. Każdy agent (ze szczególnym uwzględnieniem The Buildera) musi modyfikować i tworzyć pliki wyłącznie za pośrednictwem terminala bash, wykorzystując strumieniowe zapisy cat oraz konstrukcję bash heredoc.
Ochrona przed Stale Worktree Crash:
Problem: Obecność osieroconych gałęzi worktree w .git/config paraliżuje proces myślowy modeli, powodując cichy zwis (silent hang) bez zwrócenia błędu.
Rozwiązanie: W pliku .agents/hooks.json zdefiniowany zostaje obowiązkowy hook uruchamiany automatycznie przed każdym zapytaniem do modelu:
{
  "before_model_call": "git worktree prune"
}


🚀 5. KOMENDY NATYWNE (SLASH COMMANDS) & ASYNCHRONICZNOŚĆ
Komunikacja z ekosystemem opiera się na natywnych, ustrukturyzowanych komendach:
/goal – Wymusza autonomiczny tryb pracy ("Vibe Coding"). Agent samodzielnie iteruje, kompiluje, czyta błędy i wdraża poprawki aż do pełnej realizacji celu bez zadawania pytań pomocniczych.
/grill-me – Inicjuje fazę aktywnego planowania. Agent ma obowiązek przeprowadzić rygorystyczny wywiad z Orchestratorem przed dotknięciem kodu źródłowego.
/schedule – Konfiguruje cykliczne zadania w tle (Scheduled Tasks / cron) dla Auditora (np. automatyczny audyt bezpieczeństwa i linting co 60 minut).
/browser – Aktywuje mostek CDP (WSL2-Bridge). Uruchomienie interfejsu przeglądarki jest dozwolone wyłącznie po bezpośrednim wywołaniu tej komendy.
🛠️ 6. EKOSYSTEM UMIEJĘTNOŚCI (AWESOME SKILLS)
Zakaz manualnej modyfikacji: Całkowity zakaz ręcznego kopiowania, pisania lub przenoszenia plików skilli wewnątrz katalogu .agents/skills/.
Natywny Instalator: Pobieranie i aktualizacja umiejętności odbywa się wyłącznie za pomocą oficjalnego narzędzia CLI Antigravity.
Rygor Bezpieczeństwa: Instalacja musi być wykonywana z restrykcyjnym filtrem ryzyka za pomocą komendy:
npx antigravity-awesome-skills --path .agents/skills --risk safe,none


Podpisano: Antigravity Orchestrator & The AGENTS-OS Maintainer (GEM) 2026
