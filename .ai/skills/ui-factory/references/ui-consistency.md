# UI Consistency Rules

> **Scope**: All UI artifacts and React/Tailwind implementations for Mark Vinicius Cherry Tycoon.
> **Purpose**: Maintain a cohesive visual and interaction language and prevent rogue styling.

## 1. Color Palette, Theming & Depth
- **Aesthetic**: "Neo-Steampunk Cherry" — combine brass, mechanical gears, and glassmorphism with vibrant, pulsating organic textures.
- **Lighting**: "Dynamic Atmospheric Lighting" — use "God Rays" (volumetric lighting) through canopies and a "Golden Hour" glow for the Farm Overview. No flat colors.
- **Depth**: Utilize parallax scrolling for backgrounds and CSS `backdrop-blur` (glassmorphism) for UI panels to create a 3D layered hierarchy.
- Contrast must meet WCAG AA standards.

## 2. Layout & Typography
- Standard tycoon HUD layout: Top bar for global currencies/stats, Sidebar or Bottom bar for persistent navigation.
- Consistent padding (Tailwind `p-4` or `p-6` for main containers).
- Fonts: Sans-serif modern typography for numbers/stats to ensure readability; serif/stylized fonts for headers only.

## 3. Interactive Elements & 'Juice'
- **Haptic Visuals**: EVERY click on a core resource (e.g., Cherry) MUST trigger a subtle screen shake, a burst of cherry-petal particles, and a scaling bounce effect on the asset.
- **Transitions**: Move between standard views (e.g., 'Rynek' and 'Farm') using "Whip Pan" or "Cinematic Fade" transitions. Absolutely NO instant jump-cuts.
- **Progress Bars**: Exponential scaling or Juice Meters must have smooth, organic transitions.
- **Buttons**: Must have clear `:hover` and `:active` states with micro-animations (press -> bounce).

## 4. Error Handling & Edge Cases
- State empty screens gracefully with clear calls to action (e.g., "Nothing to harvest. Wait for next season.").
- Alert messages (e.g., Market Saturation Warning) should be prominently displayed in red/amber.
