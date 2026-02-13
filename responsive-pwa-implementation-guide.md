# Task: Implement Responsive Design + PWA Optimization for Mark Vinicius Cherry Tycoon

## Project Context
You are working on **Mark Vinicius Cherry Tycoon**, a browser-based farming and sports management simulation game deployed on the Internet Computer Protocol (ICP). The game features two core systems: agricultural management (cherry farming in Opole Province) and Polish football club investment.

**Current Issue**: The frontend has significant usability problems on mobile devices (smartphones/tablets). The application must work seamlessly across desktop browsers and mobile devices using a single, optimized codebase.

## Objective
Transform the existing frontend into a fully responsive, mobile-first Progressive Web App (PWA) that:
1. Adapts UI layouts dynamically based on screen size
2. Provides touch-optimized interactions for mobile users
3. Works as an installable app on mobile devices
4. Supports offline functionality for core game features
5. Maintains single codebase to minimize ICP storage costs

## Technical Requirements

### 1. Responsive Design Implementation

#### A. Viewport Configuration
- Add proper viewport meta tag in `index.html`:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  ```

#### B. Mobile-First CSS Architecture
- Use CSS Grid/Flexbox for layouts
- Implement breakpoints:
  - Mobile: 320px - 767px (base styles)
  - Tablet: 768px - 1023px
  - Desktop: 1024px+
- Example structure:
  ```css
  /* Mobile-first base styles */
  .game-dashboard { /* single column */ }

  @media (min-width: 768px) { /* tablet adjustments */ }
  @media (min-width: 1024px) { /* desktop layout */ }
  ```

#### C. Touch-Friendly UI Components
- Minimum touch target size: 44x44px (Apple HIG standard)
- Increase spacing between interactive elements (min 8px gap)
- Add visual feedback for touch states (`:active` pseudo-class)
- Replace hover-only interactions with click/tap alternatives

#### D. Typography Optimization
- Base font size: 16px minimum (mobile)
- Line height: 1.5-1.6 for readability
- Use relative units (rem/em) instead of fixed px
- Ensure text contrast ratio ≥ 4.5:1 (WCAG AA)

#### E. Key UI Patterns

**Farm Dashboard**: 
- Mobile: Vertical stack (plots → market → stats)
- Desktop: 3-column grid (plots | market | stats)

**Sports Management**:
- Mobile: Tabbed interface (Roster | Fixtures | Finances)
- Desktop: Sidebar navigation with persistent view

**Market Interface**:
- Mobile: Full-screen modal with swipe gestures
- Desktop: Side panel overlay

### 2. Progressive Web App (PWA) Setup

#### A. Web App Manifest (`public/manifest.json`)
Create manifest with:
- App name: "Mark Vinicius Cherry Tycoon"
- Short name: "CherryTycoon"
- Display mode: `standalone`
- Theme colors matching game branding
- Icons: 192x192, 512x512 (PNG format)
- Start URL: `/`

#### B. Service Worker Implementation
Create `service-worker.js` with:
- **Cache Strategy**: Network-first for API calls, Cache-first for static assets
- **Offline Support**: Cache essential game UI, farm state data
- **Background Sync**: Queue farming actions (planting, harvesting) when offline
- **Version Control**: Cache versioning for updates

Example caching logic:
```javascript
const CACHE_NAME = 'cherry-tycoon-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.bundle.js',
  '/assets/icons/',
  '/assets/images/'
];

// Cache static assets on install
// Network-first for ICP canister API calls
// Cache-first for images/fonts
```

#### C. Installation Prompt
- Detect iOS/Android platforms
- Show custom "Add to Home Screen" prompt after first successful game action
- Use `beforeinstallprompt` event (Chrome/Edge) and custom UI for Safari

### 3. Performance Optimization

#### A. Asset Optimization
- Convert images to WebP format with fallbacks
- Implement lazy loading for non-critical images:
  ```html
  <img src="cherry.webp" loading="lazy" alt="Cherry harvest">
  ```
- Use responsive images with `srcset`:
  ```html
  <img srcset="cherry-480.webp 480w, cherry-1200.webp 1200w" 
       sizes="(max-width: 768px) 100vw, 50vw">
  ```

#### B. Code Splitting
- Split vendor bundles from app code
- Lazy load route components (farm, sports, market modules)
- Defer non-critical JavaScript

#### C. Critical Rendering Path
- Inline critical CSS for above-the-fold content
- Preload essential fonts
- Defer third-party scripts

### 4. Mobile-Specific Features

#### A. Touch Gestures
- Swipe navigation between farm plots
- Pull-to-refresh for market prices
- Long-press context menus for player management

#### B. Orientation Handling
- Support both portrait (primary) and landscape modes
- Adjust layouts dynamically on orientation change

#### C. Mobile Navigation
- Bottom tab bar (iOS-style) for primary sections on mobile
- Hamburger menu for secondary features
- Desktop: Persistent left sidebar navigation

### 5. ICP Integration Considerations

#### A. Wallet Connection (Mobile)
- Support Plug Wallet mobile browser
- Internet Identity mobile-friendly flow
- Clear connection status indicators

#### B. Blockchain State Management
- Cache canister responses aggressively
- Implement optimistic UI updates (instant feedback, background sync)
- Handle slow network gracefully with loading states

## Implementation Checklist

### Phase 1: Foundation (Day 1)
- [ ] Add viewport meta tag
- [ ] Audit current CSS and identify mobile breaking points
- [ ] Implement mobile-first base styles
- [ ] Fix touch target sizes (all buttons ≥44px)
- [ ] Test on Chrome DevTools device emulation (iPhone SE, Pixel 7, iPad)

### Phase 2: Layout Adaptation (Day 2)
- [ ] Create responsive grid system for farm dashboard
- [ ] Implement mobile navigation (bottom tabs)
- [ ] Adapt sports management interface for small screens
- [ ] Optimize market interface for touch
- [ ] Add orientation change handlers

### Phase 3: PWA Setup (Day 3)
- [ ] Create `manifest.json` with all required fields
- [ ] Design and add app icons (192px, 512px)
- [ ] Implement service worker with caching strategies
- [ ] Add service worker registration in main app file
- [ ] Test offline functionality (disable network in DevTools)
- [ ] Implement install prompt UI

### Phase 4: Optimization (Day 4)
- [ ] Convert images to WebP with fallbacks
- [ ] Implement lazy loading for images
- [ ] Add responsive image `srcset` attributes
- [ ] Code splitting for route modules
- [ ] Performance audit (Lighthouse score >90 mobile)

### Phase 5: Testing & Refinement (Day 5)
- [ ] Test on real Android device (Chrome)
- [ ] Test on real iOS device (Safari)
- [ ] Test PWA installation flow on both platforms
- [ ] Verify offline mode works (plant/harvest actions cached)
- [ ] Test wallet connection on mobile browsers
- [ ] Deploy to ICP playground and verify production behavior

## Success Criteria
- ✅ Lighthouse mobile score: Performance >90, PWA >90
- ✅ All interactive elements ≥44px touch targets
- ✅ App installs successfully on iOS and Android
- ✅ Core game actions work offline (cached for sync)
- ✅ Page load time <3s on 3G network
- ✅ No horizontal scrolling on any screen size (320px+)
- ✅ Text readable without zoom on mobile devices

## Files to Modify/Create
1. `frontend/public/index.html` - Add viewport, manifest link
2. `frontend/public/manifest.json` - New file (PWA manifest)
3. `frontend/public/service-worker.js` - New file (offline support)
4. `frontend/src/styles/responsive.css` - New file (breakpoints)
5. `frontend/src/components/Navigation/MobileNav.jsx` - New component
6. `frontend/src/components/Navigation/DesktopNav.jsx` - New component
7. `frontend/src/hooks/useMediaQuery.js` - New hook (device detection)
8. `frontend/src/utils/pwa.js` - New file (install prompt logic)

## Additional Notes
- Prioritize farming interface (80% of user interaction)
- Sports management can be simplified on mobile (essential features only)
- Market graphs should be touch-scrollable on mobile (pan/zoom)
- Use CSS custom properties for consistent theming across breakpoints
- Test with both ICP wallet connection flows (Plug + Internet Identity)

Deploy updated frontend to ICP playground after each phase for real-device testing at: `https://<canister-id>.raw.icp0.io/`
