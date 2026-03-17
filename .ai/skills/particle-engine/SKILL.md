---
name: particle-engine
description: >
  [Trigger Words: "particles", "steam", "cinematic", "atmosphere", "juice", "effects",
  "cherry blossom", "golden pollen", "steam sparks", "ParticleLayer", "atmospheric"]
  [Domain: React, Three.js, Canvas API, ParticleLayer.tsx, frontend effects]
  [Outcomes: applies themed particle presets without blocking UI interaction,
  maintains 60 FPS on mobile, CherryBlossom/GoldenPollen/SteamSparks presets]
---

# Particle Engine Skill

## Purpose
Provide a reusable React + Canvas/Three.js particle system that enhances the "Vibe-First"
Neo-Steampunk Cherry aesthetic with cinematic atmospheric effects.

## Core Presets

| Preset | Theme | Use Case |
|---|---|---|
| `CherryBlossom` | Pink/white drifting petals, wind-shear physics | Spring/Growth game phases |
| `GoldenPollen` | Glowing amber dust motes, "Golden Hour" lighting | Market/Harvest views |
| `SteamSparks` | Brass sparks + embers, mechanical energy | Harvester/Market/Auction views |

## Component Specification

**File**: `src/components/effects/ParticleLayer.tsx`

```typescript
interface ParticleLayerProps {
  preset: 'CherryBlossom' | 'GoldenPollen' | 'SteamSparks';
  intensity?: 'low' | 'medium' | 'high'; // default: medium
  active?: boolean;                        // default: true
}
```

**Critical CSS**: Component MUST have `pointer-events: none` — particles NEVER block UI clicks.

**Z-index**: Mount as top-level overlay with high z-index inside the view component wrapper.

**Performance target**: 60 FPS on mobile (roostertk profile). Use `requestAnimationFrame`
with delta-time capping. If Three.js is too heavy on mobile, fall back to Canvas 2D API.

## Steam Effect for Rivalry Cards

When an AI rival outbids the player, the Rivalry Card triggers:
1. Mount `<ParticleLayer preset="SteamSparks" intensity="low" />` scoped to the card container.
2. Pair with a `vibration` Framer Motion animation (5px x-shake, 200ms).
3. Auto-unmount after 2 seconds.

## Workflow (`/particles [preset]` activation)

1. Identify the current game phase context to select the appropriate preset.
2. Check if `src/components/effects/ParticleLayer.tsx` already exists.
   - If yes: add the preset or update intensity.
   - If no: generate the full component.
3. Import and mount `<ParticleLayer>` in the target view at the appropriate z-level.
4. Verify `pointer-events: none` is applied.
5. Ask user: `"Should I run a performance check in mobile emulation via CDP?"`
6. Output: `"Handshake Verified: particle-engine [preset] mounted. pointer-events:none confirmed."`

## Usage Rule

EVERY TIME a new "Full Page" view is created from `02_frontend_backlog.md`, the agent proactively asks:
> `"Should I add a [Preset Name] particle layer to enhance the atmosphere?"`

## References
- `.ai/skills/ui-factory/references/game_lore.md` — game phase context for preset selection
- `src/components/effects/ParticleLayer.tsx` — implementation target
