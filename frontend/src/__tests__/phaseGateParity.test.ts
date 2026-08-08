// Phase-gate parity: frontend UI gating vs. the backend's SeasonalRestriction
// checks in backend/main.mo.
//
// `PHASE_ACTION_GATING` decides which buttons are enabled. The backend
// independently rejects out-of-phase calls with `#SeasonalRestriction`. The
// asymmetry matters:
//
//   frontend MORE permissive than backend  -> button looks available, the click
//                                             fails with a server error. BUG.
//   frontend MORE restrictive than backend -> button is greyed out even though
//                                             the call would succeed. This is
//                                             deliberate UI guidance in several
//                                             places, so it is allowed, but it
//                                             is enumerated below rather than
//                                             left implicit.
//
// The reference table is transcribed from main.mo with line numbers so a
// reviewer can verify it. `null` = the backend imposes no phase restriction.

import { describe, it, expect } from 'vitest';
import {
    isActionAllowed,
    PHASE_ACTION_GATING,
    PHASE_LABELS,
    PHASE_DESCRIPTIONS,
    type SeasonPhase,
    type GameAction,
} from '@/config/phaseConstants';

const ALL_PHASES = Object.keys(PHASE_ACTION_GATING) as SeasonPhase[];

/**
 * Backend phase requirements, transcribed from backend/main.mo.
 * `null` means the backend has no `currentPhase` guard for that action.
 */
const BACKEND_PHASE_REQUIREMENTS: Record<GameAction, {
    method: string;
    line: number;
    phases: SeasonPhase[] | null;
}> = {
    plant: { method: 'plantTrees', line: 1134, phases: ['Investment'] },
    water: { method: 'waterParcel', line: 768, phases: ['Procurement', 'Investment', 'Growth'] },
    harvest: { method: 'harvestCherries', line: 633, phases: ['Harvest'] },
    organic: { method: 'startOrganicConversion', line: 943, phases: ['Planning', 'Investment'] },
    prune: { method: 'cutAndPrune', line: 1081, phases: ['CutAndPrune'] },
    buy_infrastructure: { method: 'upgradeInfrastructure', line: 2118, phases: ['Investment'] },
    repair: { method: 'inspectAndRepair', line: 1023, phases: ['Maintenance'] },
    // No `currentPhase` guard found in main.mo for these three.
    fertilize: { method: 'fertilizeParcel', line: 838, phases: null },
    sell: { method: 'sellCherries', line: 1220, phases: null },
    buy_parcel: { method: 'buyParcel', line: 2439, phases: null },
};

const ALL_ACTIONS = Object.keys(BACKEND_PHASE_REQUIREMENTS) as GameAction[];

describe('phase gate: the frontend is never MORE permissive than the backend', () => {
    // This is the direction that produces a broken click: an enabled control
    // whose call the canister then refuses.
    it.each(
        ALL_ACTIONS.flatMap((action) => ALL_PHASES.map((phase) => [action, phase] as const))
    )('%s during %s', (action, phase) => {
        const backend = BACKEND_PHASE_REQUIREMENTS[action];
        if (backend.phases === null) return; // backend allows it in any phase

        if (isActionAllowed(phase, action)) {
            expect(
                backend.phases,
                `UI enables "${action}" during ${phase}, but ${backend.method} ` +
                `(main.mo:${backend.line}) only accepts [${backend.phases.join(', ')}] ` +
                `and will reject the call with #SeasonalRestriction.`
            ).toContain(phase);
        }
    });
});

describe('phase gate: where the frontend is deliberately stricter', () => {
    // Enumerated, not asserted-away: each entry is a UI choice to guide the
    // player toward the intended phase even though the canister would accept
    // the call. If one of these ever needs to open up, it is a design decision,
    // not a bug fix.
    it('lists every action the UI restricts more tightly than the backend', () => {
        const stricter: string[] = [];
        for (const action of ALL_ACTIONS) {
            const backend = BACKEND_PHASE_REQUIREMENTS[action];
            for (const phase of ALL_PHASES) {
                const backendAllows = backend.phases === null || backend.phases.includes(phase);
                if (backendAllows && !isActionAllowed(phase, action)) {
                    stricter.push(`${action}@${phase}`);
                }
            }
        }

        // Snapshot of the intentional gaps as of 2026-08-06. `buy_parcel` is
        // funnelled into Investment/Planning and `fertilize` is blocked in the
        // phases where it would be pointless, even though the canister is
        // indifferent in both cases.
        expect(stricter.sort()).toEqual([
            'buy_parcel@CutAndPrune',
            'buy_parcel@Growth',
            'buy_parcel@Harvest',
            'buy_parcel@Hiring',
            'buy_parcel@Maintenance',
            'buy_parcel@Market',
            'buy_parcel@Procurement',
            'buy_parcel@Storage',
            'fertilize@Harvest',
            'fertilize@Hiring',
            'fertilize@Maintenance',
            'fertilize@Planning',
        ]);
    });
});

describe('phase gate: isActionAllowed accepts both string and Motoko variant forms', () => {
    it('handles a plain string phase', () => {
        expect(isActionAllowed('Investment', 'plant')).toBe(true);
        expect(isActionAllowed('Harvest', 'plant')).toBe(false);
    });

    it('handles a Motoko variant object, as returned by the canister', () => {
        expect(isActionAllowed({ Investment: null } as never, 'plant')).toBe(true);
        expect(isActionAllowed({ Harvest: null } as never, 'plant')).toBe(false);
    });

    it('denies everything for an unknown phase rather than defaulting open', () => {
        for (const action of ALL_ACTIONS) {
            expect(isActionAllowed('NotAPhase' as SeasonPhase, action)).toBe(false);
        }
    });
});

describe('phase gate: table integrity', () => {
    it('covers all 10 phases of the yearly cycle', () => {
        expect(ALL_PHASES).toHaveLength(10);
    });

    it('has a label and a description for every phase', () => {
        for (const phase of ALL_PHASES) {
            expect(PHASE_LABELS[phase], `missing label for ${phase}`).toBeTruthy();
            expect(PHASE_DESCRIPTIONS[phase], `missing description for ${phase}`).toBeTruthy();
        }
    });

    it('references a backend method for every gated action', () => {
        // Stops a new GameAction from being added to the UI without anyone
        // deciding what the backend does about it.
        const gatedActions = new Set(Object.values(PHASE_ACTION_GATING).flat());
        for (const action of gatedActions) {
            expect(
                BACKEND_PHASE_REQUIREMENTS[action],
                `"${action}" is gated in the UI but has no backend mapping in this test`
            ).toBeDefined();
        }
    });

    it('every action is reachable in at least one phase', () => {
        for (const action of ALL_ACTIONS) {
            const reachable = ALL_PHASES.some((p) => isActionAllowed(p, action));
            expect(reachable, `"${action}" is unreachable in every phase`).toBe(true);
        }
    });
});
