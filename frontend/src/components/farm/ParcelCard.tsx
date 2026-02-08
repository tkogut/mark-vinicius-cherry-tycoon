import React from 'react';
import { CherryParcel } from '@/declarations/backend.did';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sprout,
    Droplets,
    Leaf,
    Shovel,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ParcelCardProps {
    parcel: CherryParcel;
    onAction: (action: 'plant' | 'water' | 'harvest', parcelId: string) => void;
}

export const ParcelCard: React.FC<ParcelCardProps> = ({ parcel, onAction }) => {
    const isPlanted = Number(parcel.plantedTrees) > 0;
    // TODO: Add actual growth calculation based on age/season
    const isReadyToHarvest = isPlanted && Number(parcel.treeAge) > 5;

    const getStatusColor = () => {
        if (!isPlanted) return "border-slate-700 bg-slate-900/50";
        if (isReadyToHarvest) return "border-rose-500/50 bg-rose-950/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]";
        return "border-emerald-500/30 bg-emerald-950/10";
    };

    const getSoilIcon = () => {
        if ('Sandy' in parcel.soilType) return "🏖️";
        if ('Clay' in parcel.soilType) return "🧱";
        if ('Waterlogged' in parcel.soilType) return "💧";
        return "🌱";
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
                                            <Badge variant="secondary" className="bg-green-900/50 text-green-400 hover:bg-green-900/70 border-green-800 text-[10px] px-1 h-5">
                                                BIO
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Certified Organic</p></TooltipContent>
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
                        isReadyToHarvest ? "bg-rose-500 text-white animate-pulse" :
                            isPlanted ? "bg-emerald-500/20 text-emerald-400" :
                                "bg-slate-700/50 text-slate-400"
                    )}>
                        {isReadyToHarvest ? "HARVEST" : isPlanted ? "GROWING" : "EMPTY"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4">
                {/* Main Visual/Status */}
                <div className="h-24 flex items-center justify-center rounded-lg bg-black/20 border border-slate-800/50 backdrop-blur-sm">
                    {!isPlanted ? (
                        <div className="flex flex-col items-center text-slate-600">
                            <Sprout className="h-8 w-8 mb-2 opacity-50" />
                            <span className="text-xs">Ready for planting</span>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="text-2xl mb-1">{isReadyToHarvest ? "🍒" : "🌳"}</div>
                            <div className="text-xs font-medium text-slate-400">
                                {Number(parcel.plantedTrees)} Trees
                            </div>
                            <div className="text-[10px] text-slate-500">
                                Age: {Number(parcel.treeAge)} seasons
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                            <TooltipContent>Water Parcel</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className={cn("h-8 px-0", isReadyToHarvest ? "bg-rose-600 hover:bg-rose-700 text-white" : "opacity-50")}
                                    disabled={!isReadyToHarvest}
                                    onClick={() => onAction('harvest', parcel.id)}
                                >
                                    <Leaf className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Harvest</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    );
};
