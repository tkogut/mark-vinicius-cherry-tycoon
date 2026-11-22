# Plan 003: a market that reacts to supply and demand at every stage (ECON-21)

Status: decided 2026-11-22. **Delegated:** the owner asked a consilium (the mediator plus two Opus members, a cautious systems engineer and a bold game designer) to decide and to leave no questions. This is the ECON-13 precedent: balance numbers are Ask First, the owner made the consilium's decision binding. Nothing here is implemented yet.

## Why
Spike 002 measured that retail is 7.38-7.39 PLN/kg from 1 t to 50 t. Causes, all verified in code: AI supply is a fixed 133k kg x factor, so the market multiplier is pinned at its 0.5 floor in Autumn (Summer 0.42-0.67, random); the multiplier sees only the quantity of one call, so split selling wins (+37% in Winter, measured by formula); saturation is read before and written after a sale; the AI is re-rolled on every call with `Time.now()` (`main.mo:1382`), so no quote can match a sale. Sources: Patrician III (price integrated along a stock curve, read), Offworld Trading Company (one shared price, read), Civilization (visible, gradual AI scaling accepted, hidden rubber-banding read as cheating, read). Victoria 3 and OpenTTD were snippets only.

## The model (one rule for all four seasons and both channels)
- Marginal market multiplier at supply position x: `m(x) = clamp(D / (S0 + x), 0.5, 1.2)`.
- The price paid for a sale of q kg is the **average of m over [0, q]** (closed form, with the clamps), never a single quote.
- `S0 = A + B + s`: `A` AI supply, `B` local baseline, `s` kg this player already sold this season (both channels).
- `A = 0.6 x K x seasonFactor x draw`; seasonFactor Summer 1.15, Autumn 0.80, Spring/Winter 0 (unchanged); `draw` in [0.8, 1.2], seeded by the farm's `seasonNumber`, fixed for the season and shown to the player.
- `B = 0.25 x K`.
- `D = d_season x 7000 x (K/7000)^0.75` (sublinear: a bigger farm meets resistance, the late game is not solved). Initial `d_season` (to be tuned by the sweep, bounds below): Spring 0.795, Summer 0.77, Autumn 0.632, Winter 0.474.
- `K` = kg harvested in the player's most recent completed harvest (per player, because seasons are per farm), frozen until the next harvest, floor 5,000 kg. Before the first harvest `K = 7,000` (the measured starter harvest was 5.6-9.7 t). No lag, no parcel-based K (it can be inflated by `buyParcel`/`plantTrees`, and loops over all players).
- Wholesale uses the same multiplier and keeps its own volume bonus and 0.7 factor; ECON-18/20 stays a separate decision. Regional saturation is left as is.
- Floor 0.5 stays (continuity; `SECURITY_DIRECTIVE_V1` s2.5 only asks for bounds, `docs/security/security-directive-v1.md:71-77`). Ceiling 1.2 (not 1.0, so scarcity is rewarded; not 1.5, so storing is not the dominant strategy).

Spreadsheet preview (unmeasured, K = 7 t, q = K sold in one season, today's multiplier in brackets): Autumn 0.58 (0.50), Summer 0.58 (0.5), Spring 1.00 (1.00), Winter 0.74 (0.74). Dumping the crop in Autumn: +16% revenue. A perfect even split over four seasons: +39%.

## Acceptance gates (measured on a live replica; observed values go in the commit message)
1. A whole-crop dump (q = K) in any season is within -20% and +20% of today's measured price.
2. A perfect four-season split of the crop is at most +40% over today's Autumn dump.
3. Marginal price is non-increasing in q; total revenue is increasing in q; 70 sales of 100 kg pay at most 1% more than one sale of 7,000 kg (prove the guard by reverting `s` and watching it fail).
4. A fresh player (empty history, year 1) has `m(0)` at most 1.2 and AI supply above 0.
5. `s` and `K` survive an upgrade: deploy, populate, upgrade, read back (prove it by dropping the persistence and watching the test fail).
6. Floor and ceiling respected for K in {5, 7, 10, 20, 50, 200} t, all seasons.

## Rollout (one PR each, in this order)
- **PR0, no balance change:** seed the AI draw from `seasonNumber`; extract the multiplier and the sale price into one pure function; additive query `quoteSale(quantity, saleType)` (also ECON-14); SellModal uses it instead of its hardcoded AI constants; TS mirror and a parity test (none exists today for `computeMarketMultiplier`); measure today's realised multiplier per season at q = 0.1K, 0.5K, K.
- **PR1:** additive `stable var` per player (`K`, `s`, season key); `s` feeds the OLD formula, which already ends split selling; reset in `_advanceSeasonInternal`; upgrade test.
- **PR2:** the model above, K snapshot at harvest, AI scaling, sweep script over K x season x sell pattern, gates 1-6, guest-mode mirror (guest pays a flat 15 PLN/kg today).
- **PR3:** Market Board in SellModal from `quoteSale` (demand, AI / baseline / yours, curve with the slider, average price, last-kg price, price after the sale, the formula with every factor) and each AI's announced tonnage on the competitor cards.
- **Follow-up, not in this release:** Harvest Bulletin (a season-start dispatch built from the seeded AI draw).
- **Separate decisions, not in this plan:** ECON-18/20 (labour ladder, wholesale), ECON-22 (organic premium on conventional stock), ECON-23.

## Where the consilium disagreed and how it was settled
Ceiling 1.0 vs 1.5: settled at 1.2 (Spring today is 1.8x Autumn already; 1.5 would make storing dominant). AI lag: dropped (needs history and a feedback loop; K is already frozen between harvests). Linear vs sublinear demand: sublinear (linear makes prices scale-invariant). Wholesale: same multiplier, price-neutral within gate 1. One unit system for all seasons: adopted. Not verified by anyone: the exact `d_season`, `0.6`, `0.25` and the clamp values; the sweep tunes them inside the gates, and the final numbers are written back here.

## PR0 result (2026-11-22, branch `feat/econ-21-pr0-quote-sale`)
Done: the AI draw is seeded by `seasonNumber` (`entropyForSeason`); `computeSaleQuote` in `main.mo` is the one place a sale is priced, used by `sellCherries` and by the new additive query `quoteSale(quantity, saleType)` (`Types.SaleQuote`); `gameLogic.ts` mirrors the AI draw and the multiplier; the Sell modal no longer hardcodes the AI supply. No balance number changed except that the AI draw is now fixed per season instead of re-rolled per call.

Replica observation of today's market multiplier (retail, farm walked through seasonNumber 1..9; AI supply is now identical on every call):

| Season (seasonNumber) | AI supply kg | Demand kg | mult at 0.7 t / 3.5 t / 7 t |
|---|---|---|---|
| Spring (1, 5, 9) | 0 | 30,000 | 1.000 / 1.000 / 1.000 |
| Summer (2) | 162,100 | 80,000 | 0.500 / 0.500 / 0.500 |
| Summer (6) | 152,770 | 80,000 | 0.500 / 0.500 / 0.500 |
| Autumn (3) | 97,372 | 50,000 | 0.500 / 0.500 / 0.500 |
| Autumn (7) | 114,626 | 50,000 | 0.500 / 0.500 / 0.500 |
| Winter (4, 8) | 0 | 20,000 | 0.966 / 0.851 / 0.741 |

`quoteSale` equalled the `sellCherries` payout on every sale tried (retail 1,000 kg: 7,385 and 7,385; wholesale 3,750 and 3,750), three consecutive quotes in a season returned the same multiplier, and the second sale of 1,000 kg paid 1% less through the existing regional saturation (7,385 then 7,312). These are the "today" values that gate 1 of this plan compares against.

## PR1 result (2026-11-22, branch `feat/econ-21-pr1-season-sales`, stacked on PR0)
**Deviation from the plan, on purpose:** PR1 was written as "`s` feeds the old formula". Pricing a sale at the endpoint multiplier `m(s + q)` with `s` included still lets a player split (the early pieces are priced higher than the endpoint): a spreadsheet check gave about +16% in Winter. So PR1 prices the sale as the **average of the old marginal curve** over `(s, s + q]` (`integratedMarketMultiplier`, closed form), which is additive and ends splitting exactly. The curve itself (floor 0.5, ceiling 1.0, today's constants) is unchanged; the model swap stays in PR2.

Done: additive `stable var stableSeasonSales` (player -> (season number, kg)) with a runtime map; the count applies only while its season number equals the farm's, so it resets itself and needs no hook in the season advance; `sellCherries` and `quoteSale` read it, `sellCherries` writes it (both channels); `SaleQuote.soldThisSeasonKg`; TS mirror `integratedMarketMultiplier`; the Sell modal uses the canister's own quote (`useSaleQuote`) for signed-in players and keeps the estimate for guests.

Balance effect: only where the old curve is not at its floor or cap. Summer and Autumn (floor 0.5) and Spring (cap 1.0 up to 10 t) are unchanged. Winter pays more for a large sale: a 7 t dump moves from 0.741 to 0.857 (+15.7%, inside gate 1's +20%).

Replica (local): Winter retail, 7 t, one sale 66,497 PLN versus 70 sales of 100 kg 65,374 (-1.7%, the regional saturation each piece adds); Autumn 51,701 versus 50,775. Guard broken (counter never written): the Winter split pays 75,991 (+14.3% over the dump). `s` survived an upgrade (`--upgrade-unchanged`): 600 kg before, 600 kg after; with the `preupgrade` line commented out it came back 0.

## PR2 result (2026-11-22, branch `feat/econ-21-pr2-model`, stacked on PR1): the model is live
Done: `K` per player from the latest harvest (additive `stable var stableMarketScale`, written by `harvestCherries`, floor 5,000, 7,000 before the first harvest); AI supply `0.6 x K x seasonFactor x sum(w_i x draw_i)` with a per-AI draw in [0.8, 1.2] seeded by the season number; baseline `0.25 K`; demand `d_season x 7000 x (K/7000)^0.75`; marginal multiplier clamped to **[0.5, 1.2]**; the sale pays the average over the player's cumulative kg (PR1). `SaleQuote` gains `marketScaleKg` and its `baselineKg` is now real. `gameLogic.ts` mirrors all of it; guest mode is priced by the same functions (no more flat 15 PLN/kg; ECON-23 closed). The old `getAITotalSupply` / `getSeasonDemand` / `computeMarketMultiplier` stay in `competitor_logic.mo` because `main_mainnet.mo` (Track B) and the auction code still call them.

**Constants as tuned (the sweep, `sweep.py` in the PR description; unmeasured before):** `d_season` Spring 0.795, Summer 0.707, Autumn 0.59, Winter 0.474; AI share 0.6; baseline 0.25; exponent 0.75; floor 0.5; ceiling 1.2. The first Summer/Autumn values (0.77 / 0.632) put the dump at 0.633 when all three AIs draw -20%, over gate 1's 0.6; they were lowered until the worst draw sat at 0.595.

**Gate results.**
1. Dump of q = K = 7 t, price per kg on the replica, before (master) -> now: Spring 13.3 -> 13.6 (+2%), Summer 8.5 -> 9.4 (+10%), Autumn 7.4 -> 8.4 (+13.5%), Winter 8.2 -> 8.2 (0%). Inside +-20%, also at the extreme AI draws (unit test).
2. Even four-season split vs the same split before: 1.31 by hand and 1.34 with the Python sweep (which used the Winter 7 t value as its baseline, a little conservative); limit 1.40. Clarification of the gate text: the baseline is the *same split* priced by the old curve, not the Autumn dump.
3. 70 x 100 kg vs one 7,000 kg on the replica: Spring 93,816 vs 95,305, Summer 64,448 vs 65,554, Autumn 57,713 vs 58,672, Winter 56,551 vs 57,387 (-1.3% to -1.7%, the regional saturation each piece adds). Never above the dump.
4. Fresh player, K = 7,000: AI supply Summer 5,242 and Autumn 3,164 kg (> 0); `m(0)` Spring/Winter 1.2, Summer 0.76, Autumn 0.82 (never above 1.2).
5. `K` after a harvest of 5,934 kg is 5,934 before and after `--upgrade-unchanged`. Harvest not recorded (mutation) -> K stays 7,000 after a 4,995 kg harvest; `preupgrade` line removed (mutation) -> K 9,450 before, 7,000 after.
6. Unit test: [0.5, 1.2] and non-increasing in volume for K in {5, 7, 10, 20, 50, 200} t, all four seasons; a bigger K meets resistance (the dump price falls as K grows). The multipliers in the replica quote agree with the Python model to 0.0002.

Not verified: Playground/browser (the Sell modal's new numbers were not looked at), wholesale at scale, the +15% Processing Facility under the new curve, the Harvest Bulletin (follow-up).
