import React from 'react';
import { RivalCard, RivalStatus } from './RivalCard';

interface AIBidderCardProps {
    name: string;
    archetype: string;
    strategy: string;
    status: RivalStatus;
    reputation?: number;
}

export const AIBidderCard: React.FC<AIBidderCardProps> = ({
    name,
    archetype,
    strategy,
    status,
    reputation = 50
}) => {
    return (
        <div className="ai-bidder-panel p-4 mechanical-hull bg-black/30 border-[#d4af37]/20 flex items-center gap-4">
            <RivalCard name={name} status={status} />
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs">{name}</h4>
                    <span className="text-[10px] text-amber-200/50 italic">{archetype} ({reputation})</span>
                </div>
                <p className="text-[11px] text-amber-100/70 mt-1 leading-tight">
                    Prefer: {strategy}
                </p>
            </div>
        </div>
    );
};
