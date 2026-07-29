# Mark Vinicius Cherry Tycoon — One-Page Design Doc

**Status**: v2, written 2026-07-29 after a full code-verified audit of the existing implementation (see `docs/game-design/CURRENT-STATE-2026-07-29.md`). This replaces prior fragmented/stale design docs as the single top-level reference — per-system docs under `docs/game-design/` remain as supporting detail but must be reconciled against this page and the audit, not trusted blindly.

---

## Core Fantasy

You are an industrialist-farmer building a cherry empire in a Neo-Steampunk reimagining of rural Poland — balancing the organic rhythm of the orchard against the escalating machinery of scale, while out-maneuvering rival tycoons for lucrative wholesale contracts.

## Core Loop

**Plan** (hire labor, procure supplies) → **Grow** (plant/water/fertilize, weather risk) → **Harvest** → **Sell/Compete** (retail/wholesale + auction bids against AI rivals) → **Invest** (infrastructure, Golden Harvester) → repeat, with **Prestige/Leaderboard** as the meta-progression thread across years.

## Pillars (non-negotiable)

1. **Geography and inputs genuinely matter.** No two parcels should play the same; fertilizer/soil/regional choices must produce different outcomes, not cosmetic ones.
2. **Risk is real, but insurable.** Weather can hurt you; you must be able to hedge against it, and that choice must be visible and functional.
3. **Rivalry has real stakes for both sides.** If AI competitors gain from winning, so must the player — symmetry in risk/reward is required, not optional flavor.
4. **The phase system is taught, not assumed.** The game's most structurally important mechanic (the 10-phase yearly cycle) must be legible to a first-time player without external documentation.
5. **The world looks and feels like the lore promises.** Neo-Steampunk Cherry aesthetic (`docs/game-design/lore/game-lore.md`) is not yet matched by the current UI/UX — this is an open, high-priority gap (see below), not a settled pillar to defend as-is.

## Triage decisions (from the 2026-07-29 audit)

| System | Decision | Why |
|---|---|---|
| Phase/turn structure | **Keep** | Real, load-bearing, aligned with core loop |
| Plant/Water/Harvest | **Keep** | Real, multi-factor, choice-sensitive |
| Retail/Wholesale pricing core | **Keep** | Genuinely reflects quality/organic/saturation/AI activity |
| Auction bid scoring + AI archetypes | **Keep** | Real, distinct formulas per rival |
| Weather mechanical impact | **Keep** | Real yield/quality risk |
| Leaderboard/Prestige | **Keep** | Reflects genuine player choices |
| Golden Harvester | **Keep** | Real, meaningful late-game lever |
| Hiring/Labor | **Keep** | Real 3-tier economy, fully wired |
| Parcel geography (soil/pH/county) | **Fix** | Currently always-identical/optimal stub — directly violates Pillar 1 |
| Fertilizer type choice | **Fix** | Currently a no-op parameter — violates Pillar 1 |
| Season → price effect | **Fix** | Hardcoded to 1.0 despite documented intent |
| Runner-up trickle-down (auctions) | **Fix** | Already scored, just needs to be read and applied |
| Player prestige on contract win | **Fix** | AI gets it, player doesn't — violates Pillar 3 |
| Spoilage system (two contradictory versions) | **Fix (consolidate)** | Keep the real one (`StorageLogic`), delete the dead documented one, document what actually runs |
| `CompetitorsPanel` mock/wrong-field data | **Fix (bug)** | Not a design decision, just broken |
| AI archetype naming (3 inconsistent naming schemes) | **Fix (housekeeping)** | Pick one canonical name per rival across docs/code/UI |
| Onboarding + phase-system teaching | **Fix (high priority)** | Currently dead off-mainnet and absent everywhere — violates Pillar 4 |
| Crop Insurance (two divergent backends, zero UI) | **Fix** | Pick one implementation, build the missing UI — required by Pillar 2 |
| Sports Patron / football clubs | **Fix (finish)** | Both ends already fully built; backend just needs to stop hardcoding empty/error |
| Cherry Festival | **Cut (for now)** | Zero code exists anywhere; treat as a future new-feature proposal, not a completion task, if revisited |

## Open, not-yet-scoped priority: UX/UI overhaul

Flagged 2026-07-29: **the current graphical layout/UI is weak** and does not match the Neo-Steampunk Cherry aesthetic the lore promises (Pillar 5). This needs its own deep design pass — not a bundled afterthought inside the fixes above. Scope (visual language, layout system, component redesign, mobile experience) to be defined in a dedicated follow-up, informed by `docs/game-design/ui/*` (design tokens, UI consistency, mobile standard — all need re-verification against current code, same as everything else in this repo).

## Won't Have (for now)

| Item | Reason |
|---|---|
| Cherry Festival | No existing code; net-new feature, deferred until core loop + UX overhaul are settled |

## Where the detail lives

- Full code-verified audit: `docs/game-design/CURRENT-STATE-2026-07-29.md`
- Per-system specs (economy, backend, UI): `docs/game-design/{economy,backend,ui,gameplay}/` — **re-verify against the audit before trusting any specific number/claim in these**
- Live roadmap/state: `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/REQUIREMENTS.md`

---
*Last updated: 2026-07-29 after the post-migration gameplay audit and triage session.*
