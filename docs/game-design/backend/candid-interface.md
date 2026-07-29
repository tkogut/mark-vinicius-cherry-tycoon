# Candid Interface Spec — AntiGravity Backend
> **Rule**: Agenci MUSZĄ sprawdzić ten plik przed zmianą publicznego API canistera. Zmiany Candid wymagają aktualizacji OBYDWU Track A i Track B.

## Core Types

```candid
type Season = variant { Spring; Summer; Autumn; Winter };
type WeatherType = variant { Sunny; Cloudy; Rainy; Heatwave; Frost; Drought };
type GamePhase = variant { PreSeason; GrowingPhase; HarvestPhase; WinterRest };
type Infrastructure = variant {
    Warehouse; ColdStorage; Tractor; Shaker; Sprayer; GoldenHarvester
};
type ContractStatus = variant {
    Active; Fulfilled; Defaulted; Cancelled
};
type GameError = variant {
    NotOwner; NotFound; InsufficientFunds; InvalidAction; AlreadyExists
};
```

## Key Actions per Phase

| Phase | Allowed Actions |
|---|---|
| `PreSeason` | `initializePlayer`, `hireLaborers`, `purchaseInfrastructure` |
| `GrowingPhase` | `waterParcel`, `fertilize`, `applyBioStimulant`, `advancePhase` |
| `HarvestPhase` | `harvestCherries`, `sellToMarket`, `bidOnContract`, `advancePhase` |
| `WinterRest` | `upgradeInfrastructure`, `planNextSeason`, `advancePhase` |

## Public API Surface (both main.mo + main_mainnet.mo)

```candid
service : {
  // Player
  initializePlayer : () -> (Result);
  getPlayerState   : () -> (PlayerState) query;

  // Farm
  waterParcel      : (text) -> (Result);
  harvestCherries  : (text) -> (Result);
  advancePhase     : () -> (Result);

  // Market
  sellToMarket     : (text, nat) -> (Result);
  bidOnContract    : (text, nat) -> (Result);
}
```
