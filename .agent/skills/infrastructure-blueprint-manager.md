name: Infrastructure Blueprint Manager
description: Manages technical specifications, costs, and mechanical effects for all farm infrastructure assets.
Infrastructure Blueprint Manager Skill
🎯 Purpose
To maintain a strict link between the Motoko backend infrastructure types and the React UI tooltips, ensuring the player sees accurate economic data.

🏢 Infrastructure Blueprints
The agent must strictly adhere to these validated data points:

Warehouse: Cost 25,000 PLN. Spoilage: 80%. Maintenance: 1%.

ColdStorage: Cost 40,000 PLN. Spoilage: 20%. Adds +3.0 Quality Score per level.

Machinery: Tractors (30k, -15% labor) and Shakers (60k, -30% labor, -2.0 Quality).

🛠️ Implementation Logic
When the user asks to "Build" or "Upgrade" infrastructure, the agent MUST:

Reference Investment & Harvester Analysis Report.md for current costs and maintenance fees.

Update the calculateSpoilageRate function in game_logic.mo to return 0.20 for ColdStorage or 0.80 for Warehouse.

Ensure the InvestmentsDashboard.tsx tooltips match the backend logic 1:1.

🗣️ Usage Rule
EVERY TIME an infrastructure asset is modified or added to the UI, the agent MUST proactively ask:

"I have applied the [Asset Name] stats (Cost: [X], Spoilage: [Y]). Should I verify these values against math_consistency.md?"