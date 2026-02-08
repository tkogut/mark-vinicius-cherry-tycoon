import React from 'react';
import { Sun, Leaf, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Season } from '@/declarations/backend.did';

interface SeasonDisplayProps {
    currentSeason: Season;
    seasonNumber: number;
    currentStep?: number;
    totalSteps?: number;
    className?: string;
}

// Helper to get season name from variant
const getSeasonName = (season: Season): 'Spring' | 'Summer' | 'Autumn' | 'Winter' => {
    if ('Spring' in season) return 'Spring';
    if ('Summer' in season) return 'Summer';
    if ('Autumn' in season) return 'Autumn';
    if ('Winter' in season) return 'Winter';
    return 'Spring'; // fallback
};

const seasonConfig = {
    Spring: {
        icon: Leaf,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        emoji: '🌸',
    },
    Summer: {
        icon: Sun,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        emoji: '☀️',
    },
    Autumn: {
        icon: Leaf,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        emoji: '🍂',
    },
    Winter: {
        icon: Snowflake,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        emoji: '❄️',
    },
};

export const SeasonDisplay: React.FC<SeasonDisplayProps> = ({
    currentSeason,
    seasonNumber,
    currentStep,
    totalSteps,
    className,
}) => {
    const seasonName = getSeasonName(currentSeason);
    const config = seasonConfig[seasonName];
    const Icon = config.icon;
    const showSteps = totalSteps && totalSteps > 1;

    return (
        <div className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-full border",
            config.bgColor,
            config.borderColor,
            className
        )}>
            <div className={cn("p-1.5 rounded-full", config.bgColor)}>
                <Icon className={cn("h-4 w-4", config.color)} />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Season {seasonNumber}
                </span>
                <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-bold", config.color)}>
                        {config.emoji} {seasonName}
                    </span>
                    {showSteps && (
                        <span className="text-xs text-slate-500">
                            {currentStep}/{totalSteps}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
