import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CherryParcel {
  'id' : string,
  'pH' : number,
  'region' : Region,
  'lastFertilized' : bigint,
  'soilType' : SoilType,
  'organicConversionSeason' : bigint,
  'isOrganic' : boolean,
  'ownerId' : string,
  'waterLevel' : number,
  'fertility' : number,
  'quality' : bigint,
  'permeability' : number,
  'size' : number,
  'lastHarvest' : bigint,
  'organicCertified' : boolean,
  'humidity' : number,
  'plantedTrees' : bigint,
  'treeAge' : bigint,
}
export type CommuneType = { 'Urban' : null } |
  { 'Rural' : null } |
  { 'Mixed' : null };
export interface Infrastructure {
  'purchasedSeason' : bigint,
  'infraType' : InfrastructureType,
  'maintenanceCost' : bigint,
  'level' : bigint,
}
export type InfrastructureType = { 'Sprayer' : null } |
  { 'Shaker' : null } |
  { 'Tractor' : null } |
  { 'Warehouse' : null } |
  { 'ColdStorage' : null } |
  { 'ProcessingFacility' : null } |
  { 'SocialFacilities' : null };
export interface Inventory {
  'fertilizers' : bigint,
  'pesticides' : bigint,
  'organicCherries' : bigint,
  'cherries' : bigint,
  'organicTreatments' : bigint,
}
export interface PlayerFarm {
  'owner' : Principal,
  'cash' : bigint,
  'currentSeason' : Season,
  'playerId' : string,
  'inventory' : Inventory,
  'reputation' : bigint,
  'level' : bigint,
  'experience' : bigint,
  'seasonNumber' : bigint,
  'infrastructure' : Array<Infrastructure>,
  'playerName' : string,
  'parcels' : Array<CherryParcel>,
  'lastActive' : Time,
  'statistics' : Statistics,
}
export type Province = { 'Swietokrzyskie' : null } |
  { 'Warminsko_Mazurskie' : null } |
  { 'Podlaskie' : null } |
  { 'Kujawsko_Pomorskie' : null } |
  { 'Malopolskie' : null } |
  { 'Lubelskie' : null } |
  { 'Lodzkie' : null } |
  { 'Wielkopolskie' : null } |
  { 'Mazowieckie' : null } |
  { 'Opolskie' : null } |
  { 'Pomorskie' : null } |
  { 'Podkarpackie' : null } |
  { 'Slaskie' : null } |
  { 'Lubuskie' : null } |
  { 'Zachodniopomorskie' : null } |
  { 'Dolnoslaskie' : null };
export interface Region {
  'laborCostMultiplier' : number,
  'marketSize' : number,
  'province' : Province,
  'commune' : string,
  'communeType' : CommuneType,
  'county' : string,
  'population' : bigint,
}
export type Result = { 'Ok' : string } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : Statistics } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : PlayerFarm } |
  { 'Err' : string };
export type Result_4 = { 'Ok' : Inventory } |
  { 'Err' : string };
export type Season = { 'Winter' : null } |
  { 'Autumn' : null } |
  { 'Summer' : null } |
  { 'Spring' : null };
export type SoilType = { 'Sandy' : null } |
  { 'Clay' : null } |
  { 'Waterlogged' : null } |
  { 'SandyClay' : null };
export interface Statistics {
  'totalCosts' : bigint,
  'totalHarvested' : bigint,
  'totalSold' : bigint,
  'averageYieldPerHa' : number,
  'bestSeasonProfit' : bigint,
  'seasonsPlayed' : bigint,
  'totalRevenue' : bigint,
}
export type Time = bigint;
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface _SERVICE {
  '_initializeAccessControlWithSecret' : ActorMethod<[string], undefined>,
  'advanceSeason' : ActorMethod<[[] | [string]], Result>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'assignParcelToPlayer' : ActorMethod<[string, string], Result>,
  'buyParcel' : ActorMethod<[string, bigint], Result>,
  'fertilizeParcel' : ActorMethod<[string, string], Result>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getCashBalance' : ActorMethod<[], Result_1>,
  'getGlobalSeason' : ActorMethod<[], bigint>,
  'getInventory' : ActorMethod<[], Result_4>,
  'getPlayerFarm' : ActorMethod<[], Result_3>,
  'getPlayerStats' : ActorMethod<[], Result_2>,
  'getTotalPlayers' : ActorMethod<[], bigint>,
  'harvestCherries' : ActorMethod<[string], Result_1>,
  'initializePlayer' : ActorMethod<[string, string], Result>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'plantTrees' : ActorMethod<[string, bigint], Result>,
  'purchaseParcel' : ActorMethod<[Province, number], Result>,
  'sellCherries' : ActorMethod<[bigint, string], Result_1>,
  'startOrganicConversion' : ActorMethod<[string], Result>,
  'upgradeInfrastructure' : ActorMethod<[string], Result>,
  'waterParcel' : ActorMethod<[string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
