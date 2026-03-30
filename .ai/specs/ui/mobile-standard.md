Specyfikacja: AntiGravity Mobile Responsive Standard

Single Point of Truth dla adaptacji interfejsu Neo-Steampunk na urządzenia dotykowe i małe ekrany.

1. Ergonomia Dotyku (Touch Mechanics)

Minimum Touch Target: Wszystkie interaktywne hotspoty (zawory, dźwignie) muszą mieć minimalny obszar klikalności 48x48px.

No-Hover Policy: Ponieważ na mobile nie ma stanu hover, menu narzędzi (Irrigation, Pruning, Fertilizing) musi otwierać się po pojedynczym tapnięciu w drzewo/sekcję (Selection State).

Haptic Feedback: Każda udana akcja (np. pociągnięcie dźwigni) musi wyzwalać navigator.vibrate(20) (krótki, mechaniczny impuls).

2. Adaptacja Layoutu (Viewport Handling)

A. Tryb Portrait (Pionowy) - System "The Steam Drawer"

Orchard View (Top 75%): Drzewa skalują się do szerokości ekranu (Scroll pionowy dozwolony).

Engine HUD (Bottom 25%): Zmienia się w interaktywną "szufladę".

Widok zwinięty: Tylko kluczowe wskaźniki (Cash, Season, Harvest Ready).

Widok rozwinięty: Przesunięcie palcem (Swipe Up) odsłania pełne detale "Centralnego Silnika".

B. Tryb Landscape (Poziomy)

Zachowanie standardowego podziału 70/30 z zachowaniem safe-area-inset dla urządzeń z wcięciem (notch).

3. Optymalizacja Wydajności (Mobile Performance)

GPU Acceleration: Wszystkie animacje drzew (wind-sway) muszą korzystać z transform i opacity z dodanym will-change: transform.

SVG Management: W widoku mobilnym redukujemy liczbę detali w tle (np. mniej pyłków GoldenPollen), aby utrzymać stałe 60 FPS.

Image Fallbacks: Zakaz używania ciężkich bitmap. Priorytet dla gradientów CSS i lekkich assetów SVG.

4. Wytyczne PWA (Progressive Web App)

Status Bar: Kolor szmaragdowy (#50C878) lub mahoniowy (#4A2C2A).

Orientation Lock: Sugerowany tryb Landscape dla najlepszych wrażeń (opcjonalnie).

Safe Areas: Użycie zmiennych CSS env(safe-area-inset-bottom) dla nawigacji, aby przyciski nie kolidowały z systemowym paskiem gestów.