# Mark Vinicius Cherry Tycoon — Design Doc (v3)

**Status**: v3, written 2026-07-29 after (1) a full code-verified audit of the existing implementation (`docs/game-design/CURRENT-STATE-2026-07-29.md`) and (2) rediscovering the original concept document `Mark_Vinicius_V1.md`, which restores a core pillar (football clubs) that a code-only audit had wrongly demoted. This is the single top-level design reference. Per-system docs under `docs/game-design/` remain as supporting detail but must be reconciled against this page — none of them should be trusted blindly, including this one; re-verify against code as the game evolves.

**Why v3 exists**: v2 (code-audit-only) concluded Cherry Festival was scope creep and football clubs were a side stub to maybe finish. Reading `Mark_Vinicius_V1.md` showed both were part of the original dual-pillar concept from day one. Lesson for future revisions: **triage against original intent, not just against what got built** — a stub can be either abandoned scope or a broken promise, and the difference matters.

---

## Core Fantasy

You are an industrialist-farmer in a Neo-Steampunk reimagining of rural Poland, building a cherry empire — and reinvesting its profits into local football clubs to dominate the regional league pyramid. Two pillars, one empire: the organic rhythm of the orchard funds the escalating ambition of the boardroom, while rival tycoons contest both the harvest and the league table.

## Core Loop

**Farm thread** (every turn): Plan (hire labor, procure supplies) → Grow (plant/water/fertilize, weather risk) → Harvest → Sell/Compete (retail/wholesale + auction bids against AI rivals, Cherry Festival standing) → Invest (infrastructure, Golden Harvester).

**Club thread** (strategic layer, funded by the farm): Acquire stake → Manage (transfers, stadium, wages) → Compete (league position, TV rights) → Reinvest or divest.

Both threads feed one **Prestige/Leaderboard** meta-progression across years — a legitimate strategy is farm-only, club-only, or both; the design must not force either.

## Pillars (non-negotiable)

1. **Two pillars, one empire.** Farming and football club ownership are equal, connected pillars — not a core game plus a side stub. A player should be able to explain their strategy in terms of both.
2. **Geography and inputs genuinely matter, and the model scales.** No two parcels should play the same today (Opole); the data model must support the full Poland province→county→commune hierarchy from the start, even though only Opole unlocks initially — this was the original design intent (`Mark_Vinicius_V1.md` §4) and must not be re-narrowed to "just Opole" at the data layer.
3. **Rivalry has real stakes for both sides**, on both threads — if AI competitors gain from winning an auction, so must the player; the Cherry Festival is a real, designed competitive event (not vaporware), part of the rivalry system alongside auctions, not a bolt-on later.
4. **Risk is real, but insurable.** Weather can hurt you; hedging against it must be visible and functional.
5. **The phase system is taught, not assumed.** The 10-phase yearly cycle is the game's most structurally important mechanic and must be legible to a first-time player without external documentation.
6. **The world looks and feels like the lore promises.** Neo-Steampunk Cherry aesthetic (`docs/game-design/lore/game-lore.md`) is not yet matched by the current UI/UX (see below) — an open, high-priority gap, not a settled pillar to defend as-is.

## Where we actually are on the original roadmap

`Mark_Vinicius_V1.md` §11 phases this as: Phase 0 (single-player Opole) → Phase 1 (AI competition + rankings) → Phase 2 (football clubs locally) → Phase 3 (map expansion) → Phase 4 (multiplayer + ICP tokenomics). Current reality: **Phase 0–1 are substantially real** (see audit); **Phase 2 is fully built on both ends but deliberately disabled** (backend hardcodes empty results); **Phase 3 hasn't started** (geography is a single-value stub, not a scalable hierarchy yet); **Phase 4 hasn't started**. This reframes the immediate milestone as **finishing Phase 2 properly and correcting Phase 0–1's broken levers** — not starting from zero.

## Triage decisions (superseding the 2026-07-29 code-only audit where V1 changes the call)

| System | Decision | Why |
|---|---|---|
| Phase/turn structure | **Keep** | Real, load-bearing |
| Plant/Water/Harvest | **Keep** | Real, multi-factor, choice-sensitive |
| Retail/Wholesale pricing core | **Keep** | Genuinely reflects quality/organic/saturation/AI activity |
| Auction bid scoring + AI archetypes | **Keep** | Real, distinct formulas per rival |
| Weather mechanical impact | **Keep** | Real yield/quality risk |
| Leaderboard/Prestige | **Keep** | Reflects genuine player choices |
| Golden Harvester | **Keep** | Real, meaningful late-game lever |
| Hiring/Labor | **Keep** | Real 3-tier economy, fully wired |
| Localization (10 languages) | **Keep — already exceeds V1** | V1 asked for EN/PL/DE; frontend already ships 10 locales |
| **Sports Patron / football clubs** | **Restore as core pillar, finish fully** *(changed from v2's "finish as bonus")* | V1 Short Pitch names this half the game's identity; both frontend and backend are already built — the backend just needs to stop hardcoding empty/error |
| **Cherry Festival** | **Design now, as part of the core rivalry system** *(changed from v2's "Cut")* | Was in the original concept from day one (`Mark_Vinicius_V1.md` §2) as a competitive event alongside auctions — not scope creep, a broken promise |
| **Parcel/regional geography** | **Design for full Poland scalability now; ship Opole-only UI** *(changed from v2's "just fix Opole")* | V1 §4 specifies the full province→county→commune data model up front, with UI unlocking regions progressively — building only a bigger Opole-only patch would re-create the same narrowing mistake |
| Fertilizer type choice | **Fix** | Currently a no-op parameter — violates Pillar 2 |
| Season → price effect | **Fix** | Hardcoded to 1.0 despite documented intent |
| Runner-up trickle-down (auctions) | **Fix** | Already scored, just needs to be read and applied |
| Player prestige on contract win | **Fix** | AI gets it, player doesn't — violates Pillar 3 |
| Spoilage system (two contradictory versions) | **Fix (consolidate)** | Keep the real one (`StorageLogic`), delete the dead documented one |
| `CompetitorsPanel` mock/wrong-field data | **Fix (bug)** | Not a design decision, just broken |
| AI archetype naming (3 inconsistent naming schemes) | **Fix (housekeeping)** | Pick one canonical name per rival across docs/code/UI |
| Onboarding + phase-system teaching | **Fix (high priority)** | Dead off-mainnet, absent everywhere — violates Pillar 5 |
| Crop Insurance (two divergent backends, zero UI) | **Fix** | Pick one implementation, build the missing UI — required by Pillar 4 |

## Open, not-yet-scoped priority: UX/UI overhaul

**The current graphical layout/UI is weak** and matches neither the Neo-Steampunk Cherry lore aesthetic (Pillar 6) nor V1's own explicit UI/UX priorities (§13: 3-click onboarding, mobile-first 60fps, visible action feedback, progress visibility, social proof — the current build falls short on effectively all five). This needs its own deep design pass, scoped separately from the gameplay fixes above, informed by `docs/game-design/ui/*` (design tokens, mobile standard — all need re-verification against current code).

## Future / Not Now (documented, not designed yet)

Explicitly deferred per V1's own phased ambition (§6, §7, §9, §11 Phase 3-4) — revisit only after the current milestone (Phase 2 completion + core-loop fixes + UX overhaul):

- Full multi-province map expansion beyond Opole (V1 §4, Phase 3)
- Multiplayer, ICP payments/tokenomics, NFT land/club shares, DAO region-unlock voting (V1 §9, Phase 4)
- Seed/variety breeding, crop diversification (apples, plums), beneficial-species ecosystem bonuses (V1 §6)
- Sabotage mechanics, processing facilities (juices/jams), farm/club mergers, ICP asset marketplace (V1 §6)
- Deeper Eco/Organic mode detail: explicit conversion period, certification cost tiers, random inspections (V1 §5) — current implementation has a simplified real organic bonus; the full V1 spec is richer than what's built

## Won't Have

*(none currently — Cherry Festival moved from "Cut" to "design now" above; nothing has been permanently ruled out this revision)*

## Where the detail lives

- Original concept: `Mark_Vinicius_V1.md` — source of truth for intent/ambition
- Full code-verified audit: `docs/game-design/CURRENT-STATE-2026-07-29.md` — source of truth for current reality
- Per-system specs (economy, backend, UI): `docs/game-design/{economy,backend,ui,gameplay}/` — re-verify against the audit before trusting any specific number/claim
- Live roadmap/state: `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/REQUIREMENTS.md`

---
*Last updated: 2026-07-29. v3 supersedes v2 after reconciling the code audit with the original `Mark_Vinicius_V1.md` concept.*
