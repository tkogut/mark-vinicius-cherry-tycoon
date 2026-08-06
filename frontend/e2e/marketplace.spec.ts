// L4 E2E — Marketplace, driven through the deterministic dev harness.
//
// The high-value assertion here is the PHASE GATE (QUAL-07): Etap 1 found the
// UI enabling purchases during `Maintenance` while the canister's
// `upgradeInfrastructure` requires `#Investment`, so the button was live and
// the click failed. That was fixed at the unit level; this proves it in a real
// browser against the real component, which is where the player meets it.

import { test, expect, type Page } from '@playwright/test';

const BUILDINGS = ['Warehouse', 'Cold Storage', 'Processing Plant', 'Social Facilities'];
const MACHINES = ['Modern Tractor', 'Mechanical Shaker', 'Precision Sprayer', 'Branch Pruner'];

function harnessUrl(params: Record<string, string | number> = {}) {
    const qs = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    return `/marketplace-harness.html${qs ? `?${qs}` : ''}`;
}

/** Waits for the harness banner, which only renders once React has mounted. */
async function openHarness(page: Page, params: Record<string, string | number> = {}) {
    await page.goto(harnessUrl(params));
    await expect(page.getByText(/^harness —/)).toBeVisible();
}

/**
 * The card element for a named catalog item. Anchored on the Card component's
 * own `relative overflow-hidden` classes (Marketplace.tsx) rather than a bare
 * `div` filter — the latter matched an ancestor that did not contain the
 * card's button.
 */
function card(page: Page, name: string) {
    return page.locator('div.relative.overflow-hidden').filter({ hasText: name });
}

test.describe('Marketplace catalog renders', () => {
    test('shows all four buildings and all four machines', async ({ page }) => {
        await openHarness(page);

        for (const name of [...BUILDINGS, ...MACHINES]) {
            await expect(page.getByText(name, { exact: true })).toBeVisible();
        }
    });

    test('building cards use real seasonal sprites, not generic icons', async ({ page }) => {
        await openHarness(page, { season: 'Autumn' });

        // One <img> per building card, each pointing at the autumn asset.
        const sprites = page.locator('img[src*="/assets/buildings/"]');
        await expect(sprites).toHaveCount(BUILDINGS.length);

        for (let i = 0; i < BUILDINGS.length; i++) {
            await expect(sprites.nth(i)).toHaveAttribute('src', /\/autumn\.png$/);
        }
    });

    test('machine cards render a procedural canvas thumbnail', async ({ page }) => {
        await openHarness(page);
        // orchardMachines.ts draws each machine on a 200x200 canvas.
        await expect(page.locator('canvas[width="200"][height="200"]')).toHaveCount(MACHINES.length);
    });
});

test.describe('seasonal sprite swap', () => {
    for (const season of ['Spring', 'Summer', 'Autumn', 'Winter'] as const) {
        test(`season=${season} loads the ${season.toLowerCase()} artwork`, async ({ page }) => {
            await openHarness(page, { season });
            const first = page.locator('img[src*="/assets/buildings/"]').first();
            await expect(first).toHaveAttribute('src', new RegExp(`/${season.toLowerCase()}\\.png$`));

            // The image must actually decode — a 404 would still leave the
            // <img> in the DOM with the right src but zero natural width.
            await expect
                .poll(() => first.evaluate((el: HTMLImageElement) => el.naturalWidth), { timeout: 10_000 })
                .toBeGreaterThan(0);
        });
    }
});

test.describe('level-based art tier', () => {
    test('level 0 (unowned) uses the l1 art set', async ({ page }) => {
        await openHarness(page, { season: 'Spring', level: 0 });
        const srcs = await page.locator('img[src*="/assets/buildings/"]').evaluateAll(
            (els) => els.map((e) => (e as HTMLImageElement).getAttribute('src') ?? '')
        );
        expect(srcs.some((s) => s.includes('warehouse-l1/'))).toBe(true);
        expect(srcs.some((s) => s.includes('cold-storage-l1/'))).toBe(true);
        expect(srcs.some((s) => s.includes('-l2/'))).toBe(false);
    });

    test('level 2 (upgraded) swaps Warehouse and Cold Storage to the l2 art set', async ({ page }) => {
        await openHarness(page, { season: 'Spring', level: 2 });
        const srcs = await page.locator('img[src*="/assets/buildings/"]').evaluateAll(
            (els) => els.map((e) => (e as HTMLImageElement).getAttribute('src') ?? '')
        );
        expect(srcs.some((s) => s.includes('warehouse-l2/'))).toBe(true);
        expect(srcs.some((s) => s.includes('cold-storage-l2/'))).toBe(true);
        // Processing Plant and Social Facilities only have one art tier so far,
        // so they must keep rendering rather than 404 into a broken image.
        expect(srcs.some((s) => s.includes('processing-plant/'))).toBe(true);
        expect(srcs.some((s) => s.includes('social-facilities/'))).toBe(true);
    });

    test('owned items show Installed instead of a price', async ({ page }) => {
        await openHarness(page, { level: 2 });
        await expect(page.getByText('Installed').first()).toBeVisible();
        await expect(page.getByText('OWNED').first()).toBeVisible();
    });
});

// ── the QUAL-07 regression, proven in a browser ─────────────────────────────
test.describe('phase gate (QUAL-07)', () => {
    test('purchases are enabled during Investment', async ({ page }) => {
        await openHarness(page, { phase: 'Investment' });

        const buttons = page.getByRole('button', { name: /PURCHASE/ });
        await expect(buttons.first()).toBeEnabled();
    });

    test('purchases are DISABLED during Maintenance — backend requires Investment', async ({ page }) => {
        // upgradeInfrastructure (backend/main.mo:2118) rejects anything but
        // #Investment. Before the QUAL-07 fix the UI left these buttons live
        // here, so the click failed with #SeasonalRestriction.
        await openHarness(page, { phase: 'Maintenance' });

        const buttons = page.getByRole('button', { name: /PURCHASE/ });
        const count = await buttons.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(buttons.nth(i)).toBeDisabled();
        }
    });

    for (const phase of ['Hiring', 'Growth', 'Harvest', 'Market', 'Storage', 'CutAndPrune'] as const) {
        test(`purchases are disabled during ${phase}`, async ({ page }) => {
            await openHarness(page, { phase });
            const buttons = page.getByRole('button', { name: /PURCHASE/ });
            if (await buttons.count() > 0) {
                await expect(buttons.first()).toBeDisabled();
            }
        });
    }
});

test.describe('affordability', () => {
    test('an unaffordable item cannot be purchased even in Investment', async ({ page }) => {
        // Processing Plant costs 100_000.
        await openHarness(page, { phase: 'Investment', cash: 1000 });

        const plant = card(page, 'Processing Plant');
        await expect(plant.getByRole('button', { name: /PURCHASE/ })).toBeDisabled();
    });
});
