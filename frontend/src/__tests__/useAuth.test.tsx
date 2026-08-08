// Auth regression suite.
//
// REWRITTEN 2026-08-06. The previous version failed 5/6 for two independent
// reasons:
//   1. It rendered `<AuthProvider>` with no `QueryClientProvider` above it, but
//      AuthProvider calls `useQueryClient()` -> every test threw
//      "No QueryClient set". Now uses the shared `createAuthWrapper()`, which
//      mirrors the real provider order in `main.tsx`.
//   2. Its assertions no longer matched the component. AuthProvider has since
//      grown an AUTO-LOGIN BYPASS for any network other than 'ic' (it mints an
//      Ed25519 session identity) plus an anonymous-actor path for 'ic'. The old
//      "unauthenticated" test asserted `isAuthenticated === false` AND
//      `identity` truthy AND `backendActor` truthy simultaneously — a state no
//      single branch of the current code produces. Tests are now written per
//      branch, with `VITE_DFX_NETWORK` stubbed to select the branch explicitly.
//
// The centrepiece is the ATOMIC AUTH invariant (see CLAUDE.md / AUTH-01):
// `isAuthenticated` must only ever become true once `backendActor` is non-null.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { createAuthWrapper } from '@/test-utils/providers';

const mocks = vi.hoisted(() => ({
    authClientCreate: vi.fn(),
    createBackendActor: vi.fn(),
    generateIdentity: vi.fn(),
}));

vi.mock('@dfinity/auth-client', () => ({
    AuthClient: { create: mocks.authClientCreate },
}));
vi.mock('@/api/actor', () => ({
    createBackendActor: mocks.createBackendActor,
}));
// AuthProvider reaches for this via a dynamic `await import()` on the
// auto-login path, so it has to be mocked too or the real crypto runs.
vi.mock('@dfinity/identity', () => ({
    Ed25519KeyIdentity: { generate: mocks.generateIdentity },
}));

/** Minimal stand-in for an @dfinity Identity. */
const makeIdentity = (principal: string) => ({
    getPrincipal: () => ({ toText: () => principal }),
}) as any;

/**
 * The subset of `AuthClient.login`'s options that AuthProvider actually calls.
 * Typed rather than `any` so the mocks stay honest about the callback contract
 * (and so this file does not spend ratchet budget on avoidable `any`s).
 */
interface LoginOptions {
    onSuccess: () => void | Promise<void>;
    onError: (err?: unknown) => void;
}

/** Minimal stand-in for the backend actor — presence/absence is what matters here. */
const makeActor = () => ({ getPlayerFarm: vi.fn(), plantTrees: vi.fn() }) as any;

let mockAuthClient: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    getIdentity: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
    vi.clearAllMocks();

    mockAuthClient = {
        isAuthenticated: vi.fn().mockResolvedValue(false),
        getIdentity: vi.fn().mockReturnValue(makeIdentity('stored-principal')),
        login: vi.fn(),
        logout: vi.fn().mockResolvedValue(undefined),
    };

    mocks.authClientCreate.mockResolvedValue(mockAuthClient);
    mocks.createBackendActor.mockResolvedValue(makeActor());
    mocks.generateIdentity.mockReturnValue(makeIdentity('session-principal'));
});

afterEach(() => {
    vi.unstubAllEnvs();
});

/** Renders the hook and waits for AuthProvider's init effect to settle. */
async function renderSettled() {
    const view = renderHook(() => useAuth(), { wrapper: createAuthWrapper() });
    await waitFor(() => expect(view.result.current.isInitializing).toBe(false));
    return view;
}

describe('useAuth — initialization on mainnet (VITE_DFX_NETWORK="ic")', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_DFX_NETWORK', 'ic');
    });

    it('falls back to an anonymous actor when the user is not logged in', async () => {
        mockAuthClient.isAuthenticated.mockResolvedValue(false);

        const { result } = await renderSettled();

        // Anonymous is explicitly NOT "authenticated" in this game's logic, but
        // an actor still exists so unauthenticated queries can be made.
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.backendActor).toBeTruthy();
        expect(result.current.identity).toBeNull();
        expect(mocks.createBackendActor).toHaveBeenCalledWith();
    });

    it('restores an authenticated session when the user is already logged in', async () => {
        mockAuthClient.isAuthenticated.mockResolvedValue(true);

        const { result } = await renderSettled();

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.backendActor).toBeTruthy();
        expect(result.current.identity).toBeTruthy();
    });

    it('does NOT auto-login on mainnet (bypass is local/playground only)', async () => {
        mockAuthClient.isAuthenticated.mockResolvedValue(false);

        await renderSettled();

        expect(mocks.generateIdentity).not.toHaveBeenCalled();
    });
});

describe('useAuth — initialization off mainnet (auto-login bypass)', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_DFX_NETWORK', 'local');
    });

    it('mints a session identity and authenticates when no session exists', async () => {
        mockAuthClient.isAuthenticated.mockResolvedValue(false);

        const { result } = await renderSettled();

        expect(mocks.generateIdentity).toHaveBeenCalled();
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.backendActor).toBeTruthy();
        expect(result.current.identity).toBeTruthy();
    });

    // ATOMIC AUTH (AUTH-01) — the actual regression guard.
    it('keeps isAuthenticated false when the actor cannot be created', async () => {
        mockAuthClient.isAuthenticated.mockResolvedValue(false);
        mocks.createBackendActor.mockResolvedValue(null);

        const { result } = await renderSettled();

        expect(result.current.backendActor).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('falls back to an anonymous actor when minting the identity throws', async () => {
        mockAuthClient.isAuthenticated.mockResolvedValue(false);
        mocks.generateIdentity.mockImplementation(() => {
            throw new Error('keygen unavailable');
        });

        const { result } = await renderSettled();

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.backendActor).toBeTruthy();
    });
});

describe('useAuth — login / logout', () => {
    beforeEach(() => {
        // 'ic' keeps auto-login out of the way so login() is what's under test.
        vi.stubEnv('VITE_DFX_NETWORK', 'ic');
    });

    it('login() sets identity, actor and authenticated state', async () => {
        mockAuthClient.isAuthenticated.mockResolvedValue(false);
        mockAuthClient.login.mockImplementation(async (options: LoginOptions) => {
            await options.onSuccess();
        });

        const { result } = await renderSettled();
        await result.current.login();

        await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
        expect(result.current.backendActor).toBeTruthy();
        expect(result.current.identity).toBeTruthy();
        expect(mockAuthClient.login).toHaveBeenCalled();
    });

    it('login() rejects and stays unauthenticated when the flow errors', async () => {
        mockAuthClient.isAuthenticated.mockResolvedValue(false);
        const failure = new Error('Login failed');
        mockAuthClient.login.mockImplementation((options: LoginOptions) => {
            options.onError(failure);
        });

        const { result } = await renderSettled();

        await expect(result.current.login()).rejects.toThrow('Login failed');
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('logout() clears identity and drops back to an anonymous actor', async () => {
        mockAuthClient.isAuthenticated.mockResolvedValue(true);

        const { result } = await renderSettled();
        expect(result.current.isAuthenticated).toBe(true);

        await result.current.logout();

        await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
        expect(mockAuthClient.logout).toHaveBeenCalled();
        expect(result.current.identity).toBeNull();
        // A fresh anonymous actor replaces the authenticated one.
        expect(result.current.backendActor).toBeTruthy();
    });
});

describe('useAuth — contract', () => {
    it('throws when used outside AuthProvider', () => {
        expect(() => renderHook(() => useAuth())).toThrow(
            'useAuth must be used within an AuthProvider'
        );
    });
});

// ── Atomic Auth, asserted symmetrically across every entry path ─────────────
//
// The invariant (CLAUDE.md): `isAuthenticated` may only become true once
// `backendActor` is non-null. AUTH-01 fixed `initTestMode()`; AUTH-02 (fixed
// 2026-08-07) fixed the restored-session branch, which was the last one calling
// `setIsAuthenticated(true)` unconditionally. These tests cover every path that
// can flip the flag, so a future refactor cannot quietly reopen the hole in one
// branch while the others stay guarded — which is exactly how AUTH-02 survived
// AUTH-01.
//
// Note on reachability: `createBackendActor` currently either returns an actor
// or throws — it never returns null — so this is defence in depth rather than a
// live crash. It matters because every other branch already anticipates a falsy
// actor with `if (actor)`, so a refactor that makes the function return null on
// failure (a very natural change) would have broken only the unguarded branch.
describe('useAuth — Atomic Auth invariant (AUTH-01 / AUTH-02)', () => {
    it('restored session: a falsy actor must not produce isAuthenticated=true', async () => {
        vi.stubEnv('VITE_DFX_NETWORK', 'ic');
        mockAuthClient.isAuthenticated.mockResolvedValue(true);
        mocks.createBackendActor.mockResolvedValue(null);

        const { result } = await renderSettled();

        expect(result.current.backendActor).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('auto-login: a falsy actor must not produce isAuthenticated=true', async () => {
        vi.stubEnv('VITE_DFX_NETWORK', 'local');
        mockAuthClient.isAuthenticated.mockResolvedValue(false);
        mocks.createBackendActor.mockResolvedValue(null);

        const { result } = await renderSettled();

        expect(result.current.backendActor).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('login(): a falsy actor must not produce isAuthenticated=true', async () => {
        vi.stubEnv('VITE_DFX_NETWORK', 'ic');
        mockAuthClient.isAuthenticated.mockResolvedValue(false);

        const { result } = await renderSettled();

        mocks.createBackendActor.mockResolvedValue(null);
        mockAuthClient.login.mockImplementation(async (options: LoginOptions) => {
            await options.onSuccess();
        });
        await result.current.login();

        expect(result.current.isAuthenticated).toBe(false);
    });

    it('never reports authenticated while the actor is missing, on any path', async () => {
        // The invariant stated directly, over the matrix of entry conditions.
        for (const [network, alreadyAuthed] of [
            ['ic', true],
            ['ic', false],
            ['local', true],
            ['local', false],
        ] as const) {
            vi.stubEnv('VITE_DFX_NETWORK', network);
            mockAuthClient.isAuthenticated.mockResolvedValue(alreadyAuthed);
            mocks.createBackendActor.mockResolvedValue(null);

            const { result, unmount } = renderHook(() => useAuth(), { wrapper: createAuthWrapper() });
            await waitFor(() => expect(result.current.isInitializing).toBe(false));

            expect(
                result.current.isAuthenticated && result.current.backendActor === null,
                `Atomic Auth violated for network=${network}, alreadyAuthenticated=${alreadyAuthed}`
            ).toBe(false);

            unmount();
        }
    });
});
