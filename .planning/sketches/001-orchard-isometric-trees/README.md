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

## What to Look For

1. **Crispness vs. the current game**: both should look meaningfully cleaner than the existing blurred-div canopy.
2. **Which canopy style says "cherry orchard" fastest** across all four seasons, not just summer.
3. **Season readability**: can you tell which season you're looking at at a glance, without reading the label?
4. **Mobile legibility of the 3×3 grid**: at a 375px-wide viewport (use the toolbar's Phone button), the 9-parcel grid shrinks a lot. Trees are still distinguishable but this raises an open question — see below.
5. **Whether the gear/rivet accents in A read as "Neo-Steampunk" or just as noise at this scale, especially against the bare winter branches.**

## Open Question Not Resolved by This Sketch

At mobile width, showing all 9 parcels in one 3×3 isometric grid makes each tree quite small. This sketch doesn't resolve whether the real mobile experience should (a) keep the full multi-parcel overview and let it get small, (b) default to a zoomed-in 1-4 parcel view with pan/zoom to see more, or (c) something else. Worth a follow-up sketch once a canopy style is chosen, if this direction is picked.
