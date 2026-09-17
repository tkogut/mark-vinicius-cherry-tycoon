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
// a live replica in plan 03-03's Task 1 commit. Plan 03-04 completes the
// player-as-runner-up direction (checkpoint option B: the
// `stableRunnerUpCredits` side-table in backend/main.mo) and its own
// describe block below, also replica-verified in that plan's Task 2 commit.

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

// ============================================================================
// ECON-04 — Player reputation credit on Imperial Contract win
// ============================================================================
//
// Transcribed from backend/main.mo `resolveSeasonAuctions` (Phase 3 plan
// 03-04). Per D-06 (03-CONTEXT.md), a player win is a flat +5 to
// PlayerFarm.reputation (0-100 scale), matching the AI-winner branch's
// literal `prestige = ai.prestige + 5` — deliberately NOT rescaled to AI's
// separate 0-1000 `prestige` field. Order is fixed: the existing shortfall
// loss (floored at 0) is applied first, the flat win bonus second, and the
// documented 0-100 ceiling is applied to the COMBINED result, never to the
// gain alone.
interface RefReputationInputs {
    startingReputation: number;
    contractWinsThisSeason: number;
    prestigeLostThisSeason: number;
}

/**
 * Motoko (resolveSeasonAuctions, accumulator-apply site):
 *   let reputationAfterLoss : Nat =
 *     if (prestigeDelta > farm.reputation) 0 else farm.reputation - prestigeDelta;
 *   let newReputation : Nat = Nat.min(100, reputationAfterLoss + reputationGain);
 * where `reputationGain` accumulates `+= 5` once per Imperial Contract win.
 */
function refApplyReputationDelta({
    startingReputation,
    contractWinsThisSeason,
    prestigeLostThisSeason,
}: RefReputationInputs): number {
    const reputationGain = contractWinsThisSeason * 5;
    const reputationAfterLoss =
        prestigeLostThisSeason > startingReputation ? 0 : startingReputation - prestigeLostThisSeason;
    return Math.min(100, reputationAfterLoss + reputationGain);
}

describe('ECON-04: player reputation credit', () => {
    it('winning one Imperial Contract in a season ends that season with reputation exactly 5 higher, all else equal', () => {
        const result = refApplyReputationDelta({
            startingReputation: 40,
            contractWinsThisSeason: 1,
            prestigeLostThisSeason: 0,
        });
        expect(result).toBe(45);
    });

    it('winning two Imperial Contracts in one season gains 10', () => {
        const result = refApplyReputationDelta({
            startingReputation: 40,
            contractWinsThisSeason: 2,
            prestigeLostThisSeason: 0,
        });
        expect(result).toBe(50);
    });

    it('a player at reputation 98 who wins one contract ends at 100, not 103 (the documented 0-100 ceiling)', () => {
        const result = refApplyReputationDelta({
            startingReputation: 98,
            contractWinsThisSeason: 1,
            prestigeLostThisSeason: 0,
        });
        expect(result).toBe(100);
    });

    it('a player who both wins a contract (+5) and defaults on a pre-season future has the loss applied first, gain second, cap on the combined result', () => {
        // startingReputation 97, loses 10 (floors at 0 per the existing guard,
        // but 97 - 10 = 87 does not hit the floor), then gains 5 -> 92. Also
        // exercises a case where loss-then-gain composition differs from
        // gain-then-loss (97 + 5 = 102, capped to 100, then -10 = 90 would be
        // the WRONG answer if order were reversed).
        const result = refApplyReputationDelta({
            startingReputation: 97,
            contractWinsThisSeason: 1,
            prestigeLostThisSeason: 10,
        });
        expect(result).toBe(92);
    });

    it('a player who wins no contract has their reputation unchanged by this code path', () => {
        const result = refApplyReputationDelta({
            startingReputation: 63,
            contractWinsThisSeason: 0,
            prestigeLostThisSeason: 0,
        });
        expect(result).toBe(63);
    });

    it('never produces a negative or out-of-0-100-range value (Nat-safety + documented range backstop)', () => {
        const cases: RefReputationInputs[] = [
            { startingReputation: 0, contractWinsThisSeason: 0, prestigeLostThisSeason: 0 },
            { startingReputation: 0, contractWinsThisSeason: 0, prestigeLostThisSeason: 50 },
            { startingReputation: 100, contractWinsThisSeason: 5, prestigeLostThisSeason: 0 },
            { startingReputation: 3, contractWinsThisSeason: 0, prestigeLostThisSeason: 99 },
        ];

        for (const input of cases) {
            const result = refApplyReputationDelta(input);
            expect(Number.isNaN(result)).toBe(false);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(100);
        }
    });
});

// ============================================================================
// ECON-03 — Player runner-up direction (checkpoint option B: stableRunnerUpCredits)
// ============================================================================
//
// Transcribed from backend/main.mo (Phase 3 plan 03-04, checkpoint option B).
// `_performGlobalAuctionResolution`'s runner-up branch appends a
// (contractId, runnerUpPrincipalText, tricklePLN) entry to the new
// `stableRunnerUpCredits` side-table whenever `aiCompetitors.get(runnerId)`
// misses (the runner-up is a player, not an AI) — the payout amount is
// `result.runnerUpTricklePLN`, the same value the AI direction already
// consumes, never recomputed. `resolveSeasonAuctions` then pays every entry
// matching the caller's own principal text into cashDelta, and immediately
// reassigns the table to drop exactly those entries (Array.filter), so a
// credit can never be paid twice and one caller can never drain another's
// credit.
interface RefRunnerUpCredit {
    contractId: string;
    runnerUpPrincipalText: string;
    tricklePLN: number;
}

/**
 * Motoko (resolveSeasonAuctions step 1b, then the filter-reassign beside
 * `stableAuctionContracts := finalContracts;`):
 *   var runnerUpTrickleGained : Nat = 0;
 *   for ((cid, runnerPrincipalText, tricklePLN) in stableRunnerUpCredits.vals()) {
 *     if (runnerPrincipalText == callerText) {
 *       cashDelta += (tricklePLN : Int);
 *       runnerUpTrickleGained += tricklePLN;
 *     };
 *   };
 *   ...
 *   stableRunnerUpCredits := Array.filter<(Text, Text, Nat)>(
 *     stableRunnerUpCredits,
 *     func((_, runnerPrincipalText, _)) { runnerPrincipalText != callerText }
 *   );
 */
function refResolveRunnerUpCredits(
    credits: RefRunnerUpCredit[],
    callerPrincipalText: string
): { paidPLN: number; remainingCredits: RefRunnerUpCredit[] } {
    let paidPLN = 0;
    for (const c of credits) {
        if (c.runnerUpPrincipalText === callerPrincipalText) {
            paidPLN += c.tricklePLN;
        }
    }
    const remainingCredits = credits.filter((c) => c.runnerUpPrincipalText !== callerPrincipalText);
    return { paidPLN, remainingCredits };
}

describe('ECON-03: player runner-up direction (stableRunnerUpCredits, option B)', () => {
    it('a player who comes second in a two-bidder contract is credited the identical trickle payout an AI runner-up would receive', () => {
        // Reuse the exact same TWO_BID_CONTRACT/TWO_BIDS fixture and formula
        // the AI direction is pinned against above: hans is the runner-up,
        // tricklePLN = 21_000 (3_000 kg * hans's own offer of 7 PLN/kg).
        // The credit is recorded with hans as a player, not an AI, and paid
        // through the side-table using the SAME result.runnerUpTricklePLN —
        // no second formula.
        const result = refResolveContract(TWO_BID_CONTRACT, TWO_BIDS);
        expect(result.runnerUpId).toBe('hans');
        const credits: RefRunnerUpCredit[] = [
            { contractId: 'imp_test', runnerUpPrincipalText: 'hans', tricklePLN: result.runnerUpTricklePLN },
        ];

        const { paidPLN, remainingCredits } = refResolveRunnerUpCredits(credits, 'hans');
        expect(paidPLN).toBe(21_000);
        expect(remainingCredits).toHaveLength(0);
    });

    it('fewer than two bidders creates no credit record; the payout loop finds nothing to pay, no error', () => {
        const result = refResolveContract(ONE_BID_CONTRACT, ONE_BID);
        expect(result.runnerUpId).toBeNull();

        // No credit is ever appended for a null runnerUpId — the side-table
        // simply has no entry for this contract at all.
        const credits: RefRunnerUpCredit[] = [];
        const { paidPLN, remainingCredits } = refResolveRunnerUpCredits(credits, 'solo');
        expect(paidPLN).toBe(0);
        expect(remainingCredits).toHaveLength(0);
    });

    it('calling resolveSeasonAuctions twice in the same season pays the trickle exactly once', () => {
        const credits: RefRunnerUpCredit[] = [
            { contractId: 'imp_test', runnerUpPrincipalText: 'hans', tricklePLN: 21_000 },
        ];

        const first = refResolveRunnerUpCredits(credits, 'hans');
        expect(first.paidPLN).toBe(21_000);

        // Second call reads the table AFTER the first call's filter-reassign
        // already dropped hans's entry.
        const second = refResolveRunnerUpCredits(first.remainingCredits, 'hans');
        expect(second.paidPLN).toBe(0);
    });

    it('a bidder who wins a contract is never also paid its own runner-up trickle', () => {
        // A corrupted-bid-list case (same bidderId submits two bids) is the
        // one place resolveContract can produce a "winner == runner-up
        // identity" collision. The upstream identity guard already nulls
        // runnerUpId in that case, so the side-table never receives an entry
        // for the winner at all — nothing for this test to filter out later.
        const bids: RefBid[] = [bid('same', 5, 670), bid('same', 7, 792)];
        const result = refResolveContract(TWO_BID_CONTRACT, bids);
        expect(result.winnerId).toBe('same');
        expect(result.runnerUpId).toBeNull();

        const credits: RefRunnerUpCredit[] = [];
        const { paidPLN } = refResolveRunnerUpCredits(credits, 'same');
        expect(paidPLN).toBe(0);
    });

    it("a different player's runner-up credit is not payable by this caller", () => {
        const credits: RefRunnerUpCredit[] = [
            { contractId: 'imp_test', runnerUpPrincipalText: 'hans', tricklePLN: 21_000 },
        ];

        const { paidPLN, remainingCredits } = refResolveRunnerUpCredits(credits, 'marek');
        expect(paidPLN).toBe(0);
        // hans's credit is untouched — still there, still payable, only by hans.
        expect(remainingCredits).toEqual(credits);
    });
});
