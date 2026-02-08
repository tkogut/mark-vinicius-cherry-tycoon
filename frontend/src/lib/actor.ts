import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import type { PlayerFarm, Result, Province } from '../types/backend';

// Canister ID - will be set after deployment
const CANISTER_ID = process.env.VITE_BACKEND_CANISTER_ID || 'rrkah-fqaaa-aaaaa-aaaaq-cai';

// IDL interface for the backend canister
const idlFactory = ({ IDL }: any) => {
    const Province = IDL.Variant({
        'Opolskie': IDL.Null,
        'Lubelskie': IDL.Null,
        'Mazowieckie': IDL.Null,
        'Podkarpackie': IDL.Null,
        'Wielkopolskie': IDL.Null,
        'Dolnoslaskie': IDL.Null,
        'Slaskie': IDL.Null,
        'Malopolskie': IDL.Null,
        'Lodzkie': IDL.Null,
        'Kujawsko-Pomorskie': IDL.Null,
        'Pomorskie': IDL.Null,
        'Zachodniopomorskie': IDL.Null,
        'Warminsko-Mazurskie': IDL.Null,
        'Podlaskie': IDL.Null,
        'Lubuskie': IDL.Null,
        'Swietokrzyskie': IDL.Null,
    });

    const Result = (Ok: any, Err: any) => IDL.Variant({
        'Ok': Ok,
        'Err': Err,
    });

    return IDL.Service({
        // Player management
        'initializePlayer': IDL.Func([IDL.Text, IDL.Text], [Result(IDL.Text, IDL.Text)], []),
        'getPlayerFarm': IDL.Func([], [Result(IDL.Opt(IDL.Record({})), IDL.Text)], ['query']),
        'getCashBalance': IDL.Func([], [IDL.Nat], ['query']),
        'getInventory': IDL.Func([], [IDL.Record({})], ['query']),
        'getPlayerStats': IDL.Func([], [IDL.Record({})], ['query']),

        // Farm operations
        'harvestCherries': IDL.Func([IDL.Text], [Result(IDL.Nat, IDL.Text)], []),
        'waterParcel': IDL.Func([IDL.Text], [Result(IDL.Text, IDL.Text)], []),
        'fertilizeParcel': IDL.Func([IDL.Text], [Result(IDL.Text, IDL.Text)], []),
        'plantTrees': IDL.Func([IDL.Text, IDL.Nat], [Result(IDL.Text, IDL.Text)], []),

        // Market
        'sellCherries': IDL.Func([IDL.Nat, IDL.Text], [Result(IDL.Nat, IDL.Text)], []),

        // New Caffeine features
        'purchaseParcel': IDL.Func([Province, IDL.Float64], [Result(IDL.Text, IDL.Text)], []),
        'startOrganicConversion': IDL.Func([IDL.Text], [Result(IDL.Text, IDL.Text)], []),

        // Progression
        'advanceSeason': IDL.Func([IDL.Opt(IDL.Text)], [Result(IDL.Text, IDL.Text)], []),
        'upgradeInfrastructure': IDL.Func([IDL.Text], [Result(IDL.Text, IDL.Text)], []),
    });
};

export interface BackendActor {
    initializePlayer: (playerId: string, playerName: string) => Promise<Result<string, string>>;
    getPlayerFarm: () => Promise<Result<PlayerFarm | null, string>>;
    getCashBalance: () => Promise<number>;
    getInventory: () => Promise<any>;
    getPlayerStats: () => Promise<any>;
    harvestCherries: (parcelId: string) => Promise<Result<number, string>>;
    waterParcel: (parcelId: string) => Promise<Result<string, string>>;
    fertilizeParcel: (parcelId: string) => Promise<Result<string, string>>;
    plantTrees: (parcelId: string, quantity: number) => Promise<Result<string, string>>;
    sellCherries: (quantity: number, saleType: string) => Promise<Result<number, string>>;
    purchaseParcel: (province: Province, size: number) => Promise<Result<string, string>>;
    startOrganicConversion: (parcelId: string) => Promise<Result<string, string>>;
    advanceSeason: (weatherEvent?: string) => Promise<Result<string, string>>;
    upgradeInfrastructure: (infraType: string) => Promise<Result<string, string>>;
}

let actorInstance: BackendActor | null = null;

export const createActor = async (): Promise<BackendActor> => {
    if (actorInstance) {
        return actorInstance;
    }

    const isLocal = process.env.NODE_ENV !== 'production';
    const host = isLocal ? 'http://localhost:4943' : 'https://ic0.app';

    const agent = new HttpAgent({ host });

    // Fetch root key for local development
    if (isLocal) {
        await agent.fetchRootKey();
    }

    actorInstance = Actor.createActor(idlFactory, {
        agent,
        canisterId: CANISTER_ID,
    }) as BackendActor;

    return actorInstance;
};

export const getActor = (): BackendActor => {
    if (!actorInstance) {
        throw new Error('Actor not initialized. Call createActor() first.');
    }
    return actorInstance;
};
