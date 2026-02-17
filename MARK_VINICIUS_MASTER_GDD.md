# 🍒 Mark Vinicius Cherry Tycoon – Master GDD (V 2.2)
**Producer:** JaPiTo Group  
**Lead Strategist:** Tomasz (tkogut)  
**Platform:** Internet Computer Protocol (ICP)  
**Architecture:** Independent Local Development (dfx/dfxvm)

---

## 1. Executive Summary
Mark Vinicius Cherry Tycoon is a next-gen, blockchain-native farming and sports management tycoon. Players build an agricultural empire in Poland (starting with the Opole region), competing against both sophisticated AI rivals and other players in a shared, dynamic on-chain economy.

---

## 2. Technical Stack
- **Backend:** Motoko (Stable Partitioning / Persistent Actors - EOP).
- **Frontend:** React 18 + TypeScript + Tailwind CSS.
- **Authentication:** Internet Identity (II).
- **Asset Generation:** Full autonomy via Google Ecosystem (Antigravity, Vertex AI, Nano Banana).
- **Animation Engine:** Lottie (JSON) + SVG Morphing + CSS Particle Effects.

---

## 3. Geographical Engine: The Opole DNA
The world model starts with **Opole Province (Województwo Opolskie)**. It is divided into 12 distinct counties (Powiaty). Future scalability to all 16 Polish provinces is mandatory.

### 3.1. Regional Multipliers Table
| ID | County | Soil Type | Fertility | pH Range | Special Attribute |
|:--- |:--- |:--- |:--- |:--- |:--- |
| **OP_CITY** | Opole | Sandy-Clay | 1.05 | 6.0–6.5 | Huge retail market (+20% price) |
| **NY_01** | Nysa | Humus | 1.20 | 6.5–7.0 | High productivity, land price +15% |
| **GL_02** | Głubczyce | Heavy Clay | 1.35 | 6.8–7.2 | "The Granary": Max yield potential |
| **BR_03** | Brzeg | Sandy-Clay | 1.10 | 6.2–6.8 | Optimal for Organic Certification |
| **NA_04** | Namysłów | Sandy | 0.80 | 5.5–6.0 | Cheap land, fertilizer cost +20% |
| **KL_05** | Kluczbork | Sandy-Clay | 0.95 | 5.8–6.3 | Low pest risk |
| **OL_06** | Olesno | Sandy-Clay | 0.90 | 6.0–6.5 | Stable water retention |
| **KR_07** | Krapkowice | Clay-Sandy | 1.15 | 6.5–7.0 | Industrial efficiency bonus |
| **KK_08** | Kędzierzyn | Industrial | 1.00 | 6.0–7.0 | Rapid infrastructure builds |
| **ST_09** | Strzelce Op. | Rocky | 0.85 | 6.5–7.5 | Hard land, drought resistance +30% |
| **PR_10** | Prudnik | Mountain Clay | 1.10 | 6.5–7.0 | High weather volatility |

---

## 4. Gameplay Loop: The "Living World" Simulation
The game operates in a **Turn-Based Seasonal Cycle** consisting of 4 distinct phases.

### 4.1. The Four Phases
1. **Preparation (Pre-Season):** Hiring workers, procurement of fertilizers, buying land/infrastructure.
2. **Growth (The Risk Phase):** Random weather events (Frost, Drought). Decision point: Use protective sprays or irrigation?
3. **Harvest (The Yield Phase):** Labor allocation. Yield calculated via DNA + Weather + Quality Score.
4. **Sales & Off-Season:** Market trading, storage decisions, and reinvesting into **Football Clubs**.

---

## 5. Competition & Shared World

### 5.1. AI Rivals (The "Neighbors")
Three persistent AI archetypes operate in the same economy:
- **Marek "The Traditionalist":** Focuses on mass-production in Głubczyce. Crashes wholesale prices.
- **Kasia "The Eco-Visionary":** 100% Organic player in Brzeg. Competes for retail prestige.
- **Hans "The Aggressor":** High-tech scaler. Outbids players for premium export contracts.

### 5.2. Multiplayer Foundation
- **Shared Market:** `Current_Price = Base_Price * (SeasonalDemand / (Total_Supply))`.
- `Total_Supply = Player_Supply + AI_Supply + Global_Multiplayer_Supply`.

---

## 6. Monetization & Microtransactions
Prepare the backend for "CHERRY Credits" (ICP-linked).

### 6.1. Consumables & Boosts
- **Bio-Stimulant:** Skip 1 season of growth.
- **Cloud Summoner:** Instant 100% hydration for all parcels.
- **Pest Shield:** Protection from diseases for 3 seasons.
- **Legal Loophole:** Instant Organic Certification (bypasses 2-season wait).

### 6.2. Strategic Map Expansions (Purchasable Content)
New regions and content available for purchase via microtransactions:
- **Province Expansion Packs:** Unlock Silesia, Lower Silesia, Masovia, etc.
- **Unique Soil Maps:** Special event maps with extreme multipliers or alien soil types.
- **Country Packs:** Future capability to unlock other countries (e.g., Vietnam, Brazil) as premium "Export Hubs".

---

## 7. Global Localization (Multi-Language)
The game must support internationalization (i18n) for the following Web3 and mobile-gaming heavy regions:
- **Europe:** English, Polish, Spanish, Portuguese, German.
- **Asia-Pacific:** Vietnamese, Thai, Indonesian, Korean, Japanese, Chinese (Simplified).
- **South America:** Portuguese (BR), Spanish (LATAM).

---

## 8. Visuals & Modern Mobile Experience
Leverage **Antigravity/Google Nano Banana** for "juicy" assets.

### 8.1. Animation Requirements
- **Growth Morphing:** Smooth SVG/CSS transitions of tree growth (no static jumps).
- **Particle Bursts:** Cherry icons "flying" into the inventory upon harvest.
- **Interactive UI:** "Juice Meter" for hydration (bubbling effect), tactile feedback on all buttons.
- **Dynamic Themes:** UI colors change according to the season (White for Winter, Gold for Autumn).

---

## 9. Development Directives (No Improvisation)
1. **Purge Caffeine:** All legacy Caffeine AI code comments and mentions must be deleted.
2. **JaPiTo Brand:** All system messages and branding must reflect "Produced by JaPiTo Group".
3. **Type Safety:** Strict `Principal` usage for IDs. No loose `Text` strings for player identification.
4. **Testing:** Every backend function must be verified via the `test-backend.ps1` script.

---

**Producer Approval:** JaPiTo Group Management  
***
