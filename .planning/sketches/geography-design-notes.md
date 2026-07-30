# Geography, Density & Actor Design Notes (2026-07-30)

Design proposal for Phase 5 (Regional Geography Rebuild), written before planning starts, per the user's request to think through workers/machines, tree-per-parcel math, and the gmina→powiat→województwo map hierarchy — grounded in what was confirmed to already exist in code/docs (see `.planning/REQUIREMENTS.md` GEO-01's 2026-07-30 correction), not invented from scratch.

## 1. Ground truth (confirmed, not assumed)

- `backend/types.mo:12-44` already defines `Province` (16 real voivodeships), `CommuneType` (`#Urban`/`#Rural`/`#Mixed`), and `Region {province, county, commune, communeType, population, marketSize, laborCostMultiplier}`. `marketSize` and `laborCostMultiplier` already feed real formulas (`game_logic.mo:153`, `game_logic.mo:265`).
- Every parcel today is hardcoded to the same values (`#Opolskie`/`#Mixed`/0.8/1.0) — the schema exists, the variety doesn't.
- A second, redundant county-bonus mechanism exists (`game_logic.mo:124-130`, a direct string switch on `parcel.region.county`), disconnected from the enum-based `Region`.
- `CherryParcel.plantedTrees` exists and drives cost (prune cost, starter farm gets 50) but **does not affect yield at all** — `calculateYieldPotential` (`game_logic.mo:100-134`) uses `parcel.size` only. Base yield is `25 tons/ha`, commented `// Boosted for testing` — diverges from `Mark_Vinicius_V1.md` §1's stated `8-12 tons/ha`.
- A real `WorkerNPC` system exists in `frontend/src/components/farm/ImperialOrchard.tsx:579`, with an always-present "Owner Worker" and a `hasHelper`-gated "Helper Worker" (`:735`), built for the old top-down sector camera (`projectToIso(r,c,s)`).
- No machine/tractor visuals exist anywhere. No map-zoom UI (gmina→powiat→województwo) exists anywhere in `frontend/src/components/`.
- No cap exists on parcel count per player or per commune — parcels are an unbounded array today.

## 2. Workers & machines

### Workers — port the behavior, not the pixels
The existing `hasHelper`-gated two-NPC system is real and should be reused, not rebuilt. Concretely: re-anchor `WorkerNPC` positions using the sketch's `isoToScreen()` instead of the old `projectToIso(r,c,s)` sector math, and have workers walk along the **path network we just built** (`tileVertex`/`drawPathSeams` in sketch 001) between parcels rather than the old grid-walk. This reuses real, working logic (hire-state gating, seasonal hooks) and gives the path network an actual gameplay reason to exist beyond decoration.

### Machines — new, tie visibility to real infrastructure state
No machine visuals exist today. Proposal: draw a simple procedural tractor/shaker (same Canvas 2D vector technique as the trees — brass/copper Neo-Steampunk styling, no image assets), visible only when the player has actually purchased the corresponding infrastructure (Tractor/Shaker levels already tracked in `game_logic.mo`'s infra modifiers) and only during the phase where that machine would plausibly be active (e.g. a shaker during Harvest). Machines travel the same path network as workers. This avoids adding another decorative element disconnected from real game state — exactly the kind of gap the earlier UX audit flagged repeatedly (`ECON-06`, `SPORTS` stub, etc.).

## 3. Tree-per-parcel math

**The honest current state**: tree count is cosmetic/cost-only. Any visual "how many trees per parcel" design needs to either (a) accept that and keep it purely decorative, or (b) wire it into yield for real. Recommendation: **(b)** — it's a cheap, meaningful fix and was already flagged as `GEO-05`.

**Visual density (rendering, not simulation)**: don't attempt 1:1 tree rendering — a 0.5 ha parcel at realistic orchard density (roughly 400-600 trees/ha intensive, ~100-200/ha traditional) would mean 50-300 actual trees per parcel, which is unrenderable and unreadable at isometric-tile scale. Proposal: keep the sketch's current "one representative tree icon per parcel at 0.5 ha" as the baseline, and scale icon count with `parcel.size` using a capped/bucketed rule (e.g. 1 icon per 0.5 ha, capped at 6-9 icons per tile) rather than a literal count — the icon count is a readable abstraction of density, not a literal tree census.

**Yield formula fix (GEO-05, real mechanic)**: introduce a tree-count ceiling so `plantedTrees` matters — e.g. `effectiveTrees = min(plantedTrees, maxDensityPerHa * parcel.size)`, and blend that into the existing multiplicative yield formula rather than replacing it outright (keep soil/pH/fertility/infra/water/organic/age/county modifiers as-is). This makes "how many trees you've planted" a real lever again without a full formula rewrite.

**Base yield number**: 25 tons/ha is explicitly commented as a testing placeholder and diverges 2-3x from V1's stated 8-12 tons/ha. Not silently changing this — flagging it as an open balance decision (see below), since reverting it changes every downstream revenue number.

## 4. Geography hierarchy — map-zoom UI

The schema already supports this; only the UI is greenfield. Proposal: three nested zoom levels, all using the **same isometric Canvas 2D technique** from sketch 001, just at different scales — this reuses the rendering approach rather than inventing a fourth one:

- **Gmina view** (already sketched) — the player's own parcel grid, exactly what sketch 001 shows.
- **Powiat view** — a grid of gmina "tiles," each a small thumbnail-style icon summarizing one commune (aggregate stats: number of farms, `marketSize`, `communeType`). Click a gmina tile to zoom into its parcel grid.
- **Województwo view** — a grid of powiat tiles, one level further out, matching the real `Province` enum.

**Urban/Rural/Mixed visual differentiation**: at the powiat-view gmina-tile level, vary the tile's icon density/style by `CommuneType` (e.g. rural = more open green/tree iconography, urban = denser building iconography) — this gives the enum a visual identity, not just a hidden multiplier.

**Commune capacity (new mechanic, not yet decided)**: propose tying a commune's buildable parcel-grid size to its `CommuneType` — e.g. Rural communes offer a larger farmland grid (more parcels available), Urban/Mixed offer a smaller grid but (already true in the hardcoded values) a higher `marketSize`. This is a genuine tradeoff, not just flavor, and gives players a reason to care which commune type they're in beyond a hidden price multiplier.

**Navigation**: a simple zoom-out affordance (breadcrumb or a single "zoom out" control), consistent with common city-builder UX — no novel interaction pattern needed.

## Open decisions needing sign-off before Phase 5 planning

1. Should `plantedTrees` really affect yield (GEO-05), or should tree count stay decorative/cost-only as it is today?
2. Should base yield revert from the current `25 tons/ha` testing placeholder toward V1's stated `8-12 tons/ha`, or is 25 an intentional balance choice worth keeping?
3. Commune capacity — tie grid size to `CommuneType` as proposed above, or a different rule (e.g. tied to `population` instead)?
4. Scope: should the map-zoom UI (gmina→powiat→województwo) ship inside Phase 5, or split into its own phase given it's a large, genuinely new UI surface with zero existing code to build on?
