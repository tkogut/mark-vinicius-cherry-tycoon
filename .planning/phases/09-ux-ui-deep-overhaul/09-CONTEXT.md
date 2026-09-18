# Phase 9: UX/UI Deep Overhaul - Context

**Gathered:** 2026-09-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Close the remaining UX/UI findings from the 2026-07-29 screenshot audit that UX-06's ad-hoc Geometric Brass work (Aug 2026) did not cover: UX-02 (orchard lighting/atmosphere — density itself is done), UX-03 (one consistent stat-display idiom across screens), UX-04 (the sidebar's two never-resolving placeholder boxes), UX-05 (resolve the Processing Plant's dead lever), UX-06's residual buildable-border-zone + UX-09 (place the Marketplace building sprites in the orchard), and UX-08's residual phase-gating for procedural machines. UX-01 and UX-07 are already complete. This is a UI/visual phase — unlike Phase 3/3.1's backend correctness work, several items here are genuine design-taste decisions, which is why this phase went through discuss-phase (per the roadmap's own note that ad-hoc screenshot review doesn't fit sidebar/stat-idiom work the way it fit the orchard).

</domain>

<decisions>
## Implementation Decisions

### Global design principles (apply across all items below)
- **D-00:** Adopted from `docs/game-design/Architektura w Przeglądarkowych Grach Symulacyjno-Ekonomicznych.md` (a research doc on browser tycoon-game UI architecture the user supplied mid-discussion): (1) **Smart UI** — contextual overlays/panels when interacting with orchard objects, instead of blind modals; (2) a single **consistent bottom dock ("Action Dock")** consolidating indicators and primary actions, replacing scattered panels; (3) a **consistent CTA color hierarchy** across screens; (4) **solid panel backgrounds** (no expensive transparency that forces full background re-rendering under a panel) and **crisp, unscaled UI textures**.
- **D-00b (explicitly rejected, recorded so it isn't silently dropped):** the same document also describes a full OS-style multi-window system (draggable panels, 3-depth z-layering, a pinning system, a "target window" for Shift+click resource transfers between panels). The user explicitly rejected building this now: it is a new interaction architecture, not a refinement of UX-02..09, and it would conflict with mobile/PWA support (`LEAD-03`). See `<deferred>`.

### UX-02: Orchard lighting/atmosphere
- **D-01:** Extract the God Rays + `GoldenPollen` particle logic from `frontend/src/components/farm/GoldenHarvesterView.tsx` (confirmed orphaned — not imported/rendered anywhere in the app despite `PROJECT.md` claiming it "shipped") and embed it as an overlay layer directly inside `ImperialOrchard.tsx`, then delete the dead component and correct `PROJECT.md`'s stale claim.
- **D-02:** The light/pollen effect is **always visible** for every player (fulfills UX-02's lore promise unconditionally) — owning/leveling Golden Harvester only **increases intensity/particle density**, it does not gate visibility.
- **D-03:** Performance requirement: the particle emitter must be lightweight (canvas/CSS, no memory leaks) and must reduce or disable particle count under low framerate or on mobile viewports, per the D-00 rendering-performance principle. — **Reversibility:** reversible (pure rendering logic, no persisted state).

### UX-03: Stat-display idiom
- **D-04:** Two-pattern semantic grammar, not one single pattern — a flat progress bar forced onto open-ended values (cash, prestige) would be a UX error since bars need a defined 100%:
  - **Bar Meter** (label + value, `[|||||-----]` style): for finite/bounded/percentage values only — machine health/wear (0-100%), storage/cold-storage fill (current/max kg), season/phase-cycle progress.
  - **Metric Badge** (brass/gold icon + number + per-turn delta, no bar): for open-ended values — accumulated cash, prestige points.
  - **Circular gauges are eliminated entirely** — they waste vertical space and don't scale into a compact bottom dock on mobile.

### UX-04: Sidebar placeholder boxes (Claude's discretion, not discussed — see below)

### UX-05: Processing Plant dead lever
- **D-05:** Implement the **real +15% wholesale-price bonus** the Marketplace card already promises, conditioned on owning `#ProcessingFacility`, directly in `calculateWholesalePrice` (`backend/game_logic.mo`) — per V1-parity's "no dead levers" principle, since the player already pays 100,000 PLN + upkeep for this. Mirror into `frontend/src/lib/gameLogic.ts` and extend `economyParity.test.ts` in the same commit, per CLAUDE.md's mirror rule. — **Reversibility:** costly (economy formula + mirror + parity test; a later reversal would need the same three-part change again, and would re-break a promise already made in shipped UI copy).

### UX-06 / UX-09: Building placement in the orchard
- **D-06:** Buildings render **automatically** in fixed slots the instant the corresponding infrastructure is purchased in the Marketplace — no drag-and-drop, no player placement interaction (that would be new mechanics with no precedent anywhere in the game today).
- **D-07:** Fixed building slots sit on the parcel's **North / North-East border only** — not distributed around the full perimeter. Reason (user's own spec): all generated building sprites (Warehouse, Processing Plant, Social Facilities, Cold Storage) have a 3/4 perspective facing South-West (entrances, loading docks, stairs face down-left); placing slots on the N/NE edge makes those facades naturally face *into* the farm toward the paths and trees, and prevents tall building roofs from occluding the orchard.
- **D-08:** The correct seasonal sprite variant switches automatically with the global season phase (reuse the Marketplace's existing 4-season asset set, no new art).
- **D-09:** Z-index: buildings on the N/NE border row must render **below** tree canopies and paths that sit lower on the projected Y-axis, to preserve correct isometric depth ordering (same continuous-projected-Y approach already used for worker/machine depth, per `.planning/LESSONS.md` → Isometric).
- **D-10:** Clicking a placed building does **not** open a modal — it activates the unified bottom Action Dock (D-00's consolidated bottom panel), showing level, condition/wear, and upgrade options in place. This is what "definitively closes" UX-06/UX-09 per the user, without needing drag-and-drop on mobile.

### UX-08: Machine phase gating (Claude's discretion, not discussed — see below)

### Post-research additions (found during `09-RESEARCH.md`, confirmed with user 2026-09-18)
- **D-11:** `MainDashboard.tsx`'s dead "Market Auction" button (`onClick` is a bare `console.log('Go to Auction')`) and its "STEAM PRESSURE" `ImperialDial` (bound only to `useState(75)`, no real data) get fixed as part of UX-03's rewrite of this same component — wire the button to real auction navigation and the dial to a real metric (or remove it if no real equivalent exists). Folded in because UX-03 is already rewriting this exact component's stat idiom; fixing it separately later would mean touching the same file twice.
- **D-12:** `BidModal.tsx`'s three `EmeraldGauge` instances currently render hardcoded fake values (85/40/95) instead of real auction data — the same defect class as Phase 3's ECON-06. Added to Phase 9's scope (not deferred/tracked-only) since UX-03's stat-idiom migration already touches gauge-family components; wire them to real data as part of the same pass.
- **D-13:** Building-slot assignment for UX-06/UX-09 is a **fixed slot per building type** (Cold Storage always slot N, Warehouse always slot N+1, etc. — planner assigns the exact order), not purchase-order-dependent. Predictable for the player regardless of purchase sequence.

### Claude's Discretion
- **UX-04**: root cause already found via investigation (not a design question) — `frontend/src/components/farm/RunningCosts.tsx:16-22`'s loading skeleton never resolves because `useStability()`'s react-query call (`useFarm.ts:573-587`) is `enabled: !!backendActor && isAuthenticated` and never transitions out of "pending" when disabled (guest/demo mode). Fix: give the disabled-query case its own real empty/sign-in state (matching the pattern other guest-mode components already use) instead of leaving the loading skeleton showing forever. User explicitly deferred this to Claude's judgment as "mechanical."
- **UX-08**: map each of the four procedural machines (Modern Tractor, Precision Sprayer, Mechanical Shaker, Branch Pruner) to the `SeasonPhase` values during which it would plausibly operate (e.g., a harvester/shaker active during `#Harvest`, not `#Planning`/dormant phases), add a `currentPhase` check alongside the existing `getInfraLevel(...) > 0` ownership gate in `orchardAutomationConfig` (`App.tsx:171`). User explicitly deferred the exact phase-to-machine mapping to Claude's judgment as "mechanical," to be derived from each machine's real in-game function rather than asked as a taste question.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### User-supplied architecture reference (drives D-00/D-00b and informs D-02..D-10)
- `docs/game-design/Architektura w Przeglądarkowych Grach Symulacyjno-Ekonomicznych.md` — general browser-tycoon-game UI/UX architecture research the user added specifically for this phase. Sections used: §2 (Smart UI contextual overlays), §2-3 (central bottom-panel superiority over distributed layouts), §3 (CTA color hierarchy, dualism of hotkey+icon — not adopted this phase, no hotkey system exists), §4 (rendering performance: no UI texture downscaling, avoid semi-transparent panels forcing background re-render, frame-spreading for heavy menu evaluation). §1 and the multi-window portions of §2 are the explicitly rejected scope (D-00b).

### Phase 9 scoping history
- `docs/game-design/UX-AUDIT-2026-07-29.md` — the original live-Playground screenshot audit that scoped UX-01..05
- `.planning/sketches/001-orchard-isometric-trees/` — Geometric Brass source technique (already implemented for UX-06's tree rendering; not re-litigated here)
- `.planning/LESSONS.md` → "Isometric / Canvas work" — continuous-projected-Y depth rule (D-09 must follow this), ground-margin/Y-offset rule, occluder rule
- `docs/game-design/design-tokens.md` + `docs/game-design/ui/ui-design-system.md` — existing brass/copper/ruby/charcoal token system; new UX-02/03/06 elements should use these tokens, not add to the 1018-hardcoded-shade debt STATE.md already flags
- `docs/game-design/GDD-ONE-PAGER.md` Pillar 6 and `Mark_Vinicius_V1.md` §13 — the original "tactile diorama" / UI priorities lore promise UX-02 traces back to

### Economy formula (UX-05)
- `backend/game_logic.mo` — `calculateWholesalePrice` (D-05's edit site)
- `frontend/src/lib/gameLogic.ts` + `frontend/src/__tests__/economyParity.test.ts` — mirror + parity test, MUST update in the same commit per CLAUDE.md

### Project-level hard rules
- `CLAUDE.md` — mirror rule (UX-05), Isometric/Canvas LESSONS.md (D-09), dual-entrypoint Never rule (do not touch `backend/main_mainnet.mo` for the UX-05 formula change)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.god-ray-45` CSS class (`frontend/src/index.css:351-361`) — already-shipped, working god-ray effect currently used only in `MainDashboard.tsx:20`; D-01's starting point/reference even though the richer particle system comes from `GoldenHarvesterView.tsx`
- `frontend/src/components/farm/GoldenHarvesterView.tsx` — orphaned component holding the God Rays + `GoldenPollen` logic D-01 extracts, then deletes
- `orchardAutomationConfig` pattern (`App.tsx:171`) — the existing ownership-gating model for procedural machines; D-06's building auto-render and UX-08's phase-gating should follow this same shape
- `getInfraLevel(...)` — existing helper already used for machine ownership gating, reusable for building-slot rendering (D-06)

### Established Patterns
- `economyParity.test.ts` — the TS↔Motoko parity oracle; UX-05's formula change needs a new `describe` block here, following the existing 120+-case structure
- `.planning/LESSONS.md` → Isometric section — z-index via continuous projected Y (not tile buckets), ground-margin Y-offset compensation; both directly apply to D-09's building depth-ordering

### Integration Points
- `frontend/src/components/farm/ImperialOrchard.tsx` — receives D-01's lighting overlay, D-06/D-09's building slots and z-ordering, D-10's Action Dock click-through instead of a modal
- `frontend/src/components/farm/RunningCosts.tsx` + `frontend/src/hooks/useFarm.ts`'s `useStability()` — UX-04's fix site (Claude's discretion)
- `App.tsx:171` `orchardAutomationConfig` — UX-08's fix site (Claude's discretion)
- `frontend/src/components/farm/Marketplace.tsx:128-137` (`ProcessingFacility` card) — already states the correct "+15% wholesale price" copy; no frontend copy change needed for UX-05, only the backend/mirror formula

</code_context>

<specifics>
## Specific Ideas

- User's exact reasoning for D-07 (building slot placement): "Wszystkie wygenerowane assety... mają rzut 3/4 skierowany fasadą i drzwiami w stronę South-West... stałe sloty budowlane muszą znajdować się wyłącznie na północnej / północno-wschodniej krawędzi... Zapobiegnie to również zasłanianiu sadu przez wysokie dachy budynków." — preserve this rationale verbatim for whoever implements it, since it is not obvious from the sprites alone without checking their facing direction first.
- User's exact rejection reasoning for D-00b: "pełny system wielookienkowy w stylu OS (drag/pin/target) rozsadziłby Fazę 9 i popsuł kompatybilność z mobile/PWA (LEAD-03)."
- User's exact reasoning for D-04 rejecting a forced progress-bar-everywhere idiom (informing D-04's two-pattern split): "Wymuszenie paska postępu na wartościach otwartych (gotówka, prestiż) jest błędem UX — pasek wymaga zdefiniowanego 100% (pojemności), inaczej staje się sztuczną dekoracją."

</specifics>

<deferred>
## Deferred Ideas

- **Full OS-style multi-window dashboard system** (draggable panels, 3-depth z-index layering — default/last-highlighted/highlighted-on-hover — a pinning system for persistent panel positions, and a "target window" mechanism for Shift+click resource transfers between open panels) — from the user-supplied architecture document, §1-2. Explicitly deferred, not adopted now: it is a new interaction architecture (not a UX-02..09 refinement) and would conflict with mobile/PWA support (`LEAD-03`). Recorded by the user as a **possible v2, desktop-only** consideration — worth its own dedicated discuss-phase if ever picked up, starting from re-reading `docs/game-design/Architektura w Przeglądarkowych Grach Symulacyjno-Ekonomicznych.md` §1-2 in full.

### Reviewed Todos (not folded)
None — `todo.match-phase 9` returned zero matches.

</deferred>

---

*Phase: 9-ux-ui-deep-overhaul*
*Context gathered: 2026-09-18*
