// @vitest-environment node
//
// DEPLOY-01 — which network does a deployed bundle believe it is on?
//
// `vite.config.ts` used to define `import.meta.env.VITE_DFX_NETWORK` as
// `process.env.DFX_NETWORK || "local"`, while both deploy workflows set only
// `VITE_DFX_NETWORK` (`playground` / `ic`). Every deployed build therefore said "local": the app
// took the local agent path (fetchRootKey, window.location.origin as host) on Playground, and a
// mainnet build would have taken AuthContext's auto-login bypass (`network !== 'ic'`).
//
// This test loads the REAL vite config under the environment each workflow sets and reads back
// the constants it defines, so it fails on the config, not on a copy of the expression.

import { describe, it, expect, afterEach } from 'vitest';
import { loadConfigFromFile } from 'vite';
import { resolve } from 'node:path';

const CONFIG = resolve(__dirname, '../../vite.config.ts');
const KEYS = ['DFX_NETWORK', 'VITE_DFX_NETWORK'] as const;
const saved: Record<string, string | undefined> = {};
for (const k of KEYS) saved[k] = process.env[k];

afterEach(() => {
    for (const k of KEYS) {
        if (saved[k] === undefined) delete process.env[k];
        else process.env[k] = saved[k];
    }
});

async function definedNetworks(env: Partial<Record<(typeof KEYS)[number], string>>) {
    for (const k of KEYS) delete process.env[k];
    Object.assign(process.env, env);
    const loaded = await loadConfigFromFile({ command: 'build', mode: 'production' }, CONFIG);
    const define = (loaded?.config.define ?? {}) as Record<string, string>;
    return {
        app: define['import.meta.env.VITE_DFX_NETWORK'],
        badge: define['__BUILD_NETWORK__'],
    };
}

describe('the network a build is defined for (DEPLOY-01)', () => {
    it.each([
        ['deploy-playground.yml sets only VITE_DFX_NETWORK=playground', 'playground', { VITE_DFX_NETWORK: 'playground' }],
        ['deploy-mainnet.yml sets only VITE_DFX_NETWORK=ic', 'ic', { VITE_DFX_NETWORK: 'ic' }],
        ['dfx sets DFX_NETWORK=ic', 'ic', { DFX_NETWORK: 'ic' }],
        ['no variable at all (a plain local build)', 'local', {}],
        ['both set: DFX_NETWORK wins, as in the top-of-file constant', 'ic', { DFX_NETWORK: 'ic', VITE_DFX_NETWORK: 'playground' }],
    ] as const)('%s -> "%s"', async (_name, expected, env) => {
        const { app, badge } = await definedNetworks(env);
        expect(app, 'import.meta.env.VITE_DFX_NETWORK as the app reads it').toBe(JSON.stringify(expected));
        expect(badge, 'the badge must agree with the app').toBe(JSON.stringify(expected));
    });
});
