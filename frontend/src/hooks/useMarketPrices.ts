import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { MarketPrice } from '@/declarations/backend.did';

export const MARKET_PRICES_KEY = ['marketPrices'];

export function useMarketPrices() {
    const { backendActor } = useAuth();

    return useQuery({
        queryKey: MARKET_PRICES_KEY,
        queryFn: async (): Promise<MarketPrice> => {
            console.log('[useMarketPrices] Fetching market prices...');
            if (!backendActor) {
                throw new Error('Not authenticated');
            }
            // NOTE: backend returns a Result variant here while the generated
            // binding types this as a bare MarketPrice — the cast below is the
            // real fix for that drift. (A `@ts-ignore` used to sit here too, but
            // it suppressed nothing: the explicit cast already satisfies tsc.
            // Removed 2026-08-06 when `@ts-expect-error` surfaced it as unused.)
            const result = await backendActor.getMarketPrices() as { Ok: MarketPrice } | { Err: object };

            if ('Ok' in result) {
                console.log('[useMarketPrices] Received:', result.Ok);
                return result.Ok;
            } else if ('Err' in result) {
                console.error('[useMarketPrices] Error:', result.Err);
                throw new Error(JSON.stringify(result.Err));
            }
            // Fallback if structure is unexpected (e.g. actually matches codegen)
            console.warn('[useMarketPrices] Unexpected structure:', result);
            return result as unknown as MarketPrice;
        },
        enabled: !!backendActor,
        staleTime: 1000 * 60 * 5, // 5 minutes (prices change seasonally)
    });
}
