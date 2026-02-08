export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : IDL.Text });
  const Inventory = IDL.Record({
    'fertilizers' : IDL.Nat,
    'pesticides' : IDL.Nat,
    'organicCherries' : IDL.Nat,
    'cherries' : IDL.Nat,
    'organicTreatments' : IDL.Nat,
  });
  const Result_4 = IDL.Variant({ 'Ok' : Inventory, 'Err' : IDL.Text });
  const Season = IDL.Variant({
    'Winter' : IDL.Null,
    'Autumn' : IDL.Null,
    'Summer' : IDL.Null,
    'Spring' : IDL.Null,
  });
  const InfrastructureType = IDL.Variant({
    'Sprayer' : IDL.Null,
    'Shaker' : IDL.Null,
    'Tractor' : IDL.Null,
    'Warehouse' : IDL.Null,
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
  const CommuneType = IDL.Variant({
    'Urban' : IDL.Null,
    'Rural' : IDL.Null,
    'Mixed' : IDL.Null,
  });
  const Region = IDL.Record({
    'laborCostMultiplier' : IDL.Float64,
    'marketSize' : IDL.Float64,
    'province' : Province,
    'commune' : IDL.Text,
    'communeType' : CommuneType,
    'county' : IDL.Text,
    'population' : IDL.Nat,
  });
  const SoilType = IDL.Variant({
    'Sandy' : IDL.Null,
    'Clay' : IDL.Null,
    'Waterlogged' : IDL.Null,
    'SandyClay' : IDL.Null,
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
  const Time = IDL.Int;
  const Statistics = IDL.Record({
    'totalCosts' : IDL.Nat,
    'totalHarvested' : IDL.Nat,
    'totalSold' : IDL.Nat,
    'averageYieldPerHa' : IDL.Float64,
    'bestSeasonProfit' : IDL.Nat,
    'seasonsPlayed' : IDL.Nat,
    'totalRevenue' : IDL.Nat,
  });
  const PlayerFarm = IDL.Record({
    'owner' : IDL.Principal,
    'cash' : IDL.Nat,
    'currentSeason' : Season,
    'playerId' : IDL.Text,
    'inventory' : Inventory,
    'reputation' : IDL.Nat,
    'level' : IDL.Nat,
    'experience' : IDL.Nat,
    'seasonNumber' : IDL.Nat,
    'infrastructure' : IDL.Vec(Infrastructure),
    'playerName' : IDL.Text,
    'parcels' : IDL.Vec(CherryParcel),
    'lastActive' : Time,
    'statistics' : Statistics,
  });
  const Result_3 = IDL.Variant({ 'Ok' : PlayerFarm, 'Err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'Ok' : Statistics, 'Err' : IDL.Text });
  return IDL.Service({
    '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
    'advanceSeason' : IDL.Func([IDL.Opt(IDL.Text)], [Result], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'assignParcelToPlayer' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'buyParcel' : IDL.Func([IDL.Text, IDL.Nat], [Result], []),
    'fertilizeParcel' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getCashBalance' : IDL.Func([], [Result_1], ['query']),
    'getGlobalSeason' : IDL.Func([], [IDL.Nat], ['query']),
    'getInventory' : IDL.Func([], [Result_4], ['query']),
    'getPlayerFarm' : IDL.Func([], [Result_3], ['query']),
    'getPlayerStats' : IDL.Func([], [Result_2], ['query']),
    'getTotalPlayers' : IDL.Func([], [IDL.Nat], ['query']),
    'harvestCherries' : IDL.Func([IDL.Text], [Result_1], []),
    'initializePlayer' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'plantTrees' : IDL.Func([IDL.Text, IDL.Nat], [Result], []),
    'purchaseParcel' : IDL.Func([Province, IDL.Float64], [Result], []),
    'sellCherries' : IDL.Func([IDL.Nat, IDL.Text], [Result_1], []),
    'startOrganicConversion' : IDL.Func([IDL.Text], [Result], []),
    'upgradeInfrastructure' : IDL.Func([IDL.Text], [Result], []),
    'waterParcel' : IDL.Func([IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
