---
title: "Mark Vinicius Cherry Tycoon – digest stanu projektu (2026-11-07)"
type: project-digest
domain: programowanie
project: mark-vinicius-cherry-tycoon
tags: [gra, icp, motoko, digest]
created_by: claude
---

# Mark Vinicius Cherry Tycoon – digest stanu projektu

Digest na dzień 2026-11-07, oparty na stanie repo `~/projects/mark-vinicius-cherry-tycoon` (HEAD `11fafa3`, ostatnia aktualizacja `STATE.md`: 2026-10-23). Treść własnymi słowami; szczegóły w plikach repo wskazanych poniżej (bez kopiowania). Wiedza jawna (decyzja właściciela).

## Czym jest projekt
Przeglądarkowa gra typu tycoon na Internet Computer (ICP): sad wiśniowy w „neo-steampunkowej” wersji wiejskiej Polski (Opole, Namysłów, Głubczyce). Backend w Motoko (dwa punkty wejścia: lokalny/playground i mainnet), frontend React/Vite/TypeScript, logowanie przez Internet Identity. Dwa równorzędne filary: prowadzenie farmy (sadzenie, pielęgnacja, zbiór, sprzedaż, aukcje, Festiwal Wiśni) oraz inwestycje w kluby piłkarskie regionalnej ligi.
Źródła: `.planning/PROJECT.md`, `docs/game-design/GDD-ONE-PAGER.md`.

## Gdzie jesteśmy
- Kamień milowy v1.0 „Playable Release – V1 Parity”: ukończone 6 z 13 faz (1, 1.1, 2, 3, 3.1, 10), 20 z 31 planów.
- Faza 9 (głęboki redesign UX/UI): zaplanowana i ponownie zweryfikowana względem `master` 2026-10-23, **żaden plan nie został jeszcze wykonany**. Przegląd znalazł wady w czterech planach, więc najpierw poprawiany jest tekst planów, a wykonanie idzie jako jeden PR na plan, a nie jedno nienadzorowane uruchomienie.
Źródła: `.planning/STATE.md`, `.planning/ROADMAP.md`.

## Kluczowe decyzje i ich uzasadnienie
- **Narzędzia agentowe:** usunięto warstwę Antigravity/AGENTS-OS, przejście na GSD Core (natywne subagenty, hooki i komendy Claude Code), bo rola-play wielu modeli przez konwencję tekstową nie pasowała do mechanizmu Claude Code.
- **GDD v3:** po odnalezieniu pierwotnego dokumentu koncepcji uznano, że audyt oparty tylko na kodzie błędnie zaklasyfikował kluby piłkarskie i Festiwal Wiśni jako poboczne. Oba wracają do zakresu jako część pierwotnego projektu dwóch filarów. Wniosek ogólny: oceniać zakres względem pierwotnej intencji, nie tylko względem tego, co zbudowano.
- **Kierunek wizualny:** drzewa i maszyny w sadzie rysowane proceduralnie (Canvas 2D, styl „Geometric Brass”); budynki z gotowych ilustrowanych sprite’ów rastrowych, bo rysunek wektorowy ma twardy sufit jakości, a budynki to mały stały katalog.
- **Architektura testów:** czterowarstwowa piramida z wyrocznią zgodności TypeScript↔Motoko jako centralnym elementem. Dług lintowy obsługiwany „zapadką” (błędy zawsze 0, limit ostrzeżeń może tylko spadać, obecnie 182). PocketIC oceniono i odrzucono (niezgodność wersji).
- **Sports Patron:** pionowy wycinek (kluby, zakupy, UI), model jednego patrona; katalog klubów w kodzie, a nie w stanie trwałym, żeby uniknąć migracji.
- **Warstwa instrukcji dla agentów:** Task Router, etykiety Always/Ask First/Never, plik błędów jako reguł (`LESSONS.md`), jedna bramka `./validate.sh`.
Źródła: `.planning/STATE.md` (sekcja Decisions), `.planning/PROJECT.md` (Key Decisions).

## Zrobione od startu migracji
Fazy 1–3.1 i 10: ranking i UI wyników, spójne uwierzytelnianie, kluby piłkarskie, naprawa dźwigni ekonomii (nawozy, ceny sezonowe, premie za aukcje, jedna logika psucia się plonów, nazwy rywali AI) oraz dwie krytyczne poprawki kontraktów przedsezonowych znalezione w przeglądzie kodu. Każda zweryfikowana na żywej replice, nie tylko testami.

## Wnioski z błędów (z `LESSONS.md`)
- „Kompiluje się” i „testy przechodzą” nie dowodzą poprawności zachowania; guard sprawdza się przez jego zdjęcie i obserwację porażki.
- Nie powtarzać zapisanego ustalenia jak świeżo sprawdzonego; liczbę przytoczoną w drugim pliku trzeba traktować jak przyszły błąd.
- Liczby balansu ekonomii to decyzja właściciela, nie agenta.
- Błędy widoczne tylko na wdrożonej wersji (emoji jako ikony, zmienne identyfikatory canisterów playground).
Źródło: `.planning/LESSONS.md`.

## Otwarte kwestie i ryzyka
- Ścieżka mainnet jest zepsuta na poziomie konfiguracji (workflow wdraża canister nieobecny w `dfx.json`); `main_mainnet.mo` się nie kompiluje, dopóki nie zostanie wykonana migracja EOP-01. Brak decyzji.
- Dług design tokenów: kod w większości ignoruje zadeklarowaną paletę (brass/copper/ruby/charcoal); proponowana druga „zapadka”.
- Dwie metody zakupu parceli współistnieją, a dokumentacja opisuje nieużywaną.
- Odłożone na v2: rozszerzenie mapy, multiplayer i tokenomika ICP, hodowla nasion, dywersyfikacja upraw, sabotaż, przetwórstwo.
- Z bliższych etapów zostają: UI pogody (4), przebudowa geografii (5), Festiwal Wiśni (6), UI ubezpieczeń (7), onboarding (8), redesign UX/UI (9).
Źródła: `.planning/STATE.md` (Blockers/Concerns, Deferred), `.planning/REQUIREMENTS.md`.

## Powiązania
[[miw-group]] · [[agents-os]] · [[ai-sdlc]] – kontekst narzędziowy właściciela; strona projektu w wiki zostanie utworzona przy INGEST.
