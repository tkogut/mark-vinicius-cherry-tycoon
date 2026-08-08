// Regression guard for the sector layout and the inter-sector bridges.
//
// Two bugs are locked down here:
//  1. The bridge VISUAL and the NPC's onBridge interpolation were computed
//     independently. The visual was a short horizontal bar at the exit tile's y;
//     the NPCs interpolated over the real diagonal between the two edge tile
//     centres. Both now derive from getBridgeGeometry.
//  2. Parcels used to be laid out as one ever-widening horizontal row. They now
//     tile the isometric plane as diamonds (up-right / down-right), so sector
//     INDEX adjacency is no longer spatial adjacency — parcels 0 and 3 sit
//     diagonally and share no edge, therefore have no bridge.

import { describe, it, expect } from 'vitest';
import {
    getBridgeGeometry,
    areSectorsAdjacent,
    sectorCell,
    sectorOrigin,
    BRIDGE_ROW,
    BRIDGE_COL,
    BRIDGE_LANE,
    BRIDGE_DECK,
    BRIDGE_SEAT,
    TILE_EDGE,
} from '../components/farm/ImperialOrchard';

const SECTOR_STEP_X = 276; // (5*96 + 72) / 2
const SECTOR_STEP_Y = 138; // half of STEP_X, keeping the 2:1 isometric ratio

/** Mirrors how the render interpolates an NPC across a bridge. */
const npcAt = (fromSector: number, toSector: number, progress: number) => {
    const span = getBridgeGeometry(fromSector, toSector)!;
    return {
        x: span.from.x + (span.to.x - span.from.x) * progress,
        y: span.from.y + (span.to.y - span.from.y) * progress,
    };
};

describe('sector layout', () => {
    it('places the first four parcels as first / up-right / down-right / right', () => {
        expect(sectorCell(0)).toEqual({ u: 0, v: 0 });
        expect(sectorCell(1)).toEqual({ u: 1, v: 0 });
        expect(sectorCell(2)).toEqual({ u: 0, v: 1 });
        expect(sectorCell(3)).toEqual({ u: 1, v: 1 });

        expect(sectorOrigin(0)).toEqual({ x: 0, y: 0 });
        expect(sectorOrigin(1)).toEqual({ x: SECTOR_STEP_X, y: -SECTOR_STEP_Y }); // up-right
        expect(sectorOrigin(2)).toEqual({ x: SECTOR_STEP_X, y: SECTOR_STEP_Y });  // down-right
        expect(sectorOrigin(3)).toEqual({ x: 2 * SECTOR_STEP_X, y: 0 });          // right
    });

    it('never moves an existing parcel when a new one is added', () => {
        // Shells are filled in a fixed order, so cell(i) cannot depend on the total.
        const snapshot = Array.from({ length: 12 }, (_, i) => sectorCell(i));
        for (let i = 0; i < snapshot.length; i++) {
            expect(sectorCell(i)).toEqual(snapshot[i]);
        }
    });

    it('fills each shell completely before starting the next', () => {
        // Shell k has 2k+1 cells and covers indices k^2 .. (k+1)^2 - 1.
        for (let k = 0; k < 4; k++) {
            for (let i = k * k; i < (k + 1) * (k + 1); i++) {
                const { u, v } = sectorCell(i);
                expect(Math.max(u, v)).toBe(k);
            }
        }
    });

    it('gives every parcel a distinct cell', () => {
        const seen = new Set(Array.from({ length: 25 }, (_, i) => {
            const c = sectorCell(i);
            return `${c.u},${c.v}`;
        }));
        expect(seen.size).toBe(25);
    });
});

describe('inter-sector bridges', () => {
    it('exists only between parcels that share an edge', () => {
        expect(areSectorsAdjacent(0, 1)).toBe(true);  // up-right neighbour
        expect(areSectorsAdjacent(0, 2)).toBe(true);  // down-right neighbour
        expect(areSectorsAdjacent(1, 3)).toBe(true);
        expect(areSectorsAdjacent(2, 3)).toBe(true);
        // 0 and 3 are diagonal: two steps apart, no shared edge, so no bridge.
        expect(areSectorsAdjacent(0, 3)).toBe(false);
        expect(getBridgeGeometry(0, 3)).toBeNull();
    });

    it('crosses at the middle tile of the shared edge', () => {
        // Anchored on the middle TILE's centre. It briefly sat on the alley at 1.5
        // to satisfy review arrows that were in fact compensating for a transform
        // -order bug displacing the deck half a tile (fixed in 963cd2c).
        expect(BRIDGE_LANE).toBe(2);
        expect(Number.isInteger(BRIDGE_LANE)).toBe(true);

        // Down-right neighbour: leave through the last column, arrive at the first,
        // with the lane indexing the ROW.
        const dr = getBridgeGeometry(0, 2)!;
        expect(dr.exitTile).toEqual({ r: BRIDGE_LANE, c: 4 });
        expect(dr.entryTile).toEqual({ r: BRIDGE_LANE, c: 0 });
        // Up-right neighbour: leave through the first row, arrive at the last,
        // with the lane indexing the COLUMN.
        const ur = getBridgeGeometry(0, 1)!;
        expect(ur.exitTile).toEqual({ r: 0, c: BRIDGE_LANE });
        expect(ur.entryTile).toEqual({ r: 4, c: BRIDGE_LANE });
    });

    it('anchors the crossing on the sector middle, not offset from it', () => {
        const dr = getBridgeGeometry(0, 2)!;
        expect(BRIDGE_ROW - BRIDGE_LANE).toBe(0);
        expect(dr.exitTile.r).toBe(BRIDGE_ROW);
    });

    it('centres the deck on the gap between the two platforms', () => {
        // Platform edges along a v-crossing sit at col 4.5 and col -0.5; the deck's
        // midpoint must be the midpoint of those two, i.e. the middle of the gap.
        const s = getBridgeGeometry(0, 2)!;
        const edgeA = { x: 360, y: 180 };  // projectToIso(2, 4.5, 0)
        const edgeB = { x: 396, y: 198 };  // projectToIso(2, -0.5, 2)
        expect(s.midX).toBeCloseTo((edgeA.x + edgeB.x) / 2, 6);
        expect(s.midY).toBeCloseTo((edgeA.y + edgeB.y) / 2, 6);
    });

    it('spans a real diagonal, not a short horizontal bar', () => {
        for (const [a, b] of [[0, 1], [0, 2], [1, 3], [2, 3]]) {
            const span = getBridgeGeometry(a, b)!;
            expect(span.length).toBeGreaterThan(0);
            expect(Math.abs(span.angleDeg)).toBeGreaterThan(10);
        }
    });

    it('places the plank exactly where the NPC walks', () => {
        for (const [a, b] of [[0, 1], [0, 2], [1, 3], [2, 3]]) {
            const span = getBridgeGeometry(a, b)!;
            expect(npcAt(a, b, 0)).toEqual(span.from);
            expect(npcAt(a, b, 1)).toEqual(span.to);
            const mid = npcAt(a, b, 0.5);
            expect(span.midX).toBeCloseTo(mid.x, 6);
            expect(span.midY).toBeCloseTo(mid.y, 6);
        }
    });

    it('is the same segment travelled backwards', () => {
        const forward = getBridgeGeometry(0, 2)!;
        const backward = getBridgeGeometry(2, 0)!;
        expect(backward.from).toEqual(forward.to);
        expect(backward.to).toEqual(forward.from);
        expect(backward.length).toBeCloseTo(forward.length, 6);
        expect(backward.midX).toBeCloseTo(forward.midX, 6);
        expect(backward.midY).toBeCloseTo(forward.midY, 6);
    });

    it('uses the middle of the sector for every crossing', () => {
        expect(BRIDGE_ROW).toBe(2);
        expect(BRIDGE_COL).toBe(2);
        expect(BRIDGE_LANE).toBe(BRIDGE_ROW);
    });
});

describe('bridge deck proportions', () => {
    it('is drawn shorter than the crossing, trimming the half-tile overhang', () => {
        const span = getBridgeGeometry(0, 2)!;
        // The crossing runs lane-point to lane-point, half a tile inside each field.
        expect(span.length).toBeCloseTo(93.915, 2);
        // The deck drops that overhang and seats a quarter tile onto each field, so
        // it just meets both parcels instead of lying half a tile over each.
        expect(span.deckLength).toBeCloseTo(span.length - TILE_EDGE + 2 * BRIDGE_SEAT, 6);
        expect(span.deckLength).toBeLessThan(span.length);
        expect(span.deckLength).toBeGreaterThan(span.length - TILE_EDGE); // still reaches past the bare gap
    });

    it('keeps the deck centred on the gap after trimming', () => {
        // Both ends are trimmed equally, so the centre is untouched and no separate
        // offset is needed.
        for (const [a, b] of [[0, 1], [0, 2], [1, 3], [2, 3]]) {
            const s = getBridgeGeometry(a, b)!;
            expect(s.midX).toBeCloseTo((s.from.x + s.to.x) / 2, 6);
            expect(s.midY).toBeCloseTo((s.from.y + s.to.y) / 2, 6);
        }
    });

    it('is thinner than a tile so the sheared deck reads as a plank', () => {
        expect(BRIDGE_DECK).toBeLessThan(TILE_EDGE);
        expect(BRIDGE_DECK).toBe(24);
    });
});
