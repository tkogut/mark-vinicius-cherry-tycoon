// UX-03 / D-04: tone thresholds for a Bar Meter (09-UI-SPEC.md, Component
// Contract B). Pure and JSX-free, and kept out of BarMeter.tsx so that file only
// exports a component (react-refresh/only-export-components).

export type BarMeterTone = 'nominal' | 'warning' | 'critical' | 'neutral';

/** Which threshold table applies (09-UI-SPEC.md, Component Contract B). */
export type BarMeterScale = 'wear' | 'storage' | 'neutral';

/**
 * Tone for a fill percentage (0-100). `wear` is percent of the 200% cap;
 * `storage` is percent full. `neutral` (the phase-cycle meter) has no good or
 * bad end, so it is always brass.
 */
export function barMeterTone(value: number, scale: BarMeterScale): BarMeterTone {
    if (scale === 'neutral') return 'neutral';
    const v = Math.min(100, Math.max(0, value));
    if (scale === 'wear') {
        if (v > 80) return 'critical';
        if (v >= 50) return 'warning';
        return 'nominal';
    }
    if (v >= 95) return 'critical';
    if (v >= 80) return 'warning';
    return 'nominal';
}
