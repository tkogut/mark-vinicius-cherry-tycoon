import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Sprout, Loader2 } from "lucide-react";
import { useLeaderboard } from "@/hooks/useFarm";


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
    const { data: rawLeaderboard, isLoading, isError } = useLeaderboard();

    // Transform backend literal data to UI structure, sorting by rank
    const leaderboard: RankingEntry[] = (rawLeaderboard || [])
        .map(entry => ({
            rank: Number(entry.rank),
            id: entry.name,
            name: entry.name,
            farmValue: Number(entry.profit || entry.totalRevenue || 0),
            efficiency: Number(entry.efficiency),
            isPlayer: !entry.isAI
        }))
        .sort((a, b) => a.rank - b.rank);

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
                    {isLoading ? (
                        <div className="flex justify-center items-center p-12 text-slate-400">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : isError ? (
                        <div className="p-8 text-center text-rose-400">
                            Failed to load leaderboard data.
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            No leaderboard data available yet.
                        </div>
                    ) : (
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
