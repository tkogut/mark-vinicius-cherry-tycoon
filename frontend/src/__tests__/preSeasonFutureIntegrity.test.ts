// @vitest-environment node
//
// ECON-08 — Pre-Season Future shortfall accumulator, transcribed from
// backend/main.mo `resolveSeasonAuctions` (Phase 3.1 plan 03.1-01, fixing
// CR-01 from .planning/phases/03-core-economic-lever-fixes/03-REVIEW.md).
//
// WHY THIS EXISTS
// `resolveSeasonAuctions` used to check EVERY one of a caller's committed
// Pre-Season Future contracts against the same pre-loop `totalDelivered`
// snapshot, instead of the pool actually left after earlier contracts in the
// same resolution pass already consumed some of it. A player holding more
// than one PSF in a season (nothing limits how many, and `advancePhase`
// mints one Export + one Bio + one Industrial PSF every season) evaded a
// large fraction of the intended shortfall/buyback/default exposure —
// CR-01's worked example: Export (10,000 kg required) + Industrial
// (20,000 kg required), 12,000 kg delivered, evaluated as shortfalls
// [0, 8_000] (sum 8_000) instead of the true [0, 18_000] (sum 18_000).
//
// The fix threads a running `remainingForPSF` accumulator through the PSF
// branch: it starts at the same value `totalDelivered` already held, is read
// by both the shortfall check and the deliveredKg derivation, and is
// guard-decremented (never a bare Nat subtraction) after each contract
// consumes its share — strictly inside the caller-guarded branch so another
// player's contracts in the same array can never drain this caller's pool.
//
// HOW IT WORKS (and what it does NOT prove)
// `refResolvePSFContracts` below is a line-by-line transcription of the fixed
// Motoko loop, quoted inline so a reviewer can diff the two by eye. This is a
// transcription oracle, not a live-canister assertion — the live-replica
// evidence (before/after numbers off a real `dfx deploy backend`) lives in
// plan 03.1-01's Task 1 commit, not here. This file catches two different
// kinds of drift instead: (1) the transcription's own arithmetic and
// boundaries, pinned by the describe block below, and (2) drift between the
// transcription and the actual Motoko source, pinned by the second describe
// block's source-scan guard (modelled on backendHygiene.test.ts's
// walk/strip/assert shape).
//
// WHAT THIS DOES NOT COVER (deliberate, not forgotten)
// No mirror is added to `frontend/src/lib/gameLogic.ts`. That file mirrors
// `game_logic.mo` for formulas the UI quotes to the player post-resolution;
// this is resolution-time auction math the UI never quotes — the same
// reasoning auctionTrickle.test.ts records for ECON-03. The per-contract
// split across multiple PSFs follows `stableAuctionContracts` array order —
// that is deterministic and intended (see the "iteration order" test below),
// not a hidden bug to re-litigate later.

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

// ============================================================================
// REFERENCE IMPLEMENTATION — transcription of backend/main.mo's
// resolveSeasonAuctions PSF branch (post ECON-08 fix)
// ============================================================================

interface RefPSFContract {
    id: string;
    requiredVolumeKg: number;
    committedByPlayer: string | null;
    isPreSeason: boolean;
    status: 'Awarded' | 'Open' | 'Fulfilled' | 'Defaulted';
}

interface RefPSFResolution {
    contractId: string;
    shortfallKg: number;
}

interface RefPSFRunResult {
    resolutions: RefPSFResolution[];
    finalRemaining: number;
}

/**
 * Motoko (resolveSeasonAuctions, after the ECON-08 fix):
 *   var remainingForPSF = totalDelivered;
 *   let finalContracts = Array.map<Types.AuctionContract, Types.AuctionContract>(
 *     stableAuctionContracts,
 *     func(c) {
 *       switch (c.committedByPlayer) {
 *         case (?(pid)) {
 *           if (pid == callerText and c.isPreSeason and c.status == #Awarded) {
 *             let shortfallResult = AuctionLogic.resolvePreSeasonShortfall(
 *               c, remainingForPSF, stableSpotPrice, farm.cash, farm.reputation, farm.reputation
 *             );
 *             // shortfallResult.shortfallKg = if remainingForPSF >= c.requiredVolumeKg
 *             //   then 0 else c.requiredVolumeKg - remainingForPSF  (auction_logic.mo)
 *             let deliveredKg = if (remainingForPSF >= c.requiredVolumeKg) c.requiredVolumeKg else remainingForPSF;
 *             ...
 *             remainingForPSF := if (remainingForPSF >= deliveredKg) remainingForPSF - deliveredKg else 0;
 *             { c with status = ...; shortfallKg = ?shortfallResult.shortfallKg }
 *           } else { c };
 *         };
 *         case null { c };
 *       };
 *     }
 *   );
 *
 * Only the caller's own `#Awarded` PSF contracts (in array order) touch or
 * consume `remainingForPSF`; everything else passes through untouched.
 */
function refResolvePSFContracts(
    contracts: RefPSFContract[],
    callerPrincipalText: string,
    startingDeliveredKg: number
): RefPSFRunResult {
    let remainingForPSF = startingDeliveredKg;
    const resolutions: RefPSFResolution[] = [];

    for (const c of contracts) {
        if (c.committedByPlayer === callerPrincipalText && c.isPreSeason && c.status === 'Awarded') {
            const shortfallKg =
                remainingForPSF >= c.requiredVolumeKg ? 0 : c.requiredVolumeKg - remainingForPSF;
            const deliveredKg =
                remainingForPSF >= c.requiredVolumeKg ? c.requiredVolumeKg : remainingForPSF;
            remainingForPSF = remainingForPSF >= deliveredKg ? remainingForPSF - deliveredKg : 0;

            resolutions.push({ contractId: c.id, shortfallKg });
        }
    }

    return { resolutions, finalRemaining: remainingForPSF };
}

function psf(id: string, requiredVolumeKg: number, opts?: Partial<RefPSFContract>): RefPSFContract {
    return {
        id,
        requiredVolumeKg,
        committedByPlayer: 'caller',
        isPreSeason: true,
        status: 'Awarded',
        ...opts,
    };
}

describe('ECON-08: PSF accumulator arithmetic and boundaries', () => {
    it("CR-01's worked example — Export (10,000 kg) + Industrial (20,000 kg) required, 12,000 kg delivered -> [0, 18_000], sum 18_000, accumulator ends at 0", () => {
        const contracts = [psf('psf_export', 10_000), psf('psf_industrial', 20_000)];
        const result = refResolvePSFContracts(contracts, 'caller', 12_000);

        expect(result.resolutions.map((r) => r.shortfallKg)).toEqual([0, 18_000]);
        expect(result.resolutions.reduce((sum, r) => sum + r.shortfallKg, 0)).toBe(18_000);
        expect(result.finalRemaining).toBe(0);
    });

    it('a single PSF (10,000 kg required, 12,000 kg delivered) has shortfall 0 — identical to pre-fix behaviour', () => {
        const contracts = [psf('psf_export', 10_000)];
        const result = refResolvePSFContracts(contracts, 'caller', 12_000);

        expect(result.resolutions).toEqual([{ contractId: 'psf_export', shortfallKg: 0 }]);
    });

    it('a single PSF (20,000 kg required, 12,000 kg delivered) has shortfall 8,000 — the regression anchor, identical to pre-fix behaviour', () => {
        const contracts = [psf('psf_industrial', 20_000)];
        const result = refResolvePSFContracts(contracts, 'caller', 12_000);

        expect(result.resolutions).toEqual([{ contractId: 'psf_industrial', shortfallKg: 8_000 }]);
    });

    it('zero PSFs for the caller returns an empty result and the accumulator unchanged, no throw', () => {
        const contracts = [psf('psf_other', 10_000, { committedByPlayer: 'someone_else' })];
        const result = refResolvePSFContracts(contracts, 'caller', 12_000);

        expect(result.resolutions).toEqual([]);
        expect(result.finalRemaining).toBe(12_000);
    });

    it('three PSFs totalling 35,000 kg required with exactly 35,000 kg delivered -> every shortfall is 0 (no false-positive shortfall)', () => {
        const contracts = [psf('a', 10_000), psf('b', 20_000), psf('c', 5_000)];
        const result = refResolvePSFContracts(contracts, 'caller', 35_000);

        expect(result.resolutions.map((r) => r.shortfallKg)).toEqual([0, 0, 0]);
        expect(result.finalRemaining).toBe(0);
    });

    it('two PSFs with 0 kg delivered -> shortfalls equal each contract full required volume, accumulator stays 0 and never goes negative', () => {
        const contracts = [psf('a', 10_000), psf('b', 20_000)];
        const result = refResolvePSFContracts(contracts, 'caller', 0);

        expect(result.resolutions.map((r) => r.shortfallKg)).toEqual([10_000, 20_000]);
        expect(result.finalRemaining).toBe(0);
    });

    it("a second player's #Awarded PSF interleaved in the array is skipped by the caller guard — it neither gains a shortfall nor consumes the accumulator", () => {
        const withOther = [
            psf('mine_1', 10_000),
            psf('theirs', 15_000, { committedByPlayer: 'someone_else' }),
            psf('mine_2', 20_000),
        ];
        const withoutOther = [psf('mine_1', 10_000), psf('mine_2', 20_000)];

        const resultWithOther = refResolvePSFContracts(withOther, 'caller', 12_000);
        const resultWithoutOther = refResolvePSFContracts(withoutOther, 'caller', 12_000);

        // The caller's own results are byte-identical to the array without
        // the other player's contract present.
        expect(resultWithOther.resolutions).toEqual(resultWithoutOther.resolutions);
        expect(resultWithOther.finalRemaining).toBe(resultWithoutOther.finalRemaining);
    });

    it('iteration order is the array order and is deterministic — the same inputs in the same order always produce the same per-contract split', () => {
        const contracts = [psf('a', 10_000), psf('b', 20_000)];
        const first = refResolvePSFContracts(contracts, 'caller', 12_000);
        const second = refResolvePSFContracts(contracts, 'caller', 12_000);

        expect(first).toEqual(second);
    });

    it('reordering two contracts redistributes the per-contract split but never changes the sum', () => {
        const forward = refResolvePSFContracts([psf('a', 10_000), psf('b', 20_000)], 'caller', 12_000);
        const reversed = refResolvePSFContracts([psf('b', 20_000), psf('a', 10_000)], 'caller', 12_000);

        const forwardSum = forward.resolutions.reduce((sum, r) => sum + r.shortfallKg, 0);
        const reversedSum = reversed.resolutions.reduce((sum, r) => sum + r.shortfallKg, 0);
        expect(forwardSum).toBe(18_000);
        expect(reversedSum).toBe(18_000);

        // The split itself differs — this is what "redistributes" means: the
        // contract processed later in the array absorbs the depleted pool.
        expect(forward.resolutions.map((r) => r.shortfallKg)).not.toEqual(
            reversed.resolutions.map((r) => r.shortfallKg)
        );
    });

    it('Nat-safety backstop: every shortfall and the final accumulator are integers >= 0, never NaN, across a matrix of (required, delivered) inputs', () => {
        const cases: Array<{ required: number[]; delivered: number }> = [
            { required: [10_000, 20_000], delivered: 0 },
            { required: [10_000, 20_000], delivered: 12_000 },
            { required: [10_000, 20_000], delivered: 30_000 },
            { required: [10_000, 20_000], delivered: 100_000 },
            { required: [5_000], delivered: 5_000 },
            { required: [0], delivered: 0 },
            { required: [1, 1, 1], delivered: 1 },
        ];

        for (const { required, delivered } of cases) {
            const contracts = required.map((req, i) => psf(`c${i}`, req));
            const result = refResolvePSFContracts(contracts, 'caller', delivered);

            for (const r of result.resolutions) {
                expect(Number.isNaN(r.shortfallKg)).toBe(false);
                expect(Number.isInteger(r.shortfallKg)).toBe(true);
                expect(r.shortfallKg).toBeGreaterThanOrEqual(0);
            }
            expect(Number.isNaN(result.finalRemaining)).toBe(false);
            expect(Number.isInteger(result.finalRemaining)).toBe(true);
            expect(result.finalRemaining).toBeGreaterThanOrEqual(0);
        }
    });
});

// ============================================================================
// SOURCE DRIFT GUARD — backend/main.mo must still contain the accumulator
// ============================================================================
//
// Modelled on backendHygiene.test.ts's walk/strip/assert shape. Track B
// (main_mainnet.mo) does not compile (EOP-01) and nothing in this repo's
// test or CI workflow builds it, so it is excluded here for the same reason
// backendHygiene.test.ts excludes it — it may legitimately carry a stale
// shape this guard cannot and should not judge.

const REPO_ROOT = resolve(__dirname, '../../..');
const BACKEND_DIR = resolve(REPO_ROOT, 'backend');
const EXCLUDED_FILES = new Set(['main_mainnet.mo']);

interface MotokoFile {
    relativePath: string;
    /** Full text with comment-only lines removed, newlines preserved. */
    liveText: string;
    liveLines: string[];
}

function walk(dir: string): string[] {
    const entries = readdirSync(dir);
    const files: string[] = [];
    for (const entry of entries) {
        const full = join(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) {
            files.push(...walk(full));
        } else if (entry.endsWith('.mo')) {
            files.push(full);
        }
    }
    return files;
}

function readMotokoFiles(): MotokoFile[] {
    return walk(BACKEND_DIR)
        .filter((full) => !EXCLUDED_FILES.has(full.split('/').pop()!))
        .map((full) => {
            // Strip comment-only lines (trimmed line starts with `//`) so a
            // doc-style comment mentioning the identifier (this file's own
            // Motoko-quoting header, or main.mo's own explanatory comment
            // above the fix) cannot self-invalidate or self-satisfy the gate.
            const liveLines = readFileSync(full, 'utf8')
                .split('\n')
                .filter((line) => !line.trim().startsWith('//'));
            return {
                relativePath: relative(REPO_ROOT, full),
                liveLines,
                liveText: liveLines.join('\n'),
            };
        });
}

describe('ECON-08: backend/main.mo source drift guard', () => {
    const files = readMotokoFiles();
    const mainMo = files.find((f) => f.relativePath.endsWith('main.mo'));

    it('finds backend .mo files including main.mo (guards against the scanner silently breaking)', () => {
        expect(files.length).toBeGreaterThan(10);
        expect(mainMo).toBeDefined();
    });

    it('the resolvePreSeasonShortfall call site inside resolveSeasonAuctions passes the accumulator as its second argument', () => {
        expect(mainMo).toBeDefined();
        // Allows for the exact whitespace/formatting of the call site while
        // still requiring `c` as the first argument and `remainingForPSF` as
        // the second — a positive assertion of position, not merely presence.
        const callSitePattern = /resolvePreSeasonShortfall\(\s*c,\s*remainingForPSF,/;
        expect(
            callSitePattern.test(mainMo!.liveText),
            'Expected AuctionLogic.resolvePreSeasonShortfall( c, remainingForPSF, ... ) in backend/main.mo (ECON-08 regression: call site reverted to a stale snapshot argument)'
        ).toBe(true);
    });

    it('the accumulator identifier appears at least 4 times in live (non-comment) lines: declaration, shortfall argument, deliveredKg derivation, guarded update', () => {
        expect(mainMo).toBeDefined();
        const occurrences = (mainMo!.liveText.match(/remainingForPSF/g) ?? []).length;
        expect(
            occurrences,
            `Expected remainingForPSF to appear at least 4 times in non-comment backend/main.mo lines, found ${occurrences}`
        ).toBeGreaterThanOrEqual(4);
    });

    it("the accumulator's update is a guarded form (a >= comparison guarding the subtraction, yielding 0 on the else branch) — never a bare Nat subtraction", () => {
        expect(mainMo).toBeDefined();
        const guardedUpdatePattern =
            /remainingForPSF\s*:=\s*if\s*\(\s*remainingForPSF\s*>=\s*deliveredKg\s*\)\s*remainingForPSF\s*-\s*deliveredKg\s*else\s*0/;
        expect(
            guardedUpdatePattern.test(mainMo!.liveText),
            'Expected a guarded `remainingForPSF := if (remainingForPSF >= deliveredKg) remainingForPSF - deliveredKg else 0` update in backend/main.mo (ECON-08/T-03.1-02 regression: unguarded subtraction would trap on over-commitment)'
        ).toBe(true);
    });
});
