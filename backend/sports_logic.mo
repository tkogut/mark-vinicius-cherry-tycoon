// sports_logic.mo — Phase 2: Sports Patron, the club catalogue
//
// Pure module. No state, no upgrade concerns, deterministic.
//
// Why the catalogue lives here rather than in a `stable var`:
//   A club's identity (name, village, league, stadium, squad) is static game
//   data, exactly like `getInfrastructureCost`'s price table. Only OWNERSHIP
//   changes at runtime, and that is the only thing main.mo persists. Keeping
//   the catalogue as code means `getAvailableFootballClubs` can stay a `query`
//   (a query cannot mutate, so it could never lazily seed a stable var), and a
//   canister upgrade can add or retune clubs without a migration.
//
// Ownership model — deliberately single-patron:
//   `Types.FootballClub` carries one `ownerId` and one `ownershipPercent`, and
//   the GDD frames the player as *the* local benefactor of a village club, not
//   one shareholder among many. So a club is unclaimed or belongs to exactly
//   one patron who holds 1-100% of it. Anything else would need a type change.
//
// Setting per `docs/game-design/economy/gdd-sports-patron.md`: the lower Polish
// pyramid in Opolskie — Klasa Okręgowa and Klasa A, i.e. village and small-town
// football, not professional leagues.
//
// KNOWN NAMING DRIFT (SPORTS-04): `Types.League` spells these `#Liga3`/`#Liga4`,
// which in the real Polish pyramid means III/IV liga — four tiers above what
// this module actually models. Renaming the variant is a Candid contract change,
// so it is flagged rather than done here. `#Liga3` is the higher of our two
// tiers (Klasa Okręgowa), `#Liga4` the lower (Klasa A), and the frontend
// displays the correct Polish names.

import Types "types";
import Array "mo:base/Array";

module {

  type FootballClub = Types.FootballClub;

  // ---------------------------------------------------------------------------
  // Region helper
  // ---------------------------------------------------------------------------
  // Every club sits in a real Opolskie commune. `marketSize` and
  // `laborCostMultiplier` are carried because `Region` requires them; nothing in
  // this slice reads them (the orchard-impact tiers that would are Tier work,
  // out of scope — see SPORTS-05).

  private func opolskie(
    county: Text,
    commune: Text,
    communeType: Types.CommuneType,
    population: Nat
  ) : Types.Region {
    {
      province = #Opolskie;
      county = county;
      commune = commune;
      communeType = communeType;
      population = population;
      marketSize = switch (communeType) {
        case (#Urban) { 0.9 };
        case (#Mixed) { 0.8 };
        case (#Rural) { 0.6 };
      };
      laborCostMultiplier = switch (communeType) {
        case (#Urban) { 1.1 };
        case (#Mixed) { 1.0 };
        case (#Rural) { 0.85 };
      };
    }
  };

  // ---------------------------------------------------------------------------
  // getClubCatalogue
  // ---------------------------------------------------------------------------
  // Eight clubs, unowned as authored. `main.mo` overlays persisted ownership.
  //
  // Valuation rationale — a patron should be able to reach Klasa A on a good
  // year but need real capital for the Okręgówka side, so values are set
  // against the orchard economy rather than picked for flavour:
  //   Klasa A         120_000 - 180_000 PLN  (1% costs 1_200 - 1_800)
  //   Klasa Okręgowa  240_000 - 420_000 PLN  (1% costs 2_400 - 4_200)
  // The starting farm holds 38_000 cash, so a token 1% stake is an early-game
  // decision and a controlling stake is a mid-game one.
  //
  // leaguePosition is the authored standing at season start; nothing advances it
  // yet (match simulation is Tier/TPI work, SPORTS-06). It is displayed as the
  // table position, which is true — it just does not move. Do not present it as
  // a live result.

  public func getClubCatalogue() : [FootballClub] {
    [
      // ---- Klasa Okręgowa (the higher tier we model) ----
      {
        id = "KS_GLUBCZYCE";
        name = "KS Głubczyce";
        region = opolskie("Głubczyce", "Głubczyce", #Mixed, 12_800);
        league = #Liga3;
        ownerId = null;
        ownershipPercent = 0;
        marketValue = 420_000;
        leaguePosition = 2;
        stadiumCapacity = 1_500;
        stadiumQuality = 55;
        ticketRevenue = 48_000;
        tvRights = 0;          // no TV money at this level — deliberately zero
        playerWages = 96_000;
        squadSize = 24;
        squadValue = 180_000;
        youthDevelopment = 40;
      },
      {
        id = "LZS_NAMYSLOW";
        name = "LZS Namysłów";
        region = opolskie("Namysłów", "Namysłów", #Mixed, 16_200);
        league = #Liga3;
        ownerId = null;
        ownershipPercent = 0;
        marketValue = 340_000;
        leaguePosition = 5;
        stadiumCapacity = 1_200;
        stadiumQuality = 45;
        ticketRevenue = 36_000;
        tvRights = 0;
        playerWages = 78_000;
        squadSize = 22;
        squadValue = 140_000;
        youthDevelopment = 55;
      },
      {
        id = "OKS_OPOLE";
        name = "OKS Odra Opole II";
        region = opolskie("Opole", "Opole", #Urban, 127_500);
        league = #Liga3;
        ownerId = null;
        ownershipPercent = 0;
        marketValue = 380_000;
        leaguePosition = 1;
        stadiumCapacity = 2_400;
        stadiumQuality = 70;
        ticketRevenue = 62_000;
        tvRights = 0;
        playerWages = 110_000;
        squadSize = 26;
        squadValue = 210_000;
        youthDevelopment = 65;
      },
      {
        id = "GKS_PRUDNIK";
        name = "GKS Pogoń Prudnik";
        region = opolskie("Prudnik", "Prudnik", #Mixed, 21_400);
        league = #Liga3;
        ownerId = null;
        ownershipPercent = 0;
        marketValue = 240_000;
        leaguePosition = 9;
        stadiumCapacity = 900;
        stadiumQuality = 35;
        ticketRevenue = 24_000;
        tvRights = 0;
        playerWages = 66_000;
        squadSize = 21;
        squadValue = 95_000;
        youthDevelopment = 30;
      },
      // ---- Klasa A (village football — the entry tier for a patron) ----
      {
        id = "LZS_KIETRZ";
        name = "LZS Kietrz";
        region = opolskie("Głubczyce", "Kietrz", #Rural, 5_900);
        league = #Liga4;
        ownerId = null;
        ownershipPercent = 0;
        marketValue = 180_000;
        leaguePosition = 3;
        stadiumCapacity = 500;
        stadiumQuality = 30;
        ticketRevenue = 9_000;
        tvRights = 0;
        playerWages = 28_000;
        squadSize = 19;
        squadValue = 48_000;
        youthDevelopment = 45;
      },
      {
        id = "LZS_BRANICE";
        name = "LZS Branice";
        region = opolskie("Głubczyce", "Branice", #Rural, 6_300);
        league = #Liga4;
        ownerId = null;
        ownershipPercent = 0;
        marketValue = 145_000;
        leaguePosition = 7;
        stadiumCapacity = 400;
        stadiumQuality = 22;
        ticketRevenue = 6_500;
        tvRights = 0;
        playerWages = 21_000;
        squadSize = 18;
        squadValue = 34_000;
        youthDevelopment = 25;
      },
      {
        id = "LZS_LUBRZA";
        name = "LZS Lubrza";
        region = opolskie("Prudnik", "Lubrza", #Rural, 4_100);
        league = #Liga4;
        ownerId = null;
        ownershipPercent = 0;
        marketValue = 120_000;
        leaguePosition = 11;
        stadiumCapacity = 300;
        stadiumQuality = 18;
        ticketRevenue = 4_200;
        tvRights = 0;
        playerWages = 17_000;
        squadSize = 17;
        squadValue = 26_000;
        youthDevelopment = 60; // poor squad, strong village youth setup
      },
      {
        id = "LZS_STRZELECZKI";
        name = "LZS Strzeleczki";
        region = opolskie("Krapkowice", "Strzeleczki", #Rural, 3_800);
        league = #Liga4;
        ownerId = null;
        ownershipPercent = 0;
        marketValue = 132_000;
        leaguePosition = 5;
        stadiumCapacity = 350;
        stadiumQuality = 25;
        ticketRevenue = 5_100;
        tvRights = 0;
        playerWages = 19_000;
        squadSize = 18;
        squadValue = 31_000;
        youthDevelopment = 35;
      }
    ]
  };

  // ---------------------------------------------------------------------------
  // findClub
  // ---------------------------------------------------------------------------

  public func findClub(clubId: Text) : ?FootballClub {
    Array.find<FootballClub>(getClubCatalogue(), func(c) { c.id == clubId })
  };

  // ---------------------------------------------------------------------------
  // getSharePrice
  // ---------------------------------------------------------------------------
  // Cost of `percent` percent of a club valued at `marketValue`.
  //
  // Integer division truncates, and that truncation favours the player, so the
  // floor is 1 PLN per percent — a stake must never be free. Mirrored in
  // frontend/src/lib/gameLogic.ts (getClubSharePrice) and enforced by
  // economyParity.test.ts.

  public func getSharePrice(marketValue: Nat, percent: Nat) : Nat {
    let price = (marketValue * percent) / 100;
    if (price == 0 and percent > 0) { percent } else { price }
  };

  // ---------------------------------------------------------------------------
  // applyOwnership
  // ---------------------------------------------------------------------------
  // Overlays persisted ownership onto the authored catalogue. `ownership` is
  // main.mo's stable list of (clubId, ownerId, percent).

  public func applyOwnership(
    clubs: [FootballClub],
    ownership: [(Text, Text, Nat)]
  ) : [FootballClub] {
    Array.map<FootballClub, FootballClub>(clubs, func(club) {
      switch (Array.find<(Text, Text, Nat)>(ownership, func((id, _, _)) { id == club.id })) {
        case (?(_, ownerId, percent)) {
          { club with ownerId = ?ownerId; ownershipPercent = percent }
        };
        case null { club };
      }
    })
  };

  // ---------------------------------------------------------------------------
  // validatePurchase
  // ---------------------------------------------------------------------------
  // Every rule a share purchase must satisfy, in one place so main.mo reads as
  // a sequence of decisions rather than nested ifs. Returns null when the
  // purchase is legal, or the reason it is not.
  //
  // `currentOwner` is the club's persisted owner, if any. Under the
  // single-patron model a club already claimed by someone else is closed —
  // there is no share market between players in this slice.

  public type PurchaseRejection = {
    #UnknownClub;
    #InvalidAmount;         // 0, or more than 100
    #ClubTakenByAnother;
    #NotEnoughSharesLeft : { requested: Nat; available: Nat };
    #CannotAfford : { required: Nat; available: Nat };
  };

  public func validatePurchase(
    club: ?FootballClub,
    currentOwner: ?(Text, Nat),
    buyerId: Text,
    percent: Nat,
    buyerCash: Nat
  ) : ?PurchaseRejection {
    switch (club) {
      case null { ?#UnknownClub };
      case (?found) {
        if (percent == 0 or percent > 100) { return ?#InvalidAmount };

        let held = switch (currentOwner) {
          case (?(ownerId, ownedPercent)) {
            if (ownerId != buyerId) { return ?#ClubTakenByAnother };
            ownedPercent
          };
          case null { 0 };
        };

        let available : Nat = 100 - held;
        if (percent > available) {
          return ?#NotEnoughSharesLeft { requested = percent; available = available };
        };

        let cost = getSharePrice(found.marketValue, percent);
        if (buyerCash < cost) {
          return ?#CannotAfford { required = cost; available = buyerCash };
        };

        null
      };
    }
  };
}
