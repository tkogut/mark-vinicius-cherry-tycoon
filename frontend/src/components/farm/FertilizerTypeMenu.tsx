import React from 'react';
import {
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { FERTILIZER_TYPES, FertilizerType, getFertilizerBlock, getFertilizerCost } from '@/lib/gameLogic';
import { FERTILIZER_TYPE_DISPLAY } from '@/lib/fertilizerTypes';
import { cn } from '@/lib/utils';

interface FertilizerTypeMenuProps {
    /** True for an `isOrganic` OR `organicCertified` parcel. Synthetic items are
     *  disabled there (ECON-REBALANCE; it replaces D-02's display-only warning).
     *  The backend refuses the same call, so this only saves the player a click. */
    isOrganic: boolean;
    /** True when `parcel.lastFertilized` is the current season: every item is
     *  disabled (one application per parcel per season). */
    fertilizedThisSeason?: boolean;
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
    fertilizedThisSeason,
    isPending,
    onSelect,
    align = 'center',
    className,
}) => {
    // w-72, not w-64 (QUAL-12): the locked copy "Fertilize with Synthetic-Intensive" is
    // 217-221px at the 14px Body size in DejaVu Sans (the Linux / CI fallback for
    // system-ui), but only ~197px was left after the radio indicator's padding, so
    // the label wrapped to two lines. 288px leaves ~240px for the label.
    return (
        <DropdownMenuContent align={align} className={cn('w-72 border-slate-800 bg-popover', className)}>
            <DropdownMenuRadioGroup>
                {FERTILIZER_TYPES.map((type) => {
                    // ECON-REBALANCE: a refused item is disabled and says why in place of
                    // its caption; the price stays visible. This reverses D-02, which
                    // kept Synthetic-Intensive selectable on organic parcels with a
                    // warning — the backend now refuses that call.
                    const block = getFertilizerBlock(type, {
                        organic: isOrganic,
                        fertilizedThisSeason: !!fertilizedThisSeason,
                    });
                    return (
                        <DropdownMenuRadioItem
                            key={type}
                            value={type}
                            disabled={isPending || block !== null}
                            onSelect={() => onSelect(type)}
                            className="flex-col items-start gap-0.5 cursor-pointer"
                        >
                            <span className="text-sm">Fertilize with {FERTILIZER_TYPE_DISPLAY[type].label}</span>
                            <span
                                className={cn(
                                    'block max-w-full truncate text-[10px] font-semibold uppercase tracking-wide',
                                    block !== null ? 'text-rose-400' : 'text-slate-400'
                                )}
                            >
                                <span className="text-slate-200">{getFertilizerCost(type)} PLN</span>
                                {' · '}
                                <span>{block ?? FERTILIZER_TYPE_DISPLAY[type].caption}</span>
                            </span>
                        </DropdownMenuRadioItem>
                    );
                })}
            </DropdownMenuRadioGroup>
        </DropdownMenuContent>
    );
};
