import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cherry, User, Sprout, Coins } from "lucide-react";
import { useAuth } from '@/context/AuthContext';

import { useToast } from "@/components/ui/use-toast";

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { backendActor } = useAuth();
    const { toast } = useToast();
    const [playerName, setPlayerName] = useState("");
    const [playerId, setPlayerId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[OnboardingModal] handleSubmit triggered');

        if (!backendActor) {
            console.error('[OnboardingModal] backendActor is null');
            setError("Connection to backend not established. Please try logging out and in again.");
            return;
        }

        if (!playerName || !playerId) {
            console.error('[OnboardingModal] Missing name or ID');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('[OnboardingModal] Calling backendActor.initializePlayer...', { playerId, playerName });
            const result = await backendActor.initializePlayer(playerId, playerName);
            console.log('[OnboardingModal] Backend result received:', result);

            if ('Ok' in result) {
                console.log('[OnboardingModal] Initialization success:', result.Ok);
                toast({
                    title: "Farm Established!",
                    description: `Welcome to the cherry tycoon world, ${playerName}!`,
                    className: "bg-emerald-900 border-emerald-800 text-emerald-100",
                });
                onSuccess();
                onClose();
            } else {
                console.error('[OnboardingModal] Backend returned Err:', result.Err);
                if ('AlreadyExists' in result.Err) {
                    setError("This player ID or name is already taken.");
                } else {
                    setError(`Initialization failed: ${JSON.stringify(result.Err)}`);
                }
            }
        } catch (err: any) {
            console.error('[OnboardingModal] Catch block error:', err);
            setError(err.message || "An unexpected error occurred during initialization.");
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to connect to the game server. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
                        <Sprout className="h-6 w-6 text-rose-500" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center">Welcome, Tycoon!</DialogTitle>
                    <DialogDescription className="text-slate-400 text-center">
                        Every great empire starts with a single seed. Name your farm and legacy to begin.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="playerName" className="text-slate-300">Farmer Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input
                                id="playerName"
                                placeholder="e.g. Mark Vinicius"
                                className="pl-10 bg-slate-800 border-slate-700 text-slate-100 focus:ring-rose-500"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="playerId" className="text-slate-300">Unique Player ID</Label>
                        <Input
                            id="playerId"
                            placeholder="e.g. mark_tycoon_1"
                            className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-rose-500"
                            value={playerId}
                            onChange={(e) => setPlayerId(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                            required
                            disabled={isLoading}
                        />
                        <p className="text-[10px] text-slate-500">This will be your permanent identifier in the world rankings.</p>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <div className="text-center">
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Starter Cash</div>
                            <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold">
                                <Coins className="h-3 w-3" />
                                50,000
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Starter Land</div>
                            <div className="flex items-center justify-center gap-1 text-sky-400 font-bold">
                                <Sprout className="h-3 w-3" />
                                0.5 ha
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-11"
                        disabled={isLoading || !playerName || !playerId}
                    >
                        {isLoading ? "Cultivating..." : "Establish Farm"}
                    </Button>
                </form>

                <div className="text-center">
                    <p className="text-[10px] text-slate-500 italic px-4">
                        "Agriculture is the most healthful, most useful, and most noble employment of man."
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
