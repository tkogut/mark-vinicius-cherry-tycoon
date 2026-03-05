import React, { useState } from 'react';
import { CherryParcel, Infrastructure } from '@/declarations/backend.did';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sprout,
    Droplets,
    Leaf,
    Shovel,
    Scissors,
    ChevronDown,
    ChevronUp,
    ShieldCheck,
    Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ParcelDetailsPanel } from './ParcelDetailsPanel';
import { calculateYieldBreakdown } from '@/lib/gameLogic';
import { isActionAllowed, SeasonPhase, PHASE_LABELS } from '@/config/phaseConstants';


interface ParcelCardProps {
    parcel: CherryParcel;
    onAction: (action: 'plant' | 'water' | 'fertilize' | 'harvest' | 'organic' | 'prune', parcelId: string) => void;
    currentSeason?: any; // Season type from backend
    infrastructure: Infrastructure[];
    currentPhase?: SeasonPhase | string;
}

export const ParcelCard: React.FC<ParcelCardProps> = ({ parcel, onAction, currentSeason, infrastructure, currentPhase }) => {
    const [showDetails, setShowDetails] = useState(false);

    // Normalize currentPhase
    const phaseKey = (typeof currentPhase === 'string'
        ? currentPhase
        : (currentPhase ? Object.keys(currentPhase)[0] : 'Planning')) as SeasonPhase;

    const isPlanted = Number(parcel.plantedTrees) > 0;
    // Harvest allowed from year 5 onwards (> 4 seasons)
    const isReadyToHarvest = isPlanted && Number(parcel.treeAge) > 4;

    const yieldBreakdown = calculateYieldBreakdown(parcel, infrastructure);

    // Determine specific season
    const isSummer = currentSeason && 'Summer' in currentSeason;
    const isAutumn = currentSeason && 'Autumn' in currentSeason;
    const isWinter = currentSeason && 'Winter' in currentSeason;

    // Contextual Actions based on Phase Gating
    const canPlant = !isPlanted && isActionAllowed(phaseKey, 'plant');
    const canHarvest = isReadyToHarvest && isActionAllowed(phaseKey, 'harvest');
    const canCutAndPrune = isPlanted && isActionAllowed(phaseKey, 'prune');
    const canWater = isPlanted && isActionAllowed(phaseKey, 'water');
    const canConvertOrganic = !parcel.isOrganic && isActionAllowed(phaseKey, 'organic');
    const canFertilize = isPlanted && isActionAllowed(phaseKey, 'fertilize');

    const isDormant = isAutumn || isWinter;

    const getStatusLabel = () => {
        if (!isPlanted) return "EMPTY";
        if (canHarvest) return "HARVEST";
        if (isDormant) return "DORMANT";
        return "GROWING";
    };

    const getStatusColor = () => {
        if (!isPlanted) return "border-brass/20";
        if (canHarvest) return "border-ruby/50 shadow-[0_0_15px_rgba(155,17,30,0.15)]";
        if (isDormant) return "border-copper/30 opacity-75";
        return "border-brass/30";
    };

    const getBadgeVariant = () => {
        if (!isPlanted) return "bg-hull text-brass/60 border-brass/20";
        if (canHarvest) return "bg-ruby text-white animate-pulse";
        if (isDormant) return "bg-copper-dark/50 text-copper-light border-copper/30";
        return "bg-brass/10 text-brass";
    };

    const getSoilIcon = () => {
        if ('Sandy' in parcel.soilType) return "🏖️";
        if ('Clay' in parcel.soilType) return "🧱";
        if ('Waterlogged' in parcel.soilType) return "💧";
        return "🌱";
    };

    const getTreeVisual = () => {
        if (!isPlanted) return { icon: <Sprout className="h-8 w-8 mb-2 opacity-50" />, label: "Ready for planting", color: "text-slate-600" };

        if (isWinter) return { icon: <div className="text-4xl">❄️</div>, label: "Dormant", color: "text-blue-300" };
        if (isAutumn) return { icon: <div className="text-4xl">🍂</div>, label: "After Season", color: "text-amber-500" };
        if (isSummer) return {
            icon: <div className="text-4xl">{isReadyToHarvest ? "🍒" : "🌳"}</div>,
            label: isReadyToHarvest ? "Ready to Harvest" : "Maturing",
            color: isReadyToHarvest ? "text-rose-500" : "text-emerald-500"
        };
        // Spring
        return { icon: <div className="text-4xl">🌳</div>, label: "Growing", color: "text-emerald-400" };
    };

    return (
        <div
            className={cn(
                "mechanical-hull cursor-pointer transition-all duration-300 hover:scale-[1.02] border-2 group p-0",
                getStatusColor()
            )}
        >
            {/* Background Grid Pattern — Brass-tinted */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#d4af3708_1px,transparent_1px),linear-gradient(to_bottom,#d4af3708_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />

            <CardHeader className="pb-2 relative z-10">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <CardTitle className="text-sm font-medium text-brass-light flex items-center gap-2">
                            <span>Parcel {parcel.id.slice(0, 6)}...</span>
                            {parcel.isOrganic && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge variant="secondary" className={cn(
                                                "text-[10px] px-1.5 h-5 border shadow-sm transition-all",
                                                parcel.organicCertified
                                                    ? "bg-emerald-900/40 text-emerald-400 border-emerald-800/50"
                                                    : "bg-amber-900/20 text-amber-500 border-amber-800/30 animate-pulse"
                                            )}>
                                                {parcel.organicCertified ? "BIO" : "BIO-CONV"}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">
                                                {parcel.organicCertified
                                                    ? "Certified Organic (1.4x Premium)"
                                                    : "Organic Conversion in Progress (Year 1/2)"}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </CardTitle>
                        <span className="text-[10px] text-copper/70 font-mono mt-0.5">
                            {getSoilIcon()} {parcel.region.province ? Object.keys(parcel.region.province)[0] : 'Unknown'}
                        </span>
                    </div>

                    <Badge variant="outline" className={cn(
                        "text-[10px] border-none",
                        getBadgeVariant()
                    )}>
                        {getStatusLabel()}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4">
                {/* Main Visual/Status */}
                <div className="h-24 flex items-center justify-center rounded-lg bg-black/30 border border-brass/10 backdrop-blur-sm">
                    {(() => {
                        const visual = getTreeVisual();
                        return (
                            <div className={cn("flex flex-col items-center", visual.color)}>
                                {visual.icon}
                                <div className="text-xs font-medium mt-1">{visual.label}</div>
                                {isPlanted && (
                                    <div className="flex flex-col items-center gap-0.5 mt-0.5">
                                        <div className="text-[10px] text-copper/60">
                                            {Number(parcel.plantedTrees)} Trees • Age {Number(parcel.treeAge)}
                                        </div>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <div className="text-[10px] font-bold text-brass flex items-center gap-1">
                                                        <Gauge className="h-2.5 w-2.5" />
                                                        Yield: {Math.round(yieldBreakdown.parcelYield).toLocaleString()} kg
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-hull border-brass/30 text-xs p-3 shadow-xl">
                                                    <div className="space-y-1.5">
                                                        <p className="font-bold border-b border-slate-800 pb-1 mb-1 text-slate-200">Current Yield Potential</p>
                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                            <span className="text-slate-400">Base Yield:</span> <span className="text-slate-300">25.0 t/ha</span>
                                                            <span className="text-slate-400">Soil Type:</span> <span className="text-slate-300">x{yieldBreakdown.soilMod.toFixed(2)}</span>
                                                            <span className="text-slate-400">pH Level:</span> <span className="text-slate-300">x{yieldBreakdown.phMod.toFixed(2)}</span>
                                                            <span className="text-slate-400">Fertility:</span> <span className="text-slate-300">x{yieldBreakdown.fertilityMod.toFixed(2)}</span>
                                                            <span className="text-slate-400">Infrastructure:</span> <span className="text-slate-300">x{yieldBreakdown.infraMod.toFixed(2)}</span>
                                                            <span className="text-slate-400">Water Level:</span> <span className="text-slate-300">x{yieldBreakdown.waterMod.toFixed(2)}</span>
                                                            <span className="text-slate-400">Organic:</span> <span className="text-slate-300">x{yieldBreakdown.organicMod.toFixed(2)}</span>
                                                            <span className="text-slate-400">Tree Age:</span> <span className={yieldBreakdown.ageMod < 1 ? "text-amber-400" : "text-emerald-400"}>x{yieldBreakdown.ageMod.toFixed(2)}</span>
                                                        </div>
                                                        <div className="pt-1.5 mt-1 border-t border-slate-800 font-mono text-emerald-400 text-center">
                                                            {(yieldBreakdown.totalYield / 1000).toFixed(2)} t / hectare
                                                        </div>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className={cn("h-8 px-0 w-8", canPlant ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "opacity-30")}
                                    disabled={!canPlant}
                                    onClick={() => onAction('plant', parcel.id)}
                                >
                                    <Shovel className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {canPlant ? "Plant Trees" : isPlanted ? "Parcel already planted" : `Requires ${PHASE_LABELS['Investment']} phase`}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className={cn("h-8 px-0 w-8", canWater ? "hover:bg-blue-900/30 text-blue-400" : "opacity-30")}
                                    disabled={!canWater}
                                    onClick={() => onAction('water', parcel.id)}
                                >
                                    <Droplets className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{canWater ? "Water Parcel (200 PLN)" : isPlanted ? "Watering only in Supply/Invest/Growth phase" : "Plant trees first"}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className={cn("h-8 px-0 w-8", canHarvest ? "bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_10px_rgba(225,29,72,0.3)]" : "opacity-30")}
                                    disabled={!canHarvest}
                                    onClick={() => onAction('harvest', parcel.id)}
                                >
                                    <Leaf className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {!isPlanted ? "Plant trees first" :
                                    !isReadyToHarvest ? "Trees too young to harvest (need age 5+)" :
                                        canHarvest ? "Harvest Cherries" :
                                            `Requires ${PHASE_LABELS['Harvest']} phase (Summer)`}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Pruning Button */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className={cn("h-8 px-0 w-8", canCutAndPrune ? "hover:bg-amber-700/30 text-amber-500 hover:text-amber-400" : "opacity-30")}
                                    disabled={!canCutAndPrune}
                                    onClick={() => onAction('prune', parcel.id)}
                                >
                                    <Scissors className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {!isPlanted ? "Plant trees first" :
                                    canCutAndPrune ? "Prune Trees (+Quality)" :
                                        `Requires ${PHASE_LABELS['CutAndPrune']} phase`}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Fertilize Button */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className={cn("h-8 px-0 w-8", canFertilize ? "hover:bg-amber-900/30 hover:text-amber-400" : "opacity-30")}
                                    disabled={!canFertilize}
                                    onClick={() => onAction('fertilize', parcel.id)}
                                >
                                    <Sprout className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {!isPlanted ? "Plant trees first" :
                                    canFertilize ? "Fertilize Soil (Uses 1 Unit)" :
                                        `Requires Growth or Pruning phase`}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Organic Conversion Button */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className={cn(
                                        "h-8 px-0 w-8 transition-all",
                                        parcel.isOrganic ? "bg-emerald-900/20 text-emerald-500 border border-emerald-800/50" :
                                            canConvertOrganic ? "hover:bg-emerald-900/30 text-emerald-400" : "opacity-30"
                                    )}
                                    disabled={parcel.isOrganic || !canConvertOrganic}
                                    onClick={() => onAction('organic', parcel.id)}
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {parcel.isOrganic
                                    ? (parcel.organicCertified ? "Certified Organic" : "Organic Conversion in Progress")
                                    : canConvertOrganic ? "Start Organic Conversion (5000 PLN fee)" : `Requires Invest or Planning phase`}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>


                {/* Details Toggle Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full mt-2 h-7 text-xs text-brass/50 hover:text-brass hover:bg-brass/5"
                >
                    {showDetails ? (
                        <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Hide Details
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            Show Details
                        </>
                    )}
                </Button>

                {/* Expandable Details Panel */}
                {showDetails && (
                    <div className="mt-3 pt-3 border-t border-brass/15">
                        <ParcelDetailsPanel parcel={parcel} infrastructure={infrastructure} />
                    </div>
                )}
            </CardContent>
        </div>
    );
};
