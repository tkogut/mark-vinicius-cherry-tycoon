import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Users, MapPin } from "lucide-react";

interface Competitor {
    id: string;
    name: string;
    region: string;
    reputation: number;
    marketShare: number; // Percentage
    specialty: string;
    isPlayer?: boolean;
}

interface CompetitorsPanelProps {
    playerCash: bigint;
    playerReputation?: bigint;
    playerName?: string;
}

export const CompetitorsPanel: React.FC<CompetitorsPanelProps> = ({ playerCash, playerReputation = 0n, playerName = "You" }) => {
    // Mock Data for AI Competitors
    const competitors: Competitor[] = [
        {
            id: 'ai-1',
            name: "Green Valley Corp",
            region: "Mazowieckie",
            reputation: 850,
            marketShare: 35,
            specialty: "High Volume"
        },
        {
            id: 'ai-2',
            name: "EcoHarvest Ltd",
            region: "Lubelskie",
            reputation: 720,
            marketShare: 25,
            specialty: "Organic"
        },
        {
            id: 'player',
            name: playerName,
            region: "Local",
            reputation: Number(playerReputation),
            marketShare: Math.min(15, Number(playerCash) / 1000), // Dynamic mock share based on cash
            specialty: "Rising Star",
            isPlayer: true
        },
        {
            id: 'ai-3',
            name: "Old World Orchards",
            region: "Malopolskie",
            reputation: 450,
            marketShare: 12,
            specialty: "Heritage"
        }
    ].sort((a, b) => b.marketShare - a.marketShare);

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
                {competitors.map((comp, index) => (
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
                                    <span className="font-mono font-bold text-slate-200">{comp.marketShare.toFixed(1)}%</span>
                                </div>
                                <Progress value={comp.marketShare} className="h-2 bg-slate-800" indicatorClassName={comp.isPlayer ? 'bg-rose-500' : 'bg-slate-600'} />
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
                        <CardTitle className="text-sm font-medium text-slate-400">Market Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            +4.2%
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Demand increasing</p>
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
        </div>
    );
};
