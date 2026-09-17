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
import { FERTILIZER_TYPES } from '@/lib/gameLogic';
import { FERTILIZER_TYPE_DISPLAY } from '@/lib/fertilizerTypes';
import { CherryParcel } from '@/declarations/backend.did';

import { ParcelCard } from '@/components/farm/ParcelCard';

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

function renderParcelCard(props: Partial<ParcelCardProps> = {}) {
    const onAction = (props.onAction ?? vi.fn()) as ParcelCardProps['onAction'] & ReturnType<typeof vi.fn>;
    return {
        onAction,
        ...render(
            <ParcelCard
                parcel={makeParcel(props.parcel as Partial<CherryParcel>)}
                onAction={onAction}
                currentSeason={{ Summer: null }}
                infrastructure={[]}
                currentPhase="Growth"
                {...props}
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
});
