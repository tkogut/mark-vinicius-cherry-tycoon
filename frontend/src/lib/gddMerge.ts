import { GddSection, PLAN_INPUT_NEEDED } from './gddTemplate';

/**
 * Merges the GDD template with user-provided Plan Input.
 * Phase 1 sections are fully specified and don't require plan input.
 * Other sections still use plan input where marked with PLAN_INPUT_NEEDED.
 */
export function mergeGddWithPlanInput(
  template: GddSection[],
  planInput: Record<string, string>
): GddSection[] {
  return template.map((section) => {
    // Phase 1 sections are complete and don't need merging
    if (!section.isPlanDependent) {
      return section;
    }

    // For plan-dependent sections, replace placeholders with plan input
    let content = section.content;

    // Replace placeholders with actual plan input values
    if (planInput.gameConcept) {
      content = content.replace(
        new RegExp(`\\*\\*Game Concept\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**Game Concept**: ${planInput.gameConcept}`
      );
    }

    if (planInput.differentiation) {
      content = content.replace(
        new RegExp(`\\*\\*Differentiation\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**Differentiation**: ${planInput.differentiation}`
      );
    }

    if (planInput.accessibility) {
      content = content.replace(
        new RegExp(`\\*\\*Accessibility\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**Accessibility**: ${planInput.accessibility}`
      );
    }

    if (planInput.cropTypes) {
      content = content.replace(
        new RegExp(`\\*\\*Crop Types\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**Crop Types**: ${planInput.cropTypes}`
      );
    }

    if (planInput.specificMechanics) {
      content = content.replace(
        new RegExp(`\\*\\*Specific Mechanics\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**Specific Mechanics**: ${planInput.specificMechanics}`
      );
    }

    if (planInput.sportType) {
      content = content.replace(
        new RegExp(`\\*\\*Sport Type\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**Sport Type**: ${planInput.sportType}`
      );
    }

    if (planInput.rosterSize) {
      content = content.replace(
        new RegExp(`\\*\\*Roster Size\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**Roster Size**: ${planInput.rosterSize}`
      );
    }

    if (planInput.leagueStructure) {
      content = content.replace(
        new RegExp(`\\*\\*League Structure\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**League Structure**: ${planInput.leagueStructure}`
      );
    }

    if (planInput.balanceTargets) {
      content = content.replace(
        new RegExp(`\\*\\*Balance Targets\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**Balance Targets**: ${planInput.balanceTargets}`
      );
    }

    if (planInput.progressionPacing) {
      content = content.replace(
        new RegExp(`\\*\\*Progression Pacing\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**Progression Pacing**: ${planInput.progressionPacing}`
      );
    }

    if (planInput.eventCalendar) {
      content = content.replace(
        new RegExp(`\\*\\*Event Calendar\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**Event Calendar**: ${planInput.eventCalendar}`
      );
    }

    if (planInput.nftAssets) {
      content = content.replace(
        new RegExp(`\\*\\*NFT Assets\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**NFT Assets**: ${planInput.nftAssets}`
      );
    }

    if (planInput.trading) {
      content = content.replace(
        new RegExp(`\\*\\*Trading\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**Trading**: ${planInput.trading}`
      );
    }

    if (planInput.arppu) {
      content = content.replace(
        new RegExp(`ARPPU: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `ARPPU: ${planInput.arppu}`
      );
    }

    if (planInput.conversionRate) {
      content = content.replace(
        new RegExp(`Conversion Rate: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `Conversion Rate: ${planInput.conversionRate}`
      );
    }

    if (planInput.retention) {
      content = content.replace(
        new RegExp(`Retention: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `Retention: ${planInput.retention}`
      );
    }

    if (planInput.web3Considerations) {
      content = content.replace(
        new RegExp(`\\*\\*Web3 Considerations\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**Web3 Considerations**: ${planInput.web3Considerations}`
      );
    }

    if (planInput.contentVelocity) {
      content = content.replace(
        new RegExp(`\\*\\*Content Velocity\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**Content Velocity**: ${planInput.contentVelocity}`
      );
    }

    if (planInput.specificTargets) {
      content = content.replace(
        new RegExp(`\\*\\*Specific Targets\\*\\*: \\$\\{${PLAN_INPUT_NEEDED}\\}`, 'g'),
        `**Specific Targets**: ${planInput.specificTargets}`
      );
    }

    // If no plan input provided, keep the placeholder visible
    // This ensures sections not covered by Phase 1 still show they need input
    return {
      ...section,
      content,
    };
  });
}
