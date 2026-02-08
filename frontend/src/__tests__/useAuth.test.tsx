import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';

// Mock the auth client
vi.mock('@dfinity/auth-client');
vi.mock('@/api/actor', () => ({
    createBackendActor: vi.fn().mockResolvedValue({
        getPlayerFarm: vi.fn(),
        plantTrees: vi.fn(),
    }),
}));

describe('useAuth', () => {
    let mockAuthClient: any;
    let mockIdentity: Identity;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Create mock identity
        mockIdentity = {
            getPrincipal: vi.fn().mockReturnValue({ toText: () => 'mock-principal' }),
        } as any;

        // Create mock auth client
        mockAuthClient = {
            isAuthenticated: vi.fn().mockResolvedValue(false),
            getIdentity: vi.fn().mockReturnValue(mockIdentity),
            login: vi.fn(),
            logout: vi.fn().mockResolvedValue(undefined),
        };

        // Mock AuthClient.create
        (AuthClient.create as any).mockResolvedValue(mockAuthClient);
    });

    it('should initialize with unauthenticated state', async () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>,
        });

        await waitFor(() => {
            expect(result.current.client).toBeTruthy();
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.identity).toBeTruthy();
        expect(result.current.backendActor).toBeTruthy();
    });

    it('should initialize with authenticated state if already logged in', async () => {
        mockAuthClient.isAuthenticated.mockResolvedValue(true);

        const { result } = renderHook(() => useAuth(), {
            wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
        });

        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
        });

        expect(result.current.identity).toBeTruthy();
        expect(result.current.backendActor).toBeTruthy();
    });

    it('should handle login successfully', async () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
        });

        await waitFor(() => {
            expect(result.current.client).toBeTruthy();
        });

        // Mock successful login
        mockAuthClient.login.mockImplementation((options: any) => {
            options.onSuccess();
            return Promise.resolve();
        });

        await result.current.login();

        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
        });

        expect(mockAuthClient.login).toHaveBeenCalled();
    });

    it('should handle login error', async () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
        });

        await waitFor(() => {
            expect(result.current.client).toBeTruthy();
        });

        const mockError = new Error('Login failed');
        mockAuthClient.login.mockImplementation((options: any) => {
            options.onError(mockError);
            return Promise.reject(mockError);
        });

        await expect(result.current.login()).rejects.toThrow('Login failed');
    });

    it('should handle logout successfully', async () => {
        mockAuthClient.isAuthenticated.mockResolvedValue(true);

        const { result } = renderHook(() => useAuth(), {
            wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
        });

        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
        });

        await result.current.logout();

        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(false);
        });

        expect(mockAuthClient.logout).toHaveBeenCalled();
        expect(result.current.identity).toBeNull();
    });

    it('should throw error when used outside AuthProvider', () => {
        expect(() => {
            renderHook(() => useAuth());
        }).toThrow('useAuth must be used within an AuthProvider');
    });
});
