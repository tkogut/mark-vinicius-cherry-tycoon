import React from 'react';
import { Droplets, TrendingDown, Info } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface FloodFactorIndicatorProps {
    spotPrice: number;
    basePrice?: number;
}

export const FloodFactorIndicator: React.FC<FloodFactorIndicatorProps> = ({
    spotPrice,
    basePrice = 15 // Default baseline from backend
}) => {
    const isFlooded = spotPrice < basePrice;
    const degradation = basePrice > 0 ? Math.round((1 - spotPrice / basePrice) * 100) : 0;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={`flood-indicator flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-help ${isFlooded
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                        <Droplets className={`h-4 w-4 ${isFlooded ? 'animate-bounce' : ''}`} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                            {isFlooded ? `Flood Active (-${degradation}%)` : 'Market Stable'}
                        </span>
                        {isFlooded && <TrendingDown className="h-3 w-3" />}
                        <Info className="h-3 w-3 opacity-30 ml-1" />
                    </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 border-slate-800 text-xs p-3 max-w-[200px]">
                    <p className="font-bold text-amber-500 mb-1">Flood Factor (GDD §8.4)</p>
                    <p className="text-slate-300">
                        Every unit of cherry supply unsold via contracts reduces the Spot Price by 0.1%. Markets are currently {isFlooded ? 'oversaturated' : 'balanced'}.
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
