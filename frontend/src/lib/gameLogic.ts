import { CherryParcel, Infrastructure, SoilType, Season } from '@/declarations/backend.did';

/**
 * Frontend mirror of backend game_logic.mo yield calculations.
 * Used for displaying tooltips and UI stats without redundant network calls.
 */

export interface YieldBreakdown {
    baseYield: number;
    soilMod: number;
    phMod: number;
    fertilityMod: number;
    infraMod: number;
    waterMod: number;
    organicMod: number;
    ageMod: number;
    countyMod: number;
    fertilizerTypeMod: number;
    totalYield: number; // kg per hectare
    parcelYield: number; // total kg for the parcel
}

// Tree age modifier
export const getAgeModifier = (treeAge: bigint): number => {
    const age = Number(treeAge);
    if (age === 0) return 0.0;
    if (age === 1) return 0.33;
    if (age === 2) return 0.66;
    if (age >= 3 && age <= 40) return 1.0;
    return 0.0; // Trees too old
};

// Soil type modifier
export const getSoilModifier = (soilType: SoilType): number => {
    if ('SandyClay' in soilType) return 1.0;
    if ('Clay' in soilType) return 0.9;
    if ('Sandy' in soilType) return 0.85;
    if ('Waterlogged' in soilType) return 0.6;
    return 1.0;
};

// Season sale multiplier (ECON-02, D-03).
//
// Mirrors `GameLogic.getSeasonSaleMultiplier` in game_logic.mo. Consumed by
// `SellModal.tsx`'s sale preview so the number the player reads before
// confirming a sale is the same function `economyParity.test.ts` pins
// against the Motoko transcription, not a fourth independent copy.
export const getSeasonSaleMultiplier = (season: Season): number => {
    if ('Spring' in season) return 0.9;
    if ('Summer' in season) return 1.15;
    if ('Autumn' in season) return 1.0;
    if ('Winter' in season) return 0.75;
    return 1.0;
};

// pH modifier
export const getPhModifier = (pH: number): number => {
    if (pH >= 6.0 && pH <= 7.0) return 1.0;
    if (pH >= 5.5 && pH < 6.0) return 0.9;
    if (pH > 7.0 && pH <= 7.5) return 0.9;
    return 0.7;
};

// Infrastructure modifier.
//
// Mirrors `getInfrastructureModifier` in game_logic.mo (ECON-PARITY-01): the
// additive terms (Tractor, Shaker, Sprayer, ColdStorage) are summed onto 1.0
// first, then the finished sum is multiplied by GoldenHarvester's compounding
// 1.05^level. The result does not depend on array order.
export const getInfraModifier = (infrastructure: Infrastructure[]): number => {
    let additive = 1.0;
    let multiplier = 1.0;
    infrastructure.forEach(infra => {
        const type = Object.keys(infra.infraType)[0];
        const level = Number(infra.level);

        switch (type) {
            case 'GoldenHarvester': {
                // Loop, not Math.pow, to match the backend's floating-point accumulation.
                let multi = 1.0;
                for (let i = 1; i <= level; i++) multi *= 1.05;
                multiplier *= multi;
                break;
            }
            case 'Tractor': additive += 0.05 * level; break;
            case 'Shaker': additive += 0.08 * level; break;
            case 'Sprayer': additive += 0.03 * level; break;
            case 'ColdStorage': additive += 0.02 * level; break;
        }
    });
    return additive * multiplier;
};

// ── Infrastructure upkeep & wear (MAINT-01) ─────────────────────────────────
// Mirrors game_logic.mo's getInfrastructureCost / getMaintenancePercentage /
// getMaintenanceCost / degradeMaintenance / getRepairCost. Enforced by
// economyParity.test.ts — the UI shows the player how far their upkeep has
// drifted from spec and what a repair costs, so these must not drift.

/** Purchase price per infrastructure type (game_logic.mo getInfrastructureCost). */
export const INFRA_BASE_COST: Record<string, number> = {
    SocialFacilities: 15_000,
    Warehouse: 25_000,
    ColdStorage: 40_000,
    Tractor: 30_000,
    GoldenHarvester: 0, // cost handled manually in upgrade_golden_harvester
    Shaker: 60_000,
    Sprayer: 12_000,
    ProcessingFacility: 100_000,
    Pruner: 18_000,
};

/** Machinery pays 2% of purchase price in upkeep, buildings 1%. */
export const getMaintenancePercentage = (infraTypeKey: string): number => {
    switch (infraTypeKey) {
        case 'GoldenHarvester':
        case 'Tractor':
        case 'Shaker':
        case 'Sprayer':
        case 'Pruner':
            return 2;
        default:
            return 1;
    }
};

/** Canonical "as new" annual upkeep for one asset type. Integer division, like Motoko's Nat. */
export const getMaintenanceCost = (infraTypeKey: string): number =>
    Math.floor((INFRA_BASE_COST[infraTypeKey] ?? 0) * getMaintenancePercentage(infraTypeKey) / 100);

/** Upkeep may never drift above 2x spec. */
export const getMaintenanceCap = (infraTypeKey: string): number => getMaintenanceCost(infraTypeKey) * 2;

/** One season of wear: +10% of spec (min 1), clamped to the cap. */
export const degradeMaintenance = (infraTypeKey: string, currentMaintenanceCost: number): number => {
    const spec = getMaintenanceCost(infraTypeKey);
    const cap = spec * 2;
    const step = Math.floor(spec / 10) === 0 ? 1 : Math.floor(spec / 10);
    const next = currentMaintenanceCost + step;
    return next > cap ? cap : next;
};

/**
 * How far one asset's upkeep has drifted above spec. Saturating — an asset
 * below spec (a leftover of the pre-MAINT-01 `level * 100` bug) reports 0.
 */
export const getMaintenanceExcess = (infraTypeKey: string, currentMaintenanceCost: number): number =>
    Math.max(0, currentMaintenanceCost - getMaintenanceCost(infraTypeKey));

/**
 * What `inspectAndRepair` charges: half the accumulated wear, over the assets
 * that have any (MAINT-02). Assets already at spec are skipped, so a repair
 * with nothing to repair costs nothing. Per asset the charge is
 * `max(1, excess / 2)` so a 1 PLN drift is not free to fix.
 */
export const getRepairCost = (infrastructure: Infrastructure[]): number => {
    let total = 0;
    infrastructure.forEach(infra => {
        const key = Object.keys(infra.infraType)[0];
        const excess = getMaintenanceExcess(key, Number(infra.maintenanceCost));
        if (excess > 0) {
            total += Math.max(1, Math.floor(excess / 2));
        }
    });
    return total;
};

/**
 * How far the player's upkeep has drifted above spec — the number that makes
 * "should I pay for a repair?" an informed decision rather than a guess.
 */
export const getUpkeepDrift = (infrastructure: Infrastructure[]): {
    current: number;
    spec: number;
    excess: number;
    repairCost: number;
    worthRepairing: boolean;
} => {
    let current = 0;
    let spec = 0;
    infrastructure.forEach(infra => {
        const key = Object.keys(infra.infraType)[0];
        current += Number(infra.maintenanceCost);
        spec += getMaintenanceCost(key);
    });
    const excess = Math.max(0, current - spec);
    const repairCost = getRepairCost(infrastructure);
    // `current`/`spec` are annual figures; main.mo charges (fixed + variable) / 4
    // per season advance, so the excess is felt as excess/4 each season.
    // Repairing pays for itself within a year exactly when the annual excess
    // exceeds the one-off repair cost. Since MAINT-02 priced the repair at half
    // the excess, that is true for every worn asset — which is the point of the
    // change. The flag stays computed rather than hardcoded so the UI keeps
    // telling the truth if the ratio is ever retuned.
    return { current, spec, excess, repairCost, worthRepairing: excess > repairCost };
};

// ============================================================================
// SPORTS PATRON (SPORTS-01/02/03)
// ============================================================================

/**
 * Cost of `percent` percent of a club. Mirrors `SportsLogic.getSharePrice`:
 * integer division, with a floor of 1 PLN per percent so truncation can never
 * make a stake free. The UI must quote the same number the canister will
 * charge, or the player sees a price change at the moment of purchase.
 */
export const getClubSharePrice = (marketValue: number, percent: number): number => {
    const price = Math.floor((marketValue * percent) / 100);
    return price === 0 && percent > 0 ? percent : price;
};

/** Display names for `Types.League`. See SPORTS-04 for why the variant is misnamed. */
export const LEAGUE_LABELS: Record<string, string> = {
    Liga3: 'Klasa Okręgowa',
    Liga4: 'Klasa A',
};

// Fertilizer-type yield modifier (ECON-01, D-01, plan 03-06).
//
// Mirrors `GameLogic.getFertilizerTypeModifier` in game_logic.mo. Only
// Synthetic-Intensive carries a yield effect (+5%); the other two canonical
// types, and any unrecognized string, are yield-neutral. Wire strings are
// exact and case-sensitive — no hyphenation on the wire; hyphenated forms are
// display labels only (plan 03-07's picker).
export const FERTILIZER_TYPES = ['OrganicCompatible', 'SyntheticStandard', 'SyntheticIntensive'] as const;
export type FertilizerType = typeof FERTILIZER_TYPES[number];

export const getFertilizerTypeModifier = (fertilizerType: string): number => {
    if (fertilizerType === 'SyntheticIntensive') return 1.05;
    return 1.0;
};

// County yield multiplier — Phase 5.1 "Opole DNA" (GDD §3.1).
// Mirrors the `countyMod` switch inside game_logic.mo's calculateYieldPotential.
export const getCountyModifier = (county: string): number => {
    switch (county) {
        case 'Głubczyce': return 1.10; // optimal sandy-clay cherry belt
        case 'Opole': return 1.08;     // strong infrastructure, good soil
        case 'Namysłów': return 1.05;  // good conditions, slightly cooler
        default: return 1.0;
    }
};

// Water level modifier
export const getWaterModifier = (waterLevel: number): number => {
    if (waterLevel < 0.3) return 0.7;
    if (waterLevel > 0.8) return 0.85;
    return 1.0;
};

// Organic modifier
export const getOrganicModifier = (isOrganic: boolean): number => {
    return isOrganic ? 0.8 : 1.0;
};

// Weather yield impact
export const getWeatherYieldImpact = (weather: any, severity: number): number => {
    if (!weather) return 1.0;
    const type = Object.keys(weather)[0];

    switch (type) {
        case 'Sunny': return 1.0;
        case 'Rainy': return 0.95 - (severity * 0.1);
        case 'Frost': return 0.6 - (severity * 0.3);
        case 'Drought': return 0.7 - (severity * 0.2);
        case 'Heatwave': return 0.8 - (severity * 0.15);
        case 'Flood': return 0.4 - (severity * 0.4);
        case 'PestOutbreak': return 0.8 - (severity * 0.3);
        case 'DiseaseOutbreak': return 0.7 - (severity * 0.25);
        default: return 1.0;
    }
};

// Labor yield multiplier (mirror of hiring_logic.mo)
export const getLaborYieldMultiplier = (labor: any): number => {
    if (!labor) return 0.8; // Fallback to Emergency
    const type = Object.keys(labor)[0];

    switch (type) {
        case 'Village': return 0.9;
        case 'Standard': return 1.0;
        case 'City': return 1.1;
        case 'Emergency': return 0.8;
        default: return 0.8;
    }
};

/**
 * Calculates the full yield breakdown for a parcel.
 */
export const calculateYieldBreakdown = (
    parcel: CherryParcel,
    infrastructure: Infrastructure[] = [],
    weather: any = null,
    labor: any = null,
    fertilizerTypeMod: number = 1.0
): YieldBreakdown & { adjustedYield: number; weatherMod: number; laborMod: number } => {
    const baseYield = 25.0; // tons/ha
    const soilMod = getSoilModifier(parcel.soilType);
    const phMod = getPhModifier(parcel.pH);
    const fertilityMod = Number(parcel.fertility);
    const infraMod = getInfraModifier(infrastructure);
    const waterMod = getWaterModifier(parcel.waterLevel);
    const organicMod = getOrganicModifier(parcel.isOrganic);
    const ageMod = getAgeModifier(parcel.treeAge);
    const countyMod = getCountyModifier(parcel.region.county);

    // fertilizerTypeMod appended at the end of the chain, after countyMod —
    // same position as the Motoko `calculateYieldPotential`. Defaults to 1.0
    // (unfertilized / unknown type), so every existing call site is unchanged.
    const totalYieldTons =
        baseYield * soilMod * phMod * fertilityMod * infraMod * waterMod * organicMod * ageMod * countyMod * fertilizerTypeMod;

    // Per-hectare kg, for display only.
    const totalYieldKg = totalYieldTons * 1000;

    // Motoko computes `(tons * size) * 1000.0`, NOT `(tons * 1000) * size`.
    // f64 multiplication is not associative, so the operand order is kept
    // identical here — otherwise the two can land on either side of an integer
    // boundary once the backend truncates via `Float.toInt`.
    const parcelYield = totalYieldTons * Number(parcel.size) * 1000;

    // Weather and Labor impacts (calculated during harvesting)
    const weatherMod = weather ? getWeatherYieldImpact(weather.weather, weather.severity) : 1.0;
    const laborMod = getLaborYieldMultiplier(labor);
    const adjustedYield = parcelYield * weatherMod * laborMod;

    return {
        baseYield,
        soilMod,
        phMod,
        fertilityMod,
        infraMod,
        waterMod,
        organicMod,
        ageMod,
        countyMod,
        fertilizerTypeMod,
        weatherMod,
        laborMod,
        totalYield: totalYieldKg,
        parcelYield,
        adjustedYield
    };
};

// ---------------------------------------------------------------------------
// Winter spoilage (ECON-05 documented it, ECON-12 extends it to organic stock).
// Mirrors the block in main.mo's season advance, StorageLogic.calculateSpoilage
// and HiringLogic.getHandlingQuality. It fires once a year, entering Winter, and
// hits conventional AND organic cherries at the same rate.
// docs/game-design/economy/spoilage-rates.md has the table.
// ---------------------------------------------------------------------------

/** HiringLogic.getHandlingQuality — unhired defaults to the worst case (70), not neutral. */
const HANDLING_QUALITY: Record<string, number> = { Village: 80, Standard: 100, City: 120, Emergency: 70 };

/** `labor` is the Candid opt: `[]` or `[{ Standard: null }]` (also accepts the bare variant). */
export const getHandlingQuality = (labor: unknown): number => {
    const variant = Array.isArray(labor) ? labor[0] : labor;
    const key = variant && typeof variant === 'object' ? Object.keys(variant)[0] : undefined;
    return (key && HANDLING_QUALITY[key]) || 70;
};

/** Best storage owned: Cold Storage 2%, Warehouse 8%, none 15% — independent of array order. */
export const getSpoilageBaseRate = (infrastructure: Infrastructure[]): number => {
    let baseRate = 15;
    for (const infra of infrastructure) {
        const type = Object.keys(infra.infraType)[0];
        if (type === 'ColdStorage') baseRate = 2;
        else if (type === 'Warehouse' && baseRate > 5) baseRate = 8;
    }
    return baseRate;
};

/** StorageLogic.calculateSpoilage: `baseRate * 100 / handlingQuality`, integer division. */
export const getSpoilagePercent = (infrastructure: Infrastructure[], labor: unknown): number =>
    Math.floor((getSpoilageBaseRate(infrastructure) * 100) / getHandlingQuality(labor));

/** Motoko: `spoiled = kg * rate / 100` (Nat division); stock never goes below zero. */
export const applySpoilage = (kg: bigint, percent: number): bigint => {
    const spoiled = (kg * BigInt(percent)) / 100n;
    return kg >= spoiled ? kg - spoiled : 0n;
};
