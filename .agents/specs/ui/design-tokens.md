# Design Tokens — AntiGravity Neo-Steampunk UI
> **Rule**: Agenci MUSZĄ sprawdzić ten plik przed generowaniem kodu UI. Parametry tu mają pierwszeństwo nad SKILL.md.

## Color Palette

| Token | Value | Usage |
|---|---|---|
| `brass` | `#C9A84C` | Primary headers, dials, borders |
| `brass-rim` | `linear-gradient(45deg, #B5A642, #8C7853)` | All interactive elements |
| `copper` | `#B36A2A` | Secondary accents, status badges |
| `ruby` | `#8B1A1A` | Cherry states, alert/loss indicators |
| `charcoal` | `#1C1C1E` | Background panels, hull containers |
| `mahogany` | `#4A1A00` | Card surfaces, rivalry plates |
| `emerald-glow` | `rgba(80, 200, 120, 0.8)` | Resource gauges, vacuum tubes |
| `sky-blue` | `rgba(100, 180, 255, 0.8)` | Water level indicator |

## Glassmorphism Parameters

| Property | Value |
|---|---|
| `backdrop-filter` | `blur(12px)` |
| `background` | `rgba(255, 255, 255, 0.15)` |
| `border` | `1px solid rgba(255,255,255,0.18)` |

## Border Radius

| Component | Radius |
|---|---|
| `.mechanical-hull` | `12px` |
| Buttons | `8px` |
| Badges | `4px` |

## Typography

| Token | Value |
|---|---|
| Font (Primary) | `'Cinzel', serif` |
| Font (UI) | `'Inter', sans-serif` |
| Base Size | `16px` |
| Brass Gradient Text | `background: linear-gradient(45deg, #C9A84C, #8C7853); -webkit-background-clip: text;` |
