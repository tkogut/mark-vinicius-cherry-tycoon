// @vitest-environment node
//
// ECON-06 — market share is a real derivation, not a fabricated number.
//
// What this replaces: `marketShare: Number(comp.baseCapacity) / 100`, where
// `baseCapacity` is not a field of `AICompetitor` (the real one is
// `productionCapacity`). Every AI rival therefore rendered "NaN%" beside a
// progress bar, and the player's own share was `min(15, cash / 1000)` — cash,
// capped arbitrarily, unrelated to production.
//
// Two guards now exist and they cover different things:
//   * TypeScript — `useCompetitors` returns `AICompetitor[]` instead of `any`,
//     so reading a field that does not exist is a compile error. That is what
//     actually prevents a repeat of this bug.
//   * This file — the arithmetic. Typing cannot tell you that shares should
//     sum to 100 or that an empty world must not divide by zero.

import { describe, it, expect } from 'vitest';
import { computeMarketShares } from '@/lib/marketShare';

type Farm = Parameters<typeof computeMarketShares>[0][number];

const farm = (id: string, capacityKg: number, isPlayer = false): Farm => ({
    id,
    name: id,
    region: 'Głubczyce',
    reputation: 50,
    capacityKg,
    specialty: 'Wholesale supplier',
    isPlayer,
});

describe('ECON-06: market share', () => {
    it('is each farm\'s capacity as a percentage of the total', () => {
        const shares = computeMarketShares([
            farm('a', 6_000),
            farm('b', 3_000),
            farm('player', 1_000, true),
        ]);

        expect(shares.map((s) => [s.id, s.marketShare])).toEqual([
            ['a', 60],
            ['b', 30],
            ['player', 10],
        ]);
    });

    it('sums to 100 across every farm', () => {
        const shares = computeMarketShares([
            farm('a', 12_345),
            farm('b', 7),
            farm('c', 999_999),
            farm('player', 4_321, true),
        ]);

        const total = shares.reduce((sum, s) => sum + s.marketShare, 0);
        expect(total).toBeCloseTo(100, 10);
    });

    it('never produces NaN — the defect this replaces', () => {
        // Every capacity zero is the real pre-first-harvest state, and it is
        // exactly where the old code produced 0/0.
        for (const capacities of [[0, 0, 0], [0], [], [5, 0, 0]]) {
            const shares = computeMarketShares(capacities.map((kg, i) => farm(`f${i}`, kg)));
            for (const share of shares) {
                expect(Number.isNaN(share.marketShare), `NaN for capacity set ${capacities}`).toBe(false);
                expect(share.marketShare).toBeGreaterThanOrEqual(0);
                expect(share.marketShare).toBeLessThanOrEqual(100);
            }
        }
    });

    it('gives a lone farm the whole market', () => {
        expect(computeMarketShares([farm('player', 8_000, true)])[0].marketShare).toBe(100);
    });

    it('ranks by share, so the player can actually climb', () => {
        const before = computeMarketShares([farm('rival', 9_000), farm('player', 1_000, true)]);
        expect(before[0].id).toBe('rival');

        // The player triples output; the ranking must respond. Under the old
        // cash-derived formula, growing production changed nothing at all.
        const after = computeMarketShares([farm('rival', 9_000), farm('player', 30_000, true)]);
        expect(after[0].id).toBe('player');
        expect(after[0].marketShare).toBeGreaterThan(before[1].marketShare);
    });

    it('is unaffected by input order', () => {
        const ascending = computeMarketShares([farm('a', 1), farm('b', 2), farm('c', 3)]);
        const descending = computeMarketShares([farm('c', 3), farm('b', 2), farm('a', 1)]);
        expect(ascending).toEqual(descending);
    });
});
