// UX-03 / plan 09-04: the Action Dock's two-shape stat grammar (BarMeter for a
// bounded value, MetricBadge for an open-ended one), its real auction
// navigation, and the numbers behind it. The old dock padded its fills with an
// invented +15 / +5 and divided by invented 50000 / 20000 denominators.

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ActionDock, type ActionDockProps } from '@/components/farm/ActionDock';
import { MetricBadge } from '@/components/ui/MetricBadge';
import { barMeterTone } from '@/lib/barMeterTone';
import { maxStorageCapacity } from '@/lib/gameLogic';
import { PHASE_ORDER, phaseCycleProgress } from '@/config/phaseConstants';
import { Coins } from 'lucide-react';

function dock(over: Partial<ActionDockProps> = {}, onOpenAuction = vi.fn()) {
    const props: ActionDockProps = {
        cash: 1234567,
        phase: 'Growth',
        cherries: 0,
        organicCherries: 0,
        warehouseLevel: 0,
        onOpenAuction,
        ...over,
    };
    return { ...render(<ActionDock {...props} />), onOpenAuction };
}

const meter = (name: string) => screen.getByRole('progressbar', { name });

describe('MetricBadge', () => {
    it('renders icon, number and a signed delta', () => {
        const { container } = render(<MetricBadge icon={<Coins />} label="Cash" value={1000} delta={250} />);
        expect(container.querySelector('svg')).not.toBeNull();
        expect(screen.getByText('1,000')).toBeTruthy();
        expect(container.querySelector('[data-delta]')!.textContent).toBe('+250');
    });

    it('renders a negative delta with an explicit minus', () => {
        const { container } = render(<MetricBadge icon={<Coins />} label="Cash" value={1000} delta={-40} />);
        expect(container.querySelector('[data-delta]')!.textContent).toBe('−40');
    });

    it('no delta supplied: renders no delta element, no zero, no dash', () => {
        const { container } = render(<MetricBadge icon={<Coins />} label="Cash" value={1000} />);
        expect(container.querySelector('[data-delta]')).toBeNull();
        expect(container.textContent).not.toMatch(/[±—]/);
    });

    it('a seven-figure value gets thousands separators and no dollar sign', () => {
        const { container } = render(<MetricBadge icon={<Coins />} label="Cash" value={1234567} unit="PLN" />);
        expect(screen.getByText('1,234,567')).toBeTruthy();
        expect(container.textContent).not.toContain('$');
        expect(container.textContent).toContain('PLN');
    });
});

describe('barMeterTone', () => {
    it('storage scale: nominal below 80, warning 80-94, critical from 95', () => {
        expect(barMeterTone(0, 'storage')).toBe('nominal');
        expect(barMeterTone(79.9, 'storage')).toBe('nominal');
        expect(barMeterTone(80, 'storage')).toBe('warning');
        expect(barMeterTone(94.9, 'storage')).toBe('warning');
        expect(barMeterTone(95, 'storage')).toBe('critical');
        expect(barMeterTone(100, 'storage')).toBe('critical');
    });

    it('wear scale: nominal below 50, warning 50-80, critical above 80', () => {
        expect(barMeterTone(49.9, 'wear')).toBe('nominal');
        expect(barMeterTone(50, 'wear')).toBe('warning');
        expect(barMeterTone(80, 'wear')).toBe('warning');
        expect(barMeterTone(80.1, 'wear')).toBe('critical');
    });

    it('neutral is brass at every value, including 0 and 100', () => {
        for (const v of [0, 1, 50, 99, 100]) expect(barMeterTone(v, 'neutral')).toBe('neutral');
    });
});

describe('phase cycle', () => {
    it('PHASE_ORDER matches the advancePhase chain in backend/main.mo, read off disk', () => {
        const src = readFileSync(resolve(__dirname, '../../../backend/main.mo'), 'utf8');
        const start = src.indexOf('let nextPhase : Types.SeasonPhase = switch (farm.currentPhase)');
        expect(start).toBeGreaterThan(-1);
        const block = src.slice(start, src.indexOf('case (#Planning)', start) + 40);
        const pairs = [...block.matchAll(/case \(#(\w+)\) \{ #(\w+) \}/g)].map((m) => [m[1], m[2]]);
        expect(pairs.length).toBe(10);
        // Follow the chain from Hiring; it must visit PHASE_ORDER in order and close the loop.
        const next = Object.fromEntries(pairs);
        const walked: string[] = ['Hiring'];
        while (walked.length < 10) walked.push(next[walked[walked.length - 1]]);
        expect(PHASE_ORDER).toEqual(walked);
        expect(next[walked[9]]).toBe('Hiring');
    });

    it('progress is 1/10 for the first phase and 10/10 for the last, 0 for unknown', () => {
        expect(PHASE_ORDER.length).toBe(10);
        expect(phaseCycleProgress('Hiring')).toBeCloseTo(0.1);
        expect(phaseCycleProgress('Planning')).toBeCloseTo(1);
        expect(phaseCycleProgress(null)).toBe(0);
        expect(phaseCycleProgress('Nope')).toBe(0);
    });
});

describe('ActionDock stats', () => {
    it('Treasury is a MetricBadge: formatted, PLN, and no progress bar for it', () => {
        const { container } = dock();
        expect(screen.getByText('1,234,567')).toBeTruthy();
        const badges = [...container.querySelectorAll('[data-metric-badge]')];
        const treasury = badges.find((b) => b.textContent!.includes('Treasury'))!;
        expect(treasury.textContent).toContain('PLN');
        expect(treasury.querySelector('[role="progressbar"]')).toBeNull();
        expect(container.textContent).not.toContain('$');
    });

    it('no farm: Treasury shows a dash, not a fabricated 0, and no phase is invented', () => {
        const { container } = dock({ cash: null, phase: null });
        const treasury = [...container.querySelectorAll('[data-metric-badge]')].find((b) => b.textContent!.includes('Treasury'))!;
        expect(treasury.textContent).not.toMatch(/\b0\b/);
        expect(treasury.textContent).toContain('\u2014');
        expect(treasury.textContent).not.toContain('PLN');
        expect(meter('No active phase').getAttribute('aria-valuenow')).toBe('0');
    });

    it('phase meter: labelled with the phase name, brass tone, filled by cycle position', () => {
        const { container } = dock({ phase: 'Harvest' });
        expect(meter('Cherry Harvest').getAttribute('aria-valuenow')).toBe('50');
        expect(container.querySelector('[data-bar-meter="neutral"]')!.getAttribute('data-tone')).toBe('neutral');
    });

    it('Reserves fill is (cherries + organic) / maxStorageCapacity: an empty store is 0, not 15', () => {
        dock({ cherries: 0, organicCherries: 0, warehouseLevel: 0 });
        expect(meter('Reserves').getAttribute('aria-valuenow')).toBe('0');
    });

    it('Reserves sums conventional and organic stock', () => {
        dock({ cherries: 3000, organicCherries: 2000, warehouseLevel: 0 });
        expect(meter('Reserves').getAttribute('aria-valuenow')).toBe('50');
    });

    it('the same stock under a larger warehouse fills less (the fixed 50000 denominator is gone)', () => {
        const a = dock({ cherries: 5000, warehouseLevel: 0 });
        const small = Number(meter('Reserves').getAttribute('aria-valuenow'));
        a.unmount();
        dock({ cherries: 5000, warehouseLevel: 1 });
        const big = Number(meter('Reserves').getAttribute('aria-valuenow'));
        expect(small).toBe(50);
        expect(big).toBe(25);
    });

    it('maxStorageCapacity is (level + 1) * 10000, the figure the orchard silo uses', () => {
        expect(maxStorageCapacity(0)).toBe(10000);
        expect(maxStorageCapacity(3)).toBe(40000);
        const app = readFileSync(resolve(__dirname, '../App.tsx'), 'utf8');
        expect(app).toContain('maxStorageCapacity(warehouseLevel)');
        expect(app).not.toMatch(/\(warehouseLevel \+ 1\) \* 10000/);
    });

    it('Reserves tone follows the storage scale: critical when nearly full', () => {
        const { container } = dock({ cherries: 9600, warehouseLevel: 0 });
        expect(container.querySelector('[data-bar-meter="storage"]')!.getAttribute('data-tone')).toBe('critical');
    });

    it('Organic is a kg MetricBadge with no progress bar (0 kg shows 0)', () => {
        const { container } = dock({ organicCherries: 0 });
        const organic = [...container.querySelectorAll('[data-metric-badge]')].find((b) => b.textContent!.includes('Organic'))!;
        expect(within(organic as HTMLElement).getByText('0')).toBeTruthy();
        expect(organic.textContent).toContain('kg');
        expect(organic.querySelector('[role="progressbar"]')).toBeNull();
    });

    it('renders no circular dial and no vertical tube gauge', () => {
        const { container } = dock();
        // lucide's Coins icon draws <circle>s, so look for the gauge idiom itself:
        // a dashed-stroke ring (what ImperialDial draws) or a conic gradient.
        expect(container.querySelector('circle[stroke-dasharray]')).toBeNull();
        expect(container.innerHTML).not.toContain('conic-gradient');
        expect(container.textContent).not.toMatch(/STEAM PRESSURE/i);
        expect(container.querySelectorAll('[role="progressbar"]').length).toBe(2); // phase + reserves, nothing else
    });
});

describe('ActionDock auction CTA', () => {
    it('is named "View Market Auction" and calls the navigation callback exactly once', () => {
        const { onOpenAuction } = dock();
        fireEvent.click(screen.getByRole('button', { name: 'View Market Auction' }));
        expect(onOpenAuction).toHaveBeenCalledTimes(1);
    });

    it('the dock source writes nothing to the console', () => {
        const src = readFileSync(resolve(__dirname, '../components/farm/ActionDock.tsx'), 'utf8');
        expect(src).not.toMatch(/console\./);
    });

    it('App passes the callback that opens the pool tab', () => {
        const app = readFileSync(resolve(__dirname, '../App.tsx'), 'utf8');
        expect(app).toMatch(/onOpenAuction=\{\(\) => setActiveTab\('pool'\)\}/);
    });
});
