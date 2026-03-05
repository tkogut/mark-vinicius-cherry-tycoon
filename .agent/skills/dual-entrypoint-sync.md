Here are the three critical orchestration skills for your .agent/skills/ directory, formatted exactly like your particle-engine.md template.

name: Dual Entrypoint Sync
description: Automates the replication of logic between Playground and Mainnet environments to prevent "Split-Brain" deployment errors.
Dual Entrypoint Sync Skill
🎯 Purpose
To ensure that all backend modifications are applied synchronously to both main.mo (Playground/dfx 0.24.3) and main_mainnet.mo (Mainnet/EOP), maintaining architectural integrity.

⚙️ Core Logic
The agent must enforce the "Dual-Write" policy based on the environment context:

Playground Context: Uses a 10% "Playground Discount" for testing (e.g., 10,000 PLN for Level 1 Injector).

Mainnet Context: Uses 100% GDD-standard costs (e.g., 100,000 PLN) and production-grade security parameters.

Sync Lock: Any logic update to calculateSpoilageRate or investment scaling MUST be identical in both files.

🛠️ Implementation Logic
When the user requests a backend change, the agent MUST:

Analyze the requested change in main.mo.

Identify the corresponding lines in main_mainnet.mo.

Apply the changes to BOTH files simultaneously, adjusting only the environment-specific constants (like deployment costs).

Perform a logical comparison to ensure the "Architecture: Dual Entrypoint" directive is satisfied.

🗣️ Usage Rule
EVERY TIME a .mo file is modified, the agent MUST state:

"Logic updated in both main.mo and main_mainnet.mo to prevent environment drift. Should I run a /check-dual to verify the sync?"