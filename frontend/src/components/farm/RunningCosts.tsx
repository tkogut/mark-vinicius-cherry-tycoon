import React from 'react';
import { Coins, Zap, PieChart } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface RunningCostsProps {
    ownedInfrastructure: any[];
    parcels: any[];
    onOpenFinancialReport: () => void;
}

export const RunningCosts: React.FC<RunningCostsProps> = ({ ownedInfrastructure, parcels, onOpenFinancialReport }) => {
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
        <div className="mt-4 bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Est. Next Season Cost
                </span>
                <div className="p-1 bg-amber-500/10 rounded">
                    <Coins className="h-3 w-3 text-amber-500" />
                </div>
            </div>

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
        </div>
    );
};
