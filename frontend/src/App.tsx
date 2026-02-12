import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Cherry, Settings, RefreshCcw, Menu, User, Trophy, Coins, Zap } from "lucide-react"
import React, { useState } from "react"
import { LoginButton } from "@/components/LoginButton"
import { useAuth } from "@/hooks/useAuth"
import { Sidebar } from "@/components/layout/Sidebar"
import { FarmGrid } from "@/components/farm/FarmGrid"
import { PlantingModal } from "@/components/farm/modals/PlantingModal"
import { SellModal } from '@/components/farm/modals/SellModal';
import { Marketplace } from '@/components/farm/Marketplace';
import { Toaster } from "@/components/ui/toaster"
import { InventoryBar } from "@/components/layout/InventoryBar"
import { useFarm } from "@/hooks/useFarm"
import { SeasonDisplay } from "@/components/season/SeasonDisplay"
import { AdvanceSeasonButton } from "@/components/season/AdvanceSeasonButton"
import { FinancialReportModal } from "@/components/farm/modals/FinancialReportModal"
import { OnboardingModal } from "@/components/farm/modals/OnboardingModal"

function App() {
    const { isAuthenticated, backendActor } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
    const [plantingModalOpen, setPlantingModalOpen] = useState(false);
    const [sellModalOpen, setSellModalOpen] = useState(false);
    const [financialReportOpen, setFinancialReportOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'marketplace' | 'sports'>('dashboard');

    const { farm, isLoading, refetch, plant, water, fertilize, harvest, buyParcel, advanceSeason, sellCherries, startOrganicConversion, upgradeInfrastructure } = useFarm();

    const showOnboarding = isAuthenticated && !!backendActor && !isLoading && !farm;

    // Derived state
    const stats = {
        totalCherries: farm ? Number(farm.inventory.cherries) + Number(farm.inventory.organicCherries) : 0,
        organicCherries: farm ? Number(farm.inventory.organicCherries) : 0,
        regularCherries: farm ? Number(farm.inventory.cherries) : 0,
        activeParcels: farm ? farm.parcels.length : 0,
        productionRate: 0,
        level: farm ? Number(farm.level) : 1,
        xp: farm ? Number(farm.experience) : 0,
        nextLevelXp: farm ? Number(farm.level) * 1000 : 1000,
        cash: farm ? farm.cash : 0n,
        currentSeason: farm ? farm.currentSeason : { Spring: null },
        seasonNumber: farm ? Number(farm.seasonNumber) : 1,
    };

    const parcels = farm ? farm.parcels : [];

    const handleParcelAction = (action: 'plant' | 'water' | 'fertilize' | 'harvest' | 'organic', parcelId: string) => {
        if (action === 'plant') {
            setSelectedParcelId(parcelId);
            setPlantingModalOpen(true);
            return;
        }

        if (action === 'water') {
            water.mutate(parcelId);
        } else if (action === 'harvest') {
            harvest.mutate(parcelId);
        } else if (action === 'fertilize') {
            // Default to NPK fertilizer for quick action
            // TODO: Add fertilizer selection modal
            fertilize.mutate({ parcelId, fertilizerType: "NPK" });
        } else if (action === 'organic') {
            startOrganicConversion.mutate(parcelId);
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

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex relative">
            <Toaster />
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

            <OnboardingModal
                isOpen={showOnboarding}
                onClose={() => { }} // Force onboarding if missing farm
                onSuccess={() => refetch()}
            />

            {/* Mobile Inventory Bar (Fixed Bottom) */}
            <InventoryBar
                cash={stats.cash}
                cherries={stats.regularCherries}
                organicCherries={stats.organicCherries}
                className="md:hidden"
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
                    totalRevenue: farm.statistics.totalRevenue,
                    totalCosts: farm.statistics.totalCosts,
                    totalHarvested: farm.statistics.totalHarvested,
                    bestYearlyProfit: farm.statistics.bestYearlyProfit,
                } : undefined}
            />

            <div className="flex-1 flex flex-col md:ml-64 lg:ml-72 min-h-screen transition-all duration-300 bg-slate-950 pb-20 md:pb-0">

                {/* Mobile/Tablet Header */}
                <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 md:hidden h-16 flex items-center justify-between px-4">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-6 w-6 text-slate-400" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <Cherry className="h-6 w-6 text-rose-600 animate-pulse" />
                        <div className="flex flex-col">
                            <span className="font-bold text-sm leading-tight text-slate-100">Mark Vinicius</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Cherry Tycoon</span>
                        </div>
                    </div>
                    <LoginButton />
                </header>

                <main className="flex-1 p-4 md:p-8 lg:p-10 pb-20 md:pb-8 text-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">Farm Overview</h1>
                            <p className="text-slate-400 mt-1">Manage your parcels and production.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            {/* Inventory Bar (Stats) */}
                            <InventoryBar
                                cash={stats.cash}
                                cherries={stats.regularCherries}
                                organicCherries={stats.organicCherries}
                                className="flex md:flex shadow-none md:shadow-none bg-transparent p-0 static border-none backdrop-blur-0"
                            />

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Season Display */}
                                <SeasonDisplay
                                    currentSeason={stats.currentSeason}
                                    seasonNumber={stats.seasonNumber}
                                    className="flex"
                                />

                                {/* Advance Season Button */}
                                <AdvanceSeasonButton
                                    onAdvance={async () => { await advanceSeason.mutateAsync(); }}
                                    isLoading={advanceSeason.isPending}
                                    disabled={!isAuthenticated}
                                    className="flex"
                                />

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

                                <div className="hidden md:block">
                                    <LoginButton />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                        <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-rose-500/30 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Total Cherries</CardTitle>
                                <Cherry className="h-4 w-4 text-rose-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-100">{isLoading ? "..." : stats.totalCherries.toLocaleString()}</div>
                                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                                    +20.1% <span className="text-slate-500">from last hour</span>
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-rose-500/30 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Active Parcels</CardTitle>
                                <LayoutDashboard className="h-4 w-4 text-rose-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-100">{isLoading ? "..." : stats.activeParcels}</div>
                                <p className="text-xs text-slate-500 mt-1">9 parcels max capacity</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-rose-500/30 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Production Rate</CardTitle>
                                <Settings className="h-4 w-4 text-rose-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-100">{isLoading ? "..." : stats.productionRate}/hr</div>
                                <p className="text-xs text-emerald-400 mt-1">+5% <span className="text-slate-500">efficiency</span></p>
                            </CardContent>
                        </Card>
                    </div>

                    {isAuthenticated ? (
                        activeTab === 'dashboard' ? (
                            <FarmGrid
                                parcels={parcels}
                                onAction={handleParcelAction}
                                onBuyParcel={handleBuyParcel}
                                loading={isLoading}
                                currentSeason={stats.currentSeason}
                            />
                        ) : activeTab === 'marketplace' ? (
                            <Marketplace
                                cash={stats.cash}
                                ownedInfrastructure={farm?.infrastructure || []}
                                onPurchase={(id) => upgradeInfrastructure.mutate(id)}
                                isLoading={upgradeInfrastructure.isPending}
                            />
                        ) : (
                            <div className="h-64 flex items-center justify-center border border-dashed border-slate-700 rounded-xl bg-slate-800/20">
                                <div className="text-center">
                                    <Trophy className="h-10 w-10 text-slate-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">Sports Center Coming Soon</h3>
                                    <p className="text-sm text-slate-500">Regional football leagues and sponsorships are in development.</p>
                                </div>
                            </div>
                        )
                    ) : (
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
        </div>
    )
}

export default App
