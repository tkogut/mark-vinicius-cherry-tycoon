import { CherryParcel, Infrastructure } from '@/declarations/backend.did';
import { ParcelCard } from './ParcelCard';
import { Button } from "@/components/ui/button";
import { Plus, Cog } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FarmGridProps {
    parcels: CherryParcel[];
    onAction: (action: 'plant' | 'water' | 'fertilize' | 'harvest' | 'organic' | 'prune', parcelId: string) => void;
    onBuyParcel: () => void;
    loading?: boolean;
    currentSeason?: any; // Season type from backend
    infrastructure: Infrastructure[];
    currentPhase?: 'Planning' | 'Hiring' | 'Procurement' | 'Investment' | 'Growth' | 'Harvest' | 'Market' | 'Storage' | 'CutAndPrune' | 'Maintenance';
}

export const FarmGrid: React.FC<FarmGridProps> = ({ parcels, onAction, onBuyParcel, loading, currentSeason, infrastructure, currentPhase }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 mechanical-hull" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Section Header — Mechanical Hull Style */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <Cog className="h-5 w-5 text-brass animate-gear-spin" />
                    <h2 className="text-2xl hull-header">My Parcels</h2>
                </div>
                {parcels.length < 9 && (
                    <Button
                        onClick={onBuyParcel}
                        variant="secondary"
                        className="gap-2 bg-gradient-to-r from-brass-dark to-brass hover:from-brass hover:to-brass-light text-charcoal font-bold shadow-lg shadow-brass/20 transition-all duration-300 hover:shadow-brass/40 hover:-translate-y-0.5"
                    >
                        <Plus className="h-4 w-4" />
                        Buy New Parcel
                    </Button>
                )}
            </div>

            {currentPhase && ['Hiring', 'Procurement', 'Market', 'Storage', 'Maintenance'].includes(currentPhase) && parcels.length > 0 && (
                <div className="mechanical-hull p-4 flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-semibold text-brass">No Parcel Actions Available</h3>
                        <p className="text-sm text-brass-light/60">The <span className="font-bold text-copper">{currentPhase}</span> phase involves general management rather than field work. Review your stats, or proceed to the next phase.</p>
                    </div>
                </div>
            )}

            <div className={cn(
                // Mobile: 1 col < 475px, 2 cols >= 475px, Desktop: 3 columns
                "grid gap-4 md:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-3",
                // Max width for centered 3x3 look on large screens
                "lg:max-w-4xl mx-auto"
            )}>
                {parcels.map((parcel) => (
                    <ParcelCard
                        key={parcel.id}
                        parcel={parcel}
                        onAction={onAction}
                        currentSeason={currentSeason}
                        infrastructure={infrastructure}
                        currentPhase={currentPhase}
                    />
                ))}

                {/* Empty State / Buy Prompt if few parcels */}
                {parcels.length === 0 && (
                    <div className="col-span-2 md:col-span-3 h-64 mechanical-hull flex flex-col items-center justify-center">
                        <Cog className="h-10 w-10 text-brass/40 animate-gear-spin mb-4" />
                        <div className="text-brass/60 mb-4 tracking-wide">No parcels found</div>
                        <Button
                            onClick={onBuyParcel}
                            className="bg-gradient-to-r from-brass-dark to-brass hover:from-brass hover:to-brass-light text-charcoal font-bold"
                        >
                            Purchase Your First Land
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

