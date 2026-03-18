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
| `shimmer` | `0.3s` | — |
| `steam-puff` | `2s` | — (unmount after) |
| `hull-glow` | `1.5s` | `infinite alternate` |
| `Steam Hiss (Framer)` | `200ms` | — |
| `Card Vibration (Framer)` | `5px x-shake, 200ms` | — |
