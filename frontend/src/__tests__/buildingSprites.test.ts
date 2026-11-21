// UX-09 / plan 09-06: building-sprite resolution lives in exactly one module
// (`lib/buildingSprites.ts`). The Marketplace uses it today; the orchard will
// (09-09). These tests pin (a) that the extraction changed no path, against an
// independent table written out by hand, (b) that every path the resolver can
// emit has a file behind it, and (c) that there is only one definition.
//
// @vitest-environment node

import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import {
    BUILDING_SPRITE_SEASONS,
    buildingSpriteFolder,
    buildingSpriteSrc,
    seasonKeyFromBackend,
    type BuildingSpriteType,
} from '@/lib/buildingSprites';

const TYPES: BuildingSpriteType[] = ['coldStorage', 'warehouse', 'processingPlant', 'socialFacilities'];
const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
const LEVELS = [0, 1, 2, 3, 4, 5];

// Independent oracle: what the Marketplace resolved before the extraction,
// written out as a table, not as a second copy of the lookup code.
const EXPECTED_FOLDER: Record<BuildingSpriteType, { low: string; high: string }> = {
    coldStorage: { low: 'cold-storage-l1', high: 'cold-storage-l2' },
    warehouse: { low: 'warehouse-l1', high: 'warehouse-l2' },
    processingPlant: { low: 'processing-plant', high: 'processing-plant' },
    socialFacilities: { low: 'social-facilities', high: 'social-facilities' },
};

describe('buildingSprites resolver (UX-09)', () => {
    it('matrix: 4 types x 4 seasons x levels 0-5 (96 cases) resolve to the pre-extraction path', () => {
        let n = 0;
        for (const type of TYPES) {
            for (const season of SEASONS) {
                for (const level of LEVELS) {
                    const folder = level >= 2 ? EXPECTED_FOLDER[type].high : EXPECTED_FOLDER[type].low;
                    expect(buildingSpriteSrc(type, { [season[0].toUpperCase() + season.slice(1)]: null }, level))
                        .toBe(`/assets/buildings/${folder}/${season}.png`);
                    n++;
                }
            }
        }
        expect(n).toBe(96);
    });

    it('tier thresholds: leveled buildings switch at level 2, single-tier ones never', () => {
        expect(buildingSpriteFolder('coldStorage', 0)).toBe('cold-storage-l1');
        expect(buildingSpriteFolder('coldStorage', 1)).toBe('cold-storage-l1');
        for (const l of [2, 3, 4, 5]) {
            expect(buildingSpriteFolder('coldStorage', l)).toBe('cold-storage-l2');
            expect(buildingSpriteFolder('warehouse', l)).toBe('warehouse-l2');
        }
        for (const l of LEVELS) {
            expect(buildingSpriteFolder('processingPlant', l)).toBe('processing-plant');
            expect(buildingSpriteFolder('socialFacilities', l)).toBe('social-facilities');
        }
    });

    it('season fallback: unrecognised, empty, null and undefined resolve to spring', () => {
        expect(seasonKeyFromBackend({ Monsoon: null })).toBe('spring');
        expect(seasonKeyFromBackend({})).toBe('spring');
        expect(seasonKeyFromBackend(null)).toBe('spring');
        expect(seasonKeyFromBackend(undefined)).toBe('spring');
    });

    it('backend variant shape: { Autumn: null } resolves to "autumn"', () => {
        expect(seasonKeyFromBackend({ Autumn: null })).toBe('autumn');
        expect(seasonKeyFromBackend({ Winter: null })).toBe('winter');
    });

    it('season fallback applies to the full path as well', () => {
        expect(buildingSpriteSrc('warehouse', { Monsoon: null }, 3)).toBe('/assets/buildings/warehouse-l2/spring.png');
    });
});

// ---- single definition + asset integrity ---------------------------------

const SRC = resolve(__dirname, '..');
const PUBLIC_BUILDINGS = resolve(__dirname, '../../public/assets/buildings');

function walk(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p, out);
        else if (/\.(ts|tsx)$/.test(name)) out.push(p);
    }
    return out;
}

describe('buildingSprites single definition', () => {
    it('the folder maps are declared in exactly one file', () => {
        const declaring = walk(SRC)
            .filter((f) => !f.includes('__tests__'))
            .filter((f) => /const\s+(LEVELED_BUILDING_FOLDERS|SINGLE_TIER_BUILDING_FOLDERS)\b/.test(readFileSync(f, 'utf8')));
        expect(declaring.map((f) => f.replace(SRC, ''))).toEqual(['/lib/buildingSprites.ts']);
    });
});

describe('buildingSprites asset integrity', () => {
    const reachable = new Set<string>();
    for (const type of TYPES) {
        for (const season of SEASONS) {
            for (const level of LEVELS) {
                reachable.add(buildingSpriteSrc(type, { [season[0].toUpperCase() + season.slice(1)]: null }, level));
            }
        }
    }

    it('the matrix has at least 24 distinct paths (6 folders x 4 seasons)', () => {
        expect(reachable.size).toBeGreaterThanOrEqual(24);
        expect(BUILDING_SPRITE_SEASONS.length).toBe(4);
    });

    it('every reachable path is a file under frontend/public', () => {
        const publicRoot = resolve(__dirname, '../../public');
        const missing = [...reachable].filter((p) => !existsSync(join(publicRoot, p)));
        expect(missing).toEqual([]);
    });

    it('no sprite folder on disk is unreachable by the resolver', () => {
        const reachableFolders = new Set([...reachable].map((p) => p.split('/')[3]));
        const onDisk = readdirSync(PUBLIC_BUILDINGS).filter((n) => statSync(join(PUBLIC_BUILDINGS, n)).isDirectory());
        const orphans = onDisk.filter((f) => !reachableFolders.has(f));
        expect(orphans).toEqual([]);
    });
});
