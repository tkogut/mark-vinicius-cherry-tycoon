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
import { ShopModal } from "@/components/farm/modals/ShopModal";
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
import { isActionAllowed, GameAction, SeasonPhase, PHASE_DESCRIPTIONS } from "@/config/phaseConstants";
import { cn } from "@/lib/utils"


function AppContent() {
    const { isAuthenticated, isInitializing, identity } = useAuth();
    const { playBGM, stopBGM } = useAudio();
    const { toast } = useToast();

    useEffect(() => {
        return () => stopBGM();
    }, []);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
    const [plantingModalOpen, setPlantingModalOpen] = useState(false);
    const [sellModalOpen, setSellModalOpen] = useState(false);
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [financialReportOpen, setFinancialReportOpen] = useState(false);
    const [isShopModalOpen, setIsShopModalOpen] = useState(false);
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

    useEffect(() => {
        if (!isAuthenticated) {
            playBGM(SOUNDS.BGM.MAIN);
            return;
        }

        const season = Object.keys(stats.currentSeason)[0];
        let bgm = SOUNDS.BGM.MAIN;

        switch (season) {
            case 'Spring': bgm = SOUNDS.BGM.SEASON_SPRING; break;
            case 'Summer': bgm = SOUNDS.BGM.SEASON_SUMMER; break;
            case 'Autumn': bgm = SOUNDS.BGM.SEASON_AUTUMN; break;
            case 'Winter': bgm = SOUNDS.BGM.SEASON_WINTER; break;
        }

        playBGM(bgm);
    }, [isAuthenticated, stats.currentSeason]);

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
        const gameAction = action === 'prune' ? 'prune' : action as GameAction;

        if (!isActionAllowed(currentPhase, gameAction)) {
            toast({
                title: "Action Restricted",
                description: `You can't ${action} during the ${currentPhase} phase.`,
                variant: "destructive"
            });
            return;
        }

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

    // 4. Initialization loading screen (Neo-Steampunk Splash)
    if (isInitializing) {
        return (
            <div className={`min-h-screen bg-slate-950 font-sans ${getThemeClass(stats.currentSeason)} flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-1000`}>
                {/* Atmospheric Effects */}
                <div className="god-ray left-[20%] w-[30%] h-full opacity-20" />
                <div className="god-ray right-[10%] w-[20%] h-full opacity-10" style={{ animationDelay: '2s' }} />
                <div className="sunset-vignette opacity-60" />

                <div className="relative z-10 flex flex-col items-center gap-8 max-w-lg w-full text-center">
                    {/* Hero Graphic - Golden Harvester Splash */}
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-amber-500/20 blur-3xl rounded-full animate-pulse transition-opacity duration-1000" />
                        <div className="relative overflow-hidden rounded-[2rem] border-2 border-amber-500/30 shadow-[0_0_50px_rgba(212,160,86,0.2)]">
                            <img
                                src="/assets/golden_harvester_splash.png"
                                alt="Golden Harvester"
                                className="w-full aspect-[4/3] object-cover scale-105"
                            />
                            {/* Overlay glow */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        </div>
                    </div>

                    {/* Progress Panel - Brass Plate Aesthetic */}
                    <div
                        className="w-full rounded-2xl p-[2px] shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000"
                        style={{
                            background: 'linear-gradient(135deg, #d4a056 0%, #c9975a 20%, #f5d08a 40%, #e0b76c 60%, #9e7434 80%, #d4a056 100%)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                        }}
                    >
                        <div className="bg-slate-950/90 rounded-[14px] p-6 backdrop-blur-xl">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h1
                                        className="text-3xl font-black tracking-tighter uppercase italic"
                                        style={{
                                            background: 'linear-gradient(135deg, #f5d08a, #d4a056, #c9975a)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            filter: 'drop-shadow(0 0 10px rgba(212,160,86,0.3))'
                                        }}
                                    >
                                        Cherry Tycoon
                                    </h1>
                                    <p className="text-amber-500/60 text-[10px] font-bold uppercase tracking-[0.3em] font-mono">
                                        Initializing Core Engines
                                    </p>
                                </div>

                                {/* Status Message */}
                                <p className="text-slate-400 text-xs font-medium animate-pulse">
                                    Establishing secure connection to the Internet Computer...
                                </p>

                                {/* Progress Bar - Liquid Mercury Effect */}
                                <div
                                    className="relative h-2.5 w-full rounded-full overflow-hidden"
                                    style={{
                                        background: 'rgba(0,0,0,0.5)',
                                        border: '1px solid rgba(212,160,86,0.2)',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    <div
                                        className="absolute top-0 left-0 h-full rounded-full animate-[mercuryShimmer_2s_infinite]"
                                        style={{
                                            width: '60%', // Constant pull during init
                                            background: 'linear-gradient(180deg, #e8e8f0 0%, #c0c0d0 30%, #a8a8b8 50%, #8888a0 70%, #707088 100%)',
                                            boxShadow: '0 0 10px rgba(192,192,208,0.5), inset 0 1px 2px rgba(255,255,255,0.6)'
                                        }}
                                    />
                                    {/* Shimmer Overlay */}
                                    <div
                                        className="absolute top-0 left-0 h-full w-[60%] rounded-full"
                                        style={{
                                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 30%, transparent 60%)',
                                            animation: 'mercuryShimmer 1.5s ease-in-out infinite',
                                        }}
                                    />
                                </div>

                                <div className="mt-12 flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-1 w-1 rounded-full bg-amber-500/40 animate-ping" />
                                        <span className="text-xs text-slate-500 uppercase tracking-widest font-medium animate-pulse">Initializing Farmstead...</span>
                                        <div className="h-1 w-1 rounded-full bg-amber-500/40 animate-ping" style={{ animationDelay: '0.5s' }} />
                                    </div>
                                    <span className="text-[10px] text-slate-700 uppercase tracking-[0.4em] font-bold mt-8">
                                        Produced by JaPiTo Group
                                    </span>
                                </div>
                            </div>
                        </div>
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

            <ShopModal
                isOpen={isShopModalOpen}
                onClose={() => setIsShopModalOpen(false)}
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
                onOpenShop={() => setIsShopModalOpen(true)}
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
                            <div className="flex flex-col gap-3">
                                <PhaseIndicator currentPhase={currentPhase} />
                                <p className="text-xs text-slate-400 italic max-w-lg">
                                    {PHASE_DESCRIPTIONS[currentPhase as SeasonPhase]}
                                </p>
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
                                    className={cn(
                                        "gap-2 flex shadow-md font-semibold transition-all duration-300",
                                        currentPhase === 'Planning'
                                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 animate-pulse ring-2 ring-emerald-500/20"
                                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                    )}
                                >
                                    {advancePhase.isPending ? (
                                        <RefreshCcw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Zap className="h-4 w-4" />
                                    )}
                                    {currentPhase === 'Planning' ? "Start New Year" : "Next Phase"}
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
                                <div className="space-y-6">
                                    {isAuthenticated && currentPhase === 'Maintenance' && (
                                        <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                                            <p className="text-sm text-blue-400 font-medium">
                                                🛠️ Maintenance Phase: Your machines are being serviced. Good time to visit the Marketplace or end the phase.
                                            </p>
                                        </div>
                                    )}
                                    {isAuthenticated && currentPhase === 'Planning' && (
                                        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-lg p-4 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                                            <p className="text-sm text-indigo-400 font-medium">
                                                📜 Planning Phase: The season is over. Plan next year's strategy or start the new year.
                                            </p>
                                        </div>
                                    )}
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
                                </div>
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
                                    currentPhase={currentPhase}
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
