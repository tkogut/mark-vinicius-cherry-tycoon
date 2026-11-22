import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useFarm } from '@/hooks/useFarm';
import { SaleQuote } from '@/declarations/backend.did';

export type SaleChannel = 'retail' | 'wholesale';

/**
 * The canister's exact quote for a prospective sale (ECON-21 PR0/PR1): the same
 * function `sellCherries` pays from, so it includes the kg this player already
 * sold this season and the regional saturation the frontend cannot compute.
 *
 * Disabled for guests (no actor) and while the quantity is 0; callers fall back to
 * the `gameLogic.ts` estimate then. The key includes `totalSold`, which changes
 * after every sale, so a finished sale never leaves a stale quote behind.
 */
export function useSaleQuote(quantity: number, saleType: SaleChannel, enabled: boolean) {
    const { backendActor } = useAuth();
    const { farm } = useFarm();
    const sold = farm ? farm.statistics.totalSold.toString() : '0';

    return useQuery({
        queryKey: ['saleQuote', quantity, saleType, sold],
        queryFn: async (): Promise<SaleQuote> => {
            if (!backendActor) throw new Error('Not authenticated');
            const result = await backendActor.quoteSale(BigInt(quantity), saleType);
            if ('Ok' in result) return result.Ok;
            throw new Error(JSON.stringify(result.Err));
        },
        enabled: enabled && !!backendActor && quantity > 0,
        staleTime: 0,
        gcTime: 30_000,
        retry: false,
    });
}
