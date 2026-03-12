# UI Design System: The Golden Harvester (AUI)
**Reference Image**: golden_harvester_splash.jpg
**Status**: Technical Frontend Specification
**Constraint**: Mobile-First Implementation with Browser-Adaptive Polish

---

## 1. Aesthetic Engineering
This document evolves the "Neo-Steampunk" lore into a high-fidelity **Artistic UI (AUI)**. The interface must look like a physical machine, not a flat digital overlay.

### Visual Pillars:
* **Skeuomorphism 2.0**: Every component must feature high-quality textures (Polished Gold, Aged Brass, Mahogany).
* **The Emerald Core**: Primary visual feedback is provided by glowing emerald liquid in glass vacuum tubes.
* **Atmospheric Lighting**: UI panels should use "God Rays" and dynamic shadows to create 3D depth.

---

## 2. Tactile Interaction (roostertk Protocol)
The user interface is optimized for the **roostertk** mobile profile via CDP Bridge.

### Mobile-First Mechanics:
* **The Thumb Zone**: All primary interaction points (The Imperial Dial) must be reachable within the bottom 40% of the smartphone screen.
* **Rotary Inputs**: Instead of sliders or text fields, use **Physical Brass Dials** that the user rotates with their thumb.
* **Haptic Visuals**: Every interaction must trigger reactive micro-animations (bouncing, steam puffs, or light pulses).

---

## 3. Atomic Components Spec

### A. The Imperial Brass Dial (The Price Bidder)
- **Visual**: A heavy, 3D-engraved gold dial.
- **Behavior**: Used for setting bid prices in the Competitive Pool. Features mechanical inertia—fast spins slow down gradually.

### B. Glass Vacuum Gauges (Resource Meters)
- **Visual**: Transparent cylinders filled with glowing red or green liquid.
- **Behavior**: Liquid levels fluctuate based on storage and harvest rates. Bubbles appear when processing is active.

### C. Mechanical Rivalry Plates (AI Cards)
- **Visual**: Small, etched brass plates with rival portraits.
- **Behavior**: When outbid by Marek or Kasia, the plate emits a steam-particle effect and shakes slightly.

---

## 4. Technical Guardrails

1.  **Asset Strategy**: Use layered SVGs for sharpness on Retina/OLED screens. Use CSS `backdrop-filter` for glass refraction effects.
2.  **Performance**: Prioritize Lottie for gear-turning animations to maintain a steady 60 FPS on mobile devices.
3.  **Adaptive Scaling**: Use CSS `clamp()` to ensure the "Luxury Machine" frames fit both a 390px mobile screen and a 4K browser window.
4.  **Verification**: No component is marked [x] until verified in **Mobile Emulation** via the CDP bridge on port 9222.