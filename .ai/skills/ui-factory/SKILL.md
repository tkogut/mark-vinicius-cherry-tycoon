---
name: ui-factory
description: >
  [Trigger Words: "UI component", "design", "steampunk", "visualize", "mockup", "texture",
  "generate UI", "new component", "brass", "mechanical", "golden harvester", "nano banana"]
  [Domain: React, CSS, Framer Motion, Lottie, SVG, Nano Banana 2, Neo-Steampunk Cherry]
  [Outcomes: enforces .mechanical-hull standard, brass/ruby/copper color tokens,
  .god-ray atmospheric lighting, anti-flat-design policy, 60 FPS mobile performance]
---

# UI Factory Skill — Neo-Steampunk Cherry

## Purpose
Maintain visual consistency across all frontend views by enforcing the "Golden Harvester" design system.
Every component must feel like a physical part of brass-punk machinery, not a flat digital overlay.

## Visual Design Pillars

1. **Skeuomorphism 2.0** — textures: Polished Gold, Aged Brass, Mahogany.
2. **The Emerald Core** — primary feedback via glowing emerald liquid in glass vacuum tubes.
3. **Atmospheric Lighting** — "God Rays" + dynamic shadows for 3D depth.
4. **Haptic Visuals** — every interaction triggers micro-animations (bounces, steam puffs, light pulses).

## Color Tokens

| Token | Hex (approx.) | Usage |
|---|---|---|
| `brass` | `#C9A84C` | Primary headers, dials, borders |
| `copper` | `#B36A2A` | Secondary accents, status badges |
| `ruby` | `#8B1A1A` | Cherry states, alert/loss indicators |
| `charcoal` | `#1C1C1E` | Background panels, hull containers |
| `mahogany` | `#4A1A00` | Card surfaces, rivalry plates |
| `emerald-glow` | `#00FF88` w/ glow | Resource gauges, vacuum tubes |

## Mandatory CSS Classes

```css
/* Every container MUST use: */
.mechanical-hull { /* industrial texture, brass border, charcoal bg */ }

/* Titles in containers: */
.hull-header { /* brass gradient text, gear-spin icon */ }

/* Full-page cinematic overlay: */
.god-ray { /* radial gradient from top, golden warmth */ }
.sunset-vignette { /* edge darkening for Golden Hour atmosphere */ }
```

## Animation Standards

| Animation | Trigger | Library |
|---|---|---|
| `gear-spin` | Icon in `.hull-header` | CSS keyframes |
| `shimmer` | Button hover | CSS keyframes |
| `hull-glow` | Container focus | CSS box-shadow |
| `brass-rim` | All interactive elements | CSS box-shadow |
| Steam particles | AI outbid events | `particle-engine` skill |
| Gear turns | Harvester active | Lottie (60 FPS mobile) |

## Component Generation Checklist

When generating or modifying ANY UI component:
- [ ] Main container wrapped in `.mechanical-hull`
- [ ] Primary header uses `brass` gradient + `hull-header` class
- [ ] Status badges use `ruby` (negative) / `copper` (neutral) tokens
- [ ] All action buttons have `brass-rim` shadow + `shimmer` hover animation
- [ ] Full-page views include `sunset-vignette` overlay
- [ ] Particle layer offered for "cinematic" views (ping `/particles [preset]`)
- [ ] Verified in Mobile Emulation via CDP Bridge (port 9222, roostertk profile)

## Anti-Patterns (🚫 NEVER DO)

- 🚫 Flat unshaded colors or generic dashboard look
- 🚫 Instant cut transitions (always use `fade` or `pan` via Framer Motion)
- 🚫 Buttons without hover micro-animations
- 🚫 Using `npm` — always use `yarn`

---

## § Nano Banana 2 — Visual Concept Engine

**Purpose**: Photorealistic UI component generation in "Golden Harvester" style.
Bridging Game Lore → Frontend Assets via AI image generation.

### Invocation Handshake
> `"Invoke Nano Banana 2: Generate [Component Name] based on Golden Harvester Spec."`

### Required Context (always provide)
- **North Star Image**: `assets/golden_harvester_splash.png`
- **Texture Atlas**: `assets/golden_harvester_textures.png`
- **Style Guide**: `references/ui_design_system.md`

### Prompt Template Keywords (MUST include)
```
"Luxury Steampunk", "Skeuomorphism 2.0", "Emerald Glow", "Polished Gold",
"Aged Brass", "Mahogany", "God Rays", "60fps mobile", "Mechanical Cherry"
```

### Output Specification
- **Format**: High-resolution PNG Texture Atlas or UI Mockup
- **Destination**: `frontend/assets/textures/`
- **Naming**: `[component-name]_[variant].png` (e.g., `dial_idle.png`, `rivalry_card_active.png`)

### Workflow (`/visualize-concept [description]` activation)
1. Read `references/game_lore.md` for narrative context.
2. Read `references/ui_design_system.md` for technical constraints.
3. Load `assets/golden_harvester_splash.png` as style reference.
4. Compose prompt using template keywords + component description.
5. Generate image using `generate_image` tool.
6. Save output to `frontend/assets/textures/`.
7. Report: `"Nano Banana 2 complete: [filename] saved to frontend/assets/textures/."`

---

## Workflow (`/ui-factory [component name]` activation)

1. Read component spec from relevant knowledge file (`references/component_*.md`).
2. Check if a particle layer is needed — if yes, trigger `/particles [CherryBlossom|GoldenPollen|SteamSparks]`.
3. Generate React component code following `.mechanical-hull` standard.
4. Verify component against checklist above.
5. Ask user: `"Should I invoke Nano Banana 2 to generate a texture for [component]?"`
6. Output handshake: `"Handshake Verified: ui-factory applied. Neo-Steampunk standard enforced."`

## References
- `references/ui_design_system.md` — full AUI spec
- `references/game_lore.md` — lore and tone guidelines
- `references/ui_consistency.md` — consistency rules
- `references/component_emerald_gauges.md` — Glass Vacuum Gauges spec
- `references/component_rivalry_cards.md` — Mechanical Rivalry Plates spec
- `assets/golden_harvester_splash.png` — North Star reference image
- `assets/golden_harvester_textures.png` — texture atlas
