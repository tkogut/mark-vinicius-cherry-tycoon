import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Cherry, Settings, RefreshCcw, Menu, User, Users, Trophy, Coins, Zap, TrendingUp } from "lucide-react"
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
import { MainDashboard } from "@/components/farm/MainDashboard";
import { ImperialOrchard } from "@/components/farm/ImperialOrchard";
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
import { ProcurementModal } from "@/components/ProcurementModal"
import { PlanningBoard } from "@/components/PlanningBoard"
import { ShopModal } from "@/components/farm/modals/ShopModal";
import { FarmStatsModal } from "@/components/farm/modals/FarmStatsModal"
import { HiringModal } from "@/components/farm/HiringModal"
import { useInstallPrompt } from "@/utils/pwa"
import { useToast } from "@/components/ui/use-toast"
import { calculateYieldBreakdown } from "@/lib/gameLogic"
import { PhaseIndicator } from "@/components/season/PhaseIndicator"
import { WeatherEventModal, WeatherEventType } from "@/components/season/WeatherEventModal"
import { WeatherOverlay } from "@/components/season/WeatherOverlay"
import { SeasonalEffects } from "@/components/season/SeasonalEffects"
import { AuctionDashboard } from "@/components/pools/AuctionDashboard";

import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { WeatherEffects } from "@/components/season/WeatherEffects"
import { AudioProvider, useAudio } from '@/contexts/AudioContext';
import { VolumeControl } from '@/components/ui/VolumeControl';
import { SOUNDS } from '@/config/sounds';
import { isActionAllowed, GameAction, SeasonPhase, PHASE_DESCRIPTIONS } from "@/config/phaseConstants";
import { cn } from "@/lib/utils"
import { mapBackendWeather } from "@/utils/weatherUtils";


function AppContent() {
    const { isAuthenticated, isInitializing, identity, backendActor } = useAuth();
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
    const [hiringModalOpen, setHiringModalOpen] = useState(false);
    const [procurementModalOpen, setProcurementModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'marketplace' | 'sports' | 'neighbors' | 'rankings' | 'harvester' | 'pool'>('dashboard');
    const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

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
        isError,
        error: farmError,
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
        cutAndPrune,
        hireLabor
    } = useGuestFarm();

    // Only show onboarding if we specifically failed with "Not Found" OR if we are authenticated but have no data
    const isNotFound = farmError?.message?.includes('Not Found') || (!farm && !isLoading && isAuthenticated && !isError);
    const showOnboarding = isAuthenticated && !!identity && isNotFound;

    // AUTO-ONBOARDING BYPASS
    useEffect(() => {
        const network = import.meta.env.VITE_DFX_NETWORK;
        if (showOnboarding && network !== 'ic' && !isLoading) {
            console.log('[App] Auto-Login detected. Automatically establishing farm for AgentTest...');
            const autoInit = async () => {
                try {
                    // Using a stable test ID and name for easy debugging
                    const result = await backendActor?.initializePlayer("agent_test", "Agent Test");
                    console.log('[App] Auto-initialization result:', result);
                    refetch();
                } catch (e) {
                    console.error('[App] Auto-onboarding failed:', e);
                }
            };
            autoInit();
        }
    }, [showOnboarding, isLoading, backendActor, refetch]);

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

    const getInfraLevel = (type: string) => {
        const infra = farm?.infrastructure.find(i => type in i.infraType);
        return infra ? Number(infra.level) : 0;
    };
    const warehouseLevel = getInfraLevel('Warehouse');
    const maxCapacity = (warehouseLevel + 1) * 10000;

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

    // Track the last seen weather event ID or timestamp to trigger modal only once
    const lastEventRef = useRef<string | null>(null);

    // Weather Event State (Connected to backend)
    const [weatherEvent, setWeatherEvent] = useState<{
        type: WeatherEventType;
        name: string;
        description: string;
        yieldImpact: number;
        infrastructureMitigation?: string;
    } | null>(null);

    // Watch for backend weather changes
    useEffect(() => {
        const backendWeatherArr = farm?.weather;
        if (backendWeatherArr && backendWeatherArr.length > 0) {
            const event = backendWeatherArr[0];
            if (!event) return;

            const eventKey = `${Object.keys(event.weather)[0]}_${event.season}`;

            // If it's a new event, map and show modal
            if (lastEventRef.current !== eventKey) {
                const mapping = mapBackendWeather(event.weather);
                setWeatherEvent({
                    ...mapping,
                    yieldImpact: Number(event.severity) * -0.25,
                });
                lastEventRef.current = eventKey;
            }
        } else {
            lastEventRef.current = null;
        }
    }, [farm?.weather]);

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
                intensity={farm?.weather && farm.weather.length > 0 ? Number(farm.weather[0]!.severity) : 0.5}
            />
            <SeasonalEffects
                season={stats.currentSeason ? Object.keys(stats.currentSeason)[0] as any : null}
            />
            {/* TEMPORARY MOUNT FOR SPRINT VERIFICATION */}
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

            <HiringModal
                isOpen={hiringModalOpen}
                onClose={() => setHiringModalOpen(false)}
                onHire={async (type) => {
                    await hireLabor.mutateAsync(type);
                }}
                isLoading={hireLabor.isPending}
                userCash={stats.cash}
            />

            {procurementModalOpen && (
                <ProcurementModal
                    onClose={() => setProcurementModalOpen(false)}
                    onPurchased={() => setProcurementModalOpen(false)}
                />
            )}

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
                onOpenStats={() => setStatsModalOpen(true)}
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

            <div className={cn(
                "main-layout-wrapper flex-1 w-full flex flex-col md:ml-64 lg:ml-72 transition-all duration-300 bg-slate-950",
                activeTab === 'dashboard' ? "h-screen overflow-hidden" : "min-h-screen pb-20 md:pb-0"
            )}>

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
                <main className={cn(
                    "flex-1 text-slate-100 flex flex-col min-h-0",
                    activeTab === 'dashboard' ? "p-4 md:p-6 overflow-hidden" : "p-4 md:p-8 lg:p-10 pb-20 md:pb-8"
                )}>
                    <div className={cn(
                        "flex flex-col md:flex-row justify-between items-start md:items-center gap-4",
                        activeTab === 'dashboard' ? "mb-4 md:mb-6 flex-shrink-0" : "mb-8"
                    )}>
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

                                {/* Hire Labor Button */}
                                {currentPhase === 'Hiring' && (!farm?.hiredLabor || farm.hiredLabor.length === 0) && (
                                    <Button
                                        onClick={() => setHiringModalOpen(true)}
                                        disabled={!isAuthenticated}
                                        variant="default"
                                        size="sm"
                                        className="gap-2 bg-gradient-to-b from-[#b36a2a] via-[#8c4b16] to-[#592b08] hover:from-[#d68b4d] hover:via-[#b36a2a] hover:to-[#8c4b16] text-amber-100 font-bold border border-[#ffaa66] shadow-[0_0_10px_rgba(179,106,42,0.5)] transition-all hover:shadow-[0_0_20px_rgba(179,106,42,0.8)] flex uppercase tracking-wider text-[10px] rounded-lg h-9"
                                    >
                                        <Users className="h-4 w-4" />
                                        Hire Labor
                                    </Button>
                                )}

                                {/* Buy Supplies Button */}
                                {currentPhase === 'Procurement' && (
                                    <Button
                                        onClick={() => setProcurementModalOpen(true)}
                                        disabled={!isAuthenticated}
                                        variant="default"
                                        size="sm"
                                        className="gap-2 bg-gradient-to-b from-[#00b359] via-[#00803c] to-[#004d20] hover:from-[#33e68a] hover:via-[#00b359] hover:to-[#00803c] text-emerald-100 font-bold border border-[#66ffb3] shadow-[0_0_10px_rgba(0,179,89,0.5)] transition-all hover:shadow-[0_0_20px_rgba(0,179,89,0.8)] flex uppercase tracking-wider text-[10px] rounded-lg h-9"
                                    >
                                        <Coins className="h-4 w-4" />
                                        Procure Supplies
                                    </Button>
                                )}

                                {/* Advance Phase Button */}
                                <Button
                                    onClick={() => advancePhase.mutate()}
                                    disabled={!isAuthenticated || advancePhase.isPending}
                                    variant="default"
                                    size="sm"
                                    className={cn(
                                        "gap-2 flex shadow-md font-bold transition-all duration-300 uppercase tracking-wider text-[10px] rounded-lg h-9 border",
                                        currentPhase === 'Planning'
                                            ? "bg-gradient-to-b from-[#00b359] via-[#00803c] to-[#004d20] hover:from-[#33e68a] hover:via-[#00b359] hover:to-[#00803c] text-emerald-100 border-[#66ffb3] shadow-[0_0_10px_rgba(0,179,89,0.5)]"
                                            : "bg-gradient-to-b from-[#4f46e5] via-[#3730a3] to-[#1e1b4b] hover:from-[#818cf8] hover:via-[#4f46e5] hover:to-[#3730a3] text-indigo-100 border-[#c7d2fe] shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                                    )}
                                >
                                    {advancePhase.isPending ? (
                                        <RefreshCcw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Zap className="h-4 w-4" />
                                    )}
                                    {currentPhase === 'Planning' ? "Start New Year" : "Next Phase"}
                                </Button>



                                {/* Sell Cherries Button */}
                                <Button
                                    onClick={handleSellCherries}
                                    disabled={!isAuthenticated || stats.totalCherries === 0 || sellCherries.isPending}
                                    variant="default"
                                    size="sm"
                                    className="gap-2 bg-gradient-to-b from-[#b82626] via-[#851616] to-[#540909] hover:from-[#e04c4c] hover:via-[#b82626] hover:to-[#851616] text-rose-100 font-bold border border-[#ffa3a3] shadow-[0_0_10px_rgba(184,38,38,0.5)] transition-all hover:shadow-[0_0_20px_rgba(184,38,38,0.8)] flex uppercase tracking-wider text-[10px] rounded-lg h-9"
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


                                <div className="hidden md:flex items-center gap-2">
                                    <VolumeControl />
                                    <LanguageSwitcher />
                                    <LoginButton />
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Main UI Entry Point */}
                    {isError && !isNotFound ? (
                        <div className="min-h-[60vh] flex items-center justify-center p-4">
                            <div className="mechanical-hull p-8 max-w-md w-full text-center border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                                <RefreshCcw className="mx-auto h-12 w-12 text-rose-500 mb-4 opacity-50" />
                                <h2 className="text-2xl text-rose-500 font-bold mb-2 uppercase tracking-tighter">System Malfunction</h2>
                                <p className="text-slate-400 mb-6 font-mono text-xs leading-relaxed">
                                    {farmError?.message || "Atmospheric interference detected in the cloud engines. Re-synchronizing may be required."}
                                </p>
                                <Button
                                    onClick={() => refetch()}
                                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold h-11 w-full gap-2 transition-all active:scale-95"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                    Re-align Dampers
                                </Button>
                                <p className="mt-4 text-[10px] text-slate-600 uppercase tracking-[0.2em]">Error Code: {isError ? 'SIG_FAIL_0X9' : 'OK'}</p>
                            </div>
                        </div>
                    ) : isAuthenticated ? (
                        <React.Suspense fallback={<div className="flex justify-center p-12"><RefreshCcw className="animate-spin h-8 w-8 text-rose-500" /></div>}>
                            {activeTab === 'dashboard' ? (
                                <div className="flex-grow flex flex-col w-full min-h-0 gap-4 overflow-hidden">
                                    {/* Top - Imperial Orchard */}
                                    <div className="flex-[63%] relative z-10 w-full overflow-hidden min-h-0 rounded-2xl border shadow-inner" style={{ borderColor: 'rgba(201, 168, 76, 0.25)' }}>
                                        {isAuthenticated && currentPhase === 'Maintenance' && (
                                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-900/80 backdrop-blur-md border border-blue-500/50 rounded-lg p-3 text-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                                <p className="text-xs text-blue-200 font-medium font-mono uppercase tracking-wider">
                                                    🛠️ Maintenance Phase: Machines are being serviced.
                                                </p>
                                            </div>
                                        )}
                                        {isAuthenticated && currentPhase === 'Planning' && (
                                            <div className="absolute top-4 left-4 z-50">
                                                <PlanningBoard />
                                            </div>
                                        )}
                                        <ImperialOrchard
                                            parcels={parcels}
                                            season={farm?.currentSeason}
                                            hiredLabor={farm?.hiredLabor}
                                            onAction={handleParcelAction as any}
                                            automationConfig={{ hasHarvesters: false }}
                                            totalCherries={stats.totalCherries}
                                            maxCapacity={maxCapacity}
                                            seasonNumber={stats.seasonNumber}
                                        />
                                    </div>

                                    {/* Bottom - Central Engine (HUD) / The Steam Drawer (Mobile) */}
                                    <div
                                        className={cn(
                                            "w-full relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] border bg-slate-950 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] flex flex-col flex-shrink-0 rounded-2xl overflow-hidden",
                                            isDrawerExpanded
                                                ? "h-[75vh] md:flex-[37%] min-h-[175px]"
                                                : "h-[25vh] md:flex-[37%] min-h-[165px] md:h-auto"
                                        )}
                                        style={{ borderColor: 'var(--brass-primary)' }}
                                    >
                                        {/* Mobile Drawer Handle */}
                                        <div
                                            className="md:hidden flex items-center justify-center h-8 cursor-pointer w-full bg-slate-900 absolute top-0 left-0 z-30"
                                            style={{ borderBottom: '1px solid var(--brass-rim, var(--brass-primary))' }}
                                            onClick={() => setIsDrawerExpanded(!isDrawerExpanded)}
                                        >
                                            <div className="w-12 h-1 rounded-full bg-slate-500 opacity-50" />
                                        </div>

                                        <div className={cn("flex-grow min-h-0", "md:pt-0 pt-8")}>
                                            <MainDashboard />
                                        </div>
                                    </div>
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
                            ) : activeTab === 'pool' ? (
                                <AuctionDashboard />
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

            {/* VERSION TAG: Unmistakable verification hook */}
            <div className="fixed top-4 left-4 z-[9999] pointer-events-none">
                <span className="text-[10px] font-mono text-emerald-500/50 bg-black/40 px-2 py-1 rounded-md border border-emerald-500/20 backdrop-blur-sm">
                    v3.8
                </span>
            </div>
        </div>
    );
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
