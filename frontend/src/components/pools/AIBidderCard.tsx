import React from 'react';
import { RivalCard, RivalStatus } from './RivalCard';
import { Shield, Zap, TrendingDown, AlertTriangle, Package } from 'lucide-react';

export type AIStrategy = 'Neutral' | 'Aggressive' | 'Passive' | 'Desperate';

interface AIBidderCardProps {
    name: string;
    archetype: string;
    strategy: string;
    strategyState: AIStrategy;
    status: RivalStatus;
    reputation: number;
    prestige: number;
    inventory: number;
    capacity: number;
}

const StrategyIcon = ({ state }: { state: AIStrategy }) => {
    switch (state) {
        case 'Aggressive': return <Zap className="w-3 h-3 text-red-400 animate-pulse" />;
        case 'Passive': return <Shield className="w-3 h-3 text-blue-400" />;
        case 'Desperate': return <AlertTriangle className="w-3 h-3 text-amber-500 animate-bounce" />;
        default: return <TrendingDown className="w-3 h-3 text-emerald-400" />;
    }
};

export const AIBidderCard: React.FC<AIBidderCardProps> = ({
    name,
    archetype,
    strategy,
    strategyState,
    status,
    reputation,
    prestige,
    inventory,
    capacity
}) => {
    const stockPercent = Math.min(100, (inventory / capacity) * 100);

    return (
        <div className="ai-bidder-panel p-4 mechanical-hull bg-black/30 border-[#d4af37]/20 flex items-center gap-4 relative overflow-hidden group">
            {/* Strategy Mood Glow */}
            <div className={`absolute inset-0 opacity-5 pointer-events-none transition-colors duration-1000 ${strategyState === 'Aggressive' ? 'bg-red-500' :
                    strategyState === 'Desperate' ? 'bg-amber-500' : 'bg-transparent'
                }`} />

            <RivalCard name={name} status={status} />

            <div className="flex-1 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs">{name}</h4>
                        <StrategyIcon state={strategyState} />
                    </div>
                    <span className="text-[10px] text-amber-200/50 italic">
                        Rep: {reputation} | Prestige: {prestige}
                    </span>
                </div>

                <div className="mt-1 flex flex-col gap-1">
                    <p className="text-[11px] text-amber-100/70 leading-tight">
                        <span className="text-amber-400/50 uppercase text-[9px] font-bold">Stance:</span> {strategy}
                    </p>

                    {/* Inventory Bar */}
                    <div className="flex items-center gap-2 mt-1">
                        <Package className="w-3 h-3 text-amber-500/40" />
                        <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div
                                className={`h-full transition-all duration-1000 ${stockPercent > 80 ? 'bg-red-500' :
                                        stockPercent > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                style={{ width: `${stockPercent}%` }}
                            />
                        </div>
                        <span className="text-[9px] text-amber-200/30 tabular-nums">
                            {Math.round(inventory).toLocaleString()}kg
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
