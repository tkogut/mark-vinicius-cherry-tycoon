import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Text "mo:core/Text";
import Iter "mo:core/Iter";

actor {
  type CaffeineMasterPrompt = {
    prompt : Text;
  };

  type Location = {
    voivodeship : Text;
    county : Text;
    commune : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type GameDesignPlan = {
    title : Text;
    description : Text;
    genre : Text;
    targetAudience : Text;
    coreMechanics : Text;
    platform : Text;
    monetizationStrategy : Text;
  };

  type GameDesignDocument = {
    executiveSummary : Text;
    gameplayDetails : Text;
    technicalSpecifications : Text;
    marketingPlan : Text;
    projectTimeline : Text;
  };

  type UserGameData = {
    planInput : GameDesignPlan;
    gddDraft : GameDesignDocument;
  };

  type Infrastructure = {
    #barn;
    #greenhouse;
    #well;
  };

  public type InfrastructureType = {
    #BasicIrrigation;
    #Greenhouse;
    #Automation;
    #Storage;
  };

  public type InfrastructureDetails = {
    infrastructureType : InfrastructureType;
    cost : Nat;
    lifespan : Nat;
    yieldModifier : Float;
    laborCostModifier : ?Float;
  };

  type SoilType = {
    #piaszczysto_gliniasta;
    #gliniasta;
    #piaszczysta;
    #podmokla;
  };

  type Season = {
    #spring;
    #summer;
    #fall;
    #winter;
  };

  public type CropType = {
    #wheat;
    #corn;
    #potato;
    #carrot;
  };

  public type LivestockType = {
    #cow;
    #pig;
    #sheep;
    #chicken;
  };

  public type Quality = {
    #low;
    #medium;
    #high;
  };

  public type Weather = {
    temperature : Nat8;
    precipitation : Nat8;
    soilMoisture : Nat8;
    sunlightHours : Nat8;
  };

  public type InventoryItem = {
    #crop : { cropType : CropType; amount : Nat };
    #livestock : { animalType : LivestockType; count : Nat };
    #resource : { name : Text; amount : Nat };
  };

  public type Parcel = {
    id : Text;
    size : Nat;
    parcelType : {
      #focus;
      #standard;
    };
    suitableFor : [CropType];
    currentQuality : Quality;
    pasturesCurrentQuality : Quality;
    cropRotationHistory : [CropType];
    livestockRotationHistory : [LivestockType];
    infrastructure : [Infrastructure];
    terrainDifficulty : Nat8;
    rotationHistory : [{ crop : CropType; animal : LivestockType }];
    organicTransitionState : {
      #none;
      #inProgress : { yearsRemaining : Nat };
      #completed;
    };
    fertilizerAndPesticideUsage : {
      fertilizerType : ?Text;
      fertilizerRate : ?Nat;
      pesticideType : ?Text;
      pesticideRate : ?Nat;
      organicStandardsMet : Bool;
    };
    irrigationSystemState : {
      efficiency : ?Nat8;
      energyConsumption : ?Nat;
      automationLevel : ?Text;
      resourceEfficiency : ?Nat;
      waterSource : ?Text;
      reliability : ?Text;
    };
    temporarySoilQualityBoost : {
      #none;
      #active : { strength : Nat8 };
    };
    coverCropHistory : [Text];
    weatherAdaptationStatus : [Text];
    maintained : Bool;
    fallowFieldEquivalent : Bool;
  };

  public type CherryParcel = {
    id : Text;
    ownerId : Text;
    soilType : SoilType;
    pH : Float;
    fertility : Nat;
    size : Float;
    plantedTrees : Nat;
    treeAge : Nat;
    isOrganic : Bool;
    organicConversionSeason : ?Nat;
    organicCertified : Bool;
    lastHarvest : ?Nat;
  };

  type Farm = {
    id : Text;
    owner : Principal;
    name : Text;
    initialBoosts : Text;
    initialEquipmentAndResources : Text;
    landDetail : Text;
    inventoryItems : Text;
    perksAndChallenges : Text;
    parcels : Map.Map<Text, Parcel>;
  };

  public type FarmSnapshot = {
    id : Text;
    owner : Principal;
    name : Text;
    initialBoosts : Text;
    initialEquipmentAndResources : Text;
    landDetail : Text;
    inventoryItems : Text;
    perksAndChallenges : Text;
    parcels : [Parcel];
  };

  public type Inventory = {
    cash : Nat;
    cherries : Nat;
    organicCherries : Nat;
  };

  public type FarmStatistics = {
    totalYieldLifetime : Nat;
    totalRevenueLifetime : Nat;
    totalInvestment : Nat;
    marketShare : Float;
    organicParcels : Nat;
    averageQuality : Float;
  };

  public type PlayerFarm = {
    owner : Principal;
    parcels : [CherryParcel];
    infrastructure : [InfrastructureDetails];
    inventory : Inventory;
    statistics : FarmStatistics;
    level : Nat;
    experience : Nat;
  };

  let farms = Map.empty<Principal, ?Farm>();
  let playerFarms = Map.empty<Principal, PlayerFarm>();

  type Player = {
    id : Text;
  };

  let players = Map.empty<Text, Player>();

  public type Result<Ok, Err> = {
    #ok : Ok;
    #err : Err;
  };

  public query func getPlayer(playerId : Text) : async Result<Player, Text> {
    switch (players.get(playerId)) {
      case (?player) { #ok(player) };
      case (null) { #err("Player not found") };
    };
  };

  public shared ({ caller }) func initializePlayer(playerId : Text, playerName : Text) : async Result<Text, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can initialize players");
    };
    switch (players.get(playerId)) {
      case (?_) { #err("Player already exists") };
      case (null) {
        let newPlayer : Player = { id = playerId };
        players.add(playerId, newPlayer);
        #ok("Player created successfully");
      };
    };
  };

  public shared ({ caller }) func assignParcelToPlayer(parcelId : Text, playerId : Text) : async Result<Text, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can assign parcels");
    };

    switch (playerFarms.get(caller)) {
      case (null) {
        return #err("Player farm not found");
      };
      case (?farm) {
        let updatedParcels = farm.parcels.map(
          func(parcel) {
            if (parcel.id == parcelId) {
              { parcel with ownerId = playerId };
            } else {
              parcel;
            };
          }
        );

        let updatedFarm = { farm with parcels = updatedParcels };

        playerFarms.add(caller, updatedFarm);
        #ok("Parcel assigned successfully");
      };
    };
  };

  func createRandomPlayerFarm(caller : Principal) : PlayerFarm {
    {
      owner = caller;
      parcels = [];
      infrastructure = [];
      inventory = { cash = 10000; cherries = 0; organicCherries = 0 };
      statistics = {
        totalYieldLifetime = 0;
        totalRevenueLifetime = 0;
        totalInvestment = 0;
        marketShare = 0.0;
        organicParcels = 0;
        averageQuality = 0.0;
      };
      level = 1;
      experience = 0;
    };
  };

  public shared ({ caller }) func loadRandomPlayerFarm() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can initialize a farm");
    };
    playerFarms.add(caller, createRandomPlayerFarm(caller));
  };

  public query ({ caller }) func getPlayerFarm() : async Result<?PlayerFarm, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their farm");
    };
    switch (playerFarms.get(caller)) {
      case (?farm) { #ok(?farm) };
      case (null) { #ok(null) };
    };
  };

  func findCherryParcel(farm : PlayerFarm, parcelId : Text) : CherryParcel {
    switch (farm.parcels.find(func(p) { p.id == parcelId })) {
      case (?parcel) { parcel };
      case (null) { Runtime.trap("Parcel not found: Query parcelId=" # parcelId) };
    };
  };

  func filterInfrastructure(farm : PlayerFarm, _parcelId : Text) : [InfrastructureDetails] {
    farm.infrastructure.filter(func(_infra) { true });
  };

  func _calculateYieldInternal(parcelId : Text, farm : PlayerFarm) : Nat {
    let parcel = findCherryParcel(farm, parcelId);
    let infrastructure = filterInfrastructure(farm, parcelId);

    let baseYieldPerHa = 8000.0;
    let soilModifier = getSoilTypeYieldMultiplier(parcel.soilType);

    let pHModifier = Float.max((1.0 - Float.abs(parcel.pH - 6.5) * 0.15), 0.5);
    let fertilityModifier = parcel.fertility.toFloat() / 100.0;
    let infrastructureModifier = getInfrastructureModifier(infrastructure);
    let finalParcelYield = baseYieldPerHa * soilModifier * pHModifier * fertilityModifier * infrastructureModifier * parcel.size;
    finalParcelYield.toInt().toNat();
  };

  func getInfrastructureModifier(_infrastructure : [InfrastructureDetails]) : Float {
    1.0;
  };

  public query ({ caller }) func getAllParcels() : async [Parcel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view parcels");
    };
    switch (farms.get(caller)) {
      case (?(?farm)) {
        farm.parcels.entries().toArray().map(func((_, parcel)) { parcel });
      };
      case (_) {
        [];
      };
    };
  };

  public query ({ caller }) func calculateYield(parcelId : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate yields");
    };

    switch (playerFarms.get(caller)) {
      case (?farm) {
        _calculateYieldInternal(parcelId, farm);
      };
      case (null) {
        Runtime.trap("No farm found for caller");
      };
    };
  };

  public shared ({ caller }) func initFarm() : async FarmSnapshot {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can initialize a farm");
    };
    let farm = getRandomParcelProfiles(caller.toText());
    farms.add(caller, ?farm);
    { farm with parcels = farm.parcels.values().toArray() };
  };

  public query ({ caller }) func getFarm() : async ?FarmSnapshot {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their farm");
    };
    switch (farms.get(caller)) {
      case (?(?farm)) { ?{ farm with parcels = farm.parcels.values().toArray() } };
      case (_) { null };
    };
  };

  func updateFarmParcel(parcel : Parcel, parcelsMap : Map.Map<Text, Parcel>) : () {
    parcelsMap.add(parcel.id, parcel);
  };

  public shared ({ caller }) func updateParcel(parcel : Parcel) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update parcels");
    };
    await checkHasFarm(caller);
    let farm = getFarmByCaller(caller);
    let parcelsMap = farm.parcels;
    updateFarmParcel(parcel, parcelsMap);
  };

  public shared ({ caller }) func updateSoilMoisture(newMoisture : Nat8) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update soil moisture");
    };

    switch (farms.get(caller)) {
      case (?(?farm)) {
        let updatedFarm = updateParcelClimate(newMoisture, farm);
        farms.add(caller, ?updatedFarm);
      };
      case (_) {
        Runtime.trap("No farm found for caller");
      };
    };
  };

  public shared ({ caller }) func getFertilizerRate() : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get fertilizer rate");
    };

    switch (farms.get(caller)) {
      case (?(?farm)) {
        let parcelId = "organicVegetableParcel";
        switch (farm.parcels.get(parcelId)) {
          case (?parcel) { parcel.fertilizerAndPesticideUsage.fertilizerRate };
          case (null) { null };
        };
      };
      case (_) {
        Runtime.trap("No farm found for caller");
      };
    };
  };

  func getSoilTypeYieldMultiplier(soilType : SoilType) : Float {
    switch (soilType) {
      case (#gliniasta) { 1.0 };
      case (#piaszczysto_gliniasta) { 0.85 };
      case (#piaszczysta) { 0.7 };
      case (#podmokla) { 0.6 };
    };
  };

  func getRandomParcelProfiles(_seed : Text) : Farm {
    let randomNum = 42;
    initializeFarmForWinter("world_id_1", "candy_farm_1", [
      generateParcel("organicVegetableParcel", randomNum),
      generateParcel("premiumHayMeadow", randomNum),
    ]);
  };

  func generateParcel(parcelId : Text, randomNum : Nat) : Parcel {
    {
      id = parcelId;
      size = parcelId.size();
      parcelType = if (randomNum % 2 == 0) { #focus } else { #standard };
      suitableFor = [];
      currentQuality = #high;
      pasturesCurrentQuality = #medium;
      cropRotationHistory = [];
      livestockRotationHistory = [];
      infrastructure = [];
      terrainDifficulty = 5;
      rotationHistory = [];
      organicTransitionState = #none;
      fertilizerAndPesticideUsage = {
        fertilizerType = ?("Randomized Fertilizer");
        fertilizerRate = ?0;
        pesticideType = ?("Randomized Pesticide");
        pesticideRate = ?0;
        organicStandardsMet = false;
      };
      irrigationSystemState = {
        efficiency = ?90;
        energyConsumption = ?15;
        automationLevel = ?("medium");
        resourceEfficiency = ?75;
        waterSource = ?("well");
        reliability = ?("medium");
      };
      temporarySoilQualityBoost = #none;
      coverCropHistory = [];
      weatherAdaptationStatus = [];
      maintained = false;
      fallowFieldEquivalent = false;
    };
  };

  public query ({ caller }) func getParcel(parcelId : Text) : async Result<Parcel, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view parcels");
    };
    switch (farms.get(caller)) {
      case (?(?farm)) {
        switch (farm.parcels.get(parcelId)) {
          case (?parcel) { #ok(parcel) };
          case (null) { #err("Parcel not found") };
        };
      };
      case (_) { #err("Farm not found") };
    };
  };

  func updateParcelClimate(_newMoisture : Nat8, farm : Farm) : Farm {
    let parcelsMap = farm.parcels;
    switch (parcelsMap.get("organicVegetableParcel")) {
      case (?parcel) {
        parcelsMap.add("organicVegetableParcel", parcel);
      };
      case (null) {};
    };
    { farm with parcels = parcelsMap };
  };

  func checkHasFarm(caller : Principal) : async () {
    switch (farms.get(caller)) {
      case (?farm) {
        switch (farm) {
          case (null) {
            Runtime.trap("No farm found for caller");
          };
          case (_) {};
        };
      };
      case (null) {
        Runtime.trap("No farm record found for caller");
      };
    };
  };

  func getFarmByCaller(caller : Principal) : Farm {
    switch (farms.get(caller)) {
      case (?(?farm)) { farm };
      case (_) { Runtime.trap("No farm for caller found") };
    };
  };

  var caffeineMasterPrompt : ?CaffeineMasterPrompt = null;
  let userGameData = Map.empty<Principal, UserGameData>();

  public shared ({ caller }) func saveUserGameData(planInput : GameDesignPlan, gddDraft : GameDesignDocument) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save game data");
    };
    let data : UserGameData = {
      planInput;
      gddDraft;
    };
    userGameData.add(caller, data);
  };

  public query ({ caller }) func getUserGameData() : async ?UserGameData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access game data");
    };
    userGameData.get(caller);
  };

  public shared ({ caller }) func updateCaffeineMasterPrompt(prompt : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update the master prompt");
    };
    caffeineMasterPrompt := ?{ prompt };
  };

  public query ({ caller }) func getCaffeineMasterPrompt() : async ?CaffeineMasterPrompt {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access the master prompt");
    };
    caffeineMasterPrompt;
  };

  func getFocusAreaSetup(focusArea : { #organicVegetableArea }) : Map.Map<Text, Parcel> {
    let parcels = Map.empty<Text, Parcel>();
    switch (focusArea) {
      case (#organicVegetableArea) {
        parcels.add("organicVegetableParcel", getRandomOrganicVegetableParcel());
        parcels.add("vegetableRotationParcel", getRandomRotationParcel());
        parcels.add("vegetableRotationParcel2", getRandomRotationParcel());
        parcels.add("vegetableRotationParcel3", getRandomRotationParcel());
      };
    };
    parcels;
  };

  func getPastureParcelSetup(parcelId : Text) : Parcel {
    {
      id = parcelId;
      size = 20;
      parcelType = #focus;
      suitableFor = [#carrot];
      currentQuality = #high;
      pasturesCurrentQuality = #medium;
      cropRotationHistory = [];
      livestockRotationHistory = [];
      infrastructure = [];
      terrainDifficulty = 4;
      rotationHistory = [];
      organicTransitionState = #completed;
      fertilizerAndPesticideUsage = {
        fertilizerType = null;
        fertilizerRate = null;
        pesticideType = null;
        pesticideRate = null;
        organicStandardsMet = true;
      };
      irrigationSystemState = {
        efficiency = ?80;
        energyConsumption = ?10;
        automationLevel = ?("high");
        resourceEfficiency = ?85;
        waterSource = ?("river");
        reliability = ?("high");
      };
      temporarySoilQualityBoost = #none;
      coverCropHistory = [];
      weatherAdaptationStatus = [];
      maintained = true;
      fallowFieldEquivalent = true;
    };
  };

  func getPremiumHayMeadowParcel() : Parcel {
    let meadowParcel = getPastureParcelSetup("premiumHayMeadow");
    let intensiveVegetablePlots = getIntensiveVegetablePlots();
    let allParcels = Map.empty<Text, Parcel>();

    allParcels.add(meadowParcel.id, meadowParcel);

    for ((id, parcel) in intensiveVegetablePlots.entries()) {
      allParcels.add(id, parcel);
    };

    let focusAreaSetup = getFocusAreaSetup(#organicVegetableArea);

    for ((id, parcel) in focusAreaSetup.entries()) {
      allParcels.add(id, parcel);
    };

    getRandomOrganicVegetableParcel();
  };

  func getIntensiveVegetablePlots() : Map.Map<Text, Parcel> {
    let plots = Map.empty<Text, Parcel>();
    let vegetables = [#carrot, #corn, #potato];

    for (veg in vegetables.values()) {
      let parcel = getRotationParcelWithVegetables(veg);
      plots.add(parcel.id, parcel);
    };

    plots;
  };

  func getRandomRotationParcel() : Parcel {
    getRandomVegetableParcel();
  };

  func getRandomVegetableParcel() : Parcel {
    getRotationParcelWithVegetables(getRandomVegetable());
  };

  func getRandomOrganicVegetableParcel() : Parcel {
    getOrganicVegetableParcel(getRandomVegetable());
  };

  func getOrganicVegetableParcel(_veg : CropType) : Parcel {
    {
      id = "organicVegetableParcel";
      size = 50;
      parcelType = #focus;
      suitableFor = [#carrot];
      currentQuality = #high;
      pasturesCurrentQuality = #high;
      cropRotationHistory = [];
      livestockRotationHistory = [];
      infrastructure = [];
      terrainDifficulty = 5;
      rotationHistory = [];
      organicTransitionState = #completed;
      fertilizerAndPesticideUsage = {
        fertilizerType = null;
        fertilizerRate = null;
        pesticideType = null;
        pesticideRate = null;
        organicStandardsMet = true;
      };
      irrigationSystemState = {
        efficiency = ?95;
        energyConsumption = ?8;
        automationLevel = ?("very high");
        resourceEfficiency = ?95;
        waterSource = ?("well");
        reliability = ?("excellent");
      };
      temporarySoilQualityBoost = #none;
      coverCropHistory = [];
      weatherAdaptationStatus = [];
      maintained = true;
      fallowFieldEquivalent = false;
    };
  };

  func getRotationParcelWithVegetables(crop : CropType) : Parcel {
    {
      id = "vegetableRotationParcel";
      size = 30;
      parcelType = #standard;
      suitableFor = [crop];
      currentQuality = #high;
      pasturesCurrentQuality = #medium;
      cropRotationHistory = [crop];
      livestockRotationHistory = [];
      infrastructure = [];
      terrainDifficulty = 4;
      rotationHistory = [];
      organicTransitionState = #inProgress { yearsRemaining = 1 };
      fertilizerAndPesticideUsage = {
        fertilizerType = ?("Organic Compost");
        fertilizerRate = ?8;
        pesticideType = ?("Neem Oil");
        pesticideRate = ?2;
        organicStandardsMet = true;
      };
      irrigationSystemState = {
        efficiency = ?85;
        energyConsumption = ?10;
        automationLevel = ?("medium");
        resourceEfficiency = ?80;
        waterSource = ?("river");
        reliability = ?("good");
      };
      temporarySoilQualityBoost = #active { strength = 6 };
      coverCropHistory = ["Clover"];
      weatherAdaptationStatus = ["Drought Tolerant"];
      maintained = true;
      fallowFieldEquivalent = true;
    };
  };

  func getSeasons() : [Season] {
    [#spring, #summer, #fall, #winter];
  };

  func getDefaultSeason() : Season {
    #winter;
  };

  func initializeFarmForWinter(_worldId : Text, farmId : Text, parcels : [Parcel]) : Farm {
    let parcelMap = Map.empty<Text, Parcel>();

    if (parcels.size() > 0) {
      let lastParcel = parcels[parcels.size() - 1];
      if (parcels.size() > 1) {
        let rest = parcels.sliceToArray(0, parcels.size() - 1);
        for (parcel in rest.values()) {
          parcelMap.add(parcel.id, parcel);
        };
      };
      parcelMap.add(lastParcel.id, lastParcel);
    };

    {
      id = farmId;
      owner = Principal.fromText("1");
      name = farmId;
      initialBoosts = "Winter Crop Bonus";
      initialEquipmentAndResources = "Winter-ready machinery";
      landDetail = "Winter-focused soil";
      inventoryItems = "Winter seeds";
      perksAndChallenges = "Winter gardening skills";
      parcels = parcelMap;
    };
  };

  func getRandomVegetable() : CropType {
    #carrot;
  };

  type IntegrationParams = {
    position : Text;
    farmPosition : Text;
    worldId : Text;
    farmId : Text;
  };

  public shared ({ caller }) func integrateFarmByWorldId(_params : IntegrationParams) : async FarmSnapshot {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can integrate farms");
    };
    let worldId = "world_id_1";
    let farmId = "candy_farm_1";
    { (integrateFarmByIdAndPosition(worldId, farmId)) with
      parcels = getRandomParcelProfiles(caller.toText()).parcels.values().toArray()
    };
  };

  func integrateFarmByIdAndPosition(_worldId : Text, _farmId : Text) : Farm {
    getRandomParcelProfiles(_worldId);
  };

  let marketPrices = Map.empty<Text, Text>();

  public shared ({ caller }) func requestMarketPriceTrend(_product : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request market price trends");
    };
    "Increasing";
  };

  public shared ({ caller }) func recommendHedgingStrategy(_product : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request hedging strategies");
    };
    "Forward Contracts";
  };

  public shared ({ caller }) func recommendDiversification(_currentProducts : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request diversification recommendations");
    };
    "Add Livestock";
  };

  func createRandomParcels() : [CherryParcel] {
    let randomSoilTypes = [#piaszczysto_gliniasta, #gliniasta, #piaszczysta, #podmokla];
    let randomPHValues : [Float] = [6.0, 6.5, 7.0, 7.5];
    let randomFertilityValues : [Nat] = [60, 70, 80, 90];
    let randomSizes : [Float] = [0.5, 1.0, 1.5, 2.0];

    let parcels : [CherryParcel] = [
      createRandomParcel("Parcel1", 0, randomSoilTypes, randomPHValues, randomFertilityValues, randomSizes),
      createRandomParcel("Parcel2", 1, randomSoilTypes, randomPHValues, randomFertilityValues, randomSizes),
      createRandomParcel("Parcel3", 2, randomSoilTypes, randomPHValues, randomFertilityValues, randomSizes),
      createRandomParcel("Parcel4", 3, randomSoilTypes, randomPHValues, randomFertilityValues, randomSizes),
    ];

    parcels;
  };

  func createRandomParcel(
    parcelId : Text,
    _index : Nat,
    soilTypes : [SoilType],
    phValues : [Float],
    fertilityValues : [Nat],
    sizes : [Float],
  ) : CherryParcel {
    {
      id = parcelId;
      ownerId = "";
      soilType = soilTypes[0];
      pH = phValues[0];
      fertility = fertilityValues[0];
      size = sizes[0];
      plantedTrees = 0;
      treeAge = 0;
      isOrganic = false;
      organicConversionSeason = null;
      organicCertified = false;
      lastHarvest = null;
    };
  };

  func createRandomInfrastructure() : [InfrastructureDetails] {
    [
      {
        infrastructureType = #BasicIrrigation;
        cost = 200;
        lifespan = 5;
        yieldModifier = 1.1;
        laborCostModifier = null;
      },
      {
        infrastructureType = #Greenhouse;
        cost = 500;
        lifespan = 8;
        yieldModifier = 1.2;
        laborCostModifier = null;
      },
    ];
  };

  func getOrCreatePlayerFarm(caller : Principal) : PlayerFarm {
    switch (playerFarms.get(caller)) {
      case (?farm) { farm };
      case (null) {
        {
          owner = caller;
          parcels = [];
          infrastructure = [];
          inventory = { cash = 100_000; cherries = 0; organicCherries = 0 };
          statistics = {
            totalYieldLifetime = 0;
            totalRevenueLifetime = 0;
            totalInvestment = 0;
            marketShare = 0.0;
            organicParcels = 0;
            averageQuality = 0.0;
          };
          level = 1;
          experience = 0;
        };
      };
    };
  };

  func calculateParcelCost(size : Float) : Nat {
    (size * 60_000.0).toInt().toNat();
  };

  func hasEnoughCash(farm : PlayerFarm, cost : Nat) : Bool {
    farm.inventory.cash >= cost;
  };

  func generateParcelId() : Text {
    let time : Int = Time.now();
    "parcel_" # time.toText();
  };

  func getRandomSoilType() : SoilType {
    let options = [#piaszczysto_gliniasta, #gliniasta, #piaszczysta, #podmokla];
    options[0];
  };

  func getRandomPH() : Float {
    let options = [6.0, 6.5, 7.0, 7.5];
    options[0];
  };

  func getRandomFertility() : Nat {
    let options = [60, 70, 80, 90];
    options[0];
  };

  func createNewCherryParcel(id : Text, ownerId : Text, soilType : SoilType, pH : Float, fertility : Nat, size : Float) : CherryParcel {
    {
      id;
      ownerId;
      soilType;
      pH;
      fertility;
      size;
      plantedTrees = 0;
      treeAge = 0;
      isOrganic = false;
      organicConversionSeason = null;
      organicCertified = false;
      lastHarvest = null;
    };
  };

  func updateInventory(inventory : Inventory, cost : Nat) : Inventory {
    {
      inventory with
      cash = inventory.cash - cost;
    };
  };

  func updateParcelsArray(parcels : [CherryParcel], newParcel : CherryParcel) : [CherryParcel] {
    parcels.concat([newParcel]);
  };

  func updatePlayerFarm(farm : PlayerFarm, cost : Nat, newParcel : CherryParcel) : PlayerFarm {
    {
      farm with
      inventory = updateInventory(farm.inventory, cost);
      parcels = updateParcelsArray(farm.parcels, newParcel);
    };
  };

  public shared ({ caller }) func purchaseParcel(_location : Location, size : Float) : async Result<Text, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can purchase parcels");
    };

    let farm = getOrCreatePlayerFarm(caller);
    let cost = calculateParcelCost(size);

    if (not hasEnoughCash(farm, cost)) {
      return #err("Insufficient funds");
    };

    let parcelId = generateParcelId();
    let soilType = getRandomSoilType();
    let pH = getRandomPH();
    let fertility = getRandomFertility();
    let newParcel = createNewCherryParcel(parcelId, "", soilType, pH, fertility, size);
    let updatedFarm = updatePlayerFarm(farm, cost, newParcel);

    playerFarms.add(caller, updatedFarm);
    #ok(parcelId);
  };

  public shared ({ caller }) func plantTrees(parcelId : Text, _hectares : Float) : async Result<Text, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can plant trees");
    };

    switch (playerFarms.get(caller)) {
      case (null) {
        return #err("Player not initialized");
      };
      case (?farm) {
        let (foundParcel, foundIndex) = findParcelIndex(farm.parcels, parcelId);
        switch (foundParcel, foundIndex) {
          case (null, _) {
            return #err("Parcel not found");
          };
          case (?parcel, ?index) {
            if (parcel.plantedTrees > 0) {
              return #err("Trees already planted");
            };

            let plantingCost = (parcel.size * 60_000.0).toInt().toNat();
            if (farm.inventory.cash < plantingCost) {
              return #err("Insufficient funds");
            };

            let treesToPlant = (400.0 * parcel.size).toInt().toNat();
            assert index < farm.parcels.size();
            let updatedParcel = { parcel with
              plantedTrees = treesToPlant;
              treeAge = 0;
            };
            let updatedParcels = farm.parcels.sliceToArray(0, index).concat([updatedParcel]).concat(farm.parcels.sliceToArray(index + 1, farm.parcels.size()));

            let updatedFarm = { farm with
              parcels = updatedParcels;
              inventory = {
                farm.inventory with
                cash = farm.inventory.cash - plantingCost;
              };
            };

            playerFarms.add(caller, updatedFarm);
            return #ok("Trees planted: " # treesToPlant.toText());
          };
          case (?_, null) {
            return #err("Parcel not found");
          };
        };
      };
    };
  };

  func findParcelIndex(parcels : [CherryParcel], id : Text) : (?CherryParcel, ?Nat) {
    var idx = 0;
    while (idx < parcels.size()) {
      if (parcels[idx].id == id) {
        return (?parcels[idx], ?idx);
      };
      idx += 1;
    };
    (null, null);
  };

  public shared ({ caller }) func harvest(parcelId : Text) : async Result<Nat, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can harvest");
    };

    let farm = switch (playerFarms.get(caller)) {
      case (null) { return #err("Player not initialized") };
      case (?farm) { farm };
    };

    let (parcelOpt, parcelIndexOpt) = findParcelIndex(farm.parcels, parcelId);
    let (parcel, index) = switch (parcelOpt, parcelIndexOpt) {
      case (null, _) { return #err("Parcel not found") };
      case (?parcel, ?index) {
        if (parcel.plantedTrees == 0) { return #err("No trees planted") };
        (parcel, index);
      };
      case (?_, null) {
        return #err("Parcel not found");
      };
    };

    let baseYield = calculateBaseYield(parcel);
    let modifiedYield = matchTreeAgeModifier(parcel.treeAge, baseYield);

    switch (modifiedYield) {
      case (null) { return #err("Trees too old") };
      case (?harvestedKg) {
        let oldInventory = farm.inventory;
        let newInventory = if (parcel.organicCertified) {
          {
            oldInventory with
            organicCherries = oldInventory.organicCherries + harvestedKg;
          };
        } else {
          {
            oldInventory with
            cherries = oldInventory.cherries + harvestedKg;
          };
        };

        let timeSeed = Time.now().toNat();
        let updatedParcel = {
          parcel with lastHarvest = ?timeSeed;
        };

        let updatedParcels = farm.parcels.map(
          func(p) {
            if (p.id == parcelId) { updatedParcel } else { p };
          }
        );

        let updatedFarm : PlayerFarm = {
          farm with
          statistics = {
            farm.statistics with totalYieldLifetime = farm.statistics.totalYieldLifetime + harvestedKg
          };
          inventory = newInventory;
          parcels = updatedParcels;
        };
        playerFarms.add(caller, updatedFarm);

        #ok(harvestedKg);
      };
    };
  };

  func calculateBaseYield(parcel : CherryParcel) : Nat {
    let baseYieldPerHa = 8000.0;
    let soilModifier = getSoilTypeYieldMultiplier(parcel.soilType);
    let pHModifier = Float.max((1.0 - Float.abs(parcel.pH - 6.5) * 0.15), 0.5);
    let fertilityModifier = parcel.fertility.toFloat() / 100.0;

    let finalYield = baseYieldPerHa * soilModifier * pHModifier * fertilityModifier * parcel.size;
    finalYield.toInt().toNat();
  };

  func matchTreeAgeModifier(treeAge : Nat, baseYield : Nat) : ?Nat {
    let modifier : Float = if (treeAge == 0) { return ?0 } else if (treeAge == 1) { 0.33 } else if (treeAge == 2) { 0.66 } else if (treeAge >= 3 and treeAge <= 40) {
      1.0;
    } else if (treeAge > 40) { return null } else {
      1.0;
    };
    let result = (baseYield.toFloat() * modifier).toInt().toNat();
    ?result;
  };

  public shared ({ caller }) func upgradeInfrastructure(_parcelId : Text, _infraType : Text) : async Result<Text, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upgrade infrastructure");
    };
    #ok("infrastructure_added");
  };

  public shared ({ caller }) func startOrganicConversion(_parcelId : Text) : async Result<Text, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start organic conversion");
    };
    #ok("conversion_started");
  };

  public shared ({ caller }) func sellCherries(_quantity : Nat, _saleType : Text) : async Result<Nat, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can sell cherries");
    };
    #ok(0);
  };

  public shared ({ caller }) func advanceSeason(_weatherEvent : ?Text) : async Result<Text, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can advance the season");
    };
    #ok("season_advanced");
  };

  public type World = actor {
    farmIntegrationRequested : shared Text -> async FarmSnapshot;
    marketConnectionRequested : shared Text -> async ();
    gddConnectionRequested : shared Text -> async ();
    rankingConnectionRequested : shared Text -> async ();
    farmingTeamConnectionRequested : shared Text -> async ();
    chatConnectionRequested : shared Text -> async ();
    simulationConnectionRequested : shared Text -> async ();
    analyticsConnectionRequested : shared Text -> async ();
  };
};
