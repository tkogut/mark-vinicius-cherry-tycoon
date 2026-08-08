Specyfikacja: Cykl Życia Imperialnego Sadu (Kompletna)

Single Point of Truth dla wizualizacji wzrostu drzew, ruchu NPC oraz maszyn w skali miniatury (Mobile Toy Scale).

1. Wytyczne Wizualne (Asset Generation - Nano Banana)

Wszystkie assety muszą być generowane z zachowaniem spójności stylu "Miniature Toy Model":

Styl: Isometric 3D, High Gloss, Neo-Steampunk.

Tło: White background (ułatwia maskowanie w CSS).

Oświetlenie: Studio Lighting z efektem Tilt-shift (rozmycie krawędzi dla skali miniatury).

2. Matryca Sezonowa i Prompty

Faza | Opis Wizualny (Prompt dla AI) | Logika Wizualna (Pnie/Liście) | VFX (Atmosfera)
Winter | Miniature steampunk cherry tree, winter dormancy, bare copper branches, light snow dust, white background, isometric 3D render | Pień: copper (#B36A2A). Brak liści. | Szron na rurach, pył śnieżny.

Spring | Miniature steampunk cherry tree, spring awakening, tiny emerald buds, polished brass trunk, white background, isometric 3D render | Pień: brass (#C9A84C). Pąki: emerald-glow. | Syczenie pary (budzenie mechanizmów).

Summer | Miniature steampunk cherry tree, summer harvest, lush emerald leaves, ruby cherries, golden brass trunk, white background, isometric 3D render | Pień: gold. Gęste liście + rubinowe wiśnie. | Maksymalne ciśnienie rur, dym.

Autumn | Miniature steampunk cherry tree, autumn decay, yellow and amber leaves, dark brass trunk, white background, isometric 3D render | Pień: Ciemny mosiądz. Liście bursztynowe. | Opadające cząsteczki liści.

3. Dynamika NPC i Ekosystemu (Living Miniature)

Farma musi sprawiać wrażenie pracującej maszynerii:

Steam-Workers (NPC): Małe, mosiężne figurki poruszające się po ścieżkach.

Zachowanie: Patrol A -> B (od magazynu do drzewa), animacja pracy (3s), powrót.

Skalowanie: 1 jednostka na każde 5 posiadanych drzew.

Mechaniczne Szejkery: Pojazdy na gąsienicach podjeżdżające do drzew w fazie Summer.

Animacja: Wibracja pnia i korony przy zbiorze (shake effect).

VFX Pary: Każda jednostka ruchoma emituje subtelne steam-puff zgodnie z animations.md.

4. Infrastruktura i Interakcje

Silosy Magazynowe: Wizualizacja stanu backend.storage poprzez szmaragdowy płyn w cylindrach.

Nawadnianie (Irrigation): Mosiężne zawory przy rzędach drzew. Aktywacja wywołuje pulsowanie błękitu w rurach.

Radial Menu: Tapnięcie w drzewko otwiera menu kołowe z akcjami: Irrigate, Prune, Fertilize.

5. Implementacja UI i Wydajność

Skala: Ikonki renderowane w kontenerach 128x128px (Mobile Optimized).

Transition: Płynne przejście między sezonami (cross-fade 0.5s) z efektem pary.

Zasada "Wind": Subtelny transform-rotate (-1deg do 1deg) dla wszystkich drzew, imitujący drgania systemu.

Painter's Algorithm: Rygorystyczny Z-Index – NPC muszą znikać za koroną i pniem drzewa.

6. Tokeny Kolorystyczne (Deep Integration)

Element | Token / Wartość | Efekt CSS 
Pnie (Zima) | copper (#B36A2A) | radial-gradient(circle, #B87333 0%, #2A1810 100%)
Liście (Wiosna) | emerald-glow | drop-shadow(0 0 5px rgba(80, 200, 120, 0.8))
Owoce (Lato) | ruby (#8B1A1A) | radial-gradient(circle, #E0115F 30%, #4A0404 100%)
Liście (Jesień) | amber-autumn | radial-gradient(circle, #DAA520 20%, #4A1A00 100%)