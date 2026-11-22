import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// UX-03 / D-04: a Metric Badge is the shape for an OPEN-ENDED value (cash,
// organic kg: no ceiling). It never carries a bar, a percentage or a fraction;
// a value that needs a defined 100% is a BarMeter.

export interface MetricBadgeProps {
    /** lucide-react icon element (UX-10: never emoji). */
    icon: React.ReactNode;
    label: string;
    value: number | string;
    unit?: string;
    /**
     * Signed change since the last period. Omit it when no real prior figure
     * exists: an absent delta renders nothing, never a zero or a dash.
     */
    delta?: number;
    className?: string;
}

const fmt = (n: number) => n.toLocaleString('en-US');

export const MetricBadge: React.FC<MetricBadgeProps> = ({ icon, label, value, unit, delta, className }) => {
    const shown = typeof value === 'number' ? fmt(value) : value;
    const deltaTone =
        delta === undefined ? '' : delta > 0 ? 'text-[var(--emerald-glow)]' : delta < 0 ? 'text-ruby' : 'text-muted-foreground';
    return (
        <Badge variant="brass" className={cn('flex w-full items-center gap-1 rounded-lg px-2 py-1', className)} data-metric-badge>
            <span className="shrink-0 text-[var(--brass-primary)] [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">{icon}</span>
            <span className="min-w-0">
                <span className="block text-xs font-normal uppercase leading-tight tracking-wide text-slate-400">{label}</span>
                <span className="flex items-baseline gap-1">
                    <span className="text-xl font-semibold leading-tight tabular-nums text-[var(--brass-primary)]">{shown}</span>
                    {unit && <span className="text-xs font-normal text-slate-400">{unit}</span>}
                    {delta !== undefined && (
                        <span className={cn('text-xs font-normal tabular-nums', deltaTone)} data-delta>
                            {delta > 0 ? '+' : delta < 0 ? '−' : '±'}
                            {fmt(Math.abs(delta))}
                        </span>
                    )}
                </span>
            </span>
        </Badge>
    );
};
