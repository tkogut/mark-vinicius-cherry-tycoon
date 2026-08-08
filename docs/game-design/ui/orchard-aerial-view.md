Specyfikacja: Imperialny Sad (Widok Napowietrzny & Logistyka)

Wersja: 1.0 (Aerial Focus)
Cel: Definicja izometrycznego widoku operacyjnego parceli z uwzględnieniem ruchu NPC i infrastruktury.

1. Perspektywa i Układ (The Bird's Eye Grid)

Kąt Widzenia: Wysoki izometryczny (High Oblique / Bird's Eye).

Struktura: Drzewa muszą być ustawione w precyzyjnych rzędach (Orchard Rows).

Ścieżki (The Brass Veins): Między rzędami drzew znajdują się mosiężne trakty komunikacyjne dla ludzi i maszyn.

Działki (Plots): Każda parcela jest modularna. Granice parceli są zaznaczone mosiężnymi krawężnikami z rurami ciśnieniowymi.

2. Dynamiczne Elementy (Living Ecosystem)

NPC (Steam-Workers): Małe jednostki poruszające się po ścieżkach.

Algorytm: Losowe patrole między magazynem a wybranym drzewem.

Z-Index: Muszą przechodzić ZA pniami i koronami drzew (Painter's Algorithm).

Maszyny (Mobile Assets):

Traktory Parowe: Małe pojazdy na gąsienicach przewożące skrzynie.

Szejkery (Mechanical Shakers): Urządzenia z ramionami wibracyjnymi, które podjeżdżają do drzew w fazie zbiorów.

Animacja: Każdy element ruchomy musi emitować subtelne "Steam Clouds" (cząsteczki pary).

3. Infrastruktura i Rozbudowa

Dedicated Slots: Wyznaczone strefy (Anchor Points) na obrzeżach parceli przeznaczone na:

Magazyny (Warehouses): Budynki z manometrami i animowanymi windami.

Silosy (Storage Silos): Cylindry pokazujące wizualnie poziom napełnienia szmaragdowym płynem.

Lądowiska Dronów: Dla transportu między regionalnego (województwa/powiaty).

4. Regionalizacja (Soil & Environment)

Soil Signature: Kolor ziemi pod mosiężną siatką zmienia się zależnie od powiatu (np. żyzna czerń, miedziana czerwień, industrialna szarość).

Background Context: Tło za granicami parceli musi sugerować lokalizację (np. industrialny horyzont Opola vs góry Nysy).

5. Optymalizacja Techniczna

SVG Instancing: Drzewa i NPC muszą być renderowane jako lekkie instancje, aby obsłużyć min. 100 drzew + 20 jednostek ruchomych przy 60 FPS.

Shader FX: Delikatny "Heat Haze" (drganie powietrza) nad maszynami parowymi.