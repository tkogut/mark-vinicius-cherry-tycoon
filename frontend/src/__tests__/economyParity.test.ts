// QUAL-05 — TS <-> Motoko economic-formula parity.
//
// WHY THIS EXISTS
// `frontend/src/lib/gameLogic.ts` re-implements the yield maths that
// `backend/game_logic.mo` owns, and `frontend/src/config/gameBalanceConstants.ts`
// asks the reader to "Keep in sync with ... backend/game_logic.mo". Until this
// file, that sync was guaranteed by a comment and nothing else. The backend is
// authoritative — it decides the cherries and therefore the cash the player
// actually receives — so any divergence means the UI lies to the player.
//
// HOW IT WORKS (and what it does NOT prove)
// `motokoReferenceYield()` below is a deliberate line-by-line transcription of
// `GameLogic.calculateYieldPotential`, with the Motoko quoted inline so a
// reviewer can diff the two by eye. The suite then asserts that the app's
// mirror reproduces the reference across PARITY_CASES.
//
// This catches drift on the FRONTEND side immediately. It does NOT
// automatically detect a change made on the MOTOKO side — the transcription is
// a hand-maintained copy. Closing that loop needs a live oracle, which needs a
// `debugCalculateYield` query on the canister: `calculateYieldPotential` is
// currently internal (only called from main.mo's harvest path), so there is no
// method to generate a fixture from. Tracked as QUAL-05b; deliberately not
// added here, because widening the canister's public interface is a backend
// change outside this step's scope.

import { describe, it, expect } from 'vitest';
import type { CherryParcel, Infrastructure } from '@/declarations/backend.did';
import { calculateYieldBreakdown, getInfraModifier } from '@/lib/gameLogic';
import { PARITY_CASES, makeParcel, makeInfra } from '@/test-utils/economyVectors';

// ============================================================================
// REFERENCE IMPLEMENTATION — transcription of backend/game_logic.mo
// ============================================================================

/**
 * Motoko:
 *   case (#SandyClay) { 1.0 }; case (#Clay) { 0.9 };
 *   case (#Sandy) { 0.85 };    case (#Waterlogged) { 0.6 };
 */
function refSoilModifier(soilType: CherryParcel['soilType']): number {
    if ('SandyClay' in soilType) return 1.0;
    if ('Clay' in soilType) return 0.9;
    if ('Sandy' in soilType) return 0.85;
    if ('Waterlogged' in soilType) return 0.6;
    throw new Error('unhandled soil type in reference impl');
}

/**
 * Motoko:
 *   if (pH >= 6.0 and pH <= 7.0) { 1.0 }
 *   else if (pH >= 5.5 and pH < 6.0) { 0.9 }
 *   else if (pH > 7.0 and pH <= 7.5) { 0.9 }
 *   else { 0.7 }
 */
function refPhModifier(pH: number): number {
    if (pH >= 6.0 && pH <= 7.0) return 1.0;
    if (pH >= 5.5 && pH < 6.0) return 0.9;
    if (pH > 7.0 && pH <= 7.5) return 0.9;
    return 0.7;
}

/**
 * Motoko `getTreeAgeModifier` returns `?Float` — `null` means the trees are
 * dead (>40) and `calculateYieldPotential` then returns `null` for the whole
 * parcel. `null` here models that.
 */
function refTreeAgeModifier(treeAge: bigint): number | null {
    const age = Number(treeAge);
    if (age === 0) return 0.0;
    if (age === 1) return 0.33;
    if (age === 2) return 0.66;
    if (age >= 3 && age <= 40) return 1.0;
    if (age > 40) return null; // dead
    return 1.0;
}

/**
 * Motoko `getInfrastructureModifier`. NOTE the deliberate asymmetry: every
 * term is ADDITIVE (`modifier += ...`) except #GoldenHarvester, which is
 * MULTIPLICATIVE (`modifier *= 1.05^level`), folded in array iteration order.
 * Mixing `+=` and `*=` in one fold makes the result depend on the order of the
 * infrastructure array — see the order-sensitivity test at the bottom.
 */
function refInfraModifier(infrastructure: Infrastructure[]): number {
    let modifier = 1.0;
    for (const infra of infrastructure) {
        const type = Object.keys(infra.infraType)[0];
        const level = Number(infra.level);
        switch (type) {
            case 'GoldenHarvester': {
                let multi = 1.0;
                for (let i = 1; i <= level; i++) multi *= 1.05;
                modifier *= multi;
                break;
            }
            case 'Tractor': modifier += 0.05 * level; break;
            case 'Shaker': modifier += 0.08 * level; break;
            case 'Sprayer': modifier += 0.03 * level; break;
            case 'ColdStorage': modifier += 0.02 * level; break;
            default: break; // Motoko: case (_) { /* no yield effect */ }
        }
    }
    return modifier;
}

/** Motoko: `if (waterLevel < 0.3) 0.7 else if (waterLevel > 0.8) 0.85 else 1.0`. */
function refWaterModifier(waterLevel: number): number {
    if (waterLevel < 0.3) return 0.7;
    if (waterLevel > 0.8) return 0.85;
    return 1.0;
}

/** Motoko: `if (parcel.isOrganic) { 0.8 } else { 1.0 }`. */
function refOrganicModifier(isOrganic: boolean): number {
    return isOrganic ? 0.8 : 1.0;
}

/**
 * Motoko (Phase 5.1 "Opole DNA", GDD §3.1):
 *   case ("Głubczyce") { 1.10 }; case ("Opole") { 1.08 };
 *   case ("Namysłów") { 1.05 };  case (_) { 1.0 };
 */
function refCountyModifier(county: string): number {
    switch (county) {
        case 'Głubczyce': return 1.10;
        case 'Opole': return 1.08;
        case 'Namysłów': return 1.05;
        default: return 1.0;
    }
}

/**
 * Transcription of `calculateYieldPotential`, returning kg (or null for dead
 * trees). Multiplication ORDER is preserved exactly as Motoko writes it,
 * because f64 multiplication is not associative — reordering can shift the
 * last bits and flip the integer truncation below.
 *
 *   let totalYield = baseYield * soilMod * phMod * fertilityMod * infraMod
 *                    * waterMod * organicMod * ageModifier * countyMod;
 *   let yieldPerHa = totalYield * parcel.size;
 *   ?Int.abs(Float.toInt(yieldPerHa * 1000.0))
 */
export function motokoReferenceYield(
    parcel: CherryParcel,
    infrastructure: Infrastructure[]
): number | null {
    const ageModifier = refTreeAgeModifier(parcel.treeAge);
    if (ageModifier === null) return null; // Motoko: `case null { return null }`

    const baseYield = 25.0; // tons/ha, hardcoded in game_logic.mo
    const soilMod = refSoilModifier(parcel.soilType);
    const phMod = refPhModifier(parcel.pH);
    const fertilityMod = parcel.fertility;
    const infraMod = refInfraModifier(infrastructure);
    const waterMod = refWaterModifier(parcel.waterLevel);
    const organicMod = refOrganicModifier(parcel.isOrganic);
    const countyMod = refCountyModifier(parcel.region.county);

    const totalYield =
        baseYield * soilMod * phMod * fertilityMod * infraMod * waterMod * organicMod * ageModifier * countyMod;
    const yieldPerHa = totalYield * parcel.size;

    // Float.toInt truncates toward zero; Int.abs then makes it a Nat.
    return Math.abs(Math.trunc(yieldPerHa * 1000.0));
}

// ============================================================================
// PARITY ASSERTIONS
// ============================================================================

describe('economy parity: gameLogic.ts mirrors backend/game_logic.mo', () => {
    it.each(PARITY_CASES.map((c) => [c.name, c] as const))(
        'yields the backend number for: %s',
        (_name, testCase) => {
            const expected = motokoReferenceYield(testCase.parcel, testCase.infrastructure);
            const actual = calculateYieldBreakdown(testCase.parcel, testCase.infrastructure);

            if (expected === null) {
                // Dead trees (age > 40): the backend harvests nothing at all.
                expect(actual.parcelYield).toBe(0);
                return;
            }

            // The backend hands out whole kilograms; compare on that basis.
            expect(Math.abs(Math.trunc(actual.parcelYield))).toBe(expected);
        }
    );

    it('covers every yield-affecting branch', () => {
        // Guards against someone quietly shrinking the vector until it passes.
        expect(PARITY_CASES.length).toBeGreaterThanOrEqual(40);
    });
});

describe('economy parity: infrastructure modifier term-by-term', () => {
    const cases: Array<[string, Infrastructure[], number]> = [
        ['empty', [], 1.0],
        ['Tractor L1 (+0.05)', [makeInfra({ Tractor: null }, 1)], 1.05],
        ['Shaker L2 (+0.16)', [makeInfra({ Shaker: null }, 2)], 1.16],
        ['Sprayer L3 (+0.09)', [makeInfra({ Sprayer: null }, 3)], 1.09],
        ['ColdStorage L5 (+0.10)', [makeInfra({ ColdStorage: null }, 5)], 1.10],
        ['Warehouse L5 (no yield effect)', [makeInfra({ Warehouse: null }, 5)], 1.0],
        ['GoldenHarvester L2 (x1.05^2)', [makeInfra({ GoldenHarvester: null }, 2)], 1.05 * 1.05],
    ];

    it.each(cases)('%s', (_name, infra, expected) => {
        expect(getInfraModifier(infra)).toBeCloseTo(expected, 10);
        // ...and the app mirror must agree with the transcription, not just
        // with a hand-written number.
        expect(getInfraModifier(infra)).toBeCloseTo(refInfraModifier(infra), 10);
    });
});

describe('economy parity: known backend quirks are reproduced, not smoothed over', () => {
    // Motoko folds `+=` (Tractor et al.) and `*=` (GoldenHarvester) in array
    // order, so the same equipment in a different order gives a different
    // multiplier. That is a latent backend issue (flagged as ECON-PARITY-01),
    // but while it exists the mirror must reproduce it — otherwise the UI and
    // the payout disagree for any player owning a Golden Harvester plus
    // anything else.
    it('is sensitive to infrastructure array order, exactly like the backend', () => {
        const gh = makeInfra({ GoldenHarvester: null }, 2);
        const tractor = makeInfra({ Tractor: null }, 3);

        const ghFirst = getInfraModifier([gh, tractor]);   // (1.0 * 1.1025) + 0.15
        const tractorFirst = getInfraModifier([tractor, gh]); // (1.0 + 0.15) * 1.1025

        expect(ghFirst).toBeCloseTo(refInfraModifier([gh, tractor]), 10);
        expect(tractorFirst).toBeCloseTo(refInfraModifier([tractor, gh]), 10);
        expect(ghFirst).not.toBeCloseTo(tractorFirst, 6);
    });

    it('treats trees older than 40 as dead (zero yield), like the backend', () => {
        const dead = makeParcel({ treeAge: 41n });
        expect(motokoReferenceYield(dead, [])).toBeNull();
        expect(calculateYieldBreakdown(dead, []).parcelYield).toBe(0);
    });

    it('applies the county bonus only to the three named counties', () => {
        const base = calculateYieldBreakdown(makeParcel({ county: 'Nyski' }), []).parcelYield;
        const glubczyce = calculateYieldBreakdown(makeParcel({ county: 'Głubczyce' }), []).parcelYield;
        const opole = calculateYieldBreakdown(makeParcel({ county: 'Opole' }), []).parcelYield;
        const namyslow = calculateYieldBreakdown(makeParcel({ county: 'Namysłów' }), []).parcelYield;

        expect(glubczyce / base).toBeCloseTo(1.10, 9);
        expect(opole / base).toBeCloseTo(1.08, 9);
        expect(namyslow / base).toBeCloseTo(1.05, 9);
    });
});
