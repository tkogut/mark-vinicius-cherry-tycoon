// @vitest-environment node
//
// Keeps the agent instruction layer honest.
//
// `CLAUDE.md` is read in full at the start of every session and is now a Task
// Router: a table mapping "the task you are about to do" to "the files that
// tell you how". That makes it load-bearing, and it makes stale routes worse
// than no routes — a row pointing at a moved file sends the reader somewhere
// that does not exist, and they will trust the table over their own search.
//
// So: every path the instruction files mention must resolve, and the files must
// stay inside their stated budget. Both are cheap to check and impossible to
// remember to check by hand.
//
// Modelled on open-mercato's `yarn agents:check-budget`, narrowed to what
// actually bites a two-file instruction layer.

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO_ROOT = resolve(__dirname, '../../..');

const INSTRUCTION_FILES = [
    { path: 'CLAUDE.md', maxBytes: 16_384 },
    { path: '.planning/LESSONS.md', maxBytes: 24_576 },
];

/**
 * Paths the instruction files legitimately name but that are not in the repo,
 * so they cannot resolve in a fresh checkout. Each needs a reason — this list
 * is an escape hatch, not a place to silence a genuinely broken route.
 */
const LOCAL_ONLY: Array<{ path: string; why: string }> = [
    {
        path: '.claude/settings.local.json',
        why: 'per-developer Claude Code settings, deliberately untracked; CLAUDE.md names it because that is where the .env hook denies live',
    },
];

/**
 * Backtick-quoted things that look like repo paths. Bare filenames (`main.mo`)
 * are deliberately excluded — they appear as shorthand next to a full path in
 * the same row, and resolving them would mean guessing which directory was
 * meant. Only strings with a separator, i.e. an actual claim about location.
 */
function referencedPaths(markdown: string): string[] {
    const inline = markdown.match(/`[^`\n]+`/g) ?? [];
    const linked = (markdown.match(/\]\(([^)]+)\)/g) ?? []).map((m) => m.slice(2, -1));

    const candidates = [
        ...inline.map((token) => token.slice(1, -1)),
        ...linked,
    ];

    return [...new Set(
        candidates
            .map((raw) => raw.trim().replace(/^\.\//, ''))
            // strip a trailing `:123` line reference and any `→ Section` suffix
            .map((raw) => raw.split(/\s|→/)[0].replace(/:\d+(-\d+)?$/, ''))
            .filter((raw) => raw.includes('/'))
            // not a path: prose with spaces, globs, URLs, shell/code fragments
            .filter((raw) => !/[\s()*|<>"']/.test(raw))
            .filter((raw) => !raw.startsWith('http'))
            .filter((raw) => !raw.includes('**'))
            // `a/b` inside prose like `+=`/`*=` or "miejska/wiejska"
            .filter((raw) => /^[A-Za-z0-9_.@/-]+$/.test(raw))
            .filter((raw) => /\.[a-z]{1,5}$|\/$/.test(raw))
    )];
}

describe.each(INSTRUCTION_FILES)('$path', ({ path, maxBytes }) => {
    const absolute = resolve(REPO_ROOT, path);

    it('exists', () => {
        expect(existsSync(absolute), `${path} is missing`).toBe(true);
    });

    it(`stays under its ${maxBytes / 1024} KB budget`, () => {
        // Past the budget the tail still technically loads here, but the file
        // has stopped being a routing layer and become documentation. Move
        // long-form content into the file it points at instead of raising this.
        const bytes = statSync(absolute).size;
        expect(
            bytes,
            `${path} is ${bytes} bytes. Move long-form content out rather than raising the budget.`
        ).toBeLessThanOrEqual(maxBytes);
    });

    it('every path it points at resolves', () => {
        const content = readFileSync(absolute, 'utf8');
        const exempt = new Set(LOCAL_ONLY.map((entry) => entry.path));
        const broken = referencedPaths(content).filter(
            (candidate) => !exempt.has(candidate) && !existsSync(resolve(REPO_ROOT, candidate))
        );

        expect(
            broken,
            `${path} routes the reader to paths that do not exist:\n  ${broken.join('\n  ')}`
        ).toEqual([]);
    });
});

describe('CLAUDE.md structure', () => {
    const content = readFileSync(resolve(REPO_ROOT, 'CLAUDE.md'), 'utf8');

    it('keeps the boundary-label sections', () => {
        // Always / Ask First / Never is the shape that makes hard rules
        // scannable. If a rule is added as prose somewhere else in the file it
        // will be skimmed past, which is how the dual-entrypoint constraint
        // used to read.
        for (const heading of ['## Always', '## Ask First', '## Never']) {
            expect(content, `missing ${heading}`).toContain(heading);
        }
    });

    it('keeps the Task Router and points it at Validation', () => {
        expect(content).toContain('## Task Router');
        expect(content).toContain('./validate.sh');
    });

    it('router rows are two-column table rows', () => {
        const routerSection = content.split('## Task Router')[1].split('\n## ')[0];
        const rows = routerSection
            .split('\n')
            .filter((line) => line.startsWith('|') && !line.startsWith('|---') && !line.startsWith('|------'));

        expect(rows.length, 'router looks empty').toBeGreaterThan(20);

        for (const row of rows) {
            const cells = row.split('|').filter((cell) => cell.trim().length > 0);
            // A section divider row is `| **Backend** | |` -> 1 cell after filtering.
            expect(
                cells.length,
                `malformed router row (expected task | guide): ${row}`
            ).toBeLessThanOrEqual(2);
        }
    });
});

describe('validate.sh', () => {
    const absolute = resolve(REPO_ROOT, 'validate.sh');

    it('exists and is executable', () => {
        // This only bites in CI. Locally the file was chmod'ed after being
        // written, so the working copy is executable while git still had it as
        // 100644 — meaning a fresh clone could not run `./validate.sh` at all.
        // Caught by the first PR run (`git update-index --chmod=+x` was the fix).
        expect(existsSync(absolute)).toBe(true);
        expect(statSync(absolute).mode & 0o111, 'validate.sh is not executable').toBeGreaterThan(0);
    });

    it('offers exactly the tiers CLAUDE.md documents', () => {
        const script = readFileSync(absolute, 'utf8');
        const claude = readFileSync(resolve(REPO_ROOT, 'CLAUDE.md'), 'utf8');

        for (const tier of ['fast', 'full', 'backend']) {
            expect(script, `validate.sh has no "${tier}" tier`).toMatch(
                new RegExp(`^\\s*${tier}\\)`, 'm')
            );
            expect(claude, `CLAUDE.md does not document the "${tier}" tier`).toContain(
                `./validate.sh ${tier}`
            );
        }
    });

    it('runs the same gates the package scripts define', () => {
        // Guards the specific rot where package.json grows a script that the
        // single gate never learns about.
        const script = readFileSync(absolute, 'utf8');
        for (const gate of ['test', 'lint', 'typecheck', 'build']) {
            expect(script, `validate.sh never runs npm run ${gate}`).toMatch(
                new RegExp(`npm run (--silent )?${gate}\\b`)
            );
        }
    });
});
