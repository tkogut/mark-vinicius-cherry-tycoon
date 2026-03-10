# Plan 001: The Golden Harvester at Sunset

## Goal Description
Implement the "Golden Harvester" cinematic upgrade feature, combining robust backend economic scaling with a premium "Neo-Steampunk Cherry" frontend featuring God Rays, Golden Hour lighting, and Particle Engine overlays.

## User Review Required
> [!IMPORTANT]
> - Please review the `economic_audit.md` for verifying the strict math scaling.
> - Please review the generated UI Mockup artifact (`golden_harvester_ui.webp`) to establish the visual north star.

## Proposed Changes

### Motoko Backend (Core Logic)
#### [MODIFY] backend/main.mo
- Add state variable `golden_harvester_level : Nat = 0`.
- Add method `upgrade_golden_harvester() : async Result.Result<Nat, Text>` to implement safe cost deductions and level increments with underflow protection.
- Update `calculate_yield(...)` to include `(1.05 ** golden_harvester_level)` into the `Infrastructure` multiplier.

### React Frontend (Vibe Coding)
#### [NEW] frontend/src/components/GoldenHarvesterView.tsx
- Main container with `backdrop-blur` glassmorphism panels.
- Thematic Neo-Steampunk UI layering, utilizing brass and ruby red palettes.
- Import and configure `ParticleEngine` with `GoldenPollen` configuration (`pointer-events-none`).
- CSS animations mimicking volumetric God Rays representing the "Golden Hour".
- Implement Haptic Visuals for the upgrade buttons (shake, bounce, and click sparks).

#### [MODIFY] frontend/src/App.tsx
- Integrate `GoldenHarvesterView` into the internal layout.
- Implement whip-pan transitions moving to/from the Harvester view, adhering to `ui-consistency.md`.

## Verification Plan

### Automated Tests
- Run `./scripts/test.sh` in the terminal to execute the Motoko framework and assert the `1.05^Level` yield multiplier behaves correctly and costs deduplicate flawlessly.
- Run `./scripts/verify-ui.sh` to ensure there are no unintended TS/Tailwind compilation errors.

### Manual Verification
- Deploy to local replica using `./scripts/start.sh`.
- Navigate to the new Golden Harvester View.
- Perform an upgrade purchase: observe haptic visual feedback (screen shake, golden petal bursts) and ensure the pricing scales correctly.
- Ensure the God Rays do not block pointer events.
