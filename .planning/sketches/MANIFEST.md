# Sketch Manifest

## Design Direction

Hybrid visual direction for the cherry orchard/farm-plot view, replacing the current CSS-blur "fake metaball" tree rendering (`frontend/src/components/farm/ImperialOrchard.tsx`), decided after a live Playground UX audit (`docs/game-design/UX-AUDIT-2026-07-29.md`) and a deliberate creative-direction discussion:

- **Technique** borrowed from `github.com/pkarw/beavers-city`: pure Canvas 2D, procedurally-drawn vector shapes (no image assets), isometric grid perspective, noise-based organic variation so no two trees look identical.
- **Palette/brand kept** from our own Neo-Steampunk Cherry lore (`docs/game-design/lore/game-lore.md`): brass, tarnished copper, glowing ruby reds, deep atmospheric shadows, small mechanical/gear accents — explicitly NOT Beavers City's own cartoon palette.
- Decision explicitly rejected two other options: (a) full pivot to Beavers City's own cozy/cartoon aesthetic, (b) keeping the current top-down camera and just improving the rendering technique in place. The isometric grid was chosen partly because it scales toward the future geography roadmap (Phase 5: parcel → gmina → powiat → województwo).

## Reference Points

- `github.com/pkarw/beavers-city` — Canvas 2D procedural rendering technique, isometric perspective, MIT licensed
- Our own Rankings (`RankingsPanel.tsx`) and Imperial Pool (`AuctionDashboard.tsx`) screens — already Neo-Steampunk styled and rated highest in the UX audit; the palette/brand bar to match, not replace

## Sketches

| # | Name | Design Question | Winner | Tags |
|---|------|----------------|--------|------|
| 001 | orchard-isometric-trees | Does procedural Canvas 2D tree rendering in an isometric multi-parcel grid, styled in Neo-Steampunk palette, read clearly at both desktop and mobile sizes — and which of 3 tree-rendering styles fits best? | **A — Geometric Brass** (final, 2026-07-30) | orchard, canvas, isometric, trees |
