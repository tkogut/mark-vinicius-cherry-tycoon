import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Cherry, Settings, RefreshCcw, Menu, User, Trophy, Coins, Zap, TrendingUp } from "lucide-react"
import React, { useState, useEffect, useRef, useCallback } from "react"
import { LoginButton } from "@/components/LoginButton"
import { useAuth } from "@/hooks/useAuth"
import { Sidebar } from "@/components/layout/Sidebar"
// Lazy load heavy components
const FarmGrid = React.lazy(() => import("@/components/farm/FarmGrid").then(module => ({ default: module.FarmGrid })));
import { PlantingModal } from "@/components/farm/modals/PlantingModal"
import { SellModal } from '@/components/farm/modals/SellModal';
import { CompetitorsPanel } from "@/components/social/CompetitorsPanel";
import { RankingsPanel } from "@/components/social/RankingsPanel";
import { SportsCenter } from "@/components/sports/SportsCenter";
const Marketplace = React.lazy(() => import('@/components/farm/Marketplace').then(module => ({ default: module.Marketplace })));
import { InvestmentsDashboard } from "@/components/farm/InvestmentsDashboard";
import { ParticleLayer } from "@/components/effects/ParticleLayer";
import { Toaster } from "@/components/ui/toaster"
import { InventoryBar } from "@/components/layout/InventoryBar"
import { useFarm } from "@/hooks/useFarm"
import { useGuestFarm } from "@/hooks/useGuestFarm"
import { SeasonDisplay } from "@/components/season/SeasonDisplay"
import { FinancialReportModal } from "@/components/farm/modals/FinancialReportModal"
import { OnboardingModal } from "@/components/farm/modals/OnboardingModal"
import { FarmStatsModal } from "@/components/farm/modals/FarmStatsModal"
import { useInstallPrompt } from "@/utils/pwa"
import { useToast } from "@/components/ui/use-toast"
import { calculateYieldBreakdown } from "@/lib/gameLogic"
import { PhaseIndicator } from "@/components/season/PhaseIndicator"
import { WeatherEventModal, WeatherEventType } from "@/components/season/WeatherEventModal"
import { WeatherOverlay } from "@/components/season/WeatherOverlay"
import { SeasonalEffects } from "@/components/season/SeasonalEffects"

import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { WeatherEffects } from "@/components/season/WeatherEffects"
import { AudioProvider, useAudio } from '@/contexts/AudioContext';
import { VolumeControl } from '@/components/ui/VolumeControl';
import { SOUNDS } from '@/config/sounds';

function AppContent() {
    const { isAuthenticated, isInitializing, identity } = useAuth();
    const { playBGM, stopBGM } = useAudio();

    useEffect(() => {
        // Start BGM on user interaction or immediately (depending on browser policy)
        // For now, we try immediately, but howler handles unlocking
        playBGM(SOUNDS.BGM.MAIN);
        return () => stopBGM();
    }, []);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
    const [plantingModalOpen, setPlantingModalOpen] = useState(false);
    const [sellModalOpen, setSellModalOpen] = useState(false);
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [financialReportOpen, setFinancialReportOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'marketplace' | 'sports' | 'neighbors' | 'rankings' | 'harvester'>('dashboard');

    // Harvest Velocity — drives the Sunset-Glow particle intensity
    const [harvestVelocity, setHarvestVelocity] = useState(0);
    const velocityDecayRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Decay the velocity smoothly over time
    useEffect(() => {
        velocityDecayRef.current = setInterval(() => {
            setHarvestVelocity(prev => {
                const next = prev * 0.97; // Smooth exponential decay
                return next < 0.01 ? 0 : next;
            });
        }, 100);
        return () => {
            if (velocityDecayRef.current) clearInterval(velocityDecayRef.current);
        };
    }, []);

    const boostHarvestVelocity = useCallback(() => {
        setHarvestVelocity(prev => Math.min(1.0, prev + 0.35));
    }, []);

    const {
        farm,
        isLoading,
        refetch,
        plant,
        water,
        fertilize,
        harvest,
        buyParcel,
        sellCherries,
        startOrganicConversion,
        upgradeInfrastructure,
        advancePhase,
        cutAndPrune
    } = useGuestFarm();

    const showOnboarding = isAuthenticated && !!identity && !isLoading && !farm;

    // Derived state
    const stats = {
        totalCherries: farm ? Number(farm.inventory.cherries) + Number(farm.inventory.organicCherries) : 0,
        organicCherries: farm ? Number(farm.inventory.organicCherries) : 0,
        regularCherries: farm ? Number(farm.inventory.cherries) : 0,
        activeParcels: farm ? farm.parcels.length : 0,
        productionRate: farm ? farm.parcels.reduce((acc, parcel) => {
            const breakdown = calculateYieldBreakdown(parcel, farm.infrastructure);
            return acc + breakdown.parcelYield;
        }, 0) : 0,
        level: farm ? Number(farm.level) : 1,
        xp: farm ? Number(farm.experience) : 0,
        nextLevelXp: farm ? Number(farm.level) * 1000 : 1000,
        cash: farm ? farm.cash : 0n,
        currentSeason: farm ? farm.currentSeason : { Spring: null },
        seasonNumber: farm ? Number(farm.seasonNumber) : 1,
    };

    const parcels = farm ? farm.parcels : [];

    // Helper to determine current phase
    const getCurrentPhaseName = (phase: any): any => {
        if (!phase) return 'Hiring';
        if (typeof phase === 'string') return phase;
        return Object.keys(phase)[0] || 'Hiring';
    };

    const currentPhase = getCurrentPhaseName(farm?.currentPhase) as any;

    // Helper for theme class
    const getThemeClass = (season: any) => {
        if (!season) return '';
        const seasonName = Object.keys(season)[0] || '';
        switch (seasonName) {
            case 'Spring': return 'theme-spring';
            case 'Summer': return 'theme-summer';
            case 'Autumn': return 'theme-autumn';
            case 'Winter': return 'theme-winter';
            default: return '';
        }
    };

    const handleParcelAction = (action: 'plant' | 'water' | 'fertilize' | 'harvest' | 'organic' | 'prune', parcelId: string) => {
        if (action === 'plant') {
            setSelectedParcelId(parcelId);
            setPlantingModalOpen(true);
            return;
        }

        if (action === 'water') {
            water.mutate(parcelId);
        } else if (action === 'harvest') {
            harvest.mutate(parcelId, {
                onSuccess: () => boostHarvestVelocity(),
            });
        } else if (action === 'fertilize') {
            // Default to NPK fertilizer for quick action
            // TODO: Add fertilizer selection modal
            fertilize.mutate({ parcelId, fertilizerType: "NPK" });
        } else if (action === 'organic') {
            startOrganicConversion.mutate(parcelId);
        } else if (action === 'prune') {
            cutAndPrune.mutate(parcelId);
        }
    };

    const handlePlantConfirm = async (amount: number) => {
        if (selectedParcelId) {
            await plant.mutateAsync({ parcelId: selectedParcelId, amount });
        }
    };

    const handleBuyParcel = async () => {
        console.log("Buying new parcel...");
        // TODO: Get parcel ID and price from UI/modal
        // For now, using placeholder values
        const parcelId = `parcel_new_${Date.now()}`;
        const price = 10000; // Default parcel price

        try {
            await buyParcel.mutateAsync({ parcelId, price });
        } catch (error) {
            console.error("Failed to buy parcel:", error);
        }
    }

    const handleSellCherries = () => {
        setSellModalOpen(true);
    };

    const handleConfirmSell = async (amount: number, type: 'wholesale' | 'retail') => {
        try {
            await sellCherries.mutateAsync({
                amount,
                marketType: type
            });
            setSellModalOpen(false);
        } catch (error) {
            console.error("Failed to sell cherries:", error);
        }
    };

    // Calculate max trees based on cash (50 per tree)
    const maxAffordableTrees = Number(stats.cash / 50n);
    const maxPlantable = Math.max(0, Math.min(200, maxAffordableTrees));

    // Mock Weather Event State (To be connected to backend)
    const [weatherEvent, setWeatherEvent] = useState<{
        type: WeatherEventType;
        name: string;
        description: string;
        yieldImpact: number;
        infrastructureMitigation?: string;
    } | null>(null);

    // 4. Initialization loading screen
    if (isInitializing) {
        return (
            <div className={`min-h-screen bg-slate-950 font-sans ${getThemeClass(stats.currentSeason)} flex flex-col items-center justify-center p-4 overflow-x-hidden selection:bg-rose-500/30 selection:text-rose-200 transition-colors duration-1000`}>
                <div className="flex flex-col items-center gap-6 max-w-sm w-full text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                        <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-3xl animate-pulse">
                            <Cherry className="h-16 w-16 text-rose-500 animate-bounce" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
                            Cherry Tycoon
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">
                            Establishing secure connection to the Internet Computer...
                        </p>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-rose-600 animate-[loading_1.5s_ease-in-out_infinite]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row relative ${getThemeClass(stats.currentSeason)}`}>
            {/* Weather Overlay */}
            <WeatherEffects weatherState={farm?.weather} />

            {/* Sunset-Glow Particle Layer — bound to harvest_velocity */}
            {harvestVelocity > 0 && (
                <ParticleLayer preset="SunsetGlow" intensity={harvestVelocity} />
            )}
            {/* Atmospheric Vignette */}
            <div className="sunset-vignette" />

            {/* Ambient Effects */}
            <WeatherOverlay
                type={weatherEvent?.type === 'Storm' ? 'rain' : stats.currentSeason && 'Winter' in stats.currentSeason ? 'snow' : 'none'}
            />
            <SeasonalEffects
                season={stats.currentSeason ? Object.keys(stats.currentSeason)[0] as any : null}
            />
            <Toaster />
            <WeatherEventModal
                isOpen={!!weatherEvent}
                onClose={() => setWeatherEvent(null)}
                event={weatherEvent}
            />
            <PlantingModal
                isOpen={plantingModalOpen}
                onClose={() => setPlantingModalOpen(false)}
                onConfirm={handlePlantConfirm}
                maxTrees={maxPlantable}
                userCash={stats.cash}
            />
            <SellModal
                isOpen={sellModalOpen}
                onClose={() => setSellModalOpen(false)}
                onSell={handleConfirmSell}
                totalCherries={stats.totalCherries}
                isLoading={sellCherries.isPending}
            />

            <FarmStatsModal
                isOpen={statsModalOpen}
                onClose={() => setStatsModalOpen(false)}
                stats={{
                    totalCherries: stats.totalCherries,
                    activeParcels: stats.activeParcels,
                    productionRate: stats.productionRate
                }}
            />

            <OnboardingModal
                isOpen={showOnboarding}
                onClose={() => { }} // Force onboarding if missing farm
                onSuccess={() => refetch()}
            />



            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                level={stats.level}
                xp={stats.xp}
                nextLevelXp={stats.nextLevelXp}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                ownedInfrastructure={farm?.infrastructure || []}
                parcels={farm?.parcels || []}
                onOpenFinancialReport={() => setFinancialReportOpen(true)}
            />

            <FinancialReportModal
                isOpen={financialReportOpen}
                onClose={() => setFinancialReportOpen(false)}
                seasonalReports={farm?.statistics.seasonalReports || []}
                yearlyReports={farm?.statistics.yearlyReports || []}
                parcels={parcels}
                overallStatistics={farm ? {
                    totalRevenue: farm.statistics?.totalRevenue || 0n,
                    totalCosts: farm.statistics?.totalCosts || 0n,
                    totalHarvested: farm.statistics?.totalHarvested || 0n,
                    bestYearlyProfit: farm.statistics?.bestYearlyProfit || 0n,
                } : undefined}
            />

            <div className="main-layout-wrapper flex-1 w-full flex flex-col md:ml-64 lg:ml-72 min-h-screen transition-all duration-300 bg-slate-950 pb-20 md:pb-0">

                {/* Mobile/Tablet Header */}
                <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 md:hidden h-16 flex items-center justify-between px-4">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-6 w-6 text-slate-400" />
                    </Button>
                    <div className="flex items-center gap-1">
                        <LanguageSwitcher />
                        <VolumeControl />
                    </div>
                    <div className="flex items-center gap-2">
                        <Cherry className="h-6 w-6 text-rose-600 animate-pulse" />
                        <div className="flex flex-col">
                            <span className="font-bold text-sm leading-tight text-slate-100">Mark Vinicius</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Cherry Tycoon</span>
                        </div>
                    </div>
                    <LoginButton />
                </header>

                {/* Mobile Inventory Bar (Sticky below header) */}
                <InventoryBar
                    cash={stats.cash}
                    cherries={stats.regularCherries}
                    organicCherries={stats.organicCherries}
                    className="md:hidden sticky top-16 z-20"
                />

                <main className="flex-1 p-4 md:p-8 lg:p-10 pb-20 md:pb-8 text-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Farm Overview</h1>
                            <div className="flex items-center gap-4">
                                <PhaseIndicator currentPhase={currentPhase} />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            {/* Inventory Bar (Stats) */}
                            <InventoryBar
                                cash={stats.cash}
                                cherries={stats.regularCherries}
                                organicCherries={stats.organicCherries}
                                className="hidden md:flex shadow-none md:shadow-none bg-transparent p-0 static border-none backdrop-blur-0"
                            />

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Season Display */}
                                <SeasonDisplay
                                    currentSeason={stats.currentSeason}
                                    seasonNumber={stats.seasonNumber}
                                    className="flex"
                                />

                                {/* Advance Phase Button */}
                                <Button
                                    onClick={() => advancePhase.mutate()}
                                    disabled={!isAuthenticated || advancePhase.isPending}
                                    variant="default"
                                    size="sm"
                                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white flex shadow-md font-semibold"
                                >
                                    {advancePhase.isPending ? (
                                        <RefreshCcw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Zap className="h-4 w-4" />
                                    )}
                                    End Phase
                                </Button>

                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setActiveTab('harvester')}
                                    disabled={!isAuthenticated}
                                    className="gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white border-0 shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all flex font-bold tracking-wider"
                                >
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="hidden sm:inline">HARVESTER</span>
                                </Button>

                                {/* Sell Cherries Button */}
                                <Button
                                    onClick={handleSellCherries}
                                    disabled={!isAuthenticated || stats.totalCherries === 0 || sellCherries.isPending}
                                    variant="default"
                                    size="sm"
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white flex"
                                >
                                    <Cherry className="h-4 w-4" />
                                    Sell ({stats.totalCherries})
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => refetch()}
                                    disabled={isLoading || !isAuthenticated}
                                    className="gap-2 text-slate-900 md:text-border md:bg-transparent md:text-slate-100 hover:bg-slate-800"
                                >
                                    <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </Button>

                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setStatsModalOpen(true)}
                                    disabled={!isAuthenticated}
                                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Farm stats</span>
                                </Button>

                                <div className="hidden md:flex items-center gap-2">
                                    <VolumeControl />
                                    <LanguageSwitcher />
                                    <LoginButton />
                                </div>
                            </div>
                        </div>
                    </div>



                    {isAuthenticated ? (
                        <React.Suspense fallback={<div className="flex justify-center p-12"><RefreshCcw className="animate-spin h-8 w-8 text-rose-500" /></div>}>
                            {activeTab === 'dashboard' ? (
                                <FarmGrid
                                    parcels={parcels}
                                    onAction={handleParcelAction}
                                    onBuyParcel={handleBuyParcel}
                                    loading={
                                        isLoading ||
                                        advancePhase.isPending ||
                                        plant.isPending ||
                                        water.isPending ||
                                        fertilize.isPending ||
                                        harvest.isPending ||
                                        startOrganicConversion.isPending
                                    }
                                    currentSeason={stats.currentSeason}
                                    infrastructure={farm?.infrastructure || []}
                                    currentPhase={currentPhase}
                                />
                            ) : activeTab === 'harvester' ? (
                                <div className="animate-in slide-in-from-right-[100%] duration-500 ease-out fill-mode-forwards sm:slide-in-from-right-[150%]">
                                    <InvestmentsDashboard onBack={() => setActiveTab('dashboard')} />
                                </div>
                            ) : activeTab === 'marketplace' ? (
                                <Marketplace
                                    cash={stats.cash}
                                    ownedInfrastructure={farm?.infrastructure || []}
                                    onPurchase={(id) => upgradeInfrastructure.mutate(id)}
                                    isLoading={upgradeInfrastructure.isPending}
                                />
                            ) : activeTab === 'sports' ? (
                                <SportsCenter
                                    ownedClubs={farm?.ownedClubs || []}
                                />
                            ) : activeTab === 'neighbors' ? (
                                <CompetitorsPanel
                                    playerCash={stats.cash}
                                    playerReputation={farm?.reputation}
                                    playerName={farm?.playerName}
                                />
                            ) : activeTab === 'rankings' ? (
                                <RankingsPanel
                                    playerStats={{
                                        name: farm?.playerName || "You",
                                        cash: stats.cash,
                                        productionRate: stats.productionRate
                                    }}
                                />
                            ) : (
                                <div className="h-64 flex items-center justify-center border border-dashed border-slate-700 rounded-xl bg-slate-800/20">
                                    <div className="text-center">
                                        <Trophy className="h-10 w-10 text-slate-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium">Sports Center Coming Soon</h3>
                                        <p className="text-sm text-slate-500">Regional football leagues and sponsorships are in development.</p>
                                    </div>
                                </div>
                            )}
                        </React.Suspense>
                    ) : (
                        // 5. Auth selection screen
                        <section className="mt-12">
                            <div className="h-64 rounded-xl border-2 border-dashed border-slate-700/50 flex flex-col items-center justify-center bg-slate-800/30 space-y-4">
                                <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                                    <User className="h-8 w-8 text-slate-400" />
                                </div>
                                <div className="text-center max-w-sm px-4">
                                    <h3 className="text-lg font-semibold text-slate-200">Authentication Required</h3>
                                    <p className="text-sm text-slate-400 mt-1">Connect with Internet Identity to access your farm and start growing.</p>
                                </div>
                                <LoginButton />
                            </div>
                        </section>
                    )}
                </main>
            </div>
            {/* PWA Install Button (Conditional) */}
            <InstallPrompt />
        </div>
    )
}

function InstallPrompt() {
    const { isInstallable, promptInstall } = useInstallPrompt();
    const { toast } = useToast();
    const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        if (isInstallable && !hasShown) {
            setHasShown(true);
            toast({
                title: "Install App",
                description: "Add Mark Vinicius to your home screen for the best experience.",
                action: (
                    <Button
                        onClick={() => {
                            promptInstall();
                        }}
                        size="sm"
                        className="bg-rose-600 text-white"
                    >
                        Install
                    </Button>
                ),
                duration: 10000,
            });
        }
    }, [isInstallable, hasShown, toast, promptInstall]);

    return null; // Rendered via toast
}

export default function App() {
    return (
        <I18nextProvider i18n={i18n}>
            <AudioProvider>
                <AppContent />
            </AudioProvider>
        </I18nextProvider>
    );
}
