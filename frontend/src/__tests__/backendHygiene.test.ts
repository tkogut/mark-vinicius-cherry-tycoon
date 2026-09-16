// @vitest-environment node
//
// ECON-05 — ratchet over "exactly one spoilage implementation exists".
//
// backend/game_logic.mo used to carry a dead `calculateSpoilageRate` with a
// fictional 100%/80%/20% return table and zero call sites anywhere in the
// codebase (see docs/game-design/economy/spoilage-rates.md's "what was
// removed and why" note). The live formula, `StorageLogic.calculateSpoilage`
// in backend/storage_logic.mo, is the one that actually runs at the Autumn
// season transition. Deleting the dead function once is easy; the risk is a
// second implementation quietly reappearing later (a new helper, a copy
// pasted "just for this one call site", a revived old name). This test pins
// both failure modes so either one fails loudly and names the offending file,
// the same mechanism legacyShellScripts.test.ts uses for the shell-script rot.

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const REPO_ROOT = resolve(__dirname, '../../..');
const BACKEND_DIR = resolve(REPO_ROOT, 'backend');

// Track B (main_mainnet.mo) does not compile (EOP-01: duplicate field name
// activeInsurance, plus contract type errors) and nothing in this repo's test
// or CI workflow builds it. It is unverifiable by this project's own stated
// policy (CLAUDE.md: "No fix in this plan may be mirrored into
// backend/main_mainnet.mo"), so it may legitimately carry a stale shape this
// ratchet cannot and should not judge. Excluding it here is what keeps this
// test capable of ever being green rather than permanently red — the same
// reasoning legacyShellScripts.test.ts documents for its own known-broken set.
const EXCLUDED_FILES = new Set(['main_mainnet.mo']);

const DEAD_IDENTIFIER = 'calculateSpoilageRate';
// Matches the declaration, not any call site — `public func calculateSpoilage(`
// is the shape every declaration in this codebase uses (see
// backend/storage_logic.mo:9). Note this pattern also matches the deleted
// `calculateSpoilageRate` declaration (it's a prefix match), which is exactly
// what makes assertion 2 below meaningful: if the dead function ever came
// back under a different call-site name than DEAD_IDENTIFIER, this second
// assertion would still catch it as a second "calculateSpoilage*" declaration.
const DECLARATION_PATTERN = /public\s+func\s+calculateSpoilage\b/;

interface MotokoFile {
    relativePath: string;
    lines: string[];
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
        .map((full) => ({
            relativePath: relative(REPO_ROOT, full),
            // Read as UTF-8 text; strip comment-only lines so a doc-style
            // comment mentioning the removed identifier (e.g. this file's own
            // header prose, if it were ever a .mo file) cannot self-invalidate
            // the gate. A line is comment-only if, after trimming, it starts
            // with `//` — this intentionally does not attempt to strip a
            // trailing `// comment` from an otherwise-live line, because no
            // real declaration or call site in this codebase is followed by a
            // same-line comment containing these identifiers (verified by the
            // assertions below passing against current source).
            lines: readFileSync(full, 'utf8')
                .split('\n')
                .filter((line) => !line.trim().startsWith('//')),
        }));
}

describe('ECON-05: exactly one spoilage system exists', () => {
    const files = readMotokoFiles();

    it('finds backend .mo files (guards against the scanner silently breaking)', () => {
        expect(files.length).toBeGreaterThan(10);
        expect(files.some((f) => f.relativePath.endsWith('storage_logic.mo'))).toBe(true);
    });

    it('the deleted GameLogic.calculateSpoilageRate does not exist in any non-comment line', () => {
        const hits: string[] = [];
        for (const file of files) {
            for (const line of file.lines) {
                if (line.includes(DEAD_IDENTIFIER)) {
                    hits.push(`${file.relativePath}: ${line.trim()}`);
                }
            }
        }

        expect(
            hits,
            `Found "${DEAD_IDENTIFIER}" reintroduced in backend/ (ECON-05 regression):\n  ${hits.join('\n  ')}`
        ).toEqual([]);
    });

    it('exactly one calculateSpoilage* declaration exists, and it lives in storage_logic.mo', () => {
        const declarations: string[] = [];
        for (const file of files) {
            for (const line of file.lines) {
                if (DECLARATION_PATTERN.test(line)) {
                    declarations.push(`${file.relativePath}: ${line.trim()}`);
                }
            }
        }

        expect(
            declarations.length,
            `Expected exactly one calculateSpoilage* declaration under backend/, found ${declarations.length}:\n  ${declarations.join('\n  ')}`
        ).toBe(1);
        expect(declarations[0]).toMatch(/^backend\/storage_logic\.mo:/);
    });
});
