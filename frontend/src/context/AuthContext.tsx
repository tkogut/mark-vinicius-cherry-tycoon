import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import { createBackendActor } from '@/api/actor';
import { _SERVICE } from '@/declarations/backend.did';

interface AuthContextType {
    isAuthenticated: boolean;
    identity: Identity | null;
    backendActor: _SERVICE | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    client: AuthClient | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [client, setClient] = useState<AuthClient | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [identity, setIdentity] = useState<Identity | null>(null);
    const [backendActor, setBackendActor] = useState<_SERVICE | null>(null);

    useEffect(() => {
        AuthClient.create().then(async (client) => {
            setClient(client);
            const isAuth = await client.isAuthenticated();
            setIsAuthenticated(isAuth);
            const id = client.getIdentity();
            setIdentity(id);
            const actor = await createBackendActor(id);
            setBackendActor(actor);
        });
    }, []);

    const login = async () => {
        if (!client) return;
        await new Promise<void>((resolve, reject) => {
            client.login({
                identityProvider: import.meta.env.DEV
                    ? `http://127.0.0.1:4943?canisterId=${import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY}`
                    : 'https://identity.ic0.app',
                onSuccess: async () => {
                    setIsAuthenticated(true);
                    const id = client.getIdentity();
                    setIdentity(id);
                    const actor = await createBackendActor(id);
                    setBackendActor(actor);
                    resolve();
                },
                onError: (err) => reject(err),
            });
        });
    };

    const logout = async () => {
        if (!client) return;
        await client.logout();
        setIsAuthenticated(false);
        setIdentity(null);
        const actor = await createBackendActor();
        setBackendActor(actor);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, identity, backendActor, login, logout, client }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
