import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { GameError } from '@/declarations/backend.did';
import { useAudio } from '@/contexts/AudioContext';
import { SOUNDS } from '@/config/sounds';

const getErrorMessage = (error: GameError): string => {
    if ('NotFound' in error) return `Not Found: ${error.NotFound}`;
    if ('InvalidOperation' in error) return `Invalid Operation: ${error.InvalidOperation}`;
    if ('BankruptcyRisk' in error) return `Financial Risk: You need at least $${Number(error.BankruptcyRisk.estimatedCostUntilHarvest).toLocaleString()} to survive until the next harvest, but you would have only $${Number(error.BankruptcyRisk.available).toLocaleString()} left.`;
    if ('InsufficientFunds' in error) return `Insufficient Funds: Need ${error.InsufficientFunds.required}, Have ${error.InsufficientFunds.available}`;
    if ('InvalidOperation' in error) return `Invalid Operation: ${error.InvalidOperation}`;
    if ('SeasonalRestriction' in error) return `Seasonal Restriction: ${error.SeasonalRestriction}`;
    if ('AlreadyExists' in error) return `Already Exists: ${error.AlreadyExists}`;
    return 'Unknown Game Error';
};

export const FARM_QUERY_KEY = ['farm'];

export function useFarm() {
    const { backendActor, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { playSFX } = useAudio();

    const farmQuery = useQuery({
        queryKey: FARM_QUERY_KEY,
        queryFn: async () => {
            console.log('[useFarm] Fetching farm state...');
            if (!backendActor) {
                console.warn('[useFarm] No backend actor available');
                throw new Error('Not authenticated');
            }
            console.log('[useFarm] Calling getPlayerFarm()...');
            const result = await backendActor.getPlayerFarm();
            if ('Err' in result) {
                console.error('[useFarm] getPlayerFarm failed:', result.Err);
                throw new Error(getErrorMessage(result.Err));
            }
            console.log('[useFarm] Farm state received:', {
                parcels: result.Ok.parcels.length,
                cash: result.Ok.cash.toString(),
                cherries: result.Ok.inventory.cherries.toString(),
                level: result.Ok.level.toString(),
            });
            console.log('[useFarm] Full farm object:', result.Ok);
            console.log('[useFarm] Parcels detail:', result.Ok.parcels.map(p => ({
                id: p.id,
                region: p.region.province,
                plantedTrees: p.plantedTrees.toString(),
                waterLevel: p.waterLevel.toString(),
                quality: p.quality.toString(),
                treeAge: p.treeAge.toString(),
            })));
            return result.Ok;
        },
        enabled: !!backendActor && isAuthenticated,
        staleTime: 1000 * 60, // 1 minute
    });

    const plantMutation = useMutation({
        mutationFn: async ({ parcelId, amount }: { parcelId: string; amount: number }) => {
            console.log('[useFarm] plantTrees called:', { parcelId, amount });
            if (!backendActor) {
                console.warn('[useFarm] No backend actor for planting');
                throw new Error('Not authenticated');
            }
            const result = await backendActor.plantTrees(parcelId, BigInt(amount));
            if ('Err' in result) {
                console.error('[useFarm] plantTrees failed:', result.Err);
                throw new Error(getErrorMessage(result.Err));
            }
            console.log('[useFarm] plantTrees succeeded');
            return result;
        },
        onSuccess: (_, { amount }) => {
            console.log('[useFarm] Invalidating farm query after plant');
            queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEY });
            toast({
                title: "Planting Successful",
                description: `Planted ${amount} trees.`,
                className: "bg-emerald-900 border-emerald-800 text-emerald-100",
            });
            playSFX(SOUNDS.GAME.PLANT);
        },
        onError: (error: Error) => {
            console.error('[useFarm] Plant mutation error:', error);
            toast({
                variant: "destructive",
                title: "Planting Failed",
                description: error.message,
            });
        },
    });

    const waterMutation = useMutation({
        mutationFn: async (parcelId: string) => {
            console.log('[useFarm] waterParcel called:', { parcelId });
            if (!backendActor) {
                console.warn('[useFarm] No backend actor for watering');
                throw new Error('Not authenticated');
            }
            const result = await backendActor.waterParcel(parcelId);
            if ('Err' in result) {
                console.error('[useFarm] waterParcel failed:', result.Err);
                throw new Error(getErrorMessage(result.Err));
            }
            console.log('[useFarm] waterParcel succeeded');
            return result;
        },
        onSuccess: () => {
            console.log('[useFarm] Invalidating farm query after water');
            queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEY });
            toast({
                title: "Watering Successful",
                description: "Your trees are hydrated!",
                className: "bg-blue-900 border-blue-800 text-blue-100",
            });
            playSFX(SOUNDS.GAME.WATER);
            playSFX(SOUNDS.GAME.WATER);
        },
        onError: (error: Error) => {
            console.error('[useFarm] Water mutation error:', error);
            toast({
                variant: "destructive",
                title: "Watering Failed",
                description: error.message,
            });
        },
    });

    const fertilizeMutation = useMutation({
        mutationFn: async ({ parcelId, fertilizerType }: { parcelId: string; fertilizerType: string }) => {
            console.log('[useFarm] fertilizeParcel called:', { parcelId, fertilizerType });
            if (!backendActor) {
                console.warn('[useFarm] No backend actor for fertilizing');
                throw new Error('Not authenticated');
            }
            const result = await backendActor.fertilizeParcel(parcelId, fertilizerType);
            if ('Err' in result) {
                console.error('[useFarm] fertilizeParcel failed:', result.Err);
                throw new Error(getErrorMessage(result.Err));
            }
            console.log('[useFarm] fertilizeParcel succeeded');
            return result;
        },
        onSuccess: () => {
            console.log('[useFarm] Invalidating farm query after fertilize');
            queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEY });
            toast({
                title: "Fertilization Successful",
                description: "Nutrients added to the soil!",
                className: "bg-amber-900 border-amber-800 text-amber-100",
            });
            playSFX(SOUNDS.GAME.PLANT);
        },
        onError: (error: Error) => {
            console.error('[useFarm] Fertilize mutation error:', error);
            toast({
                variant: "destructive",
                title: "Fertilization Failed",
                description: error.message,
            });
        },
    });

    const harvestMutation = useMutation({
        mutationFn: async (parcelId: string) => {
            console.log('[useFarm] harvestCherries called:', { parcelId });
            if (!backendActor) {
                console.warn('[useFarm] No backend actor for harvesting');
                throw new Error('Not authenticated');
            }
            const result = await backendActor.harvestCherries(parcelId);
            if ('Err' in result) {
                console.error('[useFarm] harvestCherries failed:', result.Err);
                throw new Error(getErrorMessage(result.Err));
            }
            console.log('[useFarm] harvestCherries succeeded, amount:', result.Ok.toString());
            return result.Ok; // Returns bigint (amount)
        },
        onSuccess: (amount) => {
            console.log('[useFarm] Invalidating farm query after harvest');
            queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEY });
            toast({
                title: "Harvest Successful!",
                description: `You gathered ${amount} cherries.`,
                className: "bg-rose-900 border-rose-800 text-rose-100",
            });
            playSFX(SOUNDS.GAME.HARVEST);
            playSFX(SOUNDS.GAME.HARVEST);
        },
        onError: (error: Error) => {
            console.error('[useFarm] Harvest mutation error:', error);
            toast({
                variant: "destructive",
                title: "Harvest Failed",
                description: error.message,
            });
        },
    });

    const cutAndPruneMutation = useMutation({
        mutationFn: async (parcelId: string) => {
            console.log('[useFarm] cutAndPrune called:', { parcelId });
            if (!backendActor) {
                console.warn('[useFarm] No backend actor for pruning');
                throw new Error('Not authenticated');
            }
            const result = await backendActor.cutAndPrune(parcelId);
            if ('Err' in result) {
                console.error('[useFarm] cutAndPrune failed:', result.Err);
                throw new Error(getErrorMessage(result.Err));
            }
            console.log('[useFarm] cutAndPrune succeeded');
            return result.Ok;
        },
        onSuccess: (message) => {
            console.log('[useFarm] Invalidating farm query after prune');
            queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEY });
            toast({
                title: "Maintenance Done",
                description: message,
                className: "bg-emerald-900 border-emerald-800 text-emerald-100",
            });
            playSFX(SOUNDS.GAME.PLANT);
        },
        onError: (error: Error) => {
            console.error('[useFarm] Prune mutation error:', error);
            toast({
                variant: "destructive",
                title: "Pruning Failed",
                description: error.message,
            });
        },
    });

    const buyParcelMutation = useMutation({
        mutationFn: async ({ parcelId, price }: { parcelId: string; price: number }) => {
            console.log('[useFarm] buyParcel called:', { parcelId, price });
            if (!backendActor) {
                console.warn('[useFarm] No backend actor for buying parcel');
                throw new Error('Not authenticated');
            }
            const result = await backendActor.buyParcel(parcelId, BigInt(price));
            if ('Err' in result) {
                console.error('[useFarm] buyParcel failed:', result.Err);
                throw new Error(getErrorMessage(result.Err));
            }
            console.log('[useFarm] buyParcel succeeded:', result.Ok);
            return result.Ok;
        },
        onSuccess: () => {
            console.log('[useFarm] Invalidating farm query after buy parcel');
            queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEY });
            toast({
                title: "Parcel Purchased!",
                description: "New parcel added to your farm.",
                className: "bg-green-900 border-green-800 text-green-100",
            });
            playSFX(SOUNDS.GAME.CASH);
        },
        onError: (error: Error) => {
            console.error('[useFarm] Buy parcel mutation error:', error);
            toast({
                variant: "destructive",
                title: "Purchase Failed",
                description: error.message,
            });
        },
    });

    const sellCherriesMutation = useMutation({
        mutationFn: async ({ amount, marketType }: { amount: number; marketType: string }) => {
            console.log('[useFarm] sellCherries called:', { amount, marketType });
            if (!backendActor) {
                console.warn('[useFarm] No backend actor for selling cherries');
                throw new Error('Not authenticated');
            }
            const result = await backendActor.sellCherries(BigInt(amount), marketType);
            if ('Err' in result) {
                console.error('[useFarm] sellCherries failed:', result.Err);
                throw new Error(getErrorMessage(result.Err));
            }
            console.log('[useFarm] sellCherries succeeded, revenue:', result.Ok.toString());
            return result.Ok; // Returns bigint (revenue)
        },
        onSuccess: (revenue) => {
            console.log('[useFarm] Invalidating farm query after sell');
            queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEY });
            toast({
                title: "Cherries Sold!",
                description: `Earned $${Number(revenue).toLocaleString()} from sale.`,
                className: "bg-emerald-900 border-emerald-800 text-emerald-100",
            });
            playSFX(SOUNDS.GAME.CASH);
        },
        onError: (error: Error) => {
            console.error('[useFarm] Sell cherries mutation error:', error);
            toast({
                variant: "destructive",
                title: "Sale Failed",
                description: error.message,
            });
        },
    });

    const startOrganicConversionMutation = useMutation({
        mutationFn: async (parcelId: string) => {
            console.log('[useFarm] startOrganicConversion called:', { parcelId });
            if (!backendActor) {
                console.warn('[useFarm] No backend actor for organic conversion');
                throw new Error('Not authenticated');
            }
            const result = await backendActor.startOrganicConversion(parcelId);
            if ('Err' in result) {
                console.error('[useFarm] startOrganicConversion failed:', result.Err);
                throw new Error(getErrorMessage(result.Err));
            }
            console.log('[useFarm] startOrganicConversion succeeded');
            return result.Ok;
        },
        onSuccess: (message) => {
            console.log('[useFarm] Invalidating farm query after organic conversion');
            queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEY });
            toast({
                title: "Conversion Started",
                description: message,
                className: "bg-green-900 border-green-800 text-green-100",
            });
            playSFX(SOUNDS.UI.SUCCESS);
        },
        onError: (error: Error) => {
            console.error('[useFarm] Organic conversion mutation error:', error);
            toast({
                variant: "destructive",
                title: "Conversion Failed",
                description: error.message,
            });
        },
    });

    const upgradeInfrastructureMutation = useMutation({
        mutationFn: async (infraType: string) => {
            console.log('[useFarm] upgradeInfrastructure called:', { infraType });
            if (!backendActor) {
                console.warn('[useFarm] No backend actor for infrastructure upgrade');
                throw new Error('Not authenticated');
            }
            const result = await backendActor.upgradeInfrastructure(infraType);
            if ('Err' in result) {
                console.error('[useFarm] upgradeInfrastructure failed:', result.Err);
                throw new Error(getErrorMessage(result.Err));
            }
            console.log('[useFarm] upgradeInfrastructure succeeded');
            return result.Ok;
        },
        onSuccess: (message) => {
            console.log('[useFarm] Invalidating farm query after infrastructure upgrade');
            queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEY });
            toast({
                title: "Upgrade Successful",
                description: message,
                className: "bg-amber-900 border-amber-800 text-amber-100",
            });
            playSFX(SOUNDS.GAME.CASH);
        },
        onError: (error: Error) => {
            console.error('[useFarm] Infrastructure upgrade mutation error:', error);
            toast({
                variant: "destructive",
                title: "Upgrade Failed",
                description: error.message,
            });
        },
    });

    const upgradeGoldenHarvesterMutation = useMutation({
        mutationFn: async () => {
            console.log('[useFarm] upgradeGoldenHarvester called');
            if (!backendActor) {
                console.warn('[useFarm] No backend actor for golden harvester upgrade');
                throw new Error('Not authenticated');
            }
            const result = await backendActor.upgrade_golden_harvester();
            if ('Err' in result) {
                console.error('[useFarm] upgrade_golden_harvester failed:', result.Err);
                throw new Error(getErrorMessage(result.Err));
            }
            console.log('[useFarm] upgrade_golden_harvester succeeded:', result.Ok);
            return result.Ok;
        },
        onSuccess: (newLevel) => {
            console.log('[useFarm] Invalidating farm query after golden harvester upgrade');
            queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEY });
            toast({
                title: "Cinematic Upgrade!",
                description: `Golden Harvester ascended to Level ${newLevel.toString()}`,
                className: "bg-amber-900 border-amber-800 text-amber-100",
            });
            playSFX(SOUNDS.GAME.LEVEL_UP);
        },
        onError: (error: Error) => {
            console.error('[useFarm] Golden harvester upgrade mutation error:', error);
            toast({
                variant: "destructive",
                title: "Upgrade Failed",
                description: error.message,
            });
        },
    });

    const advancePhaseMutation = useMutation({
        mutationFn: async () => {
            if (!backendActor) throw new Error("Backend actor not initialized");
            console.log('[useFarm] Advancing phase...');
            const result = await backendActor.advancePhase();
            if ('Err' in result) throw new Error(getErrorMessage(result.Err)); // Assuming getErrorMessage is available
            return result.Ok;
        },
        onSuccess: (message) => {
            console.log('[useFarm] Invalidating farm query after phase advance');
            queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEY });
            toast({
                title: "Phase Advanced!",
                description: message,
                className: "bg-indigo-900 border-indigo-800 text-indigo-100",
            });
            playSFX(SOUNDS.GAME.LEVEL_UP);
        },
        onError: (error: Error) => {
            console.error('[useFarm] Advance phase mutation error:', error);
            toast({
                variant: "destructive",
                title: "Phase Advance Failed",
                description: error.message,
            });
        },
    });

    const hireLaborMutation = useMutation({
        mutationFn: async (laborChoice: string) => {
            if (!backendActor) throw new Error("Backend actor not initialized");
            console.log('[useFarm] Hiring labor...', { laborChoice });
            const result = await backendActor.hireLabor(laborChoice);
            if ('Err' in result) throw new Error(getErrorMessage(result.Err));
            return result.Ok;
        },
        onSuccess: (message) => {
            console.log('[useFarm] labor hired successfully');
            queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEY });
            toast({
                title: "Labor Contract Signed!",
                description: message,
                className: "bg-emerald-900 border-emerald-800 text-emerald-100",
            });
            playSFX(SOUNDS.GAME.CASH);
        },
        onError: (error: Error) => {
            console.error('[useFarm] Hire labor mutation error:', error);
            toast({
                variant: "destructive",
                title: "Hiring Failed",
                description: error.message,
            });
        },
    });

    const buySuppliesMutation = useMutation({
        mutationFn: async ({ supplyType, amount }: { supplyType: string, amount: number }) => {
            console.log('[useFarm] purchaseSupplies called:', { supplyType, amount });
            if (!backendActor) throw new Error('Not authenticated');
            const result = await backendActor.purchaseSupplies(supplyType, BigInt(amount));
            if ('Err' in result) throw new Error(getErrorMessage(result.Err));
            return result.Ok;
        },
        onSuccess: (message) => {
            queryClient.invalidateQueries({ queryKey: FARM_QUERY_KEY });
            toast({
                title: "Procurement Successful",
                description: message,
                className: "bg-emerald-900 border-emerald-800 text-emerald-100",
            });
            playSFX(SOUNDS.GAME.CASH);
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Procurement Failed",
                description: error.message,
            });
        },
    });

    return {
        farm: farmQuery.data,
        isLoading: farmQuery.isLoading,
        isError: farmQuery.isError,
        error: farmQuery.error,
        refetch: farmQuery.refetch,
        plant: plantMutation,
        water: waterMutation,
        fertilize: fertilizeMutation,
        harvest: harvestMutation,
        cutAndPrune: cutAndPruneMutation,
        buyParcel: buyParcelMutation,
        sellCherries: sellCherriesMutation,
        startOrganicConversion: startOrganicConversionMutation,
        upgradeInfrastructure: upgradeInfrastructureMutation,
        upgradeGoldenHarvester: upgradeGoldenHarvesterMutation,
        advancePhase: advancePhaseMutation,
        hireLabor: hireLaborMutation,
        buySupplies: buySuppliesMutation,
    };
}

export function useStability() {
    const { backendActor, isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['stability'],
        queryFn: async () => {
            if (!backendActor) throw new Error('Not authenticated');
            const result = await backendActor.checkStability();
            if ('Err' in result) throw new Error(getErrorMessage(result.Err));
            return result.Ok;
        },
        enabled: !!backendActor && isAuthenticated,
        refetchInterval: 1000 * 30, // Refresh every 30 seconds
    });
}

export function useLeaderboard() {
    const { backendActor, isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            if (!backendActor) throw new Error('Not authenticated');
            return await backendActor.getGlobalLeaderboard();
        },
        enabled: !!backendActor && isAuthenticated,
        refetchInterval: 1000 * 60 * 5, // 5 minutes
    });
}

export function useCompetitors() {
    const { backendActor, isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['competitors'],
        queryFn: async () => {
            if (!backendActor) throw new Error('Not authenticated');
            return await backendActor.getCompetitorSummaries();
        },
        enabled: !!backendActor && isAuthenticated,
        refetchInterval: 1000 * 60 * 5, // 5 minutes
    });
}

export function useYearlyInsights() {
    const { backendActor, isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['yearlyInsights'],
        queryFn: async () => {
            if (!backendActor) throw new Error('Not authenticated');
            const result = await backendActor.getYearlyInsights();
            if ('Err' in result) throw new Error(getErrorMessage(result.Err));
            return result.Ok;
        },
        enabled: !!backendActor && isAuthenticated,
        staleTime: 1000 * 60, // 1 minute
    });
}
