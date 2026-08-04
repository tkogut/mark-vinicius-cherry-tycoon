// Visual harness for Marketplace — real component, mocked cash/infrastructure/
// season, no backend/canister required. Mirrors main.tsx's real provider
// wrapping (QueryClientProvider + AuthProvider) since Marketplace's
// useStability() hook needs both in the tree, but AuthProvider defaults to
// unauthenticated/no backendActor when there's nothing to log into, so
// useStability's query just stays disabled — no network calls happen.
//
// Dev-only: reached via `frontend/marketplace-harness.html`, which is NOT in
// the production Vite build inputs. Run `npm run dev` and open
// /marketplace-harness.html?season=Winter&phase=Investment

import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { Marketplace } from '../components/farm/Marketplace';
import '../index.css';

const params = new URLSearchParams(window.location.search);
const seasonName = params.get('season') ?? 'Spring';
const phaseName = params.get('phase') ?? 'Investment';
const cash = BigInt(params.get('cash') ?? '80000');

const queryClient = new QueryClient();

const App = () => (
    <div style={{ width: '100vw', minHeight: '100vh', background: '#0a0a0d' }}>
        <div style={{ position: 'fixed', top: 8, left: 8, zIndex: 9999, font: '12px monospace', color: '#C9A84C', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 6 }}>
            harness — season: {seasonName} · phase: {phaseName} · cash: {cash.toString()}
        </div>
        <Marketplace
            cash={cash}
            ownedInfrastructure={[]}
            onPurchase={(id) => console.log('[harness] purchase', id)}
            isLoading={false}
            currentPhase={phaseName}
            season={{ [seasonName]: null }}
        />
    </div>
);

createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <App />
        </AuthProvider>
    </QueryClientProvider>
);
