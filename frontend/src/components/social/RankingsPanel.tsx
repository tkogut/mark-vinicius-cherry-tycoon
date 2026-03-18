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
    prestige: number;
    seasons: number;
    revenue: number;
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

    const leaderboard: RankingEntry[] = (rawLeaderboard || [])
        .map((entry: any, index: number) => ({
            rank: index + 1, // Backend returns sorted, assume consecutive rank
            id: entry.id,
            name: entry.name,
            prestige: Number(entry.prestige),
            seasons: Number(entry.seasonsCompleted),
            revenue: Number(entry.totalRevenue),
            isPlayer: !entry.isAI
        }));

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

            <Card className="mechanical-hull border-[#d4af37]/30 bg-black/40 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#d4af37]/10 to-transparent border-b border-[#d4af37]/10">
                    <div className="grid grid-cols-12 text-[10px] font-bold text-[#d4af37] uppercase tracking-[0.2em] px-2 opacity-80">
                        <div className="col-span-1 text-center">Pos</div>
                        <div className="col-span-4 pl-4">Orchard Name</div>
                        <div className="col-span-3 text-right">Global Prestige</div>
                        <div className="col-span-2 text-right">Seasons</div>
                        <div className="col-span-2 text-right pr-4">Production</div>
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
                                    className={`grid grid-cols-12 items-center py-5 hover:bg-[#d4af37]/5 transition-all duration-300 relative group
                                        ${entry.isPlayer ? 'bg-[#d4af37]/10 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[#d4af37]' : ''}`}
                                >
                                    <div className="col-span-1 flex justify-center">
                                        {entry.rank === 1 ? (
                                            <Trophy className="h-6 w-6 text-[#d4af37] drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
                                        ) : entry.rank === 2 ? (
                                            <Medal className="h-5 w-5 text-slate-300 opacity-80" />
                                        ) : entry.rank === 3 ? (
                                            <Medal className="h-5 w-5 text-amber-700 opacity-80" />
                                        ) : (
                                            <span className="font-mono text-slate-500 font-bold text-xs">#{entry.rank}</span>
                                        )}
                                    </div>
                                    <div className="col-span-4 flex items-center gap-4 pl-4">
                                        <div className={`p-[1px] rounded-full ${entry.isPlayer ? 'bg-gradient-to-tr from-[#d4af37] to-[#b87333]' : 'bg-slate-700'}`}>
                                            <Avatar className="h-9 w-9 border-2 border-black">
                                                <AvatarFallback className={`text-xs font-bold ${entry.isPlayer ? 'bg-black text-[#d4af37]' : 'bg-slate-900 text-slate-600'}`}>
                                                    {entry.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-bold tracking-wide uppercase text-sm ${entry.isPlayer ? 'hull-header' : 'text-slate-300'}`}>
                                                {entry.name}
                                            </span>
                                            {entry.isPlayer && (
                                                <span className="text-[9px] text-[#d4af37]/60 font-mono tracking-widest">CURRENT DOMINANCE</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-3 text-right flex flex-col pr-2">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <span className="font-mono text-lg font-bold text-amber-500/90 leading-none">
                                                {entry.prestige.toLocaleString()}
                                            </span>
                                            <div className="h-3 w-3 rounded-full bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                                        </div>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Imperial Prestige</span>
                                    </div>

                                    <div className="col-span-2 text-right pr-2">
                                        <span className="font-mono text-sm text-slate-400">
                                            {entry.seasons} Seasons
                                        </span>
                                    </div>

                                    <div className="col-span-2 text-right pr-4">
                                        <div className="font-mono text-sm text-emerald-500/80">
                                            {(entry.revenue / 1000).toFixed(1)}k
                                        </div>
                                        <div className="text-[9px] text-slate-600 uppercase font-bold tracking-tighter">Gross Yield</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-center mt-8 pb-12">
                <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">
                    Produced by JaPiTo Group
                </span>
            </div>
        </div>
    );
};
