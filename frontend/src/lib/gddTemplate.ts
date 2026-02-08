export interface GddSection {
  id: string;
  title: string;
  content: string;
  isPlanDependent?: boolean;
}

export const PLAN_INPUT_NEEDED = '[Plan Input Needed]';

export const gddTemplate: GddSection[] = [
  {
    id: 'executive-summary',
    title: 'Executive Summary',
    content: `Mark Vinicius Cherry Tycoon is a mobile-first browser-based simulation game that uniquely combines farming management with sports team management in a tycoon framework.

**Game Concept**: Players manage cherry orchards in Poland while simultaneously building and managing a football club. Agricultural profits fund team operations, while team success unlocks farming opportunities, creating a unique dual-loop tycoon experience.

**Target Platform**: Mobile-first web browser (responsive design for all devices), hosted entirely on the Internet Computer blockchain.

**Core Appeal**: Players cultivate cherry orchards while simultaneously managing a football club, creating a unique dual-loop tycoon experience where agricultural success fuels athletic achievement.

**Starting Location**: Opole Voivodeship, Poland - a balanced region ideal for learning core mechanics before expanding to other provinces.

**Monetization**: Free-to-play with optional premium features and web3 integration for true asset ownership.`,
    isPlanDependent: false,
  },
  {
    id: 'pillars-usp',
    title: 'Core Pillars & Unique Selling Proposition',
    content: `**Core Pillars**:
1. **Dual Management**: Seamlessly blend farming simulation with football club management
2. **Strategic Depth**: Resource allocation between farm and team creates meaningful choices
3. **Progressive Mastery**: Deep systems that reward long-term planning and optimization
4. **Mobile-First Design**: Touch-optimized interface designed for on-the-go play
5. **Web3 Ownership**: Optional true ownership of in-game assets via Internet Computer
6. **Geographic Authenticity**: Real Polish administrative structure (Voivodeships → Counties → Communes)

**Unique Selling Proposition**:
The only game that combines cherry farming with football club management in authentic Polish geography, where your agricultural success directly impacts your team's performance. Build your cherry empire across Poland's regions, fund your dream team, and compete for glory in both fields.

**Differentiation**: 
- Realistic farming economics with detailed cost structures (fixed, variable, CAPEX)
- Authentic Polish geography and terminology
- Meaningful choice between retail and wholesale sales strategies
- Two-season organic farming conversion with real risks and rewards
- AI competition affecting market dynamics and pricing`,
    isPlanDependent: false,
  },
  {
    id: 'target-audience',
    title: 'Target Audience & Platforms',
    content: `**Primary Audience**:
- Age: 18-45
- Demographics: Casual to mid-core gamers interested in simulation and management games
- Psychographics: Players who enjoy strategic planning, resource optimization, and progression systems
- Gaming Preferences: Fans of farming sims (Stardew Valley, Hay Day) and sports management games (Football Manager)
- Geographic Focus: Polish players and European simulation game enthusiasts

**Secondary Audience**:
- Web3 enthusiasts interested in true digital ownership
- Competitive players seeking leaderboard rankings
- Social players who enjoy cooperative/competitive elements
- Strategy gamers who appreciate economic depth

**Platform Strategy**:
- **Primary**: Mobile web browsers (iOS Safari, Android Chrome)
- **Secondary**: Desktop web browsers
- **Technical**: Progressive Web App (PWA) for app-like experience
- **Distribution**: Direct web access via Internet Computer, no app store dependencies

**Accessibility**: 
- English UI with Polish terminology preserved for authenticity
- Touch-optimized controls (44x44pt minimum tap targets)
- Color-blind friendly palette
- Scalable text sizes
- Tutorial system with contextual help`,
    isPlanDependent: false,
  },
  {
    id: 'core-loops',
    title: 'Core Game Loops',
    content: `**Micro Loop (Session: 5-15 minutes)**:
1. Check farm status and harvest ready crops
2. Plant new cherry trees/manage existing orchards
3. Review team status and assign training
4. Participate in quick match or training session
5. Collect rewards and allocate resources
6. Make immediate upgrade decisions (infrastructure, players)

**Macro Loop (Daily)**:
1. Complete daily farming cycle (plant → water → harvest)
2. Manage team roster and player development
3. Compete in scheduled matches
4. Participate in daily events
5. Progress through season objectives
6. Optimize farm-to-team resource pipeline
7. Monitor AI competitor activity and market prices

**Meta Loop (Weekly/Seasonal)**:
1. Complete seasonal farming cycles (4 seasons per year)
2. Advance through football league tiers
3. Unlock new farm areas (communes, counties, voivodeships)
4. Participate in special events and tournaments
5. Achieve long-term progression milestones
6. Engage with live ops content
7. Consider organic farming conversion for select parcels

**Interconnection**: Farm production generates PLN → PLN funds team operations (salaries, facilities, training) → Team success unlocks farm upgrades and new regions → Enhanced farm increases resource generation → Cycle continues with geographic expansion`,
    isPlanDependent: false,
  },
  {
    id: 'farming-systems',
    title: 'Farming Systems',
    content: `**Parcel Attributes & Yield Potential**:

Each parcel has specific characteristics affecting production:

**Soil Types** (Polish terminology):
- \`piaszczysto-gliniasta\` (sandy-clay): 0.85× yield modifier
- \`gliniasta\` (clay): 1.0× yield modifier (optimal)
- \`piaszczysta\` (sandy): 0.7× yield modifier
- \`podmokla\` (waterlogged): 0.6× yield modifier

**pH Levels** (Range: 5.5 - 7.5):
- Optimal pH: 6.5 (1.0× modifier)
- Suboptimal: Modifier = 1 - (|pH - 6.5| × 0.15)
- Critical: pH < 5.5 or > 7.5 = 0.5× modifier

**Fertility Levels**:
- Low (0-30%): 0.6× modifier
- Medium (31-60%): 0.8× modifier
- High (61-85%): 1.0× modifier
- Very High (86-100%): 1.2× modifier

**Infrastructure Upgrades**:
- No infrastructure: 1.0× modifier
- Basic irrigation: 1.15× modifier (25,000 PLN, 10 seasons lifespan)
- Advanced irrigation + greenhouse: 1.35× modifier (105,000 PLN total)
- Full automation: 1.5× modifier (255,000 PLN total, reduces labor costs by 30%)

**Yield Potential Formula**:
\`\`\`
PP = Base_Yield_ha × Soil_Modifier × pH_Modifier × Fertility_Modifier × Infrastructure_Modifier × Parcel_Size_ha
\`\`\`

Where:
- Base_Yield_ha = 8,000 kg/ha (cherry orchards)
- Parcel_Size_ha = 0.5 to 5.0 hectares

**Example**: 2.0 ha parcel, gliniasta soil (1.0), pH 6.5 (1.0), high fertility (1.0), basic irrigation (1.15)
→ PP = 8,000 × 1.0 × 1.0 × 1.0 × 1.15 × 2.0 = **18,400 kg per season**

**Sales Strategies**:

**Retail Sales** (unlocks at Level 5):
- Price: 12 PLN/kg
- Quality bonus: 1.0× to 1.5× based on parcel quality
- Capacity limit: 30% of yield maximum
- Requires time investment (selling in batches)
- Formula: \`Profit_Retail = (Yield × 12 PLN × Quality_Bonus) - Total_Costs\`

**Wholesale Sales** (available from start):
- Price: 6 PLN/kg
- Instant sale, unlimited capacity
- Lower profit but immediate liquidity
- Formula: \`Profit_Wholesale = (Yield × 6 PLN) - Total_Costs\`

**Optimal Strategy**: Sell 30% retail, 70% wholesale for balanced profit and cash flow.

**Cost Structure**:

**Fixed Costs** (per hectare per season):
- Land lease: 2,000 PLN
- Insurance: 1,500 PLN
- Basic maintenance: 800 PLN
- **Total: 4,300 PLN/ha/season**

**Variable Costs** (per kg of yield):
- Fertilizer: 0.80 PLN
- Pest control: 0.50 PLN
- Water/irrigation: 0.40 PLN
- Harvest labor: 1.20 PLN
- Packaging (retail only): +0.60 PLN
- **Total: 2.90 PLN/kg (wholesale), 3.50 PLN/kg (retail)**

**CAPEX** (Capital Expenditures):
- Basic Irrigation: 25,000 PLN (10 seasons, +15% yield)
- Greenhouse: 80,000 PLN (20 seasons, +20% yield, weather protection)
- Automation: 150,000 PLN (15 seasons, +15% yield, -30% labor costs)
- Storage Facility: 50,000 PLN (25 seasons, enables retail sales)
- Tree Planting: 60,000 PLN/ha (400 trees/ha, 40 season lifespan, full production by Season 3)

**Weather & Quality**:
- 4 seasons per year (Spring, Summer, Autumn, Winter)
- Random events: Drought (-20%), Frost (-30%), Hail (-40%), Perfect (+10%)
- Quality tiers: Common (base), Good (+10% price), Excellent (+25%), Premium (+50%, organic only)

**Farm Progression**:
- Start: 1 parcel in chosen commune (Opole County)
- Level 10: Unlock adjacent communes
- Level 25: Unlock new counties (after 50% market dominance)
- Level 50: Unlock new voivodeships (after winning Provincial League)`,
    isPlanDependent: false,
  },
  {
    id: 'competition-mechanics',
    title: 'Competition & Market Dynamics',
    content: `## Shared Market Mechanics

All players and AI competitors participate in a unified regional market where supply and demand dynamically affect prices. This creates a competitive environment where every farmer's decisions impact the entire economy.

**Market Structure**:
- 20 AI competitors per region (starting in Opole Province)
- Each AI has randomized parcels (0.5-3.0 ha) with varying quality
- AI production affects market prices dynamically
- Shared market pool: All sales (player + AI) contribute to regional supply
- Market updates occur at the end of each season (every 7 real-time days)

**How Player and AI Supply Affects Prices**:

The market operates on a dynamic supply-demand model where total regional production (player + all AI competitors) directly impacts wholesale and retail prices:

**Price Adjustment Formula**:
\`\`\`
Market_Price = Base_Price × (1 - Supply_Pressure)
Supply_Pressure = ((Total_Regional_Supply / Regional_Demand) - 1.0) × 0.3
\`\`\`

Where:
- **Base_Price**: 6 PLN/kg (wholesale) or 12 PLN/kg (retail)
- **Total_Regional_Supply**: Player yield + sum of all AI competitor yields
- **Regional_Demand**: 500,000 kg/season (Opole Province baseline)
- **Price Floor**: Minimum 70% of base price (4.20 PLN wholesale, 8.40 PLN retail)
- **Price Ceiling**: Maximum 130% of base price (7.80 PLN wholesale, 15.60 PLN retail)

**Market Dynamics Examples**:

*Example 1: Balanced Market*
- Total Supply: 480,000 kg (player: 50,000 kg, AI: 430,000 kg)
- Regional Demand: 500,000 kg
- Supply/Demand Ratio: 0.96 (undersupply)
- Price Adjustment: No penalty (demand exceeds supply)
- Wholesale Price: 6.00 PLN/kg (base price maintained)
- Retail Price: 12.00 PLN/kg

*Example 2: Oversupply Market*
- Total Supply: 650,000 kg (player: 80,000 kg, AI: 570,000 kg)
- Regional Demand: 500,000 kg
- Supply/Demand Ratio: 1.30 (30% oversupply)
- Supply Pressure: (1.30 - 1.0) × 0.3 = 0.09 (9% price reduction)
- Wholesale Price: 6.00 × (1 - 0.09) = 5.46 PLN/kg
- Retail Price: 12.00 × (1 - 0.09) = 10.92 PLN/kg

*Example 3: Severe Oversupply*
- Total Supply: 800,000 kg (player: 100,000 kg, AI: 700,000 kg)
- Regional Demand: 500,000 kg
- Supply/Demand Ratio: 1.60 (60% oversupply)
- Supply Pressure: (1.60 - 1.0) × 0.3 = 0.18 (18% reduction)
- Calculated Price: 6.00 × (1 - 0.18) = 4.92 PLN/kg
- **Actual Wholesale Price: 4.92 PLN/kg** (above floor)
- **Actual Retail Price: 9.84 PLN/kg**

**Strategic Implications**:
- Players must monitor total regional production to anticipate price changes
- High AI productivity seasons reduce profit margins for all farmers
- Strategic timing: Holding inventory for undersupply seasons (if storage available)
- Organic certification provides +10% price premium regardless of market conditions
- Expanding to new regions with lower AI competition can secure better prices

## AI Competitor Behavior Patterns

AI competitors are not static obstacles—they actively compete, adapt, and evolve using distinct personality-driven strategies. Each AI has a personality archetype that determines their decision-making priorities and reactions to market conditions.

**AI Decision-Making Framework**:

Every season, each AI competitor evaluates:
1. Current market prices and profitability
2. Their own financial position and resources
3. Player's market share and infrastructure level
4. Regional competition intensity
5. Personality-specific priorities

Based on these factors, AI competitors make decisions about:
- Infrastructure upgrades (irrigation, greenhouses, automation)
- Parcel expansion (purchasing new land)
- Organic farming conversion
- Production scaling (planting density, fertilizer investment)
- Sales strategy (retail vs. wholesale mix)

**The Three AI Personality Archetypes**:

### 1. The Traditionalist (40% of AI competitors)

**Core Philosophy**: "Stick to what works. Slow and steady wins the race."

**Decision Priorities**:
1. Maximize yield through proven methods (fertilizer, basic irrigation)
2. Avoid risky investments (no organic conversion, minimal automation)
3. Wholesale-focused sales (100% wholesale, no retail)
4. Conservative expansion (only when highly profitable)
5. React slowly to market changes (2-3 season delay)

**Behavior Patterns**:
- **Infrastructure**: Invests in basic irrigation first, rarely upgrades to automation
- **Expansion**: Only purchases new parcels when sitting on 200,000+ PLN cash reserves
- **Market Adaptation**: Continues production even during oversupply (stubborn)
- **Organic Farming**: Never converts to organic (views it as unnecessary risk)
- **Competitive Response**: Ignores player actions unless directly threatened (>40% market share loss)

**Strengths**: Consistent production, low operating costs, stable profits
**Weaknesses**: Cannot compete on quality, loses market share to innovators, vulnerable to price crashes

**Example Traditionalist - Jan Kowalski**:
- Starting parcels: 2.5 ha (gliniasta soil, medium fertility)
- Season 1-5: Focuses on basic irrigation installation
- Season 6-10: Slowly expands to 4.0 ha total
- Season 11+: Maintains steady production, never adopts advanced tech
- Typical yield: 28,000 kg/season (consistent but unspectacular)

### 2. The Innovator (35% of AI competitors)

**Core Philosophy**: "Embrace new technology. Quality over quantity."

**Decision Priorities**:
1. Early adoption of automation and greenhouses
2. Organic farming conversion (starts Season 3-5)
3. Retail sales specialization (targets 50% retail mix)
4. Quality-focused production (premium fertilizers, optimal pH management)
5. Rapid response to market trends (1 season adaptation time)

**Behavior Patterns**:
- **Infrastructure**: Prioritizes automation and greenhouses over expansion
- **Expansion**: Only expands after achieving high infrastructure level (80+)
- **Market Adaptation**: Reduces production during oversupply, increases during undersupply
- **Organic Farming**: 60% chance to convert 1-2 parcels to organic by Season 5
- **Competitive Response**: Actively monitors player's infrastructure and matches investments

**Strengths**: High-quality yields, premium pricing, efficient operations, adapts to market
**Weaknesses**: High upfront costs, slower expansion, vulnerable during conversion periods

**Example Innovator - Anna Nowak**:
- Starting parcels: 1.5 ha (gliniasta soil, high fertility)
- Season 1-3: Invests 150,000 PLN in automation and greenhouse
- Season 4-5: Begins organic conversion on 1.0 ha parcel
- Season 6-8: Achieves Premium quality organic cherries (+50% price)
- Season 9+: Dominates retail market with 40% retail sales mix
- Typical yield: 18,000 kg/season (lower volume, 2× profit per kg)

### 3. The Businessman (25% of AI competitors)

**Core Philosophy**: "Aggressive growth. Dominate the market."

**Decision Priorities**:
1. Rapid territorial expansion (purchases parcels aggressively)
2. Market share maximization (targets 30%+ regional share)
3. High-risk, high-reward strategies (leverages debt, speculative investments)
4. Premium quality focus (targets Excellent/Premium tiers)
5. Opportunistic behavior (exploits player weaknesses)

**Behavior Patterns**:
- **Infrastructure**: Invests heavily but unevenly (some parcels fully upgraded, others basic)
- **Expansion**: Purchases new parcels every 2-3 seasons regardless of profitability
- **Market Adaptation**: Floods market during high prices, holds inventory during low prices
- **Organic Farming**: 40% chance to convert if market shows +20% organic premium
- **Competitive Response**: Directly targets player's strongest regions, attempts to undercut prices

**Strengths**: Rapid growth, market dominance potential, flexible strategy
**Weaknesses**: Overextended finances, vulnerable to market crashes, inconsistent quality

**Example Businessman - Piotr Wiśniewski**:
- Starting parcels: 2.0 ha (mixed soil quality)
- Season 1-2: Immediately purchases 2 additional parcels (4.0 ha total)
- Season 3-5: Invests in premium infrastructure on best parcels only
- Season 6-8: Expands to 7.0 ha, achieves 25% market share
- Season 9+: Either dominates region (35% share) or collapses from debt
- Typical yield: 45,000 kg/season (high volume, variable quality)

**AI Adaptation Mechanics**:

AI competitors track and respond to:
- **Player Market Share**: If player exceeds 30% share, Businessmen become aggressive
- **Price Trends**: 3-season moving average determines production scaling
- **Infrastructure Gap**: Innovators match player's infrastructure level within 5 seasons
- **Organic Premium**: If organic prices exceed +15% premium, 30% of AI considers conversion

**Rivalry System**:

The top 3 AI competitors in each region are designated as **Named Rivals** with:
- Full profile (name, personality, farm statistics)
- Visible on leaderboard with detailed metrics
- Special achievements for defeating rivals ("Rival Defeated: Jan Kowalski")
- Narrative flavor text based on personality and performance

## Ranking System

The ranking system provides multiple competitive dimensions, allowing players to excel in different areas while tracking their overall tycoon success.

**Core Ranking Metrics**:

### 1. Farm Value (Primary Farm Metric)

**Calculation**:
\`\`\`
Farm_Value = (Total_Parcel_Value + Infrastructure_Value + Inventory_Value) × Quality_Multiplier
\`\`\`

Where:
- **Total_Parcel_Value**: Sum of all owned parcels (60,000 PLN/ha base value)
- **Infrastructure_Value**: Cumulative CAPEX investments (irrigation, greenhouses, automation, storage)
- **Inventory_Value**: Current cherry inventory × market price
- **Quality_Multiplier**: Average parcel quality rating (0.8× to 1.5×)

**Example Calculation**:
- Parcels: 5.0 ha × 60,000 PLN = 300,000 PLN
- Infrastructure: 2 basic irrigation (50,000) + 1 greenhouse (80,000) + 1 automation (150,000) = 280,000 PLN
- Inventory: 20,000 kg × 6 PLN = 120,000 PLN
- Quality Multiplier: 1.2× (high-quality parcels)
- **Farm Value: (300,000 + 280,000 + 120,000) × 1.2 = 840,000 PLN**

**Ranking Tiers**:
- **Novice Farmer**: 0 - 500,000 PLN
- **Established Farmer**: 500,001 - 1,500,000 PLN
- **Master Farmer**: 1,500,001 - 5,000,000 PLN
- **Agricultural Tycoon**: 5,000,001+ PLN

### 2. Season Profit (Performance Metric)

**Calculation**:
\`\`\`
Season_Profit = Total_Revenue - (Fixed_Costs + Variable_Costs + CAPEX_Depreciation + Club_Expenses)
\`\`\`

Where:
- **Total_Revenue**: All sales (retail + wholesale) for the season
- **Fixed_Costs**: Land lease, insurance, maintenance (4,300 PLN/ha)
- **Variable_Costs**: Per-kg costs (2.90 PLN wholesale, 3.50 PLN retail)
- **CAPEX_Depreciation**: Infrastructure costs amortized over lifespan
- **Club_Expenses**: Football club salaries, facilities, training

**Ranking Cadence**: Calculated at end of each season (every 7 real-time days)

**Leaderboard Categories**:
- **Best Season Profit (Current)**: Top 100 players this season
- **Best Season Profit (All-Time)**: Highest single-season profit ever recorded
- **Most Consistent**: Lowest profit variance over last 10 seasons

**Example Calculation**:
- Revenue: 500,000 PLN (80,000 kg × average 6.25 PLN/kg)
- Fixed Costs: 21,500 PLN (5.0 ha × 4,300 PLN)
- Variable Costs: 232,000 PLN (80,000 kg × 2.90 PLN)
- CAPEX Depreciation: 15,000 PLN (280,000 total / average 18.7 season lifespan)
- Club Expenses: 150,000 PLN (salaries + facilities + training)
- **Season Profit: 500,000 - 21,500 - 232,000 - 15,000 - 150,000 = 81,500 PLN**

### 3. Efficiency (Optimization Metric)

**Calculation**:
\`\`\`
Efficiency_Score = (Revenue_per_Hectare / Cost_per_Hectare) × 100
\`\`\`

Where:
- **Revenue_per_Hectare**: Total season revenue / total hectares owned
- **Cost_per_Hectare**: Total season costs / total hectares owned
- **Score Range**: 50 (break-even) to 300+ (highly efficient)

**Efficiency Ranking Tiers**:
- **Inefficient**: 50-100 (barely profitable)
- **Average**: 101-150 (standard operations)
- **Efficient**: 151-200 (optimized operations)
- **Master Optimizer**: 201-250 (elite efficiency)
- **Perfect Efficiency**: 251+ (theoretical maximum)

**Example Calculation**:
- Total Revenue: 500,000 PLN
- Total Costs: 418,500 PLN
- Total Hectares: 5.0 ha
- Revenue per ha: 500,000 / 5.0 = 100,000 PLN/ha
- Cost per ha: 418,500 / 5.0 = 83,700 PLN/ha
- **Efficiency Score: (100,000 / 83,700) × 100 = 119.5 (Average tier)**

**Why Efficiency Matters**:
- Rewards smart resource allocation over brute-force expansion
- Identifies players who maximize profit per hectare
- Organic farmers often rank high due to premium pricing
- Encourages infrastructure investment and quality focus

**Combined Tycoon Score**:

The ultimate ranking metric combining farm and club success:

\`\`\`
Tycoon_Score = (Farm_Value × 0.4) + (Season_Profit × 0.2) + (Efficiency_Score × 1000) + (Club_Success_Points × 0.4)
\`\`\`

Where:
- **Farm_Value**: Weighted 40% (long-term asset building)
- **Season_Profit**: Weighted 20% (current performance)
- **Efficiency_Score**: Weighted as multiplier (rewards optimization)
- **Club_Success_Points**: League position (1000 pts/tier) + trophies (5000 pts each) + win rate bonus

**Leaderboard Update Schedule**:
- **Real-time**: Market share, current season profit (updates continuously)
- **Weekly**: Tycoon Score recalculated every Sunday 00:00 CET
- **Seasonal**: Final rankings published at end of 4-season cycle (quarterly)
- **Annual**: Yearly champions crowned with permanent titles and rewards

## Auction-Based Wholesale Contracts

Beyond standard wholesale sales (6 PLN/kg instant sale), players can participate in **Wholesale Contract Auctions** for guaranteed bulk sales at premium prices with long-term commitments.

**Auction System Overview**:

Wholesale buyers (supermarket chains, food processors, export companies) periodically offer contracts for large cherry volumes. Players bid on these contracts in a competitive auction format, with winners securing guaranteed sales at negotiated prices.

**When Auctions Occur**:
- **Frequency**: One auction per season (4 auctions per year)
- **Timing**: Auction opens 3 days before season end, closes 1 day before harvest
- **Announcement**: Players receive notification 5 days before auction opens
- **Participation**: Requires Level 10+ and minimum 2.0 ha farm size

**What is Bid On**:

Each auction features 3-5 contracts with varying terms:

**Contract Types**:

1. **Supermarket Chain Contract**
   - Volume: 50,000 kg per season
   - Duration: 4 seasons (1 year)
   - Base Price: 6.50 PLN/kg (+8% premium over spot)
   - Quality Requirement: Good or better (90% of delivery)
   - Penalty: -20% payment if quality standards not met

2. **Food Processor Contract**
   - Volume: 100,000 kg per season
   - Duration: 8 seasons (2 years)
   - Base Price: 6.20 PLN/kg (+3% premium over spot)
   - Quality Requirement: Common acceptable
   - Penalty: -10% payment for late delivery (>7 days past season end)

3. **Export Premium Contract**
   - Volume: 30,000 kg per season
   - Duration: 2 seasons (6 months)
   - Base Price: 7.50 PLN/kg (+25% premium over spot)
   - Quality Requirement: Excellent or Premium only
   - Penalty: Contract void if quality not met (no payment)

4. **Organic Specialist Contract** (requires organic certification)
   - Volume: 20,000 kg per season
   - Duration: 12 seasons (3 years)
   - Base Price: 9.00 PLN/kg (+50% premium over spot)
   - Quality Requirement: Certified organic, Premium quality
   - Penalty: -30% payment + reputation damage if standards violated

**How Bidding Works**:

Players submit **sealed bids** specifying:
1. **Price Adjustment**: Percentage above or below base price (-10% to +20%)
2. **Volume Commitment**: Percentage of contract volume they can fulfill (50% to 150%)
3. **Quality Guarantee**: Commitment to quality tier (affects bid score)

**Bid Scoring Formula**:
\`\`\`
Bid_Score = (Price_Competitiveness × 0.5) + (Volume_Reliability × 0.3) + (Quality_Commitment × 0.2)
\`\`\`

Where:
- **Price_Competitiveness**: Lower price = higher score (range: 0-100)
- **Volume_Reliability**: Based on farm capacity and historical delivery rate (0-100)
- **Quality_Commitment**: Higher quality guarantee = higher score (0-100)

**Winner Selection**:

- **Highest Bid_Score wins the contract**
- Ties broken by: (1) Quality Commitment, (2) Historical delivery rate, (3) Random
- Winners announced 1 day before season end
- Contract terms locked in for duration

**Example Auction**:

*Supermarket Chain Contract (50,000 kg, 4 seasons, 6.50 PLN/kg base)*

**Player A Bid**:
- Price: 6.30 PLN/kg (-3% below base)
- Volume: 50,000 kg (100% commitment)
- Quality: Good guaranteed
- Bid Score: (85 × 0.5) + (90 × 0.3) + (70 × 0.2) = 42.5 + 27 + 14 = **83.5**

**Player B Bid**:
- Price: 6.50 PLN/kg (base price)
- Volume: 60,000 kg (120% commitment)
- Quality: Excellent guaranteed
- Bid Score: (70 × 0.5) + (95 × 0.3) + (90 × 0.2) = 35 + 28.5 + 18 = **81.5**

**Player C Bid**:
- Price: 6.20 PLN/kg (-5% below base)
- Volume: 50,000 kg (100% commitment)
- Quality: Good guaranteed
- Bid Score: (90 × 0.5) + (85 × 0.3) + (70 × 0.2) = 45 + 25.5 + 14 = **84.5**

**Winner: Player C** (highest bid score, most competitive price with reliable volume)

**Contract Obligations & Rewards**:

**Obligations**:
- Deliver contracted volume each season (within 7 days of harvest)
- Meet quality standards (verified at delivery)
- Maintain production capacity (cannot sell farm below contract requirements)
- Penalties for non-compliance (payment reductions, contract termination, reputation damage)

**Rewards**:
- **Guaranteed Sales**: No market price risk for contracted volume
- **Premium Pricing**: 3-50% above spot wholesale prices
- **Cash Flow Stability**: Predictable revenue for financial planning
- **Reputation Bonus**: Successful contract completion increases future bid scores (+5% per contract)
- **Exclusive Contracts**: Top performers unlock special high-value contracts (Level 25+)

**Strategic Considerations**:
- Contracts lock in prices (good during oversupply, bad during undersupply)
- Volume commitments require production planning (infrastructure, expansion)
- Quality requirements may necessitate organic conversion or infrastructure upgrades
- Long-term contracts provide stability but reduce flexibility
- Balancing contracted vs. spot sales optimizes profit

**Contract Failure Consequences**:
- **Partial Delivery**: Pro-rated payment with -10% penalty
- **Quality Failure**: Payment reduction per contract terms
- **Complete Failure**: Contract termination, -20% reputation, banned from next 2 auctions
- **Reputation System**: Tracked across all contracts, affects future bid scores

## Cherry Festival Event Mechanics

The **Cherry Festival** is a seasonal competitive event celebrating the cherry harvest, combining production challenges, quality competitions, and market dynamics into a week-long celebration that impacts rankings and unlocks special rewards.

**Event Timing**:
- **Frequency**: Once per year (Season 2 of each 4-season cycle)
- **Duration**: 7 real-time days (one full season)
- **Announcement**: 14 days advance notice with preparation tips
- **Participation**: Automatic for all players with active farms

**Event Objectives**:

### Primary Goal: Festival Champion Title

Awarded to the player with the highest **Festival Score**, calculated as:

\`\`\`
Festival_Score = (Quality_Points × 0.4) + (Volume_Points × 0.3) + (Market_Impact_Points × 0.3)
\`\`\`

**Quality Points** (0-1000):
- Based on average quality tier of all cherries produced during festival season
- Common: 100 pts, Good: 300 pts, Excellent: 600 pts, Premium: 1000 pts
- Organic certification: +20% bonus
- Weighted by volume (higher quality on more kg = more points)

**Volume Points** (0-1000):
- Based on total kg produced relative to regional average
- Below average: 0-300 pts
- Average: 301-600 pts
- Above average: 601-900 pts
- Top 10%: 901-1000 pts

**Market Impact Points** (0-1000):
- Based on market share during festival season
- <10% share: 0-200 pts
- 10-20% share: 201-500 pts
- 20-30% share: 501-800 pts
- >30% share: 801-1000 pts

### Secondary Goals: Category Awards

**Best Quality Award**:
- Highest average quality score (minimum 10,000 kg produced)
- Reward: 25,000 PLN + "Quality Master" badge
- Unlocks: Premium Organic Contract access (Level 15+)

**Highest Volume Award**:
- Most kg produced during festival season
- Reward: 30,000 PLN + "Production King" badge
- Unlocks: Bulk discount on next CAPEX purchase (-15%)

**Market Leader Award**:
- Highest market share during festival season
- Reward: 40,000 PLN + "Market Dominator" badge
- Unlocks: Adjacent county expansion (regardless of level)

**Efficiency Champion Award**:
- Highest efficiency score during festival season
- Reward: 20,000 PLN + "Optimizer" badge
- Unlocks: Advanced analytics dashboard

**Festival Champion Rewards** (Overall Winner):

- **Cash Prize**: 50,000 PLN
- **Permanent Title**: "Cherry Festival Champion [Year]"
- **Fan Base Boost**: +5,000 football club fans (increases merchandise revenue)
- **Reputation Bonus**: +10% bid score for wholesale contract auctions (permanent)
- **Exclusive Unlock**: "Festival Grounds" special parcel (1.0 ha, premium soil, +20% yield)
- **Trophy**: Displayed in player profile and club stadium

**Market Dynamics During Festival**:

The Cherry Festival significantly impacts market prices and demand:

**Demand Surge**:
- Regional demand increases by +50% during festival season
- Base demand: 500,000 kg → Festival demand: 750,000 kg
- Reduces oversupply pressure, stabilizes prices

**Price Premium**:
- Festival-branded cherries (Good+ quality) receive +15% price premium
- Retail sales capacity increases to 50% (from 30% normal cap)
- Organic cherries receive additional +10% festival premium (total +25%)

**Example Festival Market**:
- Normal Season: 600,000 kg supply / 500,000 kg demand = 20% oversupply → 5.40 PLN/kg
- Festival Season: 600,000 kg supply / 750,000 kg demand = 20% undersupply → 6.60 PLN/kg (+22% vs normal)

**Festival-Specific Mechanics**:

**Cherry Festival Contracts**:
- Special one-time contracts available only during festival
- "Festival Supplier" contract: 25,000 kg, 8.00 PLN/kg, Good+ quality required
- Winners supply festival vendors, receive bonus reputation

**Festival Leaderboard**:
- Real-time leaderboard visible to all players
- Updates every 6 hours during festival week
- Shows top 100 players across all categories
- Creates competitive tension and strategic adjustments

**Festival Challenges**:
- Daily mini-challenges (e.g., "Harvest 5,000 kg in one day")
- Completion rewards: 2,000-5,000 PLN + bonus Festival Score points
- Encourages daily engagement throughout festival week

**Strategic Considerations**:

**Preparation Phase** (14 days before festival):
- Players invest in infrastructure to maximize yield
- Organic farmers time certification to complete before festival
- Contract holders may defer deliveries to focus on festival production
- Market speculation: Some players hold inventory anticipating price surge

**Festival Week Strategy**:
- **Quality Focus**: Invest in premium fertilizers, optimal pH management
- **Volume Push**: Maximize production through all available parcels
- **Market Timing**: Retail sales more profitable due to increased capacity
- **Risk Management**: Weather events during festival have 2× impact on rankings

**Post-Festival Impact**:

**Ranking Boost**:
- Festival performance significantly impacts annual Tycoon Score
- Festival Champion receives +50,000 Tycoon Score bonus
- Category winners receive +20,000 Tycoon Score bonus
- All participants receive +5,000 Tycoon Score for participation

**Market Correction**:
- Post-festival season (Season 3) typically sees -20% demand (market saturation)
- Prices drop below baseline as consumers are "cherried out"
- Strategic players reduce production or focus on wholesale contracts

**Long-Term Benefits**:
- Festival badges displayed on player profile (prestige)
- Reputation bonuses persist for entire year
- Unlocked parcels and contracts provide ongoing advantages
- Fan base boost increases football club revenue permanently

**Festival Narrative**:

The Cherry Festival is presented as a cultural celebration with:
- Festival mascot (animated cherry character)
- Festival-themed UI decorations (bunting, cherry blossoms)
- NPC dialogue from festival organizers and rival farmers
- Historical context (celebrating Polish cherry farming heritage)
- Community aspect (global participation, shared celebration)

**Competitive Dynamics**:

The festival creates multiple competitive dimensions:
- **Quality vs. Volume**: Players choose specialization strategy
- **Market Share Battle**: Rivals compete for dominance during high-demand period
- **Risk/Reward**: Aggressive production risks quality failures
- **Social Competition**: Leaderboard visibility drives engagement and rivalry

**Example Festival Outcome**:

**Winner: Player "MasterFarmer_PL"**
- Quality Points: 850 (Excellent average, 60,000 kg, organic certified)
- Volume Points: 920 (Top 5% production)
- Market Impact Points: 780 (28% market share)
- **Total Festival Score: 850×0.4 + 920×0.3 + 780×0.3 = 340 + 276 + 234 = 850**

**Rewards Earned**:
- 50,000 PLN cash prize
- "Cherry Festival Champion 2026" permanent title
- +5,000 football club fans
- +10% wholesale contract bid score (permanent)
- "Festival Grounds" special parcel unlocked

**Impact on Rankings**:
- Jumped from #47 to #12 on Global Tycoon leaderboard
- Secured #1 Regional Champion (Opole Voivodeship)
- Unlocked "Master Farmer" tier (crossed 1.5M PLN farm value threshold)

---

**Summary: Competition & Market Dynamics**

The competition system creates a living, breathing economy where:
- **Shared markets** make every farmer's decisions matter (supply affects prices)
- **AI personalities** provide diverse, adaptive competition (Traditionalist, Innovator, Businessman)
- **Rankings** reward multiple playstyles (Farm Value, Season Profit, Efficiency)
- **Wholesale auctions** add strategic depth and long-term planning
- **Cherry Festival** creates annual competitive peaks with lasting rewards

This multi-layered competition ensures players always have rivals to overcome, markets to master, and goals to pursue—whether they focus on quality, volume, efficiency, or balanced tycoon success.`,
    isPlanDependent: false,
  },
  {
    id: 'sports-management',
    title: 'Sports Management Systems',
    content: `**Football Club Management**:

**Sport Type**: Football (Soccer)
**Starting League**: Regional League (Opole Voivodeship)
**Roster Size**: 18 players (11 starters + 7 substitutes)

**Player Attributes**:
- Skill Rating: 1-100 (affects performance and salary)
- Position: GK, DEF, MID, FWD
- Stamina: Depletes during matches, recovers with rest
- Morale: Affected by results, salary, and facilities
- Potential: Growth ceiling for young players

**Football Club Investment Formulas**:

**Training Investment**:
\`\`\`
Skill_Improvement = (Training_Budget / 10,000) × (Facility_Quality / 100) × (Coach_Rating / 50)
\`\`\`
- Training_Budget: PLN spent per season (20,000 - 100,000)
- Facility_Quality: 1-100 rating based on infrastructure
- Coach_Rating: 1-100 rating of head coach
- Result: +1 to +5 skill points per player per season

**Facility Investment Impact**:
\`\`\`
Facility_Quality = Base_Quality + (Total_Investment / 50,000)
\`\`\`
- Base_Quality: 20 (starting facilities)
- Total_Investment: Cumulative PLN spent on facilities
- Cap: 100 (world-class facilities)
- Each +10 quality: +5% training effectiveness, +10% morale

**Player Investment Formula**:
\`\`\`
Player_Market_Value = Skill_Rating × 1,000 PLN
Transfer_Fee = Market_Value × (1 + League_Tier_Multiplier)
\`\`\`
- League_Tier_Multiplier: Regional (0.5×), Provincial (1.0×), National (2.0×), Elite (4.0×)
- Example: 70-rated player in Provincial League = 70,000 × 1.5 = 105,000 PLN

**Stadium Investment**:
\`\`\`
Stadium_Capacity = Base_Capacity + (Investment / 100)
Match_Revenue_Multiplier = 1 + (Stadium_Quality / 200)
\`\`\`
- Base_Capacity: 5,000 seats
- Investment: PLN spent on stadium upgrades
- Stadium_Quality: 1-100 (affects ticket prices and attendance)

**Club Revenue Formula**:
\`\`\`
Club_Revenue = Match_Revenue + Sponsorship_Revenue + Merchandise_Revenue
\`\`\`

**Match Revenue**:
- Base attendance: 5,000 spectators
- Ticket price: 30 PLN
- Performance multiplier: 0.8× (loss), 1.0× (draw), 1.3× (win)
- Stadium upgrades increase capacity
- Formula: \`(Attendance × 30 PLN) × Performance_Multiplier\`

**Sponsorship Revenue**:
- Base: 50,000 PLN/season
- League tier multipliers: Regional (1.0×), Provincial (2.0×), National (4.0×), Elite (8.0×)
- Win rate bonus: +0.5 for every 10% win rate above 50%
- Formula: \`50,000 × (League_Multiplier + Win_Rate_Bonus)\`

**Merchandise Revenue**:
- Fan base starts at 10,000, grows with success
- Revenue per fan: 15 PLN/season
- Trophy bonus: +20% per trophy won
- Formula: \`Fan_Base × 15 PLN × (1 + Trophy_Bonus)\`

**Club Costs**:

**Player Salaries**:
- Formula: \`Skill_Rating × 500 PLN per player per season\`
- Average team (50 rating): 25,000 PLN/player
- Full roster (18 players): ~450,000 PLN/season

**Staff Salaries**:
- Head Coach: 100,000 PLN/season
- Assistant Coaches (2): 40,000 PLN each
- Medical Staff: 60,000 PLN
- **Total: 240,000 PLN/season**

**Facility Maintenance**:
- Stadium: 50,000 PLN/season
- Training Ground: 30,000 PLN/season
- Medical Facility: 20,000 PLN/season
- **Total: 100,000 PLN/season**

**Training Costs**:
- Basic: 20,000 PLN/season (+1 skill/player)
- Advanced: 50,000 PLN/season (+2 skill/player)
- Elite: 100,000 PLN/season (+3-5 skill/player)

**Investment ROI Examples**:

**Example 1: Training Investment**
- Spend: 100,000 PLN on elite training
- Facility Quality: 60
- Coach Rating: 70
- Result: (100,000/10,000) × (60/100) × (70/50) = 8.4 → +4 skill per player
- 18 players × 4 skill = 72 total skill points gained
- Market value increase: 72 × 1,000 = 72,000 PLN
- ROI: 72% in one season (plus performance benefits)

**Example 2: Facility Investment**
- Spend: 500,000 PLN on training facility upgrade
- Quality increase: 500,000 / 50,000 = +10 quality points
- Training effectiveness: +5%
- Morale boost: +10%
- Long-term ROI: Better player development, higher win rate, increased revenue

**Break-even Analysis**:
- Minimum farm profit needed: 800,000 PLN/season
- Supports mid-tier Regional League team
- Profit allocation: 60% farm reinvestment, 40% club funding

**Match System**:
- **Match Types**: League matches (weekly), tournaments (seasonal), friendly matches
- **Simulation**: Auto-resolve with tactical decisions (formation, strategy)
- **Strategy**: 4-4-2, 4-3-3, 3-5-2 formations with offensive/defensive tactics
- **Outcomes**: Win/loss/draw with rewards (prize money, fan growth, morale impact)

**League Structure**:
- **Regional League**: 12 teams, top 3 promote to Provincial
- **Provincial League**: 16 teams, 2× revenue, top 3 promote to National
- **National League**: 20 teams, 4× revenue, top 3 promote to Elite
- **Elite League**: 24 teams, 8× revenue, champions win national title

**Progression Path**:
- Season 1-4: Establish Regional League dominance
- Season 5-8: Compete in Provincial League
- Season 9-12: Push for National League promotion
- Season 13+: Elite League competition and European qualification`,
    isPlanDependent: false,
  },
  {
    id: 'geographic-expansion',
    title: 'Geographic Expansion & Polish Regions',
    content: `**Polish Administrative Structure**:

Poland is divided into a three-tier administrative hierarchy that forms the backbone of the game's geographic expansion system:

**Tier 1: Voivodeships** (Województwa) - 16 provinces
**Tier 2: Counties** (Powiaty) - 380 counties
**Tier 3: Communes** (Gminy) - 2,477 communes

**Starting Region: Opole Voivodeship**

Players begin in **Opole Voivodeship**, a balanced region ideal for learning core mechanics:

**Opole County** (Starting County):
- **Communes**: Opole (city), Dobrzeń Wielki, Komprachcice, Łubniany, Murów, Popielów, Prószków, Tarnów Opolski, Turawa
- **Characteristics**: Moderate soil quality, balanced AI competition, stable market prices
- **Starting Commune**: Player chooses one commune to establish first parcel

**Expansion Progression**:

**Level 1-10: Commune Expansion**
- Unlock adjacent communes within Opole County
- Each commune has 3-5 available parcels (0.5-5.0 ha each)
- Parcel prices: 60,000 PLN/ha base (varies by soil quality)
- Requirement: Achieve 20% market share in current commune

**Level 11-25: County Expansion**
- Unlock adjacent counties within Opole Voivodeship
- Available counties: Brzeg, Kędzierzyn-Koźle, Kluczbork, Krapkowice, Namysłów, Nysa, Prudnik, Strzelce Opolskie
- Requirement: Achieve 50% market dominance in current county
- Each county has different characteristics (soil, AI difficulty, market size)

**Level 26-50: Voivodeship Expansion**
- Unlock adjacent voivodeships across Poland
- Available voivodeships: Silesia, Lower Silesia, Łódź, Greater Poland, Świętokrzyskie
- Requirement: Win Provincial League (football club) + 1,000,000 PLN farm value
- Each voivodeship has unique regional modifiers

**Regional Modifiers by Voivodeship**:

**Silesia (Śląskie)**:
- Industrial region with high population density
- Market demand: +40% (high urban consumption)
- Operating costs: +20% (higher wages, land prices)
- Retail prices: +30% (wealthy consumer base)
- AI competition: 25 competitors (high)
- Soil quality: Mixed (industrial pollution affects some areas)

**Małopolska (Lesser Poland)**:
- Premium agricultural region, tourist destination
- Market demand: +25% (tourism boost)
- Operating costs: +10% (moderate)
- Retail prices: +50% (premium market, tourists)
- AI competition: 20 competitors (moderate)
- Soil quality: Excellent (fertile valleys)

**Mazovia (Mazowieckie)**:
- Capital region (Warsaw), highest competition
- Market demand: +60% (largest population)
- Operating costs: +35% (highest wages, land prices)
- Retail prices: +40% (wealthy urban market)
- AI competition: 30 competitors (extreme)
- Soil quality: Good (fertile plains)

**Lower Silesia (Dolnośląskie)**:
- Diverse geography, moderate competition
- Market demand: +15% (moderate population)
- Operating costs: +5% (low)
- Retail prices: +10% (standard market)
- AI competition: 18 competitors (moderate)
- Soil quality: Variable (mountains to plains)

**Greater Poland (Wielkopolskie)**:
- Traditional agricultural heartland
- Market demand: +20% (agricultural hub)
- Operating costs: -5% (efficient infrastructure)
- Retail prices: +5% (competitive market)
- AI competition: 22 competitors (high)
- Soil quality: Excellent (prime farmland)

**Geographic Strategy**:

**Early Game (Opole Focus)**:
- Master core mechanics in balanced environment
- Build infrastructure and establish market presence
- Compete with 20 AI rivals for regional dominance

**Mid Game (County Expansion)**:
- Diversify across multiple counties to reduce risk
- Exploit county-specific advantages (soil, market size)
- Balance expansion costs with infrastructure investment

**Late Game (Voivodeship Expansion)**:
- Strategic expansion to high-value regions (Mazovia, Małopolska)
- Manage multiple regional markets simultaneously
- Optimize logistics and resource allocation across Poland

**Expansion Costs**:
- New commune parcel: 60,000 PLN/ha base
- New county parcel: 80,000 PLN/ha (+33% premium)
- New voivodeship parcel: 120,000 PLN/ha (+100% premium)
- Infrastructure must be rebuilt in each new region

**Regional Market Independence**:
- Each voivodeship has separate market dynamics
- Supply/demand calculated independently per region
- AI competitors are region-specific (no cross-region competition)
- Prices vary by region based on local supply/demand

**Unlock Conditions Summary**:
1. **Adjacent Commune**: Level 10 + 20% market share in current commune
2. **New County**: Level 25 + 50% market dominance in current county
3. **New Voivodeship**: Level 50 + Provincial League victory + 1,000,000 PLN farm value
4. **Special Unlock**: Cherry Festival Market Leader Award grants immediate adjacent county access`,
    isPlanDependent: false,
  },
  {
    id: 'organic-farming',
    title: 'Organic Farming & Certification',
    content: `**Organic Farming System**:

Organic farming offers premium pricing and quality bonuses but requires a two-season conversion process with specific costs and risks.

**Conversion Process**:

**Season 1: Transition Period**
- Declare parcel for organic conversion (irreversible for 2 seasons)
- Stop using synthetic fertilizers and pesticides
- Implement organic farming practices
- **Yield Penalty**: -30% production (transition shock)
- **Cost Increase**: +20% variable costs (organic inputs more expensive)
- **No Premium**: Cannot sell as organic yet (not certified)
- **Status**: "In Conversion" (visible to players and AI)

**Season 2: Certification Period**
- Continue organic practices
- Undergo certification inspection (automatic at season end)
- **Yield Penalty**: -15% production (still recovering)
- **Cost Increase**: +20% variable costs
- **Certification Fee**: 1,300-2,100 PLN per parcel (one-time)
- **Status**: "Pending Certification"

**Season 3+: Certified Organic**
- Full organic certification achieved
- **Yield Recovery**: 0% penalty (back to normal yield)
- **Quality Bonus**: Automatic "Premium" quality tier (+50% price)
- **Price Premium**: +10% base price (6.60 PLN wholesale, 13.20 PLN retail)
- **Annual Certification Cost**: 1,300-2,100 PLN per parcel per year
- **Status**: "Certified Organic"

**Organic Farming Economics**:

**Conversion Costs (2-season investment)**:

*Example: 2.0 ha parcel, 18,400 kg normal yield*

**Season 1 (Transition)**:
- Normal yield: 18,400 kg
- Organic yield: 18,400 × 0.70 = 12,880 kg (-30%)
- Normal revenue: 18,400 × 6 PLN = 110,400 PLN
- Organic revenue: 12,880 × 6 PLN = 77,280 PLN
- **Revenue Loss**: 33,120 PLN

- Normal variable costs: 18,400 × 2.90 = 53,360 PLN
- Organic variable costs: 12,880 × 3.48 = 44,822 PLN (+20% per kg)
- **Cost Difference**: -8,538 PLN (lower due to reduced yield)

- **Net Season 1 Loss**: 33,120 - 8,538 = **24,582 PLN**

**Season 2 (Certification)**:
- Normal yield: 18,400 kg
- Organic yield: 18,400 × 0.85 = 15,640 kg (-15%)
- Normal revenue: 110,400 PLN
- Organic revenue: 15,640 × 6 PLN = 93,840 PLN
- **Revenue Loss**: 16,560 PLN

- Organic variable costs: 15,640 × 3.48 = 54,427 PLN
- **Certification Fee**: 1,700 PLN (average)
- **Net Season 2 Loss**: 16,560 + 1,700 = **18,260 PLN**

**Total Conversion Cost**: 24,582 + 18,260 = **42,842 PLN**

**Season 3+ (Certified Organic Profit)**:
- Organic yield: 18,400 kg (full recovery)
- Organic revenue: 18,400 × 13.20 PLN (retail, Premium quality) = 242,880 PLN
- Normal revenue: 18,400 × 12 PLN (retail, Excellent quality) = 220,800 PLN
- **Revenue Gain**: 22,080 PLN per season

- Organic variable costs: 18,400 × 3.48 = 64,032 PLN
- Normal variable costs: 18,400 × 2.90 = 53,360 PLN
- **Cost Increase**: 10,672 PLN

- **Annual Certification**: 1,700 PLN

- **Net Organic Profit Gain**: 22,080 - 10,672 - 1,700 = **9,708 PLN per season**

**Break-even Analysis**:
- Total conversion cost: 42,842 PLN
- Profit gain per season: 9,708 PLN
- **Break-even point**: 42,842 / 9,708 = **4.4 seasons** (1.1 years)

**Long-term ROI**:
- After 10 seasons: 9,708 × 10 - 42,842 = **54,238 PLN profit**
- After 20 seasons: 9,708 × 20 - 42,842 = **151,318 PLN profit**
- **ROI**: 353% over 20 seasons (5 years)

**Organic Farming Risks**:

**Weather Vulnerability**:
- Organic farms more susceptible to weather events
- Drought: -30% yield (vs. -20% conventional)
- Frost: -40% yield (vs. -30% conventional)
- Hail: -50% yield (vs. -40% conventional)
- No synthetic pesticides = higher pest damage risk

**Market Risk**:
- If market prices crash, organic premium may not offset higher costs
- Oversupply affects organic prices equally (no protection)
- Certification costs are fixed regardless of profitability

**Commitment Risk**:
- Cannot revert to conventional farming for 2 seasons after certification
- If conversion fails (player abandons), lose all investment
- Must maintain organic practices or lose certification (forfeit annual fee)

**Organic Farming Benefits**:

**Price Premium**:
- +10% base price (6.60 PLN wholesale, 13.20 PLN retail)
- Automatic Premium quality tier (+50% retail price)
- Total retail price: 13.20 PLN/kg (vs. 12.00 PLN conventional Excellent)

**Quality Guarantee**:
- Organic cherries always achieve Premium quality (if properly managed)
- No quality randomness (conventional farms have variable quality)
- Consistent high-value product

**Market Advantages**:
- Access to Organic Specialist Contracts (9.00 PLN/kg, 12-season duration)
- +20% Festival Score bonus during Cherry Festival
- "Eco Leader" leaderboard category (organic-only ranking)
- First organic certification in region: +10% additional price premium (one-time)

**Competitive Edge**:
- Differentiation from AI competitors (only 35% of AI Innovators convert)
- Brand recognition: "Organic Pioneer" badge
- Attracts premium wholesale contracts
- Football club fan base boost (+2,000 fans per certified organic parcel)

**Strategic Considerations**:

**When to Convert**:
- **Early Game (Season 3-5)**: High risk, long payoff period, but establishes market position
- **Mid Game (Season 10-15)**: Balanced approach, stable income to absorb conversion costs
- **Late Game (Season 20+)**: Low risk, diversified portfolio, can afford experimentation

**Which Parcels to Convert**:
- **Best Parcels**: High fertility, optimal pH, gliniasta soil (maximize Premium quality)
- **Worst Parcels**: Low fertility, suboptimal soil (conversion won't improve much)
- **Strategic Parcels**: High-visibility regions (Małopolska, Mazovia) for premium market access

**Partial Conversion Strategy**:
- Convert 1-2 parcels initially (test market, manage risk)
- Maintain conventional parcels for stable income
- Gradually expand organic portfolio as profitability proven
- Optimal mix: 30-40% organic, 60-70% conventional (diversification)

**Organic Certification Requirements**:

**Inspection Criteria** (automatic at Season 2 end):
- No synthetic fertilizers used for 2 seasons
- No synthetic pesticides used for 2 seasons
- Organic inputs documented (game tracks automatically)
- Parcel meets minimum quality standards (Good or better)
- Certification fee paid (1,300-2,100 PLN)

**Certification Failure**:
- If parcel quality drops below Good during conversion: Certification denied
- Must restart conversion process (another 2 seasons)
- Lose all conversion investment (42,842 PLN wasted)
- Rare occurrence (5% chance if player neglects parcel management)

**Annual Recertification**:
- Automatic inspection each year
- Fee: 1,300-2,100 PLN per parcel
- Failure conditions: Use of synthetic inputs, quality drop below Good
- Penalty: Lose organic certification, cannot reconvert for 4 seasons

**Organic Farming & Competition**:

**AI Competitor Behavior**:
- **Traditionalists**: Never convert (0% adoption)
- **Innovators**: 60% convert 1-2 parcels by Season 5
- **Businessmen**: 40% convert if market shows +20% organic premium

**Market Impact**:
- High organic adoption (>30% regional supply) reduces organic premium to +5%
- Low organic adoption (<10% regional supply) increases organic premium to +15%
- Player can influence market by being first/early adopter

**Competitive Advantage**:
- First organic farmer in region: "Organic Pioneer" achievement
- +10% price premium (stacks with base +10% = +20% total)
- Exclusive access to Organic Specialist Contracts
- Reputation boost for wholesale contract auctions (+5% bid score)

**Organic Farming Summary**:

Organic farming is a high-risk, high-reward strategy requiring:
- **2-season conversion** with -30% and -15% yield penalties
- **42,842 PLN investment** (2.0 ha parcel example)
- **4.4 season break-even** period
- **Annual certification costs** (1,300-2,100 PLN)

Rewards include:
- **+10% base price premium** (6.60 PLN wholesale, 13.20 PLN retail)
- **Automatic Premium quality** (+50% retail price)
- **Exclusive contracts** (9.00 PLN/kg Organic Specialist)
- **Competitive advantages** (leaderboards, reputation, fan base)

Strategic players convert 30-40% of parcels to organic for diversification, targeting high-quality parcels in premium markets (Małopolska, Mazovia) for maximum ROI.`,
    isPlanDependent: false,
  },
  {
    id: 'web3-architecture',
    title: 'Web3 & ICP Architecture',
    content: `**Internet Computer Blockchain Integration**:

Mark Vinicius Cherry Tycoon is built entirely on the Internet Computer (ICP) blockchain, leveraging its unique capabilities for a fully decentralized gaming experience with true asset ownership.

**5-Canister Architecture**:

The game is structured across five specialized canisters, each handling specific responsibilities:

## 1. World Canister (Game State & Logic)

**Responsibilities**:
- Global game state management (seasons, time progression)
- Weather system and random events
- Regional market calculations (supply/demand, price adjustments)
- AI competitor behavior simulation
- Event scheduling (Cherry Festival, competitions)

**Data Models**:

\`\`\`motoko
type Season = {
  id: Nat;
  year: Nat;
  quarter: Nat; // 1-4 (Spring, Summer, Autumn, Winter)
  startTime: Time.Time;
  endTime: Time.Time;
  weatherEvent: ?WeatherEvent;
};

type WeatherEvent = {
  #Drought;
  #Frost;
  #Hail;
  #Perfect;
};

type RegionalMarket = {
  voivodeship: Text;
  totalSupply: Nat; // kg
  totalDemand: Nat; // kg
  wholesalePrice: Float; // PLN/kg
  retailPrice: Float; // PLN/kg
  organicPremium: Float; // percentage
};

type AICompetitor = {
  id: Nat;
  name: Text;
  personality: AIPersonality;
  parcels: [ParcelId];
  totalYield: Nat; // kg per season
  marketShare: Float; // percentage
  infrastructureLevel: Nat; // 0-100
};

type AIPersonality = {
  #Traditionalist;
  #Innovator;
  #Businessman;
};
\`\`\`

**Key Functions**:
- \`advanceSeason()\`: Progress game time, trigger season end calculations
- \`calculateMarketPrices(voivodeship: Text)\`: Update regional prices based on supply/demand
- \`simulateAIActions()\`: Execute AI competitor decisions
- \`triggerWeatherEvent()\`: Random weather event generation
- \`getGlobalLeaderboard(category: LeaderboardCategory)\`: Retrieve rankings

**Inter-Canister Communication**:
- Queries **Farm Canister** for all player yields (calculate total supply)
- Queries **Market Canister** for contract volumes (adjust available demand)
- Updates **Ranking Canister** with season results
- Notifies **Club Canister** of season-based events (league progression)

## 2. Farm Canister (Player Farms & Parcels)

**Responsibilities**:
- Player farm data storage (parcels, infrastructure, inventory)
- Parcel management (purchase, upgrade, organic conversion)
- Yield calculation and harvest processing
- Sales execution (retail, wholesale)
- Farm progression and unlocks

**Data Models**:

\`\`\`motoko
type Farm = {
  owner: Principal;
  parcels: [Parcel];
  totalHectares: Float;
  farmValue: Nat; // PLN
  level: Nat;
  unlockedRegions: [Text]; // voivodeship names
};

type Parcel = {
  id: Nat;
  location: Location;
  size: Float; // hectares
  soilType: SoilType;
  pH: Float;
  fertility: Nat; // 0-100
  infrastructure: [Infrastructure];
  isOrganic: Bool;
  organicConversionSeason: ?Nat;
  lastHarvest: ?Nat; // season ID
};

type Location = {
  voivodeship: Text;
  county: Text;
  commune: Text;
};

type SoilType = {
  #PiaszczystaGliniasta; // sandy-clay
  #Gliniasta; // clay
  #Piaszczysta; // sandy
  #Podmokla; // waterlogged
};

type Infrastructure = {
  #BasicIrrigation;
  #Greenhouse;
  #Automation;
  #StorageFacility;
};

type Inventory = {
  cherries: Nat; // kg
  quality: QualityTier;
  isOrganic: Bool;
  harvestSeason: Nat;
};

type QualityTier = {
  #Common;
  #Good;
  #Excellent;
  #Premium;
};
\`\`\`

**Key Functions**:
- \`purchaseParcel(location: Location, size: Float)\`: Buy new parcel
- \`upgradeInfrastructure(parcelId: Nat, upgrade: Infrastructure)\`: Install infrastructure
- \`startOrganicConversion(parcelId: Nat)\`: Begin 2-season organic process
- \`harvestParcel(parcelId: Nat)\`: Calculate yield, add to inventory
- \`sellCherries(amount: Nat, salesType: SalesType)\`: Execute sale (retail/wholesale)
- \`calculateYieldPotential(parcelId: Nat)\`: Yield formula calculation
- \`getFarmStatistics(owner: Principal)\`: Retrieve farm metrics

**Inter-Canister Communication**:
- Queries **World Canister** for current season, weather events, market prices
- Calls **Market Canister** to fulfill wholesale contracts
- Updates **Ranking Canister** with farm value, season profit, efficiency
- Notifies **Club Canister** of revenue for funding allocation

## 3. Club Canister (Football Club Management)

**Responsibilities**:
- Football club data storage (players, facilities, finances)
- Match simulation and results
- League progression and standings
- Player development and transfers
- Revenue and expense tracking

**Data Models**:

\`\`\`motoko
type FootballClub = {
  owner: Principal;
  name: Text;
  league: LeagueTier;
  leaguePosition: Nat;
  players: [Player];
  facilities: Facilities;
  finances: ClubFinances;
  fanBase: Nat;
  trophies: [Trophy];
};

type LeagueTier = {
  #Regional;
  #Provincial;
  #National;
  #Elite;
};

type Player = {
  id: Nat;
  name: Text;
  position: Position;
  skillRating: Nat; // 1-100
  stamina: Nat; // 0-100
  morale: Nat; // 0-100
  potential: Nat; // 1-100
  salary: Nat; // PLN per season
};

type Position = {
  #GK; // Goalkeeper
  #DEF; // Defender
  #MID; // Midfielder
  #FWD; // Forward
};

type Facilities = {
  stadiumCapacity: Nat;
  stadiumQuality: Nat; // 1-100
  trainingGroundQuality: Nat; // 1-100
  medicalFacilityQuality: Nat; // 1-100
};

type ClubFinances = {
  balance: Int; // PLN (can be negative)
  seasonRevenue: Nat; // PLN
  seasonExpenses: Nat; // PLN
  farmFunding: Nat; // PLN received from farm
};

type Trophy = {
  name: Text;
  season: Nat;
  tier: LeagueTier;
};
\`\`\`

**Key Functions**:
- \`simulateMatch(opponent: Nat, formation: Formation)\`: Auto-resolve match
- \`trainPlayers(budget: Nat)\`: Improve player skills
- \`transferPlayer(playerId: Nat, action: TransferAction)\`: Buy/sell players
- \`upgradeFacility(facility: FacilityType, investment: Nat)\`: Improve infrastructure
- \`receiveFarmFunding(amount: Nat)\`: Accept PLN from farm profits
- \`calculateClubRevenue()\`: Match + sponsorship + merchandise
- \`getClubStatistics(owner: Principal)\`: Retrieve club metrics

**Inter-Canister Communication**:
- Queries **World Canister** for season progression (schedule matches)
- Receives funding from **Farm Canister** (farm-to-club pipeline)
- Updates **Ranking Canister** with club performance metrics
- No direct communication with **Market Canister** (clubs don't trade)

## 4. Market Canister (Contracts & Trading)

**Responsibilities**:
- Wholesale contract auction system
- Contract fulfillment tracking
- Player reputation management
- Special event contracts (Cherry Festival)
- Contract history and analytics

**Data Models**:

\`\`\`motoko
type WholesaleContract = {
  id: Nat;
  contractType: ContractType;
  volume: Nat; // kg per season
  duration: Nat; // number of seasons
  basePrice: Float; // PLN/kg
  qualityRequirement: QualityTier;
  penalty: Float; // percentage
  status: ContractStatus;
};

type ContractType = {
  #SupermarketChain;
  #FoodProcessor;
  #ExportPremium;
  #OrganicSpecialist;
};

type ContractStatus = {
  #Open; // auction in progress
  #Awarded: Principal; // winner
  #Active: Principal; // currently fulfilling
  #Completed;
  #Failed;
};

type ContractBid = {
  bidder: Principal;
  contractId: Nat;
  priceAdjustment: Float; // percentage above/below base
  volumeCommitment: Nat; // kg
  qualityGuarantee: QualityTier;
  bidScore: Float;
};

type PlayerReputation = {
  player: Principal;
  contractsCompleted: Nat;
  contractsFailed: Nat;
  averageQuality: Float;
  onTimeDeliveryRate: Float; // percentage
  reputationScore: Nat; // 0-100
};

type ContractFulfillment = {
  contractId: Nat;
  season: Nat;
  deliveredVolume: Nat; // kg
  deliveredQuality: QualityTier;
  onTime: Bool;
  payment: Nat; // PLN
  penaltyApplied: Bool;
};
\`\`\`

**Key Functions**:
- \`createContractAuction(contract: WholesaleContract)\`: Open new auction
- \`submitBid(bid: ContractBid)\`: Player submits sealed bid
- \`awardContract(contractId: Nat)\`: Select winner based on bid scores
- \`fulfillContract(contractId: Nat, delivery: ContractFulfillment)\`: Deliver cherries
- \`calculateReputation(player: Principal)\`: Update reputation score
- \`getActiveContracts(player: Principal)\`: Retrieve player's contracts
- \`getAuctionHistory()\`: Historical auction data

**Inter-Canister Communication**:
- Queries **Farm Canister** for player inventory and capacity (validate bids)
- Queries **World Canister** for current season (schedule auctions)
- Updates **Ranking Canister** with contract performance metrics
- Receives cherry deliveries from **Farm Canister** (fulfillment)

## 5. Ranking Canister (Leaderboards & Achievements)

**Responsibilities**:
- Global and regional leaderboard management
- Tycoon Score calculation
- Achievement tracking and unlocks
- Historical rankings and statistics
- Competition event scoring (Cherry Festival)

**Data Models**:

\`\`\`motoko
type PlayerRanking = {
  player: Principal;
  farmValue: Nat; // PLN
  seasonProfit: Int; // PLN (can be negative)
  efficiencyScore: Float;
  clubSuccessPoints: Nat;
  tycoonScore: Float;
  globalRank: Nat;
  regionalRank: Nat;
  achievements: [Achievement];
};

type LeaderboardCategory = {
  #GlobalTycoon;
  #RegionalChampion: Text; // voivodeship
  #FarmMogul;
  #ClubManager;
  #EcoLeader;
  #RisingStar;
};

type Achievement = {
  id: Text;
  name: Text;
  description: Text;
  unlockedSeason: Nat;
  reward: ?Reward;
};

type Reward = {
  #Cash: Nat; // PLN
  #Badge: Text;
  #Title: Text;
  #Unlock: UnlockType;
};

type UnlockType = {
  #Parcel: Location;
  #Contract: ContractType;
  #Feature: Text;
};

type FestivalScore = {
  player: Principal;
  qualityPoints: Nat;
  volumePoints: Nat;
  marketImpactPoints: Nat;
  totalScore: Float;
  rank: Nat;
};
\`\`\`

**Key Functions**:
- \`updatePlayerRanking(player: Principal, metrics: RankingMetrics)\`: Recalculate rankings
- \`calculateTycoonScore(player: Principal)\`: Weighted combination formula
- \`getLeaderboard(category: LeaderboardCategory, limit: Nat)\`: Retrieve top N players
- \`unlockAchievement(player: Principal, achievementId: Text)\`: Award achievement
- \`recordFestivalScore(player: Principal, score: FestivalScore)\`: Cherry Festival results
- \`getPlayerStatistics(player: Principal)\`: Comprehensive player data
- \`getHistoricalRankings(player: Principal)\`: Past season rankings

**Inter-Canister Communication**:
- Receives updates from **Farm Canister** (farm value, season profit, efficiency)
- Receives updates from **Club Canister** (league position, trophies, win rate)
- Receives updates from **Market Canister** (contract performance, reputation)
- Queries **World Canister** for global statistics (total players, regional data)

## Inter-Canister Communication Flow

**Season Progression Example**:

1. **World Canister** triggers \`advanceSeason()\`
2. **World Canister** queries **Farm Canister** for all player yields
3. **World Canister** calculates regional market prices
4. **Farm Canister** processes harvests, updates inventory
5. **Farm Canister** notifies **Club Canister** of available funding
6. **Club Canister** processes match results, updates standings
7. **Market Canister** checks contract fulfillment deadlines
8. **Ranking Canister** receives updates from all canisters
9. **Ranking Canister** recalculates leaderboards
10. **World Canister** schedules next season events

**Contract Auction Example**:

1. **Market Canister** creates new auction (3 days before season end)
2. Players submit bids via **Market Canister**
3. **Market Canister** queries **Farm Canister** to validate capacity
4. **Market Canister** calculates bid scores, awards contract
5. **Farm Canister** reserves inventory for contract fulfillment
6. At season end, **Farm Canister** delivers cherries to **Market Canister**
7. **Market Canister** validates delivery, processes payment
8. **Market Canister** updates player reputation
9. **Ranking Canister** receives contract performance data

**Cherry Festival Example**:

1. **World Canister** triggers Cherry Festival (Season 2)
2. **World Canister** increases regional demand by +50%
3. **Farm Canister** tracks all harvests during festival season
4. **Ranking Canister** calculates Festival Scores (quality, volume, market impact)
5. **Ranking Canister** awards Festival Champion and category winners
6. **Market Canister** creates special Festival Supplier contracts
7. **Club Canister** receives fan base boost for festival winners
8. **World Canister** resets demand to normal (Season 3)

## Web3 Features & Asset Ownership

**True Asset Ownership**:
- All parcels, infrastructure, and inventory stored on-chain
- Players own their farms as NFT-like assets (transferable)
- Football clubs and players are on-chain assets
- Achievements and badges are permanent on-chain records

**Decentralized Gameplay**:
- No central server (fully on Internet Computer)
- Game state persists indefinitely (blockchain immutability)
- Player actions are cryptographically signed transactions
- Transparent leaderboards and rankings (verifiable on-chain)

**Optional Premium Features**:
- Cosmetic upgrades (farm themes, club jerseys) as NFTs
- Special parcels with unique attributes (limited editions)
- Exclusive contracts for premium members
- Early access to new regions and features

**ICP-Specific Advantages**:
- **Low Cost**: Reverse gas model (developers pay, not players)
- **Fast Finality**: 1-2 second transaction confirmation
- **Scalability**: Canisters auto-scale with demand
- **Web-Native**: No wallet extensions required (Internet Identity)
- **Storage**: Cheap on-chain storage for game state

**Security & Fairness**:
- All game logic executed on-chain (no client-side cheating)
- Random events use ICP's randomness beacon (verifiable randomness)
- AI competitor behavior deterministic and auditable
- Market prices calculated transparently on-chain

**Future Web3 Roadmap**:
- Player-to-player parcel trading (marketplace)
- DAO governance for game balance changes
- Seasonal NFT rewards for top performers
- Cross-game asset integration (ICP ecosystem)
- Tokenized farm shares (fractional ownership)`,
    isPlanDependent: false,
  },
  {
    id: 'progression-systems',
    title: 'Progression & Unlock Systems',
    content: `${PLAN_INPUT_NEEDED}

**Player Level System**:
- Experience points (XP) earned from farming activities, matches, and achievements
- Level 1-100 progression curve
- Each level unlocks new features, regions, or bonuses

**Unlock Milestones**:
- Level 5: Retail sales unlocked
- Level 10: Adjacent commune expansion
- Level 15: Organic farming certification available
- Level 25: County expansion
- Level 50: Voivodeship expansion

**Achievement System**:
- 100+ achievements across farming, football, and competition categories
- Achievements grant rewards: PLN, badges, titles, unlocks
- Examples: "First Harvest", "Organic Pioneer", "Festival Champion", "League Winner"

**Seasonal Progression**:
- 4 seasons per year (Spring, Summer, Autumn, Winter)
- Each season lasts 7 real-time days
- Seasonal objectives and rewards
- Annual championships and rankings`,
    isPlanDependent: true,
  },
  {
    id: 'monetization',
    title: 'Monetization Strategy',
    content: `${PLAN_INPUT_NEEDED}

**Free-to-Play Core**:
- All core gameplay features available for free
- No pay-to-win mechanics
- Competitive balance maintained

**Optional Premium Features**:
- Cosmetic upgrades (farm themes, club jerseys)
- Quality-of-life improvements (auto-harvest, bulk actions)
- Exclusive parcels with unique attributes
- Early access to new regions

**Web3 Integration**:
- Optional NFT ownership of in-game assets
- Player-to-player trading (future feature)
- Seasonal NFT rewards for top performers

**Revenue Model**:
- Premium subscriptions (monthly/annual)
- Cosmetic item sales
- Limited edition NFT drops
- Sponsorship and partnerships`,
    isPlanDependent: true,
  },
  {
    id: 'technical-stack',
    title: 'Technical Stack & Implementation',
    content: `${PLAN_INPUT_NEEDED}

**Frontend**:
- React + TypeScript
- Mobile-first responsive design
- Progressive Web App (PWA)
- Touch-optimized UI

**Backend**:
- Internet Computer (ICP) blockchain
- Motoko smart contracts (canisters)
- 5-canister architecture (World, Farm, Club, Market, Ranking)

**Authentication**:
- Internet Identity (ICP native auth)
- No passwords or email required
- Secure, privacy-preserving

**Data Storage**:
- On-chain storage for game state
- Efficient data structures for scalability
- Automatic backups via blockchain

**Performance**:
- 1-2 second transaction finality
- Real-time leaderboard updates
- Optimized for mobile networks`,
    isPlanDependent: true,
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Design Principles',
    content: `${PLAN_INPUT_NEEDED}

**Mobile-First Design**:
- Touch-optimized controls (44x44pt minimum tap targets)
- Swipe gestures for navigation
- Responsive layouts for all screen sizes
- Portrait and landscape support

**Visual Style**:
- Clean, modern interface
- Cherry-themed color palette (warm oranges, reds)
- Polish cultural elements (flags, terminology)
- Accessible color contrast (WCAG AA+)

**Navigation**:
- Bottom tab bar (Farm, Club, Market, Rankings)
- Contextual menus and actions
- Breadcrumb navigation for deep features
- Quick access to key metrics

**Information Architecture**:
- Dashboard overview (farm + club at a glance)
- Detailed views for each system
- Tooltips and contextual help
- Tutorial system for new players

**Feedback & Responsiveness**:
- Immediate visual feedback for actions
- Loading states for async operations
- Success/error notifications
- Progress indicators for long-term goals`,
    isPlanDependent: true,
  },
  {
    id: 'live-ops',
    title: 'Live Operations & Content Updates',
    content: `${PLAN_INPUT_NEEDED}

**Seasonal Events**:
- Cherry Festival (annual, Season 2)
- Market Domination (Season 4)
- Innovation Award (Season 6)
- Special holiday events

**Content Cadence**:
- Weekly: New wholesale contract auctions
- Monthly: Balance updates and bug fixes
- Quarterly: New regions and features
- Annually: Major content expansions

**Community Engagement**:
- Leaderboard competitions
- Player spotlights and interviews
- Social media integration
- In-game news and announcements

**Balancing & Updates**:
- Data-driven balance adjustments
- Player feedback integration
- A/B testing for new features
- Transparent patch notes`,
    isPlanDependent: true,
  },
  {
    id: 'launch-roadmap',
    title: 'Launch Roadmap & Milestones',
    content: `${PLAN_INPUT_NEEDED}

**Phase 1: Core Development (Months 1-3)**
- Implement 5-canister architecture
- Build farming systems (parcels, yield, sales)
- Develop football club management
- Create basic UI/UX

**Phase 2: Competition & Markets (Months 4-6)**
- AI competitor system
- Wholesale contract auctions
- Ranking and leaderboards
- Cherry Festival event

**Phase 3: Polish & Testing (Months 7-9)**
- Closed beta testing
- Balance adjustments
- Performance optimization
- Bug fixes and polish

**Phase 4: Launch (Month 10)**
- Public launch on Internet Computer
- Marketing campaign
- Community building
- Live ops support

**Post-Launch**:
- Monthly content updates
- New regions and features
- Web3 marketplace
- DAO governance (future)`,
    isPlanDependent: true,
  },
  {
    id: 'success-metrics',
    title: 'Success Metrics & KPIs',
    content: `${PLAN_INPUT_NEEDED}

**Player Engagement**:
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Average session length (target: 15-30 minutes)
- Retention rates (D1, D7, D30)

**Monetization**:
- Average Revenue Per User (ARPU)
- Conversion rate (free to premium)
- Lifetime Value (LTV)
- Premium feature adoption

**Gameplay Metrics**:
- Average player level
- Farm value distribution
- Club league tier distribution
- Organic farming adoption rate

**Competition Metrics**:
- Leaderboard participation rate
- Contract auction participation
- Cherry Festival engagement
- Rival defeat rate

**Technical Metrics**:
- Transaction success rate (target: >99%)
- Average response time (target: <2 seconds)
- Canister cycle consumption
- Storage efficiency`,
    isPlanDependent: true,
  },
];
