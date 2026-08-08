// Deterministic input vectors for the economy parity suite (QUAL-05).
//
// Lives under `src/` for the same reason as `providers.tsx`: tsconfig's
// `include` is `["src"]`, so `npm run build` typechecks these against the real
// generated Candid types. If `CherryParcel` / `Infrastructure` gain or lose a
// field, this file fails to compile — which is the point. A fixture that drifts
// silently from the backend types is worse than no fixture.

import type {
    CherryParcel,
    Infrastructure,
    InfrastructureType,
    Region,
    SoilType,
} from '@/declarations/backend.did';

/** The three counties that carry a yield bonus in game_logic.mo, plus a control. */
export const BONUS_COUNTIES = ['Głubczyce', 'Opole', 'Namysłów'] as const;
export const CONTROL_COUNTY = 'Nyski';

export function makeRegion(county: string): Region {
    return {
        commune: 'Testowa',
        communeType: { Rural: null },
        county,
        laborCostMultiplier: 1.0,
        marketSize: 0.8,
        population: 50_000n,
        province: { Opolskie: null },
    };
}

export interface ParcelOverrides {
    soilType?: SoilType;
    pH?: number;
    fertility?: number;
    waterLevel?: number;
    isOrganic?: boolean;
    treeAge?: bigint;
    size?: number;
    county?: string;
}

/**
 * A parcel with neutral, bonus-free defaults: every modifier sits at 1.0 so a
 * single override isolates exactly one term of the yield formula.
 */
export function makeParcel(overrides: ParcelOverrides = {}): CherryParcel {
    return {
        id: 'parity-parcel',
        ownerId: 'parity-owner',
        region: makeRegion(overrides.county ?? CONTROL_COUNTY),
        soilType: overrides.soilType ?? { SandyClay: null }, // 1.0
        pH: overrides.pH ?? 6.5,                             // 1.0
        fertility: overrides.fertility ?? 1.0,               // 1.0
        waterLevel: overrides.waterLevel ?? 0.5,             // 1.0
        isOrganic: overrides.isOrganic ?? false,             // 1.0
        treeAge: overrides.treeAge ?? 10n,                   // 1.0 (peak)
        size: overrides.size ?? 1.0,
        humidity: 0.5,
        permeability: 0.5,
        plantedTrees: 400n,
        quality: 80n,
        lastFertilized: 0n,
        lastHarvest: 0n,
        organicCertified: false,
        organicConversionSeason: 0n,
    };
}

export function makeInfra(type: InfrastructureType, level: number): Infrastructure {
    return {
        infraType: type,
        level: BigInt(level),
        purchasedSeason: 1n,
        maintenanceCost: 0n,
    };
}

export const ALL_SOIL_TYPES: SoilType[] = [
    { SandyClay: null },
    { Clay: null },
    { Sandy: null },
    { Waterlogged: null },
];

/**
 * Cases chosen to hit every branch of every modifier in
 * `GameLogic.calculateYieldPotential`, including the boundary values where the
 * Motoko comparisons flip (`>= 6.0`, `<= 7.0`, `< 0.3`, `> 0.8`, `treeAge > 40`).
 */
export interface ParityCase {
    name: string;
    parcel: CherryParcel;
    infrastructure: Infrastructure[];
}

export const PARITY_CASES: ParityCase[] = [
    // ── baseline ──────────────────────────────────────────────────────────
    { name: 'neutral baseline', parcel: makeParcel(), infrastructure: [] },

    // ── soil ──────────────────────────────────────────────────────────────
    ...ALL_SOIL_TYPES.map((soilType, i) => ({
        name: `soil ${Object.keys(soilType)[0]}`,
        parcel: makeParcel({ soilType }),
        infrastructure: [] as Infrastructure[],
        _i: i,
    })).map(({ name, parcel, infrastructure }) => ({ name, parcel, infrastructure })),

    // ── pH bands, including boundaries ────────────────────────────────────
    ...[5.0, 5.5, 5.9, 6.0, 6.5, 7.0, 7.1, 7.5, 8.0].map((pH) => ({
        name: `pH ${pH}`,
        parcel: makeParcel({ pH }),
        infrastructure: [] as Infrastructure[],
    })),

    // ── water bands, including boundaries ─────────────────────────────────
    ...[0.0, 0.29, 0.3, 0.5, 0.8, 0.81, 1.0].map((waterLevel) => ({
        name: `water ${waterLevel}`,
        parcel: makeParcel({ waterLevel }),
        infrastructure: [] as Infrastructure[],
    })),

    // ── tree age, including the "dead" boundary ───────────────────────────
    ...[0n, 1n, 2n, 3n, 20n, 40n, 41n, 99n].map((treeAge) => ({
        name: `treeAge ${treeAge}`,
        parcel: makeParcel({ treeAge }),
        infrastructure: [] as Infrastructure[],
    })),

    // ── fertility / organic / size ────────────────────────────────────────
    ...[0.0, 0.25, 0.5, 0.75, 1.0].map((fertility) => ({
        name: `fertility ${fertility}`,
        parcel: makeParcel({ fertility }),
        infrastructure: [] as Infrastructure[],
    })),
    { name: 'organic', parcel: makeParcel({ isOrganic: true }), infrastructure: [] },
    ...[0.25, 0.5, 1.0, 2.5, 10.0].map((size) => ({
        name: `size ${size}`,
        parcel: makeParcel({ size }),
        infrastructure: [] as Infrastructure[],
    })),

    // ── county bonus (Phase 5.1 "Opole DNA") ──────────────────────────────
    ...[...BONUS_COUNTIES, CONTROL_COUNTY, 'Brzeski'].map((county) => ({
        name: `county ${county}`,
        parcel: makeParcel({ county }),
        infrastructure: [] as Infrastructure[],
    })),

    // ── infrastructure, additive terms ────────────────────────────────────
    { name: 'Tractor L1', parcel: makeParcel(), infrastructure: [makeInfra({ Tractor: null }, 1)] },
    { name: 'Tractor L5', parcel: makeParcel(), infrastructure: [makeInfra({ Tractor: null }, 5)] },
    { name: 'Shaker L3', parcel: makeParcel(), infrastructure: [makeInfra({ Shaker: null }, 3)] },
    { name: 'Sprayer L2', parcel: makeParcel(), infrastructure: [makeInfra({ Sprayer: null }, 2)] },
    { name: 'ColdStorage L4', parcel: makeParcel(), infrastructure: [makeInfra({ ColdStorage: null }, 4)] },

    // Yield-neutral infra: must NOT move the number (falls into Motoko's `case (_)`).
    { name: 'Warehouse L3 (yield-neutral)', parcel: makeParcel(), infrastructure: [makeInfra({ Warehouse: null }, 3)] },
    { name: 'Pruner L2 (yield-neutral)', parcel: makeParcel(), infrastructure: [makeInfra({ Pruner: null }, 2)] },
    { name: 'ProcessingFacility L1 (yield-neutral)', parcel: makeParcel(), infrastructure: [makeInfra({ ProcessingFacility: null }, 1)] },
    { name: 'SocialFacilities L1 (yield-neutral)', parcel: makeParcel(), infrastructure: [makeInfra({ SocialFacilities: null }, 1)] },

    // ── GoldenHarvester: the only MULTIPLICATIVE term (1.05^level) ────────
    { name: 'GoldenHarvester L1', parcel: makeParcel(), infrastructure: [makeInfra({ GoldenHarvester: null }, 1)] },
    { name: 'GoldenHarvester L5', parcel: makeParcel(), infrastructure: [makeInfra({ GoldenHarvester: null }, 5)] },

    // Mixed additive + multiplicative, in BOTH array orders. Motoko folds
    // `+=` and `*=` in array order, so these two cases are NOT expected to be
    // equal to each other — they pin down that order-sensitivity explicitly.
    {
        name: 'GoldenHarvester L2 then Tractor L3',
        parcel: makeParcel(),
        infrastructure: [makeInfra({ GoldenHarvester: null }, 2), makeInfra({ Tractor: null }, 3)],
    },
    {
        name: 'Tractor L3 then GoldenHarvester L2',
        parcel: makeParcel(),
        infrastructure: [makeInfra({ Tractor: null }, 3), makeInfra({ GoldenHarvester: null }, 2)],
    },

    // ── combined realistic loadout ────────────────────────────────────────
    {
        name: 'realistic: Głubczyce, clay, organic, full kit',
        parcel: makeParcel({
            county: 'Głubczyce',
            soilType: { Clay: null },
            pH: 6.2,
            fertility: 0.75,
            waterLevel: 0.6,
            isOrganic: true,
            treeAge: 12n,
            size: 2.5,
        }),
        infrastructure: [
            makeInfra({ Tractor: null }, 2),
            makeInfra({ Shaker: null }, 1),
            makeInfra({ Sprayer: null }, 3),
            makeInfra({ ColdStorage: null }, 1),
            makeInfra({ GoldenHarvester: null }, 3),
        ],
    },
];
