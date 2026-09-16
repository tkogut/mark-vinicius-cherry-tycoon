import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Factory, Users, MapPin, Loader2 } from "lucide-react";
import { useCompetitors } from "@/hooks/useFarm";
import type { AICompetitor } from "@/declarations/backend.did";


interface Competitor {
    id: string;
    name: string;
    region: string;
    reputation: number;
    // Real canister-sourced production capacity in kg. `null` only for the
    // player row — this component receives no real capacity figure for the
    // player (only cash/reputation), so it is never invented (ECON-06).
    capacityKg: number | null;
    // 0-100, normalized against the largest AI row's capacityKg. Drives the
    // <Progress> bar. Always 0 for the player row (no bar is rendered there).
    capacityShare: number;
    specialty: string;
    isPlayer?: boolean;
}

interface CompetitorsPanelProps {
    playerCash: bigint;
    playerReputation?: bigint;
    playerName?: string;
}

export const CompetitorsPanel: React.FC<CompetitorsPanelProps> = ({ playerCash, playerReputation = 0n, playerName = "You" }) => {
    const { data: rawCompetitors, isLoading } = useCompetitors();

    const aiCapacities: number[] = (rawCompetitors || []).map((comp: AICompetitor) => Number(comp.productionCapacity));
    const maxCapacityKg = aiCapacities.reduce((max: number, kg: number) => Math.max(max, kg), 0);

    const competitors: Competitor[] = (rawCompetitors || []).map((comp: AICompetitor) => {
        const capacityKg = Number(comp.productionCapacity);
        return {
            id: comp.id,
            name: comp.name,
            region: comp.county,
            reputation: Number(comp.reputation),
            capacityKg,
            capacityShare: maxCapacityKg === 0 ? 0 : (capacityKg / maxCapacityKg) * 100,
            specialty: comp.preferredSaleType,
            isPlayer: false,
        };
    });

    // Add Player to competitors. No real capacity figure is available for the
    // player here (only playerCash/playerReputation are passed in), so
    // capacityKg stays null rather than being fabricated from cash.
    competitors.push({
        id: 'player',
        name: playerName,
        region: "Local",
        reputation: Number(playerReputation),
        capacityKg: null,
        capacityShare: 0,
        specialty: "Rising Star",
        isPlayer: true
    });

    // Ranked by reputation — real for both AI (comp.reputation) and the
    // player (playerReputation) — since the player has no capacity figure to
    // sort by.
    competitors.sort((a, b) => b.reputation - a.reputation);

    const totalCapacityKg = competitors
        .filter((c) => !c.isPlayer)
        .reduce((sum, c) => sum + (c.capacityKg ?? 0), 0);


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
                                    <span className="text-slate-400">Production Capacity</span>
                                    <span className="font-mono font-bold text-slate-200">
                                        {comp.capacityKg !== null ? `${comp.capacityKg.toLocaleString()} kg` : '—'}
                                    </span>
                                </div>
                                {comp.capacityKg !== null && (
                                    <Progress value={Math.min(100, comp.capacityShare)} className="h-2 bg-slate-800" indicatorClassName={comp.isPlayer ? 'bg-rose-500' : 'bg-slate-600'} />
                                )}
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
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Regional Output</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-200 flex items-center gap-2">
                            <Factory className="h-5 w-5" />
                            {totalCapacityKg.toLocaleString()} kg
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Combined AI production capacity</p>
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
                        <p className="text-xs text-slate-500 mt-1">By reputation, of {competitors.length} regional farms</p>
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
