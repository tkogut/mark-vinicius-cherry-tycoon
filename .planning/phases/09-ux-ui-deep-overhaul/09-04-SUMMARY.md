---
phase: 09-ux-ui-deep-overhaul
plan: 04
requirements: [UX-03]
status: built, awaiting Playground check and the owner's merge
date: 2026-11-21
---

# 09-04 Summary: Action Dock, Bar Meter / Metric Badge (UX-03, dock half)

## What changed
- `MainDashboard.tsx` renamed to `ActionDock.tsx` with `git mv` in a commit of its own (recorded as a rename), then rewritten. Prop-driven (`cash`, `phase`, `cherries`, `organicCherries`, `warehouseLevel`, required `onOpenAuction`); it no longer calls `useGuestFarm()`.
- New `components/ui/BarMeter.tsx` (on the existing `Progress`, `h-2`, `bg-charcoal-light`, tone tokens only) and `components/ui/MetricBadge.tsx` (on `Badge`, new `brass` variant).
- `lib/barMeterTone.ts` (new): `barMeterTone()`, `BarMeterTone`, `BarMeterScale`.
- `phaseConstants.ts`: `PHASE_ORDER`, `phaseCycleProgress()`. `gameLogic.ts`: `maxStorageCapacity()`; `App.tsx` uses it for the silo, so dock and silo share one definition.
- Dock: Treasury = Metric Badge; phase = neutral (brass) Bar Meter; Reserves = storage-scale Bar Meter on real capacity; Organic = kg Metric Badge. Steam-pressure dial deleted (no such metric exists). "View Market Auction" calls `setActiveTab('pool')`. Solid panels, no `backdrop-blur` / `bg-white/..` / `bg-black/..`.
- `uiConventions.test.ts`: new UX-03 block. `actionDock.test.tsx` (new, 22 tests).

## Deviations from the plan
- `barMeterTone()` lives in `lib/barMeterTone.ts`, not in `BarMeter.tsx`: exporting it from the component file added a `react-refresh/only-export-components` warning (181 > ceiling 180). Ceiling unchanged.
- The tube-gauge ratchet uses `it.fails` rather than skip: it exercises the detection today (finds BidModal) and turns red the moment 09-07 removes the last gauge, so the flip cannot be forgotten.
- The plan cites `backend/main.mo:1736-1747` for the phase chain; it is now ~1769-1780. The test reads the switch off disk instead of trusting line numbers.

## Decisions
- `+15`/`+5` padding and the `/50000`, `/20000` denominators removed. Worked example, 5 000 kg at warehouse level 0: old dock 5000/50000*100+15 = **25 %**, new **50 %** (5000/10000); empty store: old **15 %**, new **0 %**. Display fix only; no payout, yield, price or cost touched.
- No real Treasury delta source exists in what the dock receives (no prior-period cash), so no delta is rendered. With no farm Treasury shows an em dash, not 0.

## App-wide circular-gauge inventory
| file:line | what | verdict |
|---|---|---|
| `ImperialDial.tsx:161,163` | dashed-stroke tick rings inside the dial itself | the component, kept |
| `BidModal.tsx:94` | `<ImperialDial onChange=...>` | legitimate input |
| `BidModal.tsx:81,114,128` | three `EmeraldGauge` | deferred to 09-07 |
| `PriceChart.tsx:68` | recharts grid `strokeDasharray` | not a gauge |
| `MainDashboard.tsx` (dial + 2 tube gauges) | passive stats | removed here |
`conic-gradient`: none. Nothing unplanned found.

## Evidence (guards proved by breaking, then restored)
- Passive `<ImperialDial>` in a scratch file: both dial ratchets fail, naming `components/ScratchPassive.tsx:2`.
- Padding `+15` and `/50000` restored: 4 dock tests fail ("expected 0, received 15").
- Two phases swapped in `PHASE_ORDER`: the disk-read parity test and the phase-meter test fail.
- CTA back to `console.log`: the click test and the no-console test fail.
- `onOpenAuction` removed in `App.tsx`: `tsc` TS2741 (required prop).
- `./validate.sh full` green: unit, lint 180 warnings / 0 errors, typecheck, build, 61 e2e, declarations. (One earlier run was killed, exit 137, and rerun clean.)

## Browser check (2026-11-22, local build of the branch in Chromium, guest mode)
- Playground first: the 09-04 deploy was dead by the time I opened it (lease ~20 min, 503); redeployed. Screenshots of that canister timed out three times; a deploy of `master` screenshotted fine in the same browser, so the cause was not the environment. The same branch built and served locally renders and screenshots fine, so I did not find what froze the Playground tab and cannot call it explained.
- Found by looking, fixed in the same PR: (1) Bar Meter tracks were invisible at 0% (track colour = panel colour): now `bg-charcoal-dark` with a `border-brass/30` outline; (2) at 768 px the "Diagnostics" title and the Reserves caption were clipped: dock is now `grid-cols-[1fr_auto_1fr]`, heading shown from `xl`, labels truncate, `used / capacity` caption on one line. At 768 px nothing overlaps; "Reserves" and "No active phase" truncate with an ellipsis.
- 375 px: the dock sits in the collapsed 25vh drawer and is clipped vertically, as the old dock was; the expanded drawer was not looked at. The build badge overlaps the mobile bottom nav at 375 px (pre-existing, not the dock) and sits on the dock's bottom-right border at 768 px without covering a control.
- Seen only with no farm (Treasury dash, no active phase, 0 kg). Filled meters, tones and the signed-in dock were not seen in a browser.

## Not verified
- A signed-in dock with real values and non-zero fills; the expanded mobile drawer; a Playground run of the final commit.
- No test clicks the real `App` tab switch; `App.tsx` wiring is pinned by a source-text assertion plus the typecheck.
- `Number(farm.cash)` loses precision above 2^53; the old dock did the same.
