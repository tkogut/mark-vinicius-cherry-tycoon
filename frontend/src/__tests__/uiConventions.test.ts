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
