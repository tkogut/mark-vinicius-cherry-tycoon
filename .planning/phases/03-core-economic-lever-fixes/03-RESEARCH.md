# Phase 3: Core Economic Lever Fixes - Research

**Researched:** 2026-09-16
**Domain:** Motoko backend economy formulas (`game_logic.mo`, `auction_logic.mo`, `storage_logic.mo`, `competitor_logic.mo`) + their frontend mirrors/consumers (TS/React)
**Confidence:** HIGH (all seven findings independently re-verified in this session by reading the actual files, not relying on the audit summary)

## Summary

This phase closes seven "dead lever" findings from the 2026-07-29 audit. All seven are real — every claim in the task brief was re-verified against current source in this session, and re-verification surfaced **three findings the brief undersold**:

1. **ECON-01 (fertilizer type) is not just backend plumbing.** There is no fertilizer-type system anywhere in the game — `Inventory.fertilizers` is a single undifferentiated count, `purchaseSupplies` only knows the strings `"fertilizer"/"pesticide"/"organicTreatment"`, and the frontend has **zero UI** for choosing a type: `App.tsx:244` fires `fertilize.mutate({ parcelId, fertilizerType: "NPK" })` unconditionally on a single-click parcel action, with no picker, dropdown, or modal in between. Implementing this requires inventing a small fertilizer-type taxonomy from scratch (there's a design gap, not just a code gap), building a UI control to select it, and validating it backend-side — not "wire an ignored parameter."
2. **ECON-02 (season price) has THREE copies of the sale-price formula, not one.** `backend/game_logic.mo`'s `calculateRetailPrice`/`calculateWholesalePrice` take no season parameter at all. `frontend/src/lib/gameLogic.ts` has no mirror of these functions (it only mirrors yield/maintenance/club formulas). `frontend/src/components/farm/modals/SellModal.tsx` hand-rolls a **third, independent reimplementation** of the same formula for the pre-sale price preview, and it already has a dead field for this: `seasonMod: 1.0, // deprecated inside modal component but kept for UI` (line 106). All three must move together or the UI will quote a different number than the backend pays out — exactly the failure mode the mirror rule exists to prevent, except here the third copy isn't even the file the mirror rule names.
3. **ECON-03 (runner-up trickle-down) is missing the computation, not just the read.** `AuctionLogic.resolveContract` computes and returns `runnerUpId`, but the trickle-down **revenue/volume itself is never computed** — the constants that would drive it (`_RUNNER_UP_TRICKLE_NUM`/`_RUNNER_UP_TRICKLE_DEN` = 20/100) are underscore-prefixed and explicitly commented "reserved for future full trickle impl" (`auction_logic.mo:57`). `Types.AuctionResult` has no `runnerUpRevenue` field to read. The fix is "add the missing computation, then a field to carry it, then read and credit it" — three steps, not one.

The remaining four (ECON-04, 05, 06, 07) are close to the audit's framing: real bugs with a direct, mostly-mechanical fix, each isolated to one or two files.

**Primary recommendation:** Treat this as seven small, mostly-independent plans/waves. Do ECON-04, 05, 06, 07 first (mechanical, low-risk, no balance decisions) to build momentum and prove the parity/replica-verification loop; do ECON-01, 02, 03 last (each needs either a locked balance number from the user, or new plumbing, or both). None of the seven touch stable state shape or Candid signatures in a breaking way — see Architectural Responsibility Map and the per-requirement sections below for the one nuance (ECON-01's existing-but-unused `_fertilizerType: Text` param is exactly the kind of "already in the Candid interface" surface that lets this be additive-safe).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Fertilizer type effect on yield/fertility (ECON-01) | API/Backend (`game_logic.mo`, `main.mo`) | Browser/Client (new type-selector UI, `App.tsx`/new modal) | Formula + validation is backend-owned (it changes payout); the picker is pure UI state with no server round-trip until submit |
| Season → sale price (ECON-02) | API/Backend (`game_logic.mo`, `main.mo`) | Browser/Client (`gameLogic.ts` mirror, `SellModal.tsx` preview) | Backend computes real revenue; frontend needs the identical formula only to preview it before the player commits |
| Auction runner-up trickle-down (ECON-03) | API/Backend (`auction_logic.mo`, `main.mo`) | — | Pure server-side economic resolution; no player-facing formula to mirror (players don't see V_bid math pre-resolution) |
| Player prestige on contract win (ECON-04) | API/Backend (`main.mo::resolveSeasonAuctions`) | — | Mirrors the AI-side code path already in the same file; no frontend formula involved, only a display of the new field |
| Spoilage system consolidation (ECON-05) | API/Backend (`game_logic.mo` deletion, `storage_logic.mo` kept) | Docs (`docs/game-design/economy/spoilage-rates.md`) | Pure backend dead-code removal + doc correction; no frontend code path touches either function today |
| `CompetitorsPanel` real fields (ECON-06) | Browser/Client (`CompetitorsPanel.tsx`) | — | Existing backend fields (`productionCapacity`) are already correct and already exposed via `getCompetitorsDetail`/`getCompetitorSummaries`; this is a frontend-only bug |
| AI archetype naming consistency (ECON-07) | Docs + Browser/Client | API/Backend (already correct, do not touch) | `competitor_logic.mo`'s `#Traditionalist/#Innovator/#Businessman` + "Marek/Kasia/Hans" naming is the canonical source; UI (`BidModal.tsx`) and stale doc (`gddTemplate.ts`) must converge to it, not vice versa |

## Package Legitimacy Audit

**Not applicable.** This phase adds no dependencies to either `package.json` or Motoko imports — every fix uses existing modules (`game_logic.mo`, `auction_logic.mo`, `storage_logic.mo`, `competitor_logic.mo`, `gameLogic.ts`) and existing base-library imports already present in the codebase. No `npm install` / new Motoko package occurs in this phase.

## Standard Stack

No new libraries. This phase is entirely internal-formula and internal-consistency work inside the existing stack:

| Component | Version (verified this session) | Role in this phase |
|---|---|---|
| Motoko / `moc` | 0.24.3 (Track A, resolved via `dfx cache show`) | All ECON-01..05 backend changes compile-checked here |
| dfx | 0.24.3 | `dfx deploy backend` for live-replica verification (CLAUDE.md hard rule) |
| Vitest | ^4.0.18 | `economyParity.test.ts` extensions for ECON-01/02; component tests for ECON-06/07 |
| TypeScript | ^5.3.3 | `gameLogic.ts` mirror additions |
| React 18 (existing, via component files touched) | n/a — no version bump | `CompetitorsPanel.tsx`, `SellModal.tsx`, `BidModal.tsx`, `App.tsx` edits |

**Installation:** none required.

**Version verification:** N/A — no packages added or bumped.

## Architecture Patterns

### System Architecture Diagram (economy-formula data flow relevant to this phase)

```
Player action (UI)
   │
   ├─ fertilizeParcel(parcelId, fertilizerType)      [ECON-01]
   ├─ sellCherries(quantity, saleType)                [ECON-02]
   ├─ resolveSeasonAuctions()                         [ECON-03, ECON-04]
   └─ advanceSeason() → _advanceSeasonInternal         [ECON-05, spoilage]
        │
        ▼
   main.mo (actor, Track A) — auth guard, phase guard, state read
        │
        ▼
   game_logic.mo / auction_logic.mo / storage_logic.mo (PURE modules)
        │   - calculateYieldPotential / calculateRetailPrice / calculateWholesalePrice
        │   - resolveContract → AuctionResult { winnerId, runnerUpId, revenueEarned, ... }
        │   - calculateSpoilage(baseRate, handlingQuality)
        ▼
   main.mo — applies result to `PlayerFarm` (cash, inventory, reputation, prestige)
        │
        ▼
   playerFarms.put(caller, updatedFarm)   [stable var — persisted]
        │
        ▼
   Candid query/update response → frontend hook (useFarm.ts / useCompetitors / useMarketPrices)
        │
        ▼
   React component (SellModal.tsx / CompetitorsPanel.tsx / BidModal.tsx)
        │   - MUST reproduce the same formula for pre-submit preview (gameLogic.ts mirror)
        ▼
   Player sees a number that must match what main.mo will actually pay
```

Reader's primary use case to trace: a player clicks "Sell" in `SellModal.tsx` → the modal's local `pricingFactors` calc (today: no season term) estimates the price → player confirms → `sellCherries` in `main.mo` calls `GameLogic.calculateRetailPrice`/`calculateWholesalePrice` (today: no season term either) → revenue is credited. ECON-02 must change the formula at both ends of this arrow identically, plus the third copy inside `SellModal.tsx` itself.

### Recommended Project Structure (no new directories — file-level map only)

```
backend/
├── game_logic.mo         # ECON-01 (fertilizer modifier), ECON-02 (season multiplier), ECON-05 (delete calculateSpoilageRate)
├── auction_logic.mo       # ECON-03 (compute+return runner-up trickle revenue/volume)
├── storage_logic.mo       # ECON-05 (kept, unchanged — already correct)
├── competitor_logic.mo    # ECON-07 (verify only — names already correct here, do not touch)
├── types.mo               # ECON-03 (add field(s) to AuctionResult — additive, non-breaking)
└── main.mo                # ECON-01/02/03/04 call-site wiring; main_mainnet.mo — see Don't-Mirror note below

frontend/src/
├── lib/gameLogic.ts                          # ECON-01, ECON-02 new mirror functions (mandatory per CLAUDE.md)
├── components/farm/modals/SellModal.tsx      # ECON-02 — replace inline reimplementation, wire season
├── components/social/CompetitorsPanel.tsx    # ECON-06 — real field, drop hardcoded trend tile
├── components/pools/BidModal.tsx             # ECON-07 — naming only (RivalCard names already right: Marek/Kasia/Hans)
├── lib/gddTemplate.ts                        # ECON-07 — rename Jan Kowalski/Anna Nowak/Piotr Wiśniewski → Marek/Kasia/Hans
├── App.tsx                                   # ECON-01 — replace hardcoded "NPK" with real selection
└── __tests__/economyParity.test.ts           # ECON-01, ECON-02 new parity blocks (mandatory per CLAUDE.md)

docs/game-design/economy/
├── spoilage-rates.md      # ECON-05 — rewrite to describe StorageLogic.calculateSpoilage, not the deleted function
└── price-formulas.md      # ECON-02 (and optionally ECON-01) — self-declared "Single Source of Truth", update or it self-contradicts
```

### Pattern 1: Text-enum validation at the call site (existing convention, reuse for ECON-01)
**What:** Motoko has no runtime string-union type; the codebase's existing pattern for a small closed set of string options is manual validation inside the shared function, mirroring the frontend's known set of literal strings.
**When to use:** ECON-01's `fertilizerType` — do NOT introduce a new Motoko variant type (that would still be additive/safe, but a Text param already exists in the signature, so validating against a small fixed set of strings is the lower-risk, zero-Candid-change path).
**Example:**
```motoko
// Source: backend/main.mo:365-368 (purchaseSupplies) — existing convention to copy
if (supplyType != "fertilizer" and supplyType != "pesticide" and supplyType != "organicTreatment") {
  return #Err(#InvalidOperation("Invalid supply type. Must be 'fertilizer', 'pesticide', or 'organicTreatment'"));
};
```
Apply the same shape to `fertilizeParcel`'s `_fertilizerType` (rename to drop the underscore once it's used), validating against whatever 2-3 option names the user locks in (see Assumptions Log).

### Pattern 2: Pure-module formula + main.mo call-site + frontend mirror (existing convention, reuse for ECON-02)
**What:** Every real economy formula in this codebase lives in a pure module function (no actor, no stable state — see `examples/motoko-pure-logic-module.mo`), is called from `main.mo` with concrete arguments, and has a hand-transcribed TS mirror in `gameLogic.ts` pinned by `economyParity.test.ts`.
**When to use:** ECON-02's season multiplier must be a new parameter threaded into `calculateRetailPrice`/`calculateWholesalePrice`, not a global hidden variable — this keeps the function pure and testable exactly like every other formula in the file.
**Example:**
```motoko
// Source: backend/game_logic.mo:143-155 — current signature (season param to be ADDED)
public func calculateRetailPrice(
  basePrice: Nat,
  marketSize: Float,
  quality: Nat,
  isOrganic: Bool,
  saturationMultiplier: Float
) : Float { ... }
// main.mo call site (line ~1313) already has farm.currentSeason in scope — no new state needed.
```

### Pattern 3: AuctionResult as the single source of resolution truth (existing convention, extend for ECON-03)
**What:** `resolveContract` returns one `Types.AuctionResult` record per contract; `main.mo`'s `_performGlobalAuctionResolution` reads only the fields it needs. Extending the record is additive (Candid-safe) as long as no existing field is removed or retyped.
**When to use:** ECON-03 — add `runnerUpVolumeKg: Nat` and `runnerUpRevenue: Nat` (or a single combined field; see Open Questions) to `AuctionResult`, compute them inside `resolveContract` using the existing (currently unused) `_RUNNER_UP_TRICKLE_NUM/DEN` constants, then read them in `main.mo` next to the existing `winnerId` handling — crediting an AI runner-up via `aiCompetitors.put` (same pattern as the winner branch at `main.mo:3206-3216`) or the player via the existing `resolveSeasonAuctions` cash/prestige accumulation (same pattern used for the winner branch at `main.mo:3270-3288`).

### Anti-Patterns to Avoid
- **Adding a fourth copy of the sale-price formula:** `SellModal.tsx` already duplicates the backend formula independently of `gameLogic.ts`. Do not patch `SellModal.tsx` in isolation — either add the season term to its existing inline calc (fastest, but perpetuates the duplication) or refactor it to import from `gameLogic.ts` (removes one duplicate permanently). Flag this choice explicitly in the plan; don't let it default to "leave the duplication and just add a term to all three copies."
- **Copying wear/season logic into `main_mainnet.mo`:** none of these seven fixes are safe to mirror into Track B by default. Track B does not compile (EOP-01) and any edit there is unverifiable by this project's own stated policy. `fertilizeParcel`'s identical dead `_fertilizerType` param and `getMarketPrices`'s identical `seasonMultiplier = 1.0` both exist in `main_mainnet.mo` too (verified: `main_mainnet.mo:721-739` mirrors `main.mo:839-859` almost verbatim) — leave them exactly as they are, and say so explicitly per fix rather than silently skipping Track B.
- **Inventing a new `InfrastructureType` or Candid variant for fertilizer type:** the existing Text-param + string-validation pattern (Pattern 1) is Candid-additive and lower-risk than a new `#FertilizerType` variant, which would still be additive but is unnecessary machinery for a 2-3-option closed set that has no persisted inventory-per-type today.
- **Trusting `docs/game-design/economy/spoilage-rates.md` as ground truth:** it currently documents the return values of the dead `GameLogic.calculateSpoilageRate` function (100%/80%/20% by infrastructure), not what `StorageLogic.calculateSpoilage(baseRate, handlingQuality)` actually computes (a labor-quality-modulated percentage from a 15/8/2 base-rate table, applied only at the Autumn→Winter season transition). ECON-05 explicitly requires updating this doc to match reality.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Runner-up partial-volume payout | A brand-new trickle-down subsystem from scratch | The already-defined (unused) `_RUNNER_UP_TRICKLE_NUM/DEN` constants and `runnerUpId` field in `auction_logic.mo` | The design and the constant are already there and already reviewed into the codebase — only the computation step is missing |
| Fertilizer-type validation | A new Motoko variant type / new Candid method | Text-param validation matching `purchaseSupplies`'s existing `supplyType` pattern | Keeps the Candid interface additive-safe and consistent with the one other place a small string-enum already exists in this codebase |
| Season-aware pricing | A new "pricing service" module | Add one `Float` parameter to the two existing pure functions (`calculateRetailPrice`/`calculateWholesalePrice`) | The formulas are already pure and already parameterized this way for every other factor (quality, organic, saturation) |

**Key insight:** every one of these seven fixes has an existing, already-reviewed piece of scaffolding sitting unused nearby (a comment, a constant, an identical sibling function's validation pattern) — the risk in this phase is building new machinery instead of finishing what's already half-built.

## Common Pitfalls

### Pitfall 1: Treating ECON-01/ECON-02 as "just flip the constant"
**What goes wrong:** Both start life as a single hardcoded value (`_fertilizerType` ignored; `seasonMultiplier = 1.0`), which reads like a one-line fix. Both actually require new parameters threaded through pure functions, new frontend UI (ECON-01) or a third file's inline duplicate (ECON-02), and a genuinely new balance number the user has not yet chosen.
**Why it happens:** The audit phrasing ("currently X is hardcoded") describes the symptom's location, not the fix's full surface area.
**How to avoid:** Scope each as its own plan/wave with explicit UI + backend + mirror + test tasks, not a single backend-only task.
**Warning signs:** A plan for ECON-01 or ECON-02 with only `backend/*.mo` file targets.

### Pitfall 2: Picking the balance number without asking
**What goes wrong:** ECON-01 (fertilizer-type multiplier magnitude) and ECON-02 (per-season sale-price multiplier table) are economy-balance numbers exactly like MAINT-02's repair coefficient — a case this project's own `LESSONS.md` already recorded as a mistake ("Balance numbers are the user's call, not mine").
**Why it happens:** A concrete number is needed to write a test vector, and it's tempting to pick a plausible one and move on.
**How to avoid:** Present 2-3 concrete OPTIONS (see below) to the user/discuss-phase step; do not let the planner or executor silently choose.
**Warning signs:** A PLAN.md with a specific multiplier value and no corresponding decision record.

### Pitfall 3: Forgetting AI is also a possible runner-up (ECON-03)
**What goes wrong:** `resolveContract`'s bids come from up to 4 bidders (player + 3 AI); the runner-up could be the player OR an AI. `main.mo`'s existing winner-handling code branches on `aiCompetitors.get(winId)` vs "player winner handled in resolveSeasonAuctions" (`main.mo:3206-3217`) — the runner-up credit needs the identical branch, or AI runners-up will silently get nothing while player runners-up work (or vice versa).
**Why it happens:** It's easy to wire only the branch that's easiest to test manually (usually the player path, since it's replica-observable via a `dfx canister call`).
**How to avoid:** Mirror both branches explicitly; write a test/replica check that puts the player in the runner-up seat at least once.
**Warning signs:** Only one of the two `winnerId`-style branches touched in the diff.

### Pitfall 4: `main_mainnet.mo` bit-rot creep
**What goes wrong:** All seven bugs exist identically in `main_mainnet.mo` (verified for ECON-01, ECON-02; likely true for the others given the file is a near-duplicate of `main.mo` at these call sites). The instinct built by the mirror-rule habit (`game_logic.mo` ↔ `gameLogic.ts`) can misfire into "mirror into `main_mainnet.mo` too."
**Why it happens:** Habit from the CLAUDE.md mirror rule, which is about a *different* pair of files (Motoko ↔ TypeScript, not Track A ↔ Track B).
**How to avoid:** For each ECON fix, add one line to the plan/commit: "Track B (`main_mainnet.mo`) intentionally left unchanged — EOP-01, unverifiable."
**Warning signs:** A diff touching both `main.mo` and `main_mainnet.mo` in the same commit for one of these seven fixes.

### Pitfall 5: `CompetitorsPanel.tsx`'s `comp: any` hides more than `baseCapacity`
**What goes wrong:** The component's `.map((comp: any) => ...)` cast means TypeScript cannot catch *any* field-name mismatch — fixing `baseCapacity` → `productionCapacity` while leaving the `any` cast in place would silently permit the next drift.
**Why it happens:** Minimal-diff instinct — fix the one named bug, leave the surrounding cast alone.
**How to avoid:** Type the mapped value against `AICompetitor`/`AICompetitorSummary` (whichever `useCompetitors`'s `getCompetitorsDetail()` actually resolves to) instead of `any`, so the compiler enforces the real field going forward.
**Warning signs:** `as any` or `: any` surviving in the diff for ECON-06.

## Runtime State Inventory

**Not applicable — this is not a rename/refactor/migration phase.** All seven fixes add new formula behavior or fix a frontend field/naming mismatch; none rename or restructure existing stable state, existing Candid method signatures (ECON-01's `_fertilizerType: Text` param already exists and is merely un-ignored), or existing stored keys. Confirmed explicitly:
- **Stored data:** No datastore/collection/key is renamed by any of the seven fixes. `AuctionResult` gains new fields (additive, non-breaking to Candid since it's a return-type record extension, not a removal) for ECON-03.
- **Live service config:** None touched.
- **OS-registered state:** None touched.
- **Secrets/env vars:** None touched.
- **Build artifacts:** `dfx generate backend` must be re-run after any `types.mo`/`main.mo` Candid-surface change (ECON-03's `AuctionResult` field addition) to regenerate `frontend/src/declarations/` — this is a normal, expected step, guarded by the existing `candidContract.test.ts` CI drift check, not a migration.

## Common Pitfalls
(see above — combined section per file convention)

## Code Examples

### Real spoilage formula (what ECON-05's doc rewrite must describe)
```motoko
// Source: backend/main.mo:1506-1515 — the ONLY place spoilage actually runs
// (Autumn → next-season transition only; StorageLogic.calculateSpoilage is the live function)
if (farm.currentSeason == #Autumn) {
   var baseRate : Nat = 15; // default 15%
   for (infra in farm.infrastructure.vals()) {
     if (infra.infraType == #ColdStorage) { baseRate := 2 }
     else if (infra.infraType == #Warehouse and baseRate > 5) { baseRate := 8 };
   };
   let handlingQuality = HiringLogic.getHandlingQuality(farm.hiredLabor);
   let spoilageRate = StorageLogic.calculateSpoilage(baseRate, handlingQuality);
   spoiledCherries := (farm.inventory.cherries * spoilageRate) / 100;
};
```
```motoko
// Source: backend/storage_logic.mo:9 — the formula itself
// FinalSpoilage% = (baseRate * 100) / handlingQuality
public func calculateSpoilage(baseRate: Nat, handlingQuality: Nat) : Nat {
  if (handlingQuality == 0) { return baseRate; };
  return (baseRate * 100) / handlingQuality;
};
```
Note: `ColdStorage` always wins over `Warehouse` regardless of infrastructure array order, because the `ColdStorage` branch unconditionally sets `baseRate := 2` while `Warehouse`'s branch is guarded by `baseRate > 5` — this is the "priority rule" the old doc correctly stated, just about the wrong function. Preserve this exact behavior description when rewriting `spoilage-rates.md`.

### Dead function to delete (ECON-05)
```motoko
// Source: backend/game_logic.mo:46-65 — ZERO call sites anywhere in the codebase (verified this session)
public func calculateSpoilageRate(infrastructure: [Infrastructure]) : Float {
  var hasColdStorage = false;
  var hasWarehouse = false;
  for (infra in infrastructure.vals()) {
     switch (infra.infraType) {
       case (#ColdStorage) { hasColdStorage := true };
       case (#Warehouse) { hasWarehouse := true };
       case (_) {};
     };
  };
  if (hasColdStorage) { 0.20 } else if (hasWarehouse) { 0.80 } else { 1.0 };
};
```

### AI prestige win credit (ECON-04's pattern to replicate on the player side)
```motoko
// Source: backend/main.mo:3206-3216 — AI winner branch (already correct)
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
```motoko
// Source: backend/main.mo:3270-3288 — player winner branch in resolveSeasonAuctions (currently NO prestige credit)
for (c in stableAuctionContracts.vals()) {
  if (not c.isPreSeason and c.status == #Fulfilled and c.winnerPlayerId == ?callerText and c.awardedSeason == ?farm.seasonNumber) {
      // ... cashDelta += rev ...
      // MISSING: no equivalent of `prestige = prestige + 5` anywhere in this loop.
      // farm.reputation is the player's analogue of AI prestige (0-100 scale, not 0-1000 —
      // see Open Questions for whether +5 is the right raw number on a different scale).
  };
};
```

### `CompetitorsPanel.tsx` real field (ECON-06)
```typescript
// Source: frontend/src/declarations/backend.did.d.ts:5-21 — the real Candid type
export interface AICompetitor {
  'productionCapacity' : bigint,   // NOT 'baseCapacity' — that field does not exist
  // ... reputation, prestige, county, preferredSaleType, etc.
}
```
Current bug, `frontend/src/components/social/CompetitorsPanel.tsx:34`:
```typescript
marketShare: Number(comp.baseCapacity) / 100, // mock calculation — comp is `any`, so this is NaN at runtime, never caught by tsc
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| N/A — no external ecosystem shift | N/A | N/A | This phase is internal-consistency work, not adopting a new external pattern. Nothing in the wider Motoko/React ecosystem is relevant here beyond the codebase's own established conventions (documented above). |

**Deprecated/outdated:**
- `GameLogic.calculateSpoilageRate` (backend/game_logic.mo:46) — dead code, zero call sites, to be deleted per ECON-05.
- `docs/game-design/economy/spoilage-rates.md` in its current form — documents the dead function, not the live one; superseded by ECON-05's rewrite.
- `docs/game-design/economy/gdd-analysis.md` — dated 2026-02-16/2026-03-10, predates the GDD v3 reconciliation and the entire Phase 1-2 body of work; not authoritative for anything in this phase and should not be consulted as a source of truth (confirmed stale by cross-reading against current `STATE.md`/`REQUIREMENTS.md`).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | ECON-01 needs a small (2-3 option) fertilizer-type taxonomy with per-type fertility/yield multipliers, validated as Text (not a new Motoko variant) | Standard Stack, Pattern 1 | If the user wants a richer system (e.g., type tied to purchasable inventory sub-types with distinct pricing), the scope and inventory model change materially — this needs a locked decision, not an assumed shape |
| A2 | ECON-01's magnitude (how much a "better" fertilizer type should improve fertility gain or yield vs. the current flat `+0.1` fertility bump) is undecided and MUST be presented as options, not chosen | Common Pitfalls #2 | Picking a number silently repeats the exact MAINT-02 mistake `LESSONS.md` already flags |
| A3 | ECON-02's per-season multiplier table (which seasons get a premium/discount, and by how much) is undecided and MUST be presented as options | Common Pitfalls #2 | Same as A2 — a balance number, not a code fact |
| A4 | ECON-04's magnitude for player prestige should probably NOT be a flat "+5" copied verbatim from the AI branch, because `AICompetitor.prestige` is a 0-1000 scale while `PlayerFarm.reputation` is documented as 0-100 (`types.mo:217`) — a flat +5 would be a much bigger relative jump for the player than for AI | Code Examples (ECON-04) | If applied naively, +5 on a 0-100 scale (5% of the range) is disproportionate to +5 on a 0-1000 scale (0.5% of the range) for what the GDD frames as parity ("matching AI competitors") — this is arguably still a balance question worth a quick confirmation, even though the requirement text says "matching the +5" |
| A5 | The best mechanism for ECON-01's UI selection is a lightweight inline control (dropdown or small modal) added to the existing single-click parcel "fertilize" action, not a new full-screen modal | Common Pitfalls #1 | If the user wants fertilizer type tied to a pre-purchase decision (buy 3 fertilizer types, then choose per-application) instead of a free choice at apply-time, the inventory model (`Inventory.fertilizers: Nat`) needs restructuring into a per-type count — much larger scope |

**If this table is empty:** N/A — see entries above. All five need a locked decision before planning ECON-01/02/04 in detail; ECON-03/05/06/07 need no user decision (mechanical fixes).

## Open Questions

1. **ECON-01: What are the fertilizer types and their effects?**
   - What we know: no taxonomy exists anywhere in code, design docs, or the original concept doc (`Mark_Vinicius_V1.md` only mentions fertilizer generically, never named types). `GDD-ONE-PAGER.md` calls it a "no-op parameter" needing a fix but names no scheme.
   - What's unclear: the concrete type names and their numeric effect on fertility gain and/or yield.
   - Recommendation: present the user with 2-3 concrete OPTIONS at discuss-phase, e.g.:
     - **Option A (minimal, reuses `+0.1` fertility mechanic):** 2 types — "Standard" (current `+0.1` fertility, no cost change) vs "Premium" (`+0.15` fertility, costs 2x a standard fertilizer unit — needs a new price tier in `inputMarket.fertilizerPrice` or a flat surcharge).
     - **Option B (yield-multiplier, GDD-aligned with "Losses/diseases... reducing yield if player didn't invest in prevention" framing):** 3 types — "Organic-Compatible" (no yield bonus, required to keep `parcel.isOrganic` true), "Synthetic-Standard" (current baseline), "Synthetic-Intensive" (+5% yield via a new small multiplicative term in `calculateYieldPotential`, but breaks organic eligibility if applied to an organic parcel).
     - **Option C (simplest possible "measurably different outcome"):** keep single fertility-gain mechanic, but make the *magnitude* type-dependent only (e.g., "Slow-Release" = `+0.05`/application but lasts 2 seasons without needing reapplication vs "Fast-Acting" = `+0.15` one-shot) — no yield-formula change at all, smallest blast radius.
   - This directly determines whether `calculateYieldPotential`'s signature changes (Option B) or only `fertilizeParcel`'s fertility-bump logic changes (Options A/C) — a materially different task shape per option.

2. **ECON-02: What is the per-season sale-price multiplier table?**
   - What we know: the field (`seasonMultiplier`) and its intended purpose ("Vary by season") already exist as a stub; `Mark_Vinicius_V1.md`/GDD does not specify concrete per-season values anywhere searched.
   - What's unclear: which seasons get a premium (plausibly Summer, the stated peak cherry season per `competitor_logic.mo`'s own `getSeasonDemand` table: Spring 30k/Summer 80k/Autumn 50k/Winter 20k demand) and by how much.
   - Recommendation: present options anchored to the *existing* AI demand curve for internal consistency, e.g.:
     - **Option A (mirror the existing demand curve proportionally):** Spring 0.9x, Summer 1.15x, Autumn 1.0x, Winter 0.75x — roughly tracks `getSeasonDemand`'s own relative shape (30k:80k:50k:20k ≈ 0.9:2.4:1.5:0.6 relative to a 33k mean, then dampened to avoid over-swinging retail/wholesale revenue).
     - **Option B (flat, simple):** Summer 1.1x (peak), all other seasons 1.0x — smallest, least disruptive to existing balance testing.
     - **Option C (symmetric swing):** Summer 1.15x, Winter 0.85x, Spring/Autumn 1.0x — models scarcity in winter and glut in summer symmetrically.
   - This also determines whether `calculateWholesalePrice` (which already has a `stableSpotPrice`-driven Flood Factor layered on top via `main.mo`) should apply the season multiplier before or after the flood-factor market-pressure adjustment — worth a one-line decision note either way, since order changes the final number.

3. **ECON-03: Should the runner-up trickle-down consume the player's/AI's inventory, and does it stack with the winner's full-volume payout?**
   - What we know: the design comment says "20% of remaining volume at their offer price" (`auction_logic.mo:357`) — implying "remaining" = `requiredVolumeKg - winnerVolume`, but the winner already takes the FULL `requiredVolumeKg` (`winRevenue = winner.bid.offerPricePLN * contract.requiredVolumeKg` at `auction_logic.mo:432`), so there's no literal "remaining" volume left in the contract's own required amount.
   - What's unclear: whether "20% of remaining volume" means 20% of the *same* `requiredVolumeKg` (a bonus contract-like payout layered on top, not literally physical remaining stock) or whether the winner's payout should be reduced to make room for a literal split.
   - Recommendation: given `_RUNNER_UP_TRICKLE_NUM/DEN = 20/100`, the lowest-risk reading (that changes the least existing behavior) is: runner-up gets `20% of requiredVolumeKg × runnerUp.offerPricePLN` as an ADDITIONAL payout, with the winner's existing full payout untouched — i.e. a consolation-prize bonus, not a literal inventory split. This avoids retroactively reducing a formula (`winRevenue`) that many other tests may already depend on. Confirm this reading with the user before implementing, since "remaining volume" phrasing could also mean the opposite.

4. **ECON-06: Is `getCompetitorsDetail()` (full `AICompetitor`) or `getCompetitorSummaries()` (lighter `AICompetitorSummary`) the correct source for `CompetitorsPanel.tsx`?**
   - What we know: `useCompetitors()` (used by `CompetitorsPanel.tsx`) currently calls `getCompetitorsDetail()`, which returns full `AICompetitor` records (including `inventoryKg`, `totalRevenue`, `currentStrategy` — richer than what the panel displays today). Both types already have `productionCapacity`, so either fixes the immediate bug.
   - What's unclear: nothing blocking — this is a non-blocking note, not a real open question. `getCompetitorsDetail()` is already correctly wired at the hook level; only the panel's field name and `any` typing need fixing.
   - Recommendation: keep `getCompetitorsDetail()` as the data source (no hook change needed), just fix the panel's type and field name.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| dfx | Live-replica verification of all backend changes (CLAUDE.md hard rule) | Yes | 0.24.3 | — |
| moc (Motoko compiler) | `./validate.sh backend` | Yes (via `dfx cache show`, not on PATH directly — this is the script's own expected resolution method) | 0.24.3 (Track A cache) | — |
| Node.js | Frontend build/test | Yes | v24.13.1 | — |
| npm | Frontend build/test/lint | Yes | 11.8.0 | — |
| Vitest | `economyParity.test.ts` and all unit tests | Yes (devDependency) | ^4.0.18 | — |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** none — environment is fully provisioned for this phase.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | `frontend/vitest.config.ts` (`include: ['src/__tests__/**/*.test.ts', 'src/__tests__/**/*.test.tsx']`) |
| Quick run command | `cd frontend && npx vitest run src/__tests__/economyParity.test.ts` |
| Full suite command | `cd frontend && npm test` (currently 388 tests / 8 files per CLAUDE.md) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ECON-01 | Fertilizer type produces different fertility/yield outcome | unit (parity) | `npx vitest run src/__tests__/economyParity.test.ts` | ❌ Wave 0 — new `describe` block needed; also new backend behavior needs live-replica check (`dfx deploy backend` + `dfx canister call fertilizeParcel ...` with two different type strings, compare fertility before/after) |
| ECON-02 | Season affects sale price | unit (parity) + manual replica | `npx vitest run src/__tests__/economyParity.test.ts` | ❌ Wave 0 — new `describe` block; replica check: `sellCherries` in two different seasons, compare revenue for identical inventory/quality |
| ECON-03 | Runner-up receives trickle-down | unit (pure-module) + manual replica | new test file or block for `auction_logic.mo`'s `resolveContract` behavior mirrored in TS, OR direct replica verification via `resolveSeasonAuctions` with a 2+-bidder contract | ❌ Wave 0 — no existing test touches `AuctionLogic.resolveContract`'s trickle behavior at all |
| ECON-04 | Player prestige credited on Imperial Contract win | manual replica (primary) + optional unit assertion on the delta | `dfx deploy backend` then `dfx canister call ... resolveSeasonAuctions` with a won contract, read reputation before/after | ❌ Wave 0 — no existing automated test covers `resolveSeasonAuctions`'s reputation math at all (per grep, only replica checks have ever verified this function) |
| ECON-05 | Only one spoilage system exists, docs match | static (grep/compile) | `grep -rn "calculateSpoilageRate" backend/ frontend/` returns zero hits after the fix; `./validate.sh backend` compiles clean | ❌ Wave 0 — a `legacyShellScripts.test.ts`-style ratchet/grep assertion could pin "this function name must not exist" but doesn't exist yet; optional, not blocking |
| ECON-06 | `CompetitorsPanel` reads real fields | unit (component/type) | `npx vitest run` (new or existing component test) | ❌ Wave 0 — no existing test file covers `CompetitorsPanel.tsx` at all (confirmed: no `CompetitorsPanel` reference in `__tests__/`) |
| ECON-07 | AI archetype names consistent | static (grep) + optional unit | `grep -rn "Jan Kowalski\|Anna Nowak\|Piotr Wiśniewski" frontend/src` returns zero hits after the fix | ❌ Wave 0 — no test pins archetype-name consistency today; `uiConventions.test.ts` is the existing precedent pattern (pinned emoji/currency conventions the same way) worth extending rather than inventing a new file |

### Sampling Rate
- **Per task commit:** `cd frontend && npx vitest run src/__tests__/economyParity.test.ts` (fast — targets the file every ECON-01/02 change touches) plus `./validate.sh fast` for lint/typecheck.
- **Per wave merge:** `./validate.sh full` (build + e2e + declaration drift) — mandatory before commit per CLAUDE.md for anything touching `.tsx`.
- **Phase gate:** Full suite green (`npm test`, currently 388 tests) + `./validate.sh backend` (moc type-check both tracks) + at least one live-replica verification per backend-touching requirement (ECON-01/02/03/04/05), with observed before/after values quoted in the commit message per CLAUDE.md's "Always" rule and the `LESSONS.md` "It compiles and tests pass are not evidence" entry.

### Wave 0 Gaps
- [ ] `economyParity.test.ts` — new `describe('economy parity: fertilizer type (ECON-01)', ...)` block once the type taxonomy is locked
- [ ] `economyParity.test.ts` — new `describe('economy parity: season sale price (ECON-02)', ...)` block once the multiplier table is locked
- [ ] New test coverage for `AuctionLogic.resolveContract`'s runner-up trickle (ECON-03) — no existing file touches `auction_logic.mo` at all today (confirmed by grep: zero `__tests__` references to `AuctionLogic` or `resolveContract`)
- [ ] New or extended component test for `CompetitorsPanel.tsx` (ECON-06) — file does not exist today
- [ ] Extend `uiConventions.test.ts`-style grep assertion for archetype-name consistency (ECON-07) — optional but follows the project's own established ratchet pattern (emoji, currency) rather than a one-off manual grep
- [ ] Framework install: none — Vitest is already fully configured

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No new auth surface — all touched methods (`fertilizeParcel`, `sellCherries`, `resolveSeasonAuctions`) already have the existing `Principal.isAnonymous(caller)` guard; do not remove or weaken it |
| V3 Session Management | No | Not touched by this phase |
| V4 Access Control | No | No new roles/permissions; all fixes operate within the existing per-caller `playerFarms.get(caller)` ownership model |
| V5 Input Validation | Yes | ECON-01's new fertilizer-type string MUST be validated against the closed set (Pattern 1) — an unvalidated Text param accepted into a formula is exactly the kind of "accepted and ignored" bug this phase exists to fix; do not swap "ignored" for "accepted and unvalidated" |
| V6 Cryptography | No | Not applicable to any of these seven fixes |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Nat underflow/overflow in new arithmetic (ECON-03's trickle revenue, ECON-04's prestige credit) | Tampering (via crafted low-probability integer edge cases) | Follow the existing codebase convention throughout `auction_logic.mo`/`main.mo`: guard every Nat subtraction with an explicit `if` or `Int.abs`, never subtract two `Nat`s directly when the sign isn't provably safe (see `auction_logic.mo`'s own SEC-numbered comments as the house style to match) |
| Unvalidated string param silently accepted (ECON-01 regression risk) | Tampering | Validate `fertilizerType` against the closed set server-side (never trust client-side-only validation) — same reasoning as the existing `purchaseSupplies` `supplyType` guard |
| Divergent frontend/backend economic display (all of ECON-01/02) | Repudiation-adjacent / player-trust issue, not a STRIDE-classic threat but explicitly named in CLAUDE.md as load-bearing | `economyParity.test.ts` extension is the standard mitigation already established in this codebase; treat any of the three price-formula copies going out of sync as a shippable-blocking bug, not a cosmetic one |

## Sources

### Primary (HIGH confidence — verified this session by direct file reads)
- `backend/main.mo` (lines 350-405, 800-900, 1256-1360, 1480-1520, 2780-2880, 3140-3370) — read directly
- `backend/game_logic.mo` (full file to line 260) — read directly
- `backend/auction_logic.mo` (full file) — read directly
- `backend/storage_logic.mo` (full file) — read directly
- `backend/competitor_logic.mo` (full file) — read directly
- `backend/types.mo` (lines 100-230, 390-420, 540-568) — read directly
- `frontend/src/lib/gameLogic.ts` (lines 1-80, function export list) — read directly
- `frontend/src/components/social/CompetitorsPanel.tsx` (full file) — read directly
- `frontend/src/components/pools/BidModal.tsx` (full file) — read directly
- `frontend/src/components/farm/modals/SellModal.tsx` (lines 1-130) — read directly
- `frontend/src/hooks/useFarm.ts`, `frontend/src/hooks/useMarketPrices.ts` — read directly
- `frontend/src/declarations/backend.did.d.ts` (lines 1-40) — read directly
- `frontend/src/__tests__/economyParity.test.ts` (structure, describe blocks) — read directly
- `docs/game-design/economy/spoilage-rates.md`, `price-formulas.md`, `gdd-analysis.md` — read directly
- `docs/game-design/GDD-ONE-PAGER.md`, `Mark_Vinicius_V1.md` (relevant sections) — read directly
- `docs/game-design/backend/track-separation.md` — read directly
- `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/LESSONS.md` — read directly

### Secondary (MEDIUM confidence)
- None used — this phase required no external library research, so no WebSearch/Context7 lookups were performed. All findings are internal-codebase facts.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; existing stack versions confirmed via `dfx --version`, `node --version`, `npm --version`, and `package.json` reads this session.
- Architecture: HIGH — every pattern cited traces to a specific file:line read in this session, not inferred.
- Pitfalls: HIGH — all five pitfalls are derived from direct code contradictions found this session (e.g., the third SellModal price copy, the missing AuctionResult field, the `any`-typed CompetitorsPanel), not speculative.
- Balance-number sections (ECON-01/02/04 magnitudes): LOW by design — explicitly flagged `[ASSUMED]`/Open-Questions rather than presented as fact, per CLAUDE.md's Ask-First rule and `LESSONS.md`'s recorded mistake.

**Research date:** 2026-09-16
**Valid until:** No external dependency expiry — this research is a snapshot of internal code state. Re-verify only if another phase's work touches these same files before Phase 3 executes (check `git log` on `backend/main.mo`, `backend/auction_logic.mo`, `backend/game_logic.mo` for changes since 2026-09-16 before planning).
