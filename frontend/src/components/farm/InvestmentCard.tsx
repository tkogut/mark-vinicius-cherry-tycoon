import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, Loader2, Wrench } from 'lucide-react';

interface InvestmentCardProps {
    title: string;
    description: string;
    level: number;
    maxLevel?: number;
    cost: number;
    canAfford: boolean;
    isUpgrading: boolean;
    icon: LucideIcon;
    stats: {
        label: string;
        value: string;
        trend?: string;
    }[];
    onUpgrade: () => void;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({
    title,
    description,
    level,
    maxLevel = 5,
    cost,
    canAfford,
    isUpgrading,
    icon: Icon,
    stats,
    onUpgrade
}) => {
    const progress = (level / maxLevel) * 100;

    return (
        <Card className="mechanical-hull bg-gradient-to-b from-amber-900/40 to-black/60 border-amber-500/40 backdrop-blur-xl shadow-[0_0_40px_rgba(217,119,6,0.2)] text-white group relative overflow-hidden h-full flex flex-col">
            <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 shadow-inner group-hover:bg-amber-500/20 transition-colors">
                        <Icon className="h-6 w-6 text-amber-400" />
                    </div>
                    <Badge variant="outline" className="border-amber-500/50 text-amber-400 font-mono">
                        LVL {level}
                    </Badge>
                </div>
                <CardTitle className="mt-4 text-xl hull-header">{title}</CardTitle>
                <CardDescription className="text-amber-100/60 line-clamp-2 min-h-[3rem]">
                    {description}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow space-y-4 pt-0">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs uppercase tracking-widest text-amber-200/50 font-semibold">
                        <span>Calibration Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress
                        value={progress}
                        className="h-2 bg-black/40 border border-amber-900/30"
                    />
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 rounded bg-black/30 border border-amber-900/20">
                            <span className="text-xs text-amber-200/70">{stat.label}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-mono font-bold text-amber-400">{stat.value}</span>
                                {stat.trend && <span className="text-[10px] text-green-500 font-bold">{stat.trend}</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4 mt-auto border-t border-amber-800/30">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] uppercase tracking-widest text-amber-200/50">Next Iteration</span>
                        <span className={`font-mono text-lg font-bold ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>
                            {cost.toLocaleString()} PLN
                        </span>
                    </div>

                    <Button
                        className={`w-full h-11 text-sm font-bold tracking-widest transition-all duration-300 relative overflow-hidden ${canAfford
                                ? 'bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-600 hover:to-yellow-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(252,211,77,0.5)]'
                                : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border-gray-700/50'
                            }`}
                        disabled={!canAfford || isUpgrading}
                        onClick={onUpgrade}
                    >
                        {isUpgrading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Tooling...</>
                        ) : (
                            <><Wrench className="mr-2 h-4 w-4" /> Install Upgrade</>
                        )}
                        {canAfford && <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
