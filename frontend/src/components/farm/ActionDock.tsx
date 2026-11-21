import React from 'react';
import { Coins, Leaf } from 'lucide-react';
import { RotatingGears } from '../effects/RotatingGears';
import { Button } from '@/components/ui/button';
import { BarMeter } from '@/components/ui/BarMeter';
import { MetricBadge } from '@/components/ui/MetricBadge';
import { maxStorageCapacity } from '@/lib/gameLogic';
import { PHASE_LABELS, phaseCycleProgress, type SeasonPhase } from '@/config/phaseConstants';

// UX-03 / D-00 / D-04: the bottom dock. Two stat shapes only: a BarMeter for a
// bounded value, a MetricBadge for an open-ended one.
//
// The dock is prop-driven on purpose: it does not call useGuestFarm(), so it can
// be rendered without auth or react-query providers (09-10's harness specs rely
// on that).
//
// D-00 principle 4 targets semi-transparent panel fills and backdrop filters,
// which force the scene behind a panel to re-render. It does not target the
// brand's compositing layers, so `.god-ray-45` and `RotatingGears` stay.

export interface ActionDockProps {
    /** Cash in PLN, or null while there is no farm to read it from. */
    cash: number | null;
    /** Current phase, or null when there is no farm (no invented default). */
    phase: SeasonPhase | null;
    /** Conventional cherries in stock, kg. */
    cherries: number;
    /** Organic cherries in stock, kg. */
    organicCherries: number;
    warehouseLevel: number;
    /**
     * Required, not optional: an optional prop a caller forgot to pass is how
     * this button went dead the first time (it logged to the console).
     */
    onOpenAuction: () => void;
}

const formatKg = (kg: number) => (kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${kg}kg`);

export const ActionDock: React.FC<ActionDockProps> = ({
    cash,
    phase,
    cherries,
    organicCherries,
    warehouseLevel,
    onOpenAuction,
}) => {
    const totalStock = cherries + organicCherries;
    const capacity = maxStorageCapacity(warehouseLevel);
    const storageFill = (totalStock / capacity) * 100;

    return (
        <div className="mechanical-hull w-full h-full flex flex-col justify-center relative isolate overflow-hidden">
            <div className="god-ray-45"></div>
            <RotatingGears className="opacity-20 translate-y-20" />

            <div className="mahogany-plate brass-rim w-full h-full z-10 shadow-2xl flex items-center justify-between gap-2 px-2 md:px-6">
                {/* LEFT: Treasury (open-ended) and where the season is in its cycle (bounded) */}
                <div className="flex-1 min-w-0 max-w-xs">
                    <div className="bg-charcoal-light border border-brass/40 rounded-xl p-2 flex flex-col gap-2">
                        <h3 className="hull-header text-base font-semibold text-center">Diagnostics</h3>
                        <MetricBadge
                            icon={<Coins />}
                            label="Treasury"
                            value={cash === null ? '—' : cash}
                            unit={cash === null ? undefined : 'PLN'}
                        />
                        <BarMeter
                            label={phase ? PHASE_LABELS[phase] : 'No active phase'}
                            value={phaseCycleProgress(phase) * 100}
                            scale="neutral"
                        />
                    </div>
                </div>

                {/* CENTER: the one call to action */}
                <div className="flex items-center justify-center px-2 z-10">
                    <Button
                        className="bg-[var(--brass-primary)] hover:bg-brass-light text-black font-semibold border border-brass-light px-4 min-h-[44px] md:min-h-0 md:h-9 text-xs uppercase tracking-wide rounded-lg"
                        onClick={onOpenAuction}
                    >
                        View Market Auction
                    </Button>
                </div>

                {/* RIGHT: Reserves (bounded by the warehouse), Organic (open-ended) */}
                <div className="flex-1 min-w-0 max-w-xs">
                    <div className="bg-charcoal-light border border-brass/40 rounded-xl p-2 flex flex-col gap-2">
                        <BarMeter
                            label="Reserves"
                            value={storageFill}
                            scale="storage"
                            valueText={`${formatKg(totalStock)} of ${formatKg(capacity)}`}
                        />
                        <MetricBadge icon={<Leaf />} label="Organic" value={organicCherries} unit="kg" />
                    </div>
                </div>
            </div>
        </div>
    );
};
