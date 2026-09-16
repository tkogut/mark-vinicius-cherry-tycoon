# Phase 3: Core Economic Lever Fixes - Pattern Map

**Mapped:** 2026-09-16
**Files analyzed:** 14 (new/modified, across ECON-01..07)
**Analogs found:** 11 / 14

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `backend/game_logic.mo` (`calculateYieldPotential` — ECON-01) | service (pure module) | transform | itself — extend existing formula, same file/function | exact (extend in place) |
| `backend/game_logic.mo` (`calculateRetailPrice`/`calculateWholesalePrice` — ECON-02) | service (pure module) | transform | itself — extend existing formula, same file/functions | exact (extend in place) |
| `backend/game_logic.mo` (delete `calculateSpoilageRate` — ECON-05) | service (pure module) | transform | `backend/storage_logic.mo`'s `calculateSpoilage` (the surviving sibling) | exact (surviving analog, nothing to write — deletion only) |
| `backend/main.mo` (`fertilizeParcel` — ECON-01 validation) | controller (canister method) | request-response | `backend/main.mo`'s `purchaseSupplies` (lines 352-368) | exact — same file, same closed-string-set validation shape |
| `backend/main.mo` (sell-price call sites — ECON-02) | controller (canister method) | request-response | `backend/main.mo`'s existing `calculateRetailPrice`/`calculateWholesalePrice` call site (~line 1313) | exact — same call site, add one argument |
| `backend/auction_logic.mo` (`resolveContract` — ECON-03 trickle computation) | service (pure module) | transform | itself — the `_RUNNER_UP_TRICKLE_NUM/DEN` constants and `winRevenue` computation already in this file | exact (extend in place) |
| `backend/types.mo` (`AuctionResult` — ECON-03 new fields) | model | CRUD (record shape) | itself — additive field alongside existing `winnerId`/`runnerUpId` | exact |
| `backend/main.mo` (contract-resolution loop — ECON-03/ECON-04) | controller (canister method) | event-driven (season-resolution batch) | `backend/main.mo`'s existing AI-winner branch (lines 3206-3216) as the pattern for the AI-runner-up branch; existing player-winner loop in `resolveSeasonAuctions` (lines ~3270-3288) as the pattern for the player-runner-up/prestige branch | exact — same file, sibling branches to copy |
| `frontend/src/lib/gameLogic.ts` (ECON-01/ECON-02 new mirror fns) | utility (formula mirror) | transform | itself — existing `getInfraModifier`/`calculateYieldBreakdown` mirror functions in the same file | exact |
| `frontend/src/__tests__/economyParity.test.ts` (new `describe` blocks) | test | transform (property/parity test) | itself — existing `describe('economy parity: infrastructure modifier term-by-term', ...)` block (lines 205-220+) | exact |
| `frontend/src/components/farm/modals/SellModal.tsx` (wire `seasonMod` — ECON-02) | component (modal) | request-response (preview calc) | itself — the file's own `pricingFactors` `useMemo` (lines 45-117) and the already-correct color logic at line 229 | exact (extend in place, no new component) |
| `frontend/src/App.tsx` (`handleParcelAction` fertilize call — ECON-01) | component (top-level orchestrator) | event-driven (UI action → mutation) | itself — same function's existing branches for other actions (lines 219-244) and its "Action Restricted" toast pattern | exact |
| new fertilizer-type picker (ECON-01, location: `ParcelCard.tsx` fertilize button + `ImperialOrchard.tsx` radial-menu item) | component (dropdown picker) | event-driven (UI action → mutation) | `frontend/src/components/ui/dropdown-menu.tsx` (the primitive itself — `DropdownMenuRadioGroup`/`DropdownMenuRadioItem` already exported) | **no analog usage exists** — primitive is installed but never consumed elsewhere in the app; this is genuinely new composition, not a copy of an existing consumer |
| `frontend/src/components/social/CompetitorsPanel.tsx` (ECON-06 field fix) | component (panel) | request-response | itself — same file's existing typed fields (`comp.productionCapacity` is already read correctly elsewhere in `useCompetitors`) | exact |
| `frontend/src/lib/gddTemplate.ts` (ECON-07 rename) | utility (static text/template) | transform (no runtime import) | `backend/competitor_logic.mo` (lines 54-109 — canonical Marek/Kasia/Hans names, the source of truth) | exact (text substitution, not a code pattern) |
| `docs/game-design/economy/spoilage-rates.md` (ECON-05 rewrite) | docs | n/a | `backend/storage_logic.mo`'s `calculateSpoilage` + its call site in `main.mo` (lines 1506-1515) | exact (source of truth to transcribe) |

## Pattern Assignments

### `backend/game_logic.mo` — `calculateYieldPotential` (ECON-01)

**Analog:** itself, lines 100-136 (existing multiplicative-term formula)

**Core pattern** (lines 100-136):
```motoko
public func calculateYieldPotential(
  parcel: CherryParcel,
  infrastructure: [Infrastructure]
) : ?Nat {
  let baseYield = 25.0;
  let ageModifier = switch (getTreeAgeModifier(parcel.treeAge)) {
    case null { return null };
    case (?mod) { mod };
  };
  let soilMod = getSoilModifier(parcel.soilType);
  let phMod = getPhModifier(parcel.pH);
  let fertilityMod = parcel.fertility;
  let infraMod = getInfrastructureModifier(infrastructure);
  let waterMod = if (parcel.waterLevel < 0.3) { 0.7 } else if (parcel.waterLevel > 0.8) { 0.85 } else { 1.0 };
  let organicMod = if (parcel.isOrganic) { 0.8 } else { 1.0 };
  let countyMod = switch (parcel.region.county) {
    case ("Głubczyce") { 1.10 };
    case ("Opole") { 1.08 };
    case ("Namysłów") { 1.05 };
    case (_) { 1.0 };
  };
  let totalYield = baseYield * soilMod * phMod * fertilityMod * infraMod * waterMod * organicMod * ageModifier * countyMod;
  let yieldPerHa = totalYield * parcel.size;
  ?Int.abs(Float.toInt(yieldPerHa * 1000.0))
};
```
**Apply per D-01:** add a `fertilizerTypeMod` term following the exact same `let X = ...; totalYield = ... * X` shape as `countyMod` — a `switch` over the locked type strings, `1.05` for Synthetic-Intensive and `1.0` for the other two. Insert it into the `totalYield` product in the same position style as `countyMod` (order matters for float precision parity — mirror the exact multiplication order in `gameLogic.ts`, per the existing `getInfraModifier` comment's warning about order-sensitivity).

**Validation pattern to copy for `_fertilizerType` → `fertilizerType`** (source: `backend/main.mo:352-368`, `purchaseSupplies`):
```motoko
if (supplyType != "fertilizer" and supplyType != "pesticide" and supplyType != "organicTreatment") {
  return #Err(#InvalidOperation("Invalid supply type. Must be 'fertilizer', 'pesticide', or 'organicTreatment'"));
};
```
Apply identically inside `fertilizeParcel` (currently `backend/main.mo:839-859`, param `_fertilizerType: Text` — drop the underscore once used), validating against the 3 locked type strings before computing the fertility/yield effect.

---

### `backend/game_logic.mo` — `calculateRetailPrice` / `calculateWholesalePrice` (ECON-02)

**Analog:** itself, lines 143-170 (existing pure-function-with-multiplier-param pattern)

**Core pattern** (lines 143-155):
```motoko
public func calculateRetailPrice(
  basePrice: Nat,
  marketSize: Float,
  quality: Nat,
  isOrganic: Bool,
  saturationMultiplier: Float
) : Float {
  let qualityBonus = 1.0 + (Float.fromInt(quality) / 100.0 * 0.3);
  let organicPremium = if (isOrganic) { 1.4 } else { 1.0 };
  let finalPrice = Float.fromInt(basePrice) * marketSize * qualityBonus * organicPremium * saturationMultiplier;
  finalPrice
};
```
**Apply per D-03/D-04:** add a new `seasonMultiplier: Float` parameter to both `calculateRetailPrice` and `calculateWholesalePrice`, multiplied into `finalPrice` in the same flat product — order does not matter relative to `saturationMultiplier`/`marketMult` (confirmed no cap sits between factors, per D-04). Values: Spring 0.9, Summer 1.15, Autumn 1.0, Winter 0.75. Update the `main.mo` call site (~line 1313, already has `farm.currentSeason` in scope) to pass it.

---

### `frontend/src/lib/gameLogic.ts` (ECON-01/ECON-02 mirrors)

**Analog:** itself, lines 22-60 (existing modifier-mirror export pattern)

**Pattern to copy** (lines 32-39, `getSoilModifier` — same shape as the new `getFertilizerTypeModifier`/season-multiplier functions should follow):
```typescript
export const getSoilModifier = (soilType: SoilType): number => {
    if ('SandyClay' in soilType) return 1.0;
    if ('Clay' in soilType) return 0.9;
    if ('Sandy' in soilType) return 0.85;
    if ('Waterlogged' in soilType) return 0.6;
    return 1.0;
};
```
New `getFertilizerTypeModifier(type: string): number` and `getSeasonSaleMultiplier(season: SeasonPhase): number` should follow this exact shape (plain exported function, string/variant discrimination, numeric return), and must be added to `frontend/src/lib/gameLogic.ts` in the same commit as the `game_logic.mo` change per CLAUDE.md's mirror rule. Note: there is currently **no mirror at all** for `calculateRetailPrice`/`calculateWholesalePrice` in `gameLogic.ts` (only yield/infra modifiers are mirrored there) — ECON-02 is the first time these formulas get a TS mirror; write it fresh following the same "one function per modifier, plain exported, no class" convention as the yield mirrors, not by copying the SellModal.tsx duplicate (see Anti-Pattern below).

---

### `frontend/src/components/farm/modals/SellModal.tsx` (ECON-02 — wire `seasonMod`)

**Analog:** itself, `pricingFactors` `useMemo`, lines 45-117

**Current dead field** (line 106):
```typescript
seasonMod: 1.0, // deprecated inside modal component but kept for UI
```
**Already-correct consumer color logic — do not touch** (line 229):
```typescript
<span className={`font-mono ${pricingFactors.seasonMod > 1 ? 'text-emerald-400' : (pricingFactors.seasonMod < 1 ? 'text-rose-400' : 'text-slate-400')}`}>
    x{pricingFactors.seasonMod.toFixed(2)}
</span>
```
**Apply:** replace the hardcoded `seasonMod: 1.0` with a call to the new `getSeasonSaleMultiplier(farm.currentSeason)` from `gameLogic.ts` (reuse the already-derived `seasonKey`/`farm.currentSeason` in scope at line 53), and multiply it into `finalUnitPrice` at lines 92/97 alongside the other multiplicative terms — following the file's own established `basePrice * marketSize * qualityBonus * organicMod * marketMult` chain shape.

**Anti-pattern warning (per RESEARCH.md):** do not leave this as a fourth independent reimplementation without a decision. The plan must explicitly choose either "extend this inline calc with the season term" (fast, keeps 3-copy duplication) or "refactor to import from `gameLogic.ts`" (removes a duplicate) — do not default silently.

---

### `backend/main.mo` — runner-up trickle + prestige (ECON-03/ECON-04)

**Analog — AI winner branch to clone for AI runner-up** (lines 3206-3216):
```motoko
switch (aiCompetitors.get(winId)) {
    case (?ai) {
        aiCompetitors.put(winId, { ai with
            totalRevenue = ai.totalRevenue + revenue;
            inventoryKg = remainder;
            prestige = ai.prestige + 5; // Win bonus
        });
    };
    case null {}; // Player winner handled in resolveSeasonAuctions
};
```
**Analog — player winner loop to extend for player runner-up + prestige** (lines ~3270-3288):
```motoko
for (c in stableAuctionContracts.vals()) {
  if (not c.isPreSeason and c.status == #Fulfilled and c.winnerPlayerId == ?callerText and c.awardedSeason == ?farm.seasonNumber) {
      // ... cashDelta += rev ...
      // MISSING: no equivalent of `prestige = prestige + 5` anywhere in this loop.
  };
};
```
**Apply:**
- ECON-03: in `auction_logic.mo`'s `resolveContract`, compute `runnerUpVolumeKg`/`runnerUpRevenue` using the existing (currently unused) `_RUNNER_UP_TRICKLE_NUM/DEN` constants (lines 57-59) — `requiredVolumeKg * 20 / 100 * runnerUp.offerPricePLN`, per D-05 (additive, does not touch winner's `winRevenue`). Add the two fields to `Types.AuctionResult` (additive Candid change — run `dfx generate backend` after). In `main.mo`, add a runner-up branch mirroring the AI-winner-branch shape above (`aiCompetitors.get(runnerUpId)`) AND a runner-up branch in the player loop mirroring the player-winner-loop shape above (`c.runnerUpPlayerId == ?callerText`) — both directions per Pitfall 3.
- ECON-04: in the player winner loop, add `reputation = Nat.min(100, farm.reputation + 5)` (flat +5 per D-06, matching AI's literal `prestige + 5` pattern) alongside the existing `cashDelta` accumulation — guard the ceiling since `reputation` is 0-100.

---

### `frontend/src/components/social/CompetitorsPanel.tsx` (ECON-06)

**Current bug** (line 29, 34):
```typescript
const competitors: Competitor[] = (rawCompetitors || []).map((comp: any) => ({
    ...
    marketShare: Number(comp.baseCapacity) / 100, // mock calculation
```
**Analog for the correct type** (`frontend/src/declarations/backend.did.d.ts:5-21`):
```typescript
export interface AICompetitor {
  'productionCapacity' : bigint,
  // ... reputation, prestige, county, preferredSaleType, etc.
}
```
**Apply:** replace `(comp: any)` with `(comp: AICompetitor)` (import the type from `@/declarations/backend.did`, matching how other hooks/components in this codebase type their canister results — e.g. `SellModal.tsx`'s `useMarketPrices`/`useFarm` typed returns), and change `comp.baseCapacity` → `comp.productionCapacity`. This also closes the `any`-hides-drift risk flagged in RESEARCH.md Pitfall 5.

---

### `frontend/src/App.tsx` (ECON-01 — fertilizer type flows through)

**Analog:** itself, `handleParcelAction`, lines 219-244

**Current hardcoded call site** (line 244):
```typescript
} else if (action === 'fertilize') {
    fertilize.mutate({ parcelId, fertilizerType: "NPK" });
```
**Apply:** the new fertilizer-type picker (in `ParcelCard.tsx` / `ImperialOrchard.tsx`) must call `onAction` with the selected type instead of the fixed `"NPK"` string — this likely means widening `handleParcelAction`'s action signature (or adding a sibling handler) to accept a `fertilizerType` argument, following the existing pattern where `handleParcelAction(action, parcelId)` is the single dispatch point for every parcel action. Reuse the existing "Action Restricted" toast pattern (`variant: "destructive"`) for the new "Fertilizing Failed" error state per the UI-SPEC's Copywriting Contract — do not invent a new toast style.

**Fertilize button location to modify** (`frontend/src/components/farm/ParcelCard.tsx:308-320`):
```tsx
<Button
    size="sm"
    variant="secondary"
    className={cn("h-8 px-0 w-8", canFertilize ? "hover:bg-amber-900/30 hover:text-amber-400" : "opacity-30")}
    disabled={!canFertilize}
    onClick={() => onAction('fertilize', parcel.id)}
>
    <Sprout className="h-4 w-4" />
</Button>
```
This 32px `h-8 w-8` button becomes the `DropdownMenuTrigger` per UI-SPEC (`03-UI-SPEC.md` Spacing Scale exceptions — reuse as-is, do not resize).

---

### Fertilizer-type picker (ECON-01 new UI — no direct analog)

**Primitive available, never consumed elsewhere** (`frontend/src/components/ui/dropdown-menu.tsx:17,117`):
```typescript
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup
const DropdownMenuRadioItem = React.forwardRef<...>(...)
```
No existing `.tsx` in the codebase consumes `DropdownMenuRadioGroup`/`DropdownMenuRadioItem` — grep confirms zero usages outside `dropdown-menu.tsx` itself. Compose it fresh using shadcn's own New York preset conventions (the primitive is already styled/exported; standard shadcn dropdown-menu composition is `DropdownMenu > DropdownMenuTrigger (asChild, wraps the existing button) > DropdownMenuContent > DropdownMenuRadioGroup(value=selectedType, onValueChange=setSelectedType) > DropdownMenuRadioItem(value=...) × 2-3`). Follow `03-UI-SPEC.md`'s locked shape: item label "Fertilize with {Type Name}", one-line tradeoff caption, single-click-fires-immediately (no separate confirm step, per Copywriting Contract).

---

## Shared Patterns

### Text-enum validation at canister call sites
**Source:** `backend/main.mo:352-368` (`purchaseSupplies`)
**Apply to:** `fertilizeParcel`'s `fertilizerType` validation (ECON-01)
```motoko
if (supplyType != "fertilizer" and supplyType != "pesticide" and supplyType != "organicTreatment") {
  return #Err(#InvalidOperation("Invalid supply type. Must be 'fertilizer', 'pesticide', or 'organicTreatment'"));
};
```

### Pure-module formula + main.mo call site + TS mirror + parity test
**Source:** `backend/game_logic.mo` (any existing formula) ↔ `frontend/src/lib/gameLogic.ts` ↔ `frontend/src/__tests__/economyParity.test.ts`
**Apply to:** ECON-01 (yield fertilizer term), ECON-02 (season price term) — every new formula term needs all three legs updated in the same commit, per CLAUDE.md's mirror rule. Test block shape to copy (source: `economyParity.test.ts:205-220`):
```typescript
describe('economy parity: infrastructure modifier term-by-term', () => {
    const cases: Array<[string, Infrastructure[], number]> = [ /* ... */ ];
    it.each(cases)('%s', (_name, infra, expected) => {
        expect(getInfraModifier(infra)).toBeCloseTo(expected, 10);
        expect(getInfraModifier(infra)).toBeCloseTo(refInfraModifier(infra), 10);
    });
});
```

### AI-branch / player-branch dual wiring for season-resolution events
**Source:** `backend/main.mo` lines 3206-3216 (AI) and ~3270-3288 (player)
**Apply to:** ECON-03 (runner-up trickle) and ECON-04 (prestige) — every contract-resolution credit must be wired on both branches; do not implement only the replica-testable player path.

### Toast pattern for action failure
**Source:** `frontend/src/App.tsx`'s `handleParcelAction` — "Action Restricted" toast, `variant: "destructive"`
**Apply to:** ECON-01's new "Fertilizing Failed" error state (per `03-UI-SPEC.md` Copywriting Contract) — do not invent a new toast style.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| Fertilizer-type `DropdownMenuRadioGroup` composition (new, lands in `ParcelCard.tsx`/`ImperialOrchard.tsx`) | component (picker) | event-driven | The shadcn primitive is installed but has zero existing consumers in the codebase to copy composition from — build per shadcn's standard New York preset shape and `03-UI-SPEC.md`'s locked contract, not from an in-repo analog |
| `frontend/src/lib/gameLogic.ts` mirrors of `calculateRetailPrice`/`calculateWholesalePrice` (ECON-02) | utility (formula mirror) | transform | No existing mirror of these two functions exists in `gameLogic.ts` today (only yield/infra formulas are mirrored) — this is new mirror code, not an edit to existing mirror code; follow the file's existing per-modifier function shape (see `getSoilModifier` above) rather than porting `SellModal.tsx`'s inline duplicate |

## Metadata

**Analog search scope:** `backend/*.mo`, `frontend/src/lib/`, `frontend/src/components/farm/`, `frontend/src/components/social/`, `frontend/src/components/ui/dropdown-menu.tsx`, `frontend/src/__tests__/economyParity.test.ts`, `frontend/src/App.tsx`
**Files scanned:** ~16 (game_logic.mo, auction_logic.mo, types.mo, main.mo, storage_logic.mo, competitor_logic.mo, gameLogic.ts, economyParity.test.ts, SellModal.tsx, CompetitorsPanel.tsx, App.tsx, ParcelCard.tsx, dropdown-menu.tsx, gddTemplate.ts, spoilage-rates.md, backend.did.d.ts)
**Pattern extraction date:** 2026-09-16
