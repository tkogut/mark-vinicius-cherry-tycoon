// UX-04: the sidebar's running-costs box showed a fabricated "0 PLN" survival
// budget forever in guest mode. useStability() is disabled without an actor, and
// React Query v5 reports `isLoading: false` (not true) for a disabled query, so
// the old component skipped its skeleton and rendered `stability?.estimatedCost
// ?? 0`. These tests pin the four branches (guest / loading / error / data) and,
// above all, that a disabled query never yields a numeric figure.

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
    useAuth: vi.fn(),
    useStability: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({ useAuth: mocks.useAuth }));
vi.mock('@/hooks/useFarm', () => ({ useStability: mocks.useStability }));

import { RunningCosts } from '@/components/farm/RunningCosts';

const GUEST_COPY = "Sign in to see your farm's running costs.";

function auth(signedIn: boolean) {
    mocks.useAuth.mockReturnValue({
        backendActor: signedIn ? {} : null,
        isAuthenticated: signedIn,
    });
}

function query(over: Record<string, unknown>) {
    mocks.useStability.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        ...over,
    });
}

function renderBox() {
    return render(
        <RunningCosts ownedInfrastructure={[]} parcels={[]} onOpenFinancialReport={() => {}} />
    );
}

/** A PLN figure is rendered as the "PLN" unit label next to a number. */
function hasFigure() {
    return screen.queryByText('PLN') !== null;
}

describe('RunningCosts (UX-04)', () => {
    beforeEach(() => {
        mocks.useAuth.mockReset();
        mocks.useStability.mockReset();
    });

    it('guest: shows the sign-in copy and no PLN figure', () => {
        auth(false);
        query({});
        renderBox();
        expect(screen.getByText(GUEST_COPY)).toBeTruthy();
        expect(hasFigure()).toBe(false);
        expect(screen.queryByText('Full Analysis')).toBeNull();
    });

    it('loading: an authenticated fetch shows the skeleton and no figure', () => {
        auth(true);
        query({ isLoading: true });
        const { container } = renderBox();
        expect(container.querySelector('.animate-pulse')).not.toBeNull();
        expect(hasFigure()).toBe(false);
        expect(screen.queryByText(GUEST_COPY)).toBeNull();
    });

    it('error: an authenticated failed fetch shows an explicit message, not a zero', () => {
        auth(true);
        query({ isError: true });
        renderBox();
        expect(screen.getByText(/Could not load your running costs/)).toBeTruthy();
        expect(hasFigure()).toBe(false);
        expect(screen.queryByText('Full Analysis')).toBeNull();
    });

    it('data: shows the real figure and not the sign-in copy', () => {
        auth(true);
        query({ data: { estimatedCost: 12345n, isRisky: false } });
        renderBox();
        expect(screen.getByText('12,345')).toBeTruthy();
        expect(screen.getByText('PLN')).toBeTruthy();
        expect(screen.getByText('Full Analysis')).toBeTruthy();
        expect(screen.queryByText(GUEST_COPY)).toBeNull();
    });

    it('regression: a disabled query (isLoading false, data undefined) never renders 0', () => {
        auth(false);
        query({ data: undefined, isLoading: false });
        renderBox();
        expect(screen.queryByText('0')).toBeNull();
        expect(hasFigure()).toBe(false);
    });

    it('stale cache: after logout, data left in the query is not rendered', () => {
        auth(false);
        query({ data: { estimatedCost: 99999n, isRisky: true } });
        renderBox();
        expect(screen.queryByText('99,999')).toBeNull();
        expect(screen.getByText(GUEST_COPY)).toBeTruthy();
    });

    it('risk banner: authenticated risky data still shows the bankruptcy warning', () => {
        auth(true);
        query({ data: { estimatedCost: 500000n, isRisky: true } });
        renderBox();
        expect(screen.getByText('Bankruptcy Risk Detected')).toBeTruthy();
        expect(screen.getByText(/don't have enough cash/)).toBeTruthy();
    });
});
