import React from 'react';
import { AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';

interface ShortfallAlertProps {
    missingKg: number;
    spotPrice: number;
    onResolve?: () => void;
}

export const ShortfallAlert: React.FC<ShortfallAlertProps> = ({
    missingKg,
    spotPrice,
    onResolve
}) => {
    if (missingKg <= 0) return null;

    const buybackCost = Math.floor(missingKg * spotPrice * 1.25);
    const defaultPenalty = Math.floor(missingKg * spotPrice * 1.50);

    return (
        <div className="shortfall-alert mechanical-hull bg-red-950/20 border-red-500/30 p-4 rounded-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 opacity-10">
                <ShieldAlert className="h-16 w-16 text-red-500" />
            </div>

            <div className="flex items-start gap-4 relative z-10">
                <div className="bg-red-500/20 p-2 rounded-lg border border-red-500/40">
                    <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />
                </div>

                <div className="flex-1">
                    <h3 className="text-red-400 font-bold uppercase tracking-widest text-sm">Inventory Shortfall Detected</h3>
                    <p className="text-slate-400 text-xs mt-1">
                        You are missing <span className="text-red-400 font-mono font-bold">{missingKg.toLocaleString()} kg</span> to fulfill your Imperial obligations.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-black/40 p-3 rounded-lg border border-red-500/10">
                            <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Market Buyback</span>
                            <div className="text-emerald-400 font-mono text-lg">{buybackCost.toLocaleString()} <small className="text-[10px]">PLN</small></div>
                            <p className="text-[9px] text-slate-500 italic mt-1">125% Spot Price</p>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg border border-red-500/10">
                            <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Default Penalty</span>
                            <div className="text-red-500 font-mono text-lg">{defaultPenalty.toLocaleString()} <small className="text-[10px]">PLN</small></div>
                            <p className="text-[9px] text-slate-500 italic mt-1">150% + Prestige Hit</p>
                        </div>
                    </div>

                    {onResolve && (
                        <button
                            onClick={onResolve}
                            className="mt-4 w-full py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-100 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                        >
                            Authorize Market Buyback <ArrowRight className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
