# Component Spec: Emerald Vacuum Gauges
**Visual Reference**: golden_harvester_splash.jpg (The Vacuum Tubes)
**Function**: Resource Visualization (Harvest, Storage, Morale)

## 1. Visual Engineering
* **Material**: Transparent, thick glass with refractive edges (CSS `backdrop-filter`).
* **Content**: Glowing emerald liquid (#00FF41) representing "The Essence of the Harvest".
* **Atmosphere**: Inner glow (box-shadow) and subtle rising bubbles (Lottie/CSS animation).

## 2. Interactive Behavior (Tactile Mobile)
* **Liquid Physics**: On mobile, use subtle CSS transforms to simulate "sloshing" of the liquid when the player interacts with the screen.
* **State Changes**: When a resource reaches 90%, the glass should start to "vibrate" and emit small steam particles at the top.
* **Empty State**: A dull, dusty glass texture with only a faint green residue at the bottom.

## 3. Parallel Implementation Goal
- [x] Integrate these gauges into the main dashboard alongside the Imperial Dial.
- [x] Use the `roostertk` profile to verify visibility on small OLED screens.
- Handshake Verified: Emerald Liquid texture generated and frontend implemented.