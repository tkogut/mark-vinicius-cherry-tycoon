import React from 'react';
import { LayoutDashboard, ShoppingBag, Trophy, User, Cherry, X, Menu, LogOut, Coins, Zap, PieChart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    level: number;
    xp: number;
    nextLevelXp: number;
    activeTab: string;
    onTabChange: (tab: 'dashboard' | 'marketplace' | 'sports') => void;
    ownedInfrastructure: any[];
    parcels: any[];
    onOpenFinancialReport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, level, xp, nextLevelXp, activeTab, onTabChange, ownedInfrastructure, parcels, onOpenFinancialReport }) => {
    const { logout } = useAuth();

    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: "Dashboard" },
        { id: 'marketplace', icon: ShoppingBag, label: "Marketplace" },
        { id: 'sports', icon: Trophy, label: "Sports" },
        { id: 'profile', icon: User, label: "Profile" },
    ];

    // Width calculation for XP bar
    const xpPercentage = Math.min(100, Math.max(0, (xp / nextLevelXp) * 100));

    return (
        <>
            {/* Desktop Sidebar (Fixed Left) */}
            <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 lg:w-72 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 text-slate-100 transition-all duration-300 z-40">
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
                    <Cherry className="h-6 w-6 text-rose-500 animate-pulse mr-2" />
                    <div className="flex flex-col">
                        <span className="font-bold text-lg leading-tight tracking-tight bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">
                            Mark Vinicius
                        </span>
                        <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">
                            Cherry Tycoon
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <Button
                            key={item.id}
                            variant="ghost"
                            onClick={() => {
                                if (item.id === 'dashboard' || item.id === 'marketplace' || item.id === 'sports') {
                                    onTabChange(item.id as any);
                                }
                            }}
                            className={cn(
                                "w-full justify-start gap-3 h-10 font-medium transition-all duration-200",
                                activeTab === item.id
                                    ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300"
                                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Button>
                    ))}
                </nav>

                {/* User Level Card (Bottom) */}
                <div className="p-4 mt-auto border-t border-slate-800/50">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                                Farmer Tier
                            </span>
                            <span className="text-xs text-slate-400 font-mono">Lvl {level}</span>
                        </div>

                        <div className="font-bold text-sm text-slate-100 mb-3">
                            {level >= 5 ? "Cherry Expert" : "Novice Grower"}
                        </div>

                        {/* XP Progress Bar */}
                        <div className="relative h-2 w-full bg-slate-900/50 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-1000 ease-out"
                                style={{ width: `${xpPercentage}%` }}
                            />
                        </div>

                        <div className="flex justify-between mt-1.5">
                            <span className="text-[10px] text-slate-500">Current</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                                {nextLevelXp - xp} XP to next
                            </span>
                        </div>
                    </div>

                    {/* Seasonal Running Costs Summary */}
                    <div className="mt-4 bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Est. Next Season Cost
                            </span>
                            <div className="p-1 bg-amber-500/10 rounded">
                                <Coins className="h-3 w-3 text-amber-500" />
                            </div>
                        </div>

                        {(() => {
                            // Fixed Costs (Maintenance)
                            const fixedCosts = ownedInfrastructure.reduce((acc, infra) => acc + Number(infra.maintenanceCost), 0);

                            // Variable Costs Estimate (matching backend game_logic.mo)
                            let totalArea = 0;
                            let fertilizerCost = 0;
                            let protectionCost = 0;
                            let fuelCost = 0;
                            let laborCostBase = 0;

                            // Calculate labor efficiency from infrastructure
                            let laborEfficiency = 1.0;
                            ownedInfrastructure.forEach(infra => {
                                const type = Object.keys(infra.infraType)[0] || infra.infraType; // Handle variant structure
                                const level = Number(infra.level);

                                if (type === 'Tractor') laborEfficiency -= 0.15 * level;
                                else if (type === 'Shaker') laborEfficiency -= 0.30 * level;
                                else if (type === 'SocialFacilities') laborEfficiency -= 0.05 * level;
                            });
                            // Cap efficiency at 0.2 (min 20% labor cost remains)
                            if (laborEfficiency < 0.2) laborEfficiency = 0.2;

                            parcels.forEach(p => {
                                const size = Number(p.size);
                                totalArea += size;
                                const isOrganic = p.isOrganic;

                                // Fertilizer
                                fertilizerCost += isOrganic ? (size * 3000) : (size * 1500);

                                // Plant Protection
                                protectionCost += isOrganic ? (size * 2000) : (size * 1000);

                                // Fuel
                                fuelCost += size * 500;

                                // Labor Base (8000 * region multiplier)
                                const laborMultiplier = p.region?.laborCostMultiplier ? Number(p.region.laborCostMultiplier) : 1.0;
                                laborCostBase += size * 8000 * laborMultiplier;
                            });

                            const totalLaborCost = laborCostBase * laborEfficiency;

                            // Organic certification fee (GDD Section 5)
                            const hasOrganic = parcels.some(p => p.isOrganic);
                            let certFee = 0;
                            if (hasOrganic) {
                                if (totalArea < 5.0) certFee = 1500;
                                else if (totalArea < 20.0) certFee = 1800;
                                else if (totalArea < 50.0) certFee = 2090;
                                else certFee = 2500;
                            }

                            const totalEst = fixedCosts + fertilizerCost + protectionCost + fuelCost + totalLaborCost + certFee;
                            const operationalCosts = fertilizerCost + protectionCost + fuelCost + totalLaborCost + certFee;

                            return (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-xl font-mono font-bold text-amber-400">
                                            ${Math.round(totalEst).toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-slate-500">PLN</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-slate-500">Maintenance</span>
                                            <span className="text-slate-300 font-mono">${Math.round(fixedCosts).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-slate-500">Operational</span>
                                            <span className="text-slate-300 font-mono">${Math.round(operationalCosts).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center gap-1.5 opacity-60">
                                        <Zap className="h-2.5 w-2.5 text-amber-500/70" />
                                        <span className="text-[9px] text-slate-500 leading-tight">
                                            Charged automatically at season end
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onOpenFinancialReport}
                                        className="w-full mt-3 bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-400 gap-2 h-8 text-[11px] font-bold"
                                    >
                                        <PieChart className="h-3 w-3" />
                                        Financial Report
                                    </Button>
                                </div>
                            );
                        })()}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={logout}
                        className="w-full mt-4 text-slate-400 hover:text-red-400 hover:bg-red-950/20 gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2 z-50 safe-area-bottom">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            if (item.id === 'dashboard' || item.id === 'marketplace' || item.id === 'sports') {
                                onTabChange(item.id as any);
                            }
                        }}
                        className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                            activeTab === item.id ? "text-rose-400" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <item.icon className="h-5 w-5 mb-1" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Tablet Slide-over Menu (Overlay) */}
            {isOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={onClose}
                    />

                    {/* Slide-over Panel */}
                    <div className="absolute inset-y-0 left-0 w-3/4 max-w-xs bg-slate-900 border-r border-slate-800 p-6 shadow-2xl animate-in slide-in-from-left duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <Cherry className="h-6 w-6 text-rose-500" />
                                <span className="font-bold text-lg text-slate-100">Menu</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <nav className="space-y-4">
                            {navItems.map((item) => (
                                <Button
                                    key={item.id}
                                    variant="ghost"
                                    onClick={() => {
                                        if (item.id === 'dashboard' || item.id === 'marketplace' || item.id === 'sports') {
                                            onTabChange(item.id as any);
                                            onClose();
                                        }
                                    }}
                                    className={cn(
                                        "w-full justify-start gap-3 text-lg font-medium",
                                        activeTab === item.id ? "text-rose-400 bg-rose-500/10" : "text-slate-400"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </Button>
                            ))}
                        </nav>

                        {/* Mobile Level Card */}
                        <div className="mt-8 pt-8 border-t border-slate-800">
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-100 font-medium">Level {level}</span>
                                    <span className="text-xs text-rose-400">{Math.round(xpPercentage)}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-900/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-rose-500"
                                        style={{ width: `${xpPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
