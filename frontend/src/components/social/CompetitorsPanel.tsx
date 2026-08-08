import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Users, MapPin, Loader2 } from "lucide-react";
import { useCompetitors } from "@/hooks/useFarm";
import { computeMarketShares, type FarmCapacity } from "@/lib/marketShare";


// ECON-06. This panel showed two fabricated numbers to the player:
//
//   1. `marketShare: Number(comp.baseCapacity) / 100` — `baseCapacity` is not a
//      field of `AICompetitor` (the real one is `productionCapacity`), so this
//      was `Number(undefined) / 100` = **NaN**, rendered as "NaN%" next to a
//      progress bar. It survived because `useCompetitors` returned `any`.
//   2. The player's own share was `min(15, cash / 1000)` — derived from cash,
//      capped at an arbitrary 15, and unrelated to production entirely.
//
// Market share is now what the words mean: this farm's seasonal production
// capacity as a percentage of every farm's capacity, player included. The
// shares sum to 100 and move when the player actually grows.

interface CompetitorsPanelProps {
    playerReputation?: bigint;
    playerName?: string;
    /** Player's seasonal output in kg, from `calculateYieldBreakdown` over their parcels. */
    playerProductionKg?: number;
}

/** `preferredSaleType` is the raw backend string ("retail" | "wholesale"). */
const SALE_TYPE_LABELS: Record<string, string> = {
    retail: 'Retail seller',
    wholesale: 'Wholesale supplier',
};

export const CompetitorsPanel: React.FC<CompetitorsPanelProps> = ({
    playerReputation = 0n,
    playerName = "You",
    playerProductionKg = 0,
}) => {
    const { data: rawCompetitors, isLoading } = useCompetitors();

    const farms: FarmCapacity[] = [
        ...(rawCompetitors ?? []).map((comp) => ({
            id: comp.id,
            name: comp.name,
            region: comp.county,
            reputation: Number(comp.reputation),
            capacityKg: Number(comp.productionCapacity),
            specialty: SALE_TYPE_LABELS[comp.preferredSaleType] ?? comp.preferredSaleType,
            isPlayer: false,
        })),
        {
            id: 'player',
            name: playerName,
            region: 'Your farm',
            reputation: Number(playerReputation),
            capacityKg: Math.round(playerProductionKg),
            specialty: 'You',
            isPlayer: true,
        },
    ];

    const totalCapacityKg = farms.reduce((sum, farm) => sum + farm.capacityKg, 0);
    const competitors = computeMarketShares(farms);


    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Users className="h-6 w-6 text-rose-500" />
                        Regional Competitors
                    </h2>
                    <p className="text-slate-400 mt-1">Market share and reputation analysis of rival farms.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                ) : competitors.map((comp, index) => (
                    <Card key={comp.id} className={`border-slate-800 bg-slate-900/50 ${comp.isPlayer ? 'border-rose-500/50 bg-rose-950/10' : ''}`}>
                        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="relative">
                                    <Avatar className="h-12 w-12 border-2 border-slate-700">
                                        <AvatarFallback className="bg-slate-800 text-slate-200 font-bold">
                                            {comp.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-slate-400">
                                        #{index + 1}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                                        {comp.name}
                                        {comp.isPlayer && <Badge variant="secondary" className="bg-rose-500/20 text-rose-400 text-[10px]">YOU</Badge>}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> {comp.region}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Trophy className="h-3 w-3" /> {comp.reputation} Rep
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 w-full space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Market Share</span>
                                    <span className="font-mono font-bold text-slate-200">
                                        {comp.marketShare.toFixed(1)}%
                                        <span className="text-slate-500 font-normal ml-2">
                                            {comp.capacityKg.toLocaleString()} kg/season
                                        </span>
                                    </span>
                                </div>
                                <Progress value={Math.min(100, comp.marketShare)} className="h-2 bg-slate-800" indicatorClassName={comp.isPlayer ? 'bg-rose-500' : 'bg-slate-600'} />
                            </div>

                            <div className="w-full md:w-32 flex justify-end">
                                <Badge variant="outline" className="border-slate-700 text-slate-400">
                                    {comp.specialty}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {/* ECON-06: was a "Market Trend +4.2% / Demand increasing" tile.
                    The 4.2% was a string literal — nothing computed it, nothing
                    updated it, and no backend field carries a demand trend. It
                    is replaced by a figure that is actually derived from the
                    same data the cards above show. */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Regional Output</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            {(totalCapacityKg / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} t
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Combined capacity per season</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Your Rank</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-400 flex items-center gap-2">
                            #{competitors.findIndex(c => c.isPlayer) + 1}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Of {competitors.length} regional farms</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Top Competitor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-slate-200">
                            {competitors[0].name}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{competitors[0].region}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-center mt-12 pb-12">
                <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">
                    Produced by JaPiTo Group
                </span>
            </div>
        </div>
    );
};
