import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AICompetitor {
  'id' : string,
  'personality' : AIPersonality,
  'currentStrategy' : AIStrategyState,
  'productionCapacity' : bigint,
  'isOrganic' : boolean,
  'lastSeasonProduction' : bigint,
  'name' : string,
  'totalArea' : number,
  'reputation' : bigint,
  'prestige' : bigint,
  'seasonsActive' : bigint,
  'preferredSaleType' : string,
  'inventoryKg' : bigint,
  'totalRevenue' : bigint,
  'county' : string,
}
export interface AICompetitorSummary {
  'id' : string,
  'personality' : AIPersonality,
  'productionCapacity' : bigint,
  'isOrganic' : boolean,
  'name' : string,
  'totalArea' : number,
  'reputation' : bigint,
  'prestige' : bigint,
  'seasonsActive' : bigint,
  'preferredSaleType' : string,
  'county' : string,
}
export type AIPersonality = { 'Businessman' : null } |
  { 'Innovator' : null } |
  { 'Traditionalist' : null };
export type AIStrategyState = { 'Aggressive' : null } |
  { 'Passive' : null } |
  { 'Desperate' : null } |
  { 'Neutral' : null };
export interface AuctionContract {
  'id' : string,
  'status' : ContractStatus,
  'committedByPlayer' : [] | [string],
  'basePricePLN' : bigint,
  'awardedSeason' : [] | [bigint],
  'lockedPricePLN' : [] | [bigint],
  'isPreSeason' : boolean,
  'winnerPlayerId' : [] | [string],
  'category' : ContractCategory,
  'shortfallKg' : [] | [bigint],
  'winnerBidPLN' : [] | [bigint],
  'requiredVolumeKg' : bigint,
}
export interface Bid {
  'isOrganic' : boolean,
  'offerPricePLN' : bigint,
  'isAI' : boolean,
  'submittedSeason' : bigint,
  'globalPrestige' : bigint,
  'bidderId' : string,
  'localReputation' : bigint,
  'contractId' : string,
  'volumeCommittedKg' : bigint,
}
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
export interface CherryParcel__1 {
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
export type ContractCategory = { 'Bio' : null } |
  { 'Industrial' : null } |
  { 'Export' : null };
export type ContractStatus = { 'Open' : null } |
  { 'Awarded' : null } |
  { 'Defaulted' : null } |
  { 'Fulfilled' : null };
export interface FarmOverview {
  'currentPhase' : SeasonPhase,
  'totalTrees' : bigint,
  'ownedClubs' : Array<string>,
  'cash' : bigint,
  'debt' : bigint,
  'currentSeason' : Season,
  'playerId' : string,
  'inventory' : Inventory,
  'level' : bigint,
  'experience' : bigint,
  'seasonNumber' : bigint,
  'playerName' : string,
  'parcelCount' : bigint,
  'lastAuctionResolutionSeason' : bigint,
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
export interface ForecastReport {
  'targetSeason' : string,
  'wholesaleRangeMax' : bigint,
  'wholesaleRangeMin' : bigint,
  'forecastCost' : bigint,
  'confidence' : string,
  'priceRangeMax' : bigint,
  'priceRangeMin' : bigint,
  'weatherWarning' : string,
}
export interface ForwardContractResult {
  'commitmentFeePaid' : bigint,
  'saleCategory' : string,
  'lockedQuantityKg' : bigint,
  'pricePerKg' : bigint,
  'totalRevenue' : bigint,
  'buyerName' : string,
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
export type GameResult_10 = { 'Ok' : Inventory__1 } |
  { 'Err' : GameError };
export type GameResult_11 = { 'Ok' : FarmOverview } |
  { 'Err' : GameError };
export type GameResult_12 = { 'Ok' : Array<AICompetitor> } |
  { 'Err' : GameError };
export type GameResult_13 = { 'Ok' : Array<FootballClub> } |
  { 'Err' : GameError };
export type GameResult_14 = { 'Ok' : Array<AuctionContract> } |
  { 'Err' : GameError };
export type GameResult_15 = { 'Ok' : Array<Bid> } |
  { 'Err' : GameError };
export type GameResult_16 = {
    'Ok' : {
      'available' : bigint,
      'isRisky' : boolean,
      'estimatedCost' : bigint,
    }
  } |
  { 'Err' : GameError };
export type GameResult_17 = { 'Ok' : InsurancePolicy } |
  { 'Err' : GameError };
export type GameResult_2 = { 'Ok' : ForecastReport } |
  { 'Err' : GameError };
export type GameResult_3 = { 'Ok' : ForwardContractResult } |
  { 'Err' : GameError };
export type GameResult_4 = { 'Ok' : Array<string> } |
  { 'Err' : GameError };
export type GameResult_5 = { 'Ok' : Statistics } |
  { 'Err' : GameError };
export type GameResult_6 = { 'Ok' : PlayerFarm } |
  { 'Err' : GameError };
export type GameResult_7 = { 'Ok' : CherryParcel__1 } |
  { 'Err' : GameError };
export type GameResult_8 = {
    'Ok' : { 'contracts' : Array<AuctionContract>, 'spotPrice' : bigint }
  } |
  { 'Err' : GameError };
export type GameResult_9 = { 'Ok' : MarketPrice } |
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
  { 'Pruner' : null } |
  { 'SocialFacilities' : null };
export interface InputMarket {
  'fertilizerPrice' : bigint,
  'year' : bigint,
  'pesticidePrice' : bigint,
  'organicTreatmentPrice' : bigint,
}
export interface InsurancePolicy {
  'id' : string,
  'premium' : bigint,
  'category' : InsuranceType,
  'activeUntilSeason' : bigint,
  'payout' : bigint,
}
export type InsuranceType = { 'Pest' : null } |
  { 'Flood' : null } |
  { 'Frost' : null } |
  { 'AllIn' : null } |
  { 'Drought' : null };
export interface Inventory {
  'fertilizers' : bigint,
  'pesticides' : bigint,
  'organicCherries' : bigint,
  'cherries' : bigint,
  'organicTreatments' : bigint,
}
export interface Inventory__1 {
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
export interface LeaderboardEntry {
  'id' : string,
  'isAI' : boolean,
  'name' : string,
  'prestige' : PrestigeScore,
  'seasonsCompleted' : bigint,
  'totalRevenue' : bigint,
}
export type League = { 'Liga3' : null } |
  { 'Liga4' : null };
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
  'province' : Province__1,
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
  'debt' : bigint,
  'currentSeason' : Season,
  'playerId' : string,
  'inventory' : Inventory,
  'reputation' : bigint,
  'level' : bigint,
  'experience' : bigint,
  'seasonNumber' : bigint,
  'hiredLabor' : [] | [LaborType],
  'infrastructure' : Array<Infrastructure>,
  'activeInsurance' : [] | [InsurancePolicy],
  'playerName' : string,
  'inputMarket' : InputMarket,
  'lastAuctionResolutionSeason' : bigint,
  'weather' : [] | [WeatherEvent],
  'parcels' : Array<CherryParcel>,
  'lastActive' : bigint,
  'statistics' : Statistics__1,
}
export type PrestigeScore = bigint;
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
export type Province__1 = { 'Swietokrzyskie' : null } |
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
  'province' : Province__1,
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
export interface Statistics__1 {
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
  { 'PestOutbreak' : null } |
  { 'Heatwave' : null } |
  { 'Rainy' : null } |
  { 'Flood' : null } |
  { 'Frost' : null } |
  { 'Drought' : null } |
  { 'DiseaseOutbreak' : null };
export interface WeatherEvent {
  'impact' : string,
  'season' : bigint,
  'mitigated' : boolean,
  'severity' : number,
  'weather' : Weather,
}
export interface YearlyReport {
  'wholesaleRevenue' : bigint,
  'maintenanceCosts' : bigint,
  'certificationCosts' : bigint,
  'bestPerformingProvince' : [] | [Province__1],
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
  'buyInsurance' : ActorMethod<[InsuranceType], GameResult_17>,
  'buyParcel' : ActorMethod<[string, bigint], GameResult>,
  'checkStability' : ActorMethod<[], GameResult_16>,
  'commitPreSeasonFuture' : ActorMethod<[string, bigint], GameResult>,
  'cutAndPrune' : ActorMethod<[string], GameResult>,
  'debugClearBidsAndContracts' : ActorMethod<[], GameResult>,
  'debugClearMarket' : ActorMethod<[], GameResult>,
  'debugGetBids' : ActorMethod<[], GameResult_15>,
  'debugResetPlayer' : ActorMethod<[], GameResult>,
  'debugSetAIInventory' : ActorMethod<[string, bigint], GameResult>,
  'debugSetInventory' : ActorMethod<[bigint, bigint], GameResult>,
  'debugSetWeather' : ActorMethod<[Weather, number, boolean], GameResult>,
  'fertilizeParcel' : ActorMethod<[string, string], GameResult>,
  'getActiveContracts' : ActorMethod<[], GameResult_14>,
  'getAvailableFootballClubs' : ActorMethod<[], GameResult_13>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getCashBalance' : ActorMethod<[], GameResult_1>,
  'getCompetitorSummaries' : ActorMethod<[], Array<AICompetitorSummary>>,
  'getCompetitorsDetail' : ActorMethod<[], GameResult_12>,
  'getFarmOverview' : ActorMethod<[], GameResult_11>,
  'getGlobalLeaderboard' : ActorMethod<[], Array<LeaderboardEntry>>,
  'getGlobalSeason' : ActorMethod<[], bigint>,
  'getInventory' : ActorMethod<[], GameResult_10>,
  'getMarketPrices' : ActorMethod<[], GameResult_9>,
  'getMarketState' : ActorMethod<[], GameResult_8>,
  'getParcelDetails' : ActorMethod<[string], GameResult_7>,
  'getPlayerFarm' : ActorMethod<[], GameResult_6>,
  'getPlayerRank' : ActorMethod<[Principal], [] | [bigint]>,
  'getPlayerStats' : ActorMethod<[], GameResult_5>,
  'getTotalPlayers' : ActorMethod<[], bigint>,
  'getYearlyInsights' : ActorMethod<[], GameResult_4>,
  'harvestCherries' : ActorMethod<[string], GameResult_1>,
  'hireLabor' : ActorMethod<[string], GameResult>,
  'initializePlayer' : ActorMethod<[string, string], GameResult>,
  'inspectAndRepair' : ActorMethod<[], GameResult>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'negotiateForwardContract' : ActorMethod<[string, bigint], GameResult_3>,
  'plantTrees' : ActorMethod<[string, bigint], GameResult>,
  'purchaseCropInsurance' : ActorMethod<[], GameResult>,
  'purchaseMarketForecast' : ActorMethod<[], GameResult_2>,
  'purchaseParcel' : ActorMethod<[Province, number], GameResult>,
  'purchaseSupplies' : ActorMethod<[string, bigint], GameResult>,
  'resolveSeasonAuctions' : ActorMethod<[], GameResult>,
  'sellCherries' : ActorMethod<[bigint, string], GameResult_1>,
  'startOrganicConversion' : ActorMethod<[string], GameResult>,
  'submitAuctionBid' : ActorMethod<[string, bigint], GameResult>,
  'upgradeInfrastructure' : ActorMethod<[string], GameResult>,
  'upgrade_golden_harvester' : ActorMethod<[], GameResult_1>,
  'waterParcel' : ActorMethod<[string], GameResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
