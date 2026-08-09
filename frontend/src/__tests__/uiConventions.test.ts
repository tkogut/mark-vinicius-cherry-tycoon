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

/**
 * Blanks out comment bodies while preserving line count and column offsets, so
 * a scan can report accurate `file:line` yet never flag prose.
 *
 * Needed because these conventions are documented in comments that necessarily
 * quote the thing they forbid — the build-badge comment cites the old "v3.8"
 * literal, and a naive line scan flagged it.
 */
function withoutComments(source: string): string {
    const blank = (match: string) => match.replace(/[^\n]/g, ' ');
    return source
        .replace(/\/\*[\s\S]*?\*\//g, blank)   // block comments, incl. {/* ... */}
        .replace(/(^|[^:])\/\/[^\n]*/g, (m, lead) => lead + blank(m.slice(lead.length)));
}

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

describe('build identity: the version is injected, never written by hand', () => {
    // The badge said "v3.8" for months. Nothing produced that number, nothing
    // incremented it, package.json read 0.0.0 and the repo had no tags — so the
    // one thing on screen claiming to identify the build was fiction. It is now
    // read from vite-injected constants; this stops a literal creeping back.
    // Both ends must allow start/end-of-line. Without `$` the first draft of
    // this test passed while App.tsx rendered a bare `v4.2` as the last thing
    // on its line — found by injecting exactly that, which is why guards get
    // broken on purpose before they are trusted.
    const VERSION_LITERAL = /(^|["'>\s])v?\d+\.\d+(\.\d+)?(["'<\s]|$)/;

    it('no .tsx file hardcodes a version string', () => {
        const offenders: string[] = [];
        for (const file of FILES) {
            const lines = withoutComments(readFileSync(file, 'utf8')).split('\n');
            lines.forEach((line, i) => {
                // Only lines that look like they are LABELLING a version, not
                // arbitrary decimals (durations, sizes, coordinates).
                if (!/version|v\d|build/i.test(line)) return;
                if (line.includes('__BUILD_') || line.includes('buildLabel') || line.includes('BUILD.')) return;
                if (VERSION_LITERAL.test(line)) {
                    offenders.push(`${relative(SRC, file)}:${i + 1}  ${line.trim().slice(0, 70)}`);
                }
            });
        }

        expect(
            offenders,
            'Import { buildLabel } from "@/lib/buildInfo" instead of writing a version:\n  ' +
            offenders.join('\n  ')
        ).toEqual([]);
    });

    it('package.json carries a valid semver, and it is not the placeholder', () => {
        const pkg = JSON.parse(readFileSync(join(SRC, '../package.json'), 'utf8'));
        expect(pkg.version, 'package.json has no version').toBeTruthy();
        expect(pkg.version, `"${pkg.version}" is not semver`).toMatch(/^\d+\.\d+\.\d+$/);
        expect(
            pkg.version,
            '0.0.0 is the never-touched default — set a real milestone version (CLAUDE.md → Releasing)'
        ).not.toBe('0.0.0');
    });

    it('the badge reads the injected build identity', () => {
        const app = readFileSync(join(SRC, 'App.tsx'), 'utf8');
        expect(app, 'App.tsx no longer renders the build badge').toContain('buildLabel()');
        expect(app, 'the badge should expose network + build time on hover').toContain('buildDetail()');
    });

    it('vite.config injects all three build constants', () => {
        const config = readFileSync(join(SRC, '../vite.config.ts'), 'utf8');
        for (const name of ['__BUILD_VERSION__', '__BUILD_SHA__', '__BUILD_TIME__']) {
            expect(config, `${name} is not defined in vite.config.ts`).toContain(name);
        }
    });
});

describe('UX-01: the version badge does not sit on top of the sidebar', () => {
    it('is anchored away from the top-left corner', () => {
        const app = readFileSync(join(SRC, 'App.tsx'), 'utf8');
        const badge = app.split('BUILD BADGE')[1]?.slice(0, 500) ?? '';
        expect(badge, 'BUILD BADGE block not found').not.toBe('');
        expect(
            badge,
            'top-left is where the sidebar logo lives — the badge covered the wrapped title'
        ).not.toMatch(/top-\d+ left-\d+/);
    });
});
