---
sketch: 003
name: building-palette
question: "Does a more saturated, cooler-plus-neon palette read as more alive without abandoning the game's mechanical/brass identity entirely — and if so, how far should the swap go (full teal/magenta reskin, brass-as-trim-only jewel tones, or a darker gunmetal+neon direction)?"
winner: null
tags: [buildings, palette, color, canvas, isometric, marketplace]
---

# Sketch 003: Building Palette

## Design Question

The user flagged the shipped Neo-Steampunk palette (brass `#b8860b`, copper
`#b87333`, ruby `#9b111e`, dark brown/ochre backgrounds) as "przerażająco
mdła" — terrifyingly dull/flat, too much brown, too much yellow/ochre — and
pointed at a mood-board reference (`tmp/clip.png`, AI-generated concept art
for the same four buildings) as the direction to steal from: saturated teal/
emerald metallic panels, hot pink/magenta accents, gold/copper trim, neon
glow highlights.

This sketch previews 3 palette directions for the "Main Assets & Buildings"
Marketplace category — Warehouse, Cold Storage, Processing Plant, Social
Facilities — rendered as Canvas 2D procedural isometric building models in
the same faceted low-poly technical style as sketch 002's machines (angular
panels, gradients, small gear/rivet accents), reusing sketch 002's
`gearRivet`/pipe-connector visual language.

**Important:** the four building *shapes* are byte-for-byte identical across
all three variants (same `drawWarehouse`/`drawColdStorage`/
`drawProcessingPlant`/`drawSocialFacilities` functions, only the palette
object passed in differs). This keeps the comparison an honest
"same building, different colors" test rather than conflating a shape
decision with a color decision.

## How to View

```
open .planning/sketches/003-building-palette/index.html
```
(A local static server, e.g. `python3 -m http.server`, is needed if your
browser blocks canvas/file:// rendering quirks — plain `file://` also works
for this sketch since there are no fetch calls.)

## Variants

- **A: Teal & Magenta Neon** — lifted fairly directly from `tmp/clip.png`.
  Teal/emerald metallic body panels, hot pink/magenta window and door glass,
  gold trim/rivets, soft neon glow on pipes and windows. Highest contrast
  against the current theme; closest to the mood board.
- **B: Jewel-Tone Brass** — keeps the existing brass/gold identity but demotes
  it to trim/rivets/mechanical detail only. Body panels swap the muddy
  dark-brown/ochre base for saturated jewel tones, one gem per building
  (emerald Warehouse, sapphire Cold Storage, garnet Processing Plant,
  amethyst Social Facilities) so each building also gets a secondary
  color-identity cue. Warm amber/lantern window glow instead of magenta,
  to stay closer to the current mood.
- **C: Gunmetal Neon** — a third, more distinct direction: near-black
  gunmetal body panels (not colored metal at all) with saturated neon piping/
  glow doing all the color work — green coolant lines on Cold Storage,
  magenta conveyor glow on the Processing Plant, cyan lantern string on
  Social Facilities, hot-pink door-seam lighting on the Warehouse. Brass
  survives only as rivets. Darker and more nocturnal than A or B.

## Revision 2 (2026-08-03) — shapes redrawn bigger and richer

The first pass rendered every building small and thin against a mostly-empty
canvas, with flat single-tone faces and tiny glow-dot "windows" — it read as
a sparse icon set next to `tmp/clip.png`'s chunky, richly-detailed assets,
and the user said so directly ("bardzo mocno odbiega od tego czego
oczekiwałem" — deviates strongly from what I expected). Reworked variants A
and B (focus per user request; C inherits the same shape code but wasn't
separately reviewed):

- Canvas bumped 240×230 → 300×300 and every building's box/tank/roof
  dimensions enlarged ~30-40% — buildings now fill most of the frame instead
  of floating in empty space.
- Tiny `glowDot` "windows" replaced with large rectangular/diamond glass
  **panels** (`glassPanel()`) with a 3-stop gradient and a reflective corner
  highlight — the mood board's signature big saturated window is now
  actually legible, not a pinprick.
- Flat single-color box faces replaced with 3-stop gradients + a visible
  highlight streak (`drawIsoBoxRich()`/`faceGrad()`) on every face, including
  the roof.
- Processing Plant's roof gears roughly doubled in radius (13/9 → 22/15) to
  match the mood board's prominent gear-roof; added visible crate icons
  riding the conveyor instead of plain glow dots.
- Cold Storage rebuilt so the faceted tank IS most of the building (each of
  the 8 facets is its own lit/shadowed gradient panel) rather than a small
  cap perched on a separate box — much closer to the reference silhouette.
- Social Facilities' thin corner posts kept, but the open sides now carry
  big diamond-shaped pink/gem glass panels (the reference's signature side
  walls) plus a small reflective pool facet at the front of the deck.
- Warehouse's doors and corner windows enlarged and given the same
  gradient/highlight treatment; crates enlarged with a ribbon-tie accent line.

## Per-Building Shape Notes (shared across all variants)

- **Warehouse** ("basic storage") — gabled-roof isometric barn body, gold/
  trim double doors on the lit face, a small stack of crates beside it.
- **Cold Storage** ("climate-controlled storage") — shorter body topped with
  a faceted hexagonal tank, coolant pipes running down both sides to the
  ground, a frost/vent glow dot on the front face.
- **Processing Plant** ("on-site sorting and cleaning") — body with a roof
  cupola carrying two overlapping faceted gears (mood-board gear-roof cue), a
  chimney pipe, and a sloped conveyor ramp with glowing rollers off the front
  face.
- **Social Facilities** ("better conditions for seasonal workers") — open
  pagoda-style structure: slim corner posts instead of solid walls, a wide
  ornate gabled roof, a row of hanging lantern-glow dots under the eaves, and
  two small low-poly garden/bush facets at the base as a communal-gathering
  cue.

## What to Look For

- Does the winning palette actually fix the "dull/flat" complaint, or does it
  just swap one dull palette for a differently-dull one (variant C's risk)?
- Do the 4 buildings stay clearly distinguishable by silhouette alone (hex
  tank / gear roof + conveyor / open pagoda / gabled barn), independent of
  color — i.e. is the shape language already doing enough work?
- Does the chosen direction still feel coherent with the rest of the shipped
  Neo-Steampunk UI (Rankings, Imperial Pool), or does it read as an
  unrelated reskin?
- If a variant wins, its palette should be promoted into a new
  `.planning/sketches/themes/vivid-orchard.css` (or similar) reusable theme
  file, following `neo-steampunk.css`'s structure — not done yet in this
  sketch since no winner has been picked.
- This is a **preview-only, palette-and-mood** sketch — no variant has been
  ported into any real building-rendering code yet.
