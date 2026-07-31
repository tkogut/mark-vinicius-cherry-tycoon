// Regression guard for the inter-sector bridge.
//
// The bug this locks down: the bridge VISUAL and the NPC's onBridge
// interpolation were computed independently. The visual was a 92px horizontal
// bar anchored at the exit tile's y; the NPCs interpolated over the real
// diagonal between the two row-2 edge tile centres. The plank therefore covered
// about a quarter of the crossing and sat off the line NPCs walked. Both now
// derive from getBridgeGeometry, and these tests assert they agree.

import { describe, it, expect } from 'vitest';
import { getBridgeGeometry, BRIDGE_ROW } from '../components/farm/ImperialOrchard';

/** Mirrors how the render interpolates an NPC across the bridge. */
const npcAt = (fromSector: number, toSector: number, progress: number) => {
    const { from, to } = getBridgeGeometry(fromSector, toSector);
    return {
        x: from.x + (to.x - from.x) * progress,
        y: from.y + (to.y - from.y) * progress,
    };
};

describe('inter-sector bridge geometry', () => {
    it('spans the actual crossing, not a short horizontal bar', () => {
        const span = getBridgeGeometry(0, 1);
        // Default tiles (96x48), 5x5 sectors, 72px gap => (+360, -96).
        expect(span.to.x - span.from.x).toBeCloseTo(360, 6);
        expect(span.to.y - span.from.y).toBeCloseTo(-96, 6);
        expect(span.length).toBeCloseTo(Math.sqrt(360 * 360 + 96 * 96), 6);
        // The crossing is a diagonal: a horizontal plank (the old bug) is wrong.
        expect(Math.abs(span.angleDeg)).toBeGreaterThan(10);
        expect(span.angleDeg).toBeCloseTo(-14.9314, 3);
    });

    it('places the plank midpoint on the NPC path midpoint', () => {
        const span = getBridgeGeometry(0, 1);
        const mid = npcAt(0, 1, 0.5);
        expect(span.midX).toBeCloseTo(mid.x, 6);
        expect(span.midY).toBeCloseTo(mid.y, 6);
    });

    it('starts and ends exactly where the NPC enters and leaves it', () => {
        const span = getBridgeGeometry(0, 1);
        const start = npcAt(0, 1, 0);
        const end = npcAt(0, 1, 1);
        expect(start).toEqual(span.from);
        expect(end).toEqual(span.to);
    });

    it('is the same segment travelled backwards when crossing right to left', () => {
        const forward = getBridgeGeometry(0, 1);
        const backward = getBridgeGeometry(1, 0);
        expect(backward.from).toEqual(forward.to);
        expect(backward.to).toEqual(forward.from);
        expect(backward.length).toBeCloseTo(forward.length, 6);
        expect(backward.midX).toBeCloseTo(forward.midX, 6);
        expect(backward.midY).toBeCloseTo(forward.midY, 6);
    });

    it('keeps every crossing on the same row and stays consistent across sectors', () => {
        const a = getBridgeGeometry(0, 1);
        const b = getBridgeGeometry(1, 2);
        expect(b.length).toBeCloseTo(a.length, 6);
        expect(b.angleDeg).toBeCloseTo(a.angleDeg, 6);
        // Sector pitch: each crossing is offset by one sector's stride.
        expect(b.midX - a.midX).toBeCloseTo(5 * 96 + 72, 6);
        expect(b.midY).toBeCloseTo(a.midY, 6);
        expect(BRIDGE_ROW).toBe(2);
    });
});
