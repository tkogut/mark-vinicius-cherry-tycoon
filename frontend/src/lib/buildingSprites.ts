// Building-sprite resolution, shared by the Marketplace and (plan 09-09) the orchard.
// Kept free of JSX on purpose: no module in lib/ contains any, and the orchard needs the
// path without the Marketplace's <img> wrapper. The component is components/farm/BuildingSprite.tsx.

// Building types with a seasonal raster sprite set — extracted+cleaned from
// AI-generated reference sheets (see tmp/extracted-buildings/), one per
// season, transparent background, served from
// frontend/public/assets/buildings/<folder>/<season>.png.
//
// Cold Storage and Warehouse have TWO art sets (an "l1" and a visibly bigger,
// more detailed "l2"/upgraded set) — real Infrastructure.level is 1-5, but we
// only have art for two tiers so far, so level >= 2 shows the l2 set and
// everything else (including not-yet-purchased, level 0) shows l1. Processing
// Plant and Social Facilities only have one art set so far; adding an l2 set
// later just means adding a second entry to LEVELED_BUILDING_FOLDERS below.
export type BuildingSpriteType = 'coldStorage' | 'warehouse' | 'processingPlant' | 'socialFacilities';

export const LEVELED_BUILDING_FOLDERS: Partial<Record<BuildingSpriteType, { l1: string; l2: string }>> = {
    coldStorage: { l1: 'cold-storage-l1', l2: 'cold-storage-l2' },
    warehouse: { l1: 'warehouse-l1', l2: 'warehouse-l2' },
};
export const SINGLE_TIER_BUILDING_FOLDERS: Partial<Record<BuildingSpriteType, string>> = {
    processingPlant: 'processing-plant',
    socialFacilities: 'social-facilities',
};

export function buildingSpriteFolder(buildingType: BuildingSpriteType, level: number): string {
    const leveled = LEVELED_BUILDING_FOLDERS[buildingType];
    if (leveled) return level >= 2 ? leveled.l2 : leveled.l1;
    return SINGLE_TIER_BUILDING_FOLDERS[buildingType] ?? '';
}

export const BUILDING_SPRITE_SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
export type BuildingSpriteSeason = typeof BUILDING_SPRITE_SEASONS[number];

/** Extracts the season key ("Spring"/"Summer"/...) from a backend season variant object like `{ Spring: null }`, lowercased to match the sprite filenames. Falls back to 'spring' if unrecognized. */
export function seasonKeyFromBackend(season: unknown): BuildingSpriteSeason {
    const raw = season && typeof season === 'object' ? Object.keys(season)[0] : season;
    const lower = String(raw || '').toLowerCase();
    return (BUILDING_SPRITE_SEASONS as readonly string[]).includes(lower) ? (lower as BuildingSpriteSeason) : 'spring';
}

/** Public path of the sprite for a building at a level in a season. The one place the path is built; the Marketplace card and (09-09) the orchard both call it. */
export function buildingSpriteSrc(buildingType: BuildingSpriteType, season: unknown, level: number): string {
    return `/assets/buildings/${buildingSpriteFolder(buildingType, level)}/${seasonKeyFromBackend(season)}.png`;
}
