---
description: Visualize an element of the Cherry Tycoon lore using Nano Banana
---
# Visualize Lore Workflow

This workflow generates concept art based on the project's established lore and economic guidelines.

1. **Read Knowledge & Rules**: Read `.agent/knowledge/game_lore.md` (for Tone and Settings), `.agent/rules/math_consistency.md` (for soil, pH, and fertility visual cues), and `directives/02_frontend_backlog.md` (to find relevant Backlog IDs for tagging). Read `assets/concept-art/manifest.md` to see previous prompt styles.
2. **User Inquiry**: Ask the user: "Which element of the Cherry Tycoon lore should I visualize right now? (You can also ask to match a style from the manifest log)." Wait for their response.
3. **Security Gatekeeper Check**: Before generating any asset, ensure the concept strictly adheres to project branding ("Produced by JaPiTo Group", absolutely zero "Caffeine" legacy references) as per `.agent/rules/security_directive.md`.
4. **Style Synthesis**: Construct a detailed image generation prompt. It MUST combine:
   - The user's specific request.
   - The "Tone/Lore" extracted from `game_lore.md`.
   - Visual cues derived from the Math-Consistency rule (e.g., specific soil colors, visible pH effects, or abundant 20,000kg-base yields versus withered trees for drought penalties).
   - If requested, match the style of a previous prompt logged in `assets/concept-art/manifest.md`.
5. **Generate**: Invoke the `generate_image` tool (incorporating Nano Banana style rendering parameters) to create a high-fidelity image. Do not use generic placeholders. Give it a highly descriptive, lowercase, underscore-separated name.
6. **Export & Tag**: 
   - The generated image is saved automatically as an artifact.
   - You MUST log the exact generation prompt used into `assets/concept-art/manifest.md`. 
   - Ensure the asset is tagged with its relevant Phase or Task ID from `directives/02_frontend_backlog.md`. Format the log entry as: 
     `### [Image Name]`
     `**Backlog ID:** [Relevant Phase or Task]`
     `**Prompt:** [Your Prompt]`
     `**Date:** [Date]`
7. **Report**: Present the generated image artifact via a markdown embed and confirm that the prompt and metadata were successfully logged in the manifest tracking system.
