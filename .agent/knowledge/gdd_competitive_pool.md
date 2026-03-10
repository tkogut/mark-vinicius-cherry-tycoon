# GDD Addendum: The Competitive Pool & Contractual Obligations 

## 1. Vision & Core Concept
The "Competitive Pool" is the heart of the game's market strategy. It moves away from simple selling to a high-stakes business simulation. The system introduces two distinct risk/reward windows: **Pre-Season Futures** (Security) and **Post-Harvest Auctions** (Competition).

**Objective:** Force the player to manage harvest risks against price volatility while competing with AI rivals (Marek, Kasia, Hans).

---

## 2. Dual-Window Contract System

### A. Pre-Season Futures (Phases 1-2: #Planning)
* **The "Security Play":** Players commit to delivering a specific volume *before* the crop is grown.
* **Pricing:** Fixed "Locked-in" price based on current `ForecastReport` minus a 5-10% security discount.
* **Risk:** If the player fails to deliver the promised volume due to frost, pests, or poor management, they face **Contractual Penalties**.

### B. Post-Harvest Auctions (Phase 9: #Market)
* **The "Competitive Play":** Lidding for contracts using actual stock currently held in `#Storage`.
* **Mechanism:** Closed-bid auction against AI rivals for limited high-value "Imperial Contracts."
* **Pricing:** Potential for 120-150% of base market value, but subject to AI undercutting and **Market Saturation** (The Flood Factor).

---

## 3. Shortfall Logic & Contractual Penalties
If a player signs a **Pre-Season Future** and fails to deliver the contracted volume by Phase 9, the following "Iron Contract" rules apply:

### I. Automatic Market Buyback (Phase 9 Resolution)
The system automatically attempts to fulfill the contract by purchasing missing volume from the local market to protect the Patron's reputation.
* **Buyback Cost:** `Spot Market Price * 1.25` (25% Urgent Premium).
* **Execution:** The cost is deducted directly from the player’s cash balance. 
* **Logic:** The player effectively buys cherries from their rivals at a premium to give them to the Imperial Buyer.

### II. Financial Default Penalty
If the player lacks the cash for a "Market Buyback," they are declared in **Contractual Default**:
* **Penalty Rate:** 150% of the value of the undelivered goods is recorded as a debt.
* **Debt Handling:** This amount is deducted from any current season profits. If profits are insufficient, the player's cash balance can go negative (representing a bank loan with high interest).

### III. Prestige & Reputation Hit
* **Reliability Score:** Every failed contract reduces `LocalReputation` and `GlobalPrestige` by a fixed percentage (e.g., -10%).
* **Future Impact:** Lower prestige makes winning future auctions significantly harder ($V_{bid}$ multiplier drops).

---

## 4. The Auction Resolution Formula ($V_{bid}$)
For Post-Harvest Auctions, the engine uses the **Attractiveness Score** to determine winners:

$$V_{bid} = (P_{base} - P_{offer}) \times (1 + \frac{Prestige}{1000}) \times QualityBonus$$

* **Prestige:** Sum of Global and Local (Patron) reputation.
* **Quality Bonus:** 1.2x (as `* 120 / 100`) for Organic certified crops in Bio-contracts.
* **Winner-Take-All:** The highest score wins. In high-volume contracts, the remaining volume may trickle down to the 2nd and 3rd place bidders.

---

## 5. AI Rivalry Archetypes (Bidding Behavior)
* **Marek (Volume King):** Lowers prices aggressively in Phase 9 to force players into the "Spot Market" trap. He rarely takes Pre-Season risks.
* **Kasia (Bio-Queen):** Focuses on Pre-Season Futures for Organic goods, betting on her high quality to avoid penalties.
* **Hans (The Efficient):** Only bids when he has 120% of the required volume in storage. He waits for players to default, then sells them his surplus via the **Market Buyback** mechanism at a 25% profit.

---

## 6. Technical Implementation (Motoko/Backend)
* **Module:** `auction_logic.mo`
* **Validation:** All shortfall math must use `Int.abs()` and safe subtraction to prevent `Nat` underflow.
* **Spot Price Linkage:** Every ton sold outside of a contract (by player or AI) reduces the `SpotPrice` by 0.1% per unit (Saturation).
* **Fallback:** Players who lose auctions or default are forced into the **Spot Market (Phase 10)** with an additional 30% "Distress Sale" penalty.