// Two-sector visual harness for ImperialOrchard.
//
// ImperialOrchard is fully prop-driven (sectorsCount === parcels.length), so a
// multi-sector orchard needs no backend, no auth and no canister — which is the
// only practical way to eyeball the inter-sector BRIDGE: the live test account
// owns a single parcel, and the bridge entity only exists when
// `s < sectorsCount - 1`.
//
// Dev-only: reached via `frontend/harness.html`, which is NOT in the production
// Vite build inputs. Run `npm run dev` and open /harness.html.
//
// Usage: /harness.html?sectors=2&season=Summer&trees=120

import React from 'react';
import { createRoot } from 'react-dom/client';
import { ImperialOrchard } from '../components/farm/ImperialOrchard';
import '../index.css';

const params = new URLSearchParams(window.location.search);
const sectors = Math.max(1, Math.min(6, Number(params.get('sectors') ?? 2)));
const seasonName = params.get('season') ?? 'Summer';
const plantedTrees = Number(params.get('trees') ?? 140);

/** Mock parcel matching the shape ImperialOrchard reads (id/size/plantedTrees/soil). */
const makeParcel = (i: number) => ({
    id: `harness-parcel-${i + 1}`,
    size: 0.5,
    plantedTrees,
    quality: 0.8,
    humidity: 0.45 + i * 0.1,
    fertility: 0.55 + i * 0.05,
    isHarvested: false,
});

const parcels = Array.from({ length: sectors }, (_, i) => makeParcel(i));

const App = () => (
    <div style={{ width: '100vw', height: '100vh', background: '#140e0c' }}>
        <div style={{ position: 'fixed', top: 8, left: 8, zIndex: 9999, font: '12px monospace', color: '#C9A84C' }}>
            harness — sectors: {sectors} · season: {seasonName} · trees/parcel: {plantedTrees}
        </div>
        <ImperialOrchard
            parcels={parcels}
            season={{ [seasonName]: null }}
            hiredLabor={[{ id: 'harness-helper', role: 'picker' }]}
            county="Opolski"
            onAction={(action, parcelId) => console.log('[harness] action', action, parcelId)}
            automationConfig={{ hasHarvesters: true, hasTractor: true, hasSprayer: true, hasPruner: true }}
            totalCherries={2400}
            maxCapacity={10000}
            seasonNumber={3}
        />
    </div>
);

createRoot(document.getElementById('root')!).render(<App />);
