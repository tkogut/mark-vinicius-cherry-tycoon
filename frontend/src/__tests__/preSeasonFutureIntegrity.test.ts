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

describe('ECON-08 + ECON-09: backend/main.mo and backend.did source drift guard', () => {
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

    // ------------------------------------------------------------------
    // ECON-09 additions (plan 03.1-02, T-03.1-05/T-03.1-07): the commitPreSeasonFuture
    // volumeKg equality guard must exist, and must run before the fee is
    // computed, and the Candid-visible arity of the method it lives on must
    // stay exactly (text, nat) -> (GameResult). Live-canister evidence for
    // both the pre-fix exploit and the four post-fix cases lives in plan
    // 03.1-02 Task 1's commit (ed6d361), not in this file.
    // ------------------------------------------------------------------

    /**
     * Slices out one function's source text by its declaration marker up to
     * (but excluding) the next function's declaration marker, so a pattern
     * match can be scoped to "inside commitPreSeasonFuture" rather than
     * matching anywhere in the 3000+ line file.
     */
    function extractFunctionBody(liveText: string, startMarker: string, endMarker: string): string {
        const startIdx = liveText.indexOf(startMarker);
        if (startIdx === -1) return '';
        const endIdx = liveText.indexOf(endMarker, startIdx + startMarker.length);
        return endIdx === -1 ? liveText.slice(startIdx) : liveText.slice(startIdx, endIdx);
    }

    it('commitPreSeasonFuture contains a volumeKg != contract.requiredVolumeKg guard that returns #Err(#InvalidOperation(...)) before the calcCommitmentFee call site', () => {
        expect(mainMo).toBeDefined();
        const body = extractFunctionBody(
            mainMo!.liveText,
            'func commitPreSeasonFuture(',
            'func submitAuctionBid('
        );
        expect(body.length, 'Expected to find commitPreSeasonFuture...submitAuctionBid span in backend/main.mo').toBeGreaterThan(0);

        // Allows for the exact wording of the error message while still
        // requiring the equality comparison and the #InvalidOperation variant.
        const guardPattern = /volumeKg\s*!=\s*contract\.requiredVolumeKg[\s\S]{0,150}?#Err\(#InvalidOperation\(/;
        const guardMatch = body.search(guardPattern);
        const feeCallIndex = body.indexOf('calcCommitmentFee(lockedPrice, contract.requiredVolumeKg)');

        expect(
            guardMatch,
            'Expected `volumeKg != contract.requiredVolumeKg` guarding a `#Err(#InvalidOperation(...))` inside commitPreSeasonFuture (ECON-09 regression: the equality guard was removed or weakened)'
        ).toBeGreaterThan(-1);
        expect(
            feeCallIndex,
            'Expected `AuctionLogic.calcCommitmentFee(lockedPrice, contract.requiredVolumeKg)` inside commitPreSeasonFuture (ECON-09 regression: the fee is no longer sourced from contract.requiredVolumeKg)'
        ).toBeGreaterThan(-1);
        expect(
            guardMatch,
            'Expected the volumeKg equality guard to run BEFORE calcCommitmentFee is called (ECON-09 regression: guard ordering moved, fee could be computed from an unvalidated volumeKg again)'
        ).toBeLessThan(feeCallIndex);
    });

    it('frontend/src/declarations/backend.did still declares commitPreSeasonFuture with exactly two arguments (text, nat) returning GameResult', () => {
        const didPath = resolve(REPO_ROOT, 'frontend/src/declarations/backend.did');
        const didText = readFileSync(didPath, 'utf8');
        const match = didText.match(/commitPreSeasonFuture\s*:\s*\(([^)]*)\)\s*->\s*\(([^)]*)\)/);

        expect(match, 'Expected `commitPreSeasonFuture: (...) -> (...)` in frontend/src/declarations/backend.did').not.toBeNull();

        const args = match![1].split(',').map((s) => s.trim()).filter(Boolean);
        expect(
            args,
            'Expected commitPreSeasonFuture to take exactly (text, nat) — an accidental parameter add/remove is a Candid-breaking change this pin catches at test time instead of at deploy time'
        ).toEqual(['text', 'nat']);
        expect(match![2].trim()).toBe('GameResult');
    });
});

// ============================================================================
// ECON-09 — commitPreSeasonFuture's commitment fee decoupled from the actual
// delivery obligation, transcribed from backend/main.mo (Phase 3.1 plan
// 03.1-02, fixing CR-02 from
// .planning/phases/03-core-economic-lever-fixes/03-REVIEW.md)
// ============================================================================
//
// WHY THIS EXISTS
// `volumeKg` used to flow into `AuctionLogic.calcCommitmentFee` completely
// unchecked against `contract.requiredVolumeKg` — the fixed delivery
// obligation the player is actually held to at resolution time. A direct
// canister call with `volumeKg = 1` paid a fee that truncates to 0 PLN for
// every realistic locked price (5-17 PLN/kg) while still locking in the full
// requiredVolumeKg obligation and the discounted price — a free lock-in
// exploit reachable by anyone who can call the canister directly (the
// frontend happens to always pass the correct volume, but the frontend is
// not a trust boundary).
//
// The fix adds an equality guard — `volumeKg != contract.requiredVolumeKg`
// rejects the call with `#InvalidOperation` — that runs after the
// pre-existing `volumeKg == 0` guard (which keeps its own message,
// unchanged) and before `calcLockedPrice`/`calcCommitmentFee`/any write.
// `calcCommitmentFee`'s second argument now reads `contract.requiredVolumeKg`
// instead of the caller-supplied `volumeKg`, so the fee cannot be re-exposed
// to caller control even if the guard is later loosened.
//
// HOW IT WORKS (and what it does NOT prove)
// `refCommitPreSeasonFuture` below transcribes the guard ordering and fee
// arithmetic line-by-line so a reviewer can diff the two by eye. This is a
// transcription oracle, not a live-canister assertion — the live-replica
// evidence (the pre-fix exploit reading and all four post-fix readings, off
// a real `dfx deploy backend`) lives in plan 03.1-02's Task 1 commit
// (ed6d361), not here. This file catches two different kinds of drift
// instead: (1) the transcription's own arithmetic and guard-ordering
// boundaries, pinned by the describe block below, and (2) drift between the
// transcription and the actual Motoko/Candid source, pinned by the two new
// tests added to the source drift guard block above.
//
// WHAT THIS DOES NOT COVER (deliberate, not forgotten)
// No mirror is added to `frontend/src/lib/gameLogic.ts`. This is
// resolution-time auction fee math the UI never quotes pre-commit (the
// frontend reads the fee back from the `Ok` message string after the call
// succeeds) — the same reasoning `preSeasonFutureIntegrity.test.ts`'s ECON-08
// section already records for the PSF shortfall math.

/**
 * Motoko (auction_logic.mo):
 *   private let PRE_SEASON_DISCOUNT_NUM : Nat = 93;
 *   private let PRE_SEASON_DISCOUNT_DEN : Nat = 100;
 *   public func calcLockedPrice(basePricePLN: Nat) : Nat {
 *     (basePricePLN * PRE_SEASON_DISCOUNT_NUM) / PRE_SEASON_DISCOUNT_DEN
 *   };
 */
function refCalcLockedPrice(basePricePLN: number): number {
    return Math.floor((basePricePLN * 93) / 100);
}

/**
 * Motoko (auction_logic.mo):
 *   private let COMMITMENT_FEE_NUM : Nat = 10;
 *   private let COMMITMENT_FEE_DEN : Nat = 100;
 *   public func calcCommitmentFee(lockedPricePLN: Nat, requiredVolumeKg: Nat) : Nat {
 *     (lockedPricePLN * requiredVolumeKg * COMMITMENT_FEE_NUM) / COMMITMENT_FEE_DEN
 *   };
 */
function refCalcCommitmentFee(lockedPricePLN: number, volumeKg: number): number {
    return Math.floor((lockedPricePLN * volumeKg * 10) / 100);
}

type RefCommitOutcome = 'zero' | 'mismatch' | 'ok';

interface RefCommitResult {
    outcome: RefCommitOutcome;
    lockedPricePLN?: number;
    feePLN?: number;
}

/**
 * Motoko (main.mo, commitPreSeasonFuture, post ECON-09 fix):
 *   if (volumeKg == 0) {
 *     return #Err(#InvalidOperation("Volume commitment must be greater than zero."));
 *   };
 *   ... // contract lookup resolves `contract`
 *   if (volumeKg != contract.requiredVolumeKg) {
 *     return #Err(#InvalidOperation("volumeKg must equal the contract's required volume of " # Nat.toText(contract.requiredVolumeKg) # " kg"));
 *   };
 *   ... // #Bio organic check (not modelled here — orthogonal to volumeKg)
 *   let lockedPrice : Nat = AuctionLogic.calcLockedPrice(contract.basePricePLN);
 *   let fee : Nat = AuctionLogic.calcCommitmentFee(lockedPrice, contract.requiredVolumeKg);
 *
 * The zero guard runs first and keeps its own outcome/message — it is never
 * shadowed by the equality guard, even though volumeKg=0 also satisfies
 * "!= requiredVolumeKg" for every contract (requiredVolumeKg is always
 * 5,000/10,000/20,000, never 0). The fee is deliberately computed from
 * `requiredVolumeKg`, not `volumeKg` — by the time this function returns
 * 'ok', the guard above has already proven the two are equal, but sourcing
 * the fee from the contract keeps it that way even if the guard is loosened.
 */
function refCommitPreSeasonFuture(
    basePricePLN: number,
    requiredVolumeKg: number,
    volumeKg: number
): RefCommitResult {
    if (volumeKg === 0) {
        return { outcome: 'zero' };
    }
    if (volumeKg !== requiredVolumeKg) {
        return { outcome: 'mismatch' };
    }
    const lockedPricePLN = refCalcLockedPrice(basePricePLN);
    const feePLN = refCalcCommitmentFee(lockedPricePLN, requiredVolumeKg);
    return { outcome: 'ok', lockedPricePLN, feePLN };
}

describe('ECON-09: commitPreSeasonFuture volumeKg validation arithmetic and guard ordering', () => {
    it('Export PSF (base 6 -> locked 5) charges exactly 5,000 PLN for its 10,000 kg required volume', () => {
        const result = refCommitPreSeasonFuture(6, 10_000, 10_000);
        expect(result).toEqual({ outcome: 'ok', lockedPricePLN: 5, feePLN: 5_000 });
    });

    it('Bio PSF (base 9 -> locked 8) charges exactly 4,000 PLN for its 5,000 kg required volume', () => {
        const result = refCommitPreSeasonFuture(9, 5_000, 5_000);
        expect(result).toEqual({ outcome: 'ok', lockedPricePLN: 8, feePLN: 4_000 });
    });

    it('Industrial PSF (base 3 -> locked 2) charges exactly 4,000 PLN for its 20,000 kg required volume', () => {
        const result = refCommitPreSeasonFuture(3, 20_000, 20_000);
        expect(result).toEqual({ outcome: 'ok', lockedPricePLN: 2, feePLN: 4_000 });
    });

    // NOTE ON THE RANGE (deviation from the plan text, Rule 1 auto-fix): the
    // plan/03-REVIEW.md CR-02 describe the exploit range as "every realistic
    // locked price (5-17 PLN/kg)". That is only true up to lockedPricePLN=9 —
    // the fee is floor(lockedPricePLN * 1 * 10 / 100) = floor(lockedPricePLN / 10),
    // which is 0 for lockedPricePLN in 0..9 but becomes 1 (nonzero) starting
    // at lockedPricePLN=10, disproving the literal "...17" upper bound. The
    // game's three actual locked prices (Export 5, Bio 8, Industrial 2, all
    // derived from the fixed base prices 6/9/3) sit inside the true 0..9
    // zero-truncation window, so the exploit itself is real and unaffected —
    // only the review's stated bound was imprecise. Both the true window and
    // the boundary crossing are pinned below instead of the inaccurate range.
    it('the exploit arithmetic: for every locked price the three PSF categories can actually produce (Export 5, Bio 8, Industrial 2), a volumeKg=1 fee truncates to 0', () => {
        for (const lockedPricePLN of [5, 8, 2]) {
            expect(refCalcCommitmentFee(lockedPricePLN, 1)).toBe(0);
        }
    });

    it('the exploit arithmetic holds for the full 0..9 PLN/kg locked-price window (volumeKg=1 fee truncates to 0), and stops holding at 10 — the true bound, not the "5..17" figure in 03-REVIEW.md CR-02', () => {
        for (let lockedPricePLN = 0; lockedPricePLN <= 9; lockedPricePLN++) {
            expect(refCalcCommitmentFee(lockedPricePLN, 1)).toBe(0);
        }
        expect(refCalcCommitmentFee(10, 1)).toBe(1);
    });

    it('the fee uses requiredVolumeKg even when a caller-supplied volumeKg differs (post-fix: the guard rejects mismatches, but if it were bypassed the fee must still be sourced from requiredVolumeKg, not volumeKg)', () => {
        const requiredVolumeKg = 10_000;
        const maliciousVolumeKg = 1; // what the pre-fix exploit supplied
        const lockedPricePLN = refCalcLockedPrice(6);

        const feeFromRequiredVolumeKg = refCalcCommitmentFee(lockedPricePLN, requiredVolumeKg);
        const feeFromMaliciousVolumeKg = refCalcCommitmentFee(lockedPricePLN, maliciousVolumeKg);

        expect(feeFromRequiredVolumeKg).toBe(5_000);
        expect(feeFromMaliciousVolumeKg).toBe(0); // the exploit's own truncation
        expect(feeFromRequiredVolumeKg).not.toBe(feeFromMaliciousVolumeKg);
    });

    it('volumeKg = 0 produces the zero-volume outcome, not the mismatch outcome — the pre-existing zero guard runs first and keeps its own error', () => {
        const result = refCommitPreSeasonFuture(6, 10_000, 0);
        expect(result.outcome).toBe('zero');
        expect(result.feePLN).toBeUndefined();
    });

    it.each([1, 9_999, 10_001, 20_000])(
        'volumeKg = %i against a 10,000 kg Export PSF is rejected as a mismatch — no fee is computed and no state is mutated',
        (volumeKg) => {
            const result = refCommitPreSeasonFuture(6, 10_000, volumeKg);
            expect(result.outcome).toBe('mismatch');
            expect(result.feePLN).toBeUndefined();
            expect(result.lockedPricePLN).toBeUndefined();
        }
    );

    it('volumeKg = 20,000 against a 10,000 kg contract is rejected — the predicate is equality, not a lower bound (over-commitment is not accepted)', () => {
        const result = refCommitPreSeasonFuture(6, 10_000, 20_000);
        expect(result.outcome).toBe('mismatch');
    });

    it('volumeKg = 10,000 against a 10,000 kg Export PSF is accepted with a fee of exactly 5,000 PLN', () => {
        const result = refCommitPreSeasonFuture(6, 10_000, 10_000);
        expect(result).toEqual({ outcome: 'ok', lockedPricePLN: 5, feePLN: 5_000 });
    });

    it('Nat-safety backstop: across a matrix of (basePricePLN, requiredVolumeKg) inputs, an accepted fee is always an integer >= 0, never NaN', () => {
        const cases: Array<{ basePricePLN: number; requiredVolumeKg: number }> = [
            { basePricePLN: 6, requiredVolumeKg: 10_000 },
            { basePricePLN: 9, requiredVolumeKg: 5_000 },
            { basePricePLN: 3, requiredVolumeKg: 20_000 },
            { basePricePLN: 0, requiredVolumeKg: 10_000 },
            { basePricePLN: 100, requiredVolumeKg: 1 },
            { basePricePLN: 1, requiredVolumeKg: 1 },
        ];

        for (const { basePricePLN, requiredVolumeKg } of cases) {
            const result = refCommitPreSeasonFuture(basePricePLN, requiredVolumeKg, requiredVolumeKg);
            expect(result.outcome).toBe('ok');
            expect(Number.isNaN(result.feePLN)).toBe(false);
            expect(Number.isInteger(result.feePLN)).toBe(true);
            expect(result.feePLN as number).toBeGreaterThanOrEqual(0);
        }
    });
});
