// ECON-06 — CompetitorsPanel.tsx read a field the backend does not have
// (`comp.baseCapacity`, via an untyped `comp: any` map callback), which
// produced `NaN%` "Market Share" for every AI competitor and never had a
// test to catch it. This file pins the real field (`productionCapacity`),
// the typed map (no `any`), and the honest player-row placeholder.
//
// It also pins the "Market Trend" tile's replacement: that tile hardcoded a
// `+4.2%` literal with no data source at all — replaced with a real
// "Regional Output" aggregate of the AI rows' production capacities.

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
        // "0 kg" legitimately appears twice here: the row itself, and the
        // Regional Output tile's aggregate (sum of one zero-capacity AI).
        expect(screen.getAllByText('0 kg').length).toBeGreaterThanOrEqual(1);
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

describe('ECON-06: Regional Output tile replaces the fabricated Market Trend tile', () => {
    it('sums the real AI production capacities into one toLocaleString()-formatted figure', () => {
        mocks.useCompetitors.mockReturnValue({
            data: [
                makeCompetitor({ id: 'ai_marek', name: 'Marek', productionCapacity: 45_000n }),
                makeCompetitor({ id: 'ai_kasia', name: 'Kasia', productionCapacity: 18_000n }),
                makeCompetitor({ id: 'ai_hans', name: 'Hans', productionCapacity: 70_000n }),
            ],
            isLoading: false,
        });

        renderPanel();

        expect(screen.getByText('133,000 kg')).toBeInTheDocument();
    });

    it('renders 0 kg and does not throw when there are zero competitors', () => {
        mocks.useCompetitors.mockReturnValue({
            data: [],
            isLoading: false,
        });

        expect(() => renderPanel()).not.toThrow();
        expect(screen.getByText('0 kg')).toBeInTheDocument();
    });

    it('the fabricated +4.2% literal never appears in rendered output', () => {
        mocks.useCompetitors.mockReturnValue({
            data: [
                makeCompetitor({ id: 'ai_marek', name: 'Marek', productionCapacity: 45_000n }),
            ],
            isLoading: false,
        });

        const { container } = renderPanel();

        expect(container.textContent).not.toContain('4.2%');
    });
});
