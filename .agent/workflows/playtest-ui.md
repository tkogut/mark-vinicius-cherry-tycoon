---
description: UX/Psychology critique audit for interactive UI elements.
---
# Playtest UI Workflow

This workflow guides the QA and Frontend agents in validating the interactive "Juice" and structural logic of the UI components.

1. **Context Retrieval**:
   - Use `view_file` to read the target frontend component in `frontend/src/` or `frontend/components/`.
   - Read `.agent/rules/ui-consistency.md` to establish the baseline for required UI mechanics, such as micro-animations and "Juice Meters."
   
2. **Review Elements**:
   - **Tactile Feedback**: Ensure every interactive element (buttons, toggles, cards) has adequate `:hover`, `:active`, or `:focus` states.
   - **Juice Level**: Verify if animations (e.g., Lottie, particle bursts) trigger correctly upon user actions (like harvesting or planting).
   - **Psychological Flow**: Assess if the placement of elements guides the player's eyes intuitively according to standard tycoon game UX.

3. **Reporting & Action**:
   - Provide a brief critique listing any missing feedback or visual polish.
   - If issues are identified, generate specific actionable tasks and append them to `.agent/rules/02_frontend_backlog.md` (or `.agent/rules/02_frontend_backlog.md`).
   - If the component passes, mark it as `[x] VALIDATED` in the relevant backlog.
