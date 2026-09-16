# Phase 3: Core Economic Lever Fixes - Context

**Gathered:** 2026-09-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Close 7 "dead lever" findings from the 2026-07-29 audit: fertilizer type selection has no effect, season doesn't affect sale price, auction runner-up trickle-down is computed but never paid, players get no prestige credit for winning an Imperial Contract (AI does), two spoilage systems coexist with one dead, `CompetitorsPanel.tsx` reads a nonexistent field, and AI archetype naming is inconsistent across code/UI/docs. Small, mostly independent bugfixes — not a redesign of any of these systems. `03-RESEARCH.md` and `03-UI-SPEC.md` already exist with exact file:line references and a verified UI design contract; this discussion resolves the remaining balance/design open questions those two docs flagged as needing a human decision.

</domain>

<decisions>
## Implementation Decisions

### ECON-01: Fertilizer type taxonomy
- **D-01:** Ship 3 fertilizer types with a real yield-multiplier effect (RESEARCH.md Option B): **Organic-Compatible** (no yield bonus, required to keep `parcel.isOrganic` true), **Synthetic-Standard** (current baseline, no change), **Synthetic-Intensive** (+5% yield via a new small multiplicative term in `calculateYieldPotential`). This is the larger of the three researched options — it changes `calculateYieldPotential`'s formula, not just `fertilizeParcel`'s fertility-bump logic. — **Reversibility:** costly — touches `game_logic.mo`'s yield formula, its `gameLogic.ts` mirror, `economyParity.test.ts`, and the new fertilizer-picker UI; reverting after ship means re-touching all of those plus any player-facing copy that named the three types.
- **D-02:** Applying Synthetic-Intensive to an already-organic parcel (`parcel.isOrganic = true`) does **not** get blocked or auto-flipped by the backend. The backend applies the yield effect as normal; the frontend shows a warning before the player confirms ("this will affect your organic status" — exact copy TBD by planner/UI). `isOrganic` is **not** mutated by this action at all — organic-status change (if it should exist) is out of scope for this phase, not silently implemented here.
- Exact type display names/labels beyond the three role names above (Organic-Compatible / Synthetic-Standard / Synthetic-Intensive) are Claude's discretion (see below) — the picker's shape was already locked in `03-UI-SPEC.md`.

### ECON-02: Season sale-price multiplier
- **D-03:** Use RESEARCH.md Option A — multiplier anchored proportionally to the existing AI season-demand curve (`competitor_logic.mo`'s `getSeasonDemand`): **Spring 0.9x, Summer 1.15x, Autumn 1.0x, Winter 0.75x**.
- **D-04:** No composition-order decision is actually needed. Verified directly in `main.mo`: `marketMult` (from `CompetitorLogic.computeMarketMultiplier`, capped to [0.50, 1.0]) is computed and capped *before* it enters the revenue formula (`basePrice * marketMult * quantity`); the season multiplier is just one more multiplicative factor in that same product, so `basePrice * marketMult * seasonMultiplier` and `basePrice * seasonMultiplier * marketMult` are numerically identical — no cap sits between them. Also confirmed non-redundant: `computeMarketMultiplier` is capped at 1.0 (can only ever go neutral-or-down for demand, never up), so it structurally cannot express a genuine summer *premium* — the new season multiplier fills exactly that gap rather than double-counting.

### ECON-03: Runner-up trickle-down
- **D-05:** Additive bonus, not a literal volume split (RESEARCH.md's lowest-risk reading). Runner-up receives `20% of the contract's requiredVolumeKg × their own offerPricePLN` as an ADDITIONAL payout. The winner's existing full payout (`requiredVolumeKg × winner.offerPricePLN`) is untouched. — **Reversibility:** reversible — new code path only, no change to the winner's existing formula.
- Implementation must cover both directions: the runner-up in a resolved contract can be the player OR an AI competitor (confirmed both `main.mo` branches currently only handle the winner) — both paths need wiring, not just one, per `03-RESEARCH.md`.

### ECON-04: Player prestige credit on contract win
- **D-06:** Flat `+5` to `PlayerFarm.reputation` (0-100 scale) on winning an Imperial Contract, matching the literal `+5` AI competitors get on `AICompetitor.prestige` (0-1000 scale) — **no rescaling, no stable-state migration**.
- **Rejected alternative (recorded for the record):** rescaling `PlayerFarm.reputation` to a 0-1000 range to genuinely match AI's `prestige` field was considered and explicitly rejected. Reasons, verified in code: (1) `reputation` is stable state — every existing player already has a persisted 0-100 value; rescaling without a migration would silently corrupt it (a stored `50` would become "50/1000" instead of "50/100"). (2) The field is read elsewhere ("affects contracts and club deals" per `types.mo:217`) and other consumers likely assume 0-100 — a full audit is out of scope for a 7-item bugfix phase. (3) AI actually has **two separate fields** — `prestige: Nat // 0-1000` and `reputation: Nat // 0-100 local trust` (`types.mo:405-406`) — and the player's `reputation` already matches AI's `reputation` scale exactly; rescaling to match `prestige` would just trade one mismatch for another, at the cost of a data migration. — **Reversibility:** n/a (rejected, not implemented).

### Claude's Discretion
- Exact fertilizer-type display copy/labels (within the 3 locked role names above) and the exact organic-status warning copy — `03-UI-SPEC.md`'s Copywriting Contract already locks the picker's shape (2-3 item radio list, one-line tradeoff caption, "Fertilize with {Type Name}" pattern); final label text can now be filled in against the 3 locked type names.
- Exact wording/placement of the "this affects organic status" UI warning (D-02) — no specific copy was dictated, only the behavior (warn, don't block, don't auto-mutate).
- ECON-05/06/07 (dead-code removal, `CompetitorsPanel` field fix, AI archetype naming consolidation) were explicitly **not discussed** — user and researcher agree these are mechanical fixes with no open decision. Researcher's `03-RESEARCH.md` recommendations stand as-is: delete `GameLogic.calculateSpoilageRate`, fix `CompetitorsPanel.tsx`'s `comp.baseCapacity` → `comp.productionCapacity` (and remove the `any` cast), and use the backend's canonical names (`competitor_logic.mo`'s Marek/Kasia/Hans ↔ Traditionalist/Innovator/Businessman) as the single scheme — `gddTemplate.ts`'s Jan Kowalski/Anna Nowak/Piotr Wiśniewski references get renamed to match (that file is never imported by any `.tsx`, so this is a text-only fix with zero rendered-UI impact per `03-UI-SPEC.md`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase artifacts (this phase, already produced)
- `.planning/phases/03-core-economic-lever-fixes/03-RESEARCH.md` — exact file:line findings for all 7 requirements, the 3-option menus this discussion resolved, environment/stack verification
- `.planning/phases/03-core-economic-lever-fixes/03-UI-SPEC.md` — locked UI design contract (fertilizer picker shape, season-row wiring, Regional Output tile, UI-consideration probe coverage)
- `.planning/phases/03-core-economic-lever-fixes/03-VALIDATION.md` — per-requirement test map and Wave 0 gaps

### Economy formulas (Task Router: "Economy formulas, yield, pricing, costs")
- `backend/game_logic.mo` — `calculateYieldPotential` (ECON-01 touches this), `calculateWholesalePrice`/`calculateRetailPrice` (ECON-02 touches these)
- `frontend/src/lib/gameLogic.ts` — mirror; MUST be updated in the same commit as any `game_logic.mo` formula change per CLAUDE.md
- `frontend/src/__tests__/economyParity.test.ts` — MUST gain new `describe` blocks for ECON-01/02, per CLAUDE.md's mirror rule
- `docs/game-design/economy/price-formulas.md` and `docs/game-design/economy/math-consistency.md`

### Auctions / competitive pool (ECON-03, ECON-06, ECON-07)
- `backend/auction_logic.mo` — `resolveContract`, `_RUNNER_UP_TRICKLE_NUM/DEN` constants
- `backend/competitor_logic.mo` — `computeMarketMultiplier`, `getSeasonDemand`, the 3 canonical AI archetypes and names
- `docs/game-design/economy/gdd-competitive-pool.md`, `docs/game-design/economy/gdd-analysis.md` (noted stale, dated 2026-02/03 — do not treat as more current than `03-RESEARCH.md`'s live code read)

### Spoilage (ECON-05)
- `backend/storage_logic.mo` — `calculateSpoilage` (live, keep)
- `backend/game_logic.mo` — `calculateSpoilageRate` (dead, delete)
- `docs/game-design/economy/spoilage-rates.md` — currently documents the dead function; must be rewritten to document the live one as part of ECON-05

### Project-level hard rules
- `CLAUDE.md` — Ask First (economy balance numbers, ✅ done via this discussion), mirror rule, dual-entrypoint Never rules (do not mirror any of these 7 fixes into `backend/main_mainnet.mo` — Track B, EOP-01, unverifiable)
- `.planning/LESSONS.md` → "Balance numbers are the user's call, not mine", "Read the lever before wiring it", "Re-derive a number before repeating it" — all directly applicable to this phase
- `docs/game-design/backend/track-separation.md` — why Track A/B stay separate

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/components/ui/dropdown-menu.tsx` — already exports `DropdownMenuRadioGroup`/`DropdownMenuRadioItem`; the fertilizer-type picker reuses this, no new shadcn install
- `SellModal.tsx:229`'s existing emerald/rose/slate color logic for `pricingFactors.seasonMod` is already correct — ECON-02 only needs to wire a real value into it, not touch the color logic
- `App.tsx`'s `handleParcelAction` toast pattern ("Action Restricted", `variant: "destructive"`) — reuse for the new "Fertilizing Failed" error state rather than inventing a new toast style

### Established Patterns
- `uiConventions.test.ts` — existing ratchet-test pattern (pinned emoji/currency conventions) worth extending for ECON-07's archetype-name consistency rather than inventing a new file
- `economyParity.test.ts` — the TS↔Motoko parity oracle; any new formula term (ECON-01's yield multiplier, ECON-02's season multiplier) needs a new `describe` block here, mirroring the existing 120-case structure

### Integration Points
- `App.tsx:244` — currently hardcodes `fertilizerType: "NPK"` on the single fertilize call site; this is where the new 3-type picker's selection needs to flow through
- `main.mo`'s contract-resolution loop (~3199-3219, ~3243-3364) — where ECON-03's runner-up payout and ECON-04's prestige credit both need new code paths, covering both the player-as-runner-up and AI-as-runner-up branches

</code_context>

<specifics>
## Specific Ideas

- User pushed back on the ECON-04 flat-vs-scaled framing and asked directly "why not make both scales 0-1000?" — worth preserving as a specific idea future phases might revisit *if* a real, scoped reputation/prestige unification project is ever taken on. Not adopted here: verified in code that it requires a stable-state migration of `PlayerFarm.reputation` plus an audit of every other consumer of that field, which is out of proportion to this phase. If this becomes its own future phase, start from the finding that AI's `reputation` (0-100) and `prestige` (0-1000) are two different fields with two different meanings, not one field needing a scale fix.

</specifics>

<deferred>
## Deferred Ideas

- Reputation/prestige scale unification (`PlayerFarm.reputation` 0-100 → 0-1000, migrating existing player data) — raised during ECON-04 discussion, explicitly deferred as its own potential future phase, not bundled into Phase 3. See `<specifics>` above for the reasoning to start from.
- Real live bidding status for `BidModal.tsx`'s `RivalryDeck` (currently hardcodes each rival's `status` regardless of actual bid data) — flagged by `03-UI-SPEC.md` as a known defect outside ECON-07's naming-only scope; would need a new requirement if the team wants it fixed.

### Reviewed Todos (not folded)
None — `todo.match-phase 3` returned zero matches.

</deferred>

---

*Phase: 3-core-economic-lever-fixes*
*Context gathered: 2026-09-16*
