import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ParticleLayer } from '../effects/ParticleLayer';
import { useFarm } from '@/hooks/useFarm';
import { Loader2, Wrench, Sprout, TrendingUp, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SOUNDS } from '@/config/sounds';
import { useAudio } from '@/contexts/AudioContext';

interface GoldenHarvesterViewProps {
    onBack: () => void;
}

export const GoldenHarvesterView: React.FC<GoldenHarvesterViewProps> = ({ onBack }) => {
    const { farm, upgradeGoldenHarvester, isLoading } = useFarm();
    const { toast } = useToast();
    const { playSFX } = useAudio();
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [hapticShake, setHapticShake] = useState(false);

    // Find current level using CANDID enum object checking
    const rawLevel = farm?.infrastructure.find(i => 'GoldenHarvester' in i.infraType)?.level ?? 0;
    const harvesterLevel = Number(rawLevel);

    // Calculate cost exactly as in backend
    let costMultiplier = 1.0;
    for (let i = 1; i <= harvesterLevel; i++) {
        costMultiplier *= 1.15;
    }
    const baseCost = import.meta.env.VITE_DFX_NETWORK === 'ic' ? 100000 : 10000;
    const nextCost = Math.floor(baseCost * costMultiplier);
    const canAfford = (farm?.cash ?? 0) >= nextCost;

    // Calculate yield multiplier exactly as in backend
    let yieldMultiplier = 1.0;
    for (let i = 1; i <= harvesterLevel; i++) {
        yieldMultiplier *= 1.05;
    }
    const nextYieldMultiplier = yieldMultiplier * 1.05;

    const handleUpgrade = async () => {
        if (!canAfford) return;

        // Haptic visual feedback: Button click -> shake -> particle explosion (simulated via engine)
        playSFX(SOUNDS.GAME.LEVEL_UP);
        setHapticShake(true);
        setTimeout(() => setHapticShake(false), 500);

        try {
            setIsUpgrading(true);
            await upgradeGoldenHarvester.mutateAsync();
            toast({
                title: "Upgrade Complete!",
                description: `Golden Harvester reached Level ${harvesterLevel + 1}`,
            });
        } catch (error: any) {
            toast({
                title: "Upgrade Failed",
                description: error.message || "Failed to upgrade infrastructure.",
                variant: "destructive",
            });
        } finally {
            setIsUpgrading(false);
        }
    };

    return (
        <div className={`relative min-h-[calc(100vh-8rem)] w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out ${hapticShake ? 'animate-shake' : ''}`}>
            {/* Dynamic Lighting Background: Golden Hour & God Rays */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
                style={{
                    backgroundImage: 'url(/golden_harvester_bg_placeholder.jpg)', // Placeholder for actual asset
                    backgroundColor: '#3b1c1c' // Fallback deep ruby/brass base
                }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#1a0f0f] to-transparent bg-opacity-90" />
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* God Rays CSS Simulation */}
                <div className="absolute top-[-20%] left-[10%] w-[100%] h-[150%] bg-gradient-to-b from-amber-200/20 to-transparent transform rotate-45 blur-3xl opacity-60 mix-blend-overlay" />
                <div className="absolute top-[-30%] left-[40%] w-[80%] h-[180%] bg-gradient-to-b from-yellow-100/30 to-transparent transform rotate-12 blur-2xl opacity-40 mix-blend-overlay" />
            </div>

            {/* Particle Engine Overlay */}
            <ParticleLayer preset="GoldenPollen" />

            {/* Main Content Pane */}
            <div className="relative z-10 p-6 sm:p-10 flex flex-col h-full bg-black/20 backdrop-blur-md">

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-600 drop-shadow-md tracking-wider uppercase filter drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                            The Golden Harvester
                        </h1>
                        <p className="text-lg text-amber-100/80 font-medium mt-2 tracking-wide">
                            Neo-Steampunk Infrastructure • Opole DNA Series
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={onBack}
                        className="border-amber-500/50 text-amber-200 hover:bg-amber-900/50 hover:text-amber-100 backdrop-blur-sm transition-all"
                    >
                        Back to Dashboard
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-auto">
                    {/* Status Panel (Glassmorphism) */}
                    <Card className="bg-slate-900/60 border-amber-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-2xl text-amber-400">
                                <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />
                                Current Mechanics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 rounded-lg bg-black/40 border border-amber-900/50 flex justify-between items-center shadow-inner">
                                <span className="text-amber-200 font-medium tracking-wide">Machine Level</span>
                                <span className="text-3xl font-mono text-amber-400 font-bold">{Number(harvesterLevel)}</span>
                            </div>
                            <div className="p-4 rounded-lg bg-black/40 border border-amber-900/50 shadow-inner">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-amber-200 font-medium tracking-wide flex items-center gap-2">
                                        <Sprout className="h-4 w-4" /> Global Yield Multiplier
                                    </span>
                                    <span className="text-xl font-mono text-green-400 font-bold">
                                        {(yieldMultiplier * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                                    <div className="bg-gradient-to-r from-green-500 to-amber-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min((yieldMultiplier - 1) * 200, 100)}%` }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upgrade Panel */}
                    <Card className="bg-gradient-to-b from-amber-900/40 to-black/60 border-amber-500/40 backdrop-blur-xl shadow-[0_0_40px_rgba(217,119,6,0.2)] text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-2xl text-amber-400">
                                <TrendingUp className="h-6 w-6" /> Next Generation
                            </CardTitle>
                            <CardDescription className="text-amber-200/70 text-base">
                                Install advanced brass pressure valves and ruby steam injectors to strictly adhere to Sector 1 Yield scaling regulations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 rounded-lg bg-red-950/30 border border-rose-900/50 flex justify-between items-center">
                                <span className="text-amber-200 font-medium">Estimated New Yield</span>
                                <span className="text-xl font-mono text-green-400 font-bold">
                                    {(nextYieldMultiplier * 100).toFixed(1)}% <span className="text-sm text-green-500/70">(+5.0%)</span>
                                </span>
                            </div>

                            <div className="pt-4 border-t border-amber-800/50 flex flex-col justify-between h-full gap-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-amber-200 uppercase tracking-widest text-sm font-semibold">Upgrade Cost</span>
                                    <span className={`text-2xl font-mono font-bold ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>
                                        {nextCost.toLocaleString()} PLN
                                    </span>
                                </div>

                                <Button
                                    className={`w-full h-14 text-lg font-bold tracking-wider transition-all duration-300 relative overflow-hidden ${canAfford
                                        ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:shadow-[0_0_30px_rgba(252,211,77,0.6)] hover:-translate-y-1'
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                        }`}
                                    disabled={!canAfford || isUpgrading || isLoading}
                                    onClick={handleUpgrade}
                                >
                                    {isUpgrading || isLoading ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Calibrating Valves...</>
                                    ) : (
                                        <><Wrench className="mr-2 h-5 w-5" /> Install Level {Number(harvesterLevel) + 1} Injector</>
                                    )}
                                    {/* Stylized Shine effect over button */}
                                    {canAfford && <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />}
                                </Button>

                                {!canAfford && (
                                    <p className="text-xs text-center text-red-400/80 animate-pulse">Insufficient funds for next structural iteration.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
