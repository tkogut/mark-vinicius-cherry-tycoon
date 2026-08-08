---
sketch: 002
name: machines-and-workers
question: "What visual style should farm machines (tractor, spreader, harvester, pruner) and a redesigned worker sprite use — and should it extend sketch 001's faceted Geometric Brass canopy language, go more literal steampunk, or pivot toward a friendlier toy-geometric look?"
winner: null
tags: [machines, workers, orchard, canvas, isometric]
---

# Sketch 002: Machines & Workers

## Design Question

The current `ImperialOrchard.tsx` has no visual representation at all for farm
machines (tractor, manure spreader, fruit harvester, branch pruner), and the
`WorkerNPC` component is still the pre-UX-06 CSS/DOM sprite (18×22px stacked
divs) — never ported to the Canvas 2D "Geometric Brass" style the trees now
use (`frontend/src/components/farm/geometricBrassTree.ts`, sketch 001).

This sketch previews 3 style directions for both machines and workers
together, so a style decision can be made once, coherently, rather than
picking machines and workers separately.

## How to View

```
open .planning/sketches/002-machines-and-workers/index.html
```

## Variants

- **A: Geometric Brass** — same faceted low-poly language as the winning tree
  canopy: angular polygon panels, brass/copper gradients, a small gold gear
  rivet as a recurring accent. Worker redrawn as a small faceted Canvas 2D
  sprite instead of DOM divs.
- **B: Grounded Steampunk Machinery** — more literal industrial read: riveted
  cylindrical boiler tanks, piston rods, smokestacks with soft puffing smoke.
  Worker is a sturdier boiler-backpack operator silhouette.
- **C: Toy Geometric** — rounded, simplified shapes, big friendly wheels,
  warm brass-adjacent (not palette-swapped) color blocks. Worker is
  chibi-proportioned. Leans toward the "Beavers City" friendliness direction
  raised earlier in this project's design discussion, applied here rather
  than to the already-locked tree style.

## What to Look For

- Does the machine style read as the same visual family as the orchard trees,
  or does it clash?
- At the small on-screen size these will actually render at (a tile is
  96×48px), which variant stays legible vs. turns to noise?
- Worker + machine coherence: in each variant, do the worker and the machines
  feel like they belong to the same "operator + equipment" set?
- This is a **preview-only** sketch — no variant has been ported into
  `ImperialOrchard.tsx` yet. Picking a winner here does not implement it.
