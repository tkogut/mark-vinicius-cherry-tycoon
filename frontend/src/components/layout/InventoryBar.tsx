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
            // Mobile: Fixed bottom, glassmorphism
            "fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-4",
            // Desktop: Static, transparent (integrated in header)
            "md:static md:bg-transparent md:border-none md:p-0 md:w-auto",
            className
        )}>
            <div className="flex items-center justify-around md:justify-end md:gap-6 max-w-sm mx-auto md:mx-0">

                {/* Cash Display */}
                <div className="flex items-center gap-3 bg-slate-800/50 md:bg-slate-800 px-4 py-2 rounded-full border border-slate-700/50">
                    <div className="p-1.5 bg-amber-500/10 rounded-full">
                        <Coins className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Cash</span>
                        <span className="text-sm font-bold text-slate-100 font-mono">
                            ${Number(cash).toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Cherries Display */}
                <div className="flex items-center gap-3 bg-slate-800/50 md:bg-slate-800 px-4 py-2 rounded-full border border-slate-700/50 relative">
                    <div className="p-1.5 bg-rose-500/10 rounded-full">
                        <Cherry className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Harvest</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-slate-100 font-mono">
                                {totalCherries.toLocaleString()}
                            </span>
                            {organicCherries > 0 && (
                                <span className="text-[10px] text-emerald-500 font-bold">
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
