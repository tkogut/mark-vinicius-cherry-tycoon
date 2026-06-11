# State Schema — AntiGravity Backend
> **Rule**: Agenci MUSZĄ sprawdzić ten plik przed dodaniem nowych zmiennych stanu. Segregacja Track A/B jest bezwzględna.

## Track A — Stable Var Schema (main.mo)

```motoko
// Player
stable var players : [(PlayerId, PlayerState)] = [];
stable var parcels  : [(ParcelId, ParcelState)] = [];

// Economy
stable var contracts : [(ContractId, Contract)] = [];
stable var marketHistory : [(Nat, MarketEntry)] = [];

// World
stable var currentSeason : Season = #Spring;
stable var currentWeather : WeatherType = #Sunny;
stable var turnCounter : Nat = 0;
```

## Track B — Transient Schema (main_mainnet.mo)

```motoko
// Uses Enhanced Orthogonal Persistence (EOP)
// Variables declared WITHOUT 'stable' keyword
// Runtime state is automatically persisted by the IC
transient var players : HashMap<PlayerId, PlayerState> = ...;
transient var parcels  : HashMap<ParcelId, ParcelState> = ...;
```

## Upgrade Safety Rules

1. `preupgrade` hook MUST serialize all `stable var` to temp arrays.
2. `postupgrade` hook MUST reconstruct HashMaps from those arrays.
3. **Test pattern**: `deploy → populate → upgrade → verify exact state`.
4. No new `stable var` added without updating `preupgrade`/`postupgrade`.
