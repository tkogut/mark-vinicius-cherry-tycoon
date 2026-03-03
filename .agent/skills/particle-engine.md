---
name: Particle Engine
description: Provides a reusable React + Canvas/Three.js particle system overlay for applying cinematic 'Juice' to UI views.
---

# Particle Engine Skill

## 🎯 Purpose
To provide a reusable React + Three.js (or Canvas-based) particle system that can be themed dynamically via props, enhancing the "Vibe-First" Neo-Steampunk Cherry aesthetic.

## 🎨 Core Presets
The engine must support these core presets based on the project's lore:

- **CherryBlossom**: Pink and white drifting petals featuring wind-shear physics. Perfect for Spring/Growth phases.
- **GoldenPollen**: Glowing amber dust motes specifically designed to augment "Golden Hour" dynamic lighting views.
- **SteamSparks**: Brass-colored mechanical sparks and embers for Harvester/Market views, emphasizing the Steampunk industrial elements.

## 🛠️ Implementation Logic
When the user asks for a "Cinematic" or "Atmospheric" view, the agent MUST:

1. Generate or update a `ParticleLayer.tsx` component in `src/components/effects/`.
2. Import and configure the relevant preset based on the current context and Lore Knowledge (`.agent/knowledge/game_lore.md`).
3. Ensure the container has a `pointer-events-none` CSS overlay applied, explicitly guaranteeing the particles **do not block** underlying UI clicks.
4. Mount `ParticleLayer` as a top-level z-index overlay within the view component.

## 🗣️ Usage Rule
EVERY TIME a new "Full Page" view is created from the Frontend Backlog (`02_frontend_backlog.md`), the agent SHOULD proactively ask the user:
> "Should I add a [Preset Name] particle layer to enhance the atmosphere?"
