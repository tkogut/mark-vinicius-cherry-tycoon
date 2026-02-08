// Backend types matching Motoko canister
export type Province =
    | 'Opolskie' | 'Lubelskie' | 'Mazowieckie' | 'Podkarpackie'
    | 'Wielkopolskie' | 'Dolnoslaskie' | 'Slaskie' | 'Malopolskie'
    | 'Lodzkie' | 'Kujawsko-Pomorskie' | 'Pomorskie' | 'Zachodniopomorskie'
    | 'Warminsko-Mazurskie' | 'Podlaskie' | 'Lubuskie' | 'Swietokrzyskie';

export type SoilType = 'SandyClay' | 'Clay' | 'Sandy' | 'Waterlogged';

export type CommuneType = 'Urban' | 'Rural' | 'Mixed';

export type InfrastructureType =
    | 'SocialFacilities' | 'Warehouse' | 'ColdStorage'
    | 'Tractor' | 'Shaker' | 'Sprayer' | 'ProcessingFacility';

export interface Region {
    province: Province;
    county: string;
    commune: string;
    communeType: CommuneType;
    population: number;
    marketSize: number;
    laborCostMultiplier: number;
}

export interface CherryParcel {
    id: string;
    ownerId: string;
    region: Region;
    soilType: SoilType;
    pH: number;
    fertility: number;
    permeability: number;
    humidity: number;
    size: number;
    plantedTrees: number;
    treeAge: number;
    isOrganic: boolean;
    organicConversionSeason: number;
    organicCertified: boolean;
    lastHarvest: number;
    quality: number;
    waterLevel: number;
    lastFertilized: number;
}

export interface Infrastructure {
    infraType: InfrastructureType;
    level: number;
    purchasedSeason: number;
}

export interface Inventory {
    cherries: number;
    organicCherries: number;
    fertilizers: number;
    pesticides: number;
    organicTreatments: number;
}

export interface Statistics {
    totalHarvested: number;
    totalSold: number;
    totalRevenue: number;
    totalCosts: number;
    averagePrice: number;
}

export interface PlayerFarm {
    playerId: string;
    playerName: string;
    parcels: CherryParcel[];
    infrastructure: Infrastructure[];
    inventory: Inventory;
    statistics: Statistics;
    cash: number;
    level: number;
    experience: number;
    seasonNumber: number;
    currentSeason: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
}

export type Result<T, E> =
    | { Ok: T }
    | { Err: E };
