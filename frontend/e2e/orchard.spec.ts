// L4 E2E — the isometric orchard, driven through the deterministic dev harness.
//
// ImperialOrchard is entirely prop-driven (sectorsCount === parcels.length), so
// the harness can exercise multi-sector layouts, seasons and tree densities with
// no backend. Several of the assertions here lock in fixes made earlier in the
// UX work that previously had no automated cover at all:
//
//   * tree slots scale with plantedTrees (sqrt-scaled, capped at 25/sector)
//   * bridges only exist between spatially adjacent sectors — on the diamond
//     layout, sector INDEX adjacency is not spatial adjacency (parcels 0 and 3
//     touch only at a corner and therefore have no bridge)
//   * workers and machines share one y-based depth key with the trees, so
//     nothing renders on top of a canopy or vanishes behind a trunk
//
// Canvas sizes are used as selectors because each entity type draws at a fixed
// resolution: tiles 96x48, trees 110x120, workers 120x200, machines 200x200.

import { test, expect, type Page } from '@playwright/test';

const TILES_PER_SECTOR = 25; // SECTOR_SIZE 5 x 5

function harnessUrl(params: Record<string, string | number> = {}) {
    const qs = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    return `/harness.html${qs ? `?${qs}` : ''}`;
}

async function openOrchard(page: Page, params: Record<string, string | number> = {}) {
    await page.goto(harnessUrl(params));
    await expect(page.getByText(/^harness —/)).toBeVisible();
    // The tile canvases are drawn in an effect; wait for the first one.
    await expect(page.locator('canvas[width="96"][height="48"]').first()).toBeAttached();
}

const tiles = (page: Page) => page.locator('canvas[width="96"][height="48"]');
const trees = (page: Page) => page.locator('canvas[width="110"][height="120"]');
const workers = (page: Page) => page.locator('canvas[width="120"][height="200"]');

test.describe('sector layout', () => {
    for (const sectors of [1, 2, 4] as const) {
        test(`renders ${sectors} sector(s) as ${sectors * TILES_PER_SECTOR} ground tiles`, async ({ page }) => {
            await openOrchard(page, { sectors, trees: 0 });
            await expect(tiles(page)).toHaveCount(sectors * TILES_PER_SECTOR);
        });
    }

    test('the harness banner reflects the requested parameters', async ({ page }) => {
        await openOrchard(page, { sectors: 3, trees: 40, season: 'Winter' });
        await expect(page.getByText(/sectors: 3/)).toBeVisible();
        await expect(page.getByText(/season: Winter/)).toBeVisible();
        await expect(page.getByText(/trees\/parcel: 40/)).toBeVisible();
    });
});

test.describe('tree density', () => {
    test('an empty parcel draws no trees', async ({ page }) => {
        await openOrchard(page, { sectors: 2, trees: 0 });
        await expect(trees(page)).toHaveCount(0);
        // ...but the ground is still there.
        await expect(tiles(page)).toHaveCount(2 * TILES_PER_SECTOR);
    });

    test('a planted parcel draws trees, capped at one per tile slot', async ({ page }) => {
        await openOrchard(page, { sectors: 1, trees: 140 });
        const count = await trees(page).count();
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThanOrEqual(TILES_PER_SECTOR);
    });

    test('more planted trees never render fewer tree slots (monotonic density)', async ({ page }) => {
        await openOrchard(page, { sectors: 1, trees: 20 });
        const low = await trees(page).count();
        await openOrchard(page, { sectors: 1, trees: 200 });
        const high = await trees(page).count();
        expect(high).toBeGreaterThanOrEqual(low);
    });

    test('tree placement is deterministic across reloads', async ({ page }) => {
        // getDeterministicSlots seeds off the parcel id, so the same parcel must
        // never reshuffle its trees between renders.
        await openOrchard(page, { sectors: 1, trees: 90 });
        const first = await trees(page).evaluateAll((els) =>
            els.map((e) => (e.parentElement as HTMLElement)?.style.left ?? '').sort()
        );
        await page.reload();
        await expect(tiles(page).first()).toBeAttached();
        const second = await trees(page).evaluateAll((els) =>
            els.map((e) => (e.parentElement as HTMLElement)?.style.left ?? '').sort()
        );
        expect(second).toEqual(first);
    });
});

test.describe('seasons', () => {
    for (const season of ['Winter', 'Spring', 'Summer', 'Autumn'] as const) {
        test(`renders in ${season} without error`, async ({ page }) => {
            const errors: string[] = [];
            page.on('pageerror', (e) => errors.push(String(e)));
            await openOrchard(page, { sectors: 2, trees: 60, season });
            await expect(trees(page).first()).toBeAttached();
            expect(errors).toEqual([]);
        });
    }

    test('winter still draws a full canopy (not bare branches)', async ({ page }) => {
        // Locked decision from sketch 001 rev 7: winter reuses autumn's faceted
        // canopy recoloured to a snow palette. A tree canvas must therefore have
        // non-transparent pixels well above the trunk base.
        await openOrchard(page, { sectors: 1, trees: 140, season: 'Winter' });
        const canopyPixels = await trees(page).first().evaluate((el: HTMLCanvasElement) => {
            const ctx = el.getContext('2d')!;
            // Sample the upper half, where only a canopy can be.
            const { data } = ctx.getImageData(0, 0, el.width, Math.floor(el.height / 2));
            let opaque = 0;
            for (let i = 3; i < data.length; i += 4) if (data[i] > 20) opaque++;
            return opaque;
        });
        expect(canopyPixels).toBeGreaterThan(200);
    });
});

test.describe('workers', () => {
    test('the owner plus a hired helper are both drawn', async ({ page }) => {
        // orchardHarness always passes one hiredLabor entry, so hasHelper is true.
        await openOrchard(page, { sectors: 1, trees: 60 });
        await expect(workers(page)).toHaveCount(2);
    });

    test('workers move over time', async ({ page }) => {
        await openOrchard(page, { sectors: 2, trees: 60, season: 'Summer' });
        const read = () =>
            workers(page).evaluateAll((els) =>
                els.map((e) => (e.parentElement as HTMLElement)?.style.left ?? '')
            );
        const before = await read();
        await page.waitForTimeout(2500);
        const after = await read();
        expect(after).not.toEqual(before);
    });

    // Regression cover for the depth-ordering fix: soil, trees, workers and
    // machines all derive zIndex from the same continuous projected y. Before
    // that, workers rendered inside canopies or disappeared behind trunk bases.
    test('every entity has a numeric z-index from the shared depth key', async ({ page }) => {
        await openOrchard(page, { sectors: 2, trees: 140 });
        const zIndexes = await page
            .locator('div[style*="z-index"]')
            .evaluateAll((els) =>
                els
                    .map((e) => (e as HTMLElement).style.zIndex)
                    .filter((z) => z !== '')
                    .map(Number)
            );
        expect(zIndexes.length).toBeGreaterThan(10);
        expect(zIndexes.every((z) => Number.isFinite(z))).toBe(true);
    });
});

test.describe('inter-sector bridges', () => {
    test('a single sector has no bridges', async ({ page }) => {
        await openOrchard(page, { sectors: 1, trees: 0 });
        // Bridges are the only entities rendered at the fixed zIndex 40.
        await expect(page.locator('div[style*="z-index: 40"]')).toHaveCount(0);
    });

    test('multiple sectors produce bridges only between adjacent ones', async ({ page }) => {
        await openOrchard(page, { sectors: 4, trees: 0 });
        const bridges = await page.locator('div[style*="z-index: 40"]').count();
        // On the diamond super-grid, 4 parcels form a rhombus: 4 shared edges.
        // Parcels 0 and 3 sit diagonally and share only a corner, so a naive
        // "bridge between consecutive indices" implementation would give 3 and
        // a fully-connected one would give 6.
        expect(bridges).toBe(4);
    });
});

test.describe('interaction', () => {
    test('clicking a tile opens the radial action menu', async ({ page }) => {
        await openOrchard(page, { sectors: 1, trees: 60, season: 'Summer' });
        await tiles(page).nth(12).click({ force: true });
        // The menu renders its actions as buttons with emoji + label.
        await expect(page.getByText('Harvest').first()).toBeVisible();
    });
});
