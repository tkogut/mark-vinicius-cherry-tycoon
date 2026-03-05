name: Neo-Steampunk UI Factory
description: Standardizes the generation of React components using the specific "Neo-Steampunk Cherry" design system.
Neo-Steampunk UI Factory Skill
🎯 Purpose
To maintain visual consistency across all frontend views by enforcing the use of industrial-themed Tailwind tokens and custom CSS utility classes. This ensures every component feels like a physical part of the "Golden Harvester" machinery.

🎨 Visual Tokens & Assets
The factory must strictly utilize the following pre-defined styles:

Color Palette: brass, copper, ruby, charcoal, and hull tokens.

Utility Classes: .mechanical-hull for containers, .hull-header for titles, and .god-ray for cinematic lighting effects.

Animations: gear-spin for mechanical icons and shimmer for interactive elements.

Box Shadows: hull-glow and brass-rim to provide depth and a "heavy metal" feel.

🛠️ Implementation Logic
When generating or modifying a UI component (e.g., ParcelCard.tsx or InvestmentsDashboard.tsx), the agent MUST:

Wrap the main container in the .mechanical-hull class to establish the industrial texture.

Use the brass gradient for primary headers and ruby/copper for status badges.

Apply the sunset-vignette overlay to full-page views to maintain the "Golden Hour" atmosphere.

Ensure all action buttons feature a brass-rim shadow and a shimmer animation on hover.

Integrate gear-spin animations on icons located in the .hull-header.

🗣️ Usage Rule
EVERY TIME a new UI element is proposed, the agent MUST verify:

"Does this component follow the .mechanical-hull standard and utilize the correct brass/ruby color tokens?"