# Mark Vinicius Cherry Tycoon — Current State Audit (2026-07-29)

**Purpose:** Ground-truth input for a GDD/concept revision. Development has changed hands multiple times; every prior design doc in this repo has proven at least partially stale or aspirational against the actual code (three concrete examples caught this session alone — see below). This document describes **what the game actually does today**, verified by reading `backend/*.mo` and `frontend/src/` directly, not by trusting comments, docstrings, or prior GDD text. Every claim below is cited to a file and line.

**How to read this:** ✅ REAL = mechanically functions and produces different outcomes from different player choices. 🟡 STUB/DEAD = code exists (sometimes fully) but is unreachable, ignored, or a no-op. ❌ VAPORWARE = no implementation exists at all despite being named in docs/roadmap.

---

## 0. Three things that already proved the old docs unreliable

1. **"Leaderboard UI is missing"** (old roadmap) — false. `RankingsPanel.tsx` was already fully built and mounted; the real gap was narrower (own-rank visibility + mobile layout), fixed 2026-07-29.
2. **"Weather & Event UI is missing"** (old roadmap) — false. Weather UI is fully built and mounted (`WeatherEffects.tsx`, `WeatherEventModal.tsx`).
3. **"Cherry Festival is backend-ready, just needs UI"** (old roadmap) — false in the other direction: zero backend code exists for it at all. See §4.

Treat every remaining claim in old planning docs (`.planning/ROADMAP.md`'s pre-2026-07-29 assumptions, `docs/game-design/*`) as unverified until re-checked against code.

---

## 1. The turn/phase structure (real, load-bearing)

Not a simple season clock — a 10-phase state machine per year: **Hiring → Procurement → Investment → Growth → Harvest → Market → Storage → CutAndPrune → Maintenance → Planning**, each phase mapped to one of 4 calendar seasons (`backend/types.mo:257-268`). Progression is entirely player-driven via `advancePhase()` (`main.mo:1608`) — there is no passive/idle clock. Actions are phase-gated: planting only in Investment, harvesting only in Harvest+Summer, etc. Side effects fire on specific phase entries (input prices regenerate entering Procurement, weather regenerates entering Growth, auctions resolve entering Storage). **This gating is real and meaningfully restricts play** — but it is taught to the player almost nowhere (see §6).

## 2. Parcels & farm mechanics — mixed

`CherryParcel` (`types.mo:58-85`) models soil type, pH, fertility, permeability, humidity, size, tree age, organic-conversion state, quality, water level.

- 🟡 **Soil/pH/fertility are never randomized.** `getRandomSoilType()`/`getRandomPH()`/`getRandomFertility()` (`main.mo:2345-2357`) are constant stubs always returning the single optimal value (`#SandyClay`, 6.5 pH, 0.7 fertility). Every parcel, via every purchase path, ends up identical and always-best-case. "Geography matters" is not currently true.
- 🟡 **`county` is a literal `"TBD"` string** on the standard purchase path (`main.mo:2388`); other paths hardcode `"Opole"`. The regional county-bonus system that does exist in `game_logic.mo:124-130` is functionally unreachable because it never matches `"TBD"`.
- 🟡 **`permeability`/`humidity`** exist as fields but are never read by any yield/quality formula — dead attributes.
- ❌ **`docs/game-design/gameplay/parcel-geography.md` is fiction relative to code** — "Mineral Density," "Hydration Retention," "Industrial Residue," and the Nyski/Brzeski/Opolski county bonuses it describes don't exist anywhere in the type system.

## 3. Core actions — mostly real, one dead lever

- ✅ **Plant** (`main.mo:1124+`): 50 PLN/tree, tree age ramps 0%→100% yield over ages 3-40 (`game_logic.mo:24-31`). Real.
- ✅ **Water**: 200 PLN, +0.3 water level, feeds a 3-bucket yield modifier (0.7/0.85/1.0). Real but coarse.
- 🟡 **Fertilize**: 500 PLN, +0.1 fertility — but the `_fertilizerType` parameter is accepted and **explicitly ignored** (`main.mo:858`, `// TODO: Future enhancement`). Every fertilizer choice has identical effect. Players may believe fertilizer quality matters; it doesn't.
- ✅ **Harvest**: genuinely multi-factor — base yield × soil × pH × fertility × infrastructure × water × organic × tree age × county, then weather impact, then labor-type multiplier. This is the most "real" formula in the game.
- ✅ **Sell**: real two-channel pricing (see §4).

## 4. Economy / pricing — real core, one dead lever, one cosmetic-only endpoint

The formulas actually used by `sellCherries` (`game_logic.mo:143-176`) are real: Retail = base × market size × quality bonus × organic premium (1.4×) × regional saturation; Wholesale = base × 0.7 × volume discount × quality × saturation. Both are further multiplied by AI-competitor-driven supply/demand pressure (`competitor_logic.mo`). **Quality, organic status, sale volume, region saturation, and AI activity all genuinely move the price.**

- 🟡 **`getMarketPrices()` (the query the UI likely shows) is cosmetic** — a static stub with `seasonMultiplier = 1.0 // TODO: Vary by season` (`main.mo:2808-2819`), never consulted by the real sale path. Season has **zero** effect on price despite this being an intended lever per docs and comments.
- 🟡 **Doc mismatch**: `price-formulas.md` claims all infrastructure compounds `1.05^Level` — only Golden Harvester actually compounds; Tractor/Shaker/Sprayer/ColdStorage are additive.

## 5. Spoilage/risk — two contradictory systems, real weather risk

- 🟡 **Two spoilage implementations exist.** `GameLogic.calculateSpoilageRate` (`game_logic.mo:46-65`) exactly matches the documented 100%/80%/20% table in `spoilage-rates.md` — but **it is dead code, never called anywhere**. What actually runs at season-end (`main.mo:1466-1480`) is `StorageLogic.calculateSpoilage`, a different formula entirely (15%/8%/2% base rates ÷ handling quality). **The documented spoilage system is fiction; the real one is undocumented anywhere.**
- ✅ **Weather risk is real**: 8 weather states (Sunny/Rainy/Frost/Drought/Heatwave/Flood/PestOutbreak/DiseaseOutbreak), each with real probability tables, cutting yield and quality by up to 40%, mitigable by Sprayer infrastructure. Insurance (where reachable — see §7) pays out proportional to severity.

## 6. Player journey — the loop works, nothing teaches it

- Login: real Internet Identity on mainnet; **silently auto-logged-in with a throwaway identity on local/playground** — and off-mainnet, a farm gets auto-created under a hardcoded test identity before the player ever sees the onboarding modal, making the one onboarding surface that exists **dead in every non-mainnet build**.
- Main nav: 7 real tabs (dashboard, marketplace, sports, neighbors/competitors, rankings, harvester, pool) + 2 buttons that open modals instead of tabs (shop, stats) + 1 unreachable dead-code fallback branch (not evidence of a missing feature, just leftover scaffolding).
- Core farm screen is fully interactive — real plant/water/fertilize/harvest/organic-conversion actions, phase-gated buttons with disabled-reasons.
- **Biggest UX gap**: nothing in-game teaches the 10-phase state machine that gates almost every action. A first-time player has only a one-line italic caption to explain why buttons are greyed out.

## 7. Competitive Pool / Auctions & AI rivals — real skeleton, several stubbed limbs

- ✅ **Bid scoring is real math**: `V_bid = (base − offer) × (1500 + prestige+reputation) × qualityMult ÷ 100`, highest score wins. Pre-Season Futures (93% locked price, 10% up-front fee — note: code comment claims 5%, actual constant is 10%) vs. post-harvest sealed-bid Imperial Contracts are genuinely different mechanics.
- ✅ **AI archetypes genuinely differ in code**, not just flavor text: Marek (`#Traditionalist`, skips Bio/Pre-Season, 15-45% discount range, always bids full volume), Kasia (`#Innovator`, Bio-only, 5-15% discount, always organic), Hans (`#Businessman`, Export/Industrial only, inventory-gated "trap" condition unique to him, fixed 5% discount, bids only actual inventory). **Naming note for the GDD rewrite**: the "Aggressive/Eco/Tactician" framing used in prior docs doesn't match either the code's internal personality tags or its own display names ("The Traditionalist"/"The Eco-Visionary"/"The Aggressor") — pick one naming scheme and make it canonical.
- 🟡 **Runner-up trickle-down mechanic is fully scored and then discarded** — `AuctionResult.runnerUpId` is computed but never read anywhere in `main.mo`; the trickle constant is underscore-prefixed as deliberately unused.
- 🟡 **Flood Factor uses a placeholder market-pressure heuristic**, not real aggregated supply data (comment: "simplified... for now").
- 🟡 **Asymmetric prestige reward**: AI competitors gain +5 prestige on contract wins; **players get no equivalent prestige gain for winning**, undercutting risk/reward symmetry.
- 🟡 **`CompetitorsPanel.tsx` reads a nonexistent field** (`baseCapacity` instead of the real `productionCapacity`) and hardcodes a fake "+4.2%" market trend tile — self-labeled `// mock calculation`. The real Auction Dashboard's rival sidebar is correctly wired; this is a separate, decorative panel.
- Financial default penalty on a missed Pre-Season Future is real (200% of shortfall value seized + 10% reputation loss) — but doc/type comments claim 150%, another doc-vs-code mismatch to fix in the rewrite.

## 8. Weather UI — real backend, split/inconsistent frontend

Backend weather mechanically affects yield/quality/water as described in §5. Frontend has **two independent visual layers that disagree**: `WeatherEffects.tsx` correctly covers all 8 real weather states; the older `WeatherOverlay.tsx` canvas layer is mostly dead — it checks for a `"Storm"` weather type that **doesn't exist** in the type system, so its rain path never fires; its only live behavior (snow) is tied to calendar season, not actual weather state. No dedicated `useWeather` hook exists; logic lives inline in `App.tsx`.

## 9. Crop Insurance — real backend, doubled, and entirely unreachable

Two parallel, **divergent** backend implementations both exist and both fully function: `buyInsurance()` (variable premium by policy type, phase-gated) and `purchaseCropInsurance()` (flat 2000 PLN, different phase gate, hardcoded policy type). **Zero frontend code calls either one** — no button, no modal, anywhere. A fully-built feature, duplicated, completely unreachable by players.

## 10. Cherry Festival — ❌ vaporware, confirmed

Zero trace in any `.mo` file — no type, no function, no TODO comment. The only "festival" references in the repo are narrative GDD template text (`frontend/src/lib/gddTemplate*.ts`), not code. The old roadmap's claim that this was "backend-ready, just needs UI" was entirely wrong.

## 11. Leaderboard / Prestige — real

`finalPrestige = revenue/100 + infraLevel×10 + seasonsCompleted×50`, +20% if organically certified — genuinely reflects player investment, longevity, and organic-conversion choices. Already improved this session (own-rank visibility, mobile layout).

## 12. Golden Harvester — real, dominant late-game lever

Cost scales `10,000 × 1.15^level` (compounding sink); effect is a **multiplicative** `1.05^level` yield modifier stacked on top of the other (additive) infrastructure types — meaning at high levels it mathematically dominates every other infra investment. A legitimate, if potentially balance-skewing, power spike.

## 13. Hiring/Labor — real

3-tier system (Village/Standard/City) + Emergency fallback, real upfront cost, per-kg harvest labor cost, yield multiplier, and post-harvest handling-quality effect on spoilage. Fully wired end-to-end, frontend included.

## 14. Sports Patron / Football Clubs — 🟡 live wired stub, not "deferred"

Correction to old roadmap framing: this isn't absent, it's a **fully-built dead end**. Types are completely modeled (ownership%, market value, ticket revenue, TV rights, wages). Backend endpoints exist in the Candid interface but are explicit stubs: `getAvailableFootballClubs()` always returns an empty list, `buyClubShares()` always returns `"Sports Center feature coming soon!"`, both labeled `// Phase 6 Stubs`. Frontend `SportsCenter.tsx` is fully built and mounted — players just always see an empty state. Distinguish clearly from Cherry Festival (zero code) when deciding what to do with this in the revised GDD: keep-and-finish vs. rip-out are both much cheaper here than "build from scratch."

---

## Summary table

| System | Verdict | One-line reason |
|---|---|---|
| Phase/turn structure | ✅ Real | 10-phase state machine, player-driven, meaningfully gates actions |
| Parcel soil/pH/geography | 🟡 Stub | Always optimal/identical; county always `"TBD"`; regional bonuses unreachable |
| Plant/Water/Harvest | ✅ Real | Multi-factor, choice-sensitive |
| Fertilize (type choice) | 🟡 Dead lever | Parameter accepted, explicitly ignored |
| Retail/Wholesale pricing | ✅ Real | Quality/organic/saturation/AI-competition all move price |
| Season→price effect | 🟡 Dead lever | Hardcoded 1.0 despite intent |
| Documented spoilage table | ❌ Fiction | Matches dead code, not what runs |
| Actual spoilage (StorageLogic) | ✅ Real | Runs, undocumented |
| Weather mechanical impact | ✅ Real | Yield/quality/water all affected |
| Weather UI | 🟡 Split | One layer correct, one mostly dead |
| Auction bid scoring | ✅ Real | Genuine formula, real stakes |
| AI archetypes (Marek/Kasia/Hans) | ✅ Real | Distinct formulas/gates, naming inconsistent across docs |
| Runner-up trickle | 🟡 Dead code | Computed, never read |
| Flood Factor | 🟡 Partial | Real mechanic, placeholder input data |
| Player prestige on contract win | 🟡 Missing | AI gets it, players don't |
| CompetitorsPanel display | 🟡 Mocked | Nonexistent field, fabricated numbers |
| Leaderboard/Prestige | ✅ Real | Reflects genuine player choices |
| Golden Harvester | ✅ Real | Dominant, compounding, late-game |
| Hiring/Labor | ✅ Real | Full 3-tier economy, wired end-to-end |
| Crop Insurance | 🟡 Unreachable | Two divergent real implementations, zero UI |
| Cherry Festival | ❌ Vaporware | No code anywhere |
| Sports Patron | 🟡 Wired stub | Fully built both sides, backend hardcoded empty |
| Onboarding | 🟡 Dead off-mainnet | Auto-bypassed before player ever sees it |
| Phase-system teaching | ❌ Missing | Zero in-game guidance beyond one caption |

## What this means for the GDD/concept revision

This document is intentionally descriptive, not prescriptive — it's the "what is" input the team needs before deciding "what should be." A few observations worth carrying into that discussion:

- The **economic skeleton is more real than the roadmap gave it credit for** (phases, harvest math, pricing, auctions, AI rivals) — a revision doesn't have to start from zero on the core loop.
- Several features are **half-finished in a way that's cheap to either finish or delete** (Crop Insurance UI, runner-up trickle, player contract-win prestige, season-price effect) — these are small, bounded scoping decisions, not new builds.
- A few features are **fully-built dead ends** (Sports Patron) where the real decision is strategic (invest to finish vs. rip out), not technical.
- One feature (**Cherry Festival**) needs to be treated as a brand-new feature to design, not a completion task, if it's kept at all.
- The **least-built part of the game is teaching the player how to play it** — onboarding is dead off-mainnet and the phase system (the single most structurally important mechanic) has no in-game explanation at all.
