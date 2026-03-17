# GDD Addendum: The Sports Patron Module (District League / Okręgówka)- should remain paused until Manager decides to implement it

## 1. Vision & Core Concept
The player acts as a local benefactor (Patron) for a community football club in the Opole region. This serves as the ultimate **Prestige Sink**—a place where excess cherry profits are converted into **Local Reputation**, granting indirect economic and social power within the game world.

* **Setting:** Lower Polish leagues (Klasa Okręgowa / Klasa A).
* **Focus:** Local influence, rivalry with neighboring villages, and simple strategic management.

## 2. The Polish League Cycle (Autumn-Spring Sync)
The football season is asynchronous with the cherry tree biological cycle, ensuring player engagement during the orchard's dormant winter phases.

| Game Phase (Backend) | Orchard Season | Football League State | Patron Activity |
| :--- | :--- | :--- | :--- |
| **Phase 9-10 (#Market / #Storage)** | Autumn / Winter | **START: Autumn Round** | Season inauguration, matchday bonuses, building a league lead. |
| **Phase 1-2 (#Planning / #Procurement)** | Winter / Spring | **Winter Break** | **CRITICAL:** Transfer window, hiring coaches, scouting new talent. |
| **Phase 3-7 (#Investment / #Growth)** | Spring / Summer | **Spring Round** | The title race. Wins boost local worker morale in the orchard. |
| **Phase 8 (#Harvest)** | Peak Harvest | **SEASON FINALE** | Promotion/Relegation results. Massive Prestige and Reputation payoff. |

## 3. Progression Tiers (Investment Levels)

### Tier I: Kit Sponsor (Sponsor Strategiczny)
* **Cost:** Low (Annual flat fee).
* **Mechanic:** Funding kits and team travel expenses.
* **Benefit:** Steady, small gain in **Local Reputation**. 
* **Orchard Impact:** **-2% Labor Cost** (Local workers feel pride working for the club’s benefactor).

### Tier II: The "Bankroll" Patron (Mecenas)
* **Cost:** Medium (Match-winning bonuses + signing "Star" players from the region).
* **Mechanic:** High-stakes spending before "Derby" matches to increase win probability.
* **Benefit:** Sharp bursts of reputation and community favor.
* **Orchard Impact:** **+5% Negotiation Power** with local buyers (Marek/Kasia).

### Tier III: Club Owner (Właściciel)
* **Cost:** High (Club purchase + full operational budget + infrastructure).
* **Mechanic:** Full control over transfers, staff, and stadium upgrades (e.g., building a covered stand).
* **Benefit:** Absolute Prestige. The player becomes the "County Kingpin."
* **Orchard Impact:** Access to **"Patron Contracts"** (Exclusive high-margin export deals available only to top-tier patrons).

## 4. Simulation Logic: Team Power Index (TPI)
Match outcomes are calculated using the **Team Power Index (TPI)**:
$$TPI = \text{Base Squad Quality} + \text{Patron Investment Bonus} + \text{Manager Skill}$$

**Win Probability Formula:**
$$P(\text{Win}) = \frac{TPI_{Player}}{TPI_{Player} + TPI_{Opponent}} + \text{LuckFactor}$$

## 5. Event Archetypes (The "Okręgówka" Flavor)
* **"The Cousin's Wedding":** Your star striker attended a massive family wedding. **TPI -20%** for the next phase due to "lack of match fitness."
* **"The Referee's Dinner":** An opportunity to "sponsor a dinner" for league officials to avoid unfavorable calls (Ethical Dilemma).
* **"Local Hero Debut":** A teenager from your own village debuts. Massive reputation boost regardless of the score.

## 6. Reputation & Global Prestige Sync
Local Reputation is tracked in `patron_logic.mo` and integrated into the global `PrestigeScore`. 
* **Formula:** $Prestige_{Total} = Prestige_{Orchard} + (LocalReputation \times 1.5)$