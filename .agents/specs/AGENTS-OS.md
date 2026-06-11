🛸 KONSTYTUCJA AGENTS-OS v5.0 Swarm Edition — Instrukcja obsługi
Wersja: 5.0-AG | Status: STABLE | Architekt: Antigravity Orchestrator & GEM (Gemini Evolution Manager)

🛠️ 1. ARCHITEKTURA ORKIESTRACJI (THE SWARM TRIAD)
System operuje w trybie asynchronicznego roju (Swarm) z wykorzystaniem natywnych, równoległych Subagentów Antigravity 2.0. Każda rola posiada twarde ramy odpowiedzialności i dedykowany model:

Coordinator (Gemini 3.5 Flash):
- Rola: Główny Zarządca i Architekt Kontekstu.
- Zadania: Planowanie strategiczne (.agents/plans/), orkiestracja zadań, zarządzanie backlogiem (task.md).
- Zasada: Absolutny zakaz bezpośredniego pisania kodu w src/.

The Builder (Claude Sonnet 4.6 (Thinking)):
- Rola: Inżynier Zmian.
- Zadania: Pisanie kodu, refaktoryzacja, optymalizacja algorytmiczna.
- Zasada: Pracuje wyłącznie w izolowanych, bezpiecznych obszarach roboczych (Git Worktrees).

The Auditor (Gemini 3.5 Flash (Low)):
- Rola: Strażnik Jakości i Infrastruktury.
- Zadania: Linting, testy statyczne, sprawdzanie portów, logowanie WSL-Bridge.
- Zasada: Monitoruje system w tle poprzez mechanizm Scheduled Tasks.

The Orchestrator (Użytkownik - tkogut):
- Rola: Ostateczna Instancja Decyzyjna (Sygnał: EXECUTE).

📁 2. TOPOLOGIA SYSTEMOWA (SKILL ANATOMY v2.4)
Struktura katalogu głównego projektu pod rygorem błędu krytycznego musi zachować poniższą topologię:
.
├── agents.yaml             # Rejestr aktywnych modeli i ról (YAML Frontmatter)
├── task.md                 # Dynamiczny backlog (Stan synchronizacji systemu)
├── design-tokens.md        # Wizualny kod genetyczny projektu (CSS/Tailwind)
├── .gemini/
│   └── mcp_config.json     # Konfiguracja izolacji węzłów MCP per-projekt
├── .github/
│   └── workflows/          # Zewnętrzne potoki CI/CD (Cron Jobs)
├── .agents/
│   ├── mcp-servers/        # Lokalne węzły wiedzy Model Context Protocol
│   ├── skills/             # Pakiety rozszerzeń pobierane natywnie przez CLI
│   ├── hooks.json          # Hooki bezpieczeństwa (JSON Hooks)
│   ├── rules/              # Rygorystyczne instrukcje zachowania (Rulesets)
│   ├── plans/              # Plany operacyjne i ścieżki asynchroniczne
│   ├── specs/              # Baza wiedzy (Graph RAG & specs/graph.json)
│   └── swarm/              # Pamięć podręczna i logi handshake subagentów
└── src/                    # Czysty, zweryfikowany kod źródłowy

🧠 3. GITOPS & BAZA WIEDZY (MCP PROTOCOL)
Wersja 5.0 wprowadza samowystarczalny system zapobiegania halucynacjom modeli LLM (Anti-Hallucination Matrix):
- Węzeł Dokumentacji (MCP Node): Baza wiedzy o środowisku Antigravity jest mapowana bezpośrednio do IDE przez węzeł Node.js zlokalizowany w .agents/mcp-servers/antigravity-docs/. Model otrzymuje dostęp do narzędzi natywnych: search_docs, read_doc, list_document_names.
- Izolacja Pamięci: ZAKAZ uruchamiania serwera MCP globalnie. Serwer musi być definiowany wewnątrz pliku .gemini/mcp_config.json z użyciem ścieżek bezwzględnych.
- Autonomiczna Aktualizacja (CI/CD): System wykorzystuje potok .github/workflows/mcp-docs-updater.yml (Cron Job). Bot GitHub Actions autonomicznie indeksuje oficjalną dokumentację (Python + Playwright), i wypycha zmiany do repozytorium tylko w przypadku wykrycia rzeczywistych modyfikacji (Dirty-Check).

🪨 4. PROTOKÓŁ CAVEMAN ULTRA+ (TOKEN OPTIMIZATION)
Maksymalna kompresja kontekstu i oszczędność tokenów:
- Logic-First Speech: Zakaz form grzecznościowych. Komunikacja startuje od akcji lub wyniku.
- Prompt Compaction: Instrukcje przekazywane serwerowi za pomocą skróconych form symbolicznych i wektorowych.
- Active Graph Evolution: Zamiast pełnego skanowania kodu, agenci odpytują bazę specs/graph.json w celu identyfikacji ścieżek krytycznych (Critical Paths).
- Ultra-Review: Auditor komunikuje się za pomocą kodów błędów i wskaźników linii (np. ERR: L45 @ auth.rs -> null pointer).

🚨 5. DEFENSYWNE OBEJŚCIA BŁĘDÓW (CRITICAL ANTI-BUG)
Z uwagi na krytyczną niestabilność silnika Antigravity (od wersji 1.23.2+ po wczesne wydania 2.0), system wymusza twarde, sprzętowe i programowe obejścia (workarounds):
- Blokada File Edit Hang (+0 -0):
  - Problem: Wbudowany edytor wizualny Antigravity zawiesza się w pętli nieskończonej, generując pusty diff.
  - Rozwiązanie: Kategoryczny zakaz używania wbudowanego narzędzia edycji plików. Każdy agent musi modyfikować i tworzyć pliki wyłącznie za pośrednictwem terminala bash, wykorzystując strumieniowe zapisy cat oraz konstrukcję bash heredoc.
- Ochrona przed Stale Worktree Crash:
  - Problem: Obecność osieroconych gałęzi worktree paraliżuje proces myślowy modeli, powodując cichy zwis (silent hang).
  - Rozwiązanie: W pliku .agents/hooks.json zainstalowano hook wyzwalany automatycznie przed modelem (before_model_call), zawierający komendę git worktree prune.

🚀 6. KOMENDY NATYWNE (SLASH COMMANDS) & ASYNCHRONICZNOŚĆ
Komunikacja z ekosystemem opiera się na natywnych, ustrukturyzowanych komendach:
- /goal – Wymusza autonomiczny tryb pracy ("Vibe Coding"). Agent samodzielnie iteruje, kompiluje, czyta błędy i wdraża poprawki aż do pełnego rozwiązania problemu.
- /grill-me – Inicjuje fazę aktywnego planowania. Agent ma obowiązek przeprowadzić rygorystyczny wywiad przed dotknięciem kodu źródłowego.
- /schedule – Konfiguruje cykliczne zadania w tle (Scheduled Tasks) dla Auditora.
- /browser – Aktywuje mostek CDP (WSL2-Bridge). Uruchomienie przeglądarki jest dozwolone wyłącznie po bezpośrednim wywołaniu.

🛠️ 7. EKOSYSTEM UMIEJĘTNOŚCI (AWESOME SKILLS)
- Zakaz manualnej modyfikacji: Całkowity zakaz ręcznego kopiowania plików skilli wewnątrz katalogu .agents/skills/.
- Natywny Instalator: Pobieranie i aktualizacja umiejętności odbywa się za pomocą skryptu ./os-add-skill (zabezpieczonego przed Path Traversal) lub oficjalnego narzędzia CLI platformy Antigravity 2.0.
- Rygor Bezpieczeństwa: Instalacja musi być wykonywana z restrykcyjnym filtrem ryzyka za pomocą komendy:
  - `./os-add-skill <nazwa-skilla>` lub `npx antigravity-awesome-skills --path .agents/skills --risk safe,none`

Podpisano: Antigravity Orchestrator & GEM
