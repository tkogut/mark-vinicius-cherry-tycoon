import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { barMeterTone, type BarMeterScale, type BarMeterTone } from '@/lib/barMeterTone';

// UX-03 / D-04: a Bar Meter is the shape for a BOUNDED value, one that needs a
// defined 100% to mean anything. Open-ended values (cash, prestige, organic kg)
// are a MetricBadge instead; there is no third shape.

// Tokens only: no default Tailwind shade and no new hex literal.
const FILL: Record<BarMeterTone, string> = {
    nominal: 'bg-[var(--emerald-glow)]',
    warning: 'bg-copper',
    critical: 'bg-ruby',
    neutral: 'bg-[var(--brass-primary)]',
};

export interface BarMeterProps {
    label: string;
    /** Fill, 0-100. Clamped. */
    value: number;
    scale: BarMeterScale;
    /** Text shown beside the label, e.g. "1.2t of 10t". */
    valueText?: string;
    className?: string;
}

export const BarMeter: React.FC<BarMeterProps> = ({ label, value, scale, valueText, className }) => {
    const clamped = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
    const tone = barMeterTone(clamped, scale);
    return (
        <div className={cn('w-full', className)} data-bar-meter={scale} data-tone={tone}>
            <div className="flex items-baseline justify-between gap-2 text-xs leading-tight">
                <span className="min-w-0 truncate uppercase tracking-wide text-slate-400">{label}</span>
                {valueText && <span className="shrink-0 whitespace-nowrap tabular-nums text-foreground">{valueText}</span>}
            </div>
            <Progress
                className="mt-1 h-2 border border-brass/30 bg-charcoal-dark"
                indicatorClassName={FILL[tone]}
                value={clamped}
                role="progressbar"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(clamped * 10) / 10}
            />
        </div>
    );
};
