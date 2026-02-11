import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import { createBackendActor } from '@/api/actor';
import { _SERVICE } from '@/declarations/backend.did';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
    isAuthenticated: boolean;
    identity: Identity | null;
    backendActor: _SERVICE | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    client: AuthClient | null;
    initTestMode: () => Promise<void>; // For development testing
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [client, setClient] = useState<AuthClient | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [identity, setIdentity] = useState<Identity | null>(null);
    const [backendActor, setBackendActor] = useState<_SERVICE | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        console.log('[AuthContext] Initializing AuthClient...');
        AuthClient.create().then(async (client) => {
            console.log('[AuthContext] AuthClient created successfully');
            setClient(client);

            const isAuth = await client.isAuthenticated();
            const id = client.getIdentity();
            setIdentity(id);

            console.log('[AuthContext] Creating backend actor...');
            const actor = await createBackendActor(id);
            console.log('[AuthContext] Backend actor created:', actor ? 'SUCCESS' : 'FAILED');

            setBackendActor(actor);
            // ONLY set isAuthenticated after we have the actor
            setIsAuthenticated(isAuth);

            console.log('[AuthContext] Initialization complete. Connected:', !!actor, 'Authenticated:', isAuth);
        }).catch((error) => {
            console.error('[AuthContext] Failed to initialize:', error);
        });
    }, []);

    const login = async () => {
        if (!client) {
            console.warn('[AuthContext] Login called but client not initialized');
            return;
        }
        console.log('[AuthContext] Starting login flow...');
        await new Promise<void>((resolve, reject) => {
            client.login({
                identityProvider: import.meta.env.DEV
                    ? `http://127.0.0.1:4943?canisterId=${import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY}`
                    : 'https://identity.ic0.app',
                onSuccess: async () => {
                    console.log('[AuthContext] Login successful');
                    const id = client.getIdentity();
                    setIdentity(id);

                    console.log('[AuthContext] Creating authenticated backend actor...');
                    const actor = await createBackendActor(id);
                    console.log('[AuthContext] Authenticated actor created:', actor ? 'SUCCESS' : 'FAILED');

                    setBackendActor(actor);
                    // ONLY set isAuthenticated after we have the actor
                    setIsAuthenticated(true);
                    resolve();
                },
                onError: (err) => {
                    console.error('[AuthContext] Login failed:', err);
                    reject(err);
                },
            });
        });
    };

    const logout = async () => {
        if (!client) {
            console.warn('[AuthContext] Logout called but client not initialized');
            return;
        }
        console.log('[AuthContext] Starting logout flow...');
        await client.logout();
        console.log('[AuthContext] Logout successful');
        setIsAuthenticated(false);
        setIdentity(null);
        console.log('[AuthContext] Creating anonymous backend actor...');
        const actor = await createBackendActor();
        console.log('[AuthContext] Anonymous actor created:', actor ? 'SUCCESS' : 'FAILED');
        setBackendActor(actor);
    };

    const initTestMode = async () => {
        console.log('[AuthContext] Initializing TEST MODE (dev only)...');
        if (!import.meta.env.DEV) {
            console.error('[AuthContext] Test mode only available in development!');
            return;
        }

        if (!client) {
            console.warn('[AuthContext] Client not initialized yet');
            return;
        }

        try {
            // Set authenticated immediately to provide UI feedback
            setIsAuthenticated(true);

            // Use anonymous identity for testing
            const anonymousIdentity = client.getIdentity();
            console.log('[AuthContext] Using identity:', anonymousIdentity.getPrincipal().toText());
            setIdentity(anonymousIdentity);

            console.log('[AuthContext] Creating backend actor for test mode...');
            const actor = await createBackendActor(anonymousIdentity);
            console.log('[AuthContext] Test mode actor created:', actor ? 'SUCCESS' : 'FAILED');
            // Set backend actor
            if (actor) {
                setBackendActor(actor);
                console.log('[AuthContext] Test mode actor set successfully');
            }
        } catch (error) {
            console.error('[AuthContext] Test mode initialization failed:', error);
            setIsAuthenticated(false); // Revert if it failed
            alert("Test mode failed to initialize. Check console for details.");
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, identity, backendActor, login, logout, client, initTestMode }}>
            {children}
        </AuthContext.Provider>
    );
};
