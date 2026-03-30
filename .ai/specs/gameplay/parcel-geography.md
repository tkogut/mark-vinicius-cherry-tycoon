Specyfikacja: Geografia Imperialna i Gleboznawstwo

Single Point of Truth dla mechaniki regionalizacji, parametrów gleby i ekspansji w powiatach województwa opolskiego.

1. Hierarchia Terytorialna

Poziom 1: Województwo (Opolskie): Główna mapa operacyjna projektu.

Poziom 2: Powiat (County): Każdy powiat posiada unikalne modyfikatory środowiskowe.

Poziom 3: Parcela (Plot): Konkretny obszar o określonej wielkości (np. 10x10 slotów na drzewa).

2. Parametry Gleby (Soil Matrix)

Każda parcela w widoku lokalnym (ImperialOrchard.tsx) musi reagować wizualnie i logicznie na te parametry:

Parametr Gleby          |  Wpływ na Produkcję                                    |  Wizualizacja w UI

Mineral Density         | Zwiększa bazową cenę wiśni w aukcji.                   | Czerwonawe/miedziane żyły w teksturze ziemi.

Hydration Retention     | Zmniejsza częstotliwość wymaganych akcji Irrigation. | Błękitne opary (mist) nad gruntem.

Industrial Residue      | Przyspiesza wzrost, ale obniża Purity (Organic%).     | Oleisty połysk (iridescent effect) na ścieżkach.

3. Bonusy Regionalne (Przykłady)

Powiat Nyski: "Ziemia Obiecana" — Bonus +15% do Mineral Density.

Powiat Brzeski: "Dolina Odry" — Bonus +20% do Hydration Retention.

Powiat Opolski: "Industrialne Serce" — Zniżka 10% na ulepszenia maszyn parowych.

4. Instrukcja Implementacji (dla Agenta)

Background Rendering: Przy zmianie lokalizacji (Switch Plot), zmień background-color ziemi oraz tło (skybox) zgodnie z parametrami powiatu.

Logic Hooks: Funkcje nawadniania i nawożenia w game_logic.mo muszą pobierać mnożniki z tej specyfikacji.

Transition: Przy przejściu z mapy globalnej do lokalnej, wyświetl krótką informację: "Entering Sector [ID] | Soil: [Type]".