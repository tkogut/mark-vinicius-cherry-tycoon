import React from 'react';
import { Coins, Zap, PieChart, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useStability } from '@/hooks/useFarm';
import { cn } from '@/lib/utils';

interface RunningCostsProps {
    ownedInfrastructure: any[];
    parcels: any[];
    onOpenFinancialReport: () => void;
}

export const RunningCosts: React.FC<RunningCostsProps> = ({ ownedInfrastructure, parcels, onOpenFinancialReport }) => {
    const { data: stability, isLoading } = useStability();

    if (isLoading) {
        return (
            <div className="mt-4 bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 animate-pulse">
                <div className="h-4 w-24 mb-3 bg-slate-700 rounded" />
                <div className="h-8 w-full bg-slate-700 rounded" />
            </div>
        );
    }

    const totalEst = stability?.estimatedCost ? Number(stability.estimatedCost) : 0;
    const isRisky = stability?.isRisky || false;

    return (
        <div className={cn(
            "mt-4 rounded-xl p-4 border transition-all duration-300",
            isRisky
                ? "bg-rose-500/10 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.05)]"
                : "bg-slate-800/40 border-slate-700/30"
        )}>
            <div className="flex items-center justify-between mb-3">
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    isRisky ? "text-rose-400" : "text-slate-500"
                )}>
                    {isRisky ? "Bankruptcy Risk Detected" : "Est. Survival Budget"}
                </span>
                <div className={cn(
                    "p-1 rounded",
                    isRisky ? "bg-rose-500/10" : "bg-amber-500/10"
                )}>
                    {isRisky ? (
                        <AlertTriangle className="h-3 w-3 text-rose-500 animate-pulse" />
                    ) : (
                        <Coins className="h-3 w-3 text-amber-500" />
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                    <span className={cn(
                        "text-xl font-mono font-bold",
                        isRisky ? "text-rose-500" : "text-amber-400"
                    )}>
                        ${Math.round(totalEst).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">PLN</span>
                </div>

                {isRisky && (
                    <div className="text-[9px] text-rose-400 leading-relaxed font-medium bg-rose-500/5 p-1.5 rounded border border-rose-500/10 mt-2">
                        You don't have enough cash to reach the next harvest. Sell inventory or avoid spending!
                    </div>
                )}

                <div className="mt-auto pt-2 border-t border-slate-700/50 flex items-center gap-1.5 opacity-60">
                    <Zap className="h-2.5 w-2.5 text-amber-500/70" />
                    <span className="text-[9px] text-slate-500 leading-tight">
                        Includes seasonal ops & harvest labor
                    </span>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenFinancialReport}
                    className={cn(
                        "w-full mt-3 bg-slate-900/50 border-slate-700 text-slate-300 gap-2 h-8 text-[11px] font-bold",
                        isRisky ? "hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-400" : "hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-400"
                    )}
                >
                    <PieChart className="h-3 w-3" />
                    Full Analysis
                </Button>
            </div>
        </div>
    );
};
