import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActor } from '../lib/actor';
import type { Province } from '../types/backend';

export const useBackend = () => {
    const queryClient = useQueryClient();
    const actor = getActor();

    // Queries
    const usePlayerFarm = () => useQuery({
        queryKey: ['playerFarm'],
        queryFn: async () => {
            const result = await actor.getPlayerFarm();
            if ('Err' in result) {
                throw new Error(result.Err);
            }
            return result.Ok;
        },
        staleTime: 5000, // 5 seconds
    });

    const useCashBalance = () => useQuery({
        queryKey: ['cashBalance'],
        queryFn: () => actor.getCashBalance(),
        staleTime: 5000,
    });

    const useInventory = () => useQuery({
        queryKey: ['inventory'],
        queryFn: () => actor.getInventory(),
        staleTime: 5000,
    });

    const usePlayerStats = () => useQuery({
        queryKey: ['playerStats'],
        queryFn: () => actor.getPlayerStats(),
        staleTime: 10000,
    });

    // Mutations
    const initializePlayer = useMutation({
        mutationFn: ({ playerId, playerName }: { playerId: string; playerName: string }) =>
            actor.initializePlayer(playerId, playerName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playerFarm'] });
        },
    });

    const harvestCherries = useMutation({
        mutationFn: (parcelId: string) => actor.harvestCherries(parcelId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playerFarm'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['playerStats'] });
        },
    });

    const waterParcel = useMutation({
        mutationFn: (parcelId: string) => actor.waterParcel(parcelId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playerFarm'] });
            queryClient.invalidateQueries({ queryKey: ['cashBalance'] });
        },
    });

    const fertilizeParcel = useMutation({
        mutationFn: (parcelId: string) => actor.fertilizeParcel(parcelId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playerFarm'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
    });

    const plantTrees = useMutation({
        mutationFn: ({ parcelId, quantity }: { parcelId: string; quantity: number }) =>
            actor.plantTrees(parcelId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playerFarm'] });
            queryClient.invalidateQueries({ queryKey: ['cashBalance'] });
        },
    });

    const sellCherries = useMutation({
        mutationFn: ({ quantity, saleType }: { quantity: number; saleType: string }) =>
            actor.sellCherries(quantity, saleType),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['cashBalance'] });
            queryClient.invalidateQueries({ queryKey: ['playerStats'] });
        },
    });

    const purchaseParcel = useMutation({
        mutationFn: ({ province, size }: { province: Province; size: number }) =>
            actor.purchaseParcel(province, size),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playerFarm'] });
            queryClient.invalidateQueries({ queryKey: ['cashBalance'] });
        },
    });

    const startOrganicConversion = useMutation({
        mutationFn: (parcelId: string) => actor.startOrganicConversion(parcelId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playerFarm'] });
        },
    });

    const advanceSeason = useMutation({
        mutationFn: (weatherEvent?: string) => actor.advanceSeason(weatherEvent),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playerFarm'] });
            queryClient.invalidateQueries({ queryKey: ['cashBalance'] });
            queryClient.invalidateQueries({ queryKey: ['playerStats'] });
        },
    });

    const upgradeInfrastructure = useMutation({
        mutationFn: (infraType: string) => actor.upgradeInfrastructure(infraType),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playerFarm'] });
            queryClient.invalidateQueries({ queryKey: ['cashBalance'] });
        },
    });

    return {
        // Queries
        usePlayerFarm,
        useCashBalance,
        useInventory,
        usePlayerStats,

        // Mutations
        initializePlayer,
        harvestCherries,
        waterParcel,
        fertilizeParcel,
        plantTrees,
        sellCherries,
        purchaseParcel,
        startOrganicConversion,
        advanceSeason,
        upgradeInfrastructure,
    };
};
