// Shared provider wrappers for tests.
//
// Lives under `src/` (not a top-level `test/` dir) on purpose: tsconfig's
// `include` is `["src"]` and `paths` maps `@/*` -> `./src/*`, so keeping it here
// means (a) `npm run build`'s tsc pass typechecks it, catching drift when the
// real provider tree changes, and (b) tests import it as `@/test-utils/...`
// with no extra alias.
//
// Why this exists: `AuthProvider` calls `useQueryClient()`, so it throws
// "No QueryClient set" unless it is nested inside a `QueryClientProvider`.
// Every test that rendered `<AuthProvider>` directly failed on that. The real
// app wires both in `main.tsx`; the dev harnesses
// (`src/dev/marketplaceHarness.tsx`) had to reproduce the same pairing. This is
// that pairing, in one place.

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';

/**
 * A QueryClient tuned for tests: no retries (a failing query should fail the
 * test immediately instead of burning the timeout) and no background refetching.
 * Build a fresh one per test so cached data cannot leak between tests.
 */
export function createTestQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, refetchOnWindowFocus: false, gcTime: 0 },
            mutations: { retry: false },
        },
    });
}

/** Wrapper with only React Query — for hooks that need a QueryClient but not auth. */
export function createQueryWrapper() {
    const queryClient = createTestQueryClient();
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}

/**
 * Wrapper mirroring the real app's provider order from `main.tsx`:
 * QueryClientProvider > AuthProvider. Use for anything touching `useAuth`.
 */
export function createAuthWrapper() {
    const queryClient = createTestQueryClient();
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    );
}
