# [SEQ-PRO] Plan 001 - Shrink UI Layout

## Cel
Zmniejszyć rozmiar głównego ekranu widoku sadu (ImperialOrchard) oraz dolnego paska nawigacyjnego (HUD / MainDashboard) wraz ze wskaźnikami i pokrętłem ceny (ImperialDial), tak aby mieściły się całkowicie w oknie przeglądarki bez pionowego przewijania strony.

## Kroki
1. [x] **Planowanie (Coordinator)**: Utworzenie planu w `.agents/plans/001-shrink-ui.md`.
2. [x] **Implementacja (Builder)**:
   - Zmiana struktury w `frontend/src/App.tsx`:
     - Ograniczenie kontenera layoutu do `h-screen overflow-hidden` dla widoku dashboardu (zapobieganie przewijaniu okna).
     - Optymalizacja paddingów elementu `<main>` (zmniejszenie z `p-8 lg:p-10 pb-8` na `p-4 md:p-6 pb-4 md:pb-6`).
     - Przekształcenie kontenera dashboardu w elastyczny kontener `flex-1 flex flex-col min-h-0` zamiast sztywnej wysokości `h-[calc(100vh-...)]`.
     - Zapewnienie, że `ImperialOrchard` (górna sekcja) i `MainDashboard` (dolna sekcja) dzielą wysokość proporcjonalnie i poprawnie (np. Orchard `flex-[63%]`, HUD `flex-[37%] min-h-[165px]`).
   - Zmiana w `frontend/src/components/farm/MainDashboard.tsx`:
     - Zmniejszenie layoutowego rozmiaru komponentów w `ImperialDial.tsx` i `EmeraldGauge.tsx` zamiast rozmywającego skalowania CSS transform.
     - Zmniejszenie paddingów i marginesów w sekcji Diagnostics, Dial i Gauges.
3. [x] **Audyt (Auditor)**:
   - Uruchomienie budowania i deploymentu lokalnego/playground.
   - Wykonanie zrzutu ekranu za pomocą skryptu Playwright.
   - Sprawdzenie dopasowania do ramy viewportu (brak pasków przewijania strony, pełna widoczność HUD).
4. [x] **Finalizacja (Coordinator)**:
   - Commit zmian z prefixem `style(ui): ...`.
   - Push na branch.
