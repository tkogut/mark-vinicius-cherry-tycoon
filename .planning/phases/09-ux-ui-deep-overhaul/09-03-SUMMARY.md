---
phase: 09-ux-ui-deep-overhaul
plan: 03
requirements: [UX-04]
status: built; live check on Playground done except the guest case in the mobile drawer
date: 2026-11-21
---

# 09-03 Summary: guest state in the sidebar's running-costs box (UX-04)

## What changed

- `frontend/src/components/farm/RunningCosts.tsx`: four branches in this order, guest, loading, error, data.
  - Guest: `!backendActor || !isAuthenticated`, the same condition as `useStability`'s `enabled`
    (`useFarm.ts:584`). Returns before any read of the query. Copy: "Sign in to see your farm's running
    costs." in the dashed-border container `SportsCenter.tsx` uses.
  - Loading: the existing skeleton. Error: dashed destructive container, "Could not load your running costs.
    They refresh every 30 seconds, so try again shortly." Data: the previous markup, untouched.
  - Neither guest nor error renders the "Full Analysis" button.
- `frontend/src/__tests__/runningCosts.test.tsx` (new, 7 tests): guest, loading, error, data, the disabled-query
  regression, stale cache after logout, risk banner. `useAuth` and `useFarm` are mocked.
- Both render sites (`Sidebar.tsx:199` desktop, `:316` mobile drawer) use this one component, so one change
  covers both.

## Evidence

- Against the old component: 4 of 7 fail (guest, error, disabled-query regression, stale cache); loading, data
  and risk banner already passed, as they should.
- Guard inverted (`if (backendActor && isAuthenticated)`): **all 7 fail**. Restored: 7 pass.
- `./validate.sh full`: unit tests, lint, typecheck, build, 61 e2e specs, declarations clean, all green.
- `grep -n stability RunningCosts.tsx`: the first read of `stability` is after the guest, loading and error
  branches.

## Live check on Playground, build `0.9.0 · e48e2e7` (2026-11-21)

Branch deployed by hand with `workflow_dispatch` to a temporary Playground canister. Seen in a real browser:

- **Desktop, guest** (checked by me in Chromium): the box shows the sign-in copy, no number, no "Full Analysis".
- **Desktop, signed in with no initialised farm** (me): the box showed the error copy. The cause was not
  investigated (no network or console inspection); the old component would have shown `0 PLN` here.
- **Logout** (me): the box returned to the sign-in copy at once, no figure left over (plan step 5).
- **Mobile drawer, signed in with a farm** (the owner's screenshot): "EST. SURVIVAL BUDGET 29 900 PLN",
  "Includes seasonal ops & harvest labor", "Full Analysis" button. This is the data branch in the drawer.

## Not verified

- **Mobile drawer as a guest** was not seen (my window would not narrow below ~1500 px; the owner's session was
  signed in). The drawer renders the same component (`Sidebar.tsx:316`), so it is expected to match.
- Whether `29 900` is the right number: it was read from the screenshot, not compared with `checkStability`.
- The tests mock `useAuth` and `useStability`; the real `enabled` / `isLoading` behaviour of a disabled
  query in `@tanstack/react-query@5.90.20` is taken from `09-RESEARCH.md` Pitfall 1 (derived from library source),
  not reproduced in an integration test.
- Lint warnings stayed at or under the ceiling (the gate passed); the exact count was not compared.
- The error copy promises a 30-second refresh, which matches `refetchInterval` in `useStability`; a failed
  query with the app's retry settings was not exercised.
