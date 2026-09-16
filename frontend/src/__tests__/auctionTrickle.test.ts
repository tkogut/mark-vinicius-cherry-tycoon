// ECON-03 — Auction runner-up trickle formula, transcribed from
// backend/auction_logic.mo `resolveContract` (Phase 3 plan 03-03).
//
// WHY THIS EXISTS
// `resolveContract` carried two "reserved for future full trickle impl"
// constants since it was written — the runner-up in an Imperial Contract was
// always credited exactly nothing. Plan 03-03 computes and returns the
// trickle for the first time. This file pins that arithmetic and its
// zero/one/many-bidder boundaries with a hand-maintained transcription, in
// the same shape `economyParity.test.ts` uses for `ref*` helpers.
//
// WHAT THIS DOES NOT COVER (deliberate, not forgotten)
// No mirror is added to `frontend/src/lib/gameLogic.ts`. That file mirrors
// `game_logic.mo` for formulas the UI quotes to the player post-resolution;
// this is pre-resolution auction math that never reaches a UI surface —
// 03-RESEARCH.md's Architectural Responsibility Map places ECON-03 in the
// backend tier with no secondary (frontend-mirror) tier. This is also a
// transcription oracle, not a live-canister assertion: it catches drift on
// the TS side (there is none here, since there is no TS mirror) and, more
// usefully, catches drift in this transcription itself relative to the
// Motoko source if a maintainer edits one without the other — the same
// limitation `economyParity.test.ts` already documents for its own oracle.
//
// The AI-runner-up direction verified here was also verified end-to-end on
// a live replica in plan 03-03's Task 1 commit. The player-as-runner-up
// direction is plan 03-04's scope — not exercised by this file.

import { describe, it, expect } from 'vitest';

// ============================================================================
// REFERENCE IMPLEMENTATION — transcription of backend/auction_logic.mo
// ============================================================================

interface RefBid {
    bidderId: string;
    offerPricePLN: number;
    isOrganic: boolean;
    /** globalPrestige + localReputation, pre-summed as resolveContract's caller does. */
    prestigeSum: number;
}

interface RefContract {
    requiredVolumeKg: number;
    basePricePLN: number;
    isBio: boolean;
}

interface RefScoredBid {
    bid: RefBid;
    score: number;
}

interface RefAuctionResult {
    winnerId: string | null;
    winnerScore: number;
    winnerPricePLN: number | null;
    revenueEarned: number;
    runnerUpId: string | null;
    runnerUpVolumeKg: number;
    runnerUpTricklePLN: number;
}

const RUNNER_UP_TRICKLE_NUM = 20;
const RUNNER_UP_TRICKLE_DEN = 100;

/**
 * Motoko (calculateBidAttractiveness):
 *   if (pOffer > pBase) return 0;
 *   let margin         : Nat = pBase - pOffer;
 *   let prestigeFactor : Nat = 1500 + prestige;
 *   let qualityMult    : Nat = if (isOrganic and isBioContract) 120 else 100;
 *   (margin * prestigeFactor * qualityMult) / 100
 */
function refBidAttractiveness(
    pBase: number,
    pOffer: number,
    prestige: number,
    isOrganic: boolean,
    isBioContract: boolean
): number {
    if (pOffer > pBase) return 0;
    const margin = pBase - pOffer;
    const prestigeFactor = 1500 + prestige;
    const qualityMult = isOrganic && isBioContract ? 120 : 100;
    return Math.trunc((margin * prestigeFactor * qualityMult) / 100);
}

/**
 * Motoko (resolveContract's linear winner/runner-up scan):
 *   for (sb in scored.vals()) {
 *     switch (winnerOpt) {
 *       case (null) { winnerOpt := ?sb; };
 *       case (?curr) {
 *         if (sb.score > curr.score) {
 *           runnerOpt := ?curr;
 *           winnerOpt := ?sb;
 *         } else {
 *           switch (runnerOpt) {
 *             case (null) { runnerOpt := ?sb };
 *             case (?r)   { if (sb.score > r.score) { runnerOpt := ?sb }; };
 *           };
 *         };
 *       };
 *     };
 *   };
 *
 * Tracks the top-2 scores in a single pass — this is what makes the
 * four-bid test a real test of "second-highest score", not of input order.
 */
function refSelectWinnerAndRunner(scored: RefScoredBid[]): {
    winner: RefScoredBid | null;
    runner: RefScoredBid | null;
} {
    let winnerOpt: RefScoredBid | null = null;
    let runnerOpt: RefScoredBid | null = null;

    for (const sb of scored) {
        if (winnerOpt === null) {
            winnerOpt = sb;
        } else if (sb.score > winnerOpt.score) {
            runnerOpt = winnerOpt;
            winnerOpt = sb;
        } else if (runnerOpt === null || sb.score > runnerOpt.score) {
            runnerOpt = sb;
        }
    }

    return { winner: winnerOpt, runner: runnerOpt };
}

/**
 * Motoko (resolveContract's winner branch, trickle computation):
 *   let winRevenue = winner.bid.offerPricePLN * contract.requiredVolumeKg;
 *
 *   let runnerUpId : ?Text = switch (runnerOpt) {
 *     case (null) null;
 *     case (?r) { if (r.bid.bidderId == winner.bid.bidderId) null else ?(r.bid.bidderId); };
 *   };
 *
 *   let runnerUpVolumeKg : Nat = switch (runnerUpId) {
 *     case (null) 0;
 *     case (?_)   (contract.requiredVolumeKg * RUNNER_UP_TRICKLE_NUM) / RUNNER_UP_TRICKLE_DEN;
 *   };
 *   let runnerUpTricklePLN : Nat = switch (runnerOpt, runnerUpId) {
 *     case (?r, ?_) runnerUpVolumeKg * r.bid.offerPricePLN;
 *     case (_, _)   0;
 *   };
 *
 * Full resolveContract, including the no-valid-bids branch (all fields 0/null).
 */
function refResolveContract(contract: RefContract, bids: RefBid[]): RefAuctionResult {
    const scored: RefScoredBid[] = bids.map((bid) => ({
        bid,
        score: refBidAttractiveness(contract.basePricePLN, bid.offerPricePLN, bid.prestigeSum, bid.isOrganic, contract.isBio),
    }));

    const { winner, runner } = refSelectWinnerAndRunner(scored);

    if (winner === null) {
        return {
            winnerId: null,
            winnerScore: 0,
            winnerPricePLN: null,
            revenueEarned: 0,
            runnerUpId: null,
            runnerUpVolumeKg: 0,
            runnerUpTricklePLN: 0,
        };
    }

    const winRevenue = winner.bid.offerPricePLN * contract.requiredVolumeKg;

    // Identity guard: a runner-up sharing the winner's bidderId (corrupted
    // bid list) must never collect both the win and the trickle.
    const runnerUpId =
        runner !== null && runner.bid.bidderId !== winner.bid.bidderId ? runner.bid.bidderId : null;

    // Volume floors first; the payout is derived from the floored volume
    // (not from a single combined product) so volume * price === payout
    // always holds exactly, at the cost of at most 1 kg of precision.
    const runnerUpVolumeKg =
        runnerUpId === null ? 0 : Math.trunc((contract.requiredVolumeKg * RUNNER_UP_TRICKLE_NUM) / RUNNER_UP_TRICKLE_DEN);
    const runnerUpTricklePLN = runnerUpId === null || runner === null ? 0 : runnerUpVolumeKg * runner.bid.offerPricePLN;

    return {
        winnerId: winner.bid.bidderId,
        winnerScore: winner.score,
        winnerPricePLN: winner.bid.offerPricePLN,
        revenueEarned: winRevenue,
        runnerUpId,
        runnerUpVolumeKg,
        runnerUpTricklePLN,
    };
}

// ============================================================================
// FIXTURES
// ============================================================================

function bid(bidderId: string, offerPricePLN: number, prestigeSum = 0, isOrganic = false): RefBid {
    return { bidderId, offerPricePLN, isOrganic, prestigeSum };
}

// Replica-verified fixture (plan 03-03 Task 1 commit): imp_S6_0, Export
// contract, required 15_000 kg, base 8 PLN/kg. Marek (offer 5, prestige+rep
// 670) beats Hans (offer 7, prestige+rep 792) on score even though Hans
// offers a higher price, because margin dominates the V_bid formula.
const TWO_BID_CONTRACT: RefContract = { requiredVolumeKg: 15_000, basePricePLN: 8, isBio: false };
const TWO_BIDS: RefBid[] = [bid('marek', 5, 670), bid('hans', 7, 792)];

// Four bids, deliberately NOT in score order, so "second entry in input
// order" (thirdPlace) and "second-highest score" (secondHighest) disagree.
// Scores (margin * 1500, since prestigeSum = 0 for all four):
//   highest       margin 8 -> 12_000
//   thirdPlace    margin 2 ->  3_000
//   secondHighest margin 4 ->  6_000
//   lowest        margin 1 ->  1_500
const FOUR_BID_CONTRACT: RefContract = { requiredVolumeKg: 10_000, basePricePLN: 10, isBio: false };
const FOUR_BIDS: RefBid[] = [
    bid('highest', 2), // margin 8
    bid('thirdPlace', 8), // margin 2 — 2nd in input order, 3rd by score
    bid('secondHighest', 6), // margin 4 — 3rd in input order, 2nd by score
    bid('lowest', 9), // margin 1
];

// Required volume not a multiple of 5: 17 * 20 / 100 = 3.4, floors to 3.
const FLOOR_CONTRACT: RefContract = { requiredVolumeKg: 17, basePricePLN: 10, isBio: false };
const FLOOR_BIDS: RefBid[] = [bid('winner', 3), bid('runner', 5)];

const ONE_BID_CONTRACT: RefContract = { requiredVolumeKg: 1_000, basePricePLN: 10, isBio: false };
const ONE_BID: RefBid[] = [bid('solo', 6)];

const ZERO_BID_CONTRACT: RefContract = { requiredVolumeKg: 5_000, basePricePLN: 10, isBio: false };

// ============================================================================
// TESTS
// ============================================================================

describe('ECON-03: auction runner-up trickle boundary cases', () => {
    it.each([
        [
            'zero bids: no winner, no runner-up, trickle is 0/0',
            ZERO_BID_CONTRACT,
            [] as RefBid[],
            { winnerId: null, runnerUpId: null, runnerUpVolumeKg: 0, runnerUpTricklePLN: 0, revenueEarned: 0 },
        ],
        [
            'one bid: a winner exists, runner-up absent, nothing paid to a nonexistent second place',
            ONE_BID_CONTRACT,
            ONE_BID,
            { winnerId: 'solo', runnerUpId: null, runnerUpVolumeKg: 0, runnerUpTricklePLN: 0, revenueEarned: 6 * 1_000 },
        ],
        [
            'two bids: lower-scoring bidder is runner-up; trickle at the runner-up\'s own price',
            TWO_BID_CONTRACT,
            TWO_BIDS,
            {
                winnerId: 'marek',
                runnerUpId: 'hans',
                runnerUpVolumeKg: 3_000, // 15_000 * 20 / 100
                runnerUpTricklePLN: 21_000, // 3_000 * 7 (hans's own offer, not marek's)
                revenueEarned: 5 * 15_000,
            },
        ],
        [
            'four bids: second-HIGHEST SCORE is runner-up, not the second entry in input order',
            FOUR_BID_CONTRACT,
            FOUR_BIDS,
            {
                winnerId: 'highest',
                runnerUpId: 'secondHighest',
                runnerUpVolumeKg: 2_000, // 10_000 * 20 / 100
                runnerUpTricklePLN: 12_000, // 2_000 * 6
                revenueEarned: 2 * 10_000,
            },
        ],
        [
            'required volume not a multiple of 5 floors the trickle volume; volume * price == payout exactly',
            FLOOR_CONTRACT,
            FLOOR_BIDS,
            {
                winnerId: 'winner',
                runnerUpId: 'runner',
                runnerUpVolumeKg: 3, // trunc(17 * 20 / 100) = trunc(3.4) = 3
                runnerUpTricklePLN: 15, // 3 * 5, derived from the FLOORED volume
                revenueEarned: 3 * 17,
            },
        ],
    ])('%s', (_name, contract, bids, expected) => {
        const result = refResolveContract(contract, bids);
        expect(result.winnerId).toBe(expected.winnerId);
        expect(result.runnerUpId).toBe(expected.runnerUpId);
        expect(result.runnerUpVolumeKg).toBe(expected.runnerUpVolumeKg);
        expect(result.runnerUpTricklePLN).toBe(expected.runnerUpTricklePLN);
        expect(result.revenueEarned).toBe(expected.revenueEarned);

        // Consistency check: volume * price must equal the payout exactly,
        // since the payout is derived from the already-floored volume.
        if (result.runnerUpId !== null) {
            const runnerBid = bids.find((b) => b.bidderId === result.runnerUpId)!;
            expect(result.runnerUpVolumeKg * runnerBid.offerPricePLN).toBe(result.runnerUpTricklePLN);
        }
    });

    it("winner's revenue equals offerPrice x full requiredVolume, unchanged by a runner-up's presence or absence", () => {
        const withRunner = refResolveContract(TWO_BID_CONTRACT, TWO_BIDS);
        const withoutRunner = refResolveContract(ONE_BID_CONTRACT, ONE_BID);
        const withFourBidders = refResolveContract(FOUR_BID_CONTRACT, FOUR_BIDS);

        expect(withRunner.revenueEarned).toBe(withRunner.winnerPricePLN! * TWO_BID_CONTRACT.requiredVolumeKg);
        expect(withoutRunner.revenueEarned).toBe(withoutRunner.winnerPricePLN! * ONE_BID_CONTRACT.requiredVolumeKg);
        expect(withFourBidders.revenueEarned).toBe(withFourBidders.winnerPricePLN! * FOUR_BID_CONTRACT.requiredVolumeKg);
    });

    it('never produces a negative or NaN value (Nat-safety backstop)', () => {
        const allResults = [
            refResolveContract(ZERO_BID_CONTRACT, []),
            refResolveContract(ONE_BID_CONTRACT, ONE_BID),
            refResolveContract(TWO_BID_CONTRACT, TWO_BIDS),
            refResolveContract(FOUR_BID_CONTRACT, FOUR_BIDS),
            refResolveContract(FLOOR_CONTRACT, FLOOR_BIDS),
        ];

        for (const result of allResults) {
            for (const field of ['revenueEarned', 'runnerUpVolumeKg', 'runnerUpTricklePLN'] as const) {
                expect(Number.isNaN(result[field])).toBe(false);
                expect(result[field]).toBeGreaterThanOrEqual(0);
            }
        }
    });
});
