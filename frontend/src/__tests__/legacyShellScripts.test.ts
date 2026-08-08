// @vitest-environment node
//
// QUAL-08 — ratchet over the legacy `execution/tests/*.sh` backend suite.
//
// 23 shell scripts drive `dfx canister call backend <method>` against a live
// replica and assert by string-matching Candid output. No workflow runs them,
// and 12 of them call methods the backend no longer has — they have been
// silently broken for months while still looking like a test suite.
//
// Rather than delete 12 files (which throws away 12 encoded scenarios worth
// porting: phase gates, weather, auctions, the organic workflow) or "fix" all
// 23 (a large migration), this test does what the lint ceiling does for lint
// debt: it pins the damage. The set of broken scripts is snapshotted below.
//   - a script that starts calling a dead method  -> this test FAILS
//   - a script that gets fixed or deleted         -> the snapshot must shrink
// So the rot cannot spread, and paying it down is a visible, incremental act.
//
// Method names are checked against the generated Candid interface, i.e. the
// real contract — same source of truth as candidContract.test.ts.

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { IDL } from '@dfinity/candid';
import { idlFactory } from '@/declarations/backend.did.js';

const SCRIPT_DIR = resolve(__dirname, '../../../execution/tests');

function declaredMethods(): Set<string> {
    const service = idlFactory({ IDL }) as unknown as { _fields: Array<[string, unknown]> };
    return new Set(service._fields.map(([name]) => name));
}

interface ScriptReport {
    file: string;
    calledMethods: string[];
    deadMethods: string[];
    hasCrlf: boolean;
}

function analyseScripts(): ScriptReport[] {
    const declared = declaredMethods();
    // `dfx canister call <canister> <method>` — capture the method name.
    const callPattern = /canister\s+call\s+\S+\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;

    return readdirSync(SCRIPT_DIR)
        .filter((f) => f.endsWith('.sh'))
        .sort()
        .map((file) => {
            const text = readFileSync(join(SCRIPT_DIR, file), 'utf8');
            const called = [...new Set([...text.matchAll(callPattern)].map((m) => m[1]))].sort();
            return {
                file,
                calledMethods: called,
                deadMethods: called.filter((m) => !declared.has(m)),
                // CRLF makes a script fail under bash on a Linux runner before
                // it even reaches the first API call.
                hasCrlf: text.includes('\r'),
            };
        });
}

/**
 * Scripts known to call at least one method the backend no longer declares,
 * snapshotted 2026-08-06. The three dead methods behind these are:
 *   advanceSeason        (removed; season progression is no longer a manual call)
 *   getLeaderboard       (renamed to getGlobalLeaderboard)
 *   debugSetHansStorage  (removed debug helper)
 */
const KNOWN_BROKEN: Record<string, string[]> = {
    'e2e_backend.sh': ['advanceSeason'],
    'manual_api_test.sh': ['advanceSeason'],
    'test_ai_competitors.sh': ['advanceSeason', 'getLeaderboard'],
    'test_infrastructure_gdd.sh': ['advanceSeason'],
    'test_organic_workflow.sh': ['advanceSeason'],
    'test_phase8_ai.sh': ['debugSetHansStorage'],
    'test_phase8_stress.sh': ['debugSetHansStorage'],
    'test_phase_gates.sh': ['advanceSeason'],
    'test_rankings.sh': ['getLeaderboard'],
    'test_seasonal_harvest.sh': ['advanceSeason'],
    'test_security_audit.sh': ['advanceSeason'],
    'test_weather.sh': ['advanceSeason'],
};

describe('legacy shell suite: the rot is pinned and cannot spread', () => {
    const reports = analyseScripts();

    it('still finds the scripts (guards against the scanner silently breaking)', () => {
        expect(reports.length).toBeGreaterThanOrEqual(20);
        expect(reports.some((r) => r.calledMethods.length > 0)).toBe(true);
    });

    it('no script has gained a call to a removed backend method', () => {
        const actual: Record<string, string[]> = {};
        for (const r of reports) {
            if (r.deadMethods.length > 0) actual[r.file] = r.deadMethods;
        }

        expect(
            actual,
            'The set of broken legacy scripts changed. If you FIXED or DELETED one, ' +
            'shrink KNOWN_BROKEN to match. If a script newly calls a dead method, ' +
            'that is a regression — fix the script, do not widen the snapshot.'
        ).toEqual(KNOWN_BROKEN);
    });

    it('reports the healthy scripts — these are the porting candidates', () => {
        const healthy = reports.filter((r) => r.deadMethods.length === 0).map((r) => r.file);
        // "Healthy" means only that every method name still exists. It does NOT
        // mean the script passes: the assertions are untyped Candid
        // string-matching and were never re-verified against current behaviour.
        console.log(`[legacy-sh] ${healthy.length}/${reports.length} scripts call only existing methods:\n  ${healthy.join('\n  ')}`);
        expect(healthy.length + Object.keys(KNOWN_BROKEN).length).toBe(reports.length);
    });

    it('no script has CRLF line endings (they fail under bash on Linux runners)', () => {
        const crlf = reports.filter((r) => r.hasCrlf).map((r) => r.file);
        expect(crlf, `CRLF found in: ${crlf.join(', ')}`).toEqual([]);
    });
});
