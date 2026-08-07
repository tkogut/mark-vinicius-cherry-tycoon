import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Flag, Trophy, MapPin, Users } from "lucide-react";
import { getClubSharePrice, LEAGUE_LABELS } from "@/lib/gameLogic";
import type { FootballClub } from "@/declarations/backend.did";

// SPORTS-03. The previous version mapped `c.price` and `c.sharesAvailable`,
// neither of which exists on `Types.FootballClub` — both rendered as 0 — and
// printed `c.region` as a string when it is a `Region` record. So this screen
// was "already fully built" against a contract the backend never had, the same
// defect class as ECON-06's `baseCapacity`. It now reads the real Candid type.
//
// Ownership is single-patron (see backend/sports_logic.mo): a club is unclaimed,
// yours, or another player's. There is no share market between players yet.

interface SportsCenterProps {
    ownedClubs: string[];
}

/** How much of a club a player buys per click. 5% is a real commitment without
 *  forcing a full takeover — the backend accepts 1-100. */
const STAKE_STEP = 5;

const formatRegion = (region: FootballClub['region']): string => {
    const province = Object.keys(region.province)[0] ?? '';
    // "Lubrza, pow. Prudnik" reads the way a Polish player expects.
    return `${region.commune}, pow. ${region.county}${province === 'Opolskie' ? '' : ` (${province})`}`;
};

const leagueLabel = (league: FootballClub['league']): string => {
    const key = Object.keys(league)[0] ?? '';
    return LEAGUE_LABELS[key] ?? key;
};

export const SportsCenter: React.FC<SportsCenterProps> = ({ ownedClubs }) => {
    const { backendActor } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: clubs, isLoading, isError } = useQuery({
        queryKey: ['availableFootballClubs'],
        queryFn: async (): Promise<FootballClub[]> => {
            if (!backendActor) throw new Error("Not authenticated");
            const result = await backendActor.getAvailableFootballClubs();
            if ('Err' in result) throw new Error("Failed to fetch clubs");
            return result.Ok;
        },
        enabled: !!backendActor,
    });

    const buyMutation = useMutation({
        mutationFn: async (club: FootballClub) => {
            if (!backendActor) throw new Error("Not authenticated");
            const result = await backendActor.buyClubShares(club.id, BigInt(STAKE_STEP));
            if ('Err' in result) {
                // Surface the canister's own reason — it explains *why* (already
                // claimed, not enough left, cannot afford) far better than a
                // generic failure toast can.
                const err = result.Err as Record<string, unknown>;
                const [kind, detail] = Object.entries(err)[0] ?? ['Unknown', null];
                if (kind === 'InsufficientFunds' && detail && typeof detail === 'object') {
                    const funds = detail as { required: bigint; available: bigint };
                    throw new Error(
                        `Need ${Number(funds.required).toLocaleString()} PLN, you have ${Number(funds.available).toLocaleString()} PLN.`
                    );
                }
                throw new Error(typeof detail === 'string' ? detail : kind);
            }
            return result.Ok;
        },
        onSuccess: (message) => {
            toast({ title: "Stake acquired", description: message });
            queryClient.invalidateQueries({ queryKey: ['availableFootballClubs'] });
            queryClient.invalidateQueries({ queryKey: ['farm'] });
        },
        onError: (error: Error) => {
            toast({ title: "Purchase failed", description: error.message, variant: "destructive" });
        },
    });

    const myClubs = (clubs ?? []).filter((club) => ownedClubs.includes(club.id));

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Flag className="h-6 w-6 text-sky-500" />
                    Sports Patron
                </h2>
                <p className="text-slate-400 mt-1">
                    Back a village club in the Opole leagues. Owning a stake costs cash and shows
                    your standing in the county — it does not yet change how the orchard performs.
                </p>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg text-slate-200">Your Patronage</CardTitle>
                    <CardDescription>Clubs you hold a stake in.</CardDescription>
                </CardHeader>
                <CardContent>
                    {myClubs.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-500">
                            You back no club yet. A small stake in a Klasa A side is the usual first step.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {myClubs.map((club) => (
                                <div
                                    key={club.id}
                                    className="flex items-center justify-between gap-3 rounded-lg border border-sky-900/60 bg-sky-950/20 px-4 py-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Trophy className="h-4 w-4 text-sky-400 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-slate-200 truncate">{club.name}</div>
                                            <div className="text-[11px] text-slate-500">
                                                {leagueLabel(club.league)} · {formatRegion(club.region)}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-sky-900/40 text-sky-300 border-sky-800 font-mono flex-shrink-0">
                                        {Number(club.ownershipPercent)}%
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div>
                <h3 className="text-lg font-bold text-slate-300 mb-4">Clubs in the region</h3>

                {!backendActor ? (
                    // Guest mode has no actor, so the query never runs. An empty
                    // grid would read as "there are no clubs", which is false.
                    <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-sm">
                        Sign in to see the clubs in your region.
                    </div>
                ) : isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                ) : isError ? (
                    <div className="p-6 text-center border border-dashed border-red-900/60 rounded-lg text-red-400/80 text-sm">
                        Could not load the club list.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(clubs ?? []).map((club) => {
                            const held = Number(club.ownershipPercent);
                            const isMine = ownedClubs.includes(club.id);
                            const takenByAnother = held > 0 && !isMine;
                            const available = 100 - held;
                            const stake = Math.min(STAKE_STEP, available);
                            const price = getClubSharePrice(Number(club.marketValue), stake);
                            const pending = buyMutation.isPending && buyMutation.variables?.id === club.id;

                            return (
                                <Card key={club.id} className="bg-slate-950 border-slate-800">
                                    <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                                        <div>
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <h4 className="font-bold text-slate-200">{club.name}</h4>
                                                <Badge variant="outline" className="border-slate-700 text-slate-400 flex-shrink-0">
                                                    {leagueLabel(club.league)}
                                                </Badge>
                                            </div>

                                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-3">
                                                <MapPin className="h-3 w-3" />
                                                {formatRegion(club.region)}
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono">
                                                <span className="text-slate-500">Club value</span>
                                                <span className="text-right text-slate-300">
                                                    {Number(club.marketValue).toLocaleString()} PLN
                                                </span>
                                                <span className="text-slate-500">Table position</span>
                                                <span className="text-right text-slate-300">{Number(club.leaguePosition)}.</span>
                                                <span className="text-slate-500">Stadium</span>
                                                <span className="text-right text-slate-300">
                                                    {Number(club.stadiumCapacity).toLocaleString()} seats
                                                </span>
                                                <span className="text-slate-500">Claimed</span>
                                                <span className={`text-right font-bold ${held > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
                                                    {held}%
                                                </span>
                                            </div>
                                        </div>

                                        {takenByAnother ? (
                                            <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-[11px] text-slate-500">
                                                <Users className="h-3.5 w-3.5 flex-shrink-0" />
                                                Another patron backs this club.
                                            </div>
                                        ) : (
                                            <Button
                                                className="w-full bg-sky-600 hover:bg-sky-500 text-white disabled:bg-slate-800 disabled:text-slate-500"
                                                disabled={pending || available === 0}
                                                onClick={() => buyMutation.mutate(club)}
                                            >
                                                {pending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                                {available === 0
                                                    ? 'Fully owned'
                                                    : `Take ${stake}% — ${price.toLocaleString()} PLN`}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
