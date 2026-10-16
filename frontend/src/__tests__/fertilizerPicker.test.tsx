// ECON-01 (plan 03-07) — the fertilizer-type picker. `fertilizeParcel`'s type
// argument became real in plan 03-06 (validated, persisted, applied at
// harvest), but nothing in the UI let a player choose it: every call site
// sent a hardcoded literal. This file pins the picker's six E1 behaviors
// (03-UI-SPEC.md) on the parcel-card entry point (Task 1), then extends to
// the shared component and the orchard radial-menu entry point plus the
// organic warning (Task 2).

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createAuthWrapper } from '@/test-utils/providers';
import { FERTILIZER_TYPES, FERTILIZER_BLOCK_ORGANIC, FERTILIZER_BLOCK_SEASON } from '@/lib/gameLogic';
import { FERTILIZER_TYPE_DISPLAY } from '@/lib/fertilizerTypes';
import { CherryParcel } from '@/declarations/backend.did';

import { ParcelCard } from '@/components/farm/ParcelCard';
import { FertilizerTypeMenu } from '@/components/farm/FertilizerTypeMenu';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

/** Minimal CherryParcel fixture — only the fields ParcelCard actually reads. */
function makeParcel(overrides: Partial<CherryParcel> = {}): CherryParcel {
    return {
        id: 'parcel_001',
        pH: 6.5,
        region: {
            laborCostMultiplier: 1,
            marketSize: 1,
            province: { Opolskie: null },
            commune: 'Testowo',
            communeType: { Rural: null },
            county: 'Opole',
            population: 1000n,
        },
        lastFertilized: 0n,
        soilType: { SandyClay: null },
        organicConversionSeason: 0n,
        isOrganic: false,
        ownerId: 'owner',
        waterLevel: 0.5,
        fertility: 0.7,
        quality: 80n,
        permeability: 0.5,
        size: 0.5,
        lastHarvest: 0n,
        organicCertified: false,
        humidity: 0.5,
        plantedTrees: 100n,
        treeAge: 5n,
        ...overrides,
    };
}

type ParcelCardProps = React.ComponentProps<typeof ParcelCard>;
// `parcel` here is a fixture override, not a full CherryParcel — makeParcel
// merges it against defaults below, so the render helper accepts a partial.
type RenderOverrides = Partial<Omit<ParcelCardProps, 'parcel'>> & { parcel?: Partial<CherryParcel> };

function renderParcelCard(props: RenderOverrides = {}) {
    const onAction = (props.onAction ?? vi.fn()) as ParcelCardProps['onAction'] & ReturnType<typeof vi.fn>;
    const parcel = makeParcel(props.parcel);
    return {
        onAction,
        ...render(
            // `parcel`/`onAction` are spread LAST and deliberately override
            // whatever raw values `props` carries — `props.parcel` here is
            // typically a partial override object (e.g. `{ isOrganic: true }`),
            // and JSX resolves duplicate attributes right-to-left, so putting
            // `{...props}` last would silently replace the merged fixture with
            // that partial, dropping every other field `ParcelCard` reads.
            <ParcelCard
                currentSeason={{ Summer: null }}
                infrastructure={[]}
                currentPhase="Growth"
                {...props}
                parcel={parcel}
                onAction={onAction}
            />,
            { wrapper: createAuthWrapper() }
        ),
    };
}

describe('ECON-01: fertilizer-type picker (ParcelCard entry point, Task 1)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders exactly three items, each "Fertilize with {Type}" plus a one-line tradeoff caption', async () => {
        const user = userEvent.setup();
        renderParcelCard();

        const trigger = screen.getByRole('button', { name: /fertilize soil/i });
        await user.click(trigger);

        for (const type of FERTILIZER_TYPES) {
            expect(screen.getByText(`Fertilize with ${FERTILIZER_TYPE_DISPLAY[type].label}`)).toBeInTheDocument();
            expect(screen.getByText(FERTILIZER_TYPE_DISPLAY[type].caption)).toBeInTheDocument();
        }
        expect(screen.getAllByRole('menuitemradio')).toHaveLength(3);
    });

    it('selecting an item calls the dispatcher exactly once with that item\'s wire string, no confirm step', async () => {
        const user = userEvent.setup();
        const { onAction } = renderParcelCard();

        await user.click(screen.getByRole('button', { name: /fertilize soil/i }));
        await user.click(screen.getByText(`Fertilize with ${FERTILIZER_TYPE_DISPLAY.SyntheticIntensive.label}`));

        expect(onAction).toHaveBeenCalledTimes(1);
        expect(onAction).toHaveBeenCalledWith('fertilize', 'parcel_001', 'SyntheticIntensive');
    });

    it('every value the picker can send is a member of the shared FERTILIZER_TYPES constant', async () => {
        // Fresh render per type: after a selection the menu closes, and
        // clicking an already-open trigger toggles it shut rather than
        // reopening it, so a single shared render across the loop would
        // desync from the menu's open/closed state.
        for (const type of FERTILIZER_TYPES) {
            const user = userEvent.setup();
            const { onAction } = renderParcelCard();

            await user.click(screen.getByRole('button', { name: /fertilize soil/i }));
            await user.click(screen.getByText(`Fertilize with ${FERTILIZER_TYPE_DISPLAY[type].label}`));

            expect(onAction).toHaveBeenCalledTimes(1);
            const sentType = onAction.mock.calls[0][2];
            expect(FERTILIZER_TYPES as readonly string[]).toContain(sentType);
            expect(sentType).toBe(type);
            cleanup();
        }
    });

    it('disables the trigger while the fertilize mutation is in flight, preventing a second submit', async () => {
        renderParcelCard({ isFertilizing: true });

        const trigger = screen.getByRole('button', { name: /fertilize soil/i });
        expect(trigger).toBeDisabled();
    });

    it('does not disable the trigger when the mutation is not pending', () => {
        renderParcelCard({ isFertilizing: false });

        const trigger = screen.getByRole('button', { name: /fertilize soil/i });
        expect(trigger).not.toBeDisabled();
    });

    // ECON-REBALANCE reverses D-02: synthetic types are refused on organic parcels,
    // so the picker disables them (the backend refuses the same call).
    it.each([
        ['isOrganic', { isOrganic: true }],
        ['organicCertified', { organicCertified: true }],
    ])('when the parcel is %s, both synthetic items are disabled with a reason and Organic stays enabled', async (_name, flags) => {
        const user = userEvent.setup();
        const { onAction } = renderParcelCard({ parcel: flags as Partial<CherryParcel> });

        await user.click(screen.getByRole('button', { name: /fertilize soil/i }));

        const items = screen.getAllByRole('menuitemradio');
        const byName = (name: string) => items.find((el) => el.textContent?.includes(name))!;
        for (const name of ['Synthetic-Standard', 'Synthetic-Intensive']) {
            expect(byName(name)).toHaveAttribute('aria-disabled', 'true');
            expect(byName(name)).toHaveTextContent(FERTILIZER_BLOCK_ORGANIC);
        }
        expect(byName('Organic-Compatible')).not.toHaveAttribute('aria-disabled', 'true');

        await user.click(byName('Synthetic-Intensive'));
        expect(onAction).not.toHaveBeenCalled();
    });

    it('shows each type\'s price next to its caption, from the shared cost table', async () => {
        const user = userEvent.setup();
        renderParcelCard();

        await user.click(screen.getByRole('button', { name: /fertilize soil/i }));

        const items = screen.getAllByRole('menuitemradio');
        const text = (name: string) => items.find((el) => el.textContent?.includes(name))!.textContent;
        expect(text('Organic-Compatible')).toContain('650 PLN');
        expect(text('Synthetic-Standard')).toContain('500 PLN');
        expect(text('Synthetic-Intensive')).toContain('800 PLN');
    });

    it('disables every item for a parcel already fertilized this season', async () => {
        const user = userEvent.setup();
        renderParcelCard({ seasonNumber: 3, parcel: { lastFertilized: 3n } as Partial<CherryParcel> });

        await user.click(screen.getByRole('button', { name: /fertilize soil/i }));

        const items = screen.getAllByRole('menuitemradio');
        expect(items).toHaveLength(3);
        for (const el of items) {
            expect(el).toHaveAttribute('aria-disabled', 'true');
            expect(el).toHaveTextContent(FERTILIZER_BLOCK_SEASON);
        }
    });

    it('re-enables the items in the next season', async () => {
        const user = userEvent.setup();
        renderParcelCard({ seasonNumber: 4, parcel: { lastFertilized: 3n } as Partial<CherryParcel> });

        await user.click(screen.getByRole('button', { name: /fertilize soil/i }));

        for (const el of screen.getAllByRole('menuitemradio')) {
            expect(el).not.toHaveAttribute('aria-disabled', 'true');
        }
    });

    it('when the parcel is not organic, all three items show their normal captions', async () => {
        const user = userEvent.setup();
        renderParcelCard({ parcel: { isOrganic: false } as Partial<CherryParcel> });

        await user.click(screen.getByRole('button', { name: /fertilize soil/i }));

        for (const type of FERTILIZER_TYPES) {
            expect(screen.getByText(FERTILIZER_TYPE_DISPLAY[type].caption)).toBeInTheDocument();
        }
        expect(screen.queryByText(FERTILIZER_BLOCK_ORGANIC)).not.toBeInTheDocument();
    });
});

describe('ECON-01: shared FertilizerTypeMenu component consumed by both entry points (Task 2)', () => {
    // Rendered directly (rather than through ImperialOrchard's canvas-based
    // orchard view) for isolation and speed — ImperialOrchard's own wiring is
    // covered structurally (grep on angle/color/icon/phases/sizing being
    // unchanged, `FertilizerTypeMenu` usage count) per this task's acceptance
    // criteria; a full canvas hit-test simulation belongs to the Playwright
    // suite (Task 3), not jsdom.
    function renderMenu(isOrganic: boolean, onSelect = vi.fn()) {
        render(
            <DropdownMenu open>
                <DropdownMenuTrigger asChild>
                    <button>trigger</button>
                </DropdownMenuTrigger>
                <FertilizerTypeMenu isOrganic={isOrganic} isPending={false} onSelect={onSelect} />
            </DropdownMenu>
        );
        return { onSelect };
    }

    it('renders three radio items matching FERTILIZER_TYPES order', () => {
        renderMenu(false);
        const items = screen.getAllByRole('menuitemradio');
        expect(items).toHaveLength(FERTILIZER_TYPES.length);
    });

    it('calls onSelect with the wire string when an item is chosen', async () => {
        const user = userEvent.setup();
        const { onSelect } = renderMenu(false);

        await user.click(screen.getByText(`Fertilize with ${FERTILIZER_TYPE_DISPLAY.OrganicCompatible.label}`));

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith('OrganicCompatible');
    });

    it('shows the normal caption for Synthetic-Intensive when isOrganic is false', () => {
        renderMenu(false);
        expect(screen.getByText(FERTILIZER_TYPE_DISPLAY.SyntheticIntensive.caption)).toBeInTheDocument();
    });

    it('when isOrganic is true, disables both synthetic items with a destructive-styled reason', () => {
        renderMenu(true);

        const reasons = screen.getAllByText(FERTILIZER_BLOCK_ORGANIC);
        expect(reasons).toHaveLength(2);
        for (const reason of reasons) expect(reason.parentElement?.className).toMatch(/text-rose-400/); // the colour lives on the caption wrapper

        const items = screen.getAllByRole('menuitemradio');
        const organicItem = items.find((el) => el.textContent?.includes('Organic-Compatible'));
        expect(organicItem).not.toHaveAttribute('data-disabled');
        for (const name of ['Synthetic-Standard', 'Synthetic-Intensive']) {
            expect(items.find((el) => el.textContent?.includes(name))).toHaveAttribute('data-disabled');
        }
    });
});
