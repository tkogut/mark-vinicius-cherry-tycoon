// Visual harness for ParcelCard — real component, mocked parcel/infrastructure/
// season, no backend/canister required. ParcelCard is fully prop-driven (see
// its props interface) so it needs no AuthProvider/QueryClientProvider, unlike
// marketplaceHarness.tsx's Marketplace.
//
// Built for plan 03-07 (ECON-01) Task 3 — a real-browser check of the
// fertilizer-type picker on the parcel-card entry point, specifically the
// long-text backstop (label/caption wrapping and truncation) that a jsdom
// component test cannot observe.
//
// Dev-only: reached via `frontend/parcel-card-harness.html`, which is NOT in
// the production Vite build inputs. Run `npm run dev` and open
// /parcel-card-harness.html?organic=true&phase=Growth&season=Summer

import React from 'react';
import { createRoot } from 'react-dom/client';
import { ParcelCard } from '../components/farm/ParcelCard';
import { CherryParcel } from '../declarations/backend.did';
import '../index.css';

const params = new URLSearchParams(window.location.search);
const isOrganic = params.get('organic') === 'true';
const phaseName = params.get('phase') ?? 'Growth';
const seasonName = params.get('season') ?? 'Summer';

/** Minimal CherryParcel fixture — mirrors fertilizerPicker.test.tsx's makeParcel. */
const parcel: CherryParcel = {
    id: 'harness-parcel-1',
    pH: 6.5,
    region: {
        laborCostMultiplier: 1,
        marketSize: 1,
        province: { Opolskie: null },
        commune: 'Testowo',
        communeType: { Rural: null },
        county: 'Opole',
        population: 1000n,
    },
    lastFertilized: 0n,
    soilType: { SandyClay: null },
    organicConversionSeason: 0n,
    isOrganic,
    ownerId: 'owner',
    waterLevel: 0.5,
    fertility: 0.7,
    quality: 80n,
    permeability: 0.5,
    size: 0.5,
    lastHarvest: 0n,
    organicCertified: false,
    humidity: 0.5,
    plantedTrees: 100n,
    treeAge: 5n,
} as unknown as CherryParcel;

// Exported (even though nothing imports it) so react-refresh's
// only-export-components rule doesn't flag this file — an entry point with a
// component but zero exports can't do fast-refresh's partial reload, but the
// warning is avoidable and this plan's lint ceiling (182) is not raised to
// absorb it, unlike orchardHarness.tsx/marketplaceHarness.tsx's pre-existing
// unexported-App instances of the same warning (out of scope here).
export const App = () => (
    <div style={{ width: '100vw', minHeight: '100vh', background: '#0a0a0d', padding: 40 }}>
        <div style={{ position: 'fixed', top: 8, left: 8, zIndex: 9999, font: '12px monospace', color: '#C9A84C', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 6 }}>
            harness — organic: {String(isOrganic)} · phase: {phaseName} · season: {seasonName}
        </div>
        <div style={{ maxWidth: 380 }}>
            <ParcelCard
                parcel={parcel}
                onAction={(action, parcelId, fertilizerType) => console.log('[harness] action', action, parcelId, fertilizerType)}
                currentSeason={{ [seasonName]: null }}
                infrastructure={[]}
                currentPhase={phaseName}
            />
        </div>
    </div>
);

createRoot(document.getElementById('root')!).render(<App />);
