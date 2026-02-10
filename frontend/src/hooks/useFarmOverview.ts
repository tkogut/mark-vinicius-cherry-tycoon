import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { FarmOverview, GameError } from '@/declarations/backend.did';

export const FARM_OVERVIEW_KEY = ['farmOverview'];

export function useFarmOverview() {
    const { backendActor } = useAuth();

    return useQuery({
        queryKey: FARM_OVERVIEW_KEY,
        queryFn: async (): Promise<FarmOverview> => {
            console.log('[useFarmOverview] Fetching farm overview...');
            if (!backendActor) {
                throw new Error('Not authenticated');
            }
            const result = await backendActor.getFarmOverview();

            if ('Err' in result) {
                console.error('[useFarmOverview] Failed:', result.Err);
                throw new Error('Failed to fetch farm overview');
            }

            console.log('[useFarmOverview] Received:', result.Ok);
            return result.Ok;
        },
        enabled: !!backendActor,
        refetchInterval: 1000 * 30, // Poll every 30s
    });
}
