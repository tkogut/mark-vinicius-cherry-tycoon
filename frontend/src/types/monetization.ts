export enum BoostType {
    BioStimulant = 'Bio-Stimulant',      // Increases yield
    CloudSummoner = 'Cloud Summoner',    // Triggers rain
    SoilEnhancer = 'Soil Enhancer',      // Permanent fertility boost
    PestGuard = 'Pest Guard',            // Temporary immunity to pests
    QualityInfuser = 'Quality Infuser'   // Direct quality boost
}

export interface ConsumableBoost {
    id: string;
    type: BoostType;
    name: string;
    description: string;
    creditCost: number;
    durationSeasons: number;
}

export interface MapExpansion {
    id: string;
    regionName: string;
    creditCost: number;
    unlocked: boolean;
    requirements: {
        level: number;
        reputation: number;
    };
}

export interface CherryCreditsBalance {
    amount: bigint;
    lastUpdated: bigint;
}
