import React from 'react';
import { LayoutDashboard, ShoppingBag, Trophy, User, Cherry, X, Menu, LogOut, Coins, Zap, PieChart } from 'lucide-react';
import { RunningCosts } from '../farm/RunningCosts';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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

    const isDesktop = useMediaQuery("(min-width: 768px)");

    return (
        <>
            {/* Desktop Sidebar (Fixed Left) */}
            {isDesktop && (
                <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 lg:w-72 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 text-slate-100 transition-all duration-300 z-40 desktop-sidebar">
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

                        <RunningCosts
                            ownedInfrastructure={ownedInfrastructure}
                            parcels={parcels}
                            onOpenFinancialReport={onOpenFinancialReport}
                        />
                    </div>

                    <div className="p-4 border-t border-slate-800/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className="w-full text-slate-400 hover:text-red-400 hover:bg-red-950/20 gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </aside>
            )}

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2 z-50 safe-area-bottom pb-safe">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            if (item.id === 'dashboard' || item.id === 'marketplace' || item.id === 'sports') {
                                onTabChange(item.id as any);
                            }
                        }}
                        className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px]",
                            activeTab === item.id ? "text-rose-400" : "text-slate-500 hover:text-slate-300"
                        )}
                        style={{ touchAction: 'manipulation' }}
                    >
                        <item.icon className="h-6 w-6 mb-1" />
                        <span className="text-[10px] font-medium">{item.label === 'Dashboard' ? 'Farm' : item.label === 'Marketplace' ? 'Market' : item.label}</span>
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
                    <div className="absolute inset-y-0 left-0 w-3/4 max-w-xs bg-slate-900 border-r border-slate-800 p-6 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <Cherry className="h-6 w-6 text-rose-500" />
                                <span className="font-bold text-lg text-slate-100">Menu</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <nav className="space-y-4 flex-1 overflow-y-auto pr-2">
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
                                        "w-full justify-start gap-3 text-lg font-medium h-12",
                                        activeTab === item.id ? "text-rose-400 bg-rose-500/10" : "text-slate-400"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </Button>
                            ))}

                            <div className="mt-8 pt-8 border-t border-slate-800">
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-4">
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

                                <RunningCosts
                                    ownedInfrastructure={ownedInfrastructure}
                                    parcels={parcels}
                                    onOpenFinancialReport={onOpenFinancialReport}
                                />
                            </div>
                        </nav>

                        <div className="pt-6 border-t border-slate-800 mt-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    logout();
                                    onClose();
                                }}
                                className="w-full text-slate-400 hover:text-red-400 hover:bg-red-950/20 gap-3 justify-start h-12 text-lg"
                            >
                                <LogOut className="h-5 w-5" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
