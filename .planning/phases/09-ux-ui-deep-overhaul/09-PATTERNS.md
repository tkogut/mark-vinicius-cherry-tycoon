# Phase 9: UX/UI Deep Overhaul - Pattern Map

**Mapped:** 2026-09-18
**Files analyzed:** 18 (create/modify) + 5 test files
**Analogs found:** 17 / 18

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `frontend/src/components/farm/ImperialOrchard.tsx` | component (canvas/isometric render) | transform (entity list -> zIndex-ordered DOM) | itself (existing z-index/entity pattern, extend in place) | exact |
| `frontend/src/components/effects/ParticleLayer.tsx` | component (canvas effect) | streaming (rAF loop) | itself (adapt viewport-sizing to container-sizing) | exact |
| `frontend/src/components/farm/GoldenHarvesterView.tsx` | component | — | delete after extracting into ImperialOrchard.tsx | n/a (deletion) |
| `frontend/src/components/farm/MainDashboard.tsx` | component (HUD/dock) | request-response (reads farm state, dispatches actions) | itself (rewrite in place); guest-pattern from `SportsCenter.tsx` | role-match |
| `frontend/src/components/ui/badge.tsx` | component (UI primitive) | transform (props -> className) | itself, extend `cva` variants | exact |
| `frontend/src/components/ui/progress.tsx` | component (UI primitive) | transform | itself (reused as-is, no changes) | exact |
| `frontend/src/components/farm/RunningCosts.tsx` | component | request-response (react-query read) | `frontend/src/components/sports/SportsCenter.tsx` (guest-state branch) | exact |
| `frontend/src/components/farm/modals/SellModal.tsx` | component (modal, pricing preview) | transform (formula mirror) | itself (existing `pricingFactors` useMemo, extend) | exact |
| `frontend/src/components/farm/modals/BidModal.tsx` | component (modal) | request-response | `CompetitorsPanel.tsx` / `ParcelDetailsPanel.tsx` (Bar Meter/Progress usage) | role-match |
| `frontend/src/components/farm/Marketplace.tsx` | component | transform (sprite resolution) | itself — source of the logic to extract | exact |
| `frontend/src/lib/buildingSprites.ts` | utility (new file) | transform | `Marketplace.tsx` lines 57-88 (extraction source) | exact (extraction) |
| `frontend/src/App.tsx` (`orchardAutomationConfig`, new `orchardBuildingsConfig`) | config/composition | event-driven (ownership + phase gate -> boolean config) | itself, lines 171-185 (existing shape to extend) | exact |
| `backend/game_logic.mo` (`calculateWholesalePrice`) | service (pure formula) | CRUD-adjacent (pricing calc, no state mutation) | itself, extend signature with `hasProcessingFacility: Bool` | exact |
| `frontend/src/__tests__/economyParity.test.ts` | test | transform (parity assertions) | itself, `describe('economy parity: season sale price (ECON-02)', ...)` block (lines 706-791) | exact |
| `frontend/src/__tests__/uiConventions.test.ts` | test | static-analysis ratchet | itself, existing ratchet structure | exact |
| `frontend/src/__tests__/runningCosts.test.tsx` (new) | test | component render | `frontend/src/__tests__/competitorsPanel.test.tsx` (`createAuthWrapper` pattern) | role-match |
| `frontend/src/__tests__/orchardAutomationConfig.test.ts` (new) | test | config truth-table | no direct analog — plain unit test on a pure object/function | none |
| `frontend/e2e/orchard.spec.ts` | test (e2e) | UI interaction | itself, existing Playwright spec conventions | exact |

## Pattern Assignments

### `frontend/src/components/farm/ImperialOrchard.tsx` (component, isometric render — UX-02 overlay, UX-06/09 buildings, UX-08 consumption)

**Analog:** itself — extend the existing continuous-projected-Y z-index convention.

**Core pattern** (`ImperialOrchard.tsx:1195-1216`):
```typescript
// soil entity (baseline, typeOffset = 0)
zIndex: s * 100000 + Math.round(y * 10)

// tree entity (typeOffset = +2) — only if slot occupied
entities.push({
    type: 'tree',
    key: `tree-${idx}-${s}`,
    parcel,
    x, y,
    seed: (s * 100) + idx,
    delay: (idx % 7) * -0.8,
    zIndex: s * 100000 + Math.round(y * 10) + 2
});
```
Other established offsets in the same file: worker/helper `+5` (line 1309/1321), machine `+4` (line 1346).

**New building-entity pattern (per 09-UI-SPEC.md Component Contract E, D-09):** insert a `typeOffset = +1` (between soil `0` and tree `+2`):
```typescript
entities.push({
    type: 'building',
    key: `building-${slotIndex}`,
    x, y, // from projectToIso() at the fixed N/NE border row/col
    zIndex: s * 100000 + Math.round(y * 10) + 1
});
```

**UX-02 lighting overlay integration point:** embed directly in this component's render tree, `absolute inset-0` relative to the orchard's own wrapper (not `fixed inset-0`/viewport) — see Pitfall 3 below and `ParticleLayer.tsx` pattern.

**UX-08 phase-gate consumption:** this component receives `automationConfig={orchardAutomationConfig}` as a prop already (see `App.tsx:795`) — no change needed inside `ImperialOrchard.tsx` itself for UX-08 beyond consuming the already-gated booleans it receives; the gating logic change lives entirely in `App.tsx`.

---

### `frontend/src/components/effects/ParticleLayer.tsx` (component, canvas effect — UX-02 D-01/D-03)

**Analog:** itself. File is 146 lines total — already implements an internal `requestAnimationFrame` render loop and an `intensity` prop (0.0-1.0), per 09-RESEARCH.md. Currently sized via `window.innerWidth/innerHeight` and positioned `fixed inset-0` (viewport-relative).

**Required change:** replace viewport sizing with a `ResizeObserver` on the parent orchard container, and change positioning to `absolute inset-0` of that container. No shared FPS utility exists in the codebase — the low-framerate throttle (D-03) must be self-contained inside this file's own rAF loop (rolling average of `performance.now()` deltas).

**Intensity formula (from 09-UI-SPEC.md, D-02):**
```typescript
const intensity = Math.min(1.0, Math.max(0.35, 0.35 + goldenHarvesterLevel * 0.12));
// mobile: intensity * 0.5 (useMediaQuery('(max-width: 768px)'), Sidebar.tsx convention)
// low-fps (<30fps for >1s): halve again, floor at 0.1 — never zero (D-02 forbids gating visibility)
```

---

### `frontend/src/components/farm/RunningCosts.tsx` (component, request-response — UX-04)

**Analog:** `frontend/src/components/sports/SportsCenter.tsx:140-153`

**Current buggy code** (`RunningCosts.tsx:13-23`):
```typescript
export const RunningCosts: React.FC<RunningCostsProps> = ({ ownedInfrastructure, parcels, onOpenFinancialReport }) => {
    const { data: stability, isLoading } = useStability();

    if (isLoading) {
        return (
            <div className="mt-4 bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 animate-pulse">
                <div className="h-4 w-24 mb-3 bg-slate-700 rounded" />
                <div className="h-8 w-full bg-slate-700 rounded" />
            </div>
        );
    }
    const totalEst = stability?.estimatedCost ? Number(stability.estimatedCost) : 0;
    // ^ falls through to 0 PLN silently when the query is disabled (guest mode) — isLoading is
    //   false, not true, when enabled:false per React Query v5 (see Common Pitfalls below)
```

**Analog guest-branch pattern to copy** (`SportsCenter.tsx:140-153`):
```typescript
{!backendActor ? (
    // Guest mode has no actor, so the query never runs. An empty
    // grid would read as "there are no clubs", which is false.
    <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-sm">
        Sign in to see the clubs in your region.
    </div>
) : isLoading ? (
    <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
) : isError ? (
    <div className="p-6 text-center border border-dashed border-red-900/60 rounded-lg text-red-400/80 text-sm">
        Could not load the club list.
    </div>
) : (
    /* real content */
)}
```

**Apply to `RunningCosts.tsx`:** need `backendActor`/`isAuthenticated` from `useAuth()` (currently not imported in this file — add it), branch BEFORE the `isLoading` check, copy string per 09-UI-SPEC.md's Copywriting Contract: `"Sign in to see your farm's running costs."`

**Error handling pattern:** none currently in this component (no `isError` handled) — `SportsCenter.tsx`'s `isError` branch is the pattern to add if `useStability()` surfaces one.

---

### `frontend/src/components/farm/modals/SellModal.tsx` (component, formula mirror — UX-05)

**Analog:** itself, `pricingFactors` `useMemo` (lines 46-105).

**Core pattern** (`SellModal.tsx:101-104`):
```typescript
const wholesaleMultiplier = 0.7;
// ... volumePenalty, qualityBonus, marketMult, seasonMod computed above ...
finalUnitPrice = basePrice * wholesaleMultiplier * volumePenalty * qualityBonus * marketMult * seasonMod;
```

**Required change:** add a `hasProcessingFacility` term sourced from `farm.infrastructure` (already in scope via `useFarm()` in this component), multiplying by `1.15` when true — mirroring the backend's new bonus term exactly. Per CLAUDE.md and 09-RESEARCH.md Pitfall 2, this is the REAL mirror site — NOT `frontend/src/lib/gameLogic.ts` (no `calculateWholesalePrice` export exists there).

---

### `backend/game_logic.mo` (`calculateWholesalePrice` — UX-05)

**Analog:** itself — existing formula signature, extend with one new parameter.

**Pattern reference (transcribed in test file, `economyParity.test.ts:706-717`):**
```typescript
function refWholesalePrice(
    basePrice: number,
    quantity: number,
    quality: number,
    saturationMultiplier: number,
    seasonMultiplier: number,
): number {
    const wholesaleMultiplier = 0.7;
    const volumeBonus = quantity > 10000 ? 1.05 : quantity > 5000 ? 1.02 : 1.0;
    const qualityBonus = 1.0 + (quality / 100.0 * 0.1);
    return basePrice * wholesaleMultiplier * volumeBonus * qualityBonus * saturationMultiplier * seasonMultiplier;
}
```

**Required change:** add `hasProcessingFacility: Bool` parameter (derived server-side inside `main.mo` from `farm.infrastructure` — NEVER a caller-supplied argument, per the `ECON-09` threat pattern noted in 09-RESEARCH.md's Security Domain), multiply result by `1.15` when true. Sole call site: `main.mo:1395` (internal only, not Candid — no "Ask First" needed for this specific formula edit per research's confirmation).

**Error handling:** none needed — pure arithmetic function, no new failure mode introduced.

---

### `frontend/src/__tests__/economyParity.test.ts` (UX-05 parity extension)

**Analog:** itself, `describe('economy parity: season sale price (ECON-02)', ...)` block (lines 719-791) — the exact structure to follow for a new `describe('economy parity: processing facility wholesale bonus (UX-05)', ...)` block.

**Pattern** (`economyParity.test.ts:756-767`):
```typescript
it.each([
    ['Spring', REF_SEASONS.Spring, 0.9],
    ['Summer', REF_SEASONS.Summer, 1.15],
    ['Autumn', REF_SEASONS.Autumn, 1.0],
    ['Winter', REF_SEASONS.Winter, 0.75],
] as const)('%s: wholesale price carries the season term through the product', (_name, season, mult) => {
    const seasonMult = getSeasonSaleMultiplier(season);
    expect(seasonMult).toBeCloseTo(mult, 10);
    const withSeason = refWholesalePrice(15, 1000, 60, 1.0, seasonMult);
    const withoutSeason = refWholesalePrice(15, 1000, 60, 1.0, 1.0);
    expect(withSeason / withoutSeason).toBeCloseTo(mult, 10);
});
```
Follow this same "with term vs without term, ratio equals expected multiplier" idiom for the new `hasProcessingFacility` boolean term (ratio should equal exactly `1.15`), and update `refWholesalePrice`'s signature to accept the new parameter.

---

### `frontend/src/lib/buildingSprites.ts` (new file — UX-06/09 extraction)

**Analog/extraction source:** `frontend/src/components/farm/Marketplace.tsx:57-88`

**Exact code to extract:**
```typescript
type BuildingSpriteType = 'coldStorage' | 'warehouse' | 'processingPlant' | 'socialFacilities';

const LEVELED_BUILDING_FOLDERS: Partial<Record<BuildingSpriteType, { l1: string; l2: string }>> = {
    /* ... existing entries, read verbatim from Marketplace.tsx:60-63 ... */
};

const SINGLE_TIER_BUILDING_FOLDERS: Partial<Record<BuildingSpriteType, string>> = {
    /* ... existing entries, Marketplace.tsx:64-68 ... */
};

function buildingSpriteFolder(buildingType: BuildingSpriteType, level: number): string {
    const leveled = LEVELED_BUILDING_FOLDERS[buildingType];
    /* ... existing body, Marketplace.tsx:69-73 ... */
    return SINGLE_TIER_BUILDING_FOLDERS[buildingType] ?? '';
}

const BUILDING_SPRITE_SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
type BuildingSpriteSeason = typeof BUILDING_SPRITE_SEASONS[number];

function seasonKeyFromBackend(season: any): BuildingSpriteSeason {
    /* ... existing body, Marketplace.tsx:79-82 ... */
    return (BUILDING_SPRITE_SEASONS as readonly string[]).includes(lower) ? (lower as BuildingSpriteSeason) : 'spring';
}
```
`BuildingSprite` React component itself (`Marketplace.tsx:86-101`) can either move into this lib file too or stay as a component importing the extracted helpers — planner's call, but the helpers (folder resolution, season key) MUST be exported from this one module and imported by both `Marketplace.tsx` and `ImperialOrchard.tsx` (Don't Hand-Roll rule — no second sprite-lookup implementation).

---

### `frontend/src/App.tsx` (`orchardAutomationConfig` extension — UX-08; new `orchardBuildingsConfig` — UX-06/09)

**Analog:** itself, lines 171-185.

**Current pattern** (`App.tsx:171-185`):
```typescript
const orchardAutomationConfig = {
    hasHarvesters: getInfraLevel('Shaker') > 0,
    hasTractor: getInfraLevel('Tractor') > 0,
    hasSprayer: getInfraLevel('Sprayer') > 0,
    hasPruner: getInfraLevel('Pruner') > 0,
};

const getCurrentPhaseName = (phase: any): any => {
    if (!phase) return 'Hiring';
    if (typeof phase === 'string') return phase;
    return Object.keys(phase)[0] || 'Hiring';
};

const currentPhase = getCurrentPhaseName(farm?.currentPhase) as any;
```

**Required UX-08 change** — add `&& currentPhase === '<Phase>'` per machine (mapping table from 09-RESEARCH.md Pattern 4, confirmed as Claude's-discretion reasoning):
```typescript
const orchardAutomationConfig = {
    hasHarvesters: getInfraLevel('Shaker') > 0 && currentPhase === 'Harvest',
    hasTractor: getInfraLevel('Tractor') > 0 && (currentPhase === 'Investment' || currentPhase === 'Growth'),
    hasSprayer: getInfraLevel('Sprayer') > 0 && currentPhase === 'Growth',
    hasPruner: getInfraLevel('Pruner') > 0 && currentPhase === 'CutAndPrune',
};
```
Note: `currentPhase` must be declared/computed BEFORE this object (currently declared after, at line 185) — reorder needed, or reference via a function that's hoisted correctly.

**New `orchardBuildingsConfig` (UX-06/09, D-13's fixed slot order) — same shape convention:**
```typescript
const orchardBuildingsConfig = {
    warehouse: { owned: getInfraLevel('Warehouse') > 0, level: getInfraLevel('Warehouse'), slot: 1 },
    coldStorage: { owned: getInfraLevel('ColdStorage') > 0, level: getInfraLevel('ColdStorage'), slot: 2 },
    processingFacility: { owned: getInfraLevel('ProcessingFacility') > 0, level: getInfraLevel('ProcessingFacility'), slot: 3 },
    socialFacilities: { owned: getInfraLevel('SocialFacilities') > 0, level: getInfraLevel('SocialFacilities'), slot: 4 },
};
```
Render nothing for an unowned type's slot — matches the existing `orchardAutomationConfig?.hasX` convention of "nothing appears unless the player has opted in."

---

### `frontend/src/components/farm/MainDashboard.tsx` (Action Dock migration — UX-03/D-00/D-11)

**Analog:** itself (rewrite in place) for structure; `frontend/src/components/ui/badge.tsx` + `frontend/src/components/ui/progress.tsx` for the new stat primitives; `CompetitorsPanel.tsx`/`ParcelDetailsPanel.tsx` for existing correct `Progress` usage to copy the Bar Meter pattern from.

**Badge extension pattern** (`badge.tsx:6-24`, full file, 36 lines — extend `cva` variants):
```typescript
const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                // NEW for UX-03 Metric Badge:
                brass: "border-brass/40 bg-charcoal-light text-foreground",
            },
        },
        defaultVariants: { variant: "default" },
    }
)
```

**Structural change:** remove `bg-black/60 backdrop-blur-xl`, `bg-white/5`, `bg-black/40 backdrop-blur-sm` (present in current file) in favor of existing solid `.mechanical-hull`/`.mahogany-plate` classes — per D-00's "no expensive transparency" rule and 09-UI-SPEC.md Component Contract D.

**Removed entirely (D-11):** the "STEAM PRESSURE" `ImperialDial` bound to local `useState(75)` — no real backend equivalent exists; remove rather than fabricate a binding. Dead "Market Auction" button's `onClick` (`console.log('Go to Auction')`) gets wired to real navigation, copy = `"View Market Auction"` per 09-UI-SPEC.md Copywriting Contract.

**Error handling:** none new — this is a presentation rewrite of already-fetched data.

---

### `frontend/src/components/farm/modals/BidModal.tsx` (D-12 EmeraldGauge -> Bar Meter)

**Analog:** `CompetitorsPanel.tsx` / `ParcelDetailsPanel.tsx` for the `Progress`-based Bar Meter pattern (both already use shadcn `Progress` correctly for bounded values per 09-RESEARCH.md's "Don't Hand-Roll" table).

**Required change:** replace all three hardcoded `EmeraldGauge` instances (`value={85}` "Harvest", `value={40}` "Storage", `value={95}` "Morale") with real bounded data: "Harvest" -> rename "Avg. Quality" (average parcel quality), "Storage" -> real storage-fill ratio (same computation `MainDashboard.tsx` uses, minus its `+15`/`+5` padding bug — see Flagged Defects), "Morale" -> replaced with average parcel fertility (per 09-UI-SPEC.md's resolved UI Consideration, user decision 2026-09-18).

---

## Shared Patterns

### Guest/disabled-query empty state (UX-04, applies to any react-query consumer reachable in guest mode)
**Source:** `frontend/src/components/sports/SportsCenter.tsx:140-153`
**Apply to:** `RunningCosts.tsx` (this phase); flagged as a wider risk (not in scope) for `useCompetitors`, `useLeaderboard` in `useFarm.ts` per 09-RESEARCH.md Pitfall 1.
```typescript
{!backendActor ? (
    <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-sm">
        {/* guest copy string, see Copywriting Contract per component */}
    </div>
) : isLoading ? (
    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
) : isError ? (
    <div className="p-6 text-center border border-dashed border-red-900/60 rounded-lg text-red-400/80 text-sm">
        {/* error copy */}
    </div>
) : (
    /* real content */
)}
```
**Critical:** do NOT rely on `isLoading` alone to detect "disabled" — `@tanstack/react-query@5.90.20`'s `isLoading = isPending && isFetching`, and a disabled query has `isFetching = false`, so `isLoading` is `false`, not stuck `true`. Check `!backendActor`/`!isAuthenticated` explicitly and first.

### Continuous-projected-Y z-index (applies to any new isometric entity: buildings)
**Source:** `frontend/src/components/farm/ImperialOrchard.tsx:1202/1214/1309/1321/1346`
**Apply to:** new building-slot entities (UX-06/09)
```typescript
zIndex: s * 100000 + Math.round(y * 10) + typeOffset
// existing offsets: soil=0, building=+1 (NEW), tree=+2, machine=+4, worker/helper=+5
```

### Ownership+phase gating composition (applies to machines UX-08, and conceptually to buildings UX-06/09)
**Source:** `frontend/src/App.tsx:171-176`
**Apply to:** `orchardAutomationConfig` (extend with `&& currentPhase === ...`), new `orchardBuildingsConfig` (ownership-only, no phase gate — buildings are always visible once purchased per D-06)
```typescript
const orchardAutomationConfig = {
    hasHarvesters: getInfraLevel('Shaker') > 0 && currentPhase === 'Harvest',
    // ...
};
```

### Bar Meter primitive (UX-03, applies to MainDashboard.tsx, BidModal.tsx)
**Source:** shadcn `Progress` (`frontend/src/components/ui/progress.tsx`, 30 lines, used as-is), reference usage in `ParcelDetailsPanel.tsx`/`CompetitorsPanel.tsx`.
**Apply to:** every bounded-value stat display in this phase (machine wear, storage fill, season progress, migrated BidModal gauges). Standardized to `h-2` track height per 09-UI-SPEC.md (currently mixed `h-1.5`/`h-2` at the two reference sites — normalize when touched).

### Metric Badge primitive (UX-03, applies to MainDashboard.tsx Treasury/Prestige)
**Source:** `frontend/src/components/ui/badge.tsx` `cva` variants, extended with a new `brass` variant (see excerpt above).

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `frontend/src/__tests__/orchardAutomationConfig.test.ts` | test | config truth-table | No existing test in this codebase isolates a plain config object/composition function like this — closest sibling tests (`uiConventions.test.ts`) test rendered output, not a pure config shape. Use plain Vitest `describe`/`it.each` over the phase enum x machine matrix; no component render needed. |

## Metadata

**Analog search scope:** `frontend/src/components/farm/`, `frontend/src/components/ui/`, `frontend/src/components/sports/`, `frontend/src/components/social/`, `frontend/src/components/effects/`, `frontend/src/lib/`, `frontend/src/__tests__/`, `frontend/src/App.tsx`, `backend/game_logic.mo`
**Files scanned:** ~20 (targeted reads/greps per 09-RESEARCH.md's already-verified line citations, cross-checked directly against source)
**Pattern extraction date:** 2026-09-18
