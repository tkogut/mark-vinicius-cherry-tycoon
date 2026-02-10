import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
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
            const prices = await backendActor.getMarketPrices();
            console.log('[useMarketPrices] Received:', prices);
            return prices;
        },
        enabled: !!backendActor,
        staleTime: 1000 * 60 * 5, // 5 minutes (prices change seasonally)
    });
}
