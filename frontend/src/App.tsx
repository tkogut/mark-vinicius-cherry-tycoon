import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Cherry, Settings, RefreshCcw, Menu, User } from "lucide-react"
import React, { useState, useEffect, useCallback } from "react"
import { LoginButton } from "@/components/LoginButton"
import { useAuth } from "@/context/AuthContext"
import { Sidebar } from "@/components/layout/Sidebar"
import { FarmGrid } from "@/components/farm/FarmGrid"
import { CherryParcel } from "@/declarations/backend.did"

function App() {
    const { backendActor, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [parcels, setParcels] = useState<CherryParcel[]>([]);
    const [stats, setStats] = useState({
        totalCherries: 0,
        activeParcels: 0,
        productionRate: 0,
        level: 1,
        xp: 0,
        nextLevelXp: 1000,
    });

    const fetchFarmState = useCallback(async () => {
        if (!backendActor) return;
        setLoading(true);
        try {
            const response = await backendActor.getPlayerFarm();
            if ('Ok' in response) {
                const farm = response.Ok;
                setParcels(farm.parcels);
                setStats({
                    totalCherries: Number(farm.inventory.cherries),
                    activeParcels: farm.parcels.length,
                    productionRate: 0, // Calculate or fetch separately if needed
                    level: Number(farm.level),
                    xp: Number(farm.experience),
                    nextLevelXp: Number(farm.level) * 1000, // Placeholder calculation
                });
            }
        } catch (error) {
            console.error("Failed to fetch farm state:", error);
        } finally {
            setLoading(false);
        }
    }, [backendActor]);

    const handleParcelAction = async (action: 'plant' | 'water' | 'harvest', parcelId: string) => {
        console.log(`Action: ${action} on parcel ${parcelId}`);
        // TODO: Implement backend calls for actions
        // if (action === 'plant') await backendActor.plantTrees(parcelId, 50n);
        // await fetchFarmState();
    };

    const handleBuyParcel = async () => {
        console.log("Buying new parcel...");
        // TODO: Implement backend call
        // await backendActor.buyParcel("PL-MX", 100n);
        // await fetchFarmState();
    }

    useEffect(() => {
        if (isAuthenticated) {
            fetchFarmState();
        }
    }, [isAuthenticated, fetchFarmState]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex relative">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                level={stats.level}
                xp={stats.xp}
                nextLevelXp={stats.nextLevelXp}
            />

            <div className="flex-1 flex flex-col md:ml-64 lg:ml-72 min-h-screen transition-all duration-300 bg-slate-950">

                {/* Mobile/Tablet Header */}
                <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 md:hidden h-16 flex items-center justify-between px-4">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-6 w-6 text-slate-400" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <Cherry className="h-6 w-6 text-rose-600 animate-pulse" />
                        <span className="font-bold text-lg tracking-tight text-slate-100">Cherry Tycoon</span>
                    </div>
                    <LoginButton />
                </header>

                <main className="flex-1 p-4 md:p-8 lg:p-10 pb-20 md:pb-8 text-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">Farm Overview</h1>
                            <p className="text-slate-400 mt-1">Manage your parcels and production.</p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchFarmState}
                                disabled={loading || !isAuthenticated}
                                className="gap-2 ml-auto text-slate-900 md:text-border md:bg-transparent md:text-slate-100 hover:bg-slate-800"
                            >
                                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <div className="hidden md:block">
                                <LoginButton />
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
                                <div className="text-2xl font-bold text-slate-100">{loading ? "..." : stats.totalCherries.toLocaleString()}</div>
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
                                <div className="text-2xl font-bold text-slate-100">{loading ? "..." : stats.activeParcels}</div>
                                <p className="text-xs text-slate-500 mt-1">9 parcels max capacity</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-rose-500/30 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Production Rate</CardTitle>
                                <Settings className="h-4 w-4 text-rose-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-100">{loading ? "..." : stats.productionRate}/hr</div>
                                <p className="text-xs text-emerald-400 mt-1">+5% <span className="text-slate-500">efficiency</span></p>
                            </CardContent>
                        </Card>
                    </div>

                    {isAuthenticated ? (
                        <FarmGrid
                            parcels={parcels}
                            onAction={handleParcelAction}
                            onBuyParcel={handleBuyParcel}
                            loading={loading}
                        />
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
