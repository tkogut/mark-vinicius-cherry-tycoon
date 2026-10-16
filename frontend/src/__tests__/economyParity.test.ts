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
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CherryParcel, Infrastructure, Season } from '@/declarations/backend.did';
import {
    calculateYieldBreakdown,
    getInfraModifier,
    getMaintenanceCost,
    getMaintenanceCap,
    degradeMaintenance,
    getRepairCost,
    getUpkeepDrift,
    getClubSharePrice,
    getSeasonSaleMultiplier,
    getFertilizerTypeModifier,
    FERTILIZER_TYPES,
    FERTILIZER_COSTS,
    getFertilizerCost,
    isSyntheticFertilizer,
    getFertilizerBlock,
    FERTILIZER_BLOCK_ORGANIC,
    FERTILIZER_BLOCK_SEASON,
    LEAGUE_LABELS,
    getHandlingQuality,
    getSpoilageBaseRate,
    getSpoilagePercent,
    applySpoilage,
} from '@/lib/gameLogic';
import { PARITY_CASES, makeParcel, makeInfra, BONUS_COUNTIES, CONTROL_COUNTY } from '@/test-utils/economyVectors';

const REPO_ROOT = resolve(__dirname, '../../..');

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
    // ECON-PARITY-01: additive terms onto 1.0, then the GoldenHarvester multiplier last.
    let additive = 1.0;
    let multiplier = 1.0;
    for (const infra of infrastructure) {
        const type = Object.keys(infra.infraType)[0];
        const level = Number(infra.level);
        switch (type) {
            case 'GoldenHarvester': {
                let multi = 1.0;
                for (let i = 1; i <= level; i++) multi *= 1.05;
                multiplier *= multi;
                break;
            }
            case 'Tractor': additive += 0.05 * level; break;
            case 'Shaker': additive += 0.08 * level; break;
            case 'Sprayer': additive += 0.03 * level; break;
            case 'ColdStorage': additive += 0.02 * level; break;
            default: break; // Motoko: case (_) { /* no yield effect */ }
        }
    }
    return additive * multiplier;
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
 *                    * waterMod * organicMod * ageModifier * countyMod
 *                    * fertilizerTypeMod;
 *   let yieldPerHa = totalYield * parcel.size;
 *   ?Int.abs(Float.toInt(yieldPerHa * 1000.0))
 *
 * `fertilizerTypeMod` is omitted below (implicitly 1.0, the caller-supplied
 * baseline used by every PARITY_CASES fixture) — it is pinned separately, in
 * combination with a non-neutral value, by the ECON-01 block further down.
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

// ============================================================================
// MAINT-01 — infrastructure upkeep, wear and repair
// ============================================================================

/** Transcription of game_logic.mo getInfrastructureCost. */
const REF_BASE_COST: Record<string, number> = {
    SocialFacilities: 15_000,
    Warehouse: 25_000,
    ColdStorage: 40_000,
    Tractor: 30_000,
    GoldenHarvester: 0,
    Shaker: 60_000,
    Sprayer: 12_000,
    ProcessingFacility: 100_000,
    Pruner: 18_000,
};

/** Transcription of game_logic.mo getMaintenancePercentage. */
function refMaintenancePercentage(key: string): number {
    switch (key) {
        case 'GoldenHarvester':
        case 'Tractor':
        case 'Shaker':
        case 'Sprayer':
        case 'Pruner':
            return 2;
        default:
            return 1;
    }
}

/** Motoko: `(basePrice * percentage) / 100` — Nat division truncates. */
function refMaintenanceCost(key: string): number {
    return Math.floor((REF_BASE_COST[key] ?? 0) * refMaintenancePercentage(key) / 100);
}

/**
 * Motoko `degradeMaintenance`:
 *   let spec = getMaintenanceCost(infra.infraType);
 *   let cap = spec * 2;
 *   let step = if (spec / 10 == 0) { 1 } else { spec / 10 };
 *   let next = infra.maintenanceCost + step;
 *   if (next > cap) { cap } else { next }
 */
function refDegrade(key: string, current: number): number {
    const spec = refMaintenanceCost(key);
    const cap = spec * 2;
    const step = Math.floor(spec / 10) === 0 ? 1 : Math.floor(spec / 10);
    const next = current + step;
    return next > cap ? cap : next;
}

const INFRA_KEYS = Object.keys(REF_BASE_COST);

describe('economy parity: infrastructure upkeep (MAINT-01)', () => {
    it.each(INFRA_KEYS)('spec upkeep for %s matches the backend', (key) => {
        expect(getMaintenanceCost(key)).toBe(refMaintenanceCost(key));
    });

    it('machinery pays 2% and buildings 1% of purchase price', () => {
        expect(getMaintenanceCost('Tractor')).toBe(600);   // 30_000 * 2%
        expect(getMaintenanceCost('Shaker')).toBe(1_200);  // 60_000 * 2%
        expect(getMaintenanceCost('Sprayer')).toBe(240);   // 12_000 * 2%
        expect(getMaintenanceCost('Warehouse')).toBe(250); // 25_000 * 1%
        expect(getMaintenanceCost('ColdStorage')).toBe(400);
        expect(getMaintenanceCost('ProcessingFacility')).toBe(1_000);
    });

    it('upkeep is capped at twice spec', () => {
        for (const key of INFRA_KEYS) {
            expect(getMaintenanceCap(key)).toBe(refMaintenanceCost(key) * 2);
        }
    });
});

describe('economy parity: wear accumulation (MAINT-01)', () => {
    it.each(INFRA_KEYS)('%s wears identically to the backend over 40 seasons', (key) => {
        let mine = refMaintenanceCost(key);
        let theirs = mine;
        for (let season = 0; season < 40; season++) {
            mine = degradeMaintenance(key, mine);
            theirs = refDegrade(key, theirs);
            expect(mine).toBe(theirs);
        }
    });

    it('wear is monotonic and clamps at the cap — verified where a replica run could not reach', () => {
        // The live-replica check during development confirmed the first three
        // steps for a Sprayer (240 -> 264 -> 288 -> 312). Reaching the 480 cap
        // would have taken ~10 more season transitions and risked the
        // InsufficientFunds guard, so the ceiling is pinned here instead.
        let cost = getMaintenanceCost('Sprayer');
        expect(cost).toBe(240);

        const seen: number[] = [];
        for (let i = 0; i < 30; i++) {
            const next = degradeMaintenance('Sprayer', cost);
            expect(next).toBeGreaterThanOrEqual(cost); // monotonic
            cost = next;
            seen.push(cost);
        }
        expect(seen.slice(0, 3)).toEqual([264, 288, 312]); // matches the replica run
        expect(cost).toBe(480);                            // 2x spec, and no further
        expect(degradeMaintenance('Sprayer', 480)).toBe(480);
    });

    it('even zero-cost infrastructure still drifts (step floors at 1)', () => {
        // GoldenHarvester's purchase price is 0 in the table (its cost is handled
        // separately), so spec upkeep is 0 and `spec / 10` truncates to 0. The
        // backend floors the step at 1 — but the cap is also 0, so it stays 0.
        expect(getMaintenanceCost('GoldenHarvester')).toBe(0);
        expect(degradeMaintenance('GoldenHarvester', 0)).toBe(refDegrade('GoldenHarvester', 0));
    });
});

/**
 * Motoko `getRepairCost` after MAINT-02:
 *   for (infra in infrastructure.vals()) {
 *     let excess = getMaintenanceExcess(infra);
 *     if (excess > 0) {
 *       let half = excess / 2;
 *       total += (if (half == 0) { 1 } else { half });
 *     };
 *   };
 *   total
 */
function refRepairCost(assets: Array<{ key: string; maintenanceCost: number }>): number {
    let total = 0;
    for (const a of assets) {
        const excess = Math.max(0, a.maintenanceCost - refMaintenanceCost(a.key));
        if (excess > 0) {
            const half = Math.floor(excess / 2);
            total += half === 0 ? 1 : half;
        }
    }
    return total;
}

const worn = (key: string, level: number, maintenanceCost: number) => {
    const infra = makeInfra({ [key]: null } as never, level);
    infra.maintenanceCost = BigInt(maintenanceCost);
    return infra;
};

describe('economy parity: repair cost (MAINT-02)', () => {
    it('charges half the accumulated wear, not a flat per-level fee', () => {
        // Sprayer spec 240. One season of wear -> 264, excess 24, repair 12.
        expect(getRepairCost([worn('Sprayer', 1, 264)])).toBe(12);
        // At the 480 cap: excess 240, repair 120.
        expect(getRepairCost([worn('Sprayer', 1, 480)])).toBe(120);
    });

    it('is independent of level — level was never what a repair was worth', () => {
        // The pre-MAINT-02 formula was `level * 500`, so these three differed by
        // 3x for identical wear. Wear lives on maintenanceCost, not on level.
        for (const level of [1, 2, 3]) {
            expect(getRepairCost([worn('Sprayer', level, 480)])).toBe(120);
        }
    });

    it('sums only the assets that have actually worn', () => {
        const fleet = [
            worn('Sprayer', 1, 480),                                    // excess 240 -> 120
            worn('Warehouse', 3, getMaintenanceCost('Warehouse')),      // at spec   -> 0
            worn('Shaker', 1, 1_800),                                   // excess 600 -> 300
        ];
        expect(getRepairCost(fleet)).toBe(420);
        expect(getRepairCost(fleet)).toBe(refRepairCost([
            { key: 'Sprayer', maintenanceCost: 480 },
            { key: 'Warehouse', maintenanceCost: getMaintenanceCost('Warehouse') },
            { key: 'Shaker', maintenanceCost: 1_800 },
        ]));
    });

    it('costs nothing when there is nothing to service', () => {
        // No longer a 500 "minimum inspection" charge — that fee for a no-op was
        // half of why the mechanic was dead (MAINT-02).
        expect(getRepairCost([])).toBe(0);
        expect(getRepairCost([worn('Tractor', 1, getMaintenanceCost('Tractor'))])).toBe(0);
    });

    it('does not charge to remove a below-spec legacy discount', () => {
        // The pre-MAINT-01 code wrote `level * 100`, leaving assets BELOW spec
        // (Shaker L1: 100 against a 1200 spec). Excess saturates at 0, so those
        // are skipped rather than "repaired" upward at the player's expense.
        expect(getRepairCost([worn('Shaker', 1, 100)])).toBe(0);
    });

    it('floors at 1 per asset so a 1 PLN drift is not free to fix', () => {
        expect(getRepairCost([worn('SocialFacilities', 1, getMaintenanceCost('SocialFacilities') + 1)])).toBe(1);
    });

    it.each(INFRA_KEYS)('%s matches the backend transcription across its whole wear range', (key) => {
        const spec = refMaintenanceCost(key);
        for (let cost = spec; cost <= spec * 2; cost += Math.max(1, Math.floor(spec / 10))) {
            expect(getRepairCost([worn(key, 1, cost)])).toBe(
                refRepairCost([{ key, maintenanceCost: cost }])
            );
        }
    });
});

describe('economy parity: the MAINT-02 payback property holds for every asset type', () => {
    // The defect MAINT-02 recorded: a flat 500 repair could never pay back for a
    // cheap asset, because what a repair is worth is bounded by the spec value.
    // A phase cycle is one year (4 season transitions, wear +10% of spec each),
    // `Maintenance` comes round once per year, and `maintenanceCost` is annual —
    // so servicing every year is worth at most ~0.8x spec/year versus never
    // servicing. Pricing the repair at half the wear makes that ratio identical
    // for every type, which is the property to hold onto.
    it.each(INFRA_KEYS.filter((k) => refMaintenanceCost(k) > 0))(
        '%s: a service always costs less than a year of the wear it removes',
        (key) => {
            const spec = refMaintenanceCost(key);
            const step = Math.max(1, Math.floor(spec / 10));
            for (let cost = spec + step; cost <= spec * 2; cost += step) {
                const excess = cost - spec;              // extra PLN/year while it stands
                const repair = getRepairCost([worn(key, 1, cost)]);
                expect(repair).toBeLessThan(excess);
            }
        }
    );

    it('records the types the old flat 500 fee made unrepairable', () => {
        // Regression guard on the reasoning, not on getRepairCost: if the spec
        // table changes, this list should be re-derived rather than trusted.
        const deadUnderFlatFee = INFRA_KEYS.filter((k) => {
            const spec = refMaintenanceCost(k);
            return spec > 0 && spec * 0.8 < 500;
        });
        expect(deadUnderFlatFee.sort()).toEqual([
            'ColdStorage',    // 400 -> worth 320/yr
            'Pruner',         // 360 -> worth 288/yr
            'SocialFacilities', // 150 -> worth 120/yr
            'Sprayer',        // 240 -> worth 192/yr
            'Tractor',        // 600 -> worth 480/yr — marginal, but still negative
            'Warehouse',      // 250 -> worth 200/yr
        ]);
        // Only Shaker (1200 -> 960/yr) and ProcessingFacility (1000 -> 800/yr)
        // were ever worth servicing under the flat fee: 2 of 8 priced types.
        expect(deadUnderFlatFee).toHaveLength(6);
    });
});

describe('economy parity: upkeep drift drives the repair decision', () => {
    it('reports zero excess for freshly-bought infrastructure', () => {
        const drift = getUpkeepDrift([worn('Sprayer', 1, getMaintenanceCost('Sprayer'))]);
        expect(drift.excess).toBe(0);
        expect(drift.repairCost).toBe(0);
        expect(drift.worthRepairing).toBe(false);
    });

    it('is worth repairing after a single season of wear, on a cheap asset', () => {
        // The MAINT-02 change, stated as a behaviour: Sprayer spec 240, one step
        // of wear -> 264. Under the flat 500 fee this read "not yet worth it" and
        // never stopped reading that, even at the cap. Now: excess 24, repair 12.
        const drift = getUpkeepDrift([worn('Sprayer', 1, 264)]);
        expect(drift.excess).toBe(24);
        expect(drift.repairCost).toBe(12);
        expect(drift.worthRepairing).toBe(true);
    });

    it('is worth repairing on an expensive asset at the cap', () => {
        const drift = getUpkeepDrift([worn('Shaker', 1, 2_400)]);
        expect(drift.spec).toBe(1_200);
        expect(drift.excess).toBe(1_200);
        expect(drift.repairCost).toBe(600);
        expect(drift.worthRepairing).toBe(true);
    });

    it('sums current and spec across a mixed fleet', () => {
        const drift = getUpkeepDrift([
            worn('Sprayer', 1, 480),      // spec 240
            worn('Warehouse', 3, 250),    // spec 250, at spec
        ]);
        expect(drift.spec).toBe(490);
        expect(drift.current).toBe(730);
        expect(drift.excess).toBe(240);
        expect(drift.repairCost).toBe(120);
    });
});

// ============================================================================
// SPORTS-02 — club share pricing
// ============================================================================

/**
 * Motoko `SportsLogic.getSharePrice`:
 *   let price = (marketValue * percent) / 100;
 *   if (price == 0 and percent > 0) { percent } else { price }
 */
function refSharePrice(marketValue: number, percent: number): number {
    const price = Math.floor((marketValue * percent) / 100);
    return price === 0 && percent > 0 ? percent : price;
}

/** The authored catalogue's valuations, transcribed from backend/sports_logic.mo. */
const CLUB_VALUES: Record<string, number> = {
    KS_GLUBCZYCE: 420_000,
    LZS_NAMYSLOW: 340_000,
    OKS_OPOLE: 380_000,
    GKS_PRUDNIK: 240_000,
    LZS_KIETRZ: 180_000,
    LZS_BRANICE: 145_000,
    LZS_LUBRZA: 120_000,
    LZS_STRZELECZKI: 132_000,
};

describe('economy parity: club share price (SPORTS-02)', () => {
    it('matches the values observed on a live replica', () => {
        // From the verification run: 5% of LZS_LUBRZA charged exactly 6000 and
        // a further 25% charged 30000, cash 50_000 -> 44_000 -> 14_000.
        expect(getClubSharePrice(120_000, 5)).toBe(6_000);
        expect(getClubSharePrice(120_000, 25)).toBe(30_000);
        // And the rejected case: 50% of KS_GLUBCZYCE quoted 210_000.
        expect(getClubSharePrice(420_000, 50)).toBe(210_000);
        // 3% of LZS_BRANICE charged 4350 for the rival identity.
        expect(getClubSharePrice(145_000, 3)).toBe(4_350);
    });

    it.each(Object.entries(CLUB_VALUES))(
        '%s is priced identically to the backend at every stake size',
        (_club, value) => {
            for (let percent = 0; percent <= 100; percent++) {
                expect(getClubSharePrice(value, percent)).toBe(refSharePrice(value, percent));
            }
        }
    );

    it('a full takeover costs exactly the club value', () => {
        for (const value of Object.values(CLUB_VALUES)) {
            expect(getClubSharePrice(value, 100)).toBe(value);
        }
    });

    it('is free only for a zero stake', () => {
        expect(getClubSharePrice(120_000, 0)).toBe(0);
        for (let percent = 1; percent <= 100; percent++) {
            expect(getClubSharePrice(120_000, percent)).toBeGreaterThan(0);
        }
    });

    it('never lets integer truncation make a stake free', () => {
        // A club valued below 100 PLN would otherwise price every small stake
        // at 0. No catalogue entry is that cheap today, but the floor is part of
        // the backend formula and must be mirrored, not assumed unreachable.
        expect(getClubSharePrice(50, 1)).toBe(1);
        expect(getClubSharePrice(0, 7)).toBe(7);
        expect(getClubSharePrice(199, 1)).toBe(1);
    });

    it('is monotonic in stake size', () => {
        for (const value of Object.values(CLUB_VALUES)) {
            let previous = 0;
            for (let percent = 1; percent <= 100; percent++) {
                const price = getClubSharePrice(value, percent);
                expect(price).toBeGreaterThanOrEqual(previous);
                previous = price;
            }
        }
    });

    it('labels both leagues with their real Polish names', () => {
        // types.mo spells these #Liga3/#Liga4, which in the real pyramid means
        // III/IV liga — four tiers above what the GDD models. Renaming the
        // variant is a Candid change (SPORTS-04); until then the UI must not
        // repeat the wrong name to the player.
        expect(LEAGUE_LABELS.Liga3).toBe('Klasa Okręgowa');
        expect(LEAGUE_LABELS.Liga4).toBe('Klasa A');
    });
});

describe('economy parity: backend behaviours the mirror must reproduce', () => {
    // ECON-PARITY-01 (fixed 2026-10-16): Motoko used to fold `+=` (Tractor et al.)
    // and `*=` (GoldenHarvester) in array order, so the same equipment gave 1.2525
    // or 1.2679 depending on purchase order. The additive terms are now summed
    // first and the Golden Harvester multiplies the sum last.
    it('is independent of infrastructure array order', () => {
        const gh = makeInfra({ GoldenHarvester: null }, 2);
        const tractor = makeInfra({ Tractor: null }, 3);

        const ghFirst = getInfraModifier([gh, tractor]);
        const tractorFirst = getInfraModifier([tractor, gh]);

        expect(ghFirst).toBeCloseTo(tractorFirst, 12);
        expect(ghFirst).toBeCloseTo((1.0 + 0.15) * 1.05 * 1.05, 12); // = 1.267875
        expect(ghFirst).toBeCloseTo(refInfraModifier([gh, tractor]), 12);
        expect(tractorFirst).toBeCloseTo(refInfraModifier([tractor, gh]), 12);
    });

    it('gives every permutation of a mixed fleet the same modifier', () => {
        const fleet = [
            makeInfra({ GoldenHarvester: null }, 3),
            makeInfra({ Tractor: null }, 2),
            makeInfra({ Shaker: null }, 1),
            makeInfra({ Sprayer: null }, 4),
            makeInfra({ ColdStorage: null }, 2),
            makeInfra({ Warehouse: null }, 5),
        ];
        const permutations = (xs: Infrastructure[]): Infrastructure[][] =>
            xs.length <= 1 ? [xs] : xs.flatMap((x, i) =>
                permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map(rest => [x, ...rest]));
        const expected = (1.0 + 0.10 + 0.08 + 0.12 + 0.04) * 1.05 ** 3;
        for (const perm of permutations(fleet)) {
            expect(getInfraModifier(perm)).toBeCloseTo(expected, 12);
        }
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

// ============================================================================
// ECON-02 — season sale price multiplier (D-03)
// ============================================================================

/**
 * Transcription of game_logic.mo `getSeasonSaleMultiplier`:
 *
 *   public func getSeasonSaleMultiplier(season: Types.Season) : Float {
 *     switch (season) {
 *       case (#Spring) { 0.9 };
 *       case (#Summer) { 1.15 };
 *       case (#Autumn) { 1.0 };
 *       case (#Winter) { 0.75 };
 *     }
 *   };
 */
function refSeasonSaleMultiplier(season: Season): number {
    if ('Spring' in season) return 0.9;
    if ('Summer' in season) return 1.15;
    if ('Autumn' in season) return 1.0;
    if ('Winter' in season) return 0.75;
    throw new Error('unreachable season variant');
}

/**
 * Transcription of game_logic.mo `calculateRetailPrice`, with the ECON-02
 * trailing `seasonMultiplier` parameter:
 *
 *   let finalPrice = Float.fromInt(basePrice) * marketSize * qualityBonus
 *     * organicPremium * saturationMultiplier * seasonMultiplier;
 */
function refRetailPrice(
    basePrice: number,
    marketSize: number,
    quality: number,
    isOrganic: boolean,
    saturationMultiplier: number,
    seasonMultiplier: number,
): number {
    const qualityBonus = 1.0 + (quality / 100.0 * 0.3);
    const organicPremium = isOrganic ? 1.4 : 1.0;
    return basePrice * marketSize * qualityBonus * organicPremium * saturationMultiplier * seasonMultiplier;
}

const REF_SEASONS: Record<string, Season> = {
    Spring: { Spring: null },
    Summer: { Summer: null },
    Autumn: { Autumn: null },
    Winter: { Winter: null },
};

/**
 * Transcription of game_logic.mo `calculateWholesalePrice`, with the ECON-02
 * trailing `seasonMultiplier` parameter:
 *
 *   let finalPrice = Float.fromInt(basePrice) * wholesaleMultiplier * volumeBonus
 *     * qualityBonus * saturationMultiplier * seasonMultiplier;
 *
 * The pre-existing volume-bonus thresholds (quantity > 10_000 / > 5_000) are
 * reproduced unchanged -- this plan adds no new threshold.
 */
function refWholesalePrice(
    basePrice: number,
    quantity: number,
    quality: number,
    saturationMultiplier: number,
    seasonMultiplier: number,
): number {
    const wholesaleMultiplier = 0.7;
    const volumeBonus = quantity > 10000 ? 1.05 : quantity > 5000 ? 1.02 : 1.0;
    const qualityBonus = 1.0 + (quality / 100.0 * 0.1);
    return basePrice * wholesaleMultiplier * volumeBonus * qualityBonus * saturationMultiplier * seasonMultiplier;
}

describe('economy parity: season sale price (ECON-02)', () => {
    it.each([
        ['Spring', REF_SEASONS.Spring, 0.9],
        ['Summer', REF_SEASONS.Summer, 1.15],
        ['Autumn', REF_SEASONS.Autumn, 1.0],
        ['Winter', REF_SEASONS.Winter, 0.75],
    ] as const)('%s multiplier matches D-03 and the Motoko transcription', (_name, season, expected) => {
        expect(getSeasonSaleMultiplier(season)).toBeCloseTo(expected, 10);
        expect(getSeasonSaleMultiplier(season)).toBeCloseTo(refSeasonSaleMultiplier(season), 10);
    });

    it('Summer retail price is exactly 1.15x the Autumn price, all else equal', () => {
        const autumnPrice = refRetailPrice(100, 0.8, 60, false, 1.0, getSeasonSaleMultiplier(REF_SEASONS.Autumn));
        const summerPrice = refRetailPrice(100, 0.8, 60, false, 1.0, getSeasonSaleMultiplier(REF_SEASONS.Summer));
        expect(summerPrice / autumnPrice).toBeCloseTo(1.15, 10);
    });

    it('Winter retail price is exactly 0.75x the Autumn price, all else equal', () => {
        const autumnPrice = refRetailPrice(100, 0.8, 60, false, 1.0, getSeasonSaleMultiplier(REF_SEASONS.Autumn));
        const winterPrice = refRetailPrice(100, 0.8, 60, false, 1.0, getSeasonSaleMultiplier(REF_SEASONS.Winter));
        expect(winterPrice / autumnPrice).toBeCloseTo(0.75, 10);
    });

    // Full matrix: 4 seasons x 2 sale types, mirror vs transcription vs literal.
    it.each([
        ['Spring', REF_SEASONS.Spring, 0.9],
        ['Summer', REF_SEASONS.Summer, 1.15],
        ['Autumn', REF_SEASONS.Autumn, 1.0],
        ['Winter', REF_SEASONS.Winter, 0.75],
    ] as const)('%s: retail price carries the season term through the product', (_name, season, mult) => {
        const seasonMult = getSeasonSaleMultiplier(season);
        expect(seasonMult).toBeCloseTo(mult, 10);
        const withSeason = refRetailPrice(100, 0.8, 60, false, 1.0, seasonMult);
        const withoutSeason = refRetailPrice(100, 0.8, 60, false, 1.0, 1.0);
        expect(withSeason / withoutSeason).toBeCloseTo(mult, 10);
    });

    it.each([
        ['Spring', REF_SEASONS.Spring, 0.9],
        ['Summer', REF_SEASONS.Summer, 1.15],
        ['Autumn', REF_SEASONS.Autumn, 1.0],
        ['Winter', REF_SEASONS.Winter, 0.75],
    ] as const)('%s: wholesale price carries the season term through the product', (_name, season, mult) => {
        const seasonMult = getSeasonSaleMultiplier(season);
        expect(seasonMult).toBeCloseTo(mult, 10);
        const withSeason = refWholesalePrice(15, 1000, 60, 1.0, seasonMult);
        const withoutSeason = refWholesalePrice(15, 1000, 60, 1.0, 1.0);
        expect(withSeason / withoutSeason).toBeCloseTo(mult, 10);
    });

    it('the pre-existing wholesale volume-bonus thresholds still fire at the same quantities, with and without a season multiplier', () => {
        // quantity > 10_000 -> 1.05x, quantity > 5_000 -> 1.02x, else 1.0x.
        // This plan adds no new threshold; the season term is one more
        // multiplicand alongside volumeBonus, never a replacement for it.
        const cases: Array<[string, number, number]> = [
            ['at the >10_000 boundary', 10_001, 1.05],
            ['just below the >10_000 boundary', 10_000, 1.02],
            ['at the >5_000 boundary', 5_001, 1.02],
            ['just below the >5_000 boundary', 5_000, 1.0],
        ];

        for (const [, quantity, expectedVolumeBonus] of cases) {
            for (const season of Object.values(REF_SEASONS)) {
                const seasonMult = getSeasonSaleMultiplier(season);
                const withSeason = refWholesalePrice(15, quantity, 60, 1.0, seasonMult);
                const neutral = refWholesalePrice(15, quantity, 60, 1.0, 1.0);
                // The ratio between a seasoned and unseasoned price at the same
                // quantity is exactly the season multiplier -- the volume bonus
                // that produced expectedVolumeBonus cancels out of the ratio,
                // proving the threshold fired identically in both cases.
                expect(withSeason / neutral).toBeCloseTo(seasonMult, 10);
                // Sanity: the volume bonus itself is unaffected by season.
                const bare = refWholesalePrice(15, quantity, 0, 1.0, 1.0) / (15 * 0.7);
                expect(bare).toBeCloseTo(expectedVolumeBonus, 10);
            }
        }
    });
});

// ============================================================================
// ECON-01 — fertilizer type yield modifier (D-01, plan 03-06)
// ============================================================================

/**
 * Transcription of game_logic.mo `getFertilizerTypeModifier`:
 *
 *   public func getFertilizerTypeModifier(fertilizerType: Text) : Float {
 *     switch (fertilizerType) {
 *       case ("SyntheticIntensive") { 1.05 };
 *       case ("SyntheticStandard") { 1.0 };
 *       case ("OrganicCompatible") { 1.0 };
 *       case (_) { 1.0 };
 *     }
 *   };
 */
function refFertilizerTypeModifier(fertilizerType: string): number {
    switch (fertilizerType) {
        case 'SyntheticIntensive': return 1.05;
        case 'SyntheticStandard': return 1.0;
        case 'OrganicCompatible': return 1.0;
        default: return 1.0;
    }
}

describe('economy parity: fertilizer type (ECON-01)', () => {
    it.each([
        ['OrganicCompatible', 1.0],
        ['SyntheticStandard', 1.0],
        ['SyntheticIntensive', 1.05],
        ['junkFertilizerType', 1.0],
    ] as const)('%s modifier matches D-01 and the Motoko transcription', (type, expected) => {
        expect(getFertilizerTypeModifier(type)).toBeCloseTo(expected, 10);
        expect(getFertilizerTypeModifier(type)).toBeCloseTo(refFertilizerTypeModifier(type), 10);
    });

    it('a Synthetic-Intensive-fed parcel yields exactly 1.05x a structurally identical Synthetic-Standard-fed parcel', () => {
        const parcel = makeParcel();
        const standard = calculateYieldBreakdown(parcel, [], null, null, getFertilizerTypeModifier('SyntheticStandard'));
        const intensive = calculateYieldBreakdown(parcel, [], null, null, getFertilizerTypeModifier('SyntheticIntensive'));
        expect(intensive.parcelYield / standard.parcelYield).toBeCloseTo(1.05, 9);
    });

    // Regression guard (must_haves): a never-fertilized parcel's yield is
    // exactly what it was before this plan — fertilizerTypeMod defaults to
    // 1.0, so this plan changes no existing payout.
    it('an unfertilized parcel yields exactly its pre-plan value (fertilizerTypeMod defaults to 1.0)', () => {
        const parcel = makeParcel();
        const withDefault = calculateYieldBreakdown(parcel, []);
        const withExplicitNeutral = calculateYieldBreakdown(parcel, [], null, null, 1.0);
        expect(withDefault.parcelYield).toBe(withExplicitNeutral.parcelYield);
        expect(withDefault.parcelYield).toBeCloseTo(motokoReferenceYield(parcel, [])!, 6);
    });

    // Matrix: every fertilizer type crossed with every bonus county (+ the
    // control county) and both organic states, so the new term is proven to
    // COMPOSE with `countyMod` and `organicMod` rather than only to exist in
    // isolation. Ratio-based: dividing out the type-1.0 baseline for the same
    // county/organic combination isolates exactly the fertilizer term.
    describe('composes with county and organic modifiers', () => {
        const counties = [...BONUS_COUNTIES, CONTROL_COUNTY];
        const organicStates = [false, true];

        it.each(
            counties.flatMap((county) =>
                organicStates.map((isOrganic) => [county, isOrganic] as const)
            )
        )('county %s, organic=%s: SyntheticIntensive is exactly 1.05x SyntheticStandard', (county, isOrganic) => {
            const parcel = makeParcel({ county, isOrganic });
            const standard = calculateYieldBreakdown(
                parcel, [], null, null, getFertilizerTypeModifier('SyntheticStandard')
            );
            const intensive = calculateYieldBreakdown(
                parcel, [], null, null, getFertilizerTypeModifier('SyntheticIntensive')
            );
            expect(intensive.parcelYield / standard.parcelYield).toBeCloseTo(1.05, 9);
            // Sanity: OrganicCompatible is neutral, same as Standard, in every combination too.
            const organicCompatible = calculateYieldBreakdown(
                parcel, [], null, null, getFertilizerTypeModifier('OrganicCompatible')
            );
            expect(organicCompatible.parcelYield).toBeCloseTo(standard.parcelYield, 6);
        });
    });

    // Ratchet (plan 03-07 dependency): the exported wire strings are exactly
    // the three the Motoko guard accepts — reads `backend/main.mo` off disk
    // so a picker importing FERTILIZER_TYPES can never drift from the
    // backend's closed set silently.
    describe('wire-string agreement with the backend closed set (plan 03-07 dependency)', () => {
        it('every exported FERTILIZER_TYPES string appears in fertilizeParcel\'s guard in backend/main.mo', () => {
            const mainMo = readFileSync(resolve(REPO_ROOT, 'backend/main.mo'), 'utf8');
            // Isolate fertilizeParcel's body so a match elsewhere in the file
            // (e.g. a comment) can't produce a false pass.
            const fnStart = mainMo.indexOf('func fertilizeParcel(');
            expect(fnStart).toBeGreaterThan(-1);
            const guardWindow = mainMo.slice(fnStart, fnStart + 2000);

            for (const type of FERTILIZER_TYPES) {
                expect(guardWindow.includes(`"${type}"`)).toBe(true);
            }
            expect(FERTILIZER_TYPES.length).toBe(3);
        });
    });
});

describe('economy parity: winter spoilage reaches organic stock (ECON-12)', () => {
    // Transcription of the Autumn block in main.mo's season advance:
    //   baseRate = 15; ColdStorage -> 2; Warehouse (only while baseRate > 5) -> 8
    //   rate = StorageLogic.calculateSpoilage(baseRate, HiringLogic.getHandlingQuality(labor))
    //        = baseRate * 100 / quality            (Nat division)
    //   spoiledCherries = cherries * rate / 100
    //   spoiledOrganic  = organicCherries * rate / 100      <- ECON-12
    const rate = (infra: ReturnType<typeof makeInfra>[], labor: unknown) => getSpoilagePercent(infra, labor);
    const cold = makeInfra({ ColdStorage: null }, 1);
    const warehouse = makeInfra({ Warehouse: null }, 1);

    it('reproduces the documented storage x labour table', () => {
        expect(rate([], [])).toBe(21);                               // none, unhired (70)
        expect(rate([], [{ Emergency: null }])).toBe(21);
        expect(rate([], [{ Standard: null }])).toBe(15);
        expect(rate([], [{ City: null }])).toBe(12);
        expect(rate([warehouse], [{ Standard: null }])).toBe(8);
        expect(rate([cold], [{ Emergency: null }])).toBe(2);
        expect(rate([cold], [{ City: null }])).toBe(1);
    });

    it('Cold Storage beats a Warehouse in either array order', () => {
        expect(getSpoilageBaseRate([cold, warehouse])).toBe(2);
        expect(getSpoilageBaseRate([warehouse, cold])).toBe(2);
    });

    it('treats unhired labour as the worst case, not neutral', () => {
        expect(getHandlingQuality([])).toBe(70);
        expect(getHandlingQuality(undefined)).toBe(70);
        expect(getHandlingQuality([{ City: null }])).toBe(120);
    });

    it('takes the same percentage from conventional and organic stock', () => {
        const percent = rate([], []);
        expect(applySpoilage(100_000n, percent)).toBe(79_000n);  // the figure seen on the replica for conventional
        expect(applySpoilage(50_000n, percent)).toBe(39_500n);   // organic now loses the same 21%
    });

    it('uses integer division and never goes negative', () => {
        expect(applySpoilage(99n, 21)).toBe(79n);   // 99 * 21 / 100 = 20 (truncated)
        expect(applySpoilage(0n, 21)).toBe(0n);
        expect(applySpoilage(5n, 100)).toBe(0n);
    });
});

describe('economy parity: fertilizer cost and organic rule (ECON-REBALANCE)', () => {
    // Transcription of GameLogic.getFertilizerCost / isSyntheticFertilizer in
    // backend/game_logic.mo, and of the two guards in main.mo's fertilizeParcel:
    //   "SyntheticIntensive" -> labour 480, operations 320   (800)
    //   "OrganicCompatible"  -> labour 390, operations 260   (650)
    //   _ (SyntheticStandard) -> labour 300, operations 200  (500, the old flat price)
    //   refused: synthetic on (isOrganic or organicCertified)
    //   refused: parcel.lastFertilized == farm.seasonNumber
    const MOTOKO = {
        SyntheticIntensive: { laborCost: 480, operationalCost: 320 },
        OrganicCompatible: { laborCost: 390, operationalCost: 260 },
        SyntheticStandard: { laborCost: 300, operationalCost: 200 },
    } as const;

    it('mirrors the Motoko cost table for every type', () => {
        expect(FERTILIZER_COSTS).toEqual(MOTOKO);
        expect([...FERTILIZER_TYPES].sort()).toEqual(Object.keys(MOTOKO).sort());
    });

    it('keeps SyntheticStandard at the 500 PLN every type cost before the rebalance', () => {
        expect(getFertilizerCost('SyntheticStandard')).toBe(500);
        expect(getFertilizerCost('OrganicCompatible')).toBe(650);
        expect(getFertilizerCost('SyntheticIntensive')).toBe(800);
    });

    it('makes Intensive pay for its +5% yield: +300 PLN, +60%, never the same price as Standard', () => {
        expect(getFertilizerTypeModifier('SyntheticIntensive')).toBe(1.05);
        const premium = getFertilizerCost('SyntheticIntensive') - getFertilizerCost('SyntheticStandard');
        expect(premium).toBe(300);
        expect(premium / getFertilizerCost('SyntheticStandard')).toBeCloseTo(0.6, 10);
        // The dominant-strategy regression this guards: a bonus type must not be free.
        for (const type of FERTILIZER_TYPES) {
            if (getFertilizerTypeModifier(type) > 1.0) {
                expect(getFertilizerCost(type)).toBeGreaterThan(getFertilizerCost('SyntheticStandard'));
            }
        }
    });

    it('treats exactly SyntheticStandard and SyntheticIntensive as synthetic', () => {
        expect(isSyntheticFertilizer('SyntheticStandard')).toBe(true);
        expect(isSyntheticFertilizer('SyntheticIntensive')).toBe(true);
        expect(isSyntheticFertilizer('OrganicCompatible')).toBe(false);
        expect(isSyntheticFertilizer('syntheticstandard')).toBe(false); // wire strings are case-sensitive
    });

    it('refuses synthetic types on organic parcels, allows OrganicCompatible everywhere', () => {
        for (const type of FERTILIZER_TYPES) {
            const synthetic = isSyntheticFertilizer(type);
            expect(getFertilizerBlock(type, { organic: true, fertilizedThisSeason: false }))
                .toBe(synthetic ? FERTILIZER_BLOCK_ORGANIC : null);
            expect(getFertilizerBlock(type, { organic: false, fertilizedThisSeason: false })).toBeNull();
        }
    });

    it('refuses every type once the parcel has been fertilized this season', () => {
        for (const type of FERTILIZER_TYPES) {
            expect(getFertilizerBlock(type, { organic: false, fertilizedThisSeason: true })).toBe(FERTILIZER_BLOCK_SEASON);
        }
    });
});
