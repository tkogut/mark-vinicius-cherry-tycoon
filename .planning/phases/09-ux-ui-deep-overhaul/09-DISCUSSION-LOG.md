# Phase 9: UX/UI Deep Overhaul - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-18
**Phase:** 9-ux-ui-deep-overhaul
**Areas discussed:** Scope of user-supplied architecture document, UX-02 (orchard lighting), UX-03 (stat idiom), UX-05 (Processing Plant), UX-06/UX-09 (building placement)

---

## Scope of the user-supplied architecture document

Mid-way through area selection, the user pointed to a new file they had added, `docs/game-design/Architektura w Przeglądarkowych Grach Symulacyjno-Ekonomicznych.md` — an extensive research summary on browser tycoon-game UI architecture — saying it should inform the new design approach. Per discuss-phase's canonical-ref rule, Claude read it in full before continuing.

| Option | Description | Selected |
|--------|-------------|----------|
| Tylko zasady, nie architektura | Adopt Smart UI, bottom-dock consolidation, CTA hierarchy, and rendering-performance principles from the doc; do not build the doc's full multi-window OS-style system | ✓ |
| To nowa faza po Fazie 9 | Full multi-window system goes into the roadmap as a future phase | |
| Chcę to wdrożyć teraz | Expand Phase 9 to include the full multi-window system now | |

**User's choice:** Option 1, with explicit reasoning: the full OS-style windowing system (drag/pin/target-window) would "rozsadziłby Fazę 9 i popsuł kompatybilność z mobile/PWA (LEAD-03)." Locked adopted principles: Smart UI contextual panels, consistent bottom dock ("Action Dock"), CTA color hierarchy, solid panel backgrounds without expensive transparency, crisp UI textures. The multi-window concept was recorded as a possible v2/desktop-only consideration, not discarded.

---

## UX-02: Orchard lighting/atmosphere

Claude first investigated whether UX-02 overlapped with the already-shipped UX-06 (Geometric Brass orchard rework). Finding: UX-02's tree-density/rendering half is done; only the "God Rays/Golden Hour" lighting promise remains open. Also found: `GoldenHarvesterView.tsx` (God Rays + GoldenPollen particles) is completely orphaned — never imported/rendered — despite `PROJECT.md` claiming it "shipped."

| Option | Description | Selected |
|--------|-------------|----------|
| Wykorzystaj osierocony GoldenHarvesterView | Extract its God Rays/particle logic into ImperialOrchard, delete the dead component | ✓ |
| Prostszy CSS overlay (.god-ray-45) | Reuse the lighter existing MainDashboard effect instead | |
| (sub-question) Stały efekt vs tylko dla Golden Harvester | Always visible vs gated behind the upgrade | Always visible (sub-decision folded into main answer) |

**User's choice:** Extract GoldenHarvesterView's logic into ImperialOrchard; effect always visible for every player (fulfills the lore promise unconditionally); Golden Harvester ownership/level only increases intensity/particle density; must be mobile/low-FPS optimized (reduce/disable particles), no memory leaks.

---

## UX-03: Stat-display idiom

| Option | Description | Selected |
|--------|-------------|----------|
| Pasek postępu wszędzie | One flat bar+label+value pattern for every metric | |
| Kołowy wskaźnik wszędzie | Circular gauges for every metric | |
| Hybryda wg typu danych | Bar for bounded/% values, plain metric badge for open-ended values | ✓ |

**User's choice:** Hybrid. Explicit reasoning: forcing a progress bar onto open-ended values (cash, prestige) is a UX error since a bar needs a defined 100%. Final grammar: **Bar Meter** (label+value) for finite/bounded values (machine health/wear, storage fill, phase/season progress); **Metric Badge** (icon+number+delta) for open-ended values (cash, prestige). Circular gauges eliminated entirely — waste vertical space, don't scale to a compact mobile bottom dock.

---

## UX-05: Processing Plant dead lever

Claude first investigated the actual current state: purchase (100,000 PLN) is fully real and wired to a genuine backend mutation; the promised "+15% wholesale price" effect does not exist anywhere in `calculateWholesalePrice`. Confirmed via `docs/game-design/UX-AUDIT-2026-07-29.md` and `REQUIREMENTS.md`'s `SIM-04` cross-reference.

| Option | Description | Selected |
|--------|-------------|----------|
| Wdróż realnie +15% | Add the real bonus to the wholesale formula | ✓ |
| Oznacz jako niedostępne | Mark the card "coming soon", block purchase | |
| Usuń obietnicę z karty | Remove/change the card's copy instead | |

**User's choice:** Implement the real +15% bonus. Reasoning: per V1-parity's no-dead-levers principle, since the player already pays the cost and upkeep, the promise must be honored. Backend Motoko + TypeScript mirror + parity test, all in the same change.

---

## UX-06/UX-09: Building placement in the orchard

| Option | Description | Selected |
|--------|-------------|----------|
| Automatycznie w strefie obwódki | Buildings auto-render in a fixed border zone on purchase | ✓ |
| Gracz ręcznie umieszcza (drag-and-drop) | Player drags the sprite to a chosen spot | |
| Nie umieszczaj w sadzie teraz | Defer, leave buildings in Marketplace only | |

**User's choice:** Automatic placement, with detailed follow-up specification (not separately offered as options, volunteered directly): fixed slots on the parcel's North/North-East border only (sprites face South-West, so this makes entrances/loading docks face into the farm and prevents roofs occluding the orchard); seasonal variant auto-switches with global season; z-index below tree canopies/paths lower on the projected Y-axis (continuous-Y depth rule, not tile buckets); clicking a building opens the bottom Action Dock (from the locked Smart UI/bottom-dock principle) instead of a modal.

---

## Claude's Discretion

- **UX-04** (sidebar placeholder boxes): user explicitly deferred to Claude's judgment as "mechanical" once told the root cause (a react-query call that's `enabled: false` in guest mode and never resolves out of its loading skeleton) rather than a design question.
- **UX-08** (machine phase gating): user explicitly deferred the phase-to-machine mapping to Claude's judgment as "mechanical" — to be derived from each machine's real in-game function.

## Deferred Ideas

- Full OS-style multi-window dashboard system (drag/3-depth z-layering/pinning/target-window transfers) from the user-supplied architecture document — recorded as a possible v2, desktop-only consideration; not adopted now (conflicts with mobile/PWA, `LEAD-03`).
