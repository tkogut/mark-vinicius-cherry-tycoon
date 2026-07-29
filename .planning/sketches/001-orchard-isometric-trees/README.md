---
sketch: 001
name: orchard-isometric-trees
question: "Does procedural Canvas 2D tree rendering in an isometric multi-parcel grid, styled in Neo-Steampunk palette, read clearly at both desktop and mobile sizes — and which of 3 tree-rendering styles fits best?"
winner: null
tags: [orchard, canvas, isometric, trees]
---

# Sketch 001: Orchard Isometric Trees

## Design Question

Replace the current CSS-blur "fake metaball" tree rendering (`frontend/src/components/farm/ImperialOrchard.tsx`) with procedural Canvas 2D trees on an isometric grid, kept in the Neo-Steampunk palette rather than adopting Beavers City's own cartoon look. Which tree-rendering style reads best, and does the isometric multi-parcel grid hold up at mobile size?

## How to View

```
open .planning/sketches/001-orchard-isometric-trees/index.html
```

Each variant re-randomizes on load and has a "Reroll Seed" button — click it to confirm no two trees look identical (the core promise of procedural generation over static assets).

## Variants

- **A: Geometric Brass** — angular, faceted polygon canopy shapes, brass gear rivets at the trunk base. Leans hardest into the "industrial" half of Neo-Steampunk; reads as sharp/mechanical rather than a soft orchard.
- **B: Organic Noise** — rounded, layered canopy clusters (flat shapes with a shadow pass + highlight pass to fake volume, no blur filter at all). Softer, closer to what an orchard should feel like, but has the least visible Neo-Steampunk identity on its own.
- **C: Clockwork Hybrid** — same organic canopy as B, plus small brass rivets at branch forks and a gold gear motif at the crown apex, cherries get a gold glint highlight. The compromise pitch: friendly silhouette up close, unmistakably Neo-Steampunk on inspection.

## What to Look For

1. **Crispness vs. the current game**: all three should look meaningfully cleaner than the existing blurred-div canopy — confirm that's true for each.
2. **Which canopy style says "cherry orchard" fastest** — B and C use the same canopy shape; A is a genuinely different approach.
3. **Mobile legibility of the 3×3 grid**: at a 375px-wide viewport (use the toolbar's Phone button), the 9-parcel grid shrinks a lot. Trees are still distinguishable but this raises an open question — see below.
4. **Whether the gear/rivet accents in A and C read as "Neo-Steampunk" or just as noise at this scale.**

## Open Question Not Resolved by This Sketch

At mobile width, showing all 9 parcels in one 3×3 isometric grid makes each tree quite small. This sketch doesn't resolve whether the real mobile experience should (a) keep the full multi-parcel overview and let it get small, (b) default to a zoomed-in 1-4 parcel view with pan/zoom to see more, or (c) something else. Worth a follow-up sketch once a canopy style is chosen, if this direction is picked.
