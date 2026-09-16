// ECON-06 — CompetitorsPanel.tsx read a field the backend does not have
// (`comp.baseCapacity`, via an untyped `comp: any` map callback), which
// produced `NaN%` "Market Share" for every AI competitor and never had a
// test to catch it. This file pins the real field (`productionCapacity`),
// the typed map (no `any`), and the honest player-row placeholder.

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createAuthWrapper } from '@/test-utils/providers';

const mocks = vi.hoisted(() => ({
    useCompetitors: vi.fn(),
}));

vi.mock('@/hooks/useFarm', () => ({
    useCompetitors: mocks.useCompetitors,
}));

import { CompetitorsPanel } from '@/components/social/CompetitorsPanel';

/** Minimal fixture shape — only the fields CompetitorsPanel actually reads
 *  off an `AICompetitor` record. */
function makeCompetitor(overrides: {
    id: string;
    name: string;
    productionCapacity: bigint;
    reputation?: bigint;
    county?: string;
    preferredSaleType?: string;
}) {
    return {
        county: 'Testowo',
        reputation: 50n,
        preferredSaleType: 'wholesale',
        ...overrides,
    };
}

function renderPanel() {
    return render(
        <CompetitorsPanel playerCash={1000n} playerReputation={40n} />,
        { wrapper: createAuthWrapper() }
    );
}

describe('ECON-06: CompetitorsPanel reads real canister fields', () => {
    it('renders each AI farm\'s real production capacity, formatted, with no NaN anywhere', () => {
        mocks.useCompetitors.mockReturnValue({
            data: [
                makeCompetitor({ id: 'ai_marek', name: 'Marek', productionCapacity: 45_000n }),
                makeCompetitor({ id: 'ai_kasia', name: 'Kasia', productionCapacity: 18_000n }),
                makeCompetitor({ id: 'ai_hans', name: 'Hans', productionCapacity: 70_000n }),
            ],
            isLoading: false,
        });

        const { container } = renderPanel();

        expect(container.textContent).not.toMatch(/NaN/);
        expect(screen.getByText('45,000 kg')).toBeInTheDocument();
        expect(screen.getByText('18,000 kg')).toBeInTheDocument();
        expect(screen.getByText('70,000 kg')).toBeInTheDocument();
    });

    it('a competitor with a legitimately-zero production capacity renders 0, not NaN', () => {
        mocks.useCompetitors.mockReturnValue({
            data: [
                makeCompetitor({ id: 'ai_zero', name: 'Zero Farm', productionCapacity: 0n }),
            ],
            isLoading: false,
        });

        const { container } = renderPanel();

        expect(container.textContent).not.toMatch(/NaN/);
        expect(screen.getByText('0 kg')).toBeInTheDocument();
    });

    it('the player row has no fabricated capacity figure and renders the em-dash placeholder', () => {
        mocks.useCompetitors.mockReturnValue({
            data: [
                makeCompetitor({ id: 'ai_marek', name: 'Marek', productionCapacity: 45_000n }),
            ],
            isLoading: false,
        });

        renderPanel();

        expect(screen.getByText('You')).toBeInTheDocument();
        expect(screen.getByText('—')).toBeInTheDocument();
    });
});
