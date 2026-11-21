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

## Not verified
- Not seen in a browser yet: layout at 375 px and 768 px, and that the build badge (bottom-right) does not cover the right-hand zone. The plan marks this a backstop item.
- No test clicks the real `App` tab switch; `App.tsx` wiring is pinned by a source-text assertion plus the typecheck.
- `Number(farm.cash)` loses precision above 2^53; the old dock did the same.
