# Phase 9: UX/UI Deep Overhaul - Research

**Researched:** 2026-09-18
**Domain:** React/TypeScript frontend UI overhaul (Canvas 2D isometric orchard, stat-display components, one backend economy formula), Motoko backend (one internal formula edit, no Candid change)
**Confidence:** HIGH for architecture/integration points (verified by reading the actual source), MEDIUM for the UX-08 phase-mapping recommendation (derived reasoning, not an authored spec), LOW/flagged for anything under "Assumptions Log" and "Open Questions"

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Global (D-00/D-00b):**
- D-00: (1) Smart UI — contextual overlays/panels instead of blind modals; (2) a single consistent bottom dock ("Action Dock") consolidating indicators and primary actions, replacing scattered panels; (3) consistent CTA color hierarchy across screens; (4) solid panel backgrounds (no expensive transparency forcing background re-render) and crisp, unscaled UI textures.
- D-00b (explicitly rejected): the full OS-style multi-window system (draggable panels, 3-depth z-layering, pinning, Shift+click "target window" transfers) from the same source document is **not** being built now — new interaction architecture, conflicts with mobile/PWA (`LEAD-03`). Deferred to a possible v2/desktop-only phase.

**UX-02 (orchard lighting):**
- D-01: Extract God Rays + `GoldenPollen` particle logic from `GoldenHarvesterView.tsx` (confirmed orphaned) into an overlay embedded directly inside `ImperialOrchard.tsx`; delete the dead component; correct `PROJECT.md`'s stale "shipped" claim.
- D-02: The light/pollen effect is **always visible** for every player. Golden Harvester ownership/level only increases intensity/particle density — never gates visibility.
- D-03: Performance — lightweight (canvas/CSS, no leaks), must reduce/disable particle count under low framerate or mobile viewports (D-00's rendering-performance principle). Reversible (pure rendering, no persisted state).

**UX-03 (stat-display idiom):**
- D-04: Two-pattern semantic grammar, not one universal pattern:
  - **Bar Meter** (label + value + `[|||||-----]`): bounded/percentage values only — machine health/wear, storage/cold-storage fill, season/phase-cycle progress.
  - **Metric Badge** (brass/gold icon + number + per-turn delta, no bar): open-ended values — cash, prestige.
  - **Circular gauges are eliminated entirely.**
  - User's own reasoning (verbatim, Polish): "Wymuszenie paska postępu na wartościach otwartych (gotówka, prestiż) jest błędem UX — pasek wymaga zdefiniowanego 100% (pojemności), inaczej staje się sztuczną dekoracją."

**UX-04 (sidebar placeholder boxes) — Claude's Discretion, not discussed as a design question:**
- Root cause per CONTEXT.md: `RunningCosts.tsx:16-22`'s loading skeleton, driven by `useStability()`'s `enabled: !!backendActor && isAuthenticated`. CONTEXT.md's stated diagnosis is that react-query "never resolves out of pending" in guest/demo mode. **This exact mechanism is corrected below in Common Pitfalls — the true mechanism is different, but the required fix (an explicit guest/sign-in state) is the same conclusion.**
- Directed fix: give the disabled-query case its own real empty/sign-in state, matching the pattern other guest-mode components already use.

**UX-05 (Processing Plant dead lever):**
- D-05: Implement the real **+15% wholesale-price bonus** the Marketplace card already promises, conditioned on owning `#ProcessingFacility`, in `calculateWholesalePrice` (`backend/game_logic.mo`). Mirror into the frontend and extend `economyParity.test.ts` in the same commit per CLAUDE.md's mirror rule. Reversibility: costly (formula + mirror + parity test change; reversing re-breaks a promise already shipped in UI copy).

**UX-06/UX-09 (building placement):**
- D-06: Buildings render **automatically** in fixed slots the instant the corresponding infrastructure is purchased — no drag-and-drop, no player placement.
- D-07: Fixed slots sit on the parcel's **North/North-East border only**. User's own reasoning (verbatim, Polish): "Wszystkie wygenerowane assety... mają rzut 3/4 skierowany fasadą i drzwiami w stronę South-West... stałe sloty budowlane muszą znajdować się wyłącznie na północnej / północno-wschodniej krawędzi... Zapobiegnie to również zasłanianiu sadu przez wysokie dachy budynków."
- D-08: Seasonal sprite variant switches automatically with the global season phase — reuse the Marketplace's existing 4-season asset set, no new art.
- D-09: Z-index — buildings on the N/NE border must render **below** tree canopies and paths that sit lower on the projected Y-axis (continuous-projected-Y rule, per LESSONS.md).
- D-10: Clicking a placed building does **not** open a modal — it activates the unified bottom Action Dock (D-00), showing level, condition/wear, and upgrade options in place.

**UX-08 (machine phase gating) — Claude's Discretion, not discussed as a design question:**
- Map each of the four machines (Modern Tractor, Precision Sprayer, Mechanical Shaker, Branch Pruner) to the `SeasonPhase` value(s) it would plausibly operate in, and add a `currentPhase` check alongside the existing `getInfraLevel(...) > 0` gate in `orchardAutomationConfig` (`App.tsx:171`). Derived from each machine's real in-game function, not a taste question.

### Claude's Discretion
- UX-04's exact empty/sign-in state implementation (see Common Pitfalls for the corrected root cause).
- UX-08's exact machine-to-phase mapping (see the recommended mapping table below, grounded in `backend/types.mo`/`game_logic.mo` doc-comments).

### Deferred Ideas (OUT OF SCOPE)
- **Full OS-style multi-window dashboard system** (draggable panels, 3-depth z-index layering, pinning, Shift+click "target window" resource transfers) — explicitly deferred, possible v2/desktop-only. Do not recommend this architecture for D-00's "Action Dock."
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UX-02 | Orchard lighting/atmosphere (God Rays/Golden Hour, always visible, Golden Harvester scales intensity) | Extraction site (`GoldenHarvesterView.tsx`), reusable `ParticleLayer` `GoldenPollen` preset, existing `.god-ray-45` CSS, integration point in `ImperialOrchard.tsx`, performance/mobile pattern (`useMediaQuery`) — see Architecture Patterns, Code Examples |
| UX-03 | One consistent stat-display idiom (Bar Meter / Metric Badge, zero circular gauges) | Full inventory of every current stat-display instance across the app, incl. the literal circular gauge (`ImperialDial`) and vertical-tube gauge (`EmeraldGauge`) the original audit's "Diagnostics panel" complaint refers to — see Don't Hand-Roll / Architecture Patterns |
| UX-04 | Fix the sidebar's never-resolving placeholder boxes | Corrected root-cause diagnosis (React Query v5 `isLoading` semantics, verified against installed package source) + the exact existing guest-mode pattern to copy (`SportsCenter.tsx`) — see Common Pitfalls |
| UX-05 | Real +15% wholesale bonus for `#ProcessingFacility` | Exact edit site in `game_logic.mo`, and the **corrected** mirror-site discovery: the real player-facing formula duplicate lives in `SellModal.tsx`, not `gameLogic.ts` — see Common Pitfalls, Code Examples |
| UX-06 (residual) / UX-09 | Place building sprites in fixed N/NE-border slots, seasonal, auto-switching, correct z-order, Action Dock on click | Reusable `BuildingSprite`/`buildingSpriteFolder` logic already in `Marketplace.tsx`, exact z-index formula from `ImperialOrchard.tsx`, `orchardAutomationConfig` pattern to extend — see Architecture Patterns |
| UX-08 (residual) | Add `currentPhase` gating to the four procedural machines | `SeasonPhase` enum (10 values) and each machine's real backend function, feeding a recommended (not authored) phase-mapping table — see Architecture Patterns |
</phase_requirements>

## Summary

This phase touches a codebase that is already substantially built — every one of the seven open requirements has a concrete, identifiable edit site, not a greenfield build. The research below corrects two claims that came into this phase already stated as fact and would have led planning astray if taken at face value: (1) UX-04's root cause is **not** "react-query never resolves out of pending" — verified against the installed `@tanstack/react-query@5.90.20` source, `isLoading` is actually `false` when a query is disabled, so `RunningCosts.tsx`'s skeleton is skipped, and the component instead silently renders a **misleading `0 PLN`** cost estimate forever in guest mode, not a stuck spinner. The fix (an explicit guest/sign-in branch) is unchanged, but the diagnosis and the reasoning behind it need correcting. (2) UX-05's "mirror the formula into `gameLogic.ts`" instruction cannot be executed literally — `gameLogic.ts` has no `calculateWholesalePrice` export at all. The real, player-facing duplicate of the wholesale formula is hand-inlined inside `SellModal.tsx`'s `pricingFactors` `useMemo`, and that is the actual second site that must change alongside the backend and the test-only transcription in `economyParity.test.ts`.

Beyond the seven ticketed items, this research surfaces one significant, previously-undocumented finding directly inside the component both UX-02/UX-03/UX-04 will all touch: `MainDashboard.tsx` (the bottom HUD panel below the orchard, already the app's de facto "Action Dock" location) contains a decorative "STEAM PRESSURE" `ImperialDial` bound to nothing but local `useState`, and a "Market Auction" button whose `onClick` is `console.log('Go to Auction')` — a dead control sitting front-and-center on the screen these plans will edit. This is flagged as an Open Question rather than folded into scope, since CONTEXT.md's D-00..D-10 do not mention it and CLAUDE.md requires flagging (not silently fixing) defects found while touching a file.

**Primary recommendation:** Treat this as seven narrow, surgical edits against a mature codebase — not a redesign. Each requirement below has one clear integration point; the risk is scope creep into `MainDashboard.tsx`'s dead controls and the broader 1018-hardcoded-Tailwind-shade design-token debt, neither of which is locked in CONTEXT.md.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Orchard lighting/atmosphere (UX-02) | Browser/Client (Canvas 2D + CSS, `ImperialOrchard.tsx`) | — | Pure rendering effect, no persisted state, no backend involvement (D-03 confirms reversibility) |
| Stat-display idiom (UX-03) | Browser/Client (React components) | — | Presentation-only; the underlying data (cash, wear, storage) already flows correctly from existing hooks |
| Sidebar guest-state fix (UX-04) | Browser/Client (`RunningCosts.tsx` + `useFarm.ts`'s `useStability`) | — | Client-side query state handling; no backend change |
| Wholesale price bonus (UX-05) | API/Backend (`backend/game_logic.mo`) | Browser/Client (`SellModal.tsx` mirror) | Backend owns the authoritative formula and player payout; frontend duplicates it only for a pre-sale preview |
| Building placement (UX-06/UX-09) | Browser/Client (`ImperialOrchard.tsx` render + `App.tsx` config) | — | Purely visual; ownership state is already fetched, no new backend method needed |
| Machine phase gating (UX-08) | Browser/Client (`App.tsx`'s `orchardAutomationConfig` + `ImperialOrchard.tsx` consumption) | — | `currentPhase` is already computed client-side in `App.tsx`; this is a pure boolean-gate composition, no new data source |

## Standard Stack

No new libraries are needed for this phase. Every requirement is implemented with what is already installed and already in use elsewhere in this codebase.

### Core (already installed, versions verified via `package.json`)
| Library | Version | Purpose | Why Standard (here) |
|---------|---------|---------|--------------|
| react | ^18.2.0 | UI framework | Already the whole app |
| framer-motion | ^12.35.2 | Animation (used by the God Rays/particle source component) | Already used by `GoldenHarvesterView.tsx`, `Marketplace.tsx` cards |
| lucide-react | ^0.309.0 | Icon system | Mandatory per `uiConventions.test.ts` (UX-10 ratchet) — never emoji, never a second icon vocabulary |
| @tanstack/react-query | ^5.90.20 | Data fetching / cache | Already used by `useStability`, `useCompetitors`, `useFarm` |
| tailwindcss | ^3.4.1 | Styling | Already the whole app; use `var(--brass-*)` tokens per `docs/game-design/design-tokens.md`, not new hardcoded hex |
| vitest | (existing, see `vitest.config.ts`) | Unit/component tests | `competitorsPanel.test.tsx` is the closest existing analog to the new tests this phase needs |

### Package Legitimacy Audit

**N/A — this phase introduces zero new npm/cargo/pip packages.** Every requirement is satisfied by composing existing in-repo modules (`ParticleLayer`, `BuildingSprite` logic in `Marketplace.tsx`, `getInfraLevel`, `useMediaQuery`, shadcn `Progress`/`Badge`). No `package-legitimacy check` run is applicable.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| God Rays + pollen particle overlay (UX-02) | A new particle system from scratch | `ParticleLayer` (`frontend/src/components/effects/ParticleLayer.tsx`)'s `GoldenPollen` preset, adapted from `fixed inset-0` (viewport) to a container-relative overlay inside `ImperialOrchard.tsx` | Already implements rAF-driven canvas particles with an `intensity` prop (0.0–1.0) that directly satisfies D-02's "Golden Harvester increases intensity" requirement — no new particle math needed, only a resize-target change |
| Building sprite path resolution + seasonal/level tier switching (UX-06/UX-09) | A second sprite-lookup implementation inside `ImperialOrchard.tsx` | Extract `BuildingSprite`, `buildingSpriteFolder()`, `seasonKeyFromBackend()`, `BUILDING_SPRITE_SEASONS`, `LEVELED_BUILDING_FOLDERS`, `SINGLE_TIER_BUILDING_FOLDERS` from `Marketplace.tsx` (currently module-local, not exported) into a shared module (e.g. `frontend/src/lib/buildingSprites.ts`) and import from both `Marketplace.tsx` and `ImperialOrchard.tsx` | This logic already exists, is already correct (folder-per-tier, season-key fallback to `'spring'`), and is already proven in production (Marketplace cards). Duplicating it risks the two call sites drifting on level-tier thresholds |
| Isometric depth ordering for buildings (D-09) | A new z-index scheme | The existing continuous-projected-Y formula already used for every other entity: `zIndex: s * 100000 + Math.round(y * 10) + typeOffset` (`ImperialOrchard.tsx:1202/1214/1309/1346`) | This is the exact rule LESSONS.md's "Isometric / Canvas work" section documents as hard-won (three live-deploy bugs). A building slot is static (fixed row/col on the border), so it needs the same formula with a `typeOffset` placed **below** the tree offset (`+2`) — e.g. `+1` or `0` — so ties resolve buildings-under-trees |
| Bounded-value stat display (UX-03 Bar Meter) | A new progress-bar component | shadcn `Progress` (`frontend/src/components/ui/progress.tsx`), already used correctly for bounded values in `ParcelDetailsPanel.tsx` (fertility, water) and `CompetitorsPanel.tsx` (capacity share) | Two components already use `Progress` exactly the way D-04 describes it — these are the reference implementation, not new UI |
| Machine ownership+phase gating (UX-08) | A separate gating mechanism from the existing one | Extend `orchardAutomationConfig` (`App.tsx:171`) with an `&&` on `currentPhase` — `currentPhase` is already computed at `App.tsx:185` | The whole point of D-06's/UX-08's design intent is "follow the existing shape"; `orchardAutomationConfig` is already the single source of truth for machine visibility |

**Key insight:** Every "Don't Hand-Roll" item in this phase is not a generic library recommendation — it is a specific sibling component in this same codebase that already solved the identical problem correctly. The main planning risk is not choosing the wrong library; it's re-deriving logic that already exists two files away.

## Architecture Patterns

### System Architecture Diagram (data flow relevant to this phase)

```
┌─────────────────────────────────────────────────────────────────────┐
│ App.tsx                                                              │
│  - farm (useFarm/useGuestFarm)                                       │
│  - getInfraLevel(type) -> orchardAutomationConfig (machines, UX-08)  │
│  - NEW: orchardBuildingsConfig (buildings, UX-06/09) — same shape    │
│  - currentPhase (string, already derived)                            │
└───────────────┬────────────────────────────┬─────────────────────────┘
                │ props                       │ props
                ▼                             ▼
┌───────────────────────────────┐   ┌───────────────────────────────────┐
│ ImperialOrchard.tsx            │   │ Sidebar.tsx -> RunningCosts.tsx    │
│  - static entities (soil/tree/  │   │  - useStability() (react-query)    │
│    perimeter/bridge)            │   │  - UX-04: guest branch BEFORE      │
│  - NEW: building entities       │   │    isLoading branch (see Common    │
│    (UX-06/09), zIndex per       │   │    Pitfalls)                       │
│    continuous-Y formula         │   └───────────────────────────────────┘
│  - dynamic entities (NPC/       │
│    machines), gated by          │   ┌───────────────────────────────────┐
│    automationConfig (UX-08:     │   │ MainDashboard.tsx (bottom HUD)     │
│    add &&currentPhase check)    │   │  - "Diagnostics" panel: THIS is    │
│  - NEW: always-on lighting      │   │    the audit's "circular gauge +   │
│    overlay (UX-02), extracted   │   │    bar meters + text blocks" site  │
│    from GoldenHarvesterView.tsx │   │    (UX-03) — see Common Pitfalls   │
│  - onClick building -> Action   │   └───────────────────────────────────┘
│    Dock (D-10), not a modal     │
└───────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ Backend: backend/game_logic.mo                                    │
│  calculateWholesalePrice(basePrice, qty, quality, satMult,        │
│    seasonMult, [NEW] hasProcessingFacility) -> +15% bonus term    │
│              │                                                     │
│              │ (internal Motoko call, main.mo:1395 — NOT Candid)  │
│              ▼                                                     │
│ Frontend duplicate (NOT gameLogic.ts — see Common Pitfalls):       │
│  SellModal.tsx's `pricingFactors` useMemo (lines ~96-105)          │
│  — inline formula transcription the player actually sees          │
└───────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure (new/changed files only)

```
frontend/src/
├── components/farm/
│   ├── ImperialOrchard.tsx      # UX-02 overlay, UX-06/09 building entities+zIndex, UX-08 phase gate consumption
│   ├── RunningCosts.tsx          # UX-04 fix site
│   ├── MainDashboard.tsx         # UX-03 fix site (the audit's actual "Diagnostics panel")
│   ├── modals/SellModal.tsx      # UX-05 real mirror site (NOT gameLogic.ts)
│   └── GoldenHarvesterView.tsx   # DELETE after UX-02 extraction (D-01)
├── lib/
│   ├── buildingSprites.ts        # NEW — extracted from Marketplace.tsx (Don't Hand-Roll)
│   └── gameLogic.ts              # no wholesale-price function exists here today — do not assume one to edit
├── App.tsx                       # orchardAutomationConfig UX-08 gate, NEW orchardBuildingsConfig
└── __tests__/
    ├── uiConventions.test.ts     # extend with a UX-03 ratchet (no circular-gauge component used as a stat display)
    ├── economyParity.test.ts     # extend refWholesalePrice + a new describe block for UX-05
    └── runningCosts.test.tsx     # NEW — guest-mode empty state (pattern: competitorsPanel.test.tsx)

backend/
└── game_logic.mo                 # calculateWholesalePrice — add hasProcessingFacility param (internal only, not Candid)
```

### Pattern 1: Continuous-projected-Y z-index (D-09's exact mechanism)
**What:** Every isometric entity's stacking order is `s * 100000 + Math.round(y * 10) + typeOffset`, where `s` is the sector index, `y` is the entity's continuous projected Y from `projectToIso()`, and `typeOffset` disambiguates ties at the same `y` (soil=0, tree=+2, machine=+4, worker=+5).
**When to use:** Any new entity placed in the orchard's isometric grid — here, building slots.
**Example:**
```typescript
// Source: frontend/src/components/farm/ImperialOrchard.tsx:1202-1214 (existing pattern)
entities.push({
    type: 'tree',
    // ...
    zIndex: s * 100000 + Math.round(y * 10) + 2   // typeOffset = 2
});
// A building slot on the N/NE border, per D-09, needs an offset BELOW the
// tree's +2 so that at comparable y, a building renders under a tree canopy:
entities.push({
    type: 'building',
    x, y,  // from projectToIso() at the fixed border row/col
    zIndex: s * 100000 + Math.round(y * 10) + 1   // recommend: below tree(+2), above soil(0)
});
```
**North placement naturally resolves D-09's "below trees/paths" requirement**: north tiles project to a smaller `y` than tiles further south (interior/path tiles), so painter's-algorithm ordering already draws them first (underneath) — the `typeOffset` only needs to break ties at genuinely equal `y`, not carry the whole "render below" requirement by itself.

### Pattern 2: Guest-mode empty state (the actual, working pattern — for UX-04)
**What:** Check `!backendActor` (or `!isAuthenticated`) **before** checking the query's loading state, so a disabled query never has to fake a loading or data state.
**When to use:** Any component reading a `useQuery` that is `enabled: !!backendActor && isAuthenticated`.
**Example:**
```typescript
// Source: frontend/src/components/sports/SportsCenter.tsx:140-153 (existing, working pattern)
{!backendActor ? (
    // Guest mode has no actor, so the query never runs. An empty grid
    // would read as "there are no clubs", which is false.
    <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-sm">
        Sign in to see the clubs in your region.
    </div>
) : isLoading ? (
    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
) : isError ? (
    <div>Could not load...</div>
) : (
    /* real data */
)}
```
**Applied to `RunningCosts.tsx`** (current buggy code checks only `isLoading`, which is `false` when disabled per React Query v5 — see Common Pitfalls): add the `!backendActor`/`!isAuthenticated` branch first, keep the existing `isLoading` skeleton for the genuinely-fetching case, then the real content.

### Pattern 3: Existing Bar Meter / Metric Badge instances (D-04's two-pattern grammar — already partially in use)
**What:** D-04 is not introducing new visual vocabulary from zero — two existing usages already match it correctly:
- **Bar Meter (bounded value) — reference implementation:** `ParcelDetailsPanel.tsx` (fertility %, water %) and `CompetitorsPanel.tsx` (capacity share vs. max) both use shadcn `Progress`.
- **Metric Badge (open-ended value) — closest existing pattern:** `MainDashboard.tsx`'s left "Diagnostics" text blocks (Phase, Treasury) are plain text, not yet a proper badge component — this is the gap UX-03 needs to close, not a reference to copy verbatim.
**What must be removed, not migrated:** `ImperialDial` (a literal circular SVG-ticked dial, `frontend/src/components/ui/ImperialDial.tsx:159-164`) used as a **decorative, disconnected** "STEAM PRESSURE" readout in `MainDashboard.tsx`'s center column, and `EmeraldGauge` (a vertical liquid-tube gauge, not circular but also not the Bar Meter/Metric Badge shape) used for "Reserves"/"Organic" in the same component and for fake hardcoded 85/40/95 values in `BidModal.tsx`.
**Important scoping distinction:** `ImperialDial` is ALSO used legitimately as an **input control** (the bid-price setter in `BidModal.tsx` and the same "STEAM PRESSURE" instance in `MainDashboard.tsx`) — D-04's "circular gauges are eliminated" is about **passive stat/diagnostic displays**, per the original audit's literal wording ("the bottom Diagnostics panel mixes... a circular gauge, vertical bar meters, and plain text stat blocks"). Do not remove `ImperialDial` from `BidModal.tsx`'s legitimate bid-price-setting use — only its use as a decorative "gauge" display is in scope.

### Pattern 4: Machine ownership + phase gating composition (UX-08)
**What:** `orchardAutomationConfig` in `App.tsx:171` currently gates on ownership only (`getInfraLevel(type) > 0`). Extend with an `&&` against `currentPhase` (already computed at `App.tsx:185`).
**Recommended machine→phase mapping** (derived from each machine's documented real function in `backend/types.mo:95-100` and `backend/game_logic.mo:64-66/372-374/448-451` — this is Claude's-discretion reasoning per CONTEXT.md, not an authored spec; flag for a quick sanity nod before locking):

| Machine (Marketplace id) | Real backend function (cited) | Recommended active `SeasonPhase`(s) | Reasoning |
|---|---|---|---|
| `Shaker` (Mechanical Shaker) | "mechanical harvesting" (`types.mo:97`); labor -30%/level at harvest (`game_logic.mo:373`) | `#Harvest` only | Its entire function is harvesting; visible any other time is exactly the reported bug ("drives around in Winter") |
| `Pruner` (Branch Pruner) | "automated branch-trimming" (`types.mo:100`); quality+labor bonus (`game_logic.mo:374/451`) | `#CutAndPrune` only | The phase's own doc-comment is literally "Maintain quality, tree pruning (Winter)" (`types.mo:266`) — direct name match |
| `Sprayer` (Precision Sprayer) | "lower disease risk, higher quality" (`types.mo:98`); +5.0×level to quality score (`game_logic.mo:448`) | `#Growth` | `#Growth`'s doc-comment is "Water, fertilize, weather events (Summer)" (`types.mo:262`) — disease/pest risk mitigation happens during active growth, not at the `#Procurement` (buying) phase |
| `Tractor` (Modern Tractor) | "reduces labor dependency" (`types.mo:95`); -15%/level labor efficiency (`game_logic.mo:372`) | `#Investment`, `#Growth` | Broadest-function machine (general field work); `#Investment`'s doc-comment includes "Plant trees" (site prep) and `#Growth` covers ongoing cultivation — the two phases where general field labor happens |

**Example:**
```typescript
// Source: frontend/src/App.tsx:171-176 (existing shape to extend)
const orchardAutomationConfig = {
    hasHarvesters: getInfraLevel('Shaker') > 0 && currentPhase === 'Harvest',
    hasTractor: getInfraLevel('Tractor') > 0 && (currentPhase === 'Investment' || currentPhase === 'Growth'),
    hasSprayer: getInfraLevel('Sprayer') > 0 && currentPhase === 'Growth',
    hasPruner: getInfraLevel('Pruner') > 0 && currentPhase === 'CutAndPrune',
};
```
Note `currentPhase` here is the frontend's string-keyed representation (`Object.keys(phase)[0]`), already computed — compare against the same string literals `phaseConstants.ts`/`PHASE_LABELS` use elsewhere in this codebase for consistency (do not invent a new phase-name spelling).

## Common Pitfalls

### Pitfall 1: React Query v5's `isLoading` is `false`, not perpetually `true`, on a disabled query (corrects the CONTEXT.md-stated root cause for UX-04)
**What goes wrong:** CONTEXT.md's investigation note states `useStability()`'s disabled query "never resolves out of pending... so the skeleton shows forever." This is not what actually happens with the installed version.
**Why it happens:** Verified directly against the installed package: `@tanstack/react-query@5.90.20`, `node_modules/@tanstack/query-core/build/modern/queryObserver.js:307-310` computes `isFetching = fetchStatus === "fetching"`, `isPending = status === "pending"`, and **`isLoading = isPending && isFetching`**. When a query is `enabled: false`, `fetchStatus` stays `"idle"` — `isFetching` is `false` — so `isLoading` is **`false`**, regardless of `isPending`. `RunningCosts.tsx:16` checks only `isLoading`, so in guest mode the skeleton branch is **skipped entirely**; the component falls through to `totalEst = 0`, `isRisky = false` and renders a static, misleadingly-confident "0 PLN — Est. Survival Budget" forever, not a stuck spinner.
**How to avoid:** Add an explicit `!backendActor` (or `!isAuthenticated`) branch **before** the `isLoading` check, per Pattern 2 above (`SportsCenter.tsx`'s existing, correct pattern). Do not rely on `isLoading` to distinguish "disabled" from "actively fetching" — use `isPending` only if you need that distinction, or better, check auth state directly since it is already the actual gating condition.
**Warning signs:** Any component destructuring only `isLoading` from a `useQuery` with an `enabled: false` branch reachable in guest/demo mode is at risk of this same silent-fallthrough bug — worth a quick grep (`useStability`, `useCompetitors`, `useLeaderboard`, etc. in `useFarm.ts` all share this `enabled` pattern) if time allows, though only `RunningCosts.tsx` is in this phase's locked scope.
**Verification note:** Per this project's own LESSONS.md ("A jsdom component test cannot see a click bubble into a sibling handler"), confirm the fix by actually loading the app in guest mode in a real browser, not just a mocked `useQuery` unit test — the mechanism above was derived from reading library source, not from an integration reproduction.

### Pitfall 2: The wholesale-price "mirror" does not live where CLAUDE.md's Task Router literally says (corrects an assumption for UX-05)
**What goes wrong:** CLAUDE.md's mirror rule directs edits to `frontend/src/lib/gameLogic.ts`. For `calculateWholesalePrice`, there is **no such export to edit** — verified by grepping every `export const`/`export function` in `gameLogic.ts` (30 exports, none named `calculateWholesalePrice` or similar).
**Why it happens:** The actual player-facing preview of the wholesale sale price is a **separate, hand-inlined transcription** inside `SellModal.tsx`'s `pricingFactors` `useMemo` (lines ~96-105: `wholesaleMultiplier = 0.7; ... finalUnitPrice = basePrice * wholesaleMultiplier * volumePenalty * qualityBonus * marketMult * seasonMod;`). This is a second, independent copy of the same formula, already diverged from `gameLogic.ts`'s pattern (it lives in a component, not a lib module). `economyParity.test.ts`'s `refWholesalePrice` (lines 706-717) is a **third**, test-only transcription that exercises neither `gameLogic.ts` nor `SellModal.tsx` directly — it only proves the season multiplier term algebraically.
**How to avoid:** UX-05 must update all three:
1. `backend/game_logic.mo`'s `calculateWholesalePrice` — add the ProcessingFacility bonus term (internal Motoko change; `main.mo:1395` is the sole call site — confirmed by grep — so this is **not** a Candid/public-interface change and does not require the "Ask First" Candid process).
2. `frontend/src/components/farm/modals/SellModal.tsx`'s inline `pricingFactors` calculation — add the same `+15%` conditional term, sourced from `farm.infrastructure` (already in scope in that component via `useFarm()`).
3. `frontend/src/__tests__/economyParity.test.ts`'s `refWholesalePrice` helper — add the new parameter and new test cases, following the exact `describe('economy parity: season sale price (ECON-02)', ...)` block structure already present as a template.
**Warning signs:** If a plan only touches `game_logic.mo` and `economyParity.test.ts`, the Sell modal's own price preview will silently under-quote the real payout by 15% for `#ProcessingFacility` owners — reintroducing exactly the class of bug the mirror rule exists to prevent, inside the same phase that is supposed to fix a "dead lever" complaint.

### Pitfall 3: `ImperialOrchard.tsx`'s existing entity-tick loops are `setInterval`-based, not `requestAnimationFrame`-based
**What goes wrong:** Assuming the orchard has a central rAF loop to hook a new lighting overlay or FPS-based particle throttle (D-03) into.
**Why it happens:** Worker/machine position updates use `setInterval(..., 30)` (`ImperialOrchard.tsx:1151`) and phase-transition animations use `setInterval(..., 50)`/`setInterval(..., 80)` (lines 721, 795) — there is no existing rAF-driven render loop in this component to piggyback FPS sampling on. `ParticleLayer.tsx` (the UX-02 source component) does use its own internal rAF loop (`requestAnimationFrame(render)`), but it is currently sized to the full viewport (`window.innerWidth/innerHeight`, `fixed inset-0`), not the orchard's own container.
**How to avoid:** When embedding `ParticleLayer`'s `GoldenPollen` preset into `ImperialOrchard.tsx` (D-01), it must be adapted to (a) size itself to the orchard container rather than the viewport, and (b) implement its own lightweight FPS sample (e.g., a rolling average of `performance.now()` deltas inside its own rAF loop) for D-03's "reduce under low framerate" requirement — there is no shared FPS utility to reuse. For the mobile-viewport half of D-03, reuse the existing `useMediaQuery` hook (`frontend/src/hooks/useMediaQuery.ts`), already used by `Sidebar.tsx`.
**Warning signs:** A lighting overlay implementation that keeps `ParticleLayer`'s `fixed inset-0` positioning unmodified will render on top of the entire app (sidebar, modals, HUD), not just the orchard — visually wrong and a D-00 "solid panel background" violation.

## Runtime State Inventory

Not applicable — this is a UI/rendering + one internal formula phase, not a rename/refactor/migration. No stored data, live service config, OS-registered state, secrets, or build artifacts carry any of the strings or identifiers this phase touches.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The UX-08 machine→phase mapping (Shaker=Harvest, Pruner=CutAndPrune, Sprayer=Growth, Tractor=Investment+Growth) is the *plausible* mapping derived from each machine's documented backend function, not an authored game-design spec | Architecture Patterns, Pattern 4 | If the user has a different mental model of when each machine should visually operate, the mapping needs a one-line confirmation before implementation — low cost to change since it's a pure boolean condition |
| A2 | A building-slot `typeOffset` of `+1` (between soil's `0` and tree's `+2`) correctly satisfies D-09's "below trees and paths" requirement at tie-breaking `y` values | Architecture Patterns, Pattern 1 | Low risk — the continuous-Y formula does the heavy lifting; the exact offset constant is a one-line tune-able if a screenshot shows a building visually clipping through a tree at the same row |
| A3 | `MainDashboard.tsx`'s decorative "STEAM PRESSURE" `ImperialDial` and dead "Market Auction" button are pre-existing defects, not something CONTEXT.md's D-00..D-10 already implicitly resolves by removing `ImperialDial`/`EmeraldGauge` from that component | Common Pitfalls / Open Questions | If left unaddressed, the migrated "Diagnostics" panel could still contain a dead button in the exact component the audit already flagged as the prototypical UX-03 violation — worth a quick Ask-First confirmation, per CLAUDE.md's "never paper over a known defect you happen to touch" |

## Open Questions

1. **`MainDashboard.tsx`'s dead "Market Auction" button and decorative "STEAM PRESSURE" dial**
   - What we know: `MainDashboard.tsx` (the bottom HUD, rendered live at `App.tsx:822`) is the exact component the original 2026-07-29 audit calls out for mixing "a circular gauge [`ImperialDial`], vertical bar meters [`EmeraldGauge`], and plain text stat blocks [Phase/Treasury]" — i.e., it IS the audit's literal "Diagnostics panel," and UX-03's D-04 grammar will necessarily touch it. Separately, the "STEAM PRESSURE" `ImperialDial` instance there is bound only to local `useState(75)` (no real farm data) and its neighboring "Market Auction" button's `onClick` is `console.log('Go to Auction')` — both fully decorative/dead.
   - What's unclear: CONTEXT.md's D-00..D-10 never mention these two specific defects. It's ambiguous whether fixing them is in scope for UX-03 (since the whole panel is being migrated to the Bar Meter/Metric Badge grammar anyway, which naturally removes `ImperialDial`/`EmeraldGauge` from this location) or whether the dead button should be wired to something real, left as a known gap, or removed entirely.
   - Recommendation: Flag explicitly to the user before locking the plan (CLAUDE.md: "never paper over a known defect you happen to touch... flag it, and add it to REQUIREMENTS.md if it is not there"). The cheapest correct move is likely: migrating the panel to Bar Meter/Metric Badge naturally removes the dead dial/button as a side effect of D-04's grammar replacing the whole panel — but this should be a stated decision in the plan, not a silent byproduct.

2. **`EmeraldGauge`'s continued use outside `MainDashboard.tsx`**
   - What we know: `EmeraldGauge` (vertical liquid-tube meter, not literally circular) is also used in `BidModal.tsx` for three **hardcoded fake values** (`value={85}` "Harvest", `value={40}` "Storage", `value={95}` "Morale" — none backed by real data, confirmed by reading the literal JSX).
   - What's unclear: `BidModal.tsx` is not named in any UX-0X requirement or in CONTEXT.md. It is unclear whether Phase 9's stat-idiom migration should touch it (same defect class — a non-Bar-Meter gauge showing fabricated numbers) or whether that's explicitly out of scope since only the Diagnostics panel was named in the audit.
   - Recommendation: Out of scope unless the user extends it — flag for a future backlog item (or REQUIREMENTS.md addition) rather than silently expanding UX-03's blast radius mid-plan.

3. **Exact building-slot layout on the N/NE border (how many slots, fixed order)**
   - What we know: D-07 fixes the border edge (North/North-East). There are exactly 4 building-type infrastructure items with sprites (`Warehouse`, `ColdStorage`, `ProcessingFacility`, `SocialFacilities` — confirmed via `Marketplace.tsx`'s `BuildingSpriteType` union and the `frontend/public/assets/buildings/` directory listing: 6 folders, since Warehouse and ColdStorage each have 2 level-tier folders sharing one slot).
   - What's unclear: CONTEXT.md does not specify slot ordering (e.g., does Warehouse always occupy the same visual position regardless of purchase order, or first-come-first-slotted?) or what happens visually if a player owns 0, 1, or all 4 — do empty slots render nothing, or a "vacant lot" placeholder?
   - Recommendation: Assign each of the 4 building types one fixed, type-keyed slot position along the N/NE edge (not purchase-order-dependent) — consistent with D-06's "automatic, no player interaction" principle and simplest to test deterministically. Render nothing for unowned types (matches the existing `automationConfig?.hasX` pattern of "nothing appears unless a caller opts in").

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth flow touched this phase |
| V3 Session Management | No | Not touched |
| V4 Access Control | No | No new canister method, no permission change |
| V5 Input Validation | Marginal — yes | The new `calculateWholesalePrice` parameter (`hasProcessingFacility: Bool`, or equivalent) is derived server-side from `farm.infrastructure` at the call site in `main.mo` — **never accept this as a caller-supplied argument**, exactly the class of bug `ECON-09` (a caller-controlled `volumeKg` that should have been server-derived) already documents in this codebase. Compute ownership inside `main.mo` from the authenticated caller's own farm record, as every other infrastructure-modifier call already does (`getInfrastructureModifier(farm.infrastructure)` pattern) |
| V6 Cryptography | No | Not touched |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Caller-supplied boolean/flag bypassing server-derived ownership state (the `ECON-09` class of bug) | Tampering | Derive `hasProcessingFacility` from `farm.infrastructure` inside `main.mo` before calling `GameLogic.calculateWholesalePrice` — never add a new public-facing parameter that a caller could set independently of their actual owned infrastructure |

No other STRIDE-relevant surface is introduced — this phase adds no new canister methods, no new stable-state fields, and no new external inputs. The building-placement and machine-gating work is entirely derived from data the client already receives (`farm.infrastructure`, `farm.currentPhase`).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (existing config: `frontend/vitest.config.ts`, setup: `frontend/vitest.setup.ts`) + Playwright for e2e (`frontend/playwright.config.ts`) |
| Config file | `frontend/vitest.config.ts` |
| Quick run command | `npx vitest run src/__tests__/<file>.test.tsx` |
| Full suite command | `npm test` (frontend) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UX-02 | God rays/pollen overlay always renders, intensity scales with Golden Harvester level | unit (render assertion on the overlay's presence/intensity prop) | `npx vitest run src/__tests__/imperialOrchardLighting.test.tsx` | ❌ Wave 0 |
| UX-03 | No circular-gauge component (`ImperialDial` outside `BidModal.tsx`'s legitimate input use) appears as a passive stat display; `Progress`/badge grammar used consistently | unit (static-analysis ratchet, same style as `uiConventions.test.ts`) | `npx vitest run src/__tests__/uiConventions.test.ts` | ✅ existing file, extend it |
| UX-04 | Guest mode shows an explicit sign-in state, never the skeleton forever nor a fabricated `0 PLN` | unit (component, mocked `useAuth`/`useStability`, pattern per `competitorsPanel.test.tsx`) | `npx vitest run src/__tests__/runningCosts.test.tsx` | ❌ Wave 0 |
| UX-05 | `#ProcessingFacility` ownership yields exactly +15% wholesale price, order-independent, both in the backend formula and the Sell modal preview | unit (economy parity, same structure as the `ECON-02` describe block) | `npx vitest run src/__tests__/economyParity.test.ts` | ✅ existing file, extend it |
| UX-05 | Live-replica verification: an owned Processing Plant actually changes `sellCherries` wholesale payout by 15% | manual/live-replica (per CLAUDE.md: "Verify backend behaviour on a live replica, not by compiling") | `dfx deploy backend` + manual `sellCherries` call, values recorded in commit message | N/A — manual |
| UX-06/UX-09 | Building appears in the correct N/NE slot the instant infrastructure is purchased, correct season sprite, correct z-order relative to trees, click opens Action Dock not a modal | e2e (Playwright, harness pattern per `e2e/orchard.spec.ts`) | `npm run test:e2e` | ❌ Wave 0 — new spec needed in `e2e/orchard.spec.ts` |
| UX-08 | Owned machine only animates/renders during its mapped `SeasonPhase`(s) | unit (config composition test on `orchardAutomationConfig`'s resulting booleans across phase values) | new test file, e.g. `src/__tests__/orchardAutomationConfig.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run <changed test file>` (frontend), `./validate.sh backend` when `game_logic.mo` changes
- **Per wave merge:** `npm test` + `npm run lint` + `npm run typecheck` (i.e., `./validate.sh fast`); `./validate.sh full` before any commit that touches `.tsx` rendering, per CLAUDE.md
- **Phase gate:** `./validate.sh full` green, plus a live-replica check for UX-05's backend formula (per CLAUDE.md, compiling is not proof)

### Wave 0 Gaps
- [ ] `src/__tests__/imperialOrchardLighting.test.tsx` — covers UX-02 (overlay presence, intensity scaling, mobile/low-fps reduction)
- [ ] `src/__tests__/runningCosts.test.tsx` — covers UX-04 (guest/sign-in/loading/error/data branches), following `competitorsPanel.test.tsx`'s `createAuthWrapper` pattern
- [ ] `src/__tests__/orchardAutomationConfig.test.ts` — covers UX-08 (machine × phase truth table)
- [ ] `e2e/orchard.spec.ts` additions — covers UX-06/UX-09 (building slot rendering, seasonal swap, z-order, click-to-Action-Dock)
- [ ] Extend `src/__tests__/uiConventions.test.ts` — covers UX-03 (grammar ratchet)
- [ ] Extend `src/__tests__/economyParity.test.ts` — covers UX-05 (formula parity)

*Framework install: none needed — Vitest/Playwright are already configured and passing (`QUAL-01`/`QUAL-03` in REQUIREMENTS.md).*

## Sources

### Primary (HIGH confidence — verified directly against this repo's source/installed packages)
- `frontend/src/components/farm/ImperialOrchard.tsx` — full z-index/entity/automation-config read (1762 lines, relevant sections read directly)
- `frontend/src/components/farm/GoldenHarvesterView.tsx`, `frontend/src/components/effects/ParticleLayer.tsx` — full read, confirmed orphaned/reusable respectively
- `frontend/src/components/farm/RunningCosts.tsx`, `frontend/src/hooks/useFarm.ts` (`useStability`) — full read
- `frontend/src/components/sports/SportsCenter.tsx`, `frontend/src/components/social/CompetitorsPanel.tsx` — full read (guest-state + Progress patterns)
- `frontend/src/components/farm/MainDashboard.tsx`, `frontend/src/components/ui/EmeraldGauge.tsx`, `frontend/src/components/ui/ImperialDial.tsx` — full read (the audit's actual "Diagnostics panel")
- `frontend/src/components/farm/Marketplace.tsx` — building sprite logic, machine thumbnail logic, full read of relevant sections
- `frontend/src/components/farm/modals/SellModal.tsx` — full read (the real wholesale-price mirror site)
- `backend/game_logic.mo`, `backend/types.mo`, `backend/main.mo` (relevant sections) — `calculateWholesalePrice`, `getInfrastructureModifier`, `SeasonPhase`, `InfrastructureType`, call site verification
- `frontend/src/__tests__/economyParity.test.ts`, `frontend/src/__tests__/uiConventions.test.ts`, `frontend/src/__tests__/competitorsPanel.test.tsx` — full/partial read for test conventions
- `node_modules/@tanstack/query-core/build/modern/queryObserver.js:307-310` — direct source verification of `isLoading = isPending && isFetching`, `@tanstack/react-query@5.90.20` per `package.json`
- `docs/game-design/design-tokens.md`, `docs/game-design/ui/ui-design-system.md` — read in full (note: the latter's "Atomic Components Spec" names `ImperialDial`/`EmeraldGauge` as canon patterns, which the planner should reconcile against D-04's "circular gauges eliminated" — see Pattern 3's scoping distinction)
- `.planning/LESSONS.md` → "Isometric / Canvas work" section — read in full, source for the continuous-projected-Y rule and three cited live-deploy bugs
- `.planning/phases/09-ux-ui-deep-overhaul/09-01-PLAN.md` — read in full (prior, already-executed plan for UX-06's canopy work — confirms what is and isn't already done)

### Secondary (MEDIUM confidence)
- [WebSearch, cross-checked against installed source] "TanStack Query v5 isLoading isPending enabled false behavior" — confirmed the `isLoading = isPending && isFetching` derivation via TanStack's own migration docs and GitHub discussions, then verified directly against this repo's installed `node_modules` source (promoted to Primary/HIGH via that verification)

### Tertiary (LOW confidence — flagged in Assumptions Log)
- The UX-08 machine→phase mapping table (Assumption A1) — grounded in real backend doc-comments but is Claude's own inference about "plausible operation windows," not a cited game-design document

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies, every pattern cited to an existing, working sibling component in this repo
- Architecture: HIGH — every integration point (z-index formula, guest-state pattern, sprite-resolution logic, automation-config shape) verified by reading the actual source, not inferred
- Pitfalls: HIGH for the two corrected claims (both verified against installed package source / grep of the actual codebase) — MEDIUM for the UX-08 mapping (reasoned, not authored)

**Research date:** 2026-09-18
**Valid until:** 30 days (stable, mature codebase area; no fast-moving external dependency risk since no new packages are introduced)
