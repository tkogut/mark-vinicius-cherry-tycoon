# [SEQ-PRO] Plan 002 - Orchard Scale, VFX and Worker Behavior

## Cel
Rozwinąć mechanikę sadu:
1. Skalowanie sadu (auto-zoom) na podstawie liczby sektorów oraz dodanie mechanicznych przycisków zoom (+ / - / reset) w rogu widoku.
2. Rozbudowanie `SeasonalVFX` o efekty dla każdego sezonu: opady śniegu w zimie, unosząca się energia pary na wiosnę, opadające różowe płatki wiśni w fazie kwitnienia (Late Spring), złoty pyłek w lecie oraz opadające liście w jesieni.
3. Sezonowe zachowanie pracownika (WorkerNPC): dostosowanie prędkości (powolny w zimie, szybki w lecie) oraz celów ruchu (szukanie i zbieranie owoców w lecie z zatrzymywaniem się przy drzewach, odpoczynek w zimie, pielęgnacja drzew na wiosnę).

## Kroki
1. [x] **Planowanie (Coordinator)**: Utworzenie planu w `.agents/plans/002-orchard-details.md`.
2. [x] **Implementacja (Builder)**:
   - Zmiana w `frontend/src/components/farm/ImperialOrchard.tsx`:
     - Rozbudowa komponentu `SeasonalVFX` o animacje cząsteczek dla wszystkich sezonów (śnieg, para, płatki, pyłek, liście).
     - Dodanie stylów `@keyframes petal-fall` i `snow-fall` w sekcji `<style>`.
     - Implementacja auto-zoomu: kalkulacja bazowego zoomu na podstawie `sectorsCount` (`const defaultZoom = Math.min(1, 1.2 / (1 + sectorsCount * 0.25))`).
     - Dodanie przycisków zoom (+ / - / reset) w rogu karty sadu z wykorzystaniem steampunkowego stylu (`mahogany-plate`, `brass-rim`).
     - Implementacja sezonowego zachowania pracownika w `useEffect`:
       - Zmiana częstotliwości i kroku `step` w zależności od sezonu (Zima: `0.015`, Lato: `0.06` z przerwami na zbiory).
       - Zmiana targetowania (w lecie pracownik idzie do drzew z owocami, stoi przy nich przez 30 klatek zbierając je, po czym szuka kolejnego; w zimie idzie na pozycję odpoczynku `r:0, c:0` i stoi; na wiosnę/jesień krąży między drzewami).
   - Dostosowanie wyglądu `WorkerNPC` w zależności od sezonu (np. niebieska kurtka w zimie, czerwona koszula w lecie).
3. [x] **Audyt (Auditor)**:
   - Kompilacja projektu (`npm run build`).
   - Wdrożenie na canister playground.
   - Wykonanie zrzutu ekranu i weryfikacja poprawności wizualnej.
4. [x] **Finalizacja (Coordinator)**:
   - Commit zmian z prefixem `feat(ui): ...`.
   - Push na branch.
