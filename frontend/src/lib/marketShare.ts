// ECON-06 — regional market share.
//
// Lives here rather than in CompetitorsPanel.tsx for two reasons: a pure
// derivation is not a component (exporting it from the component file breaks
// Fast Refresh, which ESLint flags), and it needs to be testable without
// rendering anything.

export interface FarmCapacity {
    id: string;
    name: string;
    region: string;
    reputation: number;
    /** kg per season — the quantity market share is computed from. */
    capacityKg: number;
    specialty: string;
    isPlayer?: boolean;
}

export interface RankedFarm extends FarmCapacity {
    /** Percent of total regional capacity. Shares across all farms sum to 100. */
    marketShare: number;
}

/**
 * Each farm's share of total regional seasonal capacity, ranked highest first.
 *
 * Replaces two fabricated numbers: `Number(comp.baseCapacity) / 100` (a field
 * that does not exist on `AICompetitor`, so every rival showed NaN%) and the
 * player's `min(15, cash / 1000)`, which was derived from cash and could not
 * move when the player actually grew.
 */
export function computeMarketShares(farms: FarmCapacity[]): RankedFarm[] {
    const totalCapacityKg = farms.reduce((sum, farm) => sum + farm.capacityKg, 0);

    return farms
        .map((farm) => ({
            ...farm,
            // Guard the divide: before the first harvest every capacity is 0,
            // and 0/0 is NaN — the exact shape of the bug this replaces.
            marketShare: totalCapacityKg > 0 ? (farm.capacityKg / totalCapacityKg) * 100 : 0,
        }))
        .sort((a, b) => b.marketShare - a.marketShare);
}
