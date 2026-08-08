# Animation Spec — AntiGravity Neo-Steampunk UI
> **Rule**: Agenci MUSZĄ sprawdzić ten plik przed implementacją animacji. Parametry tu mają pierwszeństwo.

## Easing Curves (Bezier)

| Animation | Curve | Usage |
|---|---|---|
| `gear-spin` | `cubic-bezier(0.45, 0.05, 0.55, 0.95)` | Gear icons in `.hull-header` |
| `god-ray` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Full-page atmospheric lighting |
| `shimmer` | `cubic-bezier(0.4, 0, 0.2, 1)` | Button hover effect |
| `steam-puff` | `cubic-bezier(0.22, 1, 0.36, 1)` | Steam particle burst (out) |
| `hull-glow` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Container focus pulse |

## Durations

| Animation | Duration | Repeat |
|---|---|---|
| `gear-spin` | `4s` | `infinite linear` |
| `shimmer` | `0.3s` | — (trigger: hover) |
| `steam-puff` | `2s` | — (unmount after) |
| `hull-glow` | `1.5s` | `infinite alternate` |
| `Steam Hiss (Framer)` | `200ms` |Efekt dźwiękowy/wizualny akcji.|
| `Card Vibration (Framer)` | `5px x-shake, 200ms` | — |

3. Kinematyka Rozgrywki (Gameplay Kinematics)

Te parametry definiują zachowanie obiektów wewnątrz ImperialOrchard.tsx.

3.1. Ruch Wiatru (Vegetation Sway)

Typ: ease-in-out

Zakres: rotate(-1deg) do rotate(1deg)

Czas trwania: 4s (pętla)

Opóźnienie: Każde drzewo musi posiadać animation-delay: random(0, 2s), aby uniknąć nienaturalnej, zsynchronizowanej "fali" robotycznej.

3.2. Wystrzał Pary (Steam Discharge)

Wyzwalacz: Akcja Irrigation (nawadnianie) lub przejście jednostki Steam-Worker.

Parametry:

Ruch pionowy: translateY(-40px)

Przezroczystość: opacity(1) -> opacity(0)

Skalowanie: scale(1) -> scale(2.5)

VFX: Cząsteczki w kolorze białym/szarym z lekkim szmaragdowym blaskiem przy nawożeniu.

3.3. Logika Szejkera (Shaker Logic / Harvest)

Typ: spring (Framer Motion)

Parametry: stiffness: 500, damping: 10

Wizualizacja: Bardzo szybkie drgania pnia i korony przez 1.5s.

Efekt końcowy: Po zakończeniu drgań następuje spawn cząsteczek Ruby Red (#8B1A1A) opadających w dół.

3.4. Chód NPC (Steam-Walkers)

Transition: linear

Prędkość: 15-25s na pełne przejście rzędu (zależnie od poziomu ulepszeń).

Micro-bobbing: Subtelny ruch w osi Y (translateY(2px)) imitujący mechaniczne kroki mosiężnej figurki.

4. Optymalizacja Wydajności

Wszystkie animacje ciągłe (Wiatr, NPC) muszą korzystać z will-change: transform.

Animacje cząsteczek (Para, Pyłek) powinny być limitowane do max 50 aktywnych instancji na ekranie mobilnym.