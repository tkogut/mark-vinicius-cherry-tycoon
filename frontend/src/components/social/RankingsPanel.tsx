import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Sprout, Loader2, Gauge, Award, TrendingUp, AlertTriangle} from "lucide-react";
import { useLeaderboard, useMyRank } from "@/hooks/useFarm";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";


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
    const { data: rawMyRank } = useMyRank();

    const leaderboard: RankingEntry[] = (rawLeaderboard || [])
        .map((entry: any, index: number) => ({
            rank: index + 1,
            id: entry.id,
            name: entry.name,
            prestige: Number(entry.prestige),
            seasons: Number(entry.seasonsCompleted),
            revenue: Number(entry.totalRevenue),
            isPlayer: !entry.isAI
        }));

    // getPlayerRank returns `opt nat` (candid) -> `[] | [bigint]` in JS.
    // Falls back to null ("Unranked") when the player isn't in the
    // capped topPlayersCache that getGlobalLeaderboard returns.
    const myRank: number | null = rawMyRank && rawMyRank.length > 0 ? Number(rawMyRank[0]) : null;
    const myEntry = leaderboard.find((entry) => entry.isPlayer);

    return (
        <div className="relative space-y-8 max-w-5xl mx-auto p-4 min-h-[600px] overflow-hidden">
            {/* 1. CINEMATIC BACKGROUND: GOD RAYS */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute top-0 left-1/4 w-[2px] h-full bg-amber-500 blur-[80px] rotate-12" />
                <div className="absolute top-0 right-1/3 w-[1px] h-full bg-amber-400 blur-[60px] -rotate-12" />
                <div className="absolute bottom-0 left-1/2 w-[3px] h-full bg-amber-200 blur-[100px] rotate-45" />
            </div>

            {/* HEADER SECTION */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6"
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                            <Trophy className="h-7 w-7 text-amber-500" />
                        </div>
                        <h2 className="text-4xl font-serif font-bold tracking-tighter text-white uppercase italic">
                            Imperial Rankings
                        </h2>
                    </div>
                    <p className="text-amber-200/40 text-[10px] uppercase font-mono tracking-[0.4em] pl-1.5 flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-amber-500/30" />
                        Provincial Production & Global Prestige
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md border border-amber-500/20 rounded-xl p-4 shadow-inner">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-amber-500/60 uppercase font-bold tracking-widest">Active Season</span>
                        <span className="text-xl font-serif font-bold text-white leading-none">SPRING IV</span>
                    </div>
                    <div className="w-[1px] h-8 bg-amber-500/20" />
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-amber-500/60 uppercase font-bold tracking-widest">Total Participants</span>
                        <span className="text-xl font-serif font-bold text-white leading-none">{leaderboard.length}</span>
                    </div>
                </div>
            </motion.div>

            {/* YOUR STANDING — visible even if the player falls outside the visible top-N cache */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 flex items-center gap-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 min-h-[48px]"
            >
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg shrink-0">
                    <Gauge className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] text-amber-500/60 uppercase font-bold tracking-widest">Your Standing</span>
                    {myRank !== null ? (
                        <span className="font-serif font-bold text-white">
                            Rank #{myRank}{myEntry ? ` · ${myEntry.prestige.toLocaleString()} Prestige` : ''}
                        </span>
                    ) : (
                        <span className="font-serif text-zinc-400 text-sm">Unranked — keep growing to enter the ledger</span>
                    )}
                </div>
            </motion.div>

            {/* LEADERBOARD TABLE */}
            <Card className="mechanical-hull border-amber-500/30 bg-black/60 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative z-10">
                <CardHeader className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20 py-4">
                    {/* LEAD-03: column header only makes sense at the sm+ grid layout — rows stack on mobile */}
                    <div className="hidden sm:grid grid-cols-12 text-[10px] font-bold text-amber-500/70 uppercase tracking-[0.3em] px-4 font-mono">
                        <div className="col-span-1 text-center flex justify-center">
                            <Gauge className="w-3 h-3" />
                        </div>
                        <div className="col-span-4 pl-4">Industrialist Identity</div>
                        <div className="col-span-3 text-right">Global Prestige</div>
                        <div className="col-span-2 text-right">Lifespan</div>
                        <div className="col-span-2 text-right pr-4">Yield (RUBY)</div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col justify-center items-center p-24 text-amber-500/40 gap-4"
                            >
                                <Loader2 className="h-10 w-10 animate-spin" />
                                <span className="text-[10px] uppercase tracking-[0.5em] font-bold">Synchronizing Dials...</span>
                            </motion.div>
                        ) : isError ? (
                            <div className="p-20 text-center text-rose-500 uppercase font-mono text-xs tracking-widest">
                                <AlertTriangle className="h-3.5 w-3.5 inline-block mr-1 -mt-0.5" />Signal Interference: Failed to reach IC Backbone.
                            </div>
                        ) : (
                            <div className="divide-y divide-amber-900/20">
                                {leaderboard.map((entry, idx) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={cn(
                                            // LEAD-03: stacked flex layout below `sm` (48px+ touch-friendly rows,
                                            // no clipped columns); the original 12-col grid only kicks in at sm+.
                                            "flex flex-col gap-3 p-4 sm:grid sm:grid-cols-12 sm:items-center sm:py-6 sm:p-0 min-h-[48px] hover:bg-amber-500/5 transition-all duration-500 relative group cursor-default",
                                            entry.isPlayer && "bg-amber-500/10 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-amber-500 before:shadow-[0_0_15px_rgba(212,175,55,0.8)]"
                                        )}
                                    >
                                        {/* RANK + IDENTITY — one row on mobile, two grid columns at sm+ */}
                                        <div className="flex items-center gap-4 sm:contents">
                                        {/* RANK COLUMN */}
                                        <div className="flex justify-center relative sm:col-span-1">
                                            {entry.rank <= 3 && (
                                                <div className="absolute inset-0 bg-amber-500/10 blur-xl rounded-full scale-150" />
                                            )}
                                            {entry.rank === 1 ? (
                                                <Trophy className="h-7 w-7 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse" />
                                            ) : entry.rank === 2 ? (
                                                <Award className="h-6 w-6 text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.4)]" />
                                            ) : entry.rank === 3 ? (
                                                <Award className="h-6 w-6 text-amber-700 drop-shadow-[0_0_10px_rgba(180,83,9,0.4)]" />
                                            ) : (
                                                <span className="font-mono text-amber-500/30 font-black text-sm">
                                                    {entry.rank.toString().padStart(2, '0')}
                                                </span>
                                            )}
                                        </div>

                                        {/* IDENTITY COLUMN */}
                                        <div className="flex-1 flex items-center gap-5 sm:col-span-4 sm:pl-4">
                                            <div className={cn(
                                                "relative p-[2px] rounded-full shadow-lg transition-transform group-hover:scale-110 duration-500",
                                                entry.isPlayer ? "bg-gradient-to-tr from-amber-500 to-amber-200" : "bg-zinc-800"
                                            )}>
                                                <Avatar className="h-11 w-11 border-2 border-black">
                                                    <AvatarFallback className={cn(
                                                        "text-[10px] font-black tracking-widest",
                                                        entry.isPlayer ? "bg-black text-amber-400" : "bg-zinc-900 text-zinc-500"
                                                    )}>
                                                        {entry.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {!entry.isPlayer && (
                                                    <div className="absolute -bottom-1 -right-1 p-0.5 bg-black rounded-full border border-zinc-700 shadow-xl">
                                                        <div className="w-2.5 h-2.5 bg-zinc-600 rounded-full animate-pulse" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "font-serif font-bold text-base tracking-wide uppercase transition-colors duration-500",
                                                    entry.isPlayer ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "text-zinc-400 group-hover:text-zinc-200"
                                                )}>
                                                    {entry.name}
                                                </span>
                                                {entry.isPlayer ? (
                                                    <span className="text-[8px] text-amber-500/80 font-mono font-bold tracking-[0.3em] mt-0.5 flex items-center gap-1.5 animate-pulse">
                                                        <span className="w-1 h-1 bg-amber-500 rounded-full" />
                                                        LOCAL HEGEMON
                                                    </span>
                                                ) : (
                                                    <span className="text-[8px] text-zinc-600 font-mono tracking-widest mt-0.5">ESTABLISHED COLONY</span>
                                                )}
                                            </div>
                                        </div>
                                        </div>

                                        {/* PRESTIGE + SEASONS + REVENUE — 3-col mini-grid on mobile, three grid columns at sm+ */}
                                        <div className="grid grid-cols-3 gap-2 pl-11 sm:contents sm:pl-0">
                                        {/* PRESTIGE COLUMN */}
                                        <div className="text-left sm:text-right flex flex-col sm:col-span-3 sm:pr-6">
                                            <div className="flex items-center gap-2 sm:justify-end sm:gap-3 sm:translate-x-1 sm:group-hover:translate-x-0 transition-transform duration-500">
                                                <span className="font-mono text-lg sm:text-2xl font-black text-amber-400 tracking-tighter tabular-nums drop-shadow-lg">
                                                    {entry.prestige.toLocaleString()}
                                                </span>
                                                <div className="h-4 w-4 rounded-sm bg-gradient-to-br from-amber-300 to-amber-600 shadow-[0_0_10px_rgba(212,175,55,0.5)] rotate-45 transform" />
                                            </div>
                                            <span className="text-[9px] text-amber-500/40 uppercase font-bold tracking-widest mt-1">Status Quo</span>
                                        </div>

                                        {/* SEASONS COLUMN */}
                                        <div className="text-left sm:text-right sm:col-span-2 sm:pr-6">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm text-zinc-400 font-bold">
                                                    {entry.seasons} Seasons
                                                </span>
                                                <div className="h-1 w-full bg-zinc-900 rounded-full mt-2 overflow-hidden border border-zinc-800/50">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(100, entry.seasons * 10)}%` }}
                                                        className="h-full bg-amber-900/40"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* REVENUE COLUMN */}
                                        <div className="text-left sm:text-right sm:col-span-2 sm:pr-6 sm:group-hover:translate-x-[-4px] transition-transform duration-500">
                                            <div className="flex items-center gap-2 sm:justify-end text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.3)]">
                                                <TrendingUp className="w-3 h-3" />
                                                <span className="font-mono text-lg font-black tracking-tighter tabular-nums">
                                                    {(entry.revenue / 1000).toFixed(1)}k
                                                </span>
                                            </div>
                                            <div className="text-[8px] text-rose-900 font-black uppercase tracking-widest">Gross Yield</div>
                                        </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* DECORATIVE FOOTER */}
            <div className="relative flex flex-col items-center gap-4 py-12 opacity-40">
                <div className="w-px h-16 bg-gradient-to-b from-amber-500/0 to-amber-500" />
                <span className="text-[9px] text-amber-500 font-black uppercase tracking-[0.8em] font-mono">
                    Imperial Ledger • JaPiTo Group
                </span>
            </div>
        </div>
    );
};
