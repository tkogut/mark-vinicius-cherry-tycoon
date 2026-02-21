import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Flag, Trophy, TrendingUp } from "lucide-react";

interface Club {
    id: string;
    name: string;
    region: string;
    price: number;
    sharesAvailable: number;
}

interface SportsCenterProps {
    ownedClubs: string[];
}

export const SportsCenter: React.FC<SportsCenterProps> = ({ ownedClubs }) => {
    const { backendActor } = useAuth();
    const queryClient = useQueryClient();

    // Fetch available clubs from backend
    const { data: clubsRaw, isLoading } = useQuery({
        queryKey: ['availableFootballClubs'],
        queryFn: async () => {
            if (!backendActor) throw new Error("Not authenticated");
            const result = await backendActor.getAvailableFootballClubs();
            if ('Err' in result) throw new Error("Failed to fetch clubs");
            return result.Ok;
        },
        enabled: !!backendActor
    });

    // Mock processing since actual struct might vary
    const clubs: Club[] = (clubsRaw || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        region: c.region,
        price: Number(c.price || 0),
        sharesAvailable: Number(c.sharesAvailable || 0)
    }));

    const buyMutation = useMutation({
        mutationFn: async (clubId: string) => {
            if (!backendActor) throw new Error("Not authenticated");
            const result = await backendActor.buyClubShares(clubId, 1n); // Purchasing 1 share as stub
            if ('Err' in result) throw new Error("Failed to purchase");
            return result.Ok;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['availableFootballClubs'] });
            queryClient.invalidateQueries({ queryKey: ['farm'] }); // Update ownedClubs
        }
    });

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Flag className="h-6 w-6 text-sky-500" />
                    Sports Center
                </h2>
                <p className="text-slate-400 mt-1">Invest in regional football clubs to boost your farm's reputation and local market presence.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-slate-800 col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-200">Your Sponsorships</CardTitle>
                        <CardDescription>Clubs currently supported by your farm.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {ownedClubs.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-500">
                                You haven't sponsored any clubs yet. Investing in local sports increases brand visibility!
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {ownedClubs.map(clubId => {
                                    const club = clubs.find(c => c.id === clubId);
                                    return (
                                        <Badge key={clubId} variant="secondary" className="bg-sky-950/30 text-sky-400 p-2 text-sm border-sky-900">
                                            <Trophy className="h-4 w-4 mr-2" />
                                            {club?.name || clubId}
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="col-span-1 md:col-span-2">
                    <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        Available Investments
                    </h3>

                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {clubs.map(club => {
                                const isOwned = ownedClubs.includes(club.id);
                                return (
                                    <Card key={club.id} className="bg-slate-950 border-slate-800">
                                        <CardContent className="p-5 flex flex-col justify-between h-full">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-slate-200">{club.name}</h4>
                                                    <Badge variant="outline" className="border-slate-700 text-slate-400">{club.region}</Badge>
                                                </div>
                                                <div className="text-2xl font-mono text-emerald-400 mb-4">
                                                    ${club.price.toLocaleString()}
                                                </div>
                                            </div>

                                            <Button
                                                className={`w-full ${isOwned ? 'bg-slate-800 text-slate-500' : 'bg-sky-600 hover:bg-sky-500 text-white'}`}
                                                disabled={isOwned || buyMutation.isPending || club.sharesAvailable <= 0}
                                                onClick={() => buyMutation.mutate(club.id)}
                                            >
                                                {buyMutation.isPending && buyMutation.variables === club.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : null}
                                                {isOwned ? "Already Sponsored" : "Buy 1 Share"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
