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

// Infrastructure modifier
export const getInfraModifier = (infrastructure: Infrastructure[]): number => {
    let modifier = 1.0;
    infrastructure.forEach(infra => {
        const type = Object.keys(infra.infraType)[0];
        const level = Number(infra.level);

        switch (type) {
            case 'Tractor': modifier += 0.05 * level; break;
            case 'Shaker': modifier += 0.08 * level; break;
            case 'Sprayer': modifier += 0.03 * level; break;
            case 'ColdStorage': modifier += 0.02 * level; break;
        }
    });
    return modifier;
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

/**
 * Calculates the full yield breakdown for a parcel.
 */
export const calculateYieldBreakdown = (
    parcel: CherryParcel,
    infrastructure: Infrastructure[] = []
): YieldBreakdown => {
    const baseYield = 25.0; // tons/ha
    const soilMod = getSoilModifier(parcel.soilType);
    const phMod = getPhModifier(parcel.pH);
    const fertilityMod = parcel.fertility;
    const infraMod = getInfraModifier(infrastructure);
    const waterMod = getWaterModifier(parcel.waterLevel);
    const organicMod = getOrganicModifier(parcel.isOrganic);
    const ageMod = getAgeModifier(parcel.treeAge);

    const totalYieldTons = baseYield * soilMod * phMod * fertilityMod * infraMod * waterMod * organicMod * ageMod;
    const totalYieldKg = totalYieldTons * 1000;
    const parcelYield = totalYieldKg * parcel.size;

    return {
        baseYield,
        soilMod,
        phMod,
        fertilityMod,
        infraMod,
        waterMod,
        organicMod,
        ageMod,
        totalYield: totalYieldKg,
        parcelYield
    };
};
