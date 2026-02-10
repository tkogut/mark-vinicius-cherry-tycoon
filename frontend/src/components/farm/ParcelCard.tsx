import React, { useState } from 'react';
import { CherryParcel } from '@/declarations/backend.did';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sprout,
    Droplets,
    Leaf,
    Shovel,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ParcelDetailsPanel } from './ParcelDetailsPanel';

interface ParcelCardProps {
    parcel: CherryParcel;
    onAction: (action: 'plant' | 'water' | 'fertilize' | 'harvest' | 'organic', parcelId: string) => void;
    currentSeason?: any; // Season type from backend
}

export const ParcelCard: React.FC<ParcelCardProps> = ({ parcel, onAction, currentSeason }) => {
    const [showDetails, setShowDetails] = useState(false);
    const isPlanted = Number(parcel.plantedTrees) > 0;
    // Harvest allowed from year 5 onwards (> 4 seasons)
    const isReadyToHarvest = isPlanted && Number(parcel.treeAge) > 4;

    // Determine specific season
    const isSpring = currentSeason && 'Spring' in currentSeason;
    const isSummer = currentSeason && 'Summer' in currentSeason;
    const isAutumn = currentSeason && 'Autumn' in currentSeason;
    const isWinter = currentSeason && 'Winter' in currentSeason;

    const canHarvest = isReadyToHarvest && isSummer;
    const canFertilize = (isSpring || isAutumn) && isPlanted;
    const isDormant = isAutumn || isWinter;

    const getStatusLabel = () => {
        if (!isPlanted) return "EMPTY";
        if (canHarvest) return "HARVEST";
        if (isDormant) return "DORMANT"; // Or "AFTER SEASON"
        return "GROWING";
    };

    const getStatusColor = () => {
        if (!isPlanted) return "border-slate-700 bg-slate-900/50";
        if (canHarvest) return "border-rose-500/50 bg-rose-950/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]";
        if (isDormant) return "border-blue-500/30 bg-blue-950/10 opacity-75";
        return "border-emerald-500/30 bg-emerald-950/10";
    };

    const getBadgeVariant = () => {
        if (!isPlanted) return "bg-slate-700/50 text-slate-400";
        if (canHarvest) return "bg-rose-500 text-white animate-pulse";
        if (isDormant) return "bg-blue-900/50 text-blue-300 border-blue-800";
        return "bg-emerald-500/20 text-emerald-400";
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
        <Card
            className={cn(
                "cursor-pointer transition-all duration-300 hover:scale-[1.02] border-2 relative overflow-hidden group",
                getStatusColor()
            )}
        >
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />

            <CardHeader className="pb-2 relative z-10">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
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
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">
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
                <div className="h-24 flex items-center justify-center rounded-lg bg-black/20 border border-slate-800/50 backdrop-blur-sm">
                    {(() => {
                        const visual = getTreeVisual();
                        return (
                            <div className={cn("flex flex-col items-center", visual.color)}>
                                {visual.icon}
                                <div className="text-xs font-medium mt-1">{visual.label}</div>
                                {isPlanted && (
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                        {Number(parcel.plantedTrees)} Trees • Age {Number(parcel.treeAge)}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className={cn("h-8 px-0", !isPlanted ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "opacity-50")}
                                    disabled={isPlanted}
                                    onClick={() => onAction('plant', parcel.id)}
                                >
                                    <Shovel className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Plant Trees</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 px-0 hover:bg-blue-900/30 hover:text-blue-400"
                                    onClick={() => onAction('water', parcel.id)}
                                >
                                    <Droplets className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Water Parcel (200 PLN)</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className={cn("h-8 px-0", canHarvest ? "bg-rose-600 hover:bg-rose-700 text-white" : "opacity-50")}
                                    disabled={!canHarvest}
                                    onClick={() => onAction('harvest', parcel.id)}
                                >
                                    <Leaf className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {!isReadyToHarvest ? (
                                    "Trees not ready to harvest"
                                ) : canHarvest ? (
                                    "Harvest Cherries"
                                ) : (
                                    <div className="text-center">
                                        <div>
                                            {isDormant ? "❄️ Season Over (Dormant)" : "🌱 Growing Season"}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            Characters harvest in Summer
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                            Current: {currentSeason && Object.keys(currentSeason)[0]}
                                        </div>
                                    </div>
                                )}
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
                                    className={cn("h-8 px-0", canFertilize ? "hover:bg-amber-900/30 hover:text-amber-400" : "opacity-30")}
                                    disabled={!canFertilize}
                                    onClick={() => onAction('fertilize', parcel.id)}
                                >
                                    <Sprout className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {canFertilize ? (
                                    "Fertilize Soil (Uses 1 Unit)"
                                ) : (
                                    <div className="text-center">
                                        <div>Creation of stronger roots</div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            Effective in Spring & Autumn
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                            Current: {currentSeason && Object.keys(currentSeason)[0]}
                                        </div>
                                    </div>
                                )}
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
                                        "h-8 px-0 transition-all",
                                        parcel.isOrganic ? "opacity-30 grayscale cursor-not-allowed" : "hover:bg-emerald-900/30 hover:text-emerald-400"
                                    )}
                                    disabled={parcel.isOrganic}
                                    onClick={() => onAction('organic', parcel.id)}
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {parcel.isOrganic
                                    ? (parcel.organicCertified ? "Already Certified" : "Already in Conversion")
                                    : "Start Organic Conversion (5000 PLN fee)"}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Details Toggle Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full mt-2 h-7 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
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
                    <div className="mt-3 pt-3 border-t border-slate-800/50">
                        <ParcelDetailsPanel parcel={parcel} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
