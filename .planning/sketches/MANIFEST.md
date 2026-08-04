# Sketch Manifest

## Design Direction

Hybrid visual direction for the cherry orchard/farm-plot view, replacing the current CSS-blur "fake metaball" tree rendering (`frontend/src/components/farm/ImperialOrchard.tsx`), decided after a live Playground UX audit (`docs/game-design/UX-AUDIT-2026-07-29.md`) and a deliberate creative-direction discussion:

- **Technique** borrowed from `github.com/pkarw/beavers-city`: pure Canvas 2D, procedurally-drawn vector shapes (no image assets), isometric grid perspective, noise-based organic variation so no two trees look identical.
- **Palette/brand kept** from our own Neo-Steampunk Cherry lore (`docs/game-design/lore/game-lore.md`): brass, tarnished copper, glowing ruby reds, deep atmospheric shadows, small mechanical/gear accents — explicitly NOT Beavers City's own cartoon palette.
- Decision explicitly rejected two other options: (a) full pivot to Beavers City's own cozy/cartoon aesthetic, (b) keeping the current top-down camera and just improving the rendering technique in place. The isometric grid was chosen partly because it scales toward the future geography roadmap (Phase 5: parcel → gmina → powiat → województwo).

## Reference Points

- `github.com/pkarw/beavers-city` — Canvas 2D procedural rendering technique, isometric perspective, MIT licensed
- Our own Rankings (`RankingsPanel.tsx`) and Imperial Pool (`AuctionDashboard.tsx`) screens — already Neo-Steampunk styled and rated highest in the UX audit; the palette/brand bar to match, not replace
- `tmp/clip.png` — AI-generated mood-board concept art for the 4 Marketplace buildings (Cold Storage, Processing Plant, Social Facilities, Warehouse) and several machines/workers, in a vivid saturated palette (teal/emerald metallic panels, hot pink/magenta accents, gold/copper trim, neon glow). Flagged by the user (2026-08-03) as the direction to steal from after the shipped Neo-Steampunk palette read as "przerażająco mdła" (terrifyingly dull/flat, too much brown/ochre) in practice — driving sketch 003.

## Sketches

| # | Name | Design Question | Winner | Tags |
|---|------|----------------|--------|------|
| 001 | orchard-isometric-trees | Does procedural Canvas 2D tree rendering in an isometric multi-parcel grid, styled in Neo-Steampunk palette, read clearly at both desktop and mobile sizes — and which of 3 tree-rendering styles fits best? | **A — Geometric Brass** (final, 2026-07-30) | orchard, canvas, isometric, trees |
| 002 | machines-and-workers | What style should farm machines (tractor/spreader/harvester/pruner) and a redesigned Canvas 2D worker sprite use — extend Geometric Brass, go literal steampunk, or pivot friendlier/toy-geometric? | *pending user review* | machines, workers, orchard, canvas |
| 003 | building-palette | Does a more saturated, cooler-plus-neon palette (per `tmp/clip.png`) read as more alive for the 4 Marketplace buildings without abandoning the game's mechanical/brass identity entirely — teal/magenta reskin, brass-as-trim jewel tones, or gunmetal+neon? | *pending user review* | buildings, palette, color, canvas, isometric, marketplace |
