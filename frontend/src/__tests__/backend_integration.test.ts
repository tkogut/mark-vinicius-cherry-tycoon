// LAYER 3 (live-canister integration) — NOT a unit test.
//
// This file talks to a real replica over HTTP. It used to run as part of the
// default Vitest suite, where it could only ever fail: no replica listens
// during a normal `npm test`, and the canister ID below was hardcoded to a
// value that no longer matches a fresh `dfx deploy`. That single always-red
// file is a large part of why the suite was ignored.
//
// It now self-skips unless RUN_INTEGRATION is set, so it stays VISIBLE in the
// report as skipped (rather than being silently excluded by config) and is
// opt-in via:
//
//   dfx start --background && dfx deploy backend
//   npm run test:integration          # sets RUN_INTEGRATION=1
//
// Canister ID and host are read from the environment so the file does not go
// stale again; the defaults match a stock local `dfx` setup.
import { describe, it, expect, beforeAll } from 'vitest';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '../declarations/backend.did.js';
import { _SERVICE } from '../declarations/backend.did';

const RUN_INTEGRATION = !!process.env.RUN_INTEGRATION;

const canisterId =
    process.env.BACKEND_CANISTER_ID ?? 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
const host = process.env.DFX_HOST ?? 'http://127.0.0.1:4943';

describe.skipIf(!RUN_INTEGRATION)('Backend Integration (L3 — needs a live replica)', () => {
    let actor: _SERVICE;

    beforeAll(async () => {
        const agent = new HttpAgent({ host });
        // Root key is required for local testing
        await agent.fetchRootKey();

        actor = Actor.createActor<_SERVICE>(idlFactory, {
            agent,
            canisterId,
        });
    });

    it('should initialize a player', async () => {
        const result = await actor.initializePlayer('vitest_user', 'Vitest Farmer');
        // We expect #Ok or an error saying player already initialized
        if ('Ok' in result) {
            expect(result.Ok).toBeDefined();
        } else {
            // result.Err is now GameError variant
            if ('AlreadyExists' in result.Err) {
                expect(result.Err.AlreadyExists).toMatch(/already initialized/i);
            } else {
                // Fail on unexpected errors
                throw new Error('Unexpected error during initialization: ' + JSON.stringify(result.Err));
            }
        }
    });

    it('should retrieve player farm', async () => {
        const farmResult = await actor.getPlayerFarm();
        if ('Ok' in farmResult) {
            expect(farmResult.Ok.owner).toBeDefined();
            expect(farmResult.Ok.parcels.length).toBeGreaterThan(0);
        } else {
            throw new Error('Failed to retrieve farm: ' + farmResult.Err);
        }
    });

    it('should list market prices', async () => {
        const farmResult = await actor.getPlayerFarm();
        if ('Ok' in farmResult) {
            expect(farmResult.Ok.cash).toBeDefined();
        } else {
            throw new Error('Failed to retrieve farm for cash check');
        }
    });
});
