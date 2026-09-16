// @vitest-environment node
//
// UX-10 / UX-11 — two conventions that only break on someone else's machine,
// which is why they survived months of local development and were both found
// in one Playground screenshot pass on 2026-08-07.
//
//   UX-10  Emoji used as UI icons render as tofu boxes (▯) wherever no emoji
//          font is installed. On the deployed build the orchard readout said
//          "▯ 50 trees", "▯ Opole, Opole, Opolskie". Every developer machine
//          has an emoji font; a bare headless Chromium does not, and neither
//          do plenty of Linux clients.
//
//   UX-11  The game's currency is PLN. A literal `$` in front of a value was
//          simply the wrong currency, shown next to other figures correctly
//          labelled PLN.
//
// Both are the kind of thing a reviewer skims past, so they are pinned here
// rather than left to discipline.

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const SRC = resolve(__dirname, '..');

function tsxFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            if (entry === 'declarations' || entry === '__tests__') continue;
            out.push(...tsxFiles(full));
        } else if (entry.endsWith('.tsx')) {
            out.push(full);
        }
    }
    return out;
}

const FILES = tsxFiles(SRC);

/** Pictographic ranges. Deliberately excludes typographic marks the UI does
 *  use as text — `·` separators, arrows, en dashes — which are plain glyphs
 *  present in every font, not icons. */
//  The variation selector is matched as its own alternative rather than as a
//  class member: inside a class it combines with the preceding range and
//  `no-misleading-character-class` rejects it.
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]|\u{FE0F}/u;

describe('UX-10: icons are lucide SVGs, never emoji', () => {
    it('no .tsx file contains an emoji', () => {
        const offenders: string[] = [];
        for (const file of FILES) {
            const lines = readFileSync(file, 'utf8').split('\n');
            lines.forEach((line, i) => {
                const hit = line.match(EMOJI);
                if (hit) offenders.push(`${relative(SRC, file)}:${i + 1}  ${hit[0]}  ${line.trim().slice(0, 60)}`);
            });
        }

        expect(
            offenders,
            'Emoji render as tofu boxes without an emoji font (confirmed on the deployed build).\n' +
            'Use a lucide-react icon instead:\n  ' + offenders.join('\n  ')
        ).toEqual([]);
    });
});

describe('UX-11: money is shown in PLN, never with a dollar sign', () => {
    it('no JSX renders a literal $ in front of a value', () => {
        // Matches a `$` that is immediately followed by a JSX expression and is
        // NOT a `${}` template interpolation (those are preceded by a backtick
        // somewhere earlier on the line, inside a template literal).
        const offenders: string[] = [];
        for (const file of FILES) {
            const lines = readFileSync(file, 'utf8').split('\n');
            lines.forEach((line, i) => {
                if (line.includes('`')) return;          // template literal, `${}` is interpolation
                if (/[>\s"']\$\{/.test(line)) {
                    offenders.push(`${relative(SRC, file)}:${i + 1}  ${line.trim().slice(0, 70)}`);
                }
            });
        }

        expect(
            offenders,
            'The game is priced in PLN. Write `{value} PLN`, not `${value}`:\n  ' + offenders.join('\n  ')
        ).toEqual([]);
    });
});

describe('UX-01: the sidebar header cannot clip its own title', () => {
    const sidebar = readFileSync(join(SRC, 'components/layout/Sidebar.tsx'), 'utf8');

    it('the logo area grows with its content instead of being a fixed height', () => {
        // `h-16` + a two-line title + a subtitle overflowed onto the first nav
        // item on every screen, and worse in de/es where the title is longer.
        const logoArea = sidebar.split('Logo Area')[1]?.split('Navigation')[0] ?? '';
        expect(logoArea).toContain('min-h-16');
        expect(logoArea, 'a fixed h-16 is what caused UX-01').not.toMatch(/className="h-16\s/);
    });

    it('the title can shrink rather than push the box open', () => {
        const logoArea = sidebar.split('Logo Area')[1]?.split('Navigation')[0] ?? '';
        expect(logoArea).toContain('min-w-0');
    });
});

describe('UX-01: the version badge does not sit on top of the sidebar', () => {
    it('is anchored away from the top-left corner', () => {
        const app = readFileSync(join(SRC, 'App.tsx'), 'utf8');
        const badge = app.split('VERSION TAG')[1]?.slice(0, 400) ?? '';
        expect(badge, 'VERSION TAG block not found').not.toBe('');
        expect(
            badge,
            'top-left is where the sidebar logo lives — the badge covered the wrapped title'
        ).not.toMatch(/top-\d+ left-\d+/);
    });
});

describe('ECON-07: AI archetype names have one canonical scheme', () => {
    // backend/competitor_logic.mo is the naming authority (03-CONTEXT.md
    // "Claude's Discretion" note) — read its three archetype names off disk
    // rather than re-typing them, so this test tracks the backend instead of
    // a second hand transcription that could itself drift.
    const competitorLogicSrc = readFileSync(
        resolve(SRC, '../../backend/competitor_logic.mo'),
        'utf8'
    );
    const CANONICAL_NAMES = Array.from(
        competitorLogicSrc.matchAll(/name\s+=\s+"([A-Za-z]+)/g)
    ).map((m) => m[1]);

    // The three Polish person-names ECON-07 supersedes, replaced everywhere
    // under frontend/src by the backend's canonical Marek/Kasia/Hans.
    // Built from [first, last] pairs and joined at runtime, rather than
    // written out as contiguous "First Last" literals, so this ratchet's own
    // definition of the forbidden strings does not itself match a
    // full-repo grep for those same strings (the same reason the UX-10 emoji
    // ratchet above uses Unicode ranges instead of literal emoji glyphs).
    const SUPERSEDED_NAMES = [
        ['Jan', 'Kowalski'],
        ['Anna', 'Nowak'],
        ['Piotr', 'Wiśniewski'],
    ].map(([first, last]) => `${first} ${last}`);

    // Walks .ts AND .tsx (gddTemplate.ts, the one file that still needed
    // fixing, is a plain .ts reference/template file — the emoji/PLN
    // ratchets above only walk .tsx and would have missed it). Scoped to
    // frontend/src only, so this plan file and .planning/ docs that
    // legitimately discuss the rename stay out of scope.
    function srcFiles(dir: string): string[] {
        const out: string[] = [];
        for (const entry of readdirSync(dir)) {
            const full = join(dir, entry);
            if (statSync(full).isDirectory()) {
                if (entry === 'declarations' || entry === '__tests__') continue;
                out.push(...srcFiles(full));
            } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
                out.push(full);
            }
        }
        return out;
    }
    const ALL_SRC_FILES = srcFiles(SRC);

    it('backend/competitor_logic.mo defines exactly 3 canonical archetype names', () => {
        // Guards the test itself: if the parse regex or the source file ever
        // stops yielding exactly 3 names, the second assertion below would
        // pass vacuously (an empty CANONICAL_NAMES list is trivially "all
        // present"). This must never be 0 or 1 or variable (edge: ECON-07).
        expect(CANONICAL_NAMES).toEqual(['Marek', 'Kasia', 'Hans']);
    });

    it('no file under frontend/src contains a superseded archetype person-name', () => {
        const offenders: string[] = [];
        for (const file of ALL_SRC_FILES) {
            const lines = readFileSync(file, 'utf8').split('\n');
            lines.forEach((line, i) => {
                for (const name of SUPERSEDED_NAMES) {
                    if (line.includes(name)) {
                        offenders.push(`${relative(SRC, file)}:${i + 1}  "${name}"  ${line.trim().slice(0, 70)}`);
                    }
                }
            });
        }

        expect(
            offenders,
            "backend/competitor_logic.mo's canonical Marek/Kasia/Hans is the single " +
            'naming scheme (ECON-07) — a superseded name reappeared:\n  ' + offenders.join('\n  ')
        ).toEqual([]);
    });

    it('gddTemplate.ts still contains all three canonical names (so the first assertion cannot be satisfied by deletion)', () => {
        const gddTemplate = readFileSync(join(SRC, 'lib/gddTemplate.ts'), 'utf8');
        for (const name of CANONICAL_NAMES) {
            expect(
                gddTemplate,
                `Expected canonical archetype name "${name}" (from competitor_logic.mo) in gddTemplate.ts`
            ).toContain(name);
        }
    });
});
