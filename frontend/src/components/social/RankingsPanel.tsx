import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, TrendingUp, Sprout } from "lucide-react";

interface RankingEntry {
    rank: number;
    id: string;
    name: string;
    farmValue: number;
    efficiency: number; // Yield per Hectare
    isPlayer: boolean;
}

interface RankingsPanelProps {
    playerStats?: {
        name: string;
        cash: bigint;
        productionRate: number;
    };
}

export const RankingsPanel: React.FC<RankingsPanelProps> = ({ playerStats }) => {
    // Mock Data for Phase 5.4 (until backend getLeaderboard is ready)
    const leaderboard: RankingEntry[] = [
        { rank: 1, id: 'ai-1', name: "Green Valley Corp", farmValue: 2500000, efficiency: 12.5, isPlayer: false },
        { rank: 2, id: 'ai-4', name: "Royal Orchards", farmValue: 1800000, efficiency: 11.2, isPlayer: false },
        { rank: 3, id: 'ai-2', name: "EcoHarvest Ltd", farmValue: 1200000, efficiency: 9.8, isPlayer: false },
        {
            rank: 4,
            id: 'player',
            name: playerStats?.name || "You",
            farmValue: Number(playerStats?.cash || 0) + 50000, // Mock value calculation 
            efficiency: (playerStats?.productionRate || 0) / 100, // Mock efficiency
            isPlayer: true
        },
        { rank: 5, id: 'ai-3', name: "Old World Orchards", farmValue: 800000, efficiency: 8.5, isPlayer: false },
        { rank: 6, id: 'ai-5', name: "Small Town Farms", farmValue: 450000, efficiency: 7.2, isPlayer: false },
    ].sort((a, b) => b.farmValue - a.farmValue).map((entry, index) => ({ ...entry, rank: index + 1 }));

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        Global Leaderboard
                    </h2>
                    <p className="text-slate-400 mt-1">Top cherry producers by farm value and efficiency.</p>
                </div>
            </div>

            <Card className="bg-slate-950 border-slate-800">
                <CardHeader>
                    <div className="grid grid-cols-12 text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">
                        <div className="col-span-1 text-center">Rank</div>
                        <div className="col-span-5">Farm Name</div>
                        <div className="col-span-3 text-right">Farm Value</div>
                        <div className="col-span-3 text-right">Efficiency</div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-800/50">
                        {leaderboard.map((entry) => (
                            <div
                                key={entry.id}
                                className={`grid grid-cols-12 items-center p-4 hover:bg-slate-900/50 transition-colors ${entry.isPlayer ? 'bg-rose-950/10 border-l-2 border-rose-500' : ''}`}
                            >
                                <div className="col-span-1 flex justify-center">
                                    {entry.rank === 1 ? (
                                        <Medal className="h-5 w-5 text-yellow-400" />
                                    ) : entry.rank === 2 ? (
                                        <Medal className="h-5 w-5 text-slate-300" />
                                    ) : entry.rank === 3 ? (
                                        <Medal className="h-5 w-5 text-amber-600" />
                                    ) : (
                                        <span className="font-mono text-slate-500 font-bold">#{entry.rank}</span>
                                    )}
                                </div>

                                <div className="col-span-5 flex items-center gap-3">
                                    <Avatar className="h-8 w-8 border border-slate-700">
                                        <AvatarFallback className={`text-xs font-bold ${entry.isPlayer ? 'bg-rose-900 text-rose-200' : 'bg-slate-800 text-slate-400'}`}>
                                            {entry.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className={`font-medium ${entry.isPlayer ? 'text-rose-400' : 'text-slate-200'}`}>
                                            {entry.name}
                                            {entry.isPlayer && <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1 bg-rose-500/20 text-rose-300">YOU</Badge>}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-span-3 text-right font-mono text-sm text-slate-300">
                                    ${entry.farmValue.toLocaleString()}
                                </div>

                                <div className="col-span-3 text-right flex items-center justify-end gap-2">
                                    <span className="font-mono text-sm text-slate-400">
                                        {entry.efficiency.toFixed(1)} t/ha
                                    </span>
                                    {entry.efficiency > 10 && <Sprout className="h-3 w-3 text-emerald-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
