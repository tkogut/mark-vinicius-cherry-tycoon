export type SeasonPhase =
    | 'Hiring'
    | 'Procurement'
    | 'Investment'
    | 'Growth'
    | 'Harvest'
    | 'Market'
    | 'Storage'
    | 'CutAndPrune'
    | 'Maintenance'
    | 'Planning';

export type GameAction =
    | 'plant'
    | 'water'
    | 'fertilize'
    | 'harvest'
    | 'organic'
    | 'prune'
    | 'buy_infrastructure'
    | 'buy_parcel'
    | 'sell';

export const PHASE_ACTION_GATING: Record<SeasonPhase, GameAction[]> = {
    'Hiring': ['sell'],
    'Procurement': ['water', 'sell'],
    'Investment': ['plant', 'organic', 'buy_infrastructure', 'buy_parcel', 'water', 'sell'],
    'Growth': ['water', 'fertilize', 'sell'],
    'Harvest': ['harvest', 'sell'],
    'Market': ['sell'],
    'Storage': ['sell'],
    'CutAndPrune': ['prune', 'fertilize', 'sell'],
    'Maintenance': ['buy_infrastructure', 'sell'],
    'Planning': ['organic', 'buy_parcel', 'sell']
};

export const PHASE_LABELS: Record<SeasonPhase, string> = {
    'Hiring': 'Worker Hiring',
    'Procurement': 'Material Supply',
    'Investment': 'Investment Phase',
    'Growth': 'Growth Season',
    'Harvest': 'Cherry Harvest',
    'Market': 'Market Sales',
    'Storage': 'Storage Management',
    'CutAndPrune': 'Pruning Phase',
    'Maintenance': 'Machinery Repair',
    'Planning': 'Financial Planning'
};

export const PHASE_DESCRIPTIONS: Record<SeasonPhase, string> = {
    'Hiring': 'Recruit seasonal workers for the upcoming harvest.',
    'Procurement': 'Buy fertilizers and pesticides to boost your yield.',
    'Investment': 'Plant new trees and expand your farm infrastructure.',
    'Growth': 'Ensure proper hydration and nutrition as fruit matures.',
    'Harvest': 'Peak season! Harvest your cherries before they spoil.',
    'Market': 'The market is open. Sell your harvest at competitive prices.',
    'Storage': 'Manage your inventory and utilize specialized facilities.',
    'CutAndPrune': 'Essential tree maintenance for long-term health.',
    'Maintenance': 'Repair your machines and prepare for the next year.',
    'Planning': 'Review your financials and set strategies for next season.'
};

export const isActionAllowed = (phase: SeasonPhase | string, action: GameAction): boolean => {
    // Handle variants if phase is passed as an object from Motoko { Hiring: null }
    const phaseKey = typeof phase === 'string' ? phase : Object.keys(phase)[0];
    const allowedActions = PHASE_ACTION_GATING[phaseKey as SeasonPhase] || [];
    return allowedActions.includes(action);
};
