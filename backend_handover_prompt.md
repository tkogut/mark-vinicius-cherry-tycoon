# Backend Agent Handover Prompt

Please copy and paste the following prompt to the Backend Agent:

---

Hello Backend Agent! We have successfully implemented the 10-Phase Activity System and Weather Animations on the frontend. The UI is looking great, but we now need to deepen the gameplay mechanics for each phase so that the player is making meaningful decisions rather than just clicking "Next Phase."

Please focus on **Phase 5.7: Phase Engagement & Mechanics Deepening** in the `01_backend_backlog.md`. 

Your immediate priorities are:

1. **Hiring Phase Rework (Spring):**
   - Replace the current flat seasonal labor fee with an active management mechanic.
   - Introduce wage negotiation or worker type selection.
   - Example conceptually: Players must choose between cheap, low-productivity Village labor vs. expensive, high-productivity City labor.
   - Failing to secure enough labor quality/quantity in Spring should negatively impact the yield or cost in the `#Harvest` phase.
   - Update `main.mo` and `main_mainnet.mo` as well as the relevant `types.mo` and logic modules.

2. **Spring Watering:**
   - Currently, the `waterParcel` action is strictly locked to Summer (`#Growth` phase).
   - Because Droughts and Heatwaves can also spawn in Spring, we need to allow players to water their parcels earlier.
   - Update the action gating in the backend to permit `waterParcel` during the Spring phases (e.g., `#Procurement` or `#Investment`) to combat early weather events.

3. **Phase Engagement Brainstorming:**
   - Review the remaining phases. Brainstorm and implement at least one active, meaningful decision (or minigame-like choice) for EVERY single phase. No phase should be just a passive click-through. Please outline your proposals in the backlog or plan before implementing them all.

Please start by reading the current state of `main.mo`, `main_mainnet.mo` and `types.mo`, then write an implementation plan for the Hiring Rework and Spring Watering changes. Verify your changes with E2E tests once implemented.

---
