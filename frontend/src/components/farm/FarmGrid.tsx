import React from 'react';
import { CherryParcel } from '@/declarations/backend.did';
import { ParcelCard } from './ParcelCard';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FarmGridProps {
    parcels: CherryParcel[];
    onAction: (action: 'plant' | 'water' | 'fertilize' | 'harvest' | 'organic', parcelId: string) => void;
    onBuyParcel: () => void;
    loading?: boolean;
    currentSeason?: any; // Season type from backend
}

export const FarmGrid: React.FC<FarmGridProps> = ({ parcels, onAction, onBuyParcel, loading, currentSeason }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 rounded-xl bg-slate-800/20 backdrop-blur-sm border border-slate-700/50" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-100">My Parcels</h2>
                {parcels.length < 9 && (
                    <Button onClick={onBuyParcel} variant="secondary" className="gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/20">
                        <Plus className="h-4 w-4" />
                        Buy New Parcel
                    </Button>
                )}
            </div>

            <div className={cn(
                "grid gap-4 md:gap-6",
                // Mobile: 2 columns, Desktop: 3 columns
                "grid-cols-2 md:grid-cols-3",
                // Max width for centered 3x3 look on large screens
                "lg:max-w-4xl mx-auto"
            )}>
                {parcels.map((parcel) => (
                    <ParcelCard
                        key={parcel.id}
                        parcel={parcel}
                        onAction={onAction}
                        currentSeason={currentSeason}
                    />
                ))}

                {/* Empty State / Buy Prompt if few parcels */}
                {parcels.length === 0 && (
                    <div className="col-span-2 md:col-span-3 h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
                        <div className="text-slate-400 mb-4">No parcels found</div>
                        <Button onClick={onBuyParcel}>Purchase Your First Land</Button>
                    </div>
                )}
            </div>
        </div>
    );
};
