import { CherryParcel, Infrastructure, SoilType } from '@/declarations/backend.did';

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

// pH modifier
export const getPhModifier = (pH: number): number => {
    if (pH >= 6.0 && pH <= 7.0) return 1.0;
    if (pH >= 5.5 && pH < 6.0) return 0.9;
    if (pH > 7.0 && pH <= 7.5) return 0.9;
    return 0.7;
};

// Infrastructure modifier.
//
// Mirrors `getInfrastructureModifier` in game_logic.mo, including its
// asymmetry: every term is ADDITIVE except GoldenHarvester, which is
// MULTIPLICATIVE (1.05^level). Because the backend folds `+=` and `*=` in
// array iteration order, the result is order-sensitive — so this must iterate
// in the same order rather than, say, summing additive terms first.
// See ECON-PARITY-01 for the underlying backend issue.
export const getInfraModifier = (infrastructure: Infrastructure[]): number => {
    let modifier = 1.0;
    infrastructure.forEach(infra => {
        const type = Object.keys(infra.infraType)[0];
        const level = Number(infra.level);

        switch (type) {
            case 'GoldenHarvester': {
                // Motoko: `var multi = 1.0; for (i in Iter.range(1, level)) { multi *= 1.05 }; modifier *= multi;`
                // Reproduced as a loop (not Math.pow) to match the backend's
                // floating-point accumulation bit for bit.
                let multi = 1.0;
                for (let i = 1; i <= level; i++) multi *= 1.05;
                modifier *= multi;
                break;
            }
            case 'Tractor': modifier += 0.05 * level; break;
            case 'Shaker': modifier += 0.08 * level; break;
            case 'Sprayer': modifier += 0.03 * level; break;
            case 'ColdStorage': modifier += 0.02 * level; break;
        }
    });
    return modifier;
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
    labor: any = null
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

    const totalYieldTons =
        baseYield * soilMod * phMod * fertilityMod * infraMod * waterMod * organicMod * ageMod * countyMod;

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
        weatherMod,
        laborMod,
        totalYield: totalYieldKg,
        parcelYield,
        adjustedYield
    };
};
