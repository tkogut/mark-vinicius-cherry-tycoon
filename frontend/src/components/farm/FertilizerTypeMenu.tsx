import React from 'react';
import {
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { FERTILIZER_TYPES, FertilizerType } from '@/lib/gameLogic';
import { FERTILIZER_TYPE_DISPLAY } from '@/lib/fertilizerTypes';
import { cn } from '@/lib/utils';

interface FertilizerTypeMenuProps {
    /** Read for caption selection only (D-02) — never used to block the
     *  Synthetic-Intensive item or to mutate anything. The backend does not
     *  touch `isOrganic` on fertilize (plan 03-06) and neither does this. */
    isOrganic: boolean;
    /** Disables every item while the host's fertilize mutation is in flight. */
    isPending?: boolean;
    onSelect: (fertilizerType: FertilizerType) => void;
    align?: 'start' | 'center' | 'end';
    className?: string;
}

/**
 * The item list + content shell shared by both fertilize entry points
 * (ParcelCard.tsx's dropdown, ImperialOrchard.tsx's radial menu). Two
 * divergent compositions of the same three-item list is how the copy and the
 * organic-warning logic drift out of sync — this is the one place both hosts
 * read from.
 *
 * Deliberately does NOT own the trigger or the `DropdownMenu` root: each
 * host's own trigger button (ParcelCard's 32px icon button, the orchard's
 * 56px radial button) stays exactly as it is, per 03-UI-SPEC.md's Spacing
 * Scale — this component only supplies the `DropdownMenuContent` that a host
 * renders as the sibling of its own `DropdownMenuTrigger`.
 */
export const FertilizerTypeMenu: React.FC<FertilizerTypeMenuProps> = ({
    isOrganic,
    isPending,
    onSelect,
    align = 'center',
    className,
}) => {
    return (
        <DropdownMenuContent align={align} className={cn('w-64 border-slate-800 bg-popover', className)}>
            <DropdownMenuRadioGroup>
                {FERTILIZER_TYPES.map((type) => {
                    // D-02: applying Synthetic-Intensive to an already-organic
                    // parcel is never blocked or auto-flipped — the backend
                    // applies the yield effect as normal (plan 03-06) and
                    // `isOrganic` is not mutated by this action at all. This
                    // warning is display-only, shown on the row BEFORE the
                    // click that applies it — which is how D-02's "warn before
                    // the player confirms" is satisfied without violating
                    // 03-UI-SPEC.md's single-click-fires rule (no separate
                    // confirm step exists anywhere else in this picker). Do
                    // not "fix" this into a confirmation dialog.
                    const showOrganicWarning = isOrganic && type === 'SyntheticIntensive';
                    return (
                        <DropdownMenuRadioItem
                            key={type}
                            value={type}
                            disabled={isPending}
                            onSelect={() => onSelect(type)}
                            className="flex-col items-start gap-0.5 cursor-pointer"
                        >
                            <span className="text-sm">Fertilize with {FERTILIZER_TYPE_DISPLAY[type].label}</span>
                            <span
                                className={cn(
                                    'block max-w-full truncate text-[10px] font-semibold uppercase tracking-wide',
                                    showOrganicWarning ? 'text-rose-400' : 'text-slate-400'
                                )}
                            >
                                {showOrganicWarning
                                    ? 'Warning: not organic-safe for this parcel'
                                    : FERTILIZER_TYPE_DISPLAY[type].caption}
                            </span>
                        </DropdownMenuRadioItem>
                    );
                })}
            </DropdownMenuRadioGroup>
        </DropdownMenuContent>
    );
};
