// Display metadata for the fertilizer-type picker (ECON-01, plan 03-07).
//
// Holds label/caption copy only — the wire strings themselves are imported
// from `gameLogic.ts`'s `FERTILIZER_TYPES`, never re-declared here, so there
// is exactly one place a wire value can be added, renamed, or removed. If
// `FERTILIZER_TYPES` ever gains or loses an entry, the `Record` type below
// makes a missing or extra key a compile error rather than a silent runtime
// gap in the picker.

import { FERTILIZER_TYPES, FertilizerType } from '@/lib/gameLogic';

export interface FertilizerTypeDisplay {
    /** "Fertilize with {Type Name}" pattern uses this as {Type Name}. */
    label: string;
    /** One-line tradeoff caption, sentence case. Truncates with ellipsis
     *  rather than widening the dropdown (UI-SPEC long-text backstop). */
    caption: string;
}

// Final copy, locked against D-01's three role names (03-CONTEXT.md).
// Every label is at most 24 characters.
export const FERTILIZER_TYPE_DISPLAY: Record<FertilizerType, FertilizerTypeDisplay> = {
    OrganicCompatible: {
        label: 'Organic-Compatible',
        caption: 'No yield bonus, safe on organic parcels',
    },
    SyntheticStandard: {
        label: 'Synthetic-Standard',
        caption: 'Baseline yield, standard cost',
    },
    SyntheticIntensive: {
        label: 'Synthetic-Intensive',
        caption: 'Five percent more yield, not organic-safe',
    },
};

// Sanity check, in-module: every wire string from the shared constant must
// have a display entry. TypeScript's `Record<FertilizerType, ...>` above
// already enforces this at compile time (a missing key is a type error), but
// this loop keeps the invariant checkable at runtime too, in case the two
// are ever imported through a boundary that erases types (e.g. a JS consumer).
FERTILIZER_TYPES.forEach((wireString) => {
    if (!FERTILIZER_TYPE_DISPLAY[wireString]) {
        throw new Error(`fertilizerTypes.ts: missing display metadata for wire string "${wireString}"`);
    }
});
