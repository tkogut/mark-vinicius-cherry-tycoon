---
description: Generate high-fidelity UI mockups for pending frontend tasks using Nano Banana
---
# UI Mockup Workflow

This workflow automatically designs UI mockups based on pending tasks in the frontend backlog, ensuring visual consistency with the game's established lore and HUD standards.

1. **Context Retrieval**:
   - Use `view_file` to read `directives/02_frontend_backlog.md` (to identify the next pending UI task).
   - Read `.agent/knowledge/game_lore.md` (for the "Cherry Tycoon Universe" Tone, Palette, and Textures).

2. **Requirement Check**:
   - Identify the highest priority pending UI task in the backlog (e.g., "Upgrade Shop Overlay", "10-Phase Indicator", "Prestige Dashboard").

3. **Design Synthesis**:
   - Construct a highly detailed image generation prompt. The prompt MUST incorporate:
     - **Layout**: Standard tycoon game HUD framing (e.g., top-bar currency counters, side-bar or bottom navigation).
     - **Theme**: The specific color palette and "Cherry-Steampunk" / "Rural Polish" textures extracted from the Lore Knowledge.
     - **UX Elements**: Mention specific interactive elements required by the backlog task (e.g., "Buy 10x" buttons, Exponential Scaling progress bars, Juice Meters).

4. **Generate**:
   - Use the `generate_image` tool (incorporating Nano Banana style rendering) to create a high-fidelity UI mockup. Use the `ImageName` parameter with a descriptive, lowercase name with underscores.

5. **Comparison & Validation**:
   - Read `.agent/rules/ui-consistency.md` for technical frontend constraints.
   - Generate a Table Artifact comparing the elements in your generated mockup against the constraints in the `ui-consistency.md` rule.

6. **Output**:
   - Present the generated UI mockup as a Media Artifact embedded in markdown.
   - Prompt the user with this exact question at the end: "Should I now generate the React/Tailwind boilerplate for this layout?"
