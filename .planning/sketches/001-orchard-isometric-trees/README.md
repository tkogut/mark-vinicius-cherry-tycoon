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
- ~~**C: Clockwork Hybrid**~~ — **Rejected 2026-07-29.** Tab kept (struck through, disabled) per sketch convention of preserving rejected variants rather than deleting them. User chose to iterate A and B across seasons instead of continuing C.

Both A and B now have a **season selector** (Spring / Summer / Autumn / Winter) per `SEASON_CONFIG` in the script. Trees are anchored 15% of a tile's height further down within their parcel (`TREE_Y_OFFSET`) than the first pass, and every parcel now gets seasonal ground decoration (`drawGroundDecor`) in addition to the tree itself:

- **Spring**: smaller/sparser canopy, more saturated fresh-green palette (pushed more vivid per revision), blossom dots instead of fruit; ground gets a vivid green wash, dense grass tufts, and scattered white/yellow/pink flowers.
- **Summer**: full canopy (as originally sketched), ruby cherries with a glossy gradient + glint; ground gets fewer, drier/more yellow-toned grass tufts than spring.
- **Autumn**: reduced canopy count, canopy palette pushed warmer/richer (more red-orange, less muddy brown) per revision, no fruit (harvested); ground gets scattered fallen-leaf shapes in matching autumn tones.
- **Winter**: canopy fully removed — bare branches with an added secondary-twig pass and multiple snow clumps distributed along each branch (not just the tip), gear/rivet accents remain visible on the bare trunk (Variant A); ground gets scattered snow patches over frost-tinted soil tiles.

Trunk, gear/rivet, and cherry fills all use canvas gradients now (bright highlight → deep shadow) rather than flat colors, inspired by the existing `frontend/public/assets/textures/` set (`emerald_gauge_liquid.png`'s glowing bubbles, `brass_gear_dial.png`'s ornate warm-metal glint, `mahogany.png`'s glossy wood grain) — still 100% procedural canvas drawing, no image assets.

### Third revision (canopy position/size, ground decor variety, paths, buildable border)

- **Canopy lowered** — shared `CANOPY_LIFT` constant dropped from 16-18px to 8px in both variants, so the canopy sits closer to the trunk instead of "hanging" above it. Horizontal centering was already correct (cluster angles are uniformly distributed around the trunk x); only the vertical lift needed correcting.
- **Spring/autumn canopy size +20%** — `facetScale` bumped 0.55→0.66 (spring) and 0.8→0.96 (autumn) in `SEASON_CONFIG`.
- **Grass/leaves now use 3-shade palettes** (`GRASS_SHADES`, `LEAF_SHADES`) instead of a 2-tone dark/light pair, and each grass "tuft" spot now randomly renders as 1, 2, or 3 clustered clumps (`drawGrassTuft` → `drawGrassClump`) instead of always exactly one.
- **Ground decoration is now clipped to each parcel's own diamond** (`ctx.clip()` in `drawGroundDecor`) so grass/flowers/leaves/snow can never spill past a parcel's edge or the orchard's outer silhouette.
- **Path lanes** (`drawPathLanes`) — light dirt-colored strips traced along every internal parcel boundary, representing farmer/tractor/machinery routes between fields.
- **Outer buildable border zone** (`drawBuildableZone`) — a dashed-outline band surrounding the whole 3×3 grid, with three placeholder plot outlines (Warehouse / Workshop / Farmhouse) marking where future buildings will go. Canvas grown to 900×700 and the grid's vertical origin shifted down to fit this new outer band without clipping off-canvas.

**Known rough edge, not yet fixed**: the "Warehouse" placeholder label can clip against the canvas edge depending on random tree layout/canvas scaling — cosmetic only, and expected to be revisited once real building art replaces the placeholder rectangles.

### Fourth revision (path geometry fix, autumn canopy -10%)

- **Fixed path geometry** — the previous path lanes traced `isoToScreen(k, 0..gridSize)`, which is a straight line through tile **centers**, not tile edges (an isometric-projection mistake: adjacent tiles' true shared edge is each tile's bottom-to-right or left-to-bottom edge, not a line at a fixed grid coordinate). Paths now trace the real seams between every adjacent tile pair (`tileVertex` + `drawPathSeams`), so they run exactly along parcel boundaries as intended, not through the middle of fields.
- **Autumn canopy reduced 10%** from the prior +20% bump — net `facetScale` is now `0.8 * 1.2 * 0.9 = 0.864` (documented inline in `SEASON_CONFIG`).

### Fifth revision (path z-order, irregularity, darker brown)

- **Paths now render BEHIND trees** — `render()` restructured into 3 explicit passes: (1) all tile fills, (2) path lanes, (3) ground decor + trees. Previously paths were drawn last (on top of everything); now tree canopies/bare branches correctly occlude the path where they overlap it.
- **Paths are irregular now, not ruler-straight** — `drawWobblyPath` bends each seam through a randomly-jittered midpoint (a quadratic curve with a perpendicular offset up to 35% of the segment length) instead of a straight line, so it reads as a worn dirt track rather than a geometric grid overlay. Wobble uses its own seeded `rng` so it's deterministic per orchard seed, not re-randomized every frame.
- **Color darkened**, then re-tuned for contrast — first pass (`rgba(58,42,26,0.8)`) was barely visible against both the dark standard soil and the blue-grey winter soil; bumped to a two-tone dark-edge (`rgba(58,40,22,0.92)`, width 10) + lighter trodden-center (`rgba(94,64,34,0.85)`, width 4) pair, still unambiguously "dark brown," now with enough internal contrast to read clearly under both seasons.

## What to Look For

1. **Crispness vs. the current game**: both should look meaningfully cleaner than the existing blurred-div canopy.
2. **Which canopy style says "cherry orchard" fastest** across all four seasons, not just summer.
3. **Season readability**: can you tell which season you're looking at at a glance, without reading the label?
4. **Mobile legibility of the 3×3 grid**: at a 375px-wide viewport (use the toolbar's Phone button), the 9-parcel grid shrinks a lot. Trees are still distinguishable but this raises an open question — see below.
5. **Whether the gear/rivet accents in A read as "Neo-Steampunk" or just as noise at this scale, especially against the bare winter branches.**

## Open Question Not Resolved by This Sketch

At mobile width, showing all 9 parcels in one 3×3 isometric grid makes each tree quite small. This sketch doesn't resolve whether the real mobile experience should (a) keep the full multi-parcel overview and let it get small, (b) default to a zoomed-in 1-4 parcel view with pan/zoom to see more, or (c) something else. Worth a follow-up sketch once a canopy style is chosen, if this direction is picked.
