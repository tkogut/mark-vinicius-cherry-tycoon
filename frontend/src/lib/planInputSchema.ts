export interface PlanInputFields {
  rawPlanText: string;
  settingAndLore: string;
  economyConstraints: string;
  cropList: string;
  sportsLeagueFormat: string;
  tokenNftIntentions: string;
  progressionGoals: string;
}

export const defaultPlanInput: PlanInputFields = {
  rawPlanText: '',
  settingAndLore: '',
  economyConstraints: '',
  cropList: '',
  sportsLeagueFormat: '',
  tokenNftIntentions: '',
  progressionGoals: '',
};

export function parsePlanInput(fields: PlanInputFields): Record<string, string> {
  return {
    gameConcept: fields.settingAndLore || '[Plan Input Needed]',
    differentiation: fields.settingAndLore || '[Plan Input Needed]',
    accessibility: fields.settingAndLore || '[Plan Input Needed]',
    cropTypes: fields.cropList || '[Plan Input Needed]',
    specificMechanics: fields.cropList || '[Plan Input Needed]',
    sportType: fields.sportsLeagueFormat || '[Plan Input Needed]',
    rosterSize: fields.sportsLeagueFormat || '[Plan Input Needed]',
    leagueStructure: fields.sportsLeagueFormat || '[Plan Input Needed]',
    balanceTargets: fields.economyConstraints || '[Plan Input Needed]',
    progressionPacing: fields.progressionGoals || '[Plan Input Needed]',
    eventCalendar: fields.progressionGoals || '[Plan Input Needed]',
    arppu: fields.economyConstraints || '[Plan Input Needed]',
    conversionRate: fields.economyConstraints || '[Plan Input Needed]',
    retention: fields.economyConstraints || '[Plan Input Needed]',
    nftAssets: fields.tokenNftIntentions || '[Plan Input Needed]',
    trading: fields.tokenNftIntentions || '[Plan Input Needed]',
    web3Considerations: fields.tokenNftIntentions || '[Plan Input Needed]',
    contentVelocity: fields.progressionGoals || '[Plan Input Needed]',
    specificTargets: fields.economyConstraints || '[Plan Input Needed]',
    mitigationStrategy: fields.economyConstraints || '[Plan Input Needed]',
    additionalTerms: fields.rawPlanText || '[Plan Input Needed]',
  };
}
