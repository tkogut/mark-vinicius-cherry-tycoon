import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFarm } from '@/hooks/useFarm';
import { PlayerFarm, Season, SeasonPhase, WeatherEvent } from '@/declarations/backend.did';
import { calculateYieldBreakdown } from '@/lib/gameLogic';
import { useQueryClient } from '@tanstack/react-query';
import { FARM_QUERY_KEY } from '@/hooks/useFarm';

const GUEST_FARM_KEY = 'cherry_tycoon_guest_farm';

// Helper to create a starting guest farm
const createInitialGuestFarm = (): PlayerFarm => ({
    owner: {} as any, // Principal not needed for local
    playerId: "guest_" + Date.now(),
    playerName: "Guest Farmer",
    cash: 50000n,
    level: 1n,
    experience: 0n,
    reputation: 50n,
    ownedClubs: [],
    parcels: [{
        id: "guest_parcel_1",
        ownerId: "guest",
        region: {
            province: { Opolskie: null },
            county: "Opole",
            commune: "Opole",
            communeType: { Mixed: null },
            population: 128000n,
            marketSize: 0.8,
            laborCostMultiplier: 1.0,
        },
        soilType: { SandyClay: null },
        pH: 6.5,
        fertility: 0.7,
        permeability: 0.8,
        humidity: 0.6,
        size: 0.5,
        plantedTrees: 50n,
        treeAge: 5n,
        isOrganic: false,
        organicConversionSeason: 0n,
        organicCertified: false,
        lastHarvest: 0n,
        quality: 60n,
        waterLevel: 0.5,
        lastFertilized: 0n,
    }],
    infrastructure: [],
    inventory: {
        cherries: 0n,
        organicCherries: 0n,
        fertilizers: 10n,
        pesticides: 5n,
        organicTreatments: 0n,
    },
    statistics: {
        totalHarvested: 0n,
        totalSold: 0n,
        totalRevenue: 0n,
        totalCosts: 0n,
        seasonsPlayed: 0n,
        bestYearlyProfit: 0n,
        averageYieldPerHa: 0.0,
        seasonalReports: [],
        yearlyReports: [],
    },
    currentSeason: { Spring: null },
    currentPhase: { Hiring: null },
    weather: [] as any, // Option type mapped to array in frontend
    seasonNumber: 1n,
    lastActive: BigInt(Date.now()),
});

// Helper for generic mutations on local state
type Mutator<T> = (farm: PlayerFarm, args: T) => PlayerFarm;

export function useGuestFarm() {
    const { isAuthenticated } = useAuth();
    const realFarmOptions = useFarm();
    const queryClient = useQueryClient();

    // Local State
    const [localFarm, setLocalFarm] = useState<PlayerFarm | null>(null);

    // Load from LocalStorage on mount if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            const saved = localStorage.getItem(GUEST_FARM_KEY);
            if (saved) {
                try {
                    // Need to revive BigInts
                    const parsed = JSON.parse(saved, (key, value) => {
                        if (typeof value === 'string' && /^\d+n$/.test(value)) {
                            return BigInt(value.slice(0, -1));
                        }
                        return value;
                    });
                    setLocalFarm(parsed);
                } catch (e) {
                    console.error("Failed to parse guest farm:", e);
                    setLocalFarm(createInitialGuestFarm());
                }
            } else {
                setLocalFarm(createInitialGuestFarm());
            }
        } else {
            // Once authenticated, clear local persistence to avoid confusion
            localStorage.removeItem(GUEST_FARM_KEY);
        }
    }, [isAuthenticated]);

    // Save to LocalStorage whenever localFarm changes
    useEffect(() => {
        if (!isAuthenticated && localFarm) {
            const serialized = JSON.stringify(localFarm, (key, value) =>
                typeof value === 'bigint' ? value.toString() + 'n' : value
            );
            localStorage.setItem(GUEST_FARM_KEY, serialized);
        }
    }, [localFarm, isAuthenticated]);

    // Local Mutation wrapper
    const mutateLocal = useCallback((updateFn: (draft: PlayerFarm) => PlayerFarm) => {
        setLocalFarm(prev => {
            if (!prev) return prev;
            return updateFn({ ...prev });
        });
        // Mock query invalidation for components relying on it implicitly (though they shouldn't)
        setTimeout(() => queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEY }), 100);
    }, [queryClient]);

    // -------------------------------------------------------------
    // Mock Mutations (Mimicking backend logic for guest fallback)
    // -------------------------------------------------------------

    const mockPlantTrees = useCallback(async ({ parcelId, amount }: { parcelId: string; amount: number }) => {
        mutateLocal(f => {
            const pIdx = f.parcels.findIndex(p => p.id === parcelId);
            if (pIdx >= 0) {
                const cost = BigInt(amount * 50);
                if (f.cash >= cost) {
                    f.parcels[pIdx].plantedTrees += BigInt(amount);
                    f.cash -= cost;
                } else {
                    throw new Error("Insufficient funds");
                }
            }
            return f;
        });
        return "Trees planted";
    }, [mutateLocal]);

    const mockWaterParcel = useCallback(async (parcelId: string) => {
        mutateLocal(f => {
            const pIdx = f.parcels.findIndex(p => p.id === parcelId);
            if (pIdx >= 0) {
                const cost = 200n;
                if (f.cash >= cost) {
                    f.parcels[pIdx].waterLevel = Math.min(1.0, f.parcels[pIdx].waterLevel + 0.3);
                    f.cash -= cost;
                } else {
                    throw new Error("Insufficient funds");
                }
            }
            return f;
        });
        return "Watered";
    }, [mutateLocal]);

    const mockFertilizeParcel = useCallback(async ({ parcelId }: { parcelId: string }) => {
        mutateLocal(f => {
            const pIdx = f.parcels.findIndex(p => p.id === parcelId);
            if (pIdx >= 0 && f.inventory.fertilizers > 0n) {
                f.parcels[pIdx].fertility = Math.min(1.0, f.parcels[pIdx].fertility + 0.1);
                f.inventory.fertilizers -= 1n;
            }
            return f;
        });
        return "Fertilized";
    }, [mutateLocal]);

    const mockHarvestCherries = useCallback(async (parcelId: string) => {
        let harvestedAmount = 0n;
        mutateLocal(f => {
            const pIdx = f.parcels.findIndex(p => p.id === parcelId);
            if (pIdx >= 0) {
                const yieldBreakdown = calculateYieldBreakdown(f.parcels[pIdx], f.infrastructure);
                harvestedAmount = BigInt(Math.floor(yieldBreakdown.parcelYield));
                if (f.parcels[pIdx].organicCertified) {
                    f.inventory.organicCherries += harvestedAmount;
                } else {
                    f.inventory.cherries += harvestedAmount;
                }
                f.parcels[pIdx].lastHarvest = f.seasonNumber;
            }
            return f;
        });
        return harvestedAmount;
    }, [mutateLocal]);

    const mockCutAndPrune = useCallback(async (parcelId: string) => {
        mutateLocal(f => {
            // Mock empty maintenance log
            return f;
        });
        return "Pruned";
    }, [mutateLocal]);

    const mockAdvancePhase = useCallback(async () => {
        mutateLocal(f => {
            const phaseTypes = ['Planning', 'Hiring', 'Procurement', 'Investment', 'Growth', 'Harvest', 'Market', 'Storage', 'CutAndPrune', 'Maintenance'];
            const seasonTypes = ['Spring', 'Summer', 'Autumn', 'Winter'];
            const currentPhaseName = Object.keys(f.currentPhase)[0];
            const currentIndex = phaseTypes.indexOf(currentPhaseName);

            if (currentPhaseName === 'Planning') {
                // If ending Planning, we advance the whole season
                const currentSeasonName = Object.keys(f.currentSeason)[0];
                const seasonIndex = seasonTypes.indexOf(currentSeasonName);
                const nextSeason = seasonTypes[(seasonIndex + 1) % 4];
                f.currentSeason = { [nextSeason]: null } as any;
                f.currentPhase = { 'Hiring': null } as any;
                if (nextSeason === 'Spring') {
                    f.seasonNumber += 1n;
                }
            } else if (currentIndex >= 0 && currentIndex < phaseTypes.length - 1) {
                const nextPhase = phaseTypes[currentIndex + 1];
                f.currentPhase = { [nextPhase]: null } as any;
            }
            return f;
        });
        return "Phase advanced";
    }, [mutateLocal]);

    const mockSellCherries = useCallback(async ({ amount }: { amount: number }) => {
        let revenue = 0n;
        mutateLocal(f => {
            const sellAmount = BigInt(amount);
            if (f.inventory.cherries >= sellAmount) {
                f.inventory.cherries -= sellAmount;
                revenue = sellAmount * 15n; // Mock price
                f.cash += revenue;
            }
            return f;
        });
        return revenue;
    }, [mutateLocal]);

    // Determine which interface to expose
    if (isAuthenticated) {
        return realFarmOptions;
    }

    const mockMutation = (fn: any) => ({
        mutate: fn,
        mutateAsync: fn,
        isPending: false,
        isSuccess: false,
        isError: false,
        error: null,
        data: undefined,
        status: 'idle' as const,
        variables: undefined,
        context: undefined,
        reset: () => { },
    });

    // Return mocked interface for guests
    return {
        farm: localFarm,
        isLoading: false,
        isError: false,
        error: null,
        refetch: async () => { }, // No-op locally
        plant: mockMutation(mockPlantTrees) as any,
        water: mockMutation(mockWaterParcel) as any,
        fertilize: mockMutation(mockFertilizeParcel) as any,
        buyParcel: mockMutation(async () => { }) as any, // Complex, leave empty for guest
        harvest: mockMutation(mockHarvestCherries) as any,
        cutAndPrune: mockMutation(mockCutAndPrune) as any,
        sellCherries: mockMutation(mockSellCherries) as any,
        advancePhase: mockMutation(mockAdvancePhase) as any,
        startOrganicConversion: mockMutation(async () => { }) as any,
        upgradeInfrastructure: mockMutation(async () => { }) as any,
    };
}
