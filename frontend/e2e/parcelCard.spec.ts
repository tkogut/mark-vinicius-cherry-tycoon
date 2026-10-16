// L4 E2E — the fertilizer-type picker on the parcel-card entry point (ECON-01,
// plan 03-07 Task 3), driven through a dedicated deterministic dev harness.
// ParcelCard is fully prop-driven (no backend/auth needed), so this needs no
// canister — see the orchard/marketplace specs for the same pattern.
//
// This is the layer that catches a clipped dropdown or a missing glyph that a
// jsdom component test (fertilizerPicker.test.tsx) cannot observe.

import { test, expect, type Page } from '@playwright/test';

function harnessUrl(params: Record<string, string | number> = {}) {
    const qs = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    return `/parcel-card-harness.html${qs ? `?${qs}` : ''}`;
}

async function openHarness(page: Page, params: Record<string, string | number> = {}) {
    await page.goto(harnessUrl(params));
    await expect(page.getByText(/^harness —/)).toBeVisible();
}

async function openPicker(page: Page, params: Record<string, string | number> = {}) {
    await openHarness(page, params);
    await page.getByRole('button', { name: /fertilize soil/i }).click();
    await expect(page.getByRole('menu')).toBeVisible();
}

test.describe('fertilizer-type picker (ECON-01, plan 03-07) — parcel card entry point', () => {
    test('opens with three labelled options, each with a one-line tradeoff caption', async ({ page }) => {
        await openPicker(page);

        await expect(page.getByRole('menuitemradio')).toHaveCount(3);
        await expect(page.getByText('Fertilize with Organic-Compatible')).toBeVisible();
        await expect(page.getByText('Fertilize with Synthetic-Standard')).toBeVisible();
        await expect(page.getByText('Fertilize with Synthetic-Intensive')).toBeVisible();
        await expect(page.getByText('No yield bonus, organic-safe')).toBeVisible();
        await expect(page.getByText('Baseline yield')).toBeVisible();
        await expect(page.getByText('+5% yield, not organic-safe')).toBeVisible();
    });

    // ECON-REBALANCE: synthetic types are refused on organic parcels (reverses D-02's
    // display-only warning), so they render disabled with the reason.
    test('disables both synthetic types on an organic parcel and keeps Organic-Compatible enabled', async ({ page }) => {
        await openPicker(page, { organic: 'true' });

        for (const name of ['Synthetic-Standard', 'Synthetic-Intensive']) {
            const item = page.getByRole('menuitemradio').filter({ hasText: name });
            await expect(item).toHaveAttribute('aria-disabled', 'true');
            await expect(item).toContainText('Not allowed on organic parcels');
        }
        await expect(page.getByRole('menuitemradio').filter({ hasText: 'Organic-Compatible' }))
            .not.toHaveAttribute('aria-disabled', 'true');
    });

    test('shows each type\'s price', async ({ page }) => {
        await openPicker(page);

        await expect(page.getByRole('menuitemradio').filter({ hasText: 'Organic-Compatible' })).toContainText('650 PLN');
        await expect(page.getByRole('menuitemradio').filter({ hasText: 'Synthetic-Standard' })).toContainText('500 PLN');
        await expect(page.getByRole('menuitemradio').filter({ hasText: 'Synthetic-Intensive' })).toContainText('800 PLN');
    });

    test('when the parcel is not organic, all three items show their normal captions', async ({ page }) => {
        await openPicker(page, { organic: 'false' });

        await expect(page.getByText('+5% yield, not organic-safe')).toBeVisible();
        await expect(page.getByText('Not allowed on organic parcels')).toHaveCount(0);
    });

    test('long-text backstop: labels fit on one line and captions truncate with ellipsis rather than wrap', async ({ page }) => {
        await openPicker(page, { organic: 'true' });

        const items = page.getByRole('menuitemradio');
        const count = await items.count();
        expect(count).toBe(3);

        for (let i = 0; i < count; i++) {
            const measurements = await items.nth(i).evaluate((el) => {
                const spans = el.querySelectorAll('span');
                const labelEl = spans[1] as HTMLElement;
                const captionEl = spans[2] as HTMLElement;
                const captionStyle = getComputedStyle(captionEl);
                return {
                    label: labelEl.textContent,
                    labelLineCount: Math.round(
                        labelEl.getBoundingClientRect().height / parseFloat(getComputedStyle(labelEl).lineHeight)
                    ),
                    captionWhiteSpace: captionStyle.whiteSpace,
                    captionTextOverflow: captionStyle.textOverflow,
                };
            });

            expect(measurements.labelLineCount, `label "${measurements.label}" wrapped`).toBe(1);
            expect(measurements.captionWhiteSpace).toBe('nowrap');
            expect(measurements.captionTextOverflow).toBe('ellipsis');
        }

        const contentBox = await page.getByRole('menu').boundingBox();
        // Still a growth guard, not a size spec: w-72 is 288px outer (QUAL-12 widened it from 256
        // so the 14px label fits on one line in wide fallback fonts).
        expect(contentBox?.width).toBeLessThan(300);
    });

    test('the existing 32px fertilize trigger button is unchanged', async ({ page }) => {
        // 03-UI-SPEC.md's Spacing Scale forbids resizing this button as a side
        // effect of adding the picker (h-8 w-8 = 32px, below the 44px minimum,
        // shared by every other parcel action and out of scope for this phase).
        await openHarness(page);
        const trigger = page.getByRole('button', { name: /fertilize soil/i });
        const box = await trigger.boundingBox();
        expect(box?.width).toBeCloseTo(32, 0);
        expect(box?.height).toBeCloseTo(32, 0);
    });
});
