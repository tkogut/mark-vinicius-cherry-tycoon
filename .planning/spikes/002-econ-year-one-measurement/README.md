# Spike 002: one year of the starter farm, measured on a local replica (2026-11-22)

Why: the owner saw a first-year report (costs 39,222 PLN, labour 74%) and a flat retail price per kg, and asked what drives them. Findings are ECON-17..20 in `.planning/REQUIREMENTS.md`.

Setup: `dfx start --background --clean`, `dfx deploy backend --mode reinstall --yes` before every run, starter farm (0.5 ha, 50 trees, 50,000 PLN). Nothing here is committed to the economy; it only reads.

- `year.py <none|Village|Standard|City>`: plays one year (hire, water, fertilize SyntheticStandard, harvest, sell half retail / half wholesale) and prints cash, costs and the seasonal reports.
- `volume.py <kg> <retail|wholesale>`: fresh farm, jumps to the Market phase (Autumn), sets the inventory with `debugSetInventory`, sells once, prints PLN/kg.

Results, one run each (yield varies by random weather, so compare structure, not totals):

| hire | upfront | harvested | harvest labour / kg | year costs | cash after year |
|---|---|---|---|---|---|
| none (Emergency) | 0 | 5,648 | 4 | 28,792 | 53,226 |
| Village | 500 | 9,720 | 1 | 15,920 | 88,495 |
| Standard | 1,500 | 7,273 | 2 | 20,746 | 68,926 |
| City | 3,000 | 6,355 | 3 | 25,265 | 57,057 |

Standard: 50,000 + 41,172 revenue - 20,746 costs - 1,500 hire = 68,926, so the hire fee is in cash and in no cost line.

Sale price per kg, Autumn, quality 77: retail 7.38 / 7.39 / 7.39 / 7.39 / 7.39 at 1 / 5 / 10 / 20 / 50 t; wholesale 3.77 / 3.80 / 3.84 / 3.96 / 3.96. Retail = 15 x 0.8 x 1.231 x 0.5 (market multiplier at its floor) = 7.39.

Not measured: Spring and Winter sales, spoilage when storing, several parcels, infrastructure that cuts labour, the weather noise itself.
