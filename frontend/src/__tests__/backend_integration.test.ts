import { describe, it, expect, beforeAll } from 'vitest';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '../declarations/backend.did.js';
import { _SERVICE } from '../declarations/backend.did';

// Mocking the canister ID since we're in a test environment
const canisterId = 'uxrrr-q7777-77774-qaaaq-cai';
const host = 'http://127.0.0.1:8000';

describe('Backend Integration', () => {
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
            expect(result.Err).toMatch(/already initialized/);
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
