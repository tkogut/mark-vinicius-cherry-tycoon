# 🍌 Skill: Nano Banana 2 (/visualize-concept)
**Status:** Active Visual Engine  
**Owner:** Coordinator / Frontend Artist (Antigravity)

---

## 1. Purpose
This skill acts as a high-fidelity bridging tool between the **Game Lore** and the **Frontend Assets**. It is used to generate photorealistic UI components, textures, and concepts in the "Golden Harvester" style.

## 2. Inputs & Context
To function correctly, this skill requires:
- **Reference Image**: `knowledge/golden_harvester_splash.jpg` (as the "North Star").
- **Style Guide**: `knowledge/ui_design_system_golden_harvester.md`.
- **Prompt Template**: Must use keywords: "Luxury Steampunk", "Skeuomorphism 2.0", "Emerald Glow", "Polished Gold".

## 3. Outputs
- **Format**: High-resolution PNG Texture Atlas or UI Mockups.
- **Destination**: Assets are to be saved in `frontend/assets/textures/`.

## 4. Usage Protocol
Whenever the **Builder** needs a new material (e.g., "Aged Brass Plate"), the **Coordinator** must invoke this skill using the following handshake:
> "Invoke Nano Banana 2: Generate [Component Name] based on Golden Harvester Spec."