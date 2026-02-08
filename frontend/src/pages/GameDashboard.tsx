import { Link } from '@tanstack/react-router';
import { TrendingUp, Sprout, DollarSign, Calendar } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';

export default function GameDashboard() {
    const { usePlayerFarm, useCashBalance } = useBackend();
    const { data: farm, isLoading, error } = usePlayerFarm();
    const { data: cash } = useCashBalance();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🍒</div>
                    <h1 className="text-2xl font-bold text-emerald-900 mb-2">Loading Farm...</h1>
                    <p className="text-emerald-600">Fetching your data</p>
                </div>
            </div>
        );
    }

    if (error || !farm) {
        return (
            <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-red-900 mb-2">Error Loading Farm</h1>
                    <p className="text-red-700 mb-4">{error?.message || 'Failed to load farm data'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const totalTrees = farm.parcels.reduce((sum, p) => sum + p.plantedTrees, 0);
    const seasonNames = ['Spring', 'Summer', 'Autumn', 'Winter'];
    const currentSeason = seasonNames[(farm.seasonNumber - 1) % 4];

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-emerald-900">
                                🍒 Cherry Tycoon
                            </h1>
                            <p className="text-emerald-600 mt-1">Welcome back, {farm.playerName}!</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-emerald-600">Level {farm.level}</div>
                            <div className="text-xs text-emerald-500">{farm.experience} XP</div>
                        </div>
                    </div>
                </div>

                {/* Season & Cash */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Season */}
                    <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl shadow-lg p-6 text-white">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-8 h-8" />
                            <div>
                                <div className="text-sm opacity-90">Current Season</div>
                                <div className="text-2xl font-bold">{currentSeason}</div>
                                <div className="text-xs opacity-75">Season #{farm.seasonNumber}</div>
                            </div>
                        </div>
                    </div>

                    {/* Cash Balance */}
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
                        <div className="flex items-center gap-3">
                            <DollarSign className="w-8 h-8" />
                            <div>
                                <div className="text-sm opacity-90">Cash Balance</div>
                                <div className="text-2xl font-bold">{(cash || farm.cash).toLocaleString()} PLN</div>
                                <div className="text-xs opacity-75">Available funds</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
                    <h2 className="text-xl font-bold text-emerald-900 mb-4">Farm Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Total Parcels */}
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-500 rounded-lg p-2">
                                    <Sprout className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-emerald-900">{farm.parcels.length}</div>
                                    <div className="text-sm text-emerald-600">Parcels</div>
                                </div>
                            </div>
                        </div>

                        {/* Total Trees */}
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-500 rounded-lg p-2">
                                    <span className="text-2xl">🌳</span>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-900">{totalTrees}</div>
                                    <div className="text-sm text-green-600">Trees</div>
                                </div>
                            </div>
                        </div>

                        {/* Lifetime Harvest */}
                        <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-rose-500 rounded-lg p-2">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-rose-900">
                                        {farm.statistics.totalHarvested.toLocaleString()} kg
                                    </div>
                                    <div className="text-sm text-rose-600">Lifetime Harvest</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Farm View */}
                    <Link to="/farm">
                        <button className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-2xl shadow-lg p-8 transition-all duration-200 transform hover:scale-105">
                            <div className="text-5xl mb-3">🚜</div>
                            <div className="text-2xl font-bold mb-2">My Farm</div>
                            <div className="text-sm opacity-90">Manage parcels, harvest cherries</div>
                        </button>
                    </Link>

                    {/* Market View */}
                    <Link to="/market">
                        <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl shadow-lg p-8 transition-all duration-200 transform hover:scale-105">
                            <div className="text-5xl mb-3">🏪</div>
                            <div className="text-2xl font-bold mb-2">Market</div>
                            <div className="text-sm opacity-90">Sell cherries, buy parcels</div>
                        </button>
                    </Link>

                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
                    <h2 className="text-xl font-bold text-emerald-900 mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <button className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-6 py-3 rounded-xl font-semibold transition-colors">
                            💧 Water All Parcels
                        </button>
                        <button className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-6 py-3 rounded-xl font-semibold transition-colors">
                            ⏭️ Advance Season
                        </button>
                        <button className="bg-purple-100 hover:bg-purple-200 text-purple-900 px-6 py-3 rounded-xl font-semibold transition-colors">
                            📊 View Statistics
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
