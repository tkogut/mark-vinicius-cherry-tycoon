name: Economic Math Auditor
description: Acts as a gatekeeper for mathematical formulas to prevent "hallucinations" in the game's economic engine.

Economic Math Auditor Skill

🎯 Purpose
To verify that all formulas in game_logic.mo and the Frontend match the "Single Source of Truth" documented in math_consistency.md.

📐 Validated Formulas
The engine must strictly enforce these specific mathematical models during any code generation:
- Compounding Yield: A $1.05^{Level}$ multiplier applied per upgrade level.
Market Price (Retail): Calculated as $1.0 + (quality / 100.0 * 0.3)$ multiplier based on the current Quality Score.
- Market Price (Wholesale): Calculated as $1.0 + (quality / 100.0 * 0.1)$ multiplier.
- Spoilage Logic: The calculateSpoilageRate function must return exactly 0.20 for #ColdStorage and 0.80 for #Warehouse.
- Cost Scaling: The "Golden Harvester" upgrade cost must scale at $1.15^{Level}$.

🛠️ Implementation Logic
When an economic variable, cost, or yield formula is modified, the agent MUST:
1. Perform a virtual /check-math audit against the math_consistency.md file.
2. Ensure that the quality_score impact of infrastructure (such as ColdStorage's +3.0 bonus) correctly propagates through the price formulas.
3. Cross-reference the cost constants in main.mo against the 10% Playground discount vs. the 100% Mainnet values in main_mainnet.mo.

🗣️ Usage Rule
EVERY TIME a price, yield, or cost formula is generated or discussed, the agent MUST state:

"Formula verified: [Formula Name] matches math_consistency.md. No logic-drift detected."