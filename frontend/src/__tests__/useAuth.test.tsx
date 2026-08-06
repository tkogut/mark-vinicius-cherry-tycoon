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
        mockAuthClient.login.mockImplementation(async (options: any) => {
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
        mockAuthClient.login.mockImplementation((options: any) => {
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

describe('useAuth — known invariant gap (AUTH-02)', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_DFX_NETWORK', 'ic');
    });

    // Phase 1.1 / AUTH-01 fixed the Atomic Auth ordering in `initTestMode()`,
    // and the auto-login path guards with `if (actor)`. The
    // already-authenticated restore path did NOT get the same guard: it calls
    // `setIsAuthenticated(true)` unconditionally, so a failed actor creation
    // yields `isAuthenticated === true` with `backendActor === null` — exactly
    // the state the documented invariant forbids.
    //
    // Marked `.fails()` so it does not redden CI while the production fix is
    // scoped separately (flagged, not papered over, per CLAUDE.md). When the
    // guard is added, THIS test starts failing — that is the signal to delete
    // `.fails` and let it assert normally.
    it.fails('should keep isAuthenticated false if the restored session has no actor', async () => {
        mockAuthClient.isAuthenticated.mockResolvedValue(true);
        mocks.createBackendActor.mockResolvedValue(null);

        const { result } = await renderSettled();

        expect(result.current.backendActor).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });
});
