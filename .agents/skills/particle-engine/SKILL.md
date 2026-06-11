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

🎯 **Purpose**: 
Provide a reusable React + Canvas/Three.js particle system to enhance the "Vibe-First" Neo-Steampunk Cherry aesthetic.

🛠️ **Implementation Logic**:
- **Themed Presets**: `CherryBlossom`, `GoldenPollen`, `SteamSparks`.
- **Constraint**: MUST have `pointer-events: none` to never block UI.
- **Target**: 60 FPS on mobile (use `requestAnimationFrame`).

🗣️ **Usage Rule**:
Activate via `/particles [preset]`. 
Handshake: `"Handshake Verified: particle-engine [preset] mounted. pointer-events:none confirmed."`

## Workflow:

1. **Phase Check**: Identify game phase context (Spring/Growth/Market).
2. **Component Verify**: Ensure `ParticleLayer.tsx` exists and has the requested preset.
3. **Mount**: Mount in target view at appropriate z-level.
4. **Constraint Verify**: Confirm `pointer-events: none` is applied.
5. **Report Handshake**: Handshake verified.

## References
- `../../ui-factory/references/game_lore.md` — game phase context
- `assets/presets/` — Specific preset formula definitions
