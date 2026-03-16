import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { GameError } from '@/declarations/backend.did';
import { useAudio } from '@/contexts/AudioContext';
import { SOUNDS } from '@/config/sounds';

const getErrorMessage = (error: GameError): string => {
    if ('NotFound' in error) return `Not Found: ${error.NotFound}`;
    if ('InvalidOperation' in error) return `Invalid Operation: ${error.InvalidOperation}`;
    if ('BankruptcyRisk' in error) return `Financial Risk: Need $${Number(error.BankruptcyRisk.estimatedCostUntilHarvest).toLocaleString()} for survival.`;
    if ('InsufficientFunds' in error) return `Insufficient Funds: Need ${error.InsufficientFunds.required}, Have ${error.InsufficientFunds.available}`;
    if ('SeasonalRestriction' in error) return `Seasonal Restriction: ${error.SeasonalRestriction}`;
    if ('AlreadyExists' in error) return `Already Exists: ${error.AlreadyExists}`;
    if ('Unauthorized' in error) return `Unauthorized: ${error.Unauthorized}`;
    return 'Unknown Auction Error';
};

export const MARKET_STATE_QUERY_KEY = ['marketState'];
export const ACTIVE_CONTRACTS_QUERY_KEY = ['activeContracts'];

export function useAuction() {
    const { backendActor, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { playSFX } = useAudio();

    const marketStateQuery = useQuery({
        queryKey: MARKET_STATE_QUERY_KEY,
        queryFn: async () => {
            if (!backendActor) throw new Error('Not authenticated');
            const result = await backendActor.getMarketState();
            if ('Err' in result) throw new Error(getErrorMessage(result.Err));
            return result.Ok;
        },
        enabled: !!backendActor && isAuthenticated,
        staleTime: 1000 * 30, // 30 seconds
    });

    const activeContractsQuery = useQuery({
        queryKey: ACTIVE_CONTRACTS_QUERY_KEY,
        queryFn: async () => {
            if (!backendActor) throw new Error('Not authenticated');
            const result = await backendActor.getActiveContracts();
            if ('Err' in result) throw new Error(getErrorMessage(result.Err));
            return result.Ok;
        },
        enabled: !!backendActor && isAuthenticated,
        staleTime: 1000 * 30,
    });

    const submitBidMutation = useMutation({
        mutationFn: async ({ contractId, offerPrice }: { contractId: string; offerPrice: number }) => {
            if (!backendActor) throw new Error('Not authenticated');
            const result = await backendActor.submitAuctionBid(contractId, BigInt(offerPrice));
            if ('Err' in result) throw new Error(getErrorMessage(result.Err));
            return result.Ok;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ACTIVE_CONTRACTS_QUERY_KEY });
            toast({
                title: "Bid Submitted",
                description: "Your sealed bid has been entered into the pool.",
                className: "bg-amber-900 border-amber-800 text-amber-100",
            });
            playSFX(SOUNDS.GAME.CASH);
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Bid Failed",
                description: error.message,
            });
        },
    });

    const commitFutureMutation = useMutation({
        mutationFn: async ({ contractId, volumeKg }: { contractId: string; volumeKg: number }) => {
            if (!backendActor) throw new Error('Not authenticated');
            const result = await backendActor.commitPreSeasonFuture(contractId, BigInt(volumeKg));
            if ('Err' in result) throw new Error(getErrorMessage(result.Err));
            return result.Ok;
        },
        onSuccess: (message) => {
            queryClient.invalidateQueries({ queryKey: ACTIVE_CONTRACTS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['farm'] });
            toast({
                title: "Future Committed",
                description: message,
                className: "bg-emerald-900 border-emerald-800 text-emerald-100",
            });
            playSFX(SOUNDS.GAME.CASH);
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Commitment Failed",
                description: error.message,
            });
        },
    });

    const resolveAuctionsMutation = useMutation({
        mutationFn: async () => {
            if (!backendActor) throw new Error('Not authenticated');
            const result = await backendActor.resolveSeasonAuctions();
            if ('Err' in result) throw new Error(getErrorMessage(result.Err));
            return result.Ok;
        },
        onSuccess: (message) => {
            queryClient.invalidateQueries({ queryKey: ACTIVE_CONTRACTS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: MARKET_STATE_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['farm'] });
            toast({
                title: "Auctions Resolved",
                description: message,
                className: "bg-indigo-900 border-indigo-800 text-indigo-100",
            });
            playSFX(SOUNDS.GAME.LEVEL_UP);
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Resolution Failed",
                description: error.message,
            });
        },
    });

    return {
        marketState: marketStateQuery.data,
        isMarketLoading: marketStateQuery.isLoading,
        contracts: activeContractsQuery.data,
        isContractsLoading: activeContractsQuery.isLoading,
        submitBid: submitBidMutation,
        commitFuture: commitFutureMutation,
        resolveAuctions: resolveAuctionsMutation,
        refresh: () => {
            marketStateQuery.refetch();
            activeContractsQuery.refetch();
        }
    };
}
