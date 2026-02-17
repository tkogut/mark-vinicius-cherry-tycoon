# FRONTEND AGENT: Mark Vinicius Cherry Tycoon [FRONTEND]

> **Current Directive**: **Phase 5 — Living World: Animations, UI Themes, Competitors, i18n**
> **Constraint**: **WSL Terminal Required** - For `dfx generate` and environment management.
> **Animation Directive**: Modern mobile animations — SVG morphing, Lottie, particles. No static jumps.
> **Last Updated**: 2026-02-17

## Backlog

### 🔴 Phase 0: Cleanup (Pre-requisite)
- [x] **Legacy Purge**: Remove ALL legacy references from frontend code and comments ✅ *DONE 2026-02-17*
- [ ] **Branding**: Ensure "Produced by JaPiTo Group" in all system messages

### 🟠 Phase 5.1: Weather + Season Sub-Phases UI
- [ ] **Phase Indicator**: Progress bar in header (Preparation → Growth → Harvest → Sales → OffSeason)
- [ ] **Contextual Actions**: Buttons change per phase (disable/hide irrelevant actions per sub-phase)
- [ ] **[NEW] WeatherEventModal.tsx**: Popup for weather events
  - Event name, icon, yield impact %, mitigation status
  - Animated entrance (slide-in / fade with shake for storms)
- [ ] **Weather-Based UI Themes** (GDD §8.1):
  - Spring: Light Green/Emerald
  - Summer: Golden/Rose
  - Autumn: Amber/Orange
  - Winter: Soft Blue/Indigo
  - CSS custom properties for theme switching

### 🟡 Phase 5.2: AI Competitors + Market Feedback
- [ ] **[NEW] CompetitorsPanel.tsx**: "Neighbors" tab
  - AI name, region, archetype icon, production volume, market share %
  - Visual comparison bars (player vs. each AI)
- [ ] **Market Saturation Visuals** in `SellModal.tsx`:
  - "Saturation Warning" if volume exceeds regional demand
  - "Volume Penalty" impact on final price before confirmation
  - AI competitor influence on current prices

### 🔵 Phase 5.3: Living World Animations (GDD §8.1)
- [ ] **Tree Growth Morphing**: SVG path morphing or Lottie
  - Sapling → Young → Mature → Peak → Old (smooth transitions)
- [ ] **Particle Bursts**: Cherry icons "flying" into inventory counter on harvest
  - CSS particle system or Lottie animation
- [ ] **Juice Meter**: Hydration indicator with bubbling liquid effect (SVG animated fill)
- [ ] **Tactile Feedback**: Micro-animations on all buttons (press → bounce → confirm)
- [ ] **Yield Comparison View**: Visual indicator of proximity to "Peak Production" (Age 7–25)

### 🟢 Phase 5.4: Rankings + Reports
- [ ] **[NEW] RankingsPanel.tsx**: Leaderboard from navigation
  - Player rank highlighted among AI competitors
  - Sortable: Profit, Farm Value, Efficiency, Organic %
- [ ] **Enhanced FinancialReportModal**: End-of-season with KPIs, rank delta, AI comparison, "focus next"
- [ ] **[NEW] Historical Price Chart**: Last 4 seasons wholesale vs retail (Chart.js or Recharts)

### 🔵 Phase 5.5: i18n Framework (GDD §7)
- [ ] **Install**: `react-i18next` + `i18next`
- [ ] **Locale Files**: JSON key-value per language
  - `locales/en.json`, `locales/pl.json` — complete translations
  - `locales/de.json`, `locales/es.json` — EU stubs
  - `locales/vi.json`, `locales/th.json`, `locales/id.json`, `locales/kr.json`, `locales/ja.json`, `locales/zh.json` — Asian stubs
- [ ] **Browser Detection**: Auto-detect language + flag switcher in settings

---

### ✅ Completed Tasks (Archive)

<details>
<summary>Completed</summary>

- [x] Core Dashboard: Responsive grid layout
- [x] Simulation Depth: ParcelDetailsPanel (pH, Soil, Humidity)
- [x] Infrastructure Shop: Marketplace with Buildings + Machinery
- [x] Risk Management: Survival budget and bankruptcy alerts
- [x] PWA Foundation: Manifest, Service Worker, install prompt
- [x] Yield Modifier Tooltips in ParcelCard
</details>

## Agent Instructions
1. Read `directives/00_master_plan.md` to see the global roadmap.
2. Complete Phase 0 cleanup first.
3. **WSL Workflow**: Formulate `dfx` commands → User runs → Read `.tmp/frontend.log`.
4. **Animation Standard**: Use SVG morphing, Lottie, CSS particles — no static jumps.
5. **Assets**: Use Google/Antigravity ecosystem (Nano Banana) for professional visuals.
6. Update this file upon completion.
