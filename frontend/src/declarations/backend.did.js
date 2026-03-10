export const idlFactory = ({ IDL }) => {
  const GameError = IDL.Variant({
    'SeasonalRestriction' : IDL.Text,
    'BankruptcyRisk' : IDL.Record({
      'available' : IDL.Nat,
      'estimatedCostUntilHarvest' : IDL.Nat,
    }),
    'NotFound' : IDL.Text,
    'Unauthorized' : IDL.Text,
    'AlreadyExists' : IDL.Text,
    'InvalidOperation' : IDL.Text,
    'InsufficientFunds' : IDL.Record({
      'available' : IDL.Nat,
      'required' : IDL.Nat,
    }),
  });
  const GameResult = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : GameError });
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const GameResult_12 = IDL.Variant({
    'Ok' : IDL.Record({
      'available' : IDL.Nat,
      'isRisky' : IDL.Bool,
      'estimatedCost' : IDL.Nat,
    }),
    'Err' : GameError,
  });
  const Province__1 = IDL.Variant({
    'Swietokrzyskie' : IDL.Null,
    'Warminsko_Mazurskie' : IDL.Null,
    'Podlaskie' : IDL.Null,
    'Kujawsko_Pomorskie' : IDL.Null,
    'Malopolskie' : IDL.Null,
    'Lubelskie' : IDL.Null,
    'Lodzkie' : IDL.Null,
    'Wielkopolskie' : IDL.Null,
    'Mazowieckie' : IDL.Null,
    'Opolskie' : IDL.Null,
    'Pomorskie' : IDL.Null,
    'Podkarpackie' : IDL.Null,
    'Slaskie' : IDL.Null,
    'Lubuskie' : IDL.Null,
    'Zachodniopomorskie' : IDL.Null,
    'Dolnoslaskie' : IDL.Null,
  });
  const CommuneType = IDL.Variant({
    'Urban' : IDL.Null,
    'Rural' : IDL.Null,
    'Mixed' : IDL.Null,
  });
  const Region = IDL.Record({
    'laborCostMultiplier' : IDL.Float64,
    'marketSize' : IDL.Float64,
    'province' : Province__1,
    'commune' : IDL.Text,
    'communeType' : CommuneType,
    'county' : IDL.Text,
    'population' : IDL.Nat,
  });
  const League = IDL.Variant({
    'Liga1' : IDL.Null,
    'Liga2' : IDL.Null,
    'Liga3' : IDL.Null,
    'TopLiga' : IDL.Null,
  });
  const FootballClub = IDL.Record({
    'id' : IDL.Text,
    'region' : Region,
    'stadiumQuality' : IDL.Nat,
    'marketValue' : IDL.Nat,
    'squadValue' : IDL.Nat,
    'leaguePosition' : IDL.Nat,
    'ownerId' : IDL.Opt(IDL.Text),
    'name' : IDL.Text,
    'stadiumCapacity' : IDL.Nat,
    'league' : League,
    'squadSize' : IDL.Nat,
    'tvRights' : IDL.Nat,
    'youthDevelopment' : IDL.Nat,
    'playerWages' : IDL.Nat,
    'ticketRevenue' : IDL.Nat,
    'ownershipPercent' : IDL.Nat,
  });
  const GameResult_11 = IDL.Variant({
    'Ok' : IDL.Vec(FootballClub),
    'Err' : GameError,
  });
  const GameResult_1 = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : GameError });
  const AIPersonality = IDL.Variant({
    'Businessman' : IDL.Null,
    'Innovator' : IDL.Null,
    'Traditionalist' : IDL.Null,
  });
  const AICompetitorSummary = IDL.Record({
    'id' : IDL.Text,
    'personality' : AIPersonality,
    'isOrganic' : IDL.Bool,
    'baseCapacity' : IDL.Nat,
    'name' : IDL.Text,
    'totalArea' : IDL.Float64,
    'reputation' : IDL.Nat,
    'preferredSaleType' : IDL.Text,
    'county' : IDL.Text,
  });
  const SeasonPhase = IDL.Variant({
    'Storage' : IDL.Null,
    'Investment' : IDL.Null,
    'Growth' : IDL.Null,
    'Harvest' : IDL.Null,
    'Procurement' : IDL.Null,
    'Maintenance' : IDL.Null,
    'Hiring' : IDL.Null,
    'Planning' : IDL.Null,
    'CutAndPrune' : IDL.Null,
    'Market' : IDL.Null,
  });
  const Season = IDL.Variant({
    'Winter' : IDL.Null,
    'Autumn' : IDL.Null,
    'Summer' : IDL.Null,
    'Spring' : IDL.Null,
  });
  const Inventory = IDL.Record({
    'fertilizers' : IDL.Nat,
    'pesticides' : IDL.Nat,
    'organicCherries' : IDL.Nat,
    'cherries' : IDL.Nat,
    'organicTreatments' : IDL.Nat,
  });
  const Weather = IDL.Variant({
    'Sunny' : IDL.Null,
    'PestOutbreak' : IDL.Null,
    'Heatwave' : IDL.Null,
    'Rainy' : IDL.Null,
    'Flood' : IDL.Null,
    'Frost' : IDL.Null,
    'Drought' : IDL.Null,
    'DiseaseOutbreak' : IDL.Null,
  });
  const WeatherEvent = IDL.Record({
    'impact' : IDL.Text,
    'season' : IDL.Nat,
    'mitigated' : IDL.Bool,
    'severity' : IDL.Float64,
    'weather' : Weather,
  });
  const FarmOverview = IDL.Record({
    'currentPhase' : SeasonPhase,
    'totalTrees' : IDL.Nat,
    'ownedClubs' : IDL.Vec(IDL.Text),
    'cash' : IDL.Nat,
    'currentSeason' : Season,
    'playerId' : IDL.Text,
    'inventory' : Inventory,
    'level' : IDL.Nat,
    'experience' : IDL.Nat,
    'seasonNumber' : IDL.Nat,
    'playerName' : IDL.Text,
    'parcelCount' : IDL.Nat,
    'weather' : IDL.Opt(WeatherEvent),
  });
  const GameResult_10 = IDL.Variant({ 'Ok' : FarmOverview, 'Err' : GameError });
  const PrestigeScore = IDL.Nat;
  const LeaderboardEntry = IDL.Record({
    'id' : IDL.Text,
    'isAI' : IDL.Bool,
    'name' : IDL.Text,
    'prestige' : PrestigeScore,
    'seasonsCompleted' : IDL.Nat,
    'totalRevenue' : IDL.Nat,
  });
  const Inventory__1 = IDL.Record({
    'fertilizers' : IDL.Nat,
    'pesticides' : IDL.Nat,
    'organicCherries' : IDL.Nat,
    'cherries' : IDL.Nat,
    'organicTreatments' : IDL.Nat,
  });
  const GameResult_9 = IDL.Variant({ 'Ok' : Inventory__1, 'Err' : GameError });
  const MarketPrice = IDL.Record({
    'organicPremium' : IDL.Float64,
    'retailBasePrice' : IDL.Nat,
    'seasonMultiplier' : IDL.Float64,
    'demandMultiplier' : IDL.Float64,
    'wholesaleBasePrice' : IDL.Nat,
    'qualityBonus' : IDL.Float64,
  });
  const GameResult_8 = IDL.Variant({ 'Ok' : MarketPrice, 'Err' : GameError });
  const SoilType = IDL.Variant({
    'Sandy' : IDL.Null,
    'Clay' : IDL.Null,
    'Waterlogged' : IDL.Null,
    'SandyClay' : IDL.Null,
  });
  const CherryParcel__1 = IDL.Record({
    'id' : IDL.Text,
    'pH' : IDL.Float64,
    'region' : Region,
    'lastFertilized' : IDL.Nat,
    'soilType' : SoilType,
    'organicConversionSeason' : IDL.Nat,
    'isOrganic' : IDL.Bool,
    'ownerId' : IDL.Text,
    'waterLevel' : IDL.Float64,
    'fertility' : IDL.Float64,
    'quality' : IDL.Nat,
    'permeability' : IDL.Float64,
    'size' : IDL.Float64,
    'lastHarvest' : IDL.Nat,
    'organicCertified' : IDL.Bool,
    'humidity' : IDL.Float64,
    'plantedTrees' : IDL.Nat,
    'treeAge' : IDL.Nat,
  });
  const GameResult_7 = IDL.Variant({
    'Ok' : CherryParcel__1,
    'Err' : GameError,
  });
  const LaborType = IDL.Variant({
    'City' : IDL.Null,
    'Village' : IDL.Null,
    'Emergency' : IDL.Null,
    'Standard' : IDL.Null,
  });
  const InfrastructureType = IDL.Variant({
    'Sprayer' : IDL.Null,
    'Shaker' : IDL.Null,
    'Tractor' : IDL.Null,
    'Warehouse' : IDL.Null,
    'GoldenHarvester' : IDL.Null,
    'ColdStorage' : IDL.Null,
    'ProcessingFacility' : IDL.Null,
    'SocialFacilities' : IDL.Null,
  });
  const Infrastructure = IDL.Record({
    'purchasedSeason' : IDL.Nat,
    'infraType' : InfrastructureType,
    'maintenanceCost' : IDL.Nat,
    'level' : IDL.Nat,
  });
  const InputMarket = IDL.Record({
    'fertilizerPrice' : IDL.Nat,
    'year' : IDL.Nat,
    'pesticidePrice' : IDL.Nat,
    'organicTreatmentPrice' : IDL.Nat,
  });
  const CherryParcel = IDL.Record({
    'id' : IDL.Text,
    'pH' : IDL.Float64,
    'region' : Region,
    'lastFertilized' : IDL.Nat,
    'soilType' : SoilType,
    'organicConversionSeason' : IDL.Nat,
    'isOrganic' : IDL.Bool,
    'ownerId' : IDL.Text,
    'waterLevel' : IDL.Float64,
    'fertility' : IDL.Float64,
    'quality' : IDL.Nat,
    'permeability' : IDL.Float64,
    'size' : IDL.Float64,
    'lastHarvest' : IDL.Nat,
    'organicCertified' : IDL.Bool,
    'humidity' : IDL.Float64,
    'plantedTrees' : IDL.Nat,
    'treeAge' : IDL.Nat,
  });
  const ParcelEconomics = IDL.Record({
    'revenue' : IDL.Nat,
    'province' : Province__1,
    'costs' : IDL.Nat,
    'parcelId' : IDL.Text,
    'yield' : IDL.Nat,
    'netProfit' : IDL.Int,
  });
  const SeasonReport = IDL.Record({
    'wholesaleRevenue' : IDL.Nat,
    'maintenanceCosts' : IDL.Nat,
    'certificationCosts' : IDL.Nat,
    'totalCosts' : IDL.Nat,
    'parcelData' : IDL.Vec(ParcelEconomics),
    'totalHarvested' : IDL.Nat,
    'infrastructureCosts' : IDL.Nat,
    'laborCosts' : IDL.Nat,
    'operationalCosts' : IDL.Nat,
    'seasonNumber' : IDL.Nat,
    'wholesaleVolume' : IDL.Nat,
    'otherRevenue' : IDL.Nat,
    'parcelCosts' : IDL.Nat,
    'retailVolume' : IDL.Nat,
    'totalRevenue' : IDL.Nat,
    'retailRevenue' : IDL.Nat,
    'seasonName' : Season,
    'netProfit' : IDL.Int,
  });
  const YearlyReport = IDL.Record({
    'wholesaleRevenue' : IDL.Nat,
    'maintenanceCosts' : IDL.Nat,
    'certificationCosts' : IDL.Nat,
    'bestPerformingProvince' : IDL.Opt(Province__1),
    'year' : IDL.Nat,
    'totalCosts' : IDL.Nat,
    'totalHarvested' : IDL.Nat,
    'infrastructureCosts' : IDL.Nat,
    'laborCosts' : IDL.Nat,
    'operationalCosts' : IDL.Nat,
    'wholesaleVolume' : IDL.Nat,
    'otherRevenue' : IDL.Nat,
    'seasonalBreakdown' : IDL.Vec(SeasonReport),
    'parcelCosts' : IDL.Nat,
    'retailVolume' : IDL.Nat,
    'totalRevenue' : IDL.Nat,
    'bestPerformingParcelId' : IDL.Opt(IDL.Text),
    'retailRevenue' : IDL.Nat,
    'netProfit' : IDL.Int,
  });
  const Statistics__1 = IDL.Record({
    'bestYearlyProfit' : IDL.Nat,
    'totalCosts' : IDL.Nat,
    'totalHarvested' : IDL.Nat,
    'totalSold' : IDL.Nat,
    'averageYieldPerHa' : IDL.Float64,
    'seasonsPlayed' : IDL.Nat,
    'seasonalReports' : IDL.Vec(SeasonReport),
    'totalRevenue' : IDL.Nat,
    'yearlyReports' : IDL.Vec(YearlyReport),
  });
  const PlayerFarm = IDL.Record({
    'currentPhase' : SeasonPhase,
    'owner' : IDL.Principal,
    'ownedClubs' : IDL.Vec(IDL.Text),
    'cash' : IDL.Nat,
    'currentSeason' : Season,
    'playerId' : IDL.Text,
    'inventory' : Inventory,
    'reputation' : IDL.Nat,
    'hasCropInsurance' : IDL.Bool,
    'level' : IDL.Nat,
    'experience' : IDL.Nat,
    'seasonNumber' : IDL.Nat,
    'hiredLabor' : IDL.Opt(LaborType),
    'infrastructure' : IDL.Vec(Infrastructure),
    'playerName' : IDL.Text,
    'inputMarket' : InputMarket,
    'weather' : IDL.Opt(WeatherEvent),
    'parcels' : IDL.Vec(CherryParcel),
    'lastActive' : IDL.Nat,
    'statistics' : Statistics__1,
  });
  const GameResult_6 = IDL.Variant({ 'Ok' : PlayerFarm, 'Err' : GameError });
  const Statistics = IDL.Record({
    'bestYearlyProfit' : IDL.Nat,
    'totalCosts' : IDL.Nat,
    'totalHarvested' : IDL.Nat,
    'totalSold' : IDL.Nat,
    'averageYieldPerHa' : IDL.Float64,
    'seasonsPlayed' : IDL.Nat,
    'seasonalReports' : IDL.Vec(SeasonReport),
    'totalRevenue' : IDL.Nat,
    'yearlyReports' : IDL.Vec(YearlyReport),
  });
  const GameResult_5 = IDL.Variant({ 'Ok' : Statistics, 'Err' : GameError });
  const GameResult_4 = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Text),
    'Err' : GameError,
  });
  const ForwardContractResult = IDL.Record({
    'commitmentFeePaid' : IDL.Nat,
    'saleCategory' : IDL.Text,
    'lockedQuantityKg' : IDL.Nat,
    'pricePerKg' : IDL.Nat,
    'totalRevenue' : IDL.Nat,
    'buyerName' : IDL.Text,
  });
  const GameResult_3 = IDL.Variant({
    'Ok' : ForwardContractResult,
    'Err' : GameError,
  });
  const ForecastReport = IDL.Record({
    'targetSeason' : IDL.Text,
    'wholesaleRangeMax' : IDL.Nat,
    'wholesaleRangeMin' : IDL.Nat,
    'forecastCost' : IDL.Nat,
    'confidence' : IDL.Text,
    'priceRangeMax' : IDL.Nat,
    'priceRangeMin' : IDL.Nat,
    'weatherWarning' : IDL.Text,
  });
  const GameResult_2 = IDL.Variant({
    'Ok' : ForecastReport,
    'Err' : GameError,
  });
  const Province = IDL.Variant({
    'Swietokrzyskie' : IDL.Null,
    'Warminsko_Mazurskie' : IDL.Null,
    'Podlaskie' : IDL.Null,
    'Kujawsko_Pomorskie' : IDL.Null,
    'Malopolskie' : IDL.Null,
    'Lubelskie' : IDL.Null,
    'Lodzkie' : IDL.Null,
    'Wielkopolskie' : IDL.Null,
    'Mazowieckie' : IDL.Null,
    'Opolskie' : IDL.Null,
    'Pomorskie' : IDL.Null,
    'Podkarpackie' : IDL.Null,
    'Slaskie' : IDL.Null,
    'Lubuskie' : IDL.Null,
    'Zachodniopomorskie' : IDL.Null,
    'Dolnoslaskie' : IDL.Null,
  });
  return IDL.Service({
    '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
    'advancePhase' : IDL.Func([], [GameResult], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'assignParcelToPlayer' : IDL.Func(
        [IDL.Text, IDL.Principal],
        [GameResult],
        [],
      ),
    'buyClubShares' : IDL.Func([IDL.Text, IDL.Nat], [GameResult], []),
    'buyParcel' : IDL.Func([IDL.Text, IDL.Nat], [GameResult], []),
    'checkStability' : IDL.Func([], [GameResult_12], ['query']),
    'cutAndPrune' : IDL.Func([IDL.Text], [GameResult], []),
    'debugResetPlayer' : IDL.Func([], [GameResult], []),
    'fertilizeParcel' : IDL.Func([IDL.Text, IDL.Text], [GameResult], []),
    'getAvailableFootballClubs' : IDL.Func([], [GameResult_11], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getCashBalance' : IDL.Func([], [GameResult_1], ['query']),
    'getCompetitorSummaries' : IDL.Func(
        [],
        [IDL.Vec(AICompetitorSummary)],
        ['query'],
      ),
    'getFarmOverview' : IDL.Func([], [GameResult_10], ['query']),
    'getGlobalLeaderboard' : IDL.Func(
        [],
        [IDL.Vec(LeaderboardEntry)],
        ['query'],
      ),
    'getGlobalSeason' : IDL.Func([], [IDL.Nat], ['query']),
    'getInventory' : IDL.Func([], [GameResult_9], ['query']),
    'getMarketPrices' : IDL.Func([], [GameResult_8], ['query']),
    'getParcelDetails' : IDL.Func([IDL.Text], [GameResult_7], ['query']),
    'getPlayerFarm' : IDL.Func([], [GameResult_6], ['query']),
    'getPlayerRank' : IDL.Func([IDL.Principal], [IDL.Opt(IDL.Nat)], ['query']),
    'getPlayerStats' : IDL.Func([], [GameResult_5], ['query']),
    'getTotalPlayers' : IDL.Func([], [IDL.Nat], ['query']),
    'getYearlyInsights' : IDL.Func([], [GameResult_4], ['query']),
    'harvestCherries' : IDL.Func([IDL.Text], [GameResult_1], []),
    'hireLabor' : IDL.Func([IDL.Text], [GameResult], []),
    'initializePlayer' : IDL.Func([IDL.Text, IDL.Text], [GameResult], []),
    'inspectAndRepair' : IDL.Func([], [GameResult], []),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'negotiateForwardContract' : IDL.Func(
        [IDL.Text, IDL.Nat],
        [GameResult_3],
        [],
      ),
    'plantTrees' : IDL.Func([IDL.Text, IDL.Nat], [GameResult], []),
    'purchaseCropInsurance' : IDL.Func([], [GameResult], []),
    'purchaseMarketForecast' : IDL.Func([], [GameResult_2], []),
    'purchaseParcel' : IDL.Func([Province, IDL.Float64], [GameResult], []),
    'purchaseSupplies' : IDL.Func([IDL.Text, IDL.Nat], [GameResult], []),
    'sellCherries' : IDL.Func([IDL.Nat, IDL.Text], [GameResult_1], []),
    'startOrganicConversion' : IDL.Func([IDL.Text], [GameResult], []),
    'upgradeInfrastructure' : IDL.Func([IDL.Text], [GameResult], []),
    'upgrade_golden_harvester' : IDL.Func([], [GameResult_1], []),
    'waterParcel' : IDL.Func([IDL.Text], [GameResult], []),
  });
};
export const init = ({ IDL }) => { return []; };
