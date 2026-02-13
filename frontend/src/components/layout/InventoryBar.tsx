import React from 'react';
import { Cherry, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryBarProps {
    cash: bigint;
    cherries: number;
    organicCherries?: number;
    className?: string;
}

export const InventoryBar: React.FC<InventoryBarProps> = ({ cash, cherries, organicCherries = 0, className }) => {
    const totalCherries = cherries + organicCherries;
    return (
        <div className={cn(
            // Mobile: Sticky top (below header), glassmorphism
            "sticky top-16 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-2 shadow-lg",
            // Desktop: Static, transparent
            "md:static md:bg-transparent md:border-none md:p-0 md:w-auto md:shadow-none",
            className
        )}>
            <div className="flex items-center justify-between md:justify-end md:gap-6 max-w-sm mx-auto md:mx-0 px-2 md:px-0">

                {/* Cash Display */}
                <div className="flex items-center gap-2 md:gap-3 bg-slate-800/50 md:bg-slate-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-slate-700/50">
                    <div className="p-1 bg-amber-500/10 rounded-full">
                        <Coins className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-slate-400 font-bold hidden xs:inline">Cash</span>
                        <span className="text-xs md:text-sm font-bold text-slate-100 font-mono">
                            ${Number(cash).toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Cherries Display */}
                <div className="flex items-center gap-2 md:gap-3 bg-slate-800/50 md:bg-slate-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-slate-700/50 relative">
                    <div className="p-1 bg-rose-500/10 rounded-full">
                        <Cherry className="h-3.5 w-3.5 md:h-4 md:w-4 text-rose-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-slate-400 font-bold hidden xs:inline">Harvest</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xs md:text-sm font-bold text-slate-100 font-mono">
                                {totalCherries.toLocaleString()}
                            </span>
                            {organicCherries > 0 && (
                                <span className="text-[8px] md:text-[10px] text-emerald-500 font-bold">
                                    BIO
                                </span>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
