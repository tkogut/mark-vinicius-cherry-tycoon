import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { createActor } from '../lib/actor';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5000,
        },
    },
});

interface BackendProviderProps {
    children: ReactNode;
}

export const BackendProvider = ({ children }: BackendProviderProps) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initActor = async () => {
            try {
                await createActor();
                setIsInitialized(true);
            } catch (err) {
                console.error('Failed to initialize actor:', err);
                setError(err instanceof Error ? err.message : 'Failed to connect to backend');
            }
        };

        initActor();
    }, []);

    if (error) {
        return (
            <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-red-900 mb-2">Connection Error</h1>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🍒</div>
                    <h1 className="text-2xl font-bold text-emerald-900 mb-2">Loading Cherry Tycoon...</h1>
                    <p className="text-emerald-600">Connecting to Internet Computer</p>
                </div>
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};
