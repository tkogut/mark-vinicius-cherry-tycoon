import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Cherry, User, Settings, RefreshCcw } from "lucide-react"
import React, { useState, useEffect, useCallback } from "react"
import { LoginButton } from "@/components/LoginButton"
import { useAuth } from "@/context/AuthContext"

function App() {
    const { backendActor, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
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

    useEffect(() => {
        if (isAuthenticated) {
            fetchFarmState();
        }
    }, [isAuthenticated, fetchFarmState]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Cherry className="h-8 w-8 text-red-600 animate-pulse" />
                        <span className="text-xl font-bold tracking-tight">Cherry Tycoon</span>
                    </div>
                    <nav className="flex items-center gap-6">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </Button>
                        <LoginButton />
                    </nav>
                </div>
            </header>

            <main className="container py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold tracking-tight">Farm Overview</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchFarmState}
                        disabled={loading || !isAuthenticated}
                        className="gap-2"
                    >
                        <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cherries</CardTitle>
                            <Cherry className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats.totalCherries.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last hour</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Parcels</CardTitle>
                            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats.activeParcels}</div>
                            <p className="text-xs text-muted-foreground">3 parcels available</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Production Rate</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats.productionRate}/hr</div>
                            <p className="text-xs text-muted-foreground">+5% since upgrade</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white border-none shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Level {stats.level} Farmer</CardTitle>
                            <User className="h-4 w-4 text-red-100" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">
                                {stats.level >= 5 ? "Expert" : "Beginner"}
                            </div>
                            <div className="mt-2 h-1.5 w-full bg-red-200/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all duration-500"
                                    style={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs mt-1 text-red-50/80">
                                {stats.nextLevelXp - stats.xp} XP to next level
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <section className="mt-12">
                    {!isAuthenticated ? (
                        <div className="h-64 rounded-xl border border-dashed flex flex-col items-center justify-center bg-white/50 space-y-4">
                            <User className="h-12 w-12 text-slate-300" />
                            <div className="text-center">
                                <p className="text-slate-600 font-medium">Auth Required</p>
                                <p className="text-sm text-slate-400">Please login with Internet Identity to see your farm.</p>
                            </div>
                            <LoginButton />
                        </div>
                    ) : (
                        <div className="h-96 rounded-xl border border-dashed flex flex-col items-center justify-center bg-white/50 space-y-4">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                <Cherry className="h-6 w-6 text-slate-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-slate-600 font-medium">No parcels planted yet</p>
                                <p className="text-sm text-slate-400">Select a parcel from the map to start your tycoon!</p>
                            </div>
                            <Button size="sm">Explore Map</Button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}

export default App
