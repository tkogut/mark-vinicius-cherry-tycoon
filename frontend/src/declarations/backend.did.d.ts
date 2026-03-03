import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AICompetitorSummary {
  'id' : string,
  'personality' : AIPersonality,
  'isOrganic' : boolean,
  'baseCapacity' : bigint,
  'name' : string,
  'totalArea' : number,
  'reputation' : bigint,
  'preferredSaleType' : string,
  'county' : string,
}
export type AIPersonality = { 'Businessman' : null } |
  { 'Innovator' : null } |
  { 'Traditionalist' : null };
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
export interface FarmOverview {
  'currentPhase' : SeasonPhase,
  'totalTrees' : bigint,
  'ownedClubs' : Array<string>,
  'cash' : bigint,
  'currentSeason' : Season,
  'playerId' : string,
  'inventory' : Inventory,
  'level' : bigint,
  'experience' : bigint,
  'seasonNumber' : bigint,
  'playerName' : string,
  'parcelCount' : bigint,
  'weather' : [] | [WeatherEvent],
}
export interface FootballClub {
  'id' : string,
  'region' : Region,
  'stadiumQuality' : bigint,
  'marketValue' : bigint,
  'squadValue' : bigint,
  'leaguePosition' : bigint,
  'ownerId' : [] | [string],
  'name' : string,
  'stadiumCapacity' : bigint,
  'league' : League,
  'squadSize' : bigint,
  'tvRights' : bigint,
  'youthDevelopment' : bigint,
  'playerWages' : bigint,
  'ticketRevenue' : bigint,
  'ownershipPercent' : bigint,
}
export type GameError = { 'SeasonalRestriction' : string } |
  {
    'BankruptcyRisk' : {
      'available' : bigint,
      'estimatedCostUntilHarvest' : bigint,
    }
  } |
  { 'NotFound' : string } |
  { 'Unauthorized' : string } |
  { 'AlreadyExists' : string } |
  { 'InvalidOperation' : string } |
  { 'InsufficientFunds' : { 'available' : bigint, 'required' : bigint } };
export type GameResult = { 'Ok' : string } |
  { 'Err' : GameError };
export type GameResult_1 = { 'Ok' : bigint } |
  { 'Err' : GameError };
export type GameResult_2 = { 'Ok' : Statistics } |
  { 'Err' : GameError };
export type GameResult_3 = { 'Ok' : PlayerFarm } |
  { 'Err' : GameError };
export type GameResult_4 = { 'Ok' : CherryParcel } |
  { 'Err' : GameError };
export type GameResult_5 = { 'Ok' : MarketPrice } |
  { 'Err' : GameError };
export type GameResult_6 = { 'Ok' : Inventory } |
  { 'Err' : GameError };
export type GameResult_7 = { 'Ok' : FarmOverview } |
  { 'Err' : GameError };
export type GameResult_8 = { 'Ok' : Array<FootballClub> } |
  { 'Err' : GameError };
export type GameResult_9 = {
    'Ok' : {
      'available' : bigint,
      'isRisky' : boolean,
      'estimatedCost' : bigint,
    }
  } |
  { 'Err' : GameError };
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
  { 'GoldenHarvester' : null } |
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
export type LaborType = { 'City' : null } |
  { 'Village' : null } |
  { 'Emergency' : null } |
  { 'Standard' : null };
export type League = { 'Liga1' : null } |
  { 'Liga2' : null } |
  { 'Liga3' : null } |
  { 'TopLiga' : null };
export interface MarketPrice {
  'organicPremium' : number,
  'retailBasePrice' : bigint,
  'seasonMultiplier' : number,
  'demandMultiplier' : number,
  'wholesaleBasePrice' : bigint,
  'qualityBonus' : number,
}
export interface ParcelEconomics {
  'revenue' : bigint,
  'province' : Province,
  'costs' : bigint,
  'parcelId' : string,
  'yield' : bigint,
  'netProfit' : bigint,
}
export interface PlayerFarm {
  'currentPhase' : SeasonPhase,
  'owner' : Principal,
  'ownedClubs' : Array<string>,
  'cash' : bigint,
  'currentSeason' : Season,
  'playerId' : string,
  'inventory' : Inventory,
  'reputation' : bigint,
  'level' : bigint,
  'experience' : bigint,
  'seasonNumber' : bigint,
  'hiredLabor' : [] | [LaborType],
  'infrastructure' : Array<Infrastructure>,
  'playerName' : string,
  'weather' : [] | [WeatherEvent],
  'parcels' : Array<CherryParcel>,
  'lastActive' : bigint,
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
export type Season = { 'Winter' : null } |
  { 'Autumn' : null } |
  { 'Summer' : null } |
  { 'Spring' : null };
export type SeasonPhase = { 'Storage' : null } |
  { 'Investment' : null } |
  { 'Growth' : null } |
  { 'Harvest' : null } |
  { 'Procurement' : null } |
  { 'Maintenance' : null } |
  { 'Hiring' : null } |
  { 'Planning' : null } |
  { 'CutAndPrune' : null } |
  { 'Market' : null };
export interface SeasonReport {
  'wholesaleRevenue' : bigint,
  'maintenanceCosts' : bigint,
  'certificationCosts' : bigint,
  'totalCosts' : bigint,
  'parcelData' : Array<ParcelEconomics>,
  'totalHarvested' : bigint,
  'infrastructureCosts' : bigint,
  'laborCosts' : bigint,
  'operationalCosts' : bigint,
  'seasonNumber' : bigint,
  'wholesaleVolume' : bigint,
  'otherRevenue' : bigint,
  'parcelCosts' : bigint,
  'retailVolume' : bigint,
  'totalRevenue' : bigint,
  'retailRevenue' : bigint,
  'seasonName' : Season,
  'netProfit' : bigint,
}
export type SoilType = { 'Sandy' : null } |
  { 'Clay' : null } |
  { 'Waterlogged' : null } |
  { 'SandyClay' : null };
export interface Statistics {
  'bestYearlyProfit' : bigint,
  'totalCosts' : bigint,
  'totalHarvested' : bigint,
  'totalSold' : bigint,
  'averageYieldPerHa' : number,
  'seasonsPlayed' : bigint,
  'seasonalReports' : Array<SeasonReport>,
  'totalRevenue' : bigint,
  'yearlyReports' : Array<YearlyReport>,
}
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export type Weather = { 'Sunny' : null } |
  { 'Heatwave' : null } |
  { 'Rainy' : null } |
  { 'Frost' : null } |
  { 'Drought' : null };
export interface WeatherEvent {
  'impact' : string,
  'season' : bigint,
  'severity' : number,
  'weather' : Weather,
}
export interface YearlyReport {
  'wholesaleRevenue' : bigint,
  'maintenanceCosts' : bigint,
  'certificationCosts' : bigint,
  'bestPerformingProvince' : [] | [Province],
  'year' : bigint,
  'totalCosts' : bigint,
  'totalHarvested' : bigint,
  'infrastructureCosts' : bigint,
  'laborCosts' : bigint,
  'operationalCosts' : bigint,
  'wholesaleVolume' : bigint,
  'otherRevenue' : bigint,
  'seasonalBreakdown' : Array<SeasonReport>,
  'parcelCosts' : bigint,
  'retailVolume' : bigint,
  'totalRevenue' : bigint,
  'bestPerformingParcelId' : [] | [string],
  'retailRevenue' : bigint,
  'netProfit' : bigint,
}
export interface _SERVICE {
  '_initializeAccessControlWithSecret' : ActorMethod<[string], undefined>,
  'advancePhase' : ActorMethod<[], GameResult>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'assignParcelToPlayer' : ActorMethod<[string, Principal], GameResult>,
  'buyClubShares' : ActorMethod<[string, bigint], GameResult>,
  'buyParcel' : ActorMethod<[string, bigint], GameResult>,
  'checkStability' : ActorMethod<[], GameResult_9>,
  'cutAndPrune' : ActorMethod<[string], GameResult>,
  'debugResetPlayer' : ActorMethod<[], GameResult>,
  'fertilizeParcel' : ActorMethod<[string, string], GameResult>,
  'getAvailableFootballClubs' : ActorMethod<[], GameResult_8>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getCashBalance' : ActorMethod<[], GameResult_1>,
  'getCompetitorSummaries' : ActorMethod<[], Array<AICompetitorSummary>>,
  'getFarmOverview' : ActorMethod<[], GameResult_7>,
  'getGlobalSeason' : ActorMethod<[], bigint>,
  'getInventory' : ActorMethod<[], GameResult_6>,
  'getLeaderboard' : ActorMethod<
    [],
    Array<
      {
        'efficiency' : number,
        'isAI' : boolean,
        'name' : string,
        'rank' : bigint,
        'reputation' : bigint,
        'profit' : bigint,
        'totalRevenue' : bigint,
      }
    >
  >,
  'getMarketPrices' : ActorMethod<[], GameResult_5>,
  'getParcelDetails' : ActorMethod<[string], GameResult_4>,
  'getPlayerFarm' : ActorMethod<[], GameResult_3>,
  'getPlayerStats' : ActorMethod<[], GameResult_2>,
  'getTotalPlayers' : ActorMethod<[], bigint>,
  'harvestCherries' : ActorMethod<[string], GameResult_1>,
  'hireLabor' : ActorMethod<[string], GameResult>,
  'initializePlayer' : ActorMethod<[string, string], GameResult>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'plantTrees' : ActorMethod<[string, bigint], GameResult>,
  'purchaseParcel' : ActorMethod<[Province, number], GameResult>,
  'sellCherries' : ActorMethod<[bigint, string], GameResult_1>,
  'startOrganicConversion' : ActorMethod<[string], GameResult>,
  'upgradeInfrastructure' : ActorMethod<[string], GameResult>,
  'upgrade_golden_harvester' : ActorMethod<[], GameResult_1>,
  'waterParcel' : ActorMethod<[string], GameResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
