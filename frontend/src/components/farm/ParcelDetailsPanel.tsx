import React from 'react';
import { CherryParcel, Infrastructure } from '@/declarations/backend.did';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Droplets, Leaf, TestTube, Gauge, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateYieldBreakdown } from '@/lib/gameLogic';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ParcelDetailsPanelProps {
    parcel: CherryParcel;
    infrastructure: Infrastructure[];
    className?: string;
}

// Helper to get soil type name
const getSoilTypeName = (soilType: any): string => {
    if ('Sandy' in soilType) return 'Sandy';
    if ('Clay' in soilType) return 'Clay';
    if ('SandyClay' in soilType) return 'Sandy Clay';
    if ('Waterlogged' in soilType) return 'Waterlogged';
    return 'Unknown';
};

// Helper to get status color based on value and optimal range
const getStatusColor = (value: number, min: number, max: number): string => {
    if (value >= min && value <= max) return 'text-green-500';
    if (value >= min * 0.8 && value <= max * 1.2) return 'text-yellow-500';
    return 'text-red-500';
};

// Helper to get progress bar color
const getProgressColor = (value: number, min: number = 0.5, max: number = 1.0): string => {
    const percentage = value * 100;
    if (value >= min && value <= max) return 'bg-green-500';
    if (value >= min * 0.8) return 'bg-yellow-500';
    return 'bg-red-500';
};

export const ParcelDetailsPanel: React.FC<ParcelDetailsPanelProps> = ({ parcel, infrastructure, className }) => {
    const yieldBreakdown = calculateYieldBreakdown(parcel, infrastructure);

    const waterPercentage = parcel.waterLevel * 100;
    const fertilityPercentage = parcel.fertility * 100;
    const qualityPercentage = Number(parcel.quality);

    // pH optimal range: 6.0-7.0
    const pHStatus = getStatusColor(parcel.pH, 6.0, 7.0);

    // Tree age optimal range: 7-25 years
    const treeAge = Number(parcel.treeAge);
    const ageStatus = treeAge >= 7 && treeAge <= 25 ? 'text-green-500' :
        treeAge >= 5 && treeAge <= 30 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className={cn("space-y-3 text-xs", className)}>
            {/* Soil Conditions */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 font-semibold">
                    <TestTube className="h-3 w-3" />
                    <span>Soil Conditions</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pl-5">
                    <div>
                        <div className="text-slate-500">pH Level</div>
                        <div className={cn("font-mono font-bold", pHStatus)}>
                            {parcel.pH.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-slate-600">Optimal: 6.0-7.0</div>
                    </div>

                    <div>
                        <div className="text-slate-500">Soil Type</div>
                        <div className="font-medium text-slate-300">
                            {getSoilTypeName(parcel.soilType)}
                        </div>
                    </div>

                    <div>
                        <div className="text-slate-500">Permeability</div>
                        <div className="font-mono text-slate-300">
                            {(parcel.permeability * 100).toFixed(0)}%
                        </div>
                    </div>

                    <div>
                        <div className="text-slate-500">Humidity</div>
                        <div className="font-mono text-slate-300">
                            {(parcel.humidity * 100).toFixed(0)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Resource Levels */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 font-semibold">
                    <Droplets className="h-3 w-3" />
                    <span>Resource Levels</span>
                </div>

                <div className="space-y-2 pl-5">
                    {/* Water Level */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-slate-500">Water</span>
                            <span className={cn("font-mono", getStatusColor(parcel.waterLevel, 0.5, 1.0))}>
                                {waterPercentage.toFixed(0)}%
                            </span>
                        </div>
                        <Progress
                            value={waterPercentage}
                            className="h-1.5 bg-slate-800"
                            indicatorClassName={getProgressColor(parcel.waterLevel, 0.5, 1.0)}
                        />
                    </div>

                    {/* Fertility */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-slate-500">Fertility</span>
                            <span className={cn("font-mono", getStatusColor(parcel.fertility, 0.6, 1.0))}>
                                {fertilityPercentage.toFixed(0)}%
                            </span>
                        </div>
                        <Progress
                            value={fertilityPercentage}
                            className="h-1.5 bg-slate-800"
                            indicatorClassName={getProgressColor(parcel.fertility, 0.6, 1.0)}
                        />
                    </div>
                </div>
            </div>

            {/* Tree Health */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 font-semibold">
                    <Leaf className="h-3 w-3" />
                    <span>Tree Health</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pl-5">
                    <div>
                        <div className="text-slate-500">Age</div>
                        <div className={cn("font-mono font-bold", ageStatus)}>
                            {treeAge} years
                        </div>
                        <div className="text-[10px] text-slate-600">Peak: 7-25</div>
                    </div>

                    <div>
                        <div className="text-slate-500">Quality</div>
                        <div className={cn("font-mono font-bold", getStatusColor(qualityPercentage / 100, 0.6, 1.0))}>
                            {qualityPercentage}/100
                        </div>
                    </div>
                </div>
            </div>

            {/* Production Forecast */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-400 font-semibold">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3" />
                        <span>Production Forecast</span>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-3 w-3 text-slate-500 hover:text-slate-300 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 border-slate-800 text-[10px] w-48">
                                <p>Yield is calculated based on current environmental factors and infrastructure bonuses.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="bg-emerald-950/20 rounded-lg p-3 border border-emerald-900/30">
                    <div className="flex justify-between items-baseline mb-2">
                        <span className="text-slate-400">Exp. Harvest</span>
                        <span className="text-sm font-bold text-emerald-400 font-mono">
                            {Math.round(yieldBreakdown.parcelYield).toLocaleString()} kg
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Soil Mod</span>
                                <span className="text-slate-300">x{yieldBreakdown.soilMod.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">pH Mod</span>
                                <span className="text-slate-300">x{yieldBreakdown.phMod.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Water Mod</span>
                                <span className="text-slate-300">x{yieldBreakdown.waterMod.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Infra Mod</span>
                                <span className="text-slate-300">x{yieldBreakdown.infraMod.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Organic Mod</span>
                                <span className="text-slate-300">x{yieldBreakdown.organicMod.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Age Mod</span>
                                <span className={cn(yieldBreakdown.ageMod < 1 ? "text-amber-500" : "text-slate-300")}>x{yieldBreakdown.ageMod.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Parcel Info */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 font-semibold">
                    <Gauge className="h-3 w-3" />
                    <span>Management</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pl-5">
                    <div>
                        <div className="text-slate-500">Size</div>
                        <div className="font-mono text-slate-300">
                            {parcel.size.toFixed(2)} ha
                        </div>
                    </div>

                    <div>
                        <div className="text-slate-500">Tree Density</div>
                        <div className="font-mono text-slate-300">
                            {Math.round(Number(parcel.plantedTrees) / parcel.size)}/ha
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
