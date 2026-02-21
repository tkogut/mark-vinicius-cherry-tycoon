# FRONTEND AGENT: Mark Vinicius Cherry Tycoon [FRONTEND]

> **Current Directive**: **Phase 5 — Living World: Animations, UI Themes, Competitors, i18n**
> **Constraint**: **WSL Terminal Required** - For `dfx generate` and environment management.
> **Animation Directive**: Modern mobile animations — SVG morphing, Lottie, particles. No static jumps.
> **Last Updated**: 2026-02-17

## Backlog

### 🔴 Phase 0: Cleanup (Pre-requisite)
- [x] **Legacy Purge**: Remove ALL legacy references from frontend code and comments ✅ *DONE 2026-02-17*
- [ ] **Branding**: Ensure "Produced by JaPiTo Group" in all system messages

### 🟠 Phase 5.1: Weather + Season Sub-Phases UI (Backend Ready ✅)
- [x] **Phase Indicator**: Progress bar in header (Preparation → Growth → Harvest → Sales → OffSeason) ✅ *DONE*
- [x] **Contextual Actions**: Buttons change per phase (disable/hide irrelevant actions per sub-phase) ✅ *DONE*
- [x] **[NEW] WeatherEventModal.tsx**: Popup for weather events ✅ *DONE*
  - Event name, icon, yield impact %, mitigation status
  - Animated entrance (slide-in / fade with shake for storms)
- [x] **Weather-Based UI Themes** (GDD §8.1): ✅ *DONE*
  - Spring: Light Green/Emerald
  - Summer: Golden/Rose
  - Autumn: Amber/Orange
  - Winter: Soft Blue/Indigo
  - CSS custom properties for theme switching

### 🟡 Phase 5.2: AI Competitors + Market Feedback (Backend Ready ✅)
- [x] **[NEW] CompetitorsPanel.tsx**: "Neighbors" tab ✅ *DONE*
  - AI name, region, archetype icon, production volume, market share %
  - Visual comparison bars (player vs. each AI)
   - "Saturation Warning" if volume exceeds regional demand ✅ *DONE*
   - "Volume Penalty" impact on final price before confirmation ✅ *DONE*
   - AI competitor influence on current prices ✅ *DONE*

### 🔵 Phase 5.3: Living World Animations (GDD §8.1)
- [x] **Tree Growth Morphing**: SVG path morphing or Lottie ✅ *DONE*
  - Sapling → Young → Mature → Peak → Old (smooth transitions)
- [x] **Particle Bursts**: Cherry icons "flying" into inventory counter on harvest ✅ *DONE*
  - CSS particle system or Lottie animation
- [x] **Juice Meter**: Hydration indicator with bubbling liquid effect (SVG animated fill) ✅ *DONE*
- [x] **Tactile Feedback**: Micro-animations on all buttons (press → bounce → confirm) ✅ *DONE*
- [x] **Yield Comparison View**: Visual indicator of proximity to "Peak Production" (Age 7–25) ✅ *DONE*

### 🟢 Phase 5.4: Rankings + Reports (Backend Ready ✅)
- [x] **[NEW] RankingsPanel.tsx**: Leaderboard from navigation ✅ *DONE*
  - Player rank highlighted among AI competitors
  - Sortable: Profit, Farm Value, Efficiency, Organic %
- [x] **Enhanced FinancialReportModal**: End-of-season with KPIs, rank delta, AI comparison, "focus next" ✅ *DONE*
- [x] **[NEW] Historical Price Chart**: Last 4 seasons wholesale vs retail (Chart.js or Recharts) ✅ *DONE*

### 🟢 Phase 5.5: i18n Framework (GDD §7)
- [x] **Install**: `react-i18next` + `i18next` ✅ *DONE*
- [x] **Locale Files**: JSON key-value per language ✅ *DONE*
  - `locales/en.json`, `locales/pl.json` — complete translations
  - `locales/de.json`, `locales/es.json` — EU stubs
  - `locales/vi.json`, `locales/th.json`, `locales/id.json`, `locales/kr.json`, `locales/ja.json`, `locales/zh.json` — Asian stubs
- [x] **Browser Detection**: Auto-detect language + flag switcher in settings ✅ *DONE*

### 🟣 Phase 6 Prep: Feedback Resolution (Auth & SEO)
- [ ] **Identity Persistence**: Ensure `AuthClient` uses `localStorage` for anonymous sessions, or configure `maxTimeToLive` to prevent frequent state resets to Season 1.
- [ ] **SEO & Discoverability**: Add `robots.txt`, `sitemap.xml`, and appropriate `<title>`/`<meta>` description tags to `index.html` to allow Google indexing of the `.icp0.io` domain.


### 🟣 Phase 6: Audio System (GDD §8.2)
- [x] **Engine**: `howler.js` integration ✅ *DONE*
- [x] **Sound Manager**: Global context for SFX/BGM ✅ *DONE*
- [x] **Assets**: UI Clicks, Harvest, Plant, Cash, Level Up ✅ *DONE*
- [x] **Controls**: Mute toggle in UI ✅ *DONE*

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
