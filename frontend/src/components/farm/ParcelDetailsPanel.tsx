import React from 'react';
import { CherryParcel } from '@/declarations/backend.did';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Droplets, Leaf, TestTube, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParcelDetailsPanelProps {
    parcel: CherryParcel;
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

export const ParcelDetailsPanel: React.FC<ParcelDetailsPanelProps> = ({ parcel, className }) => {
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
